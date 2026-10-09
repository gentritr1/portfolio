import { memo, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { flushSync } from "react-dom";
import { checkRows, layers, OLD_WEEK, steps, testFile, testLines, WEEK } from "./data";
import { PhonePicture } from "../../components/PhonePicture";
import { pieceStyle } from "./HeroBuild";
import { useMedia, useReducedMotion } from "./hooks";
import { Approved, Checked } from "./icons";
import { OldScreen } from "./OldScreen";
import "./stage.css";

const OUT = "cubic-bezier(0.22, 1, 0.36, 1)";
const MOVE = "cubic-bezier(0.77, 0, 0.175, 1)";
const DRIFT = "cubic-bezier(0.45, 0, 0.55, 1)";
const COUNT = steps.length;
const pad = (i: number) => String(i + 1).padStart(2, "0");

interface Pose {
  x?: number;
  y?: number;
  z?: number;
  rx?: number;
  ry?: number;
  rz?: number;
  s?: number;
}

const pose = ({ x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s = 1 }: Pose) =>
  `translate3d(${x}%, ${y}%, ${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${s})`;

/** The rig rests flat at scale 1 on every step, so the screen's text is never resampled at rest. */
const REST = "none";
/** Where the camera is when the scene is first seen. */
const WIDE = pose({ y: 6, z: -320, rx: 16 });
/** The part each step looks at, as a point on the rig in % from its centre. The camera comes in toward it. */
const TARGET: Array<[number, number]> = [
  [26, 12],
  [0, 0],
  [-24, 14],
  [18, 16],
];
/** Depth between two layers of the exploded screen, in px. */
const GAP = 90;
/** How long the main move of each step takes, in ms. The rail fills in this time. */
const LENGTH = [1700, 3300, 4700, 1700];

/** Times in the checks run of step 03, in ms. */
const PASS_EACH = 820;
const FAIL_AT = 1950;
const RERUN_AT = 3000;
const PASS_AT = 4150;
const CHECKS_LEN = 4700;

const all = (root: HTMLElement, selector: string) => [...root.querySelectorAll<HTMLElement>(selector)];
const one = (root: HTMLElement, selector: string) => root.querySelector<HTMLElement>(selector)!;

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

/** Opacity that is on between two moments of a run of `len` ms. */
const between = (from: number, to: number, len: number): Keyframe[] => [
  { opacity: 0, offset: 0 },
  { opacity: 0, offset: from / len },
  { opacity: 1, offset: Math.min(1, (from + 160) / len) },
  { opacity: 1, offset: to / len },
  { opacity: 0, offset: Math.min(1, (to + 160) / len) },
  ...(to + 160 < len ? [{ opacity: 0, offset: 1 }] : []),
];

/** Opacity that comes on at one moment of a run of `len` ms and stays. */
const from = (at: number, len: number): Keyframe[] => [
  { opacity: 0, offset: 0 },
  { opacity: 0, offset: at / len },
  { opacity: 1, offset: Math.min(1, (at + 200) / len) },
  ...(at + 200 < len ? [{ opacity: 1, offset: 1 }] : []),
];

/** The camera cuts from where it is through a turn, then comes in toward the step's target and lands flat at scale 1. While it comes in, the target point stays where it is at rest. */
function cut(cam: HTMLElement, start: string, turn: Pose, step: number, duration: number, near = 0.88) {
  const [tx, ty] = TARGET[step];
  return cam.animate(
    [
      { transform: start, easing: MOVE },
      { transform: pose(turn), offset: 0.38, easing: OUT },
      { transform: pose({ x: tx * (1 - near), y: ty * (1 - near), s: near }), offset: 0.5, easing: OUT },
      { transform: REST },
    ],
    { duration },
  );
}

/** One soft band of light crosses the screen when the camera lands. */
function sweep(root: HTMLElement, delay: number) {
  return one(root, ".lc-sweep").animate(
    [
      { opacity: 0, transform: "translateX(-100%)" },
      { opacity: 1, offset: 0.35 },
      { opacity: 0, transform: "translateX(230%)" },
    ],
    { duration: 1300, delay, easing: DRIFT, fill: "backwards" },
  );
}

/** The checks run: four pass, "Route rules" fails, the work goes back, the second run passes. Every run ends on the rest state that CSS draws. */
function checks(root: HTMLElement, flat: boolean): Animation[] {
  const t = (ms: number) => (flat ? ms * 0.85 : ms);
  const len = t(CHECKS_LEN);
  const sweepKeys: Keyframe[] = [
    { opacity: 0, transform: "translateY(-100%)" },
    { opacity: 1, offset: 0.12 },
    { opacity: 1, offset: 0.85 },
    { opacity: 0, transform: "translateY(334%)" },
  ];
  const scan = one(root, ".ls-scan");
  const firstPass = all(root, ".ls-checks .ls-row:not([data-once]) .ls-pass");
  const out: Animation[] = [
    scan.animate(sweepKeys, { duration: t(1500), delay: t(450), easing: DRIFT }),
    scan.animate(sweepKeys, { duration: t(1200), delay: t(RERUN_AT), easing: DRIFT }),
    ...rows(root, ".ls-checks .ls-row", t(380), 60),
    ...firstPass.map((node, i) =>
      node.animate(
        [
          { opacity: 0, transform: "scale(0.9)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 260, delay: t(PASS_EACH + i * 230), easing: OUT, fill: "backwards" },
      ),
    ),
    ...all(root, ".ls-checks [data-once] .ls-fail").map((node) => node.animate(between(t(FAIL_AT), t(PASS_AT) - 160, len), { duration: len })),
    ...all(root, ".ls-checks [data-once] .ls-pass").map((node) => node.animate(from(t(PASS_AT), len), { duration: len, easing: "ease-out" })),
    one(root, ".ls-run-1").animate(between(0, t(RERUN_AT), len), { duration: len }),
    one(root, ".ls-run-2").animate(from(t(RERUN_AT), len), { duration: len }),
    one(root, ".ls-flag").animate(between(t(FAIL_AT), t(PASS_AT) - 160, len), { duration: len }),
    one(root, ".ls-good").animate(
      [
        { opacity: 0, offset: 0 },
        { opacity: 0, offset: t(PASS_AT) / len },
        { opacity: 1, offset: Math.min(1, (t(PASS_AT) + 200) / len) },
        { opacity: 0, offset: 1 },
      ],
      { duration: len + 900 },
    ),
  ];
  const alarm = root.querySelector<HTMLElement>(".lc-alarm");
  if (alarm) {
    out.push(
      alarm.animate(
        [
          { opacity: 0, offset: 0 },
          { opacity: 0, offset: t(FAIL_AT) / len },
          { opacity: 1, offset: (t(FAIL_AT) + 140) / len },
          { opacity: 1, offset: (t(RERUN_AT) - 300) / len },
          { opacity: 0, offset: t(RERUN_AT) / len },
          { opacity: 0, offset: 1 },
        ],
        { duration: len },
      ),
    );
  }
  return out;
}

type Run = (root: HTMLElement, cam: HTMLElement, start: string) => Animation[];

/** The pinned scene: the move of each step. */
const scene: Run[] = [
  (root, cam, start) => [
    cut(cam, start, { y: -2, z: -160, rx: 5, ry: -11, s: 0.9 }, 0, LENGTH[0]),
    sweep(root, 700),
    one(root, ".ls-test").animate(
      [
        { opacity: 0, transform: "translate3d(80px, 12px, 200px) rotateY(-18deg)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 1100, delay: 320, easing: OUT, fill: "backwards" },
    ),
    ...rows(root, ".ls-test .ls-row", 640, 80),
    ...all(root, ".ls-test .ls-tick").map((tick, i) =>
      tick.animate([{ opacity: 0, transform: "translateY(-1px) scale(0.7)" }, { opacity: 1, transform: "translateY(-1px)" }], {
        duration: 240,
        delay: 1150 + i * 240,
        easing: OUT,
        fill: "backwards",
      }),
    ),
  ],
  (root, cam, start) => {
    const len = LENGTH[1];
    const total = len + 120;
    const at = (ms: number) => Math.min(1, ms / total);
    const open = 750;
    const hold = 2050;
    const out: Animation[] = [
      one(root, ".ls-new").animate([{ opacity: 0 }, { opacity: 0 }], { duration: len }),
      cam.animate(
        [
          { transform: start, offset: 0, easing: MOVE },
          { transform: pose({ y: 3, rx: 50, rz: -24, s: 0.64 }), offset: open / len, easing: DRIFT },
          { transform: pose({ y: 2, rx: 43, rz: -13, s: 0.66 }), offset: hold / len, easing: MOVE },
          { transform: REST, offset: 1 },
        ],
        { duration: len },
      ),
      sweep(root, len - 350),
    ];
    all(root, ".ls-layer").forEach((part, i) => {
      const apart = `translate3d(0, 0, ${i * GAP}px)`;
      const arrive = 300 + i * 190;
      out.push(
        part.animate(
          [
            { opacity: 0, transform: `translate3d(0, 0, ${i * GAP + 160}px)`, offset: 0 },
            { opacity: 0, transform: `translate3d(0, 0, ${i * GAP + 160}px)`, offset: at(arrive), easing: OUT },
            { opacity: 1, transform: apart, offset: at(arrive + 560) },
            { opacity: 1, transform: apart, offset: at(hold), easing: MOVE },
            { opacity: 1, transform: "translate3d(0, 0, 0)", offset: at(len) },
            { opacity: 1, transform: "translate3d(0, 0, 0)", offset: 1 },
          ],
          { duration: total },
        ),
      );
    });
    return out;
  },
  (root, cam, start) => [
    cut(cam, start, { y: -2, z: -140, rx: 6, ry: 10, s: 0.9 }, 2, 1500),
    sweep(root, 900),
    one(root, ".ls-checks").animate(
      [
        { opacity: 0, transform: "translate3d(-80px, 12px, 180px) rotateY(16deg)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 1000, delay: 180, easing: OUT, fill: "backwards" },
    ),
    ...checks(root, false),
  ],
  (root, cam, start) => [
    cut(cam, start, { y: 2, z: -220, rx: 10, ry: -7, s: 0.88 }, 3, LENGTH[3], 0.94),
    sweep(root, 1000),
    one(root, ".ls-mark").animate(
      [
        { opacity: 0, transform: "scale(1.25) rotate(-9deg)" },
        { opacity: 1, transform: "rotate(-2deg)" },
      ],
      { duration: 360, delay: 1150, easing: OUT, fill: "backwards" },
    ),
  ],
];

/** The stacked pictures: a short flat entrance for each one. */
const flatRuns: Array<(root: HTMLElement) => Animation[]> = [
  (root) => [
    one(root, ".ls-test").animate([{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }], {
      duration: 700,
      delay: 200,
      easing: OUT,
      fill: "backwards",
    }),
    ...rows(root, ".ls-test .ls-row", 420, 70),
  ],
  (root) => {
    const len = 1300;
    const out: Animation[] = [one(root, ".ls-new").animate([{ opacity: 0 }, { opacity: 0 }], { duration: len })];
    all(root, ".ls-layer").forEach((part, i) => {
      const arrive = 100 + i * 170;
      out.push(
        part.animate(
          [
            { opacity: 0, transform: "translateY(-14px)", offset: 0 },
            { opacity: 0, transform: "translateY(-14px)", offset: arrive / len, easing: OUT },
            { opacity: 1, transform: "none", offset: Math.min(1, (arrive + 480) / len) },
            { opacity: 1, transform: "none", offset: 1 },
          ],
          { duration: len + 120 },
        ),
      );
    });
    return out;
  },
  (root) => [
    one(root, ".ls-checks").animate([{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }], {
      duration: 700,
      delay: 120,
      easing: OUT,
      fill: "backwards",
    }),
    ...checks(root, true),
  ],
  (root) => [
    one(root, ".ls-mark").animate(
      [
        { opacity: 0, transform: "scale(1.2) rotate(-8deg)" },
        { opacity: 1, transform: "rotate(-2deg)" },
      ],
      { duration: 320, delay: 200, easing: OUT, fill: "backwards" },
    ),
  ],
];

const TestCard = memo(function TestCard() {
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
});

const ChecksCard = memo(function ChecksCard() {
  return (
    <div className="ls-card ls-checks">
      <p className="ls-card-head">
        <span>Automatic checks</span>
        <span className="ls-tag ls-runs">
          <span className="ls-run-1">first run</span>
          <span className="ls-run-2">second run</span>
        </span>
      </p>
      <ul className="ls-lines">
        {checkRows.map((row) => (
          <li key={row.name} className="ls-row" data-once={row.once ? "" : undefined}>
            {row.once && (
              <>
                <span className="ls-flag" />
                <span className="ls-good" />
              </>
            )}
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
});

const Mark = memo(function Mark() {
  return (
    <p className="ls-mark">
      <Approved />
      <span>
        Approved
        <small>and merged by a person</small>
      </span>
    </p>
  );
});

const Layers = memo(function Layers() {
  return (
    <>
      {layers.map((layer, i) => (
        <span key={i} className="ls-layer" style={{ "--i": i } as CSSProperties}>
          {layer.map((p, j) => (
            <span key={j} className="ls-piece" data-wipe={p.wipe} style={pieceStyle(p)} />
          ))}
        </span>
      ))}
    </>
  );
});

/** The screen in its browser frame, with the parts that each step shows. In the `rig`, every part is mounted and each one is a direct child of the camera rig, so the 3D scene has two levels only. */
function Screen({ step, rig, play }: { step: number; rig: boolean; play: boolean }) {
  const has = (i: number) => rig || step === i;
  const parts = (
    <>
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
          {has(0) && <OldScreen shot={OLD_WEEK} className="ls-old" />}
          {(rig || step > 0) && (
            <PhonePicture src={WEEK}>
              <img className="ls-new" src={WEEK} width={1440} height={900} alt="" loading="lazy" decoding="async" />
            </PhonePicture>
          )}
          {!rig && play && step === 1 && (
            <span className="ls-layers">
              <Layers />
            </span>
          )}
          <span className="ls-clip">
            {play && has(2) && <span className="ls-scan" />}
            {rig && <span className="lc-sweep" />}
            {rig && <span className="lc-alarm" />}
          </span>
        </div>
      </div>
      {rig && <Layers />}
      {has(0) && <TestCard />}
      {has(2) && <ChecksCard />}
      {has(3) && <Mark />}
    </>
  );
  return rig ? parts : <div className="ls-body">{parts}</div>;
}

/** One settled picture under a step, for a narrow screen or reduced motion. */
function StackFigure({ step, play }: { step: number; play: boolean }) {
  const root = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const node = root.current;
    if (!node || !play) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setSeen(true);
        observer.disconnect();
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [play]);

  useEffect(() => {
    const node = root.current;
    if (!node || !seen) return;
    const run = flatRuns[step](node);
    return () => run.forEach((a) => a.cancel());
  }, [seen, step]);

  return (
    <figure className="ls" data-step={step} data-mode="stack" data-wait={play && !seen ? "" : undefined} ref={root} aria-hidden="true">
      <Screen step={step} rig={false} play={play} />
    </figure>
  );
}

/** Scroll position to step. Each step owns one snap point, 100svh apart, and the browser does the snapping. */
function useStepScroll(track: RefObject<HTMLDivElement | null>) {
  const [step, setStep] = useState(0);
  const [pinned, setPinned] = useState(false);
  const jump = useRef<number | null>(null);
  const timer = useRef(0);
  const shown = useRef(0);

  useLayoutEffect(() => {
    const node = track.current;
    if (!node) return;
    let frame = 0;
    const read = () => {
      frame = 0;
      const box = node.getBoundingClientRect();
      const unit = box.height / COUNT;
      setPinned(box.top <= 0.5 && box.bottom >= unit - 0.5);
      if (jump.current !== null) return;
      const next = Math.max(0, Math.min(COUNT - 1, Math.round(-box.top / unit)));
      // A jump of more than one step (a restored scroll place) must not paint the old step first.
      if (Math.abs(next - shown.current) > 1) flushSync(() => setStep(next));
      else setStep(next);
      shown.current = next;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    const onEnd = () => {
      if (jump.current === null) return;
      jump.current = null;
      read();
    };
    read();
    // The home can restore its scroll place a few frames after the mount. For a short time the step is read in every frame, so no frame paints a stale step.
    const until = performance.now() + 600;
    let polling = 0;
    const pollFrame = (now: number) => {
      read();
      if (now < until) polling = requestAnimationFrame(pollFrame);
    };
    polling = requestAnimationFrame(pollFrame);
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("scrollend", onEnd);
    addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(polling);
      removeEventListener("scroll", onScroll);
      removeEventListener("scrollend", onEnd);
      removeEventListener("resize", onScroll);
    };
  }, [track]);

  /** A rail click moves inside the section only. From farther away the page jumps, so a long smooth scroll never passes other sections. */
  const go = (i: number) => {
    const node = track.current;
    if (!node) return;
    const box = node.getBoundingClientRect();
    const unit = box.height / COUNT;
    const delta = box.top + i * unit;
    jump.current = i;
    shown.current = i;
    setStep(i);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => (jump.current = null), 1600);
    scrollTo({ top: scrollY + delta, behavior: Math.abs(delta) <= (COUNT - 1) * unit + 1 ? "smooth" : "instant" });
  };

  return { step, pinned, go };
}

/** The pinned scene: one large screen, one step of text at a time, a camera that moves to the part that matters. */
function Cinema() {
  const track = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const cam = useRef<HTMLDivElement>(null);
  /** True when the home comes back from a case page: the scene starts settled on its step, with no intro and no replay. */
  const [instant, setInstant] = useState(false);
  /** The home restores its scroll place a few frames after it mounts; until then the scene is not drawn. */
  const [hold, setHold] = useState(false);
  const { step, pinned, go } = useStepScroll(track);
  const [seen, setSeen] = useState(false);
  const motion = useRef<Animation[]>([]);
  const started = useRef(false);
  const shown = useRef<number | null>(null);

  useLayoutEffect(() => {
    const node = root.current;
    if (!node) return;
    if (node.closest("[data-seen]")) {
      setInstant(true);
      setHold(true);
      setSeen(true);
      const show = window.setTimeout(() => setHold(false), 150);
      const t = window.setTimeout(() => setInstant(false), 450);
      return () => {
        clearTimeout(show);
        clearTimeout(t);
      };
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setSeen(true);
        observer.disconnect();
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = root.current;
    const camera = cam.current;
    if (!node || !camera || !seen || shown.current === step) return;
    shown.current = step;
    motion.current.forEach((a) => a.cancel());
    motion.current = [];
    camera.style.transform = REST;
    const first = !started.current;
    started.current = true;
    if (instant) return;
    const start = first ? WIDE : getComputedStyle(camera).transform;
    motion.current = scene[step](node, camera, start);
    if (first) motion.current.push(one(node, ".lc-cam > .ls-frame").animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, easing: OUT }));
  }, [step, seen, instant]);

  useEffect(() => () => motion.current.forEach((a) => a.cancel()), []);

  return (
    <div className="lc-track" ref={track} style={{ "--n": COUNT } as CSSProperties}>
      {steps.map((s, i) => (
        <span key={s.name} className="lc-snap" style={{ "--i": i } as CSSProperties} />
      ))}
      <div
        className="lc-pin"
        ref={root}
        data-step={step}
        data-pinned={pinned ? "" : undefined}
        data-wait={seen ? undefined : ""}
        data-instant={instant ? "" : undefined}
        data-hold={hold ? "" : undefined}
        style={{ "--len": `${LENGTH[step]}ms` } as CSSProperties}
      >
        <div className="lc-light" aria-hidden="true">
          <i />
        </div>
        <div className="lc-bar lc-bar-top" aria-hidden="true">
          <span className="lc-label">How each new screen gets made</span>
          <span className="lc-count">
            <span className="lc-count-n">
              {steps.map((s, i) => (
                <span key={s.name} data-on={i === step ? "" : undefined}>
                  {pad(i)}
                </span>
              ))}
            </span>
            <span className="lc-count-of">/ {pad(COUNT - 1)}</span>
          </span>
        </div>
        <div className="lc-frame">
          <ol className="lc-texts">
            {steps.map((s, i) => (
              <li key={s.name} className="lc-text" data-on={i === step ? "" : undefined} data-pos={i < step ? "before" : i > step ? "after" : undefined}>
                <span className="lc-n" aria-hidden="true">
                  <span>{pad(i)}</span>
                </span>
                <h3 className="lc-title">{s.name}</h3>
                <p className="lc-line">{s.text}</p>
                {s.note && <p className="lc-note">{s.note}</p>}
              </li>
            ))}
          </ol>
          <div className="lc-view" aria-hidden="true">
            <div className="ls lc-cam" data-mode="pin" data-step={step} ref={cam}>
              <Screen step={step} rig play />
            </div>
          </div>
        </div>
        <nav className="lc-bar lc-bar-bottom" aria-label="Steps">
          <ol className="lc-rail">
            {steps.map((s, i) => (
              <li key={s.name}>
                <button
                  type="button"
                  className="lc-stop"
                  aria-current={i === step ? "step" : undefined}
                  data-past={i < step ? "" : undefined}
                  onClick={() => go(i)}
                >
                  <span className="lc-seg" aria-hidden="true">
                    <i />
                  </span>
                  <span className="lc-stop-name">
                    <span className="lc-stop-n" aria-hidden="true">
                      {pad(i)}
                    </span>
                    {s.name}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  );
}

/** The four steps. On a wide screen with motion, one pinned scene that moves one step for each snap point; otherwise, one settled picture under each step. */
export function Steps() {
  const reduce = useReducedMotion();
  const wide = useMedia("(min-width: 1024px)");
  const cinema = wide && !reduce;

  return (
    <section className="lp-steps" id="work" aria-labelledby="lp-steps-title" data-mode={cinema ? "cinema" : "stack"}>
      <div className="lp-steps-intro lp-wrap">
        <h2 className="lp-h2" id="lp-steps-title">
          How each new screen gets made
        </h2>
        <p className="lp-lead">
          The care platform is being rebuilt in React, one screen at a time. AI agents do most of the typing. Tests, checks and a person decide what
          gets in.
        </p>
      </div>
      {cinema ? (
        <Cinema />
      ) : (
        <ol className="lp-step-list lp-wrap">
          {steps.map((s, i) => (
            <li key={s.name} className="lp-step">
              <span className="lp-step-n" aria-hidden="true">
                {pad(i)}
              </span>
              <h3 className="lp-step-name">{s.name}</h3>
              <p className="lp-step-text">{s.text}</p>
              <div className="lp-step-figure">
                <StackFigure step={i} play={!reduce} />
                <p className="ls-caption">{s.caption}</p>
                {!reduce && s.note && <p className="ls-caption">{s.note}</p>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
