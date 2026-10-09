/**
 * The room: one floor, one light, one way for a screen to arrive. Every 3D section takes its moves from here.
 * The CSS half (perspective, floor, light pool, sheen, `data-moving`) is in room.css.
 */
import "./room.css";

/** Entries and the camera's landing. */
export const OUT = "cubic-bezier(0.22, 1, 0.36, 1)";
/** Exits. */
export const AWAY = "cubic-bezier(0.23, 1, 0.32, 1)";
/** Moves from one place on the screen to another. */
export const MOVE = "cubic-bezier(0.77, 0, 0.175, 1)";
/** Slow drifts and the band of light. */
export const DRIFT = "cubic-bezier(0.45, 0, 0.55, 1)";

export interface Pose {
  /** % of the slab's width. */
  x?: number;
  /** % of the slab's height. */
  y?: number;
  z?: number;
  rx?: number;
  ry?: number;
  rz?: number;
  s?: number;
}

/** A pose as a transform. Percent moves become whole CSS pixels of `box`, so no move ends on a fraction of a pixel. */
export function pose({ x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s = 1 }: Pose, box: { width: number; height: number }) {
  const px = Math.round((x / 100) * box.width);
  const py = Math.round((y / 100) * box.height);
  return `translate3d(${px}px, ${py}px, ${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${s})`;
}

/** Where a slab is when it starts to arrive. It lands at `transform: none`. */
export const ARRIVE: Pose = { y: 4, z: -360, rx: 10 };
export const ARRIVE_MS = 900;

/** Where a slab goes when it leaves, with opacity 0. */
export const EXIT: Pose = { y: -2, z: -120 };
export const EXIT_MS = 220;

/** Where a card in front of the slab starts: from the side it stands on, 180 px nearer the camera. */
export const cardFrom = (side: 1 | -1) => `translate3d(${80 * side}px, 12px, 180px) rotateY(${-16 * side}deg)`;
export const CARD_MS = 1000;

/** The time from a slab's landing to the start of its band of light. */
export const SHEEN_AFTER = 200;
export const SHEEN_MS = 1100;

/** One band of light crosses the slab from left to right. `node` is a `.room-sheen` inside the slab's clip. */
export function sheen(node: HTMLElement, delay: number) {
  return node.animate(
    [
      { opacity: 0, transform: "translateX(-100%)" },
      { opacity: 1, offset: 0.35 },
      { opacity: 0, transform: "translateX(230%)" },
    ],
    { duration: SHEEN_MS, delay, easing: DRIFT, fill: "backwards" },
  );
}

const token = new WeakMap<HTMLElement, object>();

/**
 * Marks `node` with `data-moving` until every animation in `runs` ends or is cancelled.
 * room.css gives `will-change: transform` only to marked nodes, so a slab is drawn again at its rest size when it stops.
 */
export function moving(node: HTMLElement, runs: Animation[]) {
  const mine = {};
  token.set(node, mine);
  node.dataset.moving = "";
  const stop = () => {
    if (token.get(node) === mine) delete node.dataset.moving;
  };
  Promise.allSettled(runs.map((run) => run.finished)).then(stop);
  return runs;
}

/** Decodes each image before its slab comes on screen, so the first frame of a move does not wait for a decode. */
export function decode(sources: string[]) {
  return Promise.all(
    sources.map((src) => {
      const image = new Image();
      image.src = src;
      return image.decode().catch(() => undefined);
    }),
  );
}
