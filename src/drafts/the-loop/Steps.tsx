import { useEffect, useRef, useState, type CSSProperties } from "react";
import { checkRows, layers, OLD_WEEK, steps, testFile, testLines, WEEK } from "./data";
import { PhonePicture } from "../../components/PhonePicture";
import { pieceStyle } from "./HeroBuild";
import { useMedia, useReducedMotion } from "./hooks";
import { Approved, Checked } from "./icons";
import { OldScreen } from "./OldScreen";
import "./stage.css";

const OUT = "cubic-bezier(0.22, 1, 0.36, 1)";
const MOVE = "cubic-bezier(0.77, 0, 0.175, 1)";
/** The pose a stage comes from when it is first seen. */
const LEAN = "rotateX(16deg) translateZ(-120px)";
const TILT = "rotateX(46deg) rotateZ(-22deg) scale(0.72)";
/** Depth between two layers of the exploded screen, in px. */
const GAP = 64;
/** The route-rules row fails at this time of the checks run, goes back, and passes at the second. */
const FAIL_AT = 1500;
const PASS_AT = 3300;
const CHECKS_LEN = 4000;

/** `from` is the stage's transform when the run starts, so a step that interrupts another one moves on from where the stage is. */
type Run = (root: HTMLElement, flat: boolean, from: string) => Animation[];

const all = (root: HTMLElement, selector: string) => [...root.querySelectorAll<HTMLElement>(selector)];

function rows(root: HTMLElement, selector: string, start: number, step: number) {
  return all(root, selector).map((row, i) =>
    row.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], {
      duration: 420,
      delay: start + i * step,
      easing: OUT,
      fill: "backwards",
    }),
  );
}

/** The stage leans to a pose and comes back to face front. */
function swing(body: HTMLElement, from: string, pose: string, duration: number) {
  return body.animate(
    [
      { transform: from, easing: MOVE },
      { transform: pose, offset: 0.36, easing: MOVE },
      { transform: "none" },
    ],
    { duration },
  );
}

/** Opacity that is on between two moments of a run of `len` ms. */
const between = (from: number, to: number, len: number): Keyframe[] => [
  { opacity: 0, offset: 0 },
  { opacity: 0, offset: from / len },
  { opacity: 1, offset: (from + 160) / len },
  { opacity: 1, offset: to / len },
  { opacity: 0, offset: Math.min(1, (to + 160) / len) },
];

