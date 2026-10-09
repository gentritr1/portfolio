import { useRef } from "react";
import { BackLink, CaseTop, NextCase } from "./CaseParts";
import { ringProof } from "./data";
import { useReveal } from "./hooks";
import { Checked } from "./icons";
import { Ring } from "./Ring";
import { Steps } from "./Steps";

/** Three real catches. Sources: SPEC.md "Facts and sources". */
const catches = [
  {
    name: "The check that stopped the agents",
    rows: [
      { text: "npm run migration:check", status: "failed", kind: "fail" },
      { text: "FEATURE_SOURCE_BEFORE_BUILDING", kind: "note" },
      { text: "npm run migration:check", status: "passed", kind: "pass" },
    ],
    line: "The agents built a whole screen while the route list still said “planned”. The route check failed and stopped the merge. The route moved to “building” with its evidence, and the next run passed.",
  },
  {
    name: "A green check that was wrong",
    rows: [
      { text: "lint, local, with cache", status: "passed", kind: "warn" },
      { text: "lint, CI, no cache", status: "failed", kind: "fail" },
      { text: "lint --cache", status: "refused", kind: "pass" },
    ],
    line: "A type change broke files that nobody had edited. Local lint read its cache and passed them. CI, with no cache, failed them. Now lint runs with no cache, and a gate test refuses the cache option.",
  },
  {
    name: "A test that could not fail, made to fail",
    rows: [
      { text: "hand-made break, first test", status: "survived", kind: "warn" },
      { text: "hand-made break, fixed test", status: "caught", kind: "pass" },
    ],
    line: "A reviewer broke the code on purpose, and a test still passed. The test was fixed. Now the same break makes it fail.",
  },
];

const stack = [
  "React 19",
  "TypeScript",
  "TanStack Query and Router",
  "Zustand",
  "Zod",
  "Tailwind",
  "Vitest",
  "Playwright",
  "Laravel 13",
  "PHP 8.3",
  "Pest",
];

const gates = [
  {
    job: "quality",
    leaves: ["typecheck", "lint", "format", "test:unit", "build", "boundaries:check", "deadcode:check", "size:check", "bundle:check"],
  },
  {
    job: "migration-integrity",
    leaves: ["contract", "policy", "i18n", "registry:check", "ds:adoption", "tools:test"],
  },
];

const records = [
  "Executable gates decide mergeability; judgment advises.",
  "Parity is the acceptance criterion.",
  "One product cutover.",
  "Parity execution is verify-stage work.",
  "A slice merges in two pull requests.",
  "Bundle weight is measured and recorded, not gated.",
];

/** The step guides (skills) that the agents load, by the stage where each one is used. */
const skills = [
  { stage: "Start", names: ["slice-start"] },
  { stage: "Measure the old screen", names: ["slice-inventory"] },
  { stage: "Test first", names: ["parity-spec"] },
  {
    stage: "Build",
    names: ["paper-build", "code-placement", "stack-composition"],
  },
  { stage: "Review", names: ["pr-review", "slice-merge-gate"] },
  { stage: "Before clients move", names: ["cutover-audit"] },
  { stage: "Also", names: ["qa-scenario", "design-port", "plain"] },
];

function Day() {
  return (
    <section className="lp-day-section lp-wrap" aria-labelledby="lp-day-title">
      <h2 className="lp-h2" id="lp-day-title">
        The loop on a real day
      </h2>
      <p className="lp-lead">
        One screen of the care platform, the patient compliance list, on 8 September 2026. Each step shows real text from that day.
      </p>
      <Ring />
      <ul className="lp-proofs">
        {ringProof.map((p) => (
          <li key={p} data-reveal="">
            <Checked />
            {p}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** "How the workflow works": the four steps, one real day, real catches, and the detail for engineers. */
export function Workflow() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  return (
    <article className="lp-case lp-flow" ref={root}>
      <title>How the workflow works: AI agents inside tested rules</title>
      <header className="lp-flow-head">
        <CaseTop />
        <div className="lp-wrap lp-flow-hero">
          <p className="lp-case-label">AI engineering</p>
          <h1 className="lp-case-title">How the workflow works</h1>
          <p className="lp-flow-intro">
            AI agents write most of the code. Written rules, step guides and automatic checks set the limits. A person reads each change and approves
            it. This page shows the loop, one real day of it, and three mistakes the checks caught.
          </p>
        </div>
      </header>

      <Steps />
      <Day />

      <section className="lp-wrap lp-catches" aria-labelledby="lp-catches-title">
        <h2 className="lp-h2" id="lp-catches-title">
          Checks that caught real mistakes
        </h2>
        <p className="lp-lead">A check is trusted only after it is shown to fail. These three failed when they had to.</p>
        <ol className="lp-catch-list">
          {catches.map((c, i) => (
            <li key={c.name} className="lp-catch" data-reveal="" style={{ transitionDelay: `${i * 70}ms` }}>
              <h3 className="lp-h3">{c.name}</h3>
              <ul className="lp-catch-rows" aria-label="What the checks printed">
                {c.rows.map((r) => (
                  <li key={r.text + (r.status ?? "")} data-kind={r.kind}>
                    <code>{r.text}</code>
                    {r.status && <span className="lp-catch-status">{r.status}</span>}
                  </li>
                ))}
              </ul>
              <p>{c.line}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="lp-wrap lp-engineers" aria-labelledby="lp-engineers-title">
        <h2 className="lp-h2" id="lp-engineers-title">
          For engineers
        </h2>
        <div className="lp-engineers-grid">
          <div>
            <h3 className="lp-h3">Stack</h3>
            <ul className="lp-pills">
              {stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="lp-h3">Gates, in two CI jobs</h3>
            {gates.map((g) => (
              <p key={g.job} className="lp-gates">
                <span className="lp-gates-job">{g.job}</span>
                {g.leaves.map((l) => (
                  <code key={l}>{l}</code>
                ))}
              </p>
            ))}
            <p className="lp-caption">Each gate has a negative control: a test that feeds it bad work and expects it to fail.</p>
          </div>
          <div>
            <h3 className="lp-h3">Decision records, by title</h3>
            <ul className="lp-records">
              {records.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="lp-h3">Step guides, by stage</h3>
            <ol className="lp-stages">
              {skills.map((s) => (
                <li key={s.stage}>
                  <span className="lp-stage-name">{s.stage}</span>
                  <span className="lp-stage-skills">
                    {s.names.map((n) => (
                      <code key={n}>{n}</code>
                    ))}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <NextCase to="/drafts/the-loop/care-platform" name="Care platform" line="Rebuilding a live care platform, one tested screen at a time." />
        <BackLink />
      </section>
    </article>
  );
}
