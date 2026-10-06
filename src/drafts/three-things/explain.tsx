import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { Link } from "react-router";

const isReduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** A press that came from the keyboard (detail 0) changes state with no motion. */
const fromKeyboard = (e: MouseEvent) => e.detail === 0;

/* ---------- How a change gets into the new app ---------- */

const NODES = [
  { name: "Old app", note: "Shows how it works" },
  { name: "Test first", note: "Written on the old app" },
  { name: "Agents build", note: "Inside fixed rules" },
  { name: "Checks", note: "Automatic, must pass" },
  { name: "Person approves", note: "Then it is added", person: true },
];

/** The walk a change takes: the first check fails and sends it back once. */
const WALK: { at: number; say: string; fail?: boolean; back?: boolean }[] = [
  { at: 0, say: "The old app shows how the screen works today." },
  { at: 1, say: "A test is written on the old app, before any new code." },
  { at: 2, say: "AI agents write the new screen inside fixed rules." },
  { at: 3, say: "An automatic check fails.", fail: true },
  { at: 2, say: "The change goes back. The agents fix it.", back: true },
  { at: 3, say: "Every check passes." },
  { at: 4, say: "A person approves the change. Only then is it added." },
];

export function FlowStepper() {
  const [step, setStep] = useState(0);
  const [instant, setInstant] = useState(false);
  const now = WALK[step];
  const last = step === WALK.length - 1;
  const returned = step >= 4;

  const go = (e: MouseEvent, next: number) => {
    setInstant(fromKeyboard(e) || isReduced());
    setStep(next);
  };

  return (
    <figure className="tt-flow" data-instant={instant || undefined} aria-labelledby="tt-flow-title">
      <figcaption>
        <h2 id="tt-flow-title" className="tt-explain-title">How a change gets into the new app</h2>
        <p>AI agents write the code inside rules Gentrit sets. A person approves each change.</p>
      </figcaption>
      <div className="tt-flow-track" style={{ "--n": NODES.length } as CSSProperties}>
        <ol>
          {NODES.map((n, i) => (
            <li
              key={n.name}
              data-person={n.person || undefined}
              data-state={i === now.at ? (now.fail ? "fail" : "now") : i < now.at ? "done" : undefined}
              aria-current={i === now.at ? "step" : undefined}
            >
              <span className="tt-flow-name">{n.name}</span>
              <span className="tt-flow-note">{i === 3 && (step === 3 || step === 4) ? "One check failed" : n.note}</span>
            </li>
          ))}
        </ol>
        <div className="tt-flow-back" data-drawn={returned || undefined} aria-hidden="true">
          <svg viewBox="0 0 100 40" preserveAspectRatio="none">
            <path className="tt-flow-arc-base" d="M100 40 V8 Q100 2 94 2 H6 Q0 2 0 8 V40" pathLength={1} />
            <path className="tt-flow-arc" d="M100 40 V8 Q100 2 94 2 H6 Q0 2 0 8 V40" pathLength={1} />
          </svg>
          <svg className="tt-flow-v" viewBox="0 0 40 100" preserveAspectRatio="none">
            <path className="tt-flow-arc-base" d="M0 100 H28 Q36 100 36 92 V8 Q36 0 28 0 H0" pathLength={1} />
            <path className="tt-flow-arc" d="M0 100 H28 Q36 100 36 92 V8 Q36 0 28 0 H0" pathLength={1} />
          </svg>
          <span>Fails? It goes back.</span>
        </div>
        <div className="tt-flow-rail" aria-hidden="true" style={{ "--at": now.at } as CSSProperties}>
          <i data-fail={now.fail || undefined} />
        </div>
      </div>
      <div className="tt-flow-foot">
        <p className="tt-flow-say" role="status">
          <span className="tt-flow-num">
            {step + 1} of {WALK.length}
          </span>{" "}
          {now.say}
        </p>
        <div className="tt-flow-buttons">
          <button type="button" onClick={(e) => go(e, step - 1)} disabled={step === 0}>
            Back
          </button>
          <button type="button" className="tt-primary" onClick={(e) => go(e, last ? 0 : step + 1)}>
            {last ? "Start again" : "Next step"}
          </button>
        </div>
      </div>
      <p className="tt-links">
        <Link to="/work/care-platform">How the care platform is built</Link>
        <Link to="/work/design-system-react">How the design system is built</Link>
      </p>
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

  const show = (e: MouseEvent, value: boolean) => {
    played.current = true;
    setInstant(fromKeyboard(e) || isReduced());
    setAfter(value);
  };

  return (
    <figure className="tt-req" ref={box} data-after={after || undefined} data-instant={instant || undefined} aria-labelledby="tt-req-title">
      <figcaption>
        <h2 id="tt-req-title" className="tt-explain-title">One billing report</h2>
        <p>It asked the database 16 times and used to give up. Now it asks 2 times and finishes.</p>
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
      <div className="tt-req-buttons" role="group" aria-label="Show the report">
        <button type="button" aria-pressed={!after} onClick={(e) => show(e, false)}>
          Before: 16
        </button>
        <button type="button" aria-pressed={after} onClick={(e) => show(e, true)}>
          After: 2
        </button>
      </div>
      <p className="tt-meta">Care-management platform, server side · Laravel · 2026</p>
    </figure>
  );
}
