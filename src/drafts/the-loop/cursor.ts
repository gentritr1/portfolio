import { useEffect, type RefObject } from "react";
import { ROOM_QUERY } from "./room";

/** The screens whose edges catch the light. room.css draws the lit edge as each one's `::after`. */
const EDGES = ".fr-browser, .fr-phone-glass, .xp-screen, .bd-stage, .lp-own-shot, .ab-shot";

/** A mouse or trackpad, motion allowed, on a screen wide enough for the room. */
const QUERY = `(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and ${ROOM_QUERY}`;

/** The time constant of the light's ease toward the pointer, in ms: it is 95 % of the way there after about 700 ms. */
const LAG = 230;
/** How far the lamp leans toward the pointer, as a part of the pointer's distance from the middle of the screen. */
const LEAN = 0.32;

type Listener = (x: number, y: number, on: boolean) => void;
const listeners = new Set<Listener>();
/** True while a mouse pointer is over the page and the cursor light runs. */
export const pointer = { on: false };

/** Calls `listener` on each frame of the cursor light with the eased pointer position. The lamp (LampMark.tsx) turns with it. */
export function onPointer(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * The room's lamp follows a mouse pointer slowly, and the edges of the screens on screen catch its light.
 * One frame loop runs only while the light is still moving; it reads the rectangles first, then writes.
 */
export function useCursorLight(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const home = root.current;
    if (!home) return;
    const media = window.matchMedia(QUERY);
    let stop: (() => void) | undefined;

    const start = () => {
      const lamp = home.querySelector<HTMLElement>(".lp-room-light > i");
      const visible = new Set<HTMLElement>();
      const watch = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          const node = entry.target as HTMLElement;
          if (entry.isIntersecting) visible.add(node);
          else visible.delete(node);
        }
      });
      home.querySelectorAll<HTMLElement>(EDGES).forEach((node) => watch.observe(node));

      let tx = window.innerWidth / 2;
      let ty = window.innerHeight / 2;
      let x = tx;
      let y = ty;
      let raf = 0;
      let last = 0;
      let sentX = NaN;
      let sentY = NaN;
      let sentOn = false;

      const frame = (now: number) => {
        const dt = last ? Math.min(64, now - last) : 16;
        last = now;
        const a = 1 - Math.exp(-dt / LAG);
        x += (tx - x) * a;
        y += (ty - y) * a;
        const done = Math.abs(tx - x) < 1 && Math.abs(ty - y) < 1;
        if (done) {
          x = tx;
          y = ty;
        }
        const boxes = [...visible].map((node) => [node, node.getBoundingClientRect()] as const);
        // A frame that only scrolls does not turn the lamp: it keeps the light's direction until the pointer moves.
        if (x !== sentX || y !== sentY || pointer.on !== sentOn) {
          sentX = x;
          sentY = y;
          sentOn = pointer.on;
          for (const listener of listeners) listener(x, y, pointer.on);
        }
        if (lamp) lamp.style.transform = `translate3d(${((x - window.innerWidth / 2) * LEAN).toFixed(1)}px, ${((y - window.innerHeight / 2) * LEAN).toFixed(1)}px, 0)`;
        for (const [node, box] of boxes) {
          node.style.setProperty("--lx", `${(x - box.left).toFixed(1)}px`);
          node.style.setProperty("--ly", `${(y - box.top).toFixed(1)}px`);
        }
        if (done) {
          raf = 0;
          last = 0;
          if (lamp) delete lamp.dataset.moving;
        } else raf = requestAnimationFrame(frame);
      };

      const kick = () => {
        if (raf) return;
        if (lamp) lamp.dataset.moving = "";
        raf = requestAnimationFrame(frame);
      };

      const move = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        tx = event.clientX;
        ty = event.clientY;
        home.dataset.cursor = "";
        pointer.on = true;
        kick();
      };

      const leave = (event: MouseEvent) => {
        if (event.relatedTarget) return;
        delete home.dataset.cursor;
        pointer.on = false;
        tx = window.innerWidth / 2;
        ty = window.innerHeight / 2;
        kick();
      };

      const scrolled = () => {
        if (home.dataset.cursor !== undefined) kick();
      };

      window.addEventListener("pointermove", move, { passive: true });
      document.addEventListener("mouseout", leave);
      window.addEventListener("scroll", scrolled, { passive: true });

      return () => {
        cancelAnimationFrame(raf);
        watch.disconnect();
        window.removeEventListener("pointermove", move);
        document.removeEventListener("mouseout", leave);
        window.removeEventListener("scroll", scrolled);
        delete home.dataset.cursor;
        pointer.on = false;
        if (lamp) {
          lamp.style.transform = "";
          delete lamp.dataset.moving;
        }
        home.querySelectorAll<HTMLElement>(EDGES).forEach((node) => {
          node.style.removeProperty("--lx");
          node.style.removeProperty("--ly");
        });
      };
    };

    const sync = () => {
      stop?.();
      stop = media.matches ? start() : undefined;
    };
    sync();
    media.addEventListener("change", sync);
    return () => {
      media.removeEventListener("change", sync);
      stop?.();
    };
  }, [root]);
}
