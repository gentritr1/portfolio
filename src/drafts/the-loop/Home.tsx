import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { Link } from "react-router";
import { BrowserFrame } from "../../components/BrowserFrame";
import { PhoneFrame } from "../../components/PhoneFrame";
import { links } from "../../content/links";
import { Slab } from "./Slab";
import { Above } from "./Above";
import { Boards } from "./Boards";
import { breadth, learned, own, phones, serverProof, type Own } from "./data";
import { Explode } from "./Explode";
import { Handoff } from "./Handoff";
import { HeroBuild } from "./HeroBuild";
import { Lamp } from "./LampMark";
import { Settled, useReducedMotion, useReveal } from "./hooks";
import { useCursorLight } from "./cursor";
import { Checked, Next, Out } from "./icons";
import { Queries } from "./Queries";
import { ROOM_QUERY } from "./room";

const REDUCE = "(prefers-reduced-motion: reduce)";

type Side = "center" | "left" | "right";

/** The chapters of the home, in order. `side` is where the screen stands, so the room's light stands behind it. */
const chapters: Array<{ id: string; name: string; side: Side }> = [
  { id: "ai", name: "AI engineering", side: "right" },
  { id: "design-system", name: "Design System", side: "right" },
  { id: "server", name: "Server work", side: "right" },
  { id: "mobile", name: "Mobile apps", side: "left" },
  { id: "web3", name: "Web3", side: "right" },
  { id: "own", name: "Own projects", side: "left" },
  { id: "range", name: "Range", side: "center" },
];

const sideOf = (at: string) => (at === "contact" ? "out" : (chapters.find((c) => c.id === at)?.side ?? "center"));

/** The chapter that crosses the middle of the screen. */
function useCurrent(root: RefObject<HTMLElement | null>) {
  const [at, setAt] = useState("hero");
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setAt((entry.target as HTMLElement).dataset.chapter ?? "hero");
      },
      { rootMargin: "-45% 0px -54% 0px" },
    );
    node.querySelectorAll("[data-chapter]").forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [root]);
  return at;
}

/** The top lamp turns to the current chapter's title; on the hero it keeps its light from the top left. */
const toTitle = (at: string) => (at === "hero" ? null : document.querySelector(`[data-chapter="${at}"] h2`));
/** The index lamp turns to the current chapter's name in the index. */
const toName = (at: string) => document.querySelector(`.lp-index a[href="#ch-${at}"]`);

function Top({ at }: { at: string }) {
  return (
    <header className="lp-top lp-wrap">
      <p className="lp-name">
        <Lamp at={at} target={toTitle} className="lp-lamp-top" />
        <strong>Gentrit Rashiti</strong>
      </p>
      <nav className="lp-nav" aria-label="Main">
        <a className="lp-link" href="#ch-ai">
          Work
        </a>
        <a className="lp-link" href={links.cv}>
          CV
        </a>
        <a className="lp-link" href={`mailto:${links.email}`}>
          Email
        </a>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="lp-hero lp-wrap" data-chapter="hero" aria-labelledby="lp-hero-line">
      <HeroBuild />
      <h1 className="lp-display" id="lp-hero-line">
        AI agents build inside tested rules. A person approves every change.
      </h1>
      <p className="lp-role">Web, mobile and server apps, from Kosovo.</p>
    </section>
  );
}

function Chapter({
  id,
  n,
  kicker,
  title,
  children,
  figure,
  after,
}: {
  id: string;
  n: number;
  kicker: string;
  title: string;
  children: ReactNode;
  figure?: ReactNode;
  after?: ReactNode;
}) {
  return (
    <section id={`ch-${id}`} data-chapter={id} className={`lp-ch lp-ch-${id}`} aria-labelledby={`lp-ch-${id}-title`}>
      <div className="lp-wrap lp-ch-grid">
        <div className="lp-ch-text">
          <p className="lp-ch-kicker">
            <span className="lp-ch-n">{String(n).padStart(2, "0")}</span>
            {kicker}
          </p>
          <h2 className="lp-h2" id={`lp-ch-${id}-title`}>
            {title}
          </h2>
          {children}
        </div>
        {figure && <div className="lp-ch-figure">{figure}</div>}
      </div>
      {after}
    </section>
  );
}

