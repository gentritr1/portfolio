import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router";

const isReduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- How a change gets into the new app ---------- */

const NODES = [
  { name: "Old app", note: "Shows how it works" },
  { name: "Test first", note: "Written on the old app" },
  { name: "Agents build", note: "Inside fixed rules" },
  { name: "Checks", note: "Automatic, must pass" },
  { name: "Person approves", note: "Then it is added", person: true },
];

/** The walk a change takes: the first check fails and sends it back once. Gaps in ms before each hop. */
const WALK: { at: number; fail?: boolean; back?: boolean; wait: number }[] = [
  { at: 0, wait: 0 },
  { at: 1, wait: 380 },
  { at: 2, wait: 380 },
  { at: 3, fail: true, wait: 380 },
  { at: 2, back: true, wait: 520 },
  { at: 3, wait: 560 },
  { at: 4, wait: 380 },
];
const LAST = WALK.length - 1;

/** Plays the walk once when the figure comes into view, and on "Play again". The default state is the end of the walk. */
export function FlowStepper() {
  const [step, setStep] = useState(LAST);
  const [instant, setInstant] = useState(false);
  const box = useRef<HTMLElement>(null);
  const timers = useRef<number[]>([]);
  const now = WALK[step];
  const returned = step >= 4;

  const play = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setInstant(true);
    setStep(0);
    let at = 0;
    for (let i = 1; i <= LAST; i++) {
      at += WALK[i].wait;
      timers.current.push(
        window.setTimeout(() => {
          setInstant(false);
          setStep(i);
        }, at),
      );
    }
  }, []);

  useEffect(() => {
    const el = box.current;
    if (!el || isReduced() || !("IntersectionObserver" in window)) return;
    // A figure already on view at load stays complete; one below it waits at the start of the walk.
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    setInstant(true);
    setStep(0);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          io.disconnect();
          play();
        } else if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          io.disconnect();
          setInstant(true);
          setStep(LAST);
        }
      },
      { threshold: [0, 0.6] },
    );
    io.observe(el);
    const list = timers.current;
    return () => {
      io.disconnect();
      list.forEach((t) => window.clearTimeout(t));
    };
  }, [play]);

  const again = () => {
    if (!isReduced()) play();
  };

  return (
    <figure className="tt-flow" ref={box} data-instant={instant || undefined} aria-labelledby="tt-flow-title">
      <figcaption>
        <h2 id="tt-flow-title" className="tt-explain-title">How a change gets into the new app</h2>
        <p>Gentrit wrote most of the rules and the checks. AI agents build inside them. A person approves each change.</p>
      </figcaption>
      <div className="tt-flow-track" style={{ "--n": NODES.length } as CSSProperties}>
        <ol>
          {NODES.map((n, i) => (
            <li
              key={n.name}
              data-person={n.person || undefined}
              data-state={i === now.at ? (now.fail ? "fail" : "now") : i < now.at ? "done" : undefined}
            >
              <span className="tt-flow-name">{n.name}</span>
              <span className="tt-flow-note">{n.note}</span>
            </li>
          ))}
        </ol>
        <div className="tt-flow-back" data-drawn={returned || undefined}>
          <svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
            <path className="tt-flow-arc-base" d="M100 40 V8 Q100 2 94 2 H6 Q0 2 0 8 V40" pathLength={1} />
            <path className="tt-flow-arc" d="M100 40 V8 Q100 2 94 2 H6 Q0 2 0 8 V40" pathLength={1} />
          </svg>
          <svg className="tt-flow-v" viewBox="0 0 40 100" preserveAspectRatio="none" aria-hidden="true">
            <path className="tt-flow-arc-base" d="M0 100 H28 Q36 100 36 92 V8 Q36 0 28 0 H0" pathLength={1} />
            <path className="tt-flow-arc" d="M0 100 H28 Q36 100 36 92 V8 Q36 0 28 0 H0" pathLength={1} />
          </svg>
          <span>A check fails? Back to the agents.</span>
        </div>
        <div className="tt-flow-rail" aria-hidden="true" style={{ "--at": now.at } as CSSProperties}>
          <i data-fail={now.fail || undefined} />
        </div>
      </div>
      <div className="tt-flow-foot">
        <button type="button" onClick={again}>
          Play again
        </button>
        <p className="tt-links">
          <Link to="/work/care-platform">How the care platform is built</Link>
          <Link to="/work/design-system-react">How the design system is built</Link>
        </p>
      </div>
    </figure>
  );
}

/* ---------- 16 → 2 database requests ---------- */

const BEFORE = 16;
/** The two requests that stay. */
const KEPT = [5, 11];

export function Requests() {
  const [after, setAfter] = useState(false);
  const [instant, setInstant] = useState(false);
  const box = useRef<HTMLElement>(null);
  const played = useRef(false);

  useEffect(() => {
    if (isReduced()) {
      setInstant(true);
      setAfter(true);
      played.current = true;
      return;
    }
    const el = box.current;
    if (!el) return;
    let timer = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || played.current) return;
        played.current = true;
        io.disconnect();
        timer = window.setTimeout(() => setAfter(true), 400);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <figure className="tt-req" ref={box} data-after={after || undefined} data-instant={instant || undefined} aria-labelledby="tt-req-title">
      <figcaption>
        <h2 id="tt-req-title" className="tt-explain-title">One billing report</h2>
        <p>It asked the database 16 times and often timed out. Now it asks 2 times and finishes.</p>
      </figcaption>
      <div className="tt-req-figure" aria-hidden="true">
        <span className="tt-req-number">
          <b className="tt-req-before">16</b>
          <b className="tt-req-after">2</b>
        </span>
        <span className="tt-req-marks">
          {Array.from({ length: BEFORE }, (_, i) => {
            const kept = KEPT.indexOf(i);
            return (
              <i
                key={i}
                data-kept={kept >= 0 || undefined}
                style={{ "--i": i, "--to": kept >= 0 ? kept - i : 0, "--d": `${(i % BEFORE) * 30}ms` } as CSSProperties}
              />
            );
          })}
        </span>
        <span className="tt-req-unit">database requests</span>
      </div>
      <p className="tt-meta">Care-management platform, the server · 2026</p>
    </figure>
  );
}
