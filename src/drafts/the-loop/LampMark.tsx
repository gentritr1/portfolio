import { useEffect, useLayoutEffect, useRef } from "react";
import { onPointer, pointer } from "./cursor";
import { useReducedMotion } from "./hooks";
import { createLamp, type Lamp as Handle } from "./lamp";

/** Lit from the top left: the still lamp, and the lamp before it has a chapter or a pointer to turn to. */
const REST = { x: -1, y: -1 };

/**
 * The lamp of the room as a mark. Its lit side turns toward the current chapter (`target`), or, with a mouse,
 * toward the pointer, with the same eased value that moves the room's light pool. Reduced motion: still, lit from the top left.
 */
export function Lamp({ at, target, className }: { at: string; target: (at: string) => Element | null; className: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const lamp = useRef<Handle | null>(null);
  const reduce = useReducedMotion();
  const latest = useRef({ at, target });
  useLayoutEffect(() => {
    latest.current = { at, target };
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
    lamp.current = createLamp(canvas.current);
    return () => {
      lamp.current?.destroy();
      lamp.current = null;
    };
  }, []);

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
