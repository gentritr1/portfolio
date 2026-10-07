import { useEffect, useRef, type MouseEvent } from "react";
import { useNavigate } from "react-router";
import { links as shared } from "../../content/links";
import { HOME } from "./Home";
import { openWindow, takeFocus } from "./openWindow";
import { Arrow, Caption, Shot } from "./parts";
import { calendar, claims, glucose, type WebShot } from "./shots";

/** The whole screen at actual size, in a native dialog. Escape closes it and focus goes back to the button. */
function WholeScreen({ shot, name }: { shot: WebShot; name: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" className="p12p-whole" onClick={() => dialog.current?.showModal()}>
        See the whole screen
      </button>
      <dialog
        ref={dialog}
        className="p12p-dialog"
        aria-label={`${name}, the whole screen at actual size`}
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        <div className="p12p-dialog-bar">
          <p>
            {name}. Shown at actual size. Real product screens, invented data.
          </p>
          <button type="button" className="p12p-close" onClick={() => dialog.current?.close()}>
            Close
          </button>
        </div>
        <div className="p12p-dialog-scroll">
          <img src={shot.src} alt={shot.alt} width={shot.w} height={shot.h} style={{ width: shot.w, height: shot.h }} loading="lazy" />
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

      <div className="p12p-case-head">
        <p className="p12p-kicker">Care platform, Vianova, 2023–26</p>
        <h1 id="p12p-case-h" className="p12p-case-title" ref={heading} tabIndex={-1}>
          Rebuilding a live care platform, one tested screen at a time.
        </h1>
        <p className="p12p-lede">
          Care teams use this web app to look after patients at home. They follow readings from home devices, care plans,
          lab results, billing claims, calls and chat. The app is moving from Vue to React one screen at a time, and care
          teams keep using it the whole time.
        </p>
        <dl className="p12p-facts">
          <div>
            <dt>Role</dt>
            <dd>Web and mobile; since 2026 also the server</dd>
          </div>
          <div>
            <dt>Years</dt>
            <dd>2023–26</dd>
          </div>
          <div>
            <dt>Platforms</dt>
            <dd>Web, phone and server</dd>
          </div>
          <div>
            <dt>Live</dt>
            <dd>Private, behind sign-in</dd>
          </div>
        </dl>
      </div>

      <figure className="p12p-case-fig">
        <Shot
          shot={calendar}
          wide={{ x: 0, y: 0 }}
          narrow={{ x: 620, y: 205 }}
          work="Care platform"
          className="p12p-case-win"
          id="p12p-shot-case"
          eager
          story
        />
        <div className="p12p-case-figfoot">
          <Caption title="Care team calendar, one week." real measure="#p12p-shot-case" total={1440} />
          <WholeScreen shot={calendar} name="Care team calendar" />
        </div>
      </figure>

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
            labs and vitals, claims, calls and chat. Since 2026, Gentrit also works on the server. For the move to React,
            Gentrit wrote most of the rules and the checks. Teammates wrote the rest.
          </p>
          <p>
            Many client organizations share one system. So each screen shows each organization only its own data, and each
            person sees only what their role allows.
          </p>
        </section>

        <section aria-labelledby="p12p-c2">
          <h2 id="p12p-c2">What was built</h2>
          <ol className="p12p-decisions">
            <li>
              <p className="p12p-limit">The app could not stop.</p>
              <p>
                So it moves one screen at a time. The old screen runs until the new one is ready, and care teams keep
                working.
              </p>
            </li>
            <li>
              <p className="p12p-limit">A new screen must do what the old one did.</p>
              <p>
                So each screen gets its test first, written on the old app. The same test then runs on both apps. A screen
                moves only when it passes on both.
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
            Gentrit wrote most of the rules and the checks. AI agents build inside them. A person approves each change. A
            check is trusted only after it is shown to fail.
          </p>
        </section>
      </div>

      <figure className="p12p-flow" aria-labelledby="p12p-flow-cap">
        <ol className="p12p-flow-steps">
          {steps.map((s, i) => (
            <li key={s} className={i === 2 || i === 3 ? "p12p-flow-loop" : undefined}>
              {s}
            </li>
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

      <figure className="p12p-row-fig p12p-case-shot">
        <Shot shot={claims} wide={{ x: 236, y: 56 }} narrow={{ x: 250, y: 576 }} work="Care platform" className="p12p-row-win" id="p12p-shot-claims" />
        <div className="p12p-case-figfoot">
          <Caption title="Claims for one month." real measure="#p12p-shot-claims" total={1440} />
          <WholeScreen shot={claims} name="Claims" />
        </div>
      </figure>

      <div className="p12p-read">
        <section aria-labelledby="p12p-c3">
          <h2 id="p12p-c3">The result</h2>
          <p>
            Care teams keep using the app while each screen moves over. In September 2026, the same test passed on both
            apps for the patient compliance list. On the server, one billing report used to time out. Now it needs 2
            database requests, not 16, and it finishes. New screens use Design System v2, a shared set of building blocks.
          </p>
        </section>
      </div>

      <dl className="p12p-numbers" data-numbers>
        <div>
          <dt>16 → 2</dt>
          <dd>Database requests for one billing report</dd>
        </div>
        <div>
          <dt>4</dt>
          <dd>Languages: English, German, Spanish and Turkish</dd>
        </div>
        <div>
          <dt>36</dt>
          <dd>Building blocks in Design System v2, under the new screens</dd>
        </div>
      </dl>

      <figure className="p12p-row-fig p12p-case-shot">
        <Shot shot={glucose} wide={{ x: 247, y: 140 }} narrow={{ x: 560, y: 250 }} work="Care platform" className="p12p-row-win" id="p12p-shot-glucose" />
        <div className="p12p-case-figfoot">
          <Caption title="Glucose for one patient, one day." real measure="#p12p-shot-glucose" total={1440} />
          <WholeScreen shot={glucose} name="Glucose overview" />
        </div>
      </figure>

      <div className="p12p-read">
        <section aria-labelledby="p12p-c4">
          <h2 id="p12p-c4">In short</h2>
          <ul className="p12p-short">
            <li>A live care app, moving from Vue to React one screen at a time.</li>
            <li>Each screen passes the same test on both apps before it moves.</li>
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
            The trade-off: moving route by route keeps care teams working, but the old app and the new app both run until
            the move is done.
          </p>
        </section>
      </div>

      <footer className="p12p-case-next">
        <a href="/work/bayyinah-tv" className="p12p-next">
          <span>Next case</span>
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
