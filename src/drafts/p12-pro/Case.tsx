import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useNavigate } from "react-router";
import { links as shared } from "../../content/links";
import { HOME } from "./Home";
import { openWindow, takeFocus } from "./openWindow";
import { Arrow, Caption, Dim, Shot } from "./parts";
import { claims, glucose, type WebShot } from "./shots";

/**
 * The whole screen in a native dialog. Wide screens show it at actual size; on a phone it starts
 * fitted to the width (whole, but small) and one button switches to actual size (pan to read).
 * Escape closes it and focus goes back to the button that opened it.
 */
function WholeScreen({ shot, name }: { shot: WebShot; name: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [fit, setFit] = useState(false);
  const open = () => {
    setFit(matchMedia("(max-width: 959px)").matches);
    dialog.current?.showModal();
  };
  return (
    <>
      <button type="button" className="p12p-whole" onClick={open}>
        See the whole screen
      </button>
      <dialog
        ref={dialog}
        className="p12p-dialog"
        aria-label={`${name}, the whole screen`}
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        <div className="p12p-dialog-bar">
          <p>
            {name}. {fit ? "Fitted to your screen." : "Actual size."} Real product screens, invented data.
          </p>
          <div className="p12p-dialog-actions">
            <button type="button" className="p12p-close" aria-pressed={!fit} onClick={() => setFit((f) => !f)}>
              {fit ? "Actual size" : "Fit"}
            </button>
            <button type="button" className="p12p-close" onClick={() => dialog.current?.close()}>
              Close
            </button>
          </div>
        </div>
        <div className={`p12p-dialog-scroll${fit ? " p12p-dialog-fit" : ""}`}>
          <img src={shot.src} alt={shot.alt} width={shot.w} height={shot.h} loading="lazy" />
        </div>
      </dialog>
    </>
  );
}

const steps = ["Old app", "Test first", "Agents build", "Checks", "Person approves"];

export default function Case() {
  const navigate = useNavigate();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => takeFocus(heading.current), []);
  const toHome = (event: MouseEvent<HTMLAnchorElement>) =>
    openWindow(event, HOME, navigate, ".p12p-case-win", ".p12p-hero-win");

  return (
    <article className="p12p-case" aria-labelledby="p12p-case-h">
      <header className="p12p-mast p12p-case-mast">
        <a href={HOME} className="p12p-back" onClick={toHome}>
          <Arrow /> Gentrit Rashiti, all work
        </a>
        <nav aria-label="Main">
          <a href={shared.cv}>CV</a>
          <a href={`mailto:${shared.email}`}>Email</a>
        </nav>
      </header>

      <div className="p12p-case-top">
        <div className="p12p-case-head">
          <p className="p12p-kicker">Care platform, Vianova. Vue app 2023–26, React rebuild 2026.</p>
          <h1 id="p12p-case-h" className="p12p-case-title" ref={heading} tabIndex={-1}>
            Rebuilding a live care platform, one tested screen at a time.
          </h1>
          <p className="p12p-lede">
            Care teams use this web app to look after patients at home: readings from home devices, care plans, lab
            results, billing claims, calls and chat. The app is being rebuilt in React, one tested screen at a time. No
            React screen is live yet; care teams keep working in the Vue app.
          </p>
        </div>
        <dl className="p12p-facts">
          <div>
            <dt>Role</dt>
            <dd>Web and mobile; since 2026 also the server</dd>
          </div>
          <div>
            <dt>Years</dt>
            <dd>Vue app 2023–26, React rebuild 2026</dd>
          </div>
          <div>
            <dt>Platforms</dt>
            <dd>Web, phone and server</dd>
          </div>
          <div>
            <dt>Live</dt>
            <dd>The Vue app, behind sign-in. The React app is not live yet.</dd>
          </div>
        </dl>

        <figure className="p12p-case-fig">
          <Dim of="#p12p-shot-case" total={1440} className="p12p-case-dim" />
          <Shot
            shot={claims}
            wide={{ x: 0, y: 0 }}
            narrow={{ x: 256, y: 60 }}
            work="Care platform"
            className="p12p-case-win"
            id="p12p-shot-case"
            eager
            story
          />
          <div className="p12p-case-figfoot">
            <Caption title="Claims for one month, care platform." real />
            <WholeScreen shot={claims} name="Claims" />
          </div>
        </figure>
      </div>

      <div className="p12p-read">
        <section aria-labelledby="p12p-c1">
          <h2 id="p12p-c1">The product</h2>
          <p>
            Care teams use the platform for remote patient care. They follow blood pressure and glucose from devices at
            home. They plan calls and visits, and they send claims for billing. The app runs in English, German, Spanish
            and Turkish.
          </p>
          <p>
            <strong>Scope.</strong> From 2023, Gentrit and the team built its screens in Vue: patient profile, care plans,
            labs and vitals, claims, calls and chat. Since 2026, Gentrit also works on the server and on the rebuild in
            React, below.
          </p>
          <p>
            Many client organizations share one system. So each screen shows each organization only its own data, and each
            person sees only what their role allows.
          </p>
        </section>

        <section aria-labelledby="p12p-c2">
          <h2 id="p12p-c2">What is being built</h2>
          <ol className="p12p-decisions">
            <li>
              <p className="p12p-limit">The app could not stop.</p>
              <p>
                So the rebuild goes one screen at a time. Care teams keep working in the Vue app until a new screen is
                ready.
              </p>
            </li>
            <li>
              <p className="p12p-limit">A new screen must do what the old one did.</p>
              <p>
                So each screen gets its test first, written on the old app. The same test then runs on both apps. A screen
                can move only when it passes on both.
              </p>
            </li>
            <li>
              <p className="p12p-limit">Old bugs should not move over.</p>
              <p>
                So each difference from the old app is written down with proof. The product owner confirms a bug before it
                is fixed. Old bugs are written down, not copied.
              </p>
            </li>
          </ol>
          <p>
            Gentrit wrote most of the rules and the checks. AI agents build inside them. A person approves each change.
            Teammates wrote the rest of the rules. A check is trusted only after it is shown to fail.
          </p>
        </section>
      </div>

      <figure className="p12p-flow" aria-labelledby="p12p-flow-cap">
        <ol className="p12p-flow-steps">
          {steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <p className="p12p-flow-back">
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M13 7H2M6.5 2.5 2 7l4.5 4.5" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          A check fails? Back to the agents.
        </p>
        <figcaption id="p12p-flow-cap">How one screen moves from the old app to the new one.</figcaption>
      </figure>

      <div className="p12p-read">
        <section aria-labelledby="p12p-c3">
          <h2 id="p12p-c3">The result so far</h2>
          <p>
            On the server, one billing report used to time out. Now it needs 2 database requests, not 16, and it
            finishes. The React app is still being built. In September 2026, the same test passed on both apps for the
            patient compliance list; that screen is not live yet. The new screens are built on Design System v2, a team
            effort.
          </p>
        </section>
      </div>

      <dl className="p12p-numbers" data-numbers>
        <div>
          <dt>16 → 2</dt>
          <dd>Database requests for one billing report, on the server</dd>
        </div>
        <div>
          <dt>Sept 2026</dt>
          <dd>The same test passed on both apps for the patient compliance list. Not live yet.</dd>
        </div>
      </dl>

      <figure className="p12p-row-fig p12p-case-shot">
        <Dim of="#p12p-shot-glucose" total={1440} />
        <Shot
          shot={glucose}
          wide={{ x: 258, y: 128 }}
          narrow={{ x: 560, y: 340 }}
          narrowHeight={300}
          work="Care platform"
          className="p12p-row-win"
          id="p12p-shot-glucose"
        />
        <div className="p12p-case-figfoot">
          <Caption title="Glucose for one patient, one day." real />
          <WholeScreen shot={glucose} name="Glucose overview" />
        </div>
      </figure>

      <div className="p12p-read">
        <section aria-labelledby="p12p-c4">
          <h2 id="p12p-c4">In short</h2>
          <ul className="p12p-short">
            <li>A live care app, being rebuilt in React one tested screen at a time. None is live yet.</li>
            <li>Each new screen must pass the same test on both apps.</li>
            <li>One billing report: 2 database requests, not 16.</li>
          </ul>
        </section>

        <section aria-labelledby="p12p-c5" className="p12p-eng">
          <h2 id="p12p-c5">For engineers</h2>
          <dl className="p12p-stack">
            <div>
              <dt>Web</dt>
              <dd>React 19, TypeScript, TanStack Query and Router, Zustand, Zod, Tailwind, Vitest, Playwright</dd>
            </div>
            <div>
              <dt>Server</dt>
              <dd>Laravel 13, PHP 8.3, MySQL, Redis, Pest</dd>
            </div>
            <div>
              <dt>Tools</dt>
              <dd>Twilio, Chime, Pusher, ECharts</dd>
            </div>
          </dl>
          <ul className="p12p-rules">
            <li>Each route's test is written on the pinned old app before any React code. It then runs unchanged on both apps.</li>
            <li>Server state lives in TanStack Query, client state in Zustand, and filters in the URL.</li>
            <li>Zod schemas come from captured responses of the old app.</li>
            <li>No feature imports a sibling feature. A boundary check enforces it.</li>
            <li>Each difference from the old app is recorded with evidence and an approval column.</li>
            <li>CI runs every gate. Each gate has a negative control that proves it can fail.</li>
            <li>People merge every pull request.</li>
          </ul>
          <p>
            The trade-off: nothing reaches care teams until a route passes on both apps, so no React screen is live yet.
          </p>
        </section>
      </div>

      <footer className="p12p-case-next">
        <a href="/work/bayyinah-tv" className="p12p-next">
          <span>Next case, on the main site</span>
          Bayyinah TV <Arrow />
        </a>
        <p className="p12p-links">
          <a href={HOME} className="p12p-link" onClick={toHome}>
            All work
          </a>
          <a href={shared.cv} className="p12p-link">
            CV (PDF)
          </a>
          <a href={`mailto:${shared.email}`} className="p12p-link">
            {shared.email}
          </a>
        </p>
      </footer>
    </article>
  );
}
