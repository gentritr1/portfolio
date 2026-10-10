import { useRef, type ReactNode } from "react";
import { arrive, useArrive } from "./arrive";
import { useMirror } from "./mirror";
import { ARRIVE, ARRIVE_MS, type Pose } from "./room";

/**
 * One screen standing on the room's floor. The floor stays on the ground; only the slab moves.
 * The slab's reflection on the floor (mirror.ts) moves with the slab.
 * `lift` adds the hover lift for a fine pointer.
 */
export function Slab({
  from = ARRIVE,
  ms = ARRIVE_MS,
  delay = 0,
  share,
  lift = false,
  className,
  children,
}: {
  from?: Pose;
  ms?: number;
  delay?: number;
  share?: number;
  lift?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const view = useRef<HTMLDivElement>(null);
  const slab = useRef<HTMLDivElement>(null);
  const state = useArrive(
    view,
    (mode) => {
      if (slab.current) arrive(slab.current, mode, from, ms, delay);
    },
    share,
  );
  useMirror(slab);
  const names = ["room-view", "room-floor", "lp-slab", lift ? "lp-lift" : "", className ?? ""].filter(Boolean).join(" ");
  return (
    <div ref={view} className={names} data-arrive={state}>
      <div ref={slab} className="room-slab">
        {children}
      </div>
    </div>
  );
}
