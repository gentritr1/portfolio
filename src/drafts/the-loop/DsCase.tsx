import { useRef, type CSSProperties } from "react";
import { BrowserFrame } from "../../components/BrowserFrame";
import { CaseEnd, CaseTop, Chapter, NextCase, Ring } from "./CaseParts";
import { useReveal } from "./hooks";

const NOTE = "Real product screen, invented data.";
const LABEL = "Design System v2, Storybook";

const steps = [
  "Study five leading design systems: Material, Carbon, Polaris, Atlassian and Primer.",
  "Turn the findings into written guides for AI agents.",
  "AI agents build each part inside the guides.",
  "Automatic checks decide. A failed check stops the change.",
  "A person reviews the change and merges it.",
];

const check = [
  { label: "Expected", src: "/showcase/design-system/check-expected.webp", alt: "Four buttons: brand blue, neutral grey, danger red and success green." },
  { label: "After a one-step colour change", src: "/showcase/design-system/check-actual.webp", alt: "The same four buttons. The first button is one step darker." },
  { label: "What the check found", src: "/showcase/design-system/check-diff.webp", alt: "The difference image: only the first button is marked." },
];

const bytes = [
  { name: "Before", value: "186,949 bytes", share: 1 },
  { name: "After", value: "6,386 bytes", share: 0.034 },
];

const numbers = [
  { value: "41", label: "components, from buttons to date pickers" },
  { value: "868", label: "design values, in three levels" },
  { value: "22", label: "releases in about 8.5 weeks" },
];

const stack = [
  "React 19",
  "TypeScript",
  "CSS Modules",
  "Storybook 10",
  "Style Dictionary",
  "Design tokens (DTCG)",
  "Vite",
  "Vitest",
  "Playwright",
  "axe",
  "Changesets",
];

const engineers = [
  "Design values are code, in three levels: core, semantic and component. Style Dictionary builds the CSS, the typed modules and the Figma bundle from one source. A CI check fails when a generated file drifts.",
  "Each component has its own entry point. A page bundles only the components it imports.",
  "Order of authority: the best-practices guide and accepted decision records are the spec. Research is the evidence. Agent skills only advise. Executable gates decide.",
  "Each gate has a negative control. A visual snapshot test changes one pixel on purpose and must fail. A tamper script breaks the token source and the drift check must fail.",
  "The accessibility bar is WCAG 2.1 AA. axe runs on rendered components in the tests.",
  "Changesets writes each release note. 22 tags, from v0.1.0 on 29 July 2026 to v1.1.6 on 27 September 2026.",
];