function Proofs({ lines }: { lines: string[] }) {
  return (
    <ul className="lp-ch-proofs">
      {lines.map((line) => (
        <li key={line} data-reveal="">
          <Checked />
          {line}
        </li>
      ))}
    </ul>
  );
}

function More({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link className="lp-cta" to={to} state={{ fromHome: true }}>
      {children}
      <Next />
    </Link>
  );
}

function Pill({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="lp-pill-link" href={href} target="_blank" rel="noreferrer">
      {children}
      <Out />
    </a>
  );
}

function Ai() {
  return (
    <Chapter
      id="ai"
      n={1}
      kicker="AI engineering"
      title="AI engineering, kept in control"
      figure={
        <figure>
          <Explode />
          <figcaption className="lp-caption">
            The new calendar screen of the care platform, taken apart into its layers. Real screen, invented data.
          </figcaption>
        </figure>
      }
    >
      <p className="lp-ch-line">
        AI agents do most of the typing on a care platform rebuild. Written rules, tests and automatic checks set the limits, and a person approves
        every change.
      </p>
      <Proofs
        lines={[
          "One screen went from first note to merged in one working day.",
          "The same test passed on the old app and the new app.",
          "Each check has a test that feeds it bad work and expects it to fail.",
        ]}
      />
      <More to="/drafts/the-loop/workflow">How the workflow works</More>
    </Chapter>
  );
}

const dsFigures = [
  { value: "41", label: "components" },
  { value: "868", label: "design values" },
  { value: "22", label: "releases in 60 days" },
];

function DesignSystem() {
  return (
    <Chapter id="design-system" n={2} kicker="Design System v2, 2026" title="One set of parts for every new screen" figure={<Boards />}>
      <p className="lp-ch-line">
        A React library of buttons, forms and date pickers for the new care app. Every part reads one set of design values, and a real browser checks
        contrast and pixels before each release.
      </p>
      <dl className="lp-figures">
        {dsFigures.map((f) => (
          <div key={f.label} data-reveal="">
            <dt>{f.label}</dt>
            <dd>{f.value}</dd>
          </div>
        ))}
      </dl>
      <More to="/drafts/the-loop/design-system">The Design System story</More>
    </Chapter>
  );
}

function Server() {
  return (
    <Chapter
      id="server"
      n={3}
      kicker="Node.js and Laravel"
      title="Server work, a skill we grow"
      figure={<Queries />}
      after={
        <figure className="lp-wrap lp-za">
          <Slab>
            <BrowserFrame
              src="/personal/shots/za-table-two-seats.webp"
              width={1440}
              height={445}
              label="za-game.onrender.com"
              site
              tone="dark"
              alt="Two browser windows at the same Za! table. Left: one player's turn, with nine cards face up. Right: another player's view, with seven different cards face up. Each window shows the other players only as card counts."
            >
              <span className="room-sheen" aria-hidden="true" />
            </BrowserFrame>
          </Slab>
          <figcaption className="lp-caption">
            Two players at one live Za! table. Each screen shows its own cards; every other hand is only a count, because the server sends each seat
            only what it may see.
          </figcaption>
        </figure>
      }
    >
      <p className="lp-ch-line">
        We build servers in Node.js and Laravel. We also find serious bugs and fix them. Each fix comes with a test that fails without it.
      </p>
      <Proofs lines={serverProof} />
      <ul className="lp-links">
        <li>
          <Pill href="https://za-game.vercel.app/">Play Za!</Pill>
        </li>
        <li>
          <Pill href="https://github.com/gentritr1/za-game">Za! on GitHub</Pill>
        </li>
      </ul>
    </Chapter>
  );
}

