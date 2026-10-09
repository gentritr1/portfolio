import { useRef, type CSSProperties } from "react";
import { BrowserFrame } from "../../components/BrowserFrame";
import { CaseEnd, CaseTop, Chapter, NextCase, Ring } from "./CaseParts";
import { Checked } from "./icons";
import { useReveal } from "./hooks";

const NOTE = "Real product screen, invented data.";

const day = [
  { time: "11:37", what: "Notes on the old app" },
  { time: "12:01", what: "Test written on the old app" },
  { time: "12:55", what: "Agents built the screen" },
  { time: "15:11", what: "Fixes after the review" },
  { time: "15:25", what: "Same test, both apps" },
  { time: "15:40", what: "Approved and merged" },
];
const minutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
const FROM = minutes("11:15");
const TO = minutes("16:00");

const twin = ["A patient's name opens that patient", "The search stays when the tab changes", "A search with no match says so"];

const stack = [
  "React 19",
  "TypeScript",
  "TanStack Query",
  "TanStack Router",
  "Zustand",
  "Zod",
  "Tailwind",
  "Vitest",
  "Playwright",
  "Laravel 13",
  "PHP 8.3",
  "MySQL",
  "Redis",
  "Pest",
];

const engineers = [
  "One Playwright test file for each screen is written against the old app at a fixed commit. The same file then runs on both apps.",
  "Each screen keeps a register of every place it differs from the old app, with the evidence for each.",
  "Two CI jobs run every gate. Each gate has a negative control that proves it can fail.",
  "Server state in TanStack Query, client state in Zustand, filters and tabs in the URL. Zod schemas made from captured responses parse every API response.",
  "A feature never imports a sibling feature. A dependency-graph check enforces it.",
  "On the server, one billing report ran a patient query for each sheet and each month. Now it runs one patient query and one grouped aggregate.",
];

export function CareCase() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  return (
    <article className="lp-case" ref={root}>
      <title>Care platform: one tested screen at a time</title>
      <header className="lp-case-head">
        <CaseTop />
        <div className="lp-wrap lp-case-hero">
          <p className="lp-case-label">Care platform, 2023 to 2026</p>
          <h1 className="lp-case-title">Rebuilding a live care platform, one tested screen at a time.</h1>
          <div className="lp-case-side">
            <p className="lp-case-sentence">Care teams use this web app to follow patients at home. Each client organization sees only its own patients.</p>
            <dl className="lp-facts">
              <div>
                <dt>Role</dt>
                <dd>Web and mobile; since 2026 also the server</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>Rebuild in progress. Care teams still use the old app.</dd>
              </div>
            </dl>
          </div>
        </div>
        <figure className="lp-wrap lp-case-shot">
          <BrowserFrame
            src="/showcase/care-dashboard/overview.webp"
            alt="Care team dashboard in the new app: patients by program, patient engagement by calls and text messages, and patients for each provider. Invented data."
            label="Care platform, new app"
            tone="light"
            eager
          />
          <figcaption className="lp-caption">{NOTE}</figcaption>
        </figure>
      </header>

      <Chapter
        name="What it does"
        title="Care teams follow patients at home."
        figure={
          <figure className="lp-figure">
            <BrowserFrame
              src="/showcase/care-dashboard/rpm-overview-cgm.webp"
              alt="Glucose overview for one patient: time in range, average, highest and lowest values, device usage and one day's glucose curve. Invented data."
              label="Care platform, new app"
              tone="light"
            >
              <Ring box={{ x: 706, y: 146, w: 130, h: 88 }} label="Readings from a connected device" />
            </BrowserFrame>
            <figcaption className="lp-caption">Glucose overview for one patient. {NOTE}</figcaption>
          </figure>
        }
      >
        <p>
          The app shows vitals from connected devices, care plans, lab results, billing claims, calls and chat. It works in English, German, Spanish
          and Turkish.
        </p>
      </Chapter>

      <Chapter
        name="The problem"
        title="The old app worked, but its framework was old."
        figure={
          <figure className="lp-figure">
            <BrowserFrame
              src="/showcase/care-dashboard/claims.webp"
              alt="Claims for one month: counts by status, filters, and each claim with its program, CPT codes and status. One claim needs attention. Invented data."
              label="Care platform, new app"
              tone="light"
            >
              <Ring box={{ x: 676, y: 500, w: 308, h: 40 }} label="Claims that need another look" />
            </BrowserFrame>
            <figcaption className="lp-caption">Claims for one month. {NOTE}</figcaption>
          </figure>
        }
      >
        <p>
          The live app runs on Vue 2 and Nuxt 2. Care teams use it every day, so it cannot stop. The new app must do the same things, and the old
          bugs must not move into it.
        </p>
      </Chapter>

      <Chapter
        name="What the team built"
        title="A new app in React, one screen at a time."
        figure={
          <figure className="lp-figure lp-day">
            <ol className="lp-day-line" aria-label="One screen on 8 September 2026">
              {day.map((d) => (
                <li key={d.time} style={{ "--p": (minutes(d.time) - FROM) / (TO - FROM) } as CSSProperties} data-reveal="">
                  <span className="lp-day-time">{d.time}</span>
                  <span className="lp-day-what">{d.what}</span>
                </li>
              ))}
            </ol>
            <figcaption className="lp-caption">One screen, the patient compliance list, on 8 September 2026. Times are from the commits.</figcaption>
          </figure>
        }
      >
        <p>For each screen, the team follows the same five steps:</p>
        <ol className="lp-five">
          <li>Write down every behaviour of the old screen.</li>
          <li>Write the test on the old app, before any new code.</li>
          <li>AI agents build the new screen inside written rules.</li>
          <li>Automatic checks run. A failed check sends the work back.</li>
          <li>A person reviews the change and merges it.</li>
        </ol>
      </Chapter>

      <Chapter
        name="What changed"
        title="Fewer queries, the same behaviour, old bugs left behind."
        figure={
          <div className="lp-changed">
            <figure className="lp-big" data-reveal="">
              <p className="lp-big-num" aria-label="From 16 to 2">
                <span className="lp-big-from">
                  16
                  <span className="lp-big-strike" aria-hidden="true" />
                </span>
                <span className="lp-big-arrow" aria-hidden="true">
                  →
                </span>
                <span className="lp-big-to">2</span>
              </p>
              <figcaption>
                Database queries for one billing report. The report no longer times out.
              </figcaption>
            </figure>
            <figure className="lp-twin" data-reveal="">
              <div className="lp-twin-cols">
                {["Old app", "New app"].map((app) => (
                  <div key={app} className="lp-twin-col">
                    <p className="lp-twin-app">{app}</p>
                    <ul>
                      {twin.map((t) => (
                        <li key={t}>
                          <Checked />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <figcaption className="lp-caption">The same test passed on both apps. Patient compliance list, September 2026.</figcaption>
            </figure>
          </div>
        }
      >
        <p>
          On the server, one billing report ran a full patient query for each sheet and each month, and timed out. Now it runs one patient query.
          On the web, the same test passed on both apps. Old bugs are written down, not copied.
        </p>
      </Chapter>

      <CaseEnd
        stack={stack}
        engineers={engineers}
        next={<NextCase to="/drafts/the-loop/design-system" name="Design System v2" line="One set of parts for every new screen." />}
      />
    </article>
  );
}
