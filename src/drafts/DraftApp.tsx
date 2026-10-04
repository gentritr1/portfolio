import { lazy, Suspense, useState, type ComponentType } from "react";
import { Link, Route, Routes, useParams } from "react-router";
import "./picker.css";

interface DraftMeta {
  rule?: string;
  mechanisms?: string[];
  slopCount?: number;
  creativeGates?: string;
  id: string;
  title: string;
  band: "Professional" | "Crafted" | "Fun" | "Experimental";
  description: string;
  signature: string;
  caseSlug: string;
  scores?: {
    design: number;
    usability: number;
    creativity: number;
    content: number;
  };
  antiPale?: string;
  rounds?: number;
  holdback?: string;
}
const bands = ["Professional", "Crafted", "Fun", "Experimental"] as const;
const sequence = [
  "diff", "fjalekryq", "linja", "bitrate", "aisle", "facing-pages", "ledger", "deal", "lap",
  "hybrid",
  "studio",
  "desktop",
  "canvas",
  "index",
  "blueprint",
  "savefile",
  "zine",
  "issue",
  "wall",
  "riso",
  "dither",
  "swiss",
  "orbit",
  "primetime",
  "desk",
];
const metadata = Object.values(
  import.meta.glob<DraftMeta>("./*/meta.json", {
    eager: true,
    import: "default",
  }),
).sort((a, b) => sequence.indexOf(a.id) - sequence.indexOf(b.id));
const modules = import.meta.glob<{ default: ComponentType }>("./*/Draft.tsx");
const views = Object.fromEntries(
  Object.entries(modules).map(([path, load]) => [
    path.split("/")[1],
    lazy(load),
  ]),
);
const total = (s: NonNullable<DraftMeta["scores"]>) =>
  (
    s.design * 0.4 +
    s.usability * 0.3 +
    s.creativity * 0.2 +
    s.content * 0.1
  ).toFixed(2);

function Picker() {
  const [band, setBand] = useState<string>("All");
  const drafts = metadata.filter((d) => band === "All" || d.band === band);
  return (
    <main className="draft-picker">
      <title>Live art directions — Gentrit Rashiti</title>
      <header>
        <a href="/">Gentrit Rashiti</a>
        <a href="mailto:gentrit.rashiti2@gmail.com">Email</a>
      </header>
      <div className="draft-picker-intro">
        <h1>
          Which
          <br />
          <i>Gentrit?</i>
        </h1>
        <div>
          <p>
            One body of work.
            <br />
            Different ways to see it.
          </p>
          <span>
            Explore the live directions. Each has its own composition, motion
            and point of view.
          </span>
        </div>
      </div>
      <nav aria-label="Filter drafts">
        {["All", ...bands].map((value) => (
          <button
            type="button"
            key={value}
            aria-pressed={band === value}
            onClick={() => setBand(value)}
          >
            {value}
            <span>
              {value === "All"
                ? metadata.length
                : metadata.filter((d) => d.band === value).length}
            </span>
          </button>
        ))}
      </nav>
      <div className="draft-picker-grid">
        {drafts.map((d) => (
          <article key={d.id} data-band={d.band}>
            <Link
              to={`/drafts/${d.id}`}
              className="draft-picker-image"
              aria-label={`Open ${d.title}`}
            >
              <img
                src={`/drafts-preview/${d.id}.webp`}
                alt={`${d.title} art direction`}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.hidden = true;
                }}
              />
              <strong aria-hidden="true">{d.title}</strong>
            </Link>
            <div className="draft-picker-caption">
              <div>
                <span>{d.band}</span>
                <h2>
                  <Link to={`/drafts/${d.id}`}>{d.title}</Link>
                </h2>
              </div>
              <Link className="draft-open" to={`/drafts/${d.id}`}>
                Open{" "}
                <svg
                  aria-hidden="true"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M3 13 13 3M3 3h10v10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </Link>
            </div>
            <p>{d.description}</p>
            {d.scores ? (
              <>
                <dl className="draft-scores">
                  {Object.entries(d.scores).map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value.toFixed(1)}</dd>
                    </div>
                  ))}
                  <div>
                    <dt>Weighted</dt>
                    <dd>{total(d.scores)}</dd>
                  </div>
                </dl>
                <p className="draft-verdict">
                  Energy check: {d.antiPale}. {d.rounds} review{" "}
                  {d.rounds === 1 ? "round" : "rounds"}.
                </p>
              </>
            ) : (
              <p className="draft-verdict">Awaiting visual review.</p>
            )}
            <details>
              <summary>Motion & review notes</summary>
              <p>{d.rule ? `Rule: ${d.rule}. ` : ""}{d.signature}</p>
              {d.creativeGates && <p>Creative gates: {d.creativeGates}. Slop markers: {d.slopCount}. Mechanisms: {d.mechanisms?.join(", ") || "none earned"}.</p>}
              <p>
                {d.holdback ||
                  "Review notes will appear after the first jury pass."}
              </p>
            </details>
          </article>
        ))}
      </div>
      <footer>
        <p>Every direction uses the same real projects.</p>
        <a href="/">Return to the portfolio</a>
      </footer>
    </main>
  );
}
function DraftView() {
  const { id } = useParams();
  const View = id ? views[id] : undefined;
  return View ? (
    <Suspense
      fallback={
        <div className="draft-loading" role="status">
          Opening the draft…
        </div>
      }
    >
      <View />
    </Suspense>
  ) : (
    <main className="draft-loading">
      <h1>Draft not found</h1>
      <Link to="/drafts">View all drafts</Link>
    </main>
  );
}
export default function DraftApp() {
  return (
    <>
      <Routes>
        <Route path="/drafts" element={<Picker />} />
        <Route path="/drafts/:id/*" element={<DraftView />} />
      </Routes>
    </>
  );
}
