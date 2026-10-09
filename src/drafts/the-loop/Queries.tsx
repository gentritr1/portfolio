import { useRef, type CSSProperties } from "react";
import { useArrive, type Mode } from "./arrive";
import { sheets } from "./data";
import { ARRIVE, DRIFT, MOVE, moving, OUT, pose } from "./room";

const FALL_AT = 950;
const JOIN_AT = 1550;
const LEN = 2500;

/** z only in the room; a phone gets the same moves in 2D. */
const z = (mode: Mode, px: number) => (mode === "room" ? px : 0);

function run(view: HTMLElement, rig: HTMLElement, mode: Mode) {
  const box = { width: rig.offsetWidth, height: rig.offsetHeight };
  const all = (s: string) => [...view.querySelectorAll<HTMLElement>(s)];
  if (mode === "room") {
    const cam = rig.animate(
      [
        { transform: pose(ARRIVE, box), offset: 0, easing: OUT },
        {
          transform: pose({ z: -60, rx: 22 }, box),
          offset: 0.36,
          easing: DRIFT,
        },
        { transform: pose({ z: -40, rx: 18 }, box), offset: 0.7, easing: MOVE },
        { transform: "none", offset: 1 },
      ],
      { duration: LEN },
    );
    moving(rig, [cam]);
  }
  const first = view.querySelector<HTMLElement>(".qv-join")!;
  const floor = first.offsetTop + first.offsetHeight / 2;
  all(".qv-col").forEach((col, i) => {
    const drop = Math.round(floor - col.offsetTop - col.offsetHeight);
    const start = FALL_AT + i * 90;
    const fall = col.animate(
      [
        {
          opacity: 0,
          transform: `translate3d(0, -16px, ${z(mode, 60)}px)`,
          offset: 0,
          easing: OUT,
        },
        { opacity: 1, transform: "none", offset: (260 + i * 70) / LEN },
        { opacity: 1, transform: "none", offset: start / LEN, easing: MOVE },
        {
          opacity: 0,
          transform: `translate3d(0, ${drop}px, ${z(mode, -40)}px) scaleY(0.12)`,
          offset: (start + 620) / LEN,
        },
        {
          opacity: 0,
          transform: `translate3d(0, ${drop}px, ${z(mode, -40)}px) scaleY(0.12)`,
          offset: 1,
        },
      ],
      { duration: LEN },
    );
    moving(col, [fall]);
  });
  all(".qv-join").forEach((join, i) => {
    const land = join.animate(
      [
        { opacity: 0, transform: `translate3d(0, -36px, ${z(mode, 120)}px)` },
        { opacity: 1, transform: "none" },
      ],
      {
        duration: 700,
        delay: JOIN_AT + i * 90,
        easing: OUT,
        fill: "backwards",
      },
    );
    moving(join, [land]);
  });
  all(".qv-ghost").forEach((ghost) =>
    ghost.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 500,
      delay: JOIN_AT + 200,
      easing: OUT,
      fill: "backwards",
    }),
  );
  view.querySelector(".qv-strike")?.animate([{ transform: "scaleX(0)" }, { transform: "none" }], {
    duration: 420,
    delay: FALL_AT + 200,
    easing: MOVE,
    fill: "backwards",
  });
  view.querySelector(".qv-to")?.animate(
    [
      { opacity: 0, transform: "translateY(8px)" },
      { opacity: 1, transform: "none" },
    ],
    { duration: 420, delay: JOIN_AT + 100, easing: OUT, fill: "backwards" },
  );
}

/** The billing report: 16 patient queries, one for each month of each sheet, fall and join into 2. */
export function Queries() {
  const view = useRef<HTMLElement>(null);
  const rig = useRef<HTMLDivElement>(null);
  const state = useArrive(
    view,
    (mode) => {
      if (view.current && rig.current) run(view.current, rig.current, mode);
    },
    0.45,
  );
  return (
    <figure className="qv" ref={view} data-arrive={state}>
      <p className="qv-count">
        <span className="qv-from">
          16
          <span className="qv-strike" aria-hidden="true" />
        </span>
        <span className="qv-arrow" aria-hidden="true">
          →
        </span>
        <span className="qv-to">2</span>
        <span className="qv-unit">database queries for one billing report</span>
      </p>
      <div className="room-view room-floor qv-view" aria-hidden="true">
        <div className="room-rig qv-rig" ref={rig}>
          {sheets.map((s, i) =>
            Array.from({ length: s.months }, (_, m) => (
              <span key={`${i}-${m}`} className="qv-ghost" style={{ "--c": i, "--r": m } as CSSProperties} />
            )),
          )}
          {sheets.map((s, i) => (
            <span key={s.days} className="qv-col" style={{ "--c": i, "--n": s.months } as CSSProperties}>
              {Array.from({ length: s.months }, (_, m) => (
                <i key={m} />
              ))}
            </span>
          ))}
          <span className="qv-join" data-k="0">
            One patient query
          </span>
          <span className="qv-join" data-k="1">
            One grouped total
          </span>
        </div>
      </div>
      <ol className="qv-sheets">
        {sheets.map((s) => (
          <li key={s.days}>
            <span className="qv-sheet">{s.days}-day sheet</span>
            <span className="qv-months">{s.months} months</span>
          </li>
        ))}
      </ol>
      <figcaption className="lp-caption">
        Before, each sheet ran one patient query for each month it covers: 2 + 3 + 4 + 7 = 16. Now one patient query and one grouped total serve all
        four sheets, so the count no longer grows with the report window.
      </figcaption>
    </figure>
  );
}
