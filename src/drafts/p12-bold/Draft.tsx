import { memo, useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { Link } from "react-router";
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform, type MotionValue } from "motion/react";
import "./p12-bold.css";
import { apps, type AppView } from "./apps";
import Code from "./Code";
import { REAL_SCREENS, careShots } from "../../content/careShots";
import { findProject } from "../../content/projects";
import { links } from "../../content/links";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const N = apps.length;
const PAPER = "#fbf4ef";

type Platform = "ios" | "android" | "other";
function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return "android";
  if (/iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "ios";
  return "other";
}

function wrapUrl(text: string) {
  const parts = text.split(/(?<=[/?=])/);
  return parts.flatMap((part, i) => (i < parts.length - 1 ? [part, <wbr key={i} />] : [part]));
}

const Arrow = ({ down = false }: { down?: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    {down ? <path d="M7 1v12M2 8l5 5 5-5" stroke="currentColor" strokeWidth="1.6" /> : <path d="M2 12 12 2M4 2h8v8" stroke="currentColor" strokeWidth="1.6" />}
  </svg>
);

/* ---------- One drag, two controls ---------- */

interface DragOptions {
  pos: MotionValue<number>;
  axis: "x" | "y";
  /** +1: moving the pointer down or right raises the position; -1: the other way. */
  sign: 1 | -1;
  /** Pixels of pointer travel for one app. */
  unit: () => number;
  /** Touch pointers: the wheel leaves them to the page (touch-action: pan-y); the stage takes horizontal ones. */
  touch: boolean;
  onStart: () => void;
  onEnd: (i: number, velocity: number) => void;
}

/**
 * Pointer capture only after 5 px of travel, so a click still works. Under that, a gesture that goes
 * across the axis (a vertical swipe on the stage) is given back to the page. The release hands its
 * velocity to the spring. Beyond the first and last app the position stretches with friction.
 */
function usePosDrag(o: DragOptions) {
  const st = useRef<{ id: number; x: number; y: number; origin: number; unit: number; last: number; t: number; v: number; moved: boolean } | null>(null);
  const justDragged = useRef(false);
  const [dragging, setDragging] = useState(false);

  const onPointerDown = (e: ReactPointerEvent<HTMLElement>) => {
    if (e.pointerType === "touch" && !o.touch) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const along = o.axis === "x" ? e.clientX : e.clientY;
    st.current = { id: e.pointerId, x: e.clientX, y: e.clientY, origin: o.pos.get(), unit: o.unit(), last: along, t: performance.now(), v: 0, moved: false };
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    const s = st.current;
    if (!s || s.id !== e.pointerId) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    const d = o.axis === "x" ? dx : dy;
    const cross = o.axis === "x" ? dy : dx;
    if (!s.moved) {
      if (Math.abs(cross) > 8 && Math.abs(cross) > Math.abs(d)) {
        st.current = null;
        return;
      }
      if (Math.abs(d) < 5) return;
      s.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragging(true);
      o.onStart();
    }
    const along = o.axis === "x" ? e.clientX : e.clientY;
    const now = performance.now();
    s.v = (((along - s.last) / Math.max(1, now - s.t)) * 1000 * 0.6 + s.v * 0.4) * o.sign;
    s.last = along;
    s.t = now;
    let next = s.origin + (o.sign * d) / s.unit;
    if (next < 0) next *= 0.32;
    else if (next > N - 1) next = N - 1 + (next - (N - 1)) * 0.32;
    o.pos.set(next);
  };
  const finish = (e: ReactPointerEvent<HTMLElement>) => {
    const s = st.current;
    if (!s || s.id !== e.pointerId) return;
    st.current = null;
    if (!s.moved) return;
    setDragging(false);
    justDragged.current = true;
    window.setTimeout(() => {
      justDragged.current = false;
    }, 0);
    const vUnits = s.v / s.unit;
    o.onEnd(clamp(Math.round(o.pos.get() + vUnits * 0.2), 0, N - 1), vUnits);
  };

  return { handlers: { onPointerDown, onPointerMove, onPointerUp: finish, onPointerCancel: finish }, dragging, justDragged };
}

/* ---------- The wheel: a band that slides over four names ---------- */

interface WheelProps {
  index: number;
  pos: MotionValue<number>;
  onPick: (i: number, how: "key" | "pointer") => void;
  onDragStart: () => void;
  onDragEnd: (i: number, velocity: number) => void;
}

function Wheel({ index, pos, onPick, onDragStart, onDragEnd }: WheelProps) {
  const modality = useRef<"key" | "pointer">("pointer");
  const viewRef = useRef<HTMLDivElement>(null);
  const bandY = useTransform(pos, (p) => `${p * 100}%`);
  const innerY = useTransform(pos, (p) => `${(-p / N) * 100}%`);
  const { handlers, dragging, justDragged } = usePosDrag({
    pos,
    axis: "y",
    sign: 1,
    unit: () => (viewRef.current?.offsetHeight ?? 224) / N,
    touch: false,
    onStart: onDragStart,
    onEnd: onDragEnd,
  });

  return (
    <fieldset
      className="pb-wheel"
      onKeyDown={() => {
        modality.current = "key";
      }}
    >
      <legend className="pb-sr">Apps in the stores. Arrow keys change the app.</legend>
      <div
        ref={viewRef}
        className="pb-wheel-view"
        data-dragging={dragging}
        {...handlers}
        onPointerDownCapture={() => {
          modality.current = "pointer";
        }}
        onClickCapture={(e) => {
          // A drag that ends over a row must not also pick that row.
          if (justDragged.current) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        <ul className="pb-wheel-list">
          {apps.map((app, i) => (
            <li key={app.id}>
              <label className="pb-wheel-item">
                <input type="radio" name="pb-app" className="pb-sr" checked={index === i} onChange={() => onPick(i, modality.current)} />
                <span className="pb-wheel-name">{app.name}</span>
                <span className="pb-wheel-year">{app.years}</span>
              </label>
            </li>
          ))}
        </ul>
        <motion.div className="pb-wheel-band" style={{ y: bandY }} aria-hidden="true">
          <motion.ul className="pb-wheel-list pb-wheel-list--over" style={{ y: innerY }}>
            {apps.map((app) => (
              <li key={app.id} className="pb-wheel-item">
                <span className="pb-wheel-name">{app.name}</span>
                <span className="pb-wheel-year">{app.years}</span>
              </li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </fieldset>
  );
}

/* ---------- The stage: the store frames follow the wheel, and can be dragged ---------- */

const StageGroup = memo(function StageGroup({ app, i, selected, pos }: { app: AppView; i: number; selected: boolean; pos: MotionValue<number> }) {
  const opacity = useTransform(pos, (p) => clamp(1 - Math.abs(i - p) * 1.35, 0, 1));
  const x = useTransform(pos, (p) => (i - p) * 36);
  return (
    <motion.div className="pb-group" style={{ opacity, x }} aria-hidden={!selected} role="group" aria-label={`${app.name}, public store frames`}>
      {app.frames.map((f, k) => (
        <img
          key={f.src}
          className="pb-frame"
          src={f.src}
          alt={selected ? f.alt : ""}
          width={f.width}
          height={f.height}
          loading={i === 0 && k < 2 ? "eager" : "lazy"}
          fetchPriority={i === 0 && k === 0 ? "high" : "low"}
          decoding="async"
          draggable={false}
          style={{ backgroundColor: app.grounds[k] }}
        />
      ))}
    </motion.div>
  );
});

interface StageProps {
  index: number;
  pos: MotionValue<number>;
  mounted: boolean;
  onDragStart: () => void;
  onDragEnd: (i: number, velocity: number) => void;
  onStep: (dir: 1 | -1) => void;
}

function Stage({ index, pos, mounted, onDragStart, onDragEnd, onStep }: StageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { handlers, dragging } = usePosDrag({
    pos,
    axis: "x",
    sign: -1,
    unit: () => clamp((ref.current?.offsetWidth ?? 300) * 0.6, 160, 320),
    touch: true,
    onStart: onDragStart,
    onEnd: onDragEnd,
  });

  // A sideways swipe on a trackpad steps to the next app. Vertical scrolling is never touched.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let lock = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) < 8 || Math.abs(e.deltaX) < Math.abs(e.deltaY) * 1.5) return;
      e.preventDefault();
      const now = performance.now();
      if (now < lock) return;
      lock = now + 420;
      onStep(e.deltaX > 0 ? 1 : -1);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onStep]);

  return (
    <div className="pb-stage-wrap">
      <div ref={ref} className="pb-stage" data-dragging={dragging} {...handlers}>
        {apps.map((app, i) => (i === 0 || mounted ? <StageGroup key={app.id} app={app} i={i} selected={index === i} pos={pos} /> : null))}
      </div>
      <p className="pb-stage-caption">Public store frames.</p>
    </div>
  );
}

/* ---------- Facts, store buttons and codes ---------- */

function Facts({ app }: { app: AppView }) {
  return (
    <div className="pb-facts" key={app.id} aria-live="polite">
      <div className="pb-facts-head">
        <p className="pb-facts-kind">{app.kind}</p>
        <Link className="pb-facts-case pb-link pb-press" to={`/work/${app.slug}`}>
          Read the case
          <Arrow />
        </Link>
      </div>
      <p className="pb-facts-what">{app.what}</p>
      <p className="pb-facts-meta">
        {app.role}. {app.where}.
      </p>
    </div>
  );
}

function StoreButtons({ app, platform }: { app: AppView; platform: Platform }) {
  const ordered = [...app.stores].sort((a, b) => {
    const want = platform === "android" ? "Google Play" : "App Store";
    return Number(b.name === want) - Number(a.name === want);
  });
  return (
    <div className="pb-stores">
      {ordered.map((s, k) => (
        <a
          key={s.href}
          className="pb-store pb-press"
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          data-primary={platform !== "other" && k === 0 && !s.archived}
          aria-label={`${s.label}, ${app.name} (opens a new tab)`}
        >
          {s.name}
          {s.archived ? <small>archived</small> : null}
        </a>
      ))}
    </div>
  );
}

function Codes({ app, ready }: { app: AppView; ready: boolean }) {
  return (
    <div className="pb-codes">
      <p className="pb-hook" aria-live="polite">
        {app.hook}
      </p>
      {app.stores.map((s) => (
        <div className="pb-code" key={s.name}>
          <a className="pb-code-link pb-press" href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`${s.label}, ${app.name}. This code opens the same page (opens a new tab)`}>
            <Code text={s.href} ready={ready} story />
          </a>
          <span className="pb-code-label">{s.archived ? `${s.name}, archived` : s.name}</span>
          <span className="pb-url">{wrapUrl(s.printed)}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- Below the first screen ---------- */

interface Crop {
  x: number;
  y: number;
  w: number;
  h: number;
}

function CareShot() {
  const shot = careShots.claims;
  // The wide crop is for desktop. On a phone the same screen is cropped to its first card, the month and the program tabs,
  // so the text keeps about 94 percent of its size instead of 30 percent.
  const phoneCrop: Crop = { x: 262, y: 274, w: 380, h: 290 };
  const view = (crop: Crop): CSSProperties => ({
    width: `${(shot.width / crop.w) * 100}%`,
    transform: `translate(${(-crop.x / shot.width) * 100}%, ${(-crop.y / shot.height) * 100}%)`,
  });
  return (
    <figure>
      <div className="pb-shot pb-shot--wide" style={{ aspectRatio: `${shot.crop.w} / ${shot.crop.h}` }}>
        <img src={shot.src} alt={shot.alt} width={2880} height={1800} loading="lazy" decoding="async" style={view(shot.crop)} />
      </div>
      <div className="pb-shot pb-shot--phone" style={{ aspectRatio: `${phoneCrop.w} / ${phoneCrop.h}` }}>
        <img
          src={shot.src}
          alt="Claims screen: a Draft card with 7 claims and 2 updated, the month September, and the program tabs All Programs, CCM, RPM and RTM. Invented data."
          width={2880}
          height={1800}
          loading="lazy"
          decoding="async"
          style={view(phoneCrop)}
        />
      </div>
      <figcaption className="pb-small" style={{ marginTop: 8 }}>
        {REAL_SCREENS}
      </figcaption>
    </figure>
  );
}

const Work = memo(function Work() {
  const incentiv = findProject("incentiv");
  const fjale = findProject("fjale");
  const za = findProject("za");
  const morse = findProject("morse-trainer");
  const geo = findProject("geo-guesser");
  const forks = findProject("open-source-forks");
  const more: { name: string; years: string; line: string; link?: { label: string; href: string } }[] = [
    { name: "Design System v2", years: "2026", line: "A team effort on Gentrit's foundation: 36 building blocks, 20 releases in about six weeks." },
    { name: "Incentiv portal", years: "2024", line: "Built the portal frontend: sign-in, tour, dashboard cards and a balance pop-up.", link: incentiv?.links.find((l) => l.label === "Portal") },
    { name: "FJALË", years: "2026", line: "Daily Albanian word game with a 21k-word dictionary. Live.", link: fjale?.links[0] },
    { name: "Za!", years: "2026", line: "Multiplayer pizza card game for two to eight players. Live.", link: za?.links[0] },
    { name: "Morse Trainer", years: "2026", line: "Morse-code learning game that brings missed letters back sooner. Live.", link: morse?.links[0] },
    { name: "Geo Guesser World 3D", years: "2026", line: "Street-view guessing game, co-built. On Google Play.", link: geo?.links[0] },
    { name: "Open-source forks", years: "2022", line: "Keeps two open-source tools running that a reading app depends on.", link: forks?.links[0] },
  ];
  return (
    <>
      <section className="pb-section" id="work" aria-labelledby="pb-work">
        <h2 className="pb-h2" id="pb-work">
          Work
        </h2>
        <article className="pb-row">
          <CareShot />
          <div className="pb-row-copy">
            <h3 className="pb-h3">Rebuilding a live care platform, one tested screen at a time.</h3>
            <p>
              The care-management platform follows vitals, care plans, lab results, claims and calls for care teams. Its Vue app keeps running while a React version is built. A screen moves over only after the same test passes on both apps. No React screen is live yet.
            </p>
            <p className="pb-proof">One billing report now needs 2 database requests, not 16, and no longer times out.</p>
            <p className="pb-ai">Gentrit wrote most of the rules and the checks. AI agents build inside them. A person approves each change.</p>
            <p className="pb-small">Web and mobile, and since 2026 the server. 2023–26.</p>
            <Link className="pb-facts-case pb-link pb-press" to="/work/care-platform" style={{ justifySelf: "start" }}>
              Read the case
              <Arrow />
            </Link>
          </div>
        </article>
      </section>

      <section className="pb-section pb-section--tint" aria-labelledby="pb-stores">
        <div className="pb-section-inner">
          <h2 className="pb-h2" id="pb-stores">
            Apps in the stores
          </h2>
          <table className="pb-table">
            <caption className="pb-sr">The four apps on the wheel, with years, role, result and store links</caption>
            <thead>
              <tr>
                <th scope="col">App</th>
                <th scope="col">Years</th>
                <th scope="col">Role</th>
                <th scope="col">Result</th>
                <th scope="col">Open</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.id}>
                  <th scope="row">
                    <Link className="pb-link" to={`/work/${a.slug}`}>
                      {a.name}
                    </Link>
                  </th>
                  <td data-label="Years" className="pb-mono">
                    {a.years}
                  </td>
                  <td data-label="Role">{a.role}</td>
                  <td data-label="Result">{a.result}</td>
                  <td data-label="Open">
                    <span className="pb-links">
                      {a.site ? (
                        <a className="pb-link" href={a.site.href} target="_blank" rel="noopener noreferrer">
                          bayyinahtv.com
                        </a>
                      ) : null}
                      {a.stores.map((s) => (
                        <a key={s.href} className="pb-link" href={s.href} target="_blank" rel="noopener noreferrer">
                          {s.label}
                        </a>
                      ))}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="pb-small" style={{ marginTop: 16, maxWidth: "62ch" }}>
            Read to Feed kept up with its toolkit, React Native, through three major upgrades (version 0.63 to 0.81). Its store pages are removed, so the links open archived copies.
          </p>
        </div>
      </section>

      <section className="pb-section" aria-labelledby="pb-more">
        <h2 className="pb-h2" id="pb-more">
          More
        </h2>
        <ul className="pb-more">
          {more.map((m) => (
            <li key={m.name}>
              <span className="pb-more-name">{m.name}</span>
              <span className="pb-mono">{m.years}</span>
              <span>{m.line}</span>
              {m.link ? (
                <a className="pb-link" href={m.link.href} target="_blank" rel="noopener noreferrer">
                  {m.link.label}
                </a>
              ) : (
                <span />
              )}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
});

const About = memo(function About() {
  return (
    <section className="pb-section pb-section--tint" id="about" aria-labelledby="pb-about">
      <div className="pb-section-inner">
        <h2 className="pb-h2" id="pb-about">
          About
        </h2>
        <div className="pb-about">
          <p>
            Gentrit Rashiti is a frontend and mobile developer based in Kosovo, working remotely. The work runs from the first screen to the store release, in healthcare, video streaming, e-reading and Web3.
          </p>
          <p>Since 2026 it also covers the server behind the care platform. Bachelor's degree, UBT.</p>
          <p className="pb-small">React, React Native, Vue, TypeScript, Laravel.</p>
        </div>
      </div>
    </section>
  );
});

const Foot = memo(function Foot() {
  return (
    <footer className="pb-foot">
      <a className="pb-foot-email pb-link" href={`mailto:${links.email}`}>
        {links.email}
      </a>
      <div className="pb-foot-links">
        <a className="pb-link" href={links.cv} target="_blank" rel="noopener noreferrer">
          CV
        </a>
        <a className="pb-link" href={links.github} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <a className="pb-link" href={links.linkedin} target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
      </div>
    </footer>
  );
});

/* ---------- The page ---------- */

export default function Draft() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const pos = useMotionValue(0);
  const anim = useRef<{ stop: () => void } | null>(null);
  const dragging = useRef(false);
  const [ready, setReady] = useState(false);
  const [fontsIn, setFontsIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [platform, setPlatform] = useState<Platform>("other");
  const app = apps[index];

  useEffect(() => {
    setPlatform(detectPlatform());
    // The host page is dark. Overscroll and the browser bar on a phone show the document, not this page.
    const html = document.documentElement;
    const body = document.body;
    const before = [html.style.backgroundColor, body.style.backgroundColor];
    html.style.backgroundColor = PAPER;
    body.style.backgroundColor = PAPER;
    // The browser bar takes the first theme-color it finds; the host sets one, so change that one and put it back on leaving.
    const metas = Array.from(document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]'));
    const beforeMetas = metas.map((m) => m.content);
    let added: HTMLMetaElement | null = null;
    if (metas.length) metas.forEach((m) => (m.content = PAPER));
    else {
      added = document.createElement("meta");
      added.name = "theme-color";
      added.content = PAPER;
      document.head.appendChild(added);
    }
    let alive = true;
    // Hold the first paint until the display and text faces are in (never longer than 700 ms), so the claim does not reflow.
    const fonts = (document as Document & { fonts?: { load: (f: string) => Promise<unknown>; ready: Promise<unknown> } }).fonts;
    const loaded = fonts ? Promise.all([fonts.load('800 56px "PB Display"'), fonts.load('400 17px "PB Text"'), fonts.ready]) : Promise.resolve();
    const go = () => {
      if (!alive) return;
      setFontsIn(true);
      requestAnimationFrame(() => alive && setReady(true));
    };
    Promise.race([loaded, new Promise((r) => window.setTimeout(r, 700))]).then(go, go);
    const t = window.setTimeout(() => alive && setMounted(true), 500);
    return () => {
      alive = false;
      window.clearTimeout(t);
      html.style.backgroundColor = before[0];
      body.style.backgroundColor = before[1];
      metas.forEach((m, i) => (m.content = beforeMetas[i]));
      added?.remove();
    };
  }, []);

  const select = useCallback((i: number) => {
    indexRef.current = i;
    setIndex(i);
  }, []);

  const goTo = useCallback(
    (i: number, how: "key" | "pointer", velocity = 0) => {
      anim.current?.stop();
      select(i);
      if (how === "key" || reduce) pos.set(i);
      else anim.current = animate(pos, i, { type: "spring", stiffness: 600, damping: 40, velocity });
    },
    [reduce, select, pos],
  );

  // While a finger or pointer drags, the selection follows the nearest app.
  useMotionValueEvent(pos, "change", (v) => {
    if (!dragging.current) return;
    const i = clamp(Math.round(v), 0, N - 1);
    if (i !== indexRef.current) select(i);
  });

  const onDragStart = useCallback(() => {
    anim.current?.stop();
    dragging.current = true;
  }, []);
  const onDragEnd = useCallback(
    (i: number, velocity: number) => {
      dragging.current = false;
      goTo(i, "pointer", velocity);
    },
    [goTo],
  );
  const onStep = useCallback(
    (dir: 1 | -1) => {
      goTo(clamp(indexRef.current + dir, 0, N - 1), "pointer");
    },
    [goTo],
  );

  return (
    <div className="pb-root" data-fonts={fontsIn ? "in" : "wait"} style={{ "--pb-app": app.accent } as CSSProperties}>
      <title>Gentrit Rashiti, phone and web apps</title>
      <meta name="description" content="Gentrit Rashiti builds the phone and web apps that shoppers, readers and care teams use. Scan a code to open the real app in your store." />
      <main>
        <section className="pb-first" aria-label="Introduction">
          <nav className="pb-nav" aria-label="Main">
            <a href="#work" className="pb-nav-link">
              <span>Work</span>
            </a>
            <a href="#about" className="pb-nav-link">
              <span>About</span>
            </a>
            <a href={links.cv} className="pb-nav-link" target="_blank" rel="noopener noreferrer">
              <span>CV</span>
            </a>
            <a href={`mailto:${links.email}`} className="pb-nav-link">
              <span>Email</span>
            </a>
          </nav>

          <div className="pb-copy">
            <h1 className="pb-claim">Gentrit Rashiti builds the phone and web apps that shoppers, readers and care teams use.</h1>
            <p className="pb-line">Frontend and mobile developer since 2021, full stack since 2026. Kosovo, remote.</p>
          </div>

          <Wheel index={index} pos={pos} onPick={goTo} onDragStart={onDragStart} onDragEnd={onDragEnd} />
          <StoreButtons app={app} platform={platform} />
          <Stage index={index} pos={pos} mounted={mounted} onDragStart={onDragStart} onDragEnd={onDragEnd} onStep={onStep} />
          <Facts app={app} />
          <Codes app={app} ready={ready} />
        </section>

        <Work />
        <About />
      </main>
      <Foot />
    </div>
  );
}
