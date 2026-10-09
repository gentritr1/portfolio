import { useContext, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { Settled } from "./hooks";
import { ARRIVE, ARRIVE_MS, moving, OUT, pose, ROOM_QUERY, SHEEN_AFTER, sheen, type Pose } from "./room";

/** A case head's screen arrives from further away and lower, because it is the first thing on its page. */
export const HEAD: Pose = { y: 6, z: -420, rx: 12 };
export const HEAD_MS = 1100;

/** "room": the 3D arrival on a wide landscape screen. "flat": the curtain on phones and portrait tablets. */
export type Mode = "room" | "flat";
type State = "wait" | "in" | "rest";

const REDUCE = "(prefers-reduced-motion: reduce)";

/** Makes every image under `node` load and decode now, so the first frame of the arrival does not wait for it. */
function decodeAll(node: HTMLElement) {
  node.querySelectorAll("img").forEach((img) => {
    img.loading = "eager";
    img.decode().catch(() => undefined);
  });
}

/**
 * Runs `run` once, when `ref` is `share` on screen. Images decode 600 px before that.
 * A settled page or reduced motion gives "rest": nothing runs and everything shows.
 */
export function useArrive(ref: RefObject<HTMLElement | null>, run: (mode: Mode) => void, share = 0.3) {
  const settled = useContext(Settled);
  const [state, setState] = useState<State>(() => (settled || window.matchMedia(REDUCE).matches ? "rest" : "wait"));
  const latest = useRef(run);
  useLayoutEffect(() => {
    latest.current = run;
  });
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || state !== "wait") return;
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        near.disconnect();
        decodeAll(node);
      },
      { rootMargin: "600px 0px" },
    );
    const seen = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        seen.disconnect();
        setState("in");
        latest.current(window.matchMedia(ROOM_QUERY).matches ? "room" : "flat");
      },
      { threshold: share },
    );
    near.observe(node);
    seen.observe(node);
    return () => {
      near.disconnect();
      seen.disconnect();
    };
  }, [ref, share, state]);
  return state;
}

/** The shared arrival of one slab: from `from` to `transform: none` in the room, or the curtain on a phone. */
export function arrive(node: HTMLElement, mode: Mode, from: Pose = ARRIVE, ms = ARRIVE_MS, delay = 0) {
  if (mode === "room") {
    const box = { width: node.offsetWidth, height: node.offsetHeight };
    const run = node.animate(
      [
        { transform: pose(from, box), opacity: 0 },
        { opacity: 1, offset: 0.4 },
        { transform: "none", opacity: 1 },
      ],
      { duration: ms, delay, easing: OUT, fill: "backwards" },
    );
    moving(node, [run]);
    const band = node.querySelector<HTMLElement>(".room-sheen");
    if (band) sheen(band, delay + Math.round(ms * 0.68) + SHEEN_AFTER);
    return [run];
  }
  return [
    node.animate(
      [
        {
          opacity: 0,
          transform: "translateY(24px)",
          clipPath: "inset(-40px -40px 100% -40px)",
        },
        {
          opacity: 1,
          transform: "none",
          clipPath: "inset(-40px -40px -60px -40px)",
        },
      ],
      { duration: 800, delay, easing: OUT, fill: "backwards" },
    ),
  ];
}
