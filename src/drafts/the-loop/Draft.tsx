import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link, useLocation } from "react-router";
import { BrowserFrame } from "../../components/BrowserFrame";
import { links } from "../../content/links";
import { BayyinahCase } from "./BayyinahCase";
import { CareCase } from "./CareCase";
import { apps, breadth, learned, own, ringProof, type Own } from "./data";
import { DsCase } from "./DsCase";
import { HeroBuild } from "./HeroBuild";
import { useReveal } from "./hooks";
import { Checked, Next, Out } from "./icons";
import { Ring } from "./Ring";
import { Steps } from "./Steps";
import "./the-loop.css";

function Top() {
  return (
    <header className="lp-top lp-wrap">
      <p className="lp-name">
        <strong>Gentrit Rashiti</strong> builds web and mobile apps, from Kosovo.
      </p>
      <nav className="lp-nav" aria-label="Contact">
        <a className="lp-link" href="#work">
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
    <section className="lp-hero lp-wrap" aria-labelledby="lp-hero-line">
      <HeroBuild />
      <h1 className="lp-display" id="lp-hero-line">
        AI agents build inside tested rules. A person approves every change.
      </h1>
    </section>
  );
}

function Day() {
  return (
    <section className="lp-day-section lp-wrap" aria-labelledby="lp-day-title">
      <h2 className="lp-h2" id="lp-day-title">
        The loop on a real day
      </h2>
      <p className="lp-lead">One screen of the care platform, the patient compliance list, on 8 September 2026. Each step shows real text from that day.</p>
      <Ring />
      <ul className="lp-proofs">
        {ringProof.map((p) => (
          <li key={p} data-reveal="">
            <Checked />
            {p}
          </li>
        ))}
      </ul>
      <p className="lp-proofs-rule">A check is trusted only after it is shown to fail.</p>
      <Link className="lp-cta" to="/drafts/the-loop/care-platform" state={{ fromHome: true }}>
        Read the care platform story
        <Next />
      </Link>
    </section>
  );
}

const numbers = [
  { value: "41", label: "components" },
  { value: "868", label: "design values in three levels" },
  { value: "22", label: "releases in about 8.5 weeks" },
  { value: "96.6%", label: "less JavaScript on a page that uses only a button" },
];

function DesignSystem() {
  return (
    <section className="lp-ds lp-wrap" aria-labelledby="lp-ds-title">
      <div className="lp-ds-text">
        <p className="lp-kicker">Design System v2, 2026</p>
        <h2 className="lp-h2" id="lp-ds-title">
          One set of parts for every new screen
        </h2>
        <p className="lp-body">
          Each new screen needs the same buttons, menus and forms. The old app had many copies of each. The team studied five leading design systems
          first: Material, Carbon, Polaris, Atlassian and Primer. The findings became guides for AI agents. The guides advise. Automatic checks
          decide. A person approves.
        </p>
      </div>
      <figure className="lp-ds-main" data-reveal="">
        <BrowserFrame
          src="/showcase/design-system/storybook-from-to.webp"
          alt="Design System v2 in its Storybook: the list of components on the left, and two date pickers, From and To, with June 2026 open and June 8 selected."
          label="Design System v2, Storybook"
          tone="light"
        />
        <figcaption className="lp-caption">The date picker in the design system's Storybook. Real screen.</figcaption>
      </figure>
      <dl className="lp-numbers">
        {numbers.map((n) => (
          <div key={n.label} data-reveal="">
            <dt>{n.label}</dt>
            <dd>{n.value}</dd>
          </div>
        ))}
      </dl>
      <figure className="lp-ds-badges" data-reveal="">
        <img
          src="/showcase/design-system/status-badges-crop.webp"
          width={888}
          height={600}
          loading="lazy"
          decoding="async"
          alt="Status badges in the design system: one colour family for each meaning, from Active and Approved to Pending approval, Rejected, Scheduled, Draft, Transferred and Prior episode."
        />
        <figcaption className="lp-caption">One colour family for each status meaning.</figcaption>
      </figure>
      <figure className="lp-check" data-reveal="">
        <div className="lp-check-rows">
          {[
            ["Expected", "/showcase/design-system/check-expected.webp"],
            ["After a one-step colour change", "/showcase/design-system/check-actual.webp"],
            ["What the check found", "/showcase/design-system/check-diff.webp"],
          ].map(([label, src], i) => (
            <div key={label} className="lp-check-row" style={{ "--i": i } as CSSProperties}>
              <p>{label}</p>
              <img src={src} width={588} height={104} loading="lazy" decoding="async" alt={i === 2 ? "The difference image: only the first button is marked." : ""} />
            </div>
          ))}
        </div>
        <figcaption className="lp-caption">
          A test changes the colour of one button by one step, on purpose. The picture check must fail, and it does. This proves the check works.
        </figcaption>
      </figure>
      <Link className="lp-cta" to="/drafts/the-loop/design-system" state={{ fromHome: true }}>
        Read the design system story
        <Next />
      </Link>
    </section>
  );
}

