import { useState } from "react";
import { projects } from "../../content/projects";
import { links } from "../../content/links";
import "./issue.css";

const features = [
  {
    slug: "offday",
    title: "Time off.\nTogether.",
    image: "/personal/shots/offday-dark-desktop.webp",
    quote: "16 security and tenant-isolation tests.",
    caption: "Owner’s public capture · Offday",
    deck: "Employee requests. Manager approvals. One team calendar.",
  },
  {
    slug: "bayyinah-tv",
    title: "An entire\nplatform.",
    image: "/showcase/bayyinah/web-01.webp",
    quote: "34 routes. More than 270 components.",
    caption: "Public website · Bayyinah TV",
    deck: "A video-learning platform, rebuilt on Nuxt 3.",
  },
  {
    slug: "read-to-feed",
    title: "Reading,\nover time.",
    image: "/mobile/reading-1.webp",
    quote: "About 14 releases over four years.",
    caption: "Archived public store frame · Read to Feed",
    deck: "Books, reading progress and rewards on iOS and Android.",
  },
];
const offday = projects.find((p) => p.slug === "offday")!;

export default function Draft() {
  const [page, setPage] = useState(0);
  const feature = features[page];
  const project = projects.find((p) => p.slug === feature.slug)!;
  return (
    <div className="draft-issue">
      <title>The working issue — Gentrit Rashiti</title>
      <header className="iss-header">
        <a href="/drafts">Gentrit Rashiti</a>
        <nav>
          <a href="#iss-index">Index</a>
          <a href="#iss-about">About</a>
          <a href={`mailto:${links.email}`}>Email</a>
        </nav>
        <span>Selected work, 2021–26</span>
      </header>
      <main>
        <section className="iss-cover" aria-label="The working issue">
          <h1>Shipped.</h1>
          <div className="iss-cover-grid">
            <div className="iss-editor">
              <h2>
                Gentrit
                <br />
                <em>Rashiti.</em>
              </h2>
              <p>
                Frontend & mobile developer,
                <br />
                now full stack.
              </p>
              <p className="iss-location">
                Kosovo. Working remotely.
                <br />
                5+ years, from the first screen to release.
              </p>
              <a href={feature.slug === 'offday' ? '#iss-story' : `/work/${feature.slug}`} aria-label={`Read the ${project.name} feature`}>
                Read the feature
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 12h16M13 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <div className="iss-book">
              <div className="iss-spread" key={feature.slug}>
                <article className="iss-page-copy">
                  <p>
                    {project.name} · {project.years}
                  </p>
                  <h2>
                    {feature.title.split("\n").map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </h2>
                  <p>{feature.deck}</p>
                  <blockquote>{feature.quote}</blockquote>
                  <span className="iss-page-number">
                    {String(page * 2 + 1).padStart(2, "0")}
                  </span>
                </article>
                <figure className="iss-page-image">
                  <img src={feature.image} alt={feature.caption} />
                  <figcaption>{feature.caption}</figcaption>
                  <span className="iss-page-number">
                    {String(page * 2 + 2).padStart(2, "0")}
                  </span>
                </figure>
              </div>
              <div className="iss-turn">
                <button
                  type="button"
                  onClick={() =>
                    setPage((page + features.length - 1) % features.length)
                  }
                  aria-label="Previous feature"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20 12H4m7-7-7 7 7 7" />
                  </svg>
                </button>
                <p aria-live="polite">
                  {project.name}
                  <span>
                    {page + 1} of {features.length}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => setPage((page + 1) % features.length)}
                  aria-label="Turn to next feature"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 12h16M13 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>
        <section className="iss-story" id="iss-story">
          <header>
            <h2>
              A little less
              <br />
              <em>back and forth.</em>
            </h2>
            <p>Offday · Personal project · 2026</p>
          </header>
          <div className="iss-story-columns">
            <p className="iss-drop">{offday.summary}</p>
            <div>
              <blockquote>
                16 tests for security and tenant isolation.
              </blockquote>
              <p>
                Employees request leave. Managers approve it. The team calendar
                shows who is away, with drag-select to pick dates.
              </p>
              <p>{offday.stack.join(" · ")}</p>
              <nav>
                {offday.links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {l.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>
          <figure>
            <img
              src="/personal/shots/offday-dark-desktop.webp"
              loading="lazy"
              alt="Offday team calendar and time-off approvals, captured from the owner’s public app"
            />
            <figcaption>The team calendar. Owner’s public capture.</figcaption>
          </figure>
        </section>
        <section className="iss-index" id="iss-index">
          <div className="iss-index-heading">
            <h2>
              The complete
              <br />
              <em>index.</em>
            </h2>
            <p>
              28 projects. The same care,
              <br />
              across different kinds of work.
            </p>
          </div>
          <div className="iss-index-rows">
            {projects.map((p, i) => (
              <details key={p.slug}>
                <summary>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <strong>{p.name}</strong>
                  <span>{p.years ?? "—"}</span>
                </summary>
                <div>
                  <p>{p.summary}</p>
                  <p>{p.stack.join(" · ")}</p>
                  <nav>
                    {p.links.map((l) => (
                      <a
                        key={l.href}
                        href={l.href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {l.label}
                      </a>
                    ))}
                  </nav>
                </div>
              </details>
            ))}
          </div>
        </section>
        <section className="iss-about" id="iss-about">
          <h2>
            Behind
            <br />
            <em>the pages.</em>
          </h2>
          <div>
            <p>
              I'm Gentrit Rashiti, a frontend and mobile developer, now working
              across the full stack.
            </p>
            <p>
              React, Next.js, Vue and Nuxt for the web. React Native on iOS and
              Android. Laravel and FastAPI behind the interface.
            </p>
            <p>
              Based in Kosovo. Working remotely.
              <br />
              Bachelor’s degree · UBT
            </p>
            <a className="iss-email" href={`mailto:${links.email}`}>
              {links.email}
            </a>
            <nav>
              <a href={links.linkedin}>LinkedIn</a>
              <a href={links.github}>GitHub</a>
              <a href={links.cv}>Download CV</a>
            </nav>
          </div>
        </section>
      </main>
      <footer>
        <a href="/drafts">All drafts</a>
        <span>Gentrit Rashiti · 2026</span>
      </footer>
    </div>
  );
}
