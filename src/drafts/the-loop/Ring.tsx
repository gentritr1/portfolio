import { memo, useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { builtFiles, OLD_COMPLIANCE, stations, twinBase, twinSteps } from "./data";
import { Approved, Replay } from "./icons";
import { useReducedMotion } from "./hooks";
import { OldScreen } from "./OldScreen";
import "./stage.css";

/** One hop of the run: where the dot goes, how long the move takes, and how long it stays. */
interface Hop {
  station: number;
  move: number;
  hold: number;
  checks?: "fail" | "pass";
  back?: boolean;
}

const RUN: Hop[] = [
  { station: 0, move: 0, hold: 1700 },
  { station: 1, move: 800, hold: 1700 },
  { station: 2, move: 800, hold: 1900 },
  { station: 3, move: 800, hold: 1800, checks: "fail" },
  { station: 2, move: 900, hold: 1300, back: true },
  { station: 3, move: 800, hold: 1500, checks: "pass" },
  { station: 4, move: 800, hold: 500 },
];

const MOVE = "cubic-bezier(0.77, 0, 0.175, 1)";
const STEP = 72;
const angleOf = (station: number) => station * STEP;
const pad = (n: number) => String(n + 1).padStart(2, "0");

/**
 * The orbit, in parts of the orbit's width. The plane is tilted by TILT and seen with perspective DEPTH,
 * so each card is placed where its point on the tilted ring lands on the screen.
 * stage.css uses the same numbers: the plane centre at 31cqw, a plane of 2 * (R + MARGIN), the tilt and the depth.
 */
const R = 0.41;
const MARGIN = 0.03;
const TILT = 58;
const DEPTH = 1.9;
const project = (deg: number) => {
  const a = (deg * Math.PI) / 180;
  const t = (TILT * Math.PI) / 180;
  const x = R * Math.sin(a);
  const y = -R * Math.cos(a);
  const s = DEPTH / (DEPTH - y * Math.sin(t));
  return { x: x * s, y: y * Math.cos(t) * s, s };
};
const BOX = 2 * (R + MARGIN) * 100;
const C = BOX / 2;
const RING = R * 100;
const BACK_R = RING - 5;
const arcPoint = (deg: number, r: number) => {
  const a = (deg * Math.PI) / 180;
  return `${(C + r * Math.sin(a)).toFixed(2)} ${(C - r * Math.cos(a)).toFixed(2)}`;
};

type Status = "idle" | "running" | "ended";

/** Trail opacity: on while the dot moves on the hops that `on` picks, off while it waits. */
function trail(on: (hop: Hop) => boolean, total: number): Keyframe[] {
  const frames: Keyframe[] = [{ opacity: 0, offset: 0 }];
  let t = 0;
  RUN.forEach((hop, i) => {
    if (i > 0 && on(hop)) {
      frames.push(
        { opacity: 0, offset: t / total },
        { opacity: 1, offset: (t + hop.move * 0.3) / total },
        { opacity: 1, offset: (t + hop.move) / total },
        { opacity: 0, offset: Math.min(1, (t + hop.move + 420) / total) },
      );
    }
    t += hop.move + hop.hold;
  });
  frames.push({ opacity: 0, offset: 1 });
  return frames;
}

const FRAME_MS = 1200;
const framePath = (app: "old" | "new", n: number) => `${twinBase}${app}-0${n + 1}-1080.webp`;

/**
 * The same test, step by step, on both apps at once. Frames load only once the panel has been shown,
 * play once while the panel is on screen, and stop on the last frame.
 */
function Twin({ active, still }: { active: boolean; still: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const last = twinSteps.length - 1;
  const [armed, setArmed] = useState(still);
  const [frame, setFrame] = useState(still ? last : 0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active || still) return;
    setArmed(true);
    setFrame(0);
  }, [active, still]);

  useEffect(() => {
    const node = root.current;
    if (!node || still) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.4 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [still]);

  useEffect(() => {
    if (still || !active || !visible || frame >= last) return;
    const id = window.setTimeout(() => setFrame((n) => n + 1), FRAME_MS);
    return () => window.clearTimeout(id);
  }, [still, active, visible, frame, last]);

  return (
    <div className="lr-twin" ref={root}>
      <div className="lr-twin-apps">
        {(["old", "new"] as const).map((app) => (
          <figure key={app} className="lr-twin-app">
            <figcaption>{app === "old" ? "Old app" : "New app"}</figcaption>
            <span className="lr-twin-screen">
              {armed &&
                twinSteps.map((step, n) =>
                  still && n !== last ? null : (
                    <img
                      key={n}
                      src={framePath(app, n)}
                      width={1440}
                      height={900}
                      alt={n === last ? `${app === "old" ? "Old" : "New"} app, step ${n + 1} of the same test: ${step} Invented data.` : ""}
                      loading="lazy"
                      decoding="async"
                      data-on={n <= frame ? "" : undefined}
                    />
                  ),
                )}
            </span>
          </figure>
        ))}
      </div>
      <p className="lr-twin-step" aria-live="off">
        <span className="lr-twin-n">
          {frame + 1} / {twinSteps.length}
        </span>
        {twinSteps[frame]}
      </p>
    </div>
  );
}

/** Static for each station, so a hop re-renders only the cards and the centre. */
const Visual = memo(function Visual({ index, active, still }: { index: number; active: boolean; still: boolean }) {
  const s = stations[index];
  if (index === 0) {
    return (
      <div className="lr-vis lr-vis-old">
        <span className="lr-mini">
          <span className="lr-mini-bar">Care platform, old app</span>
          <OldScreen shot={OLD_COMPLIANCE} className="lr-mini-screen" />
        </span>
        <pre className="lr-code lr-float">
          {s.artefact.map((row, r) => (
            <span key={r} className="lr-row" style={{ "--i": r + 2 } as CSSProperties} data-row={r === 1 ? "fail" : r === 2 ? "pass" : undefined}>
              {row}
            </span>
          ))}
        </pre>
      </div>
    );
  }
  if (index === 1) {
    return (
      <pre className="lr-vis lr-code lr-lines">
        {s.artefact.map((row, r) => (
          <span key={r} className="lr-row" style={{ "--i": r } as CSSProperties}>
            <span className="lr-ln">{r + 1}</span>
            {row}
          </span>
        ))}
      </pre>
    );
  }
  if (index === 2) {
    const most = Math.max(...builtFiles.map(([, n]) => n));
    return (
      <div className="lr-vis lr-files">
        <p className="lr-commit lr-row" style={{ "--i": 0 } as CSSProperties}>
          {s.artefact[0]} {s.artefact[1]}
        </p>
        <ul>
          {builtFiles.map(([file, n], r) => (
            <li key={file} className="lr-file" style={{ "--i": r, "--w": n / most } as CSSProperties}>
              <span className="lr-file-name">{file}</span>
              <span className="lr-bar">
                <i />
              </span>
              <span className="lr-file-n">+{n}</span>
            </li>
          ))}
        </ul>
        <p className="lr-commit lr-row" style={{ "--i": 15 } as CSSProperties}>
          {s.artefact[3]}
          <br />
          {s.artefact[4]}
        </p>
      </div>
    );
  }
  if (index === 3) {
    return (
      <pre className="lr-vis lr-code lr-checks">
        {s.artefact.map((row, r) => (
          <span key={r} className="lr-row" style={{ "--i": r } as CSSProperties} data-row={r === 3 ? "pass" : "fail"}>
            {row}
          </span>
        ))}
      </pre>
    );
  }
  return (
    <div className="lr-vis lr-merge">
      <Twin active={active} still={still} />
      <pre className="lr-code">
        {s.artefact.slice(0, 2).map((row, r) => (
          <span key={r} className="lr-row" style={{ "--i": r } as CSSProperties} data-row="pass">
            {row}
          </span>
        ))}
      </pre>
      <p className="lr-seal lr-row" style={{ "--i": 3 } as CSSProperties}>
        <Approved />
        <span>
          Approved and merged
          <small>{s.time}, by a person</small>
        </span>
      </p>
    </div>
  );
});

/** One real day of one screen, as a dot that travels a tilted ring of five stations. */
export function Ring() {
  const reduce = useReducedMotion();
  const single = !reduce;
  const figure = useRef<HTMLDivElement>(null);
  const arm = useRef<HTMLSpanElement>(null);
  const forward = useRef<HTMLSpanElement>(null);
  const backward = useRef<HTMLSpanElement>(null);
  const timers = useRef<number[]>([]);
  const motion = useRef<Animation[]>([]);
  const touched = useRef(false);
  const [status, setStatus] = useState<Status>(reduce ? "ended" : "idle");
  const [at, setAt] = useState(reduce ? 4 : 0);
  const [reached, setReached] = useState(reduce ? 4 : 0);
  const [checks, setChecks] = useState<"fail" | "pass">(reduce ? "pass" : "fail");
  const [back, setBack] = useState(false);
  const [arc, setArc] = useState(reduce);

  const clear = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    motion.current.forEach((a) => a.cancel());
    motion.current = [];
  };

  const settle = useCallback((station: number) => {
    touched.current = true;
    clear();
    setAt(station);
    setReached(4);
    setChecks("pass");
    setBack(false);
    setArc(true);
    setStatus("ended");
    if (arm.current) arm.current.style.transform = `rotate(${angleOf(station)}deg)`;
  }, []);

  const play = useCallback(() => {
    clear();
    setStatus("running");
    setAt(0);
    setReached(0);
    setChecks("fail");
    setBack(false);
    setArc(false);
    const total = RUN.reduce((sum, hop) => sum + hop.move + hop.hold, 0);
    const frames: Keyframe[] = [{ transform: "rotate(0deg)", offset: 0 }];
    let t = 0;
    let angle = 0;
    RUN.forEach((hop, i) => {
      if (i > 0) {
        frames.push({ transform: `rotate(${angle}deg)`, offset: t / total, easing: MOVE });
        t += hop.move;
        angle = angleOf(hop.station);
        frames.push({ transform: `rotate(${angle}deg)`, offset: t / total });
      }
      const arrive = t;
      timers.current.push(
        window.setTimeout(() => {
          setAt(hop.station);
          setReached((n) => Math.max(n, hop.station));
          if (hop.checks) setChecks(hop.checks);
          setBack(Boolean(hop.back));
          if (hop.back) setArc(true);
          if (i === RUN.length - 1) setStatus("ended");
        }, arrive),
      );
      t += hop.hold;
    });
    frames.push({ transform: `rotate(${angle}deg)`, offset: 1 });
    if (arm.current && forward.current && backward.current) {
      arm.current.style.transform = `rotate(${angle}deg)`;
      motion.current = [
        arm.current.animate(frames, { duration: total }),
        forward.current.animate(trail((hop) => !hop.back, total), { duration: total }),
        backward.current.animate(trail((hop) => Boolean(hop.back), total), { duration: total }),
      ];
    }
  }, []);

  useEffect(() => {
    if (reduce) {
      settle(4);
      touched.current = false;
      return;
    }
    const node = figure.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          if (!touched.current) play();
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      clear();
    };
  }, [reduce, play, settle]);

  const current = stations[at];
  const panel = back ? 3 : at;
  const failing = checks === "fail" && status === "running";
  const done = (i: number) => (i < reached || status === "ended") && i !== at;

  return (
    <div className="lr" data-status={status} data-single={single ? "" : undefined} data-checks={checks} data-back={back ? "" : undefined}>
      <div className="lr-orbit" ref={figure}>
        <div className="lr-scene" aria-hidden="true">
          <div className="lr-plane">
            <svg className="lr-art" viewBox={`0 0 ${BOX} ${BOX}`}>
              <circle cx={C} cy={C} r={RING} className="lr-track" />
              {stations.map((_, i) => (
                <circle
                  key={i}
                  cx={arcPoint(angleOf(i), RING).split(" ")[0]}
                  cy={arcPoint(angleOf(i), RING).split(" ")[1]}
                  r={1.6}
                  className="lr-pad"
                  data-on={i === at ? "" : undefined}
                />
              ))}
              <path
                className="lr-back"
                data-on={arc ? "" : undefined}
                data-now={back ? "" : undefined}
                d={`M ${arcPoint(angleOf(3) - 7, BACK_R)} A ${BACK_R} ${BACK_R} 0 0 0 ${arcPoint(angleOf(2) + 10, BACK_R)}`}
                markerEnd="url(#lr-head)"
              />
              <defs>
                <marker id="lr-head" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M0 0 10 5 0 10z" className="lr-head" />
                </marker>
              </defs>
            </svg>
            <span className="lr-arm" ref={arm}>
              <span className="lr-trail" ref={forward} />
              <span className="lr-trail lr-trail-back" ref={backward} />
              <span className="lr-dot" />
            </span>
          </div>
        </div>
        <ol className="lr-cards" aria-label="The five steps of the loop">
          {stations.map((s, i) => {
            const p = project(angleOf(i));
            const body = (
              <span className="lr-card-in">
                <span className="lr-card-n">{pad(i)}</span>
                <span className="lr-card-name">{s.name}</span>
                {i === 3 && reached >= 3 && (
                  <span className="lr-chip" data-kind={failing ? "fail" : "pass"}>
                    {failing ? "failed" : "passed"}
                  </span>
                )}
              </span>
            );
            return (
              <li
                key={s.name}
                className="lr-card"
                style={{ "--x": p.x, "--y": p.y, "--s": p.s.toFixed(3), zIndex: Math.round(p.y * 100) + 50 } as CSSProperties}
                data-state={i === at ? "now" : done(i) ? "done" : undefined}
              >
                {single ? (
                  <button type="button" aria-pressed={i === at} aria-controls={`lr-panel-${i}`} onClick={() => settle(i)}>
                    {body}
                  </button>
                ) : (
                  <span className="lr-card-static">{body}</span>
                )}
              </li>
            );
          })}
        </ol>
        <p className="lr-center" aria-hidden="true" key={back ? "back" : at}>
          {back ? (
            <span className="lr-fail">A check fails? Back to the agents.</span>
          ) : (
            <>
              <span className="lr-time">{current.time}</span>
              <span className="lr-now">{current.name}</span>
            </>
          )}
        </p>
        <p className="lr-backlabel" data-on={arc && !back ? "" : undefined}>
          A check fails? Back to the agents. Then it passes.
        </p>
      </div>

      <div className="lr-side">
        <ol className="lr-panels">
          {stations.map((s, i) => (
            <li
              key={s.name}
              id={`lr-panel-${i}`}
              className="lr-panel"
              data-current={i === panel ? "" : undefined}
              aria-hidden={single && i !== panel ? true : undefined}
              inert={single && i !== panel}
            >
              <p className="lr-panel-head">
                <span className="lr-panel-n">{pad(i)}</span>
                <span className="lr-panel-name">{s.name}</span>
                <span className="lr-panel-time">{s.time}</span>
              </p>
              <p className="lr-panel-line">{s.line}</p>
              <Visual index={i} active={single && i === panel} still={!single} />
              <p className="lr-panel-source">{s.source}</p>
            </li>
          ))}
        </ol>
        {!reduce && (
          <button type="button" className="lr-play" onClick={() => (status === "running" ? settle(at) : play())}>
            <Replay />
            {status === "running" ? "Stop" : "Play the day again"}
          </button>
        )}
      </div>
    </div>
  );
}
