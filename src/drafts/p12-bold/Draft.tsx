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

/* ---------- The wheel: a band that slides over four names ---------- */

interface WheelProps {
  index: number;
  pos: MotionValue<number>;
  onPick: (i: number, how: "key" | "pointer") => void;
  onDrag: (state: "start" | "end", i?: number, velocity?: number) => void;
}

function Wheel({ index, pos, onPick, onDrag }: WheelProps) {
  const modality = useRef<"key" | "pointer">("pointer");
  const drag = useRef<{ id: number; start: number; origin: number; rowPx: number; lastY: number; lastT: number; v: number; moved: boolean } | null>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const bandY = useTransform(pos, (p) => `${p * 100}%`);
  const innerY = useTransform(pos, (p) => `${(-p / N) * 100}%`);

  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
    modality.current = "pointer";
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const rowPx = (viewRef.current?.offsetHeight ?? 240) / N;
    drag.current = { id: e.pointerId, start: e.clientY, origin: pos.get(), rowPx, lastY: e.clientY, lastT: performance.now(), v: 0, moved: false };
  };
  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = drag.current;
    if (!s || s.id !== e.pointerId) return;
    const dy = e.clientY - s.start;
    if (!s.moved) {
      if (Math.abs(dy) < 5) return;
      s.moved = true;
      viewRef.current?.setPointerCapture(e.pointerId);
      setDragging(true);
      onDrag("start");
    }
    const now = performance.now();
    const dt = Math.max(1, now - s.lastT);
    s.v = ((e.clientY - s.lastY) / dt) * 1000 * 0.6 + s.v * 0.4;
    s.lastY = e.clientY;
    s.lastT = now;
    let next = s.origin + dy / s.rowPx;
    if (next < 0) next *= 0.32;
    else if (next > N - 1) next = N - 1 + (next - (N - 1)) * 0.32;
    pos.set(next);
  };
  const up = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = drag.current;
    if (!s || s.id !== e.pointerId) return;
    if (!s.moved) {
      drag.current = null;
      return;
    }
    setDragging(false);
    const vRows = s.v / s.rowPx;
    const i = clamp(Math.round(pos.get() + vRows * 0.2), 0, N - 1);
    onDrag("end", i, vRows);
    // Keep the flag for this event loop turn so the click that follows a drag is ignored.
    window.setTimeout(() => {
      drag.current = null;
    }, 0);
  };

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
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onClickCapture={(e) => {
          // A drag that ends over a row must not also pick that row.
          if (drag.current?.moved) {
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

/* ---------- The stage: the store frames follow the wheel ---------- */

const StageGroup = memo(function StageGroup({ app, i, selected, pos }: { app: AppView; i: number; selected: boolean; pos: MotionValue<number> }) {
  const opacity = useTransform(pos, (p) => clamp(1 - Math.abs(i - p) * 1.35, 0, 1));
  const y = useTransform(pos, (p) => (i - p) * 30);
  return (
    <motion.div className="pb-group" style={{ opacity, y }} aria-hidden={!selected} role="group" aria-label={`${app.name}, public store frames`}>
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
        />
      ))}
    </motion.div>
  );
});

function Stage({ index, pos, mounted }: { index: number; pos: MotionValue<number>; mounted: boolean }) {
  return (
    <div className="pb-stage-wrap">
      <div className="pb-stage">
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
        {app.role}. {app.where}. {app.builtWith}.
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

function CareShot() {
  const shot = careShots.claims;
  const { crop } = shot;
  const imgStyle: CSSProperties = {
    width: `${(shot.width / crop.w) * 100}%`,
    transform: `translate(${(-crop.x / shot.width) * 100}%, ${(-crop.y / shot.height) * 100}%)`,
  };
  return (
    <figure>
      <div className="pb-shot" style={{ aspectRatio: `${crop.w} / ${crop.h}` }}>
        <img src={shot.src} alt={shot.alt} width={2880} height={1800} loading="lazy" decoding="async" style={imgStyle} />
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
    { name: "Design System v2", years: "2026", line: "36 building blocks for screens, shipped in 20 releases over about six weeks." },
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
            <h3 className="pb-h3">Care teams keep using the app while each screen moves over.</h3>
            <p>
              The care-management platform follows vitals, care plans, lab results, claims and calls for care teams. Its Vue app is being rebuilt in React, one screen at a time. A screen moves only after the same test passes on both apps.
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
            <caption className="pb-sr">The four apps on the wheel, with years, role, platforms and store links</caption>
            <thead>
              <tr>
                <th scope="col">App</th>
                <th scope="col">Years</th>
                <th scope="col">Role</th>
                <th scope="col">Where</th>
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
                  <td data-label="Where">{a.where}</td>
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
  const [mounted, setMounted] = useState(false);
  const [platform, setPlatform] = useState<Platform>("other");
  const app = apps[index];

  useEffect(() => {
    setPlatform(detectPlatform());
    let alive = true;
    const fonts = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts;
    const go = () => alive && requestAnimationFrame(() => alive && setReady(true));
    (fonts ? fonts.ready : Promise.resolve()).then(go, go);
    const t = window.setTimeout(() => alive && setMounted(true), 500);
    return () => {
      alive = false;
      window.clearTimeout(t);
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

  // While a finger or pointer drags the band, the selection follows the nearest row.
  useMotionValueEvent(pos, "change", (v) => {
    if (!dragging.current) return;
    const i = clamp(Math.round(v), 0, N - 1);
    if (i !== indexRef.current) select(i);
  });

  const onDrag = useCallback(
    (state: "start" | "end", i?: number, velocity = 0) => {
      anim.current?.stop();
      if (state === "start") dragging.current = true;
      else {
        dragging.current = false;
        goTo(i ?? indexRef.current, "pointer", velocity);
      }
    },
    [goTo],
  );

  return (
    <div className="pb-root" style={{ "--pb-app": app.accent } as CSSProperties}>
      <title>Gentrit Rashiti, phone and web apps</title>
      <meta name="description" content="Gentrit Rashiti builds the phone and web apps that shoppers, readers and care teams use. Scan a code to open the real app in your store." />
      <main>
        <section className="pb-first" aria-label="Introduction">
          <nav className="pb-nav" aria-label="Main">
            <a href="#work" className="pb-link">
              Work
            </a>
            <a href="#about" className="pb-link">
              About
            </a>
            <a href={links.cv} className="pb-link" target="_blank" rel="noopener noreferrer">
              CV
            </a>
            <a href={`mailto:${links.email}`} className="pb-link">
              Email
            </a>
          </nav>

          <div className="pb-copy">
            <h1 className="pb-claim">Gentrit Rashiti builds the phone and web apps that shoppers, readers and care teams use.</h1>
            <p className="pb-line">Frontend and mobile developer since 2021, based in Kosovo, working remotely.</p>
          </div>

          <Wheel index={index} pos={pos} onPick={goTo} onDrag={onDrag} />
          <StoreButtons app={app} platform={platform} />
          <Stage index={index} pos={pos} mounted={mounted} />
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
