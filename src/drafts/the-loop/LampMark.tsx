import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { onPointer, pointer } from "./cursor";
import { useReducedMotion } from "./hooks";
import { createLamp, type Lamp as Handle } from "./lamp";
import { OUT } from "./room";

/** "off": the room is dark and the lamp's dots are dim. "rise": the lamp glows and its light spreads. "on": the light is up. */
export type Lights = "off" | "rise" | "on";

const SEEN_KEY = "lp-lights";
/** The room's light starts to spread this long after the lamp starts to glow, and spreads for `SPREAD_MS`. */
const SPREAD_AT = 60;
const SPREAD_MS = 560;

/**
 * The lights are a small store, not state of the home: a change re-renders only the top lamp and the hero build,
 * and the home root gets its `data-lights` attribute directly.
 */
let lights: Lights = "on";
const listeners = new Set<() => void>();
function setLights(next: Lights) {
  lights = next;
  for (const listener of listeners) listener();
}
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** The state of the room's light. Outside the home it is always "on". */
export const useLights = () => useSyncExternalStore(subscribe, () => lights);

function firstLight(seen: boolean) {
  if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (window.scrollY > 0 || window.location.hash) return false;
  try {
    return window.sessionStorage.getItem(SEEN_KEY) === null;
  } catch {
    return false;
  }
}

/**
 * Lights on: on the first visit of a session the home opens dark, the top lamp's dots glow (`GLOW_MS`), and the room's
 * light pool grows out of the lamp. Then the state is "on" and the hero build can start. A return to the home, a reload
 * in the same session, a page opened lower down, and reduced motion start with the light on.
 * Call it in the home before its children render: it sets the first state during that render.
 */
export function useLightsOn(root: RefObject<HTMLElement | null>, seen: boolean) {
  const [first] = useState<Lights>(() => {
    lights = firstLight(seen) ? "off" : "on";
    return lights;
  });

  useLayoutEffect(() => {
    const home = root.current;
    if (!home) return;
    const mark = () => {
      home.dataset.lights = lights;
    };
    mark();
    listeners.add(mark);
    return () => {
      listeners.delete(mark);
    };
  }, [root]);

  useEffect(() => {
    const light = root.current?.querySelector<HTMLElement>(".lp-room-light");
    const pool = light?.querySelector<HTMLElement>(":scope > i");
    const lamp = root.current?.querySelector<HTMLElement>(".lp-lamp-top");
    if (first !== "off" || !light || !pool || !lamp) {
      setLights("on");
      return;
    }
    try {
      window.sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      // Without storage the next reload opens dark again.
    }
    setLights("off");
    let runs: Animation[] = [];
    let up = 0;
    let frame = 0;
    // The light waits for the page's load event, so its first frames do not meet the last work of the load.
    const rise = () => {
      frame = requestAnimationFrame(spread);
    };
    const spread = () => {
      const box = pool.getBoundingClientRect();
      const from = lamp.getBoundingClientRect();
      setLights("rise");
      // The pool grows out of the lamp. Its scale is added to the lean that cursor.ts may give it, so the two never fight.
      pool.style.transformOrigin = `${Math.round(from.left + from.width / 2 - box.left)}px ${Math.round(from.top + from.height / 2 - box.top)}px`;
      const timing = { duration: SPREAD_MS, delay: SPREAD_AT, easing: OUT, fill: "backwards" } as const;
      runs = [
        pool.animate([{ transform: "scale(0.05)" }, { transform: "scale(1)" }], { ...timing, composite: "add" }),
        light.animate([{ opacity: 0 }, { opacity: 1, offset: 0.3 }, { opacity: 1 }], timing),
      ];
      up = window.setTimeout(() => setLights("on"), SPREAD_AT + SPREAD_MS);
      runs[0].finished.then(
        () => {
          pool.style.transformOrigin = "";
        },
        () => undefined,
      );
    };
    if (document.readyState === "complete") rise();
    else window.addEventListener("load", rise, { once: true });
    return () => {
      window.removeEventListener("load", rise);
      cancelAnimationFrame(frame);
      window.clearTimeout(up);
      for (const run of runs) run.cancel();
      pool.style.transformOrigin = "";
      setLights("on");
    };
  }, [first, root]);
}

/** Lit from the top left: the still lamp, and the lamp before it has a chapter or a pointer to turn to. */
const REST = { x: -1, y: -1 };

/**
 * The lamp of the room as a mark. Its lit side turns toward the current chapter (`target`), or, with a mouse,
 * toward the pointer, with the same eased value that moves the room's light pool. Reduced motion: still, lit from the top left.
 */
export function Lamp({
  at,
  target,
  className,
  lit = true,
}: {
  at: string;
  target: (at: string) => Element | null;
  className: string;
  /** False while the room is dark (`useLightsOn`): the dots are dim, and they glow when it turns true. */
  lit?: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const lamp = useRef<Handle | null>(null);
  const reduce = useReducedMotion();
  const latest = useRef({ at, target, lit });
  useLayoutEffect(() => {
    latest.current = { at, target, lit };
  });

  const toChapter = (instant = false) => {
    const node = canvas.current;
    const handle = lamp.current;
    if (!node || !handle) return;
    const goal = latest.current.target(latest.current.at);
    if (!goal) return handle.aim(REST.x, REST.y, instant);
    const box = node.getBoundingClientRect();
    const to = goal.getBoundingClientRect();
    // The start of the name or title, so near and far chapters give clearly different directions.
    handle.aim(to.left + Math.min(24, to.width / 2) - (box.left + box.width / 2), to.top + to.height / 2 - (box.top + box.height / 2), instant);
  };

  useEffect(() => {
    if (!canvas.current) return;
    lamp.current = createLamp(canvas.current, !latest.current.lit);
    return () => {
      lamp.current?.destroy();
      lamp.current = null;
    };
  }, []);

  useEffect(() => {
    if (lit) lamp.current?.glow();
  }, [lit]);

  useEffect(() => {
    if (reduce) lamp.current?.aim(REST.x, REST.y, true);
    else if (!pointer.on) toChapter();
  }, [at, reduce]);

  useEffect(() => {
    if (reduce) return;
    return onPointer((x, y, on) => {
      const node = canvas.current;
      if (!node || !lamp.current) return;
      if (!on) return toChapter();
      const box = node.getBoundingClientRect();
      lamp.current.aim(x - (box.left + box.width / 2), y - (box.top + box.height / 2), true);
    });
  }, [reduce]);

  return <canvas ref={canvas} className={`lp-lamp ${className}`} aria-hidden="true" />;
}