function Mobile() {
  return (
    <Chapter
      id="mobile"
      n={4}
      kicker="Mobile, 2021 to 2026"
      title="Apps for iPhone and Android"
      figure={
        <div className="lp-phones">
          {phones.map((p, i) => (
            <figure key={p.src} className="lp-phone">
              <Slab from={i === 0 ? { x: -6, z: -220, ry: 14 } : { x: 6, z: -220, ry: -14 }} delay={i * 90} lift>
                <PhoneFrame src={p.src} alt={p.alt} />
              </Slab>
              <figcaption className="lp-caption">{p.app}</figcaption>
            </figure>
          ))}
        </div>
      }
    >
      <p className="lp-ch-line">
        Store apps for reading, shopping and learning, each built once for both phones: Read to Feed, Viva Fresh, Dukagjini Bookstore and Bayyinah TV.
      </p>
      <More to="/drafts/the-loop/bayyinah-tv">Read the Bayyinah TV story</More>
    </Chapter>
  );
}

function Web3() {
  return (
    <Chapter
      id="web3"
      n={5}
      kicker="Web3, Incentiv, 2024"
      title="A wallet you open with a passkey"
      figure={
        <figure>
          <Slab from={{ x: 6, z: -300, ry: -10 }}>
            <BrowserFrame
              src="/showcase/incentiv/web-03.webp"
              alt="Incentiv portal sign-in: Welcome to Incentiv, with passkey, MetaMask and WalletConnect buttons."
              label="portal.incentiv.io"
              site
              tone="dark"
            >
              <span className="room-sheen" aria-hidden="true" />
            </BrowserFrame>
          </Slab>
          <figcaption className="lp-caption">The public sign-in screen of the portal.</figcaption>
        </figure>
      }
    >
      <p className="lp-ch-line">
        People sign in to an on-chain wallet with a passkey instead of a password. Then they see their balances and rewards. The team built the
        portal screens. Other people on the project built the wallet itself.
      </p>
      <ul className="lp-links">
        <li>
          <Pill href="https://portal.incentiv.io/">Portal</Pill>
        </li>
      </ul>
    </Chapter>
  );
}

function Shot({ p, big }: { p: Own; big?: boolean }) {
  return (
    <div className="lp-own-shot">
      <img
        src={p.shot.src}
        srcSet={`${p.shot.small} 1080w, ${p.shot.src} 2880w`}
        sizes={big ? "(min-width: 1024px) 58vw, calc(100vw - 32px)" : "(min-width: 1024px) 30vw, calc(100vw - 32px)"}
        width={1440}
        height={900}
        alt={p.shot.alt}
        loading="lazy"
        decoding="async"
      />
      {big && <span className="room-sheen" aria-hidden="true" />}
    </div>
  );
}

function OwnTile({ p, big }: { p: Own; big?: boolean }) {
  return (
    <article className="lp-own" data-big={big ? "" : undefined} aria-labelledby={`lp-own-${p.id}`}>
      {big ? (
        <Slab lift>
          <Shot p={p} big />
        </Slab>
      ) : (
        <div className="lp-own-lift" data-reveal="">
          <Shot p={p} />
        </div>
      )}
      <h3 className="lp-own-name" id={`lp-own-${p.id}`}>
        {p.name}
      </h3>
      <p>{p.line}</p>
      {p.role && <p className="lp-muted">{p.role}</p>}
      {p.link ? (
        <a className="lp-link lp-own-link" href={p.link.href} target="_blank" rel="noreferrer">
          {p.link.label}
          <Out />
        </a>
      ) : (
        <p className="lp-muted lp-own-link">Private code. No public link.</p>
      )}
    </article>
  );
}

function Personal() {
  const [first, ...rest] = own;
  return (
    <Chapter id="own" n={6} kicker="Made outside work" title="Own projects">
      <p className="lp-ch-line">Products and experiments. AI agents helped build most of them.</p>
      <div className="lp-own-grid">
        <OwnTile p={first} big />
        {rest.map((p) => (
          <OwnTile key={p.id} p={p} />
        ))}
      </div>
    </Chapter>
  );
}

