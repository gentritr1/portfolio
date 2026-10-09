import { useRef, type CSSProperties } from "react";
import { Boards } from "./Boards";
import { CaseEnd, CaseTop, Chapter, NextCase } from "./CaseParts";
import { useReveal } from "./hooks";

const steps = [
  "Study five design systems: Material, Carbon, Polaris, Atlassian and Primer.",
  "Turn the findings into written guides for AI agents.",
  "AI agents build each part inside the guides.",
  "Automatic checks run. A failed check stops the change.",
  "A person reviews the change and merges it.",
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
  "Each gate has a negative control. A visual snapshot test moves one button colour one step on purpose and must fail. A tamper script breaks the token source and the drift check must fail.",
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
        <div className="lp-wrap lp-case-shot">
          <Boards size="case" />
        </div>
      </header>

      <Chapter name="What it does" title="Every screen gets the same parts.">
        <p>
          Colours, sizes and type are set once, in code. The code and the Figma file both come from that one source. When a colour changes there,
          every part follows.
        </p>
        <p>A screen uses ready parts, so it looks and works like the other screens.</p>
      </Chapter>

      <Chapter name="The problem" title="The old app had many copies of each part.">
        <p>
          A study of the old care app found the same buttons and forms copied many times, and many colours typed by hand. Copies drift apart: two
          buttons that must match look a little different.
        </p>
      </Chapter>

      <Chapter name="What the team built" title="Research first, then guides, then checks.">
        <p>For each part, the team follows the same steps:</p>
        <ol className="lp-five">
          {steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </Chapter>

      <Chapter name="What changed" title="A page loads only the parts it uses.">
        <p>
          Before, a page that used one button loaded the whole library. Now each part loads on its own. A page that uses only a button loads 96.6%
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