export function DsCase() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  return (
    <article className="lp-case" ref={root}>
      <title>Design System v2: one set of parts for every screen</title>
      <header className="lp-case-head" data-ground="" style={{ "--head": "#191a33" } as CSSProperties}>
        <CaseTop />
        <div className="lp-wrap lp-case-hero">
          <p className="lp-case-label">Design System v2, 2026</p>
          <h1 className="lp-case-title">One set of parts for every new screen.</h1>
          <div className="lp-case-side">
            <p className="lp-case-sentence">
              A design system is a shared box of screen parts: buttons, menus, forms and date pickers. The new care app builds its screens from it.
            </p>
            <dl className="lp-facts">
              <div>
                <dt>Role</dt>
                <dd>The research and the guides for AI agents. Parts built with the team.</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>Used by the new care app. That app is not live yet.</dd>
              </div>
            </dl>
          </div>
        </div>
        <figure className="lp-wrap lp-case-shot">
          <BrowserFrame
            src="/showcase/design-system/storybook-from-to.webp"
            alt="Design System v2 in its Storybook: the list of components on the left, and two date pickers, From and To, with June 2026 open and June 8 selected."
            label={LABEL}
            tone="light"
            eager
          />
          <figcaption className="lp-caption">The date picker in the design system's Storybook, the place where each part is shown and tested. {NOTE}</figcaption>
        </figure>
      </header>

      <Chapter
        name="What it does"
        title="Every screen gets the same parts."
        figure={
          <figure className="lp-figure">
            <BrowserFrame
              src="/showcase/design-system/date-range.webp"
              alt="Design System v2 date range picker in its Storybook, open: presets from Today to All time, June and July 2026 side by side, a range from June 22 to July 9, the start and end dates as text, and Cancel and Apply buttons. Invented data."
              label={LABEL}
              tone="light"
            >
              <Ring box={{ x: 18, y: 88, w: 160, h: 320 }} label="Ready-made date ranges" side="left" />
            </BrowserFrame>
            <figcaption className="lp-caption">The date range picker, one of the parts. {NOTE}</figcaption>
          </figure>
        }
      >
        <p>
          Colours, sizes and type are set once, in code. The code and the Figma file both come from that one source. When a colour changes there,
          every part follows.
        </p>
        <p>A screen uses ready parts, so it looks and works like the other screens.</p>
      </Chapter>

      <Chapter
        name="The problem"
        title="The old app had many copies of each part."
        figure={
          <figure className="lp-figure">
            <BrowserFrame
              src="/showcase/design-system/status-badges.webp"
              alt="Design System v2 status badges in its Storybook: one colour family for each meaning, from Active and Approved to Pending approval, Rejected, Scheduled, Draft, Transferred and Prior episode."
              label={LABEL}
              tone="light"
            >
              <Ring box={{ x: 14, y: 14, w: 432, h: 292 }} label="One colour for each meaning" side="left" />
            </BrowserFrame>
            <figcaption className="lp-caption">Status badges. Green means done, amber means waiting, red means refused. {NOTE}</figcaption>
          </figure>
        }
      >
        <p>
          A study of the old care app found the same buttons and forms copied many times, and many colours typed by hand. Copies drift apart: two
          buttons that must match look a little different.
        </p>
        <p>The new care app needed one set of parts, used on every screen.</p>
      </Chapter>

      <Chapter
        name="What the team built"
        title="Research first, then guides, then checks."
        figure={
          <figure className="lp-dscheck" data-reveal="">
            <div className="lp-check-rows">
              {check.map((c, i) => (
                <div key={c.label} className="lp-check-row" style={{ "--i": i } as CSSProperties}>
                  <p>{c.label}</p>
                  <img src={c.src} width={588} height={104} loading="lazy" decoding="async" alt={c.alt} />
                </div>
              ))}
            </div>
            <figcaption className="lp-caption">
              A test changes the colour of one button by one step, on purpose. The picture check must fail, and it does. This proves the check works.
            </figcaption>
          </figure>
        }
      >
        <p>For each part, the team follows the same steps:</p>
        <ol className="lp-five">
          {steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <p>A check is trusted only after it is shown to fail.</p>
      </Chapter>

      <Chapter
        name="What changed"
        title="A page loads only the parts it uses."
        figure={
          <div className="lp-changed lp-changed-top">
            <figure className="lp-big lp-share" data-reveal="">
              <p className="lp-big-num lp-share-num">
                96.6<span className="lp-share-unit">%</span>
              </p>
              <ul className="lp-bars" aria-label="JavaScript on a page that uses only a button">
                {bytes.map((b) => (
                  <li key={b.name} style={{ "--share": b.share } as CSSProperties}>
                    <span className="lp-bar-name">{b.name}</span>
                    <span className="lp-bar-value">{b.value}</span>
                    <span className="lp-bar" aria-hidden="true">
                      <span />
                    </span>
                  </li>
                ))}
              </ul>
              <figcaption>Less JavaScript on a page that uses only a button.</figcaption>
            </figure>
            <figure className="lp-counts" data-reveal="">
              <dl>
                {numbers.map((n) => (
                  <div key={n.label}>
                    <dt>{n.label}</dt>
                    <dd>{n.value}</dd>
                  </div>
                ))}
              </dl>
              <figcaption className="lp-caption">Built to the WCAG 2.1 AA accessibility bar. Counts from the release of 27 September 2026.</figcaption>
            </figure>
          </div>
        }
      >
        <p>
          Before, a page that used one button loaded the whole library. Now each part loads on its own. A page that uses only a button loads 96.6 %
          less JavaScript.
        </p>
      </Chapter>

      <CaseEnd
        stack={stack}
        engineers={engineers}
        next={<NextCase to="/drafts/the-loop/bayyinah-tv" name="Bayyinah TV" line="One web app for the web, iPhone and Android." />}
      />
    </article>
  );
}