function Range() {
  return (
    <Chapter id="range" n={7} kicker="Range and fast learning" title="Many fields, three platforms">
      <div className="lp-table-wrap">
        <table className="lp-table">
          <thead>
            <tr>
              <td />
              {breadth.columns.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {breadth.rows.map((r, i) => (
              <tr key={r.domain} data-reveal="" style={{ transitionDelay: `${i * 60}ms` }}>
                <th scope="row">{r.domain}</th>
                {r.cells.map((c, k) => (
                  <td key={k} data-col={breadth.columns[k]}>
                    {c ?? (
                      <>
                        <span className="lp-none" aria-hidden="true" />
                        <span className="lp-sr">None yet</span>
                      </>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="lp-learned" data-reveal="">
        <h3 className="lp-h3">New skills, by year</h3>
        <ul>
          {learned.map((l) => (
            <li key={l.what}>
              <span className="lp-when">{l.when}</span>
              {l.what}
            </li>
          ))}
        </ul>
      </div>
    </Chapter>
  );
}

function Contact() {
  return (
    <footer className="lp-foot" id="contact" data-chapter="contact">
      <div className="lp-wrap">
        <p className="lp-ch-kicker">
          <span className="lp-ch-n">08</span>
          Contact
        </p>
        <p className="lp-foot-line">Gentrit Rashiti builds web, mobile and server apps, from Kosovo.</p>
        <ul className="lp-links">
          <li>
            <a className="lp-pill-link" href={`mailto:${links.email}`}>
              {links.email}
            </a>
          </li>
          <li>
            <a className="lp-pill-link" href={links.cv}>
              CV (PDF)
            </a>
          </li>
          <li>
            <Pill href={links.github}>GitHub</Pill>
          </li>
        </ul>
      </div>
    </footer>
  );
}

/** The room index: the chapter names at the right edge on a wide screen. A click scrolls to the chapter. */
function Index({ at }: { at: string }) {
  const reduce = useReducedMotion();
  const show = at !== "hero";
  return (
    <nav className="lp-index" aria-label="Chapters" data-show={show ? "" : undefined} inert={!show}>
      <Lamp at={at} target={toName} className="lp-lamp-index" />
      <ol>
        {chapters.map((c) => (
          <li key={c.id}>
            <a
              href={`#ch-${c.id}`}
              aria-current={c.id === at ? "true" : undefined}
              onClick={(event) => {
                event.preventDefault();
                document.getElementById(`ch-${c.id}`)?.scrollIntoView({ behavior: reduce ? "instant" : "smooth" });
              }}
            >
              {c.name}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

let homeSeen = false;

export function Home() {
  const root = useRef<HTMLDivElement>(null);
  const [seen] = useState(() => homeSeen);
  const [handoff] = useState(() => window.matchMedia(ROOM_QUERY).matches && !window.matchMedia(REDUCE).matches);
  const at = useCurrent(root);
  useReveal(root);
  useCursorLight(root);
  useEffect(
    () => () => {
      homeSeen = true;
    },
    [],
  );
  return (
    <Settled.Provider value={seen}>
      <div ref={root} className="lp-home" data-seen={seen ? "" : undefined}>
        <title>Gentrit Rashiti: web, mobile and server apps, built with AI kept in control</title>
        <div className="lp-room-light" data-at={sideOf(at)} aria-hidden="true">
          <i />
        </div>
        <Top at={at} />
        <main>
          <Hero />
          {handoff && <Handoff seen={seen} />}
          <Ai />
          <DesignSystem />
          <Server />
          <Mobile />
          <Web3 />
          <Personal />
          <Range />
          <Above />
        </main>
        <Contact />
        <Index at={at} />
      </div>
    </Settled.Provider>
  );
}