/** The entrance of each step. Every run ends on the rest state that CSS draws, so a stop at any time is flat. */
const runs: Run[] = [
  (root, flat, from) => {
    const body = root.querySelector<HTMLElement>(".ls-body")!;
    const card = root.querySelector<HTMLElement>(".ls-test")!;
    const out: Animation[] = [];
    if (!flat) out.push(swing(body, from, "rotateY(-12deg) rotateX(6deg) translateZ(-70px)", 1300));
    out.push(
      card.animate(
        [{ opacity: 0, transform: flat ? "translateY(16px)" : "translate3d(56px, 0, 150px) rotateY(-14deg)" }, { opacity: 1, transform: "none" }],
        { duration: 1100, delay: 250, easing: OUT, fill: "backwards" },
      ),
      ...rows(root, ".ls-test .ls-row", 520, 70),
      ...all(root, ".ls-test .ls-tick").map((tick, i) =>
        tick.animate([{ opacity: 0, transform: "translateY(-1px) scale(0.7)" }, { opacity: 1, transform: "translateY(-1px)" }], {
          duration: 240,
          delay: 1000 + i * 260,
          easing: OUT,
          fill: "backwards",
        }),
      ),
    );
    return out;
  },
  (root, flat, from) => {
    const body = root.querySelector<HTMLElement>(".ls-body")!;
    const image = root.querySelector<HTMLElement>(".ls-new")!;
    const parts = all(root, ".ls-layer");
    if (!parts.length) return [];
    const open = flat ? 0 : 800;
    const hold = flat ? 1150 : 1550;
    const len = flat ? 1200 : 2800;
    const total = len + 120;
    const at = (ms: number) => Math.min(1, ms / total);
    const out: Animation[] = [image.animate([{ opacity: 0 }, { opacity: 0 }], { duration: len })];
    if (!flat) {
      out.push(
        body.animate(
          [
            { transform: from, offset: 0, easing: MOVE },
            { transform: TILT, offset: open / len },
            { transform: TILT, offset: hold / len, easing: MOVE },
            { transform: "none", offset: 1 },
          ],
          { duration: len },
        ),
      );
    }
    parts.forEach((part, i) => {
      const start = flat ? "translateY(-14px)" : "none";
      const apart = flat ? "none" : `translateZ(${i * GAP}px)`;
      const arrive = (flat ? 100 : 380) + i * 170;
      out.push(
        part.animate(
          [
            { opacity: 0, transform: start, offset: 0 },
            { opacity: 0, transform: start, offset: at(arrive), easing: OUT },
            { opacity: 1, transform: apart, offset: at(arrive + 480) },
            { opacity: 1, transform: apart, offset: at(hold), easing: MOVE },
            { opacity: 1, transform: "none", offset: at(len) },
            { opacity: 1, transform: "none", offset: 1 },
          ],
          { duration: total },
        ),
      );
    });
    return out;
  },
  (root, flat, from) => {
    const body = root.querySelector<HTMLElement>(".ls-body")!;
    const card = root.querySelector<HTMLElement>(".ls-checks")!;
    const scan = root.querySelector<HTMLElement>(".ls-scan")!;
    const sweep: Keyframe[] = [
      { opacity: 0, transform: "translateY(-100%)" },
      { opacity: 1, offset: 0.12 },
      { opacity: 1, offset: 0.85 },
      { opacity: 0, transform: "translateY(334%)" },
    ];
    const fail = all(root, ".ls-checks .ls-fail");
    const pass = all(root, ".ls-checks [data-once] .ls-pass");
    return [
      ...(flat ? [] : [swing(body, from, "rotateX(8deg) translateZ(-40px)", 1100)]),
      scan.animate(sweep, { duration: 1400, delay: 100, easing: "cubic-bezier(0.45, 0, 0.55, 1)" }),
      scan.animate(sweep, { duration: 1200, delay: 2300, easing: "cubic-bezier(0.45, 0, 0.55, 1)" }),
      card.animate(
        [{ opacity: 0, transform: flat ? "translateY(16px)" : "translate3d(-48px, 12px, 140px) rotateY(12deg)" }, { opacity: 1, transform: "none" }],
        { duration: 1000, delay: 120, easing: OUT, fill: "backwards" },
      ),
      ...rows(root, ".ls-checks .ls-row", 320, 60),
      ...fail.map((node) => node.animate(between(FAIL_AT, PASS_AT - 160, CHECKS_LEN), { duration: CHECKS_LEN })),
      ...pass.map((node) =>
        node.animate(
          [
            { opacity: 0, offset: 0 },
            { opacity: 0, offset: PASS_AT / CHECKS_LEN },
            { opacity: 1, offset: 1 },
          ],
          { duration: CHECKS_LEN, easing: "ease-out" },
        ),
      ),
    ];
  },
  (root, flat, from) => {
    const body = root.querySelector<HTMLElement>(".ls-body")!;
    const mark = root.querySelector<HTMLElement>(".ls-mark")!;
    const out: Animation[] = [];
    if (!flat) out.push(swing(body, from, "rotateY(10deg) rotateX(4deg) scale(0.95)", 1200));
    out.push(
      mark.animate(
        [
          { opacity: 0, transform: "scale(1.2) rotate(-8deg)" },
          { opacity: 1, transform: "rotate(-3deg)" },
        ],
        { duration: 320, delay: flat ? 200 : 520, easing: OUT, fill: "backwards" },
      ),
    );
    return out;
  },
];

