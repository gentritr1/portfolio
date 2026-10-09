import { useRef, useState, type CSSProperties } from "react";
import { arrive, useArrive } from "./arrive";
import { H, layerShots, W, WEEK, WEEK_SMALL } from "./data";
import { ARRIVE, DRIFT, MOVE, moving, OUT, pose, ROOM_QUERY, SHEEN_AFTER, sheen } from "./room";

/** Depth between two layers, in px. */
const GAP = 70;
const LEN = 2600;
const OPEN = 700;
const HOLD = 1500;

function explode(rig: HTMLElement) {
  const box = { width: rig.offsetWidth, height: rig.offsetHeight };
  const total = LEN + 160;
  const at = (ms: number) => Math.min(1, ms / total);
  const screen = rig.querySelector<HTMLElement>(".xp-screen")!;
  const shot = rig.querySelector<HTMLElement>(".xp-shot")!;
  const cam = rig.animate(
    [
      { transform: pose(ARRIVE, box), offset: 0, easing: OUT },
      {
        transform: pose({ y: 3, rx: 50, rz: -24, s: 0.72 }, box),
        offset: OPEN / LEN,
        easing: DRIFT,
      },
      {
        transform: pose({ y: 2, rx: 43, rz: -13, s: 0.74 }, box),
        offset: HOLD / LEN,
        easing: MOVE,
      },
      { transform: "none", offset: 1 },
    ],
    { duration: LEN },
  );
  moving(rig, [cam]);
  screen.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: 420,
    easing: OUT,
  });
  // The whole capture hides while its four layers stand apart, and shows again when they close.
  shot.animate(
    [
      { opacity: 0, offset: 0 },
      { opacity: 0, offset: (LEN - 60) / total },
      { opacity: 1, offset: (LEN + 100) / total },
    ],
    { duration: total },
  );
  rig.querySelectorAll<HTMLElement>(".xp-layer").forEach((part, i) => {
    const apart = `translate3d(0, 0, ${i * GAP}px)`;
    const start = 220 + i * 150;
    const run = part.animate(
      [
        {
          opacity: 0,
          transform: `translate3d(0, 0, ${i * GAP + 140}px)`,
          offset: 0,
        },
        {
          opacity: 0,
          transform: `translate3d(0, 0, ${i * GAP + 140}px)`,
          offset: at(start),
          easing: OUT,
        },
        { opacity: 1, transform: apart, offset: at(start + 520) },
        { opacity: 1, transform: apart, offset: at(HOLD), easing: MOVE },
        { opacity: 1, transform: "translate3d(0, 0, 0)", offset: at(LEN) },
        { opacity: 0, transform: "translate3d(0, 0, 0)", offset: 1 },
      ],
      { duration: total },
    );
    moving(part, [run]);
  });
  sheen(rig.querySelector<HTMLElement>(".room-sheen")!, LEN + SHEEN_AFTER);
}

/**
 * The new calendar screen comes apart into its four layers (grid, top bars, sidebar, events), the camera turns
 * around them, and they close into one flat screen. Phones and portrait tablets get the flat arrival.
 */
export function Explode() {
  const view = useRef<HTMLDivElement>(null);
  const rig = useRef<HTMLDivElement>(null);
  const [room] = useState(() => window.matchMedia(ROOM_QUERY).matches);
  const state = useArrive(
    view,
    (mode) => {
      const node = rig.current;
      if (!node) return;
      // Handoff.tsx owns this screen once it is armed: the hero screen lands here, so there is no second arrival.
      if (view.current?.dataset.owned !== undefined) return;
      if (mode === "room" && room) explode(node);
      else arrive(node, "flat");
    },
    0.4,
  );
  return (
    <div className="room-view room-floor lp-slab xp-view" ref={view} data-arrive={state}>
      <div className="room-rig xp-rig" ref={rig}>
        <div className="xp-screen">
          <img
            className="xp-shot"
            src={WEEK}
            srcSet={`${WEEK_SMALL} 1080w, ${WEEK} 2880w`}
            sizes="(min-width: 1024px) 52vw, calc(100vw - 32px)"
            width={1440}
            height={900}
            loading="lazy"
            decoding="async"
            alt="The care team calendar for one week in the new app: calls, video calls and office visits for each patient. Invented data."
          />
          <span className="room-sheen" aria-hidden="true" />
        </div>
        {room &&
          layerShots.map(({ src, box: [x, y, w, h] }) => (
            <img
              key={src}
              className="xp-layer"
              src={src}
              alt=""
              loading="lazy"
              decoding="async"
              style={
                {
                  "--x": x / W,
                  "--y": y / H,
                  "--w": w / W,
                  "--h": h / H,
                } as CSSProperties
              }
            />
          ))}
      </div>
    </div>
  );
}
