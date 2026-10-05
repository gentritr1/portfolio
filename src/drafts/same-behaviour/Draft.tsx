import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Link } from "react-router";
import { links } from "../../content/links";
import {
  areas,
  facts,
  orgs,
  scenarioOf,
  units,
  work,
  type Action,
  type ScreenState,
} from "./data";
import { Plate, Swap } from "./Plate";
import "./same-behaviour.css";

interface Run {
  scenario: string;
  instant: boolean;
  pending: boolean;
}

const controls: Array<{
  action: Action;
  label: [string, string];
  short: [string, string];
}> = [
  {
    action: "org",
    label: ["Switch organization", "Switch organization"],
    short: ["Switch org", "Switch org"],
  },
  {
    action: "unit",
    label: ["Toggle unit", "Toggle unit"],
    short: ["Toggle unit", "Toggle unit"],
  },
  {
    action: "alert",
    label: ["Open alert", "Close alert"],
    short: ["Open alert", "Close alert"],
  },
];

export default function Draft() {
  const [state, setState] = useState<ScreenState>({
    org: 0,
    unit: 0,
    alert: false,
  });
  const [run, setRun] = useState<Run>({
    scenario: "open the vitals card",
    instant: true,
    pending: false,
  });
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function act(action: Action, instant: boolean) {
    const scenario = scenarioOf(action, state);
    setState((s) =>
      action === "org"
        ? { ...s, org: s.org ? 0 : 1 }
        : action === "unit"
          ? { ...s, unit: s.unit ? 0 : 1 }
          : { ...s, alert: !s.alert },
    );
    window.clearTimeout(timer.current);
    setRun({ scenario, instant, pending: !instant });
    if (!instant) {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      timer.current = window.setTimeout(
        () => setRun((r) => ({ ...r, pending: false })),
        reduce ? 120 : 200,
      );
    }
  }

  const fromControl =
    (action: Action) => (event: MouseEvent<HTMLButtonElement>) =>
      act(action, event.detail === 0);
  const fromPlate = (action: Action) => act(action, false);

  const org = orgs[state.org];
  const said = `${run.scenario}: both apps show ${org.name}, ${org.patient}, ${units[state.unit]}${
    state.alert ? ", alert open" : ""
  }. Same behaviour.`;

  return (
    <div className="sb" data-instant={run.instant || undefined}>
      <title>Gentrit Rashiti — same behaviour</title>
      <section className="sb-stage" aria-labelledby="sb-who">
        <header className="sb-head">
          <h1 id="sb-who" className="sb-who">
            Gentrit Rashiti, web and mobile developer for 5+ years, is moving a
            live care platform from Vue to React, one route at a time.
          </h1>
          <nav className="sb-top" aria-label="Contact">
            <a href={links.cv}>Download CV</a>
            <a href={`mailto:${links.email}`}>Email</a>
          </nav>
        </header>

        <div className="sb-pair">
          <figure className="sb-side sb-side-a">
            <figcaption className="sb-label">
              <span>Nuxt 2 · 2023</span>
              <span>Recreation · invented data</span>
            </figcaption>
            <div className="sb-plate">
              <Plate era="nuxt" state={state} onAct={fromPlate} />
            </div>
          </figure>

          <div className="sb-verdict" data-pending={run.pending || undefined}>
            <p className="sb-scenario">{run.scenario}</p>
            <p className="sb-check">
              same behaviour
              <svg viewBox="0 0 12 12" aria-hidden="true">
                <path d="M2.5 6.4 5 8.8l4.6-5.6" />
              </svg>
            </p>
          </div>

          <figure className="sb-side sb-side-b">
            <figcaption className="sb-label">
              <span>React · 2026</span>
              <span>Recreation · invented data</span>
            </figcaption>
            <div className="sb-plate">
              <Plate era="react" state={state} onAct={fromPlate} />
            </div>
          </figure>
        </div>

        <p className="sb-live" aria-live="polite">
          {run.pending ? "" : said}
        </p>

        <div
          className="sb-controls"
          role="group"
          aria-label="Run one scenario on both apps"
        >
          {controls.map((c) => {
            const on = c.action === "alert" && state.alert ? 1 : 0;
            return (
              <button
                key={c.action}
                type="button"
                className="sb-control"
                aria-label={c.label[on]}
                onClick={fromControl(c.action)}
              >
                <span className="sb-long">
                  <Swap index={on} items={c.label} />
                </span>
                <span className="sb-short" aria-hidden="true">
                  <Swap index={on} items={c.short} />
                </span>
              </button>
            );
          })}
        </div>

        <p className="sb-rule">
          A route moves to React only after its test passes on both apps.
        </p>
      </section>

      <section className="sb-case" aria-labelledby="sb-care">
        <div className="sb-case-text">
          <h2 id="sb-care">Care-management platform</h2>
          <p className="sb-mono">
            Frontend and mobile, full stack since 2026 · 2023–26
          </p>
          <ul className="sb-facts">
            {facts.map((f) => (
              <li key={f.text}>
                {f.text}
                {f.result ? (
                  <>
                    {" "}
                    <span className="sb-arrow">→</span>{" "}
                    <strong>{f.result}</strong>
                  </>
                ) : null}
                .
              </li>
            ))}
          </ul>
          <Link className="sb-link" to="/work/care-platform">
            Open the case <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="sb-areas">
          <p>Built on Vue from 2023, moving to React in 2026</p>
          <ul>
            {areas.map((a) => (
              <li key={a}>
                <span>{a}</span>
                {a === "Labs and vitals" ? (
                  <span className="sb-here">the card above</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="sb-work" aria-labelledby="sb-other">
        <h2 id="sb-other">Other work</h2>
        <ul>
          {work.map((p) => (
            <li key={p.slug}>
              <Link className="sb-row" to={`/work/${p.slug}`}>
                <img
                  src={p.shot.src}
                  alt={p.shot.alt}
                  width={p.shot.w}
                  height={p.shot.h}
                  loading="lazy"
                  decoding="async"
                />
                <span className="sb-row-text">
                  <strong>{p.name}</strong>
                  <span>{p.line}</span>
                </span>
                <span className="sb-row-meta">
                  {p.role} · {p.years}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <footer className="sb-foot">
        <p>
          <strong>Gentrit Rashiti</strong> · Kosovo, working remotely ·
          Bachelor's degree, UBT
        </p>
        <nav aria-label="Links">
          <a href={`mailto:${links.email}`}>{links.email}</a>
          <a href={links.cv}>Download CV</a>
          <a href={links.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </nav>
        <p className="sb-note">
          The two care screens are recreations with invented data. No
          screenshots of client work.
        </p>
      </footer>
    </div>
  );
}