function TestCard() {
  return (
    <div className="ls-card ls-test">
      <p className="ls-card-head">
        <span className="ls-file">{testFile}</span>
        <span className="ls-tag">written on the old app</span>
      </p>
      <ol className="ls-lines">
        {testLines.map((line) => (
          <li key={line} className="ls-row">
            <span className="ls-tick" />
            <code>{line}</code>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ChecksCard() {
  return (
    <div className="ls-card ls-checks">
      <p className="ls-card-head">
        <span>Automatic checks</span>
        <span className="ls-tag">on every change</span>
      </p>
      <ul className="ls-lines">
        {checkRows.map((row) => (
          <li key={row.name} className="ls-row" data-once={row.once ? "" : undefined}>
            <span className="ls-check-name">{row.name}</span>
            <code>{row.cmd}</code>
            <span className="ls-status">
              <span className="ls-pass">
                <Checked />
                passed
              </span>
              {row.once && <span className="ls-fail">failed</span>}
            </span>
            {row.once && (
              <span className="ls-note">
                <span className="ls-pass">Each check is first shown to fail on bad work.</span>
                <span className="ls-fail">Failed. The work goes back to the agents.</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Mark() {
  return (
    <p className="ls-mark">
      <Approved />
      <span>
        Approved
        <small>and merged by a person</small>
      </span>
    </p>
  );
}

/** One screen on a 3D stage. Each step has its own state; each entrance ends flat, on the state that CSS draws at rest. */
function Stage({ step, mode, play }: { step: number; mode: "pin" | "stack"; play: boolean }) {
  const root = useRef<HTMLElement>(null);
  const motion = useRef<Animation[]>([]);
  const [seen, setSeen] = useState(false);
  const [shown, setShown] = useState(false);
  const started = useRef(false);
  const flat = mode === "stack";

  useEffect(() => {
    const node = root.current;
    if (!node || !play) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!flat) setSeen(entry.isIntersecting);
        else if (entry.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [play, flat]);

  useEffect(() => {
    const node = root.current;
    if (!node || !play || !seen) return;
    const body = node.querySelector<HTMLElement>(".ls-body")!;
    const first = !started.current;
    started.current = true;
    setShown(true);
    const from = first ? LEAN : getComputedStyle(body).transform;
    motion.current.forEach((a) => a.cancel());
    motion.current = runs[step](node, flat, from);
    if (first) {
      motion.current.push(
        body.animate(flat ? [{ opacity: 0, transform: "translateY(24px)" }, { opacity: 1, transform: "none" }] : [{ opacity: 0 }, { opacity: 1 }], {
          duration: 700,
          easing: OUT,
        }),
      );
    }
    return () => motion.current.forEach((a) => a.cancel());
  }, [step, seen, play, flat]);

  const showsNew = step > 0 || mode === "pin";
  return (
    <figure className="ls" data-step={step} data-mode={mode} data-wait={play && !shown ? "" : undefined} ref={root} aria-hidden="true">
      <div className="ls-body">
        <div className="ls-frame">
          <div className="ls-bar">
            <span className="ls-dots">
              <i />
              <i />
              <i />
            </span>
            <span className="ls-url">
              <span data-on={step === 0 ? "" : undefined}>Care platform, old app</span>
              <span data-on={step > 0 ? "" : undefined}>Care platform, new app</span>
            </span>
          </div>
          <div className="ls-screen">
            {(step === 0 || mode === "pin") && <OldScreen shot={OLD_WEEK} className="ls-old" />}
            {showsNew && (
              <PhonePicture src={WEEK}>
                <img className="ls-new" src={WEEK} width={1440} height={900} alt="" loading="lazy" decoding="async" />
              </PhonePicture>
            )}
            {play && (step === 1 || mode === "pin") && (
              <span className="ls-layers">
                {layers.map((layer, i) => (
                  <span key={i} className="ls-layer" style={{ "--i": i } as CSSProperties}>
                    {layer.map((p, j) => (
                      <span key={j} className="ls-piece" data-wipe={p.wipe} style={pieceStyle(p)} />
                    ))}
                  </span>
                ))}
              </span>
            )}
            {play && (step === 2 || mode === "pin") && (
              <span className="ls-scanwrap">
                <span className="ls-scan" />
              </span>
            )}
          </div>
        </div>
        {(step === 0 || mode === "pin") && <TestCard />}
        {(step === 2 || mode === "pin") && <ChecksCard />}
        {(step === 3 || mode === "pin") && <Mark />}
      </div>
    </figure>
  );
}

/** The four steps. On a wide screen one stage stays pinned and changes with the step in the middle of the view; on a narrow screen, or with reduced motion, each step has its own settled picture. */
export function Steps() {
  const reduce = useReducedMotion();
  const wide = useMedia("(min-width: 1024px)");
  const pinned = wide && !reduce;
  const [active, setActive] = useState(0);
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    if (!pinned) return;
    const items = [...(list.current?.querySelectorAll<HTMLLIElement>(".lp-step") ?? [])];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(items.indexOf(entry.target as HTMLLIElement));
        }
      },
      { rootMargin: "-50% 0px -49% 0px" },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [pinned]);

  return (
    <section className="lp-steps lp-wrap" id="work" aria-labelledby="lp-steps-title" data-mode={pinned ? "pin" : "stack"}>
      <div className="lp-steps-text">
        <h2 className="lp-h2" id="lp-steps-title">
          How each new screen gets made
        </h2>
        <p className="lp-lead">
          The care platform is being rebuilt in React, one screen at a time. AI agents do most of the typing. Tests, checks and a person decide what
          gets in.
        </p>
        <ol className="lp-step-list" ref={list}>
          {steps.map((s, i) => (
            <li key={s.name} className="lp-step" data-now={!pinned || i === active ? "" : undefined}>
              <span className="lp-step-n" aria-hidden="true">
                <span>{String(i + 1).padStart(2, "0")}</span>
                <span className="lp-step-n-on">{String(i + 1).padStart(2, "0")}</span>
              </span>
              <h3 className="lp-step-name">{s.name}</h3>
              <p className="lp-step-text">{s.text}</p>
              {!pinned && (
                <div className="lp-step-figure">
                  <Stage step={i} mode="stack" play={!reduce} />
                  <p className="ls-caption">{s.caption}</p>
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
      {pinned && (
        <div className="lp-steps-pin">
          <Stage step={active} mode="pin" play />
          <div className="ls-foot" aria-hidden="true">
            <ol className="ls-progress">
              {steps.map((s, i) => (
                <li key={s.name} data-on={i <= active ? "" : undefined}>
                  <i />
                </li>
              ))}
            </ol>
            <p className="ls-captions">
              {steps.map((s, i) => (
                <span key={s.name} className="ls-caption" data-on={i === active ? "" : undefined}>
                  <span className="ls-caption-n">{String(i + 1).padStart(2, "0")}</span>
                  {s.caption}
                </span>
              ))}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