function Mobile() {
  return (
    <section className="lp-mobile lp-wrap" aria-labelledby="lp-mobile-title">
      <h2 className="lp-h2" id="lp-mobile-title">
        Apps for iPhone and Android
      </h2>
      <p className="lp-lead">Store apps for reading, shopping and learning, each built once for both phones.</p>
      <div className="lp-apps">
        {apps.map((a) => (
          <article key={a.name} className="lp-app" aria-labelledby={`lp-app-${a.name}`}>
            <div className="lp-app-shots" data-reveal="">
              {a.shots.map((s) => (
                <img key={s.src} src={s.src} alt={s.alt} width={780} height={1689} loading="lazy" decoding="async" />
              ))}
            </div>
            <div className="lp-app-text">
              <h3 className="lp-h3" id={`lp-app-${a.name}`}>
                {a.name}
                <span className="lp-years">{a.years}</span>
              </h3>
              <p>{a.line}</p>
              <p>{a.built}</p>
              <p className="lp-result">{a.result}</p>
              {a.name === "Bayyinah TV" && (
                <Link className="lp-cta" to="/drafts/the-loop/bayyinah-tv" state={{ fromHome: true }}>
                  Read the story
                  <Next />
                </Link>
              )}
              <ul className="lp-links">
                {a.links.map((l) => (
                  <li key={l.href}>
                    <a className="lp-pill-link" href={l.href} target="_blank" rel="noreferrer">
                      {l.label}
                      <Out />
                    </a>
                  </li>
                ))}
              </ul>
              <details className="lp-eng">
                <summary>For engineers</summary>
                <ul>
                  {a.engineers.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </details>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Wallet() {
  return (
    <section className="lp-wallet lp-wrap" aria-labelledby="lp-wallet-title">
      <div className="lp-wallet-text">
        <p className="lp-kicker">Incentiv, 2024</p>
        <h2 className="lp-h2" id="lp-wallet-title">
          A wallet you open with a passkey
        </h2>
        <p className="lp-body">
          The portal lets people sign in to an on-chain wallet with a passkey, with no password, or with a wallet they already have. Then they see
          their balances and rewards. On-chain wallets are hard for new users. The portal team built the screens: sign-in, a first-run tour,
          dashboard cards, an asset list and a balance pop-up with a QR code. Other teammates built the wallet itself.
        </p>
        <p className="lp-result">Built in 2024, in English and French. The dashboard pages stay private, behind sign-in.</p>
        <ul className="lp-links">
          <li>
            <a className="lp-pill-link" href="https://portal.incentiv.io/" target="_blank" rel="noreferrer">
              Portal
              <Out />
            </a>
          </li>
        </ul>
        <details className="lp-eng">
          <summary>For engineers</summary>
          <ul>
            <li>Next.js 14 App Router, React 18, TypeScript</li>
            <li>Redux Toolkit with RTK Query</li>
            <li>next-intl, Framer Motion, Tailwind, ApexCharts</li>
          </ul>
        </details>
      </div>
      <figure className="lp-wallet-shot" data-reveal="">
        <BrowserFrame
          src="/showcase/incentiv/web-03.webp"
          alt="Incentiv portal sign-in: Welcome to Incentiv, with passkey, MetaMask and WalletConnect buttons."
          label="portal.incentiv.io"
          site
          tone="dark"
        />
        <figcaption className="lp-caption">The public sign-in screen of the portal.</figcaption>
      </figure>
    </section>
  );
}

function OwnTile({ p, big }: { p: Own; big?: boolean }) {
  return (
    <article className="lp-own" data-big={big ? "" : undefined} aria-labelledby={`lp-own-${p.id}`}>
      <div className="lp-own-shot" data-reveal="">
        <img
          src={p.shot.src}
          srcSet={`${p.shot.small} 1080w, ${p.shot.src} 2880w`}
          sizes={big ? "(min-width: 1024px) 58vw, 92vw" : "(min-width: 1024px) 30vw, 92vw"}
          width={1440}
          height={900}
          alt={p.shot.alt}
          loading="lazy"
          decoding="async"
        />
      </div>
      <h3 className="lp-own-name" id={`lp-own-${p.id}`}>
        {p.name}
      </h3>
      <p>{p.line}</p>
      {p.role && <p className="lp-result">{p.role}</p>}
      <div className="lp-own-foot">
        {p.link ? (
          <a className="lp-pill-link" href={p.link.href} target="_blank" rel="noreferrer">
            {p.link.label}
            <Out />
          </a>
        ) : (
          <span className="lp-muted">Private code. No public link.</span>
        )}
        <details className="lp-eng">
          <summary>For engineers</summary>
          <ul>
            {p.engineers.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </details>
      </div>
    </article>
  );
}

function Personal() {
  const [first, ...rest] = own;
  return (
    <section className="lp-personal lp-wrap" aria-labelledby="lp-own-title">
      <h2 className="lp-h2" id="lp-own-title">
        Own projects
      </h2>
      <p className="lp-lead">Made outside work. Most of them were built with AI agents.</p>
      <div className="lp-own-grid">
        <OwnTile p={first} big />
        {rest.map((p) => (
          <OwnTile key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
}

function Breadth() {
  return (
    <section className="lp-breadth lp-wrap" aria-labelledby="lp-breadth-title">
      <h2 className="lp-h2" id="lp-breadth-title">
        Many fields, three platforms
      </h2>
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
            {breadth.rows.map((r) => (
              <tr key={r.domain}>
                <th scope="row">{r.domain}</th>
                {r.cells.map((c, i) => (
                  <td key={i} data-col={breadth.columns[i]}>
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
      <div className="lp-breadth-notes">
        <div>
          <h3 className="lp-h3">Learns fast</h3>
          <ul className="lp-learned">
            {learned.map((l) => (
              <li key={l.what}>
                <span className="lp-when">{l.when}</span>
                {l.what}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="lp-h3">Uses AI with control</h3>
          <p className="lp-body">
            AI agents do the typing. Written rules, tests and automatic checks set the limits. A person approves every change. That is how one
            screen went from first note to merged in one working day.
          </p>
        </div>
      </div>
    </section>
  );
}

function Foot() {
  return (
    <footer className="lp-foot lp-wrap">
      <p className="lp-foot-line">Gentrit Rashiti builds web and mobile apps, from Kosovo.</p>
      <ul className="lp-links">
        <li>
          <a className="lp-pill-link" href={`mailto:${links.email}`}>
            {links.email}
          </a>
        </li>
        <li>
          <a className="lp-pill-link" href={links.github} target="_blank" rel="noreferrer">
            GitHub
            <Out />
          </a>
        </li>
        <li>
          <a className="lp-pill-link" href={links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
            <Out />
          </a>
        </li>
        <li>
          <a className="lp-pill-link" href={links.cv}>
            CV (PDF)
          </a>
        </li>
      </ul>
    </footer>
  );
}

let homeSeen = false;

function Home() {
  const root = useRef<HTMLDivElement>(null);
  const [seen] = useState(() => homeSeen);
  useReveal(root);
  useEffect(
    () => () => {
      homeSeen = true;
    },
    [],
  );
  return (
    <div ref={root} data-seen={seen ? "" : undefined}>
      <title>Gentrit Rashiti: web and mobile apps, built with AI kept in control</title>
      <Top />
      <main>
        <Hero />
        <Steps />
        <Day />
        <DesignSystem />
        <Mobile />
        <Wallet />
        <Personal />
        <Breadth />
      </main>
      <Foot />
    </div>
  );
}

const cases = { "care-platform": CareCase, "design-system": DsCase, "bayyinah-tv": BayyinahCase };

export default function Draft() {
  const { pathname } = useLocation();
  useEffect(() => {
    const html = document.documentElement;
    const before = html.style.backgroundColor;
    html.style.backgroundColor = "#0b0c0f";
    return () => {
      html.style.backgroundColor = before;
    };
  }, []);
  const slug = /\/(care-platform|design-system|bayyinah-tv)\/?$/.exec(pathname)?.[1];
  const Case = slug ? cases[slug as keyof typeof cases] : undefined;
  return (
    <div className="lp" data-view={Case ? "case" : "home"}>
      <meta name="theme-color" content="#0b0c0f" />
      {Case ? <Case key={slug} /> : <Home key="home" />}
    </div>
  );
}
