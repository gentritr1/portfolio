import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { stations } from "./data";
import { Replay } from "./icons";
import { useReducedMotion } from "./hooks";

/** The run: the dot's angle on arrival, the time to get there and the wait there. */
interface Hop {
  station: number;
  move: number;
  hold: number;
  checks?: "fail" | "pass";
  back?: boolean;
}

const RUN: Hop[] = [
  { station: 0, move: 0, hold: 900 },
  { station: 1, move: 650, hold: 1100 },
  { station: 2, move: 650, hold: 1100 },
  { station: 3, move: 650, hold: 1300, checks: "fail" },
  { station: 2, move: 850, hold: 1200, back: true },
  { station: 3, move: 750, hold: 1100, checks: "pass" },
  { station: 4, move: 650, hold: 0 },
];

const STEP = 72;
const angleOf = (station: number) => station * STEP;
const pad = (n: number) => String(n + 1).padStart(2, "0");
const place = ["top", "right", "right", "left", "left"] as const;

/** Points on the drawing, for a 440 x 440 box. */
const C = 220;
const R = 176;
const BACK_R = R - 34;
const point = (deg: number, r: number) => {
  const a = (deg * Math.PI) / 180;
  return `${(C + r * Math.sin(a)).toFixed(2)} ${(C - r * Math.cos(a)).toFixed(2)}`;
};

type Status = "idle" | "running" | "ended";

export function Ring() {
  const reduce = useReducedMotion();
  const single = !reduce;
  const figure = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLSpanElement>(null);
  const timers = useRef<number[]>([]);
  const motion = useRef<Animation | null>(null);
  const touched = useRef(false);
  const [status, setStatus] = useState<Status>(reduce ? "ended" : "idle");
  const [at, setAt] = useState(reduce ? 4 : 0);
  const [checks, setChecks] = useState<"fail" | "pass">(reduce ? "pass" : "fail");
  const [back, setBack] = useState(reduce);
  const [arc, setArc] = useState(reduce);

  const clear = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    motion.current?.cancel();
    motion.current = null;
  };

  const settle = useCallback((station: number) => {
    touched.current = true;
    clear();
    setAt(station);
    setChecks("pass");
    setBack(false);
    setArc(true);
    setStatus("ended");
    if (dot.current) dot.current.style.transform = `rotate(${angleOf(station)}deg)`;
  }, []);

  const play = useCallback(() => {
    clear();
    setStatus("running");
    setAt(0);
    setChecks("fail");
    setBack(false);
    setArc(false);
    const frames: Keyframe[] = [];
    let t = 0;
    let angle = 0;
    const times: number[] = [];
    RUN.forEach((hop) => {
      t += hop.move;
      times.push(t);
      t += hop.hold;
    });
    const total = t;
    frames.push({ transform: "rotate(0deg)", offset: 0, easing: "linear" });
    t = 0;
    RUN.forEach((hop, i) => {
      if (i > 0) {
        frames.push({ transform: `rotate(${angle}deg)`, offset: t / total, easing: "cubic-bezier(0.77, 0, 0.175, 1)" });
        t += hop.move;
        angle = angleOf(hop.station);
        frames.push({ transform: `rotate(${angle}deg)`, offset: t / total, easing: "linear" });
      }
      t += hop.hold;
      const arrive = times[i];
      timers.current.push(
        window.setTimeout(() => {
          setAt(hop.station);
          if (hop.checks) setChecks(hop.checks);
          setBack(Boolean(hop.back));
          if (hop.back) setArc(true);
          if (i === RUN.length - 1) setStatus("ended");
        }, arrive),
      );
    });
    frames.push({ transform: `rotate(${angle}deg)`, offset: 1 });
    if (dot.current) {
      dot.current.style.transform = "";
      motion.current = dot.current.animate(frames, { duration: total, fill: "forwards" });
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

  return (
    <div className="lp-ring" data-status={status} data-single={single ? "" : undefined} data-checks={checks}>
      <div className="lp-ring-figure" ref={figure}>
        <svg className="lp-ring-art" viewBox="0 0 440 440" aria-hidden="true">
          <circle cx={C} cy={C} r={R} className="lp-ring-track" />
          <path
            className="lp-ring-back"
            data-on={arc ? "" : undefined}
            data-now={back ? "" : undefined}
            d={`M ${point(angleOf(3) - 6, BACK_R)} A ${BACK_R} ${BACK_R} 0 0 0 ${point(angleOf(2) + 9, BACK_R)}`}
            markerEnd="url(#lp-head)"
          />
          <defs>
            <marker id="lp-head" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 10 5 0 10z" className="lp-ring-head" />
            </marker>
          </defs>
        </svg>
        <span className="lp-ring-hub" aria-hidden="true">
          <span className="lp-ring-dot-arm" ref={dot}>
            <span className="lp-ring-dot" />
          </span>
        </span>
        <ol className="lp-ring-stations" aria-label="The five steps of the loop">
          {stations.map((s, i) => {
            const label = (
              <>
                <span className="lp-node">{pad(i)}</span>
                <span className="lp-node-name" data-place={place[i]}>
                  {s.name}
                </span>
              </>
            );
            return (
              <li
                key={s.name}
                className="lp-station"
                style={{ "--a": `${angleOf(i)}deg` } as CSSProperties}
                data-state={i === at ? "now" : undefined}
              >
                {single ? (
                  <button type="button" aria-pressed={i === at} aria-controls={`lp-art-${i}`} onClick={() => settle(i)}>
                    {label}
                  </button>
                ) : (
                  <span className="lp-station-static">{label}</span>
                )}
              </li>
            );
          })}
        </ol>
        <p className="lp-ring-center" aria-hidden="true">
          {back ? (
            <span className="lp-ring-fail">A check fails? Back to the agents.</span>
          ) : (
            <>
              <span className="lp-ring-time">{current.time}</span>
              <span className="lp-ring-now">{current.name}</span>
            </>
          )}
        </p>
        <p className="lp-ring-backlabel" data-on={arc && !back ? "" : undefined}>
          A check fails? Back to the agents.
        </p>
      </div>

      <div className="lp-ring-side">
        <ol className="lp-arts">
          {stations.map((s, i) => (
            <li
              key={s.name}
              id={`lp-art-${i}`}
              className="lp-art"
              data-current={i === panel ? "" : undefined}
              aria-hidden={single && i !== panel ? true : undefined}
              inert={single && i !== panel}
            >
              <p className="lp-art-head">
                <span className="lp-art-n">{pad(i)}</span>
                <span className="lp-art-name">{s.name}</span>
                <span className="lp-art-time">{s.time}</span>
              </p>
              <p className="lp-art-line">{s.line}</p>
              <pre className="lp-art-text" data-kind={i === 3 ? "checks" : undefined}>
                {s.artefact.map((row, r) => (
                  <span key={r} className="lp-art-row" data-row={i === 3 ? (r === 3 ? "pass" : "fail") : undefined}>
                    {row || " "}
                  </span>
                ))}
              </pre>
              <p className="lp-art-source">{s.source}</p>
            </li>
          ))}
        </ol>
        {!reduce && (
          <button
            type="button"
            className="lp-ring-play"
            onClick={() => (status === "running" ? settle(at) : play())}
          >
            <Replay />
            {status === "running" ? "Stop" : "Play the day again"}
          </button>
        )}
      </div>
    </div>
  );
}
