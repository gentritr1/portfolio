import { OldCareFile } from '../../components/portfolio/OldCareFile'
import { OutlineName } from '../../components/portfolio/OutlineName'
import { OldDraftMotion } from '../../components/portfolio/OldDraftMotion'
import { useEffect, useRef, useState } from "react";
import { projects } from "../../content/projects";
import { links } from "../../content/links";
import "./swiss.css";

const care = projects.find((p) => p.slug === "care-platform")!;
const offsets = [0, 18, -10, 24, -7, 15, 0];
const selected = [
  {
    slug: "care-platform",
    image: "/signal-posters/healthcare.avif",
    caption: "Recreation · invented data",
  },
  {
    slug: "bayyinah-tv",
    image: "/showcase/bayyinah/web-01.webp",
    caption: "Public website",
  },
  {
    slug: "viva-fresh",
    image: "/mobile/grocery-1.webp",
    caption: "Public store frame",
  },
];

export default function Draft() {
  const hero = useRef<HTMLElement>(null);
  const [reset, setReset] = useState(0);
  useEffect(() => {
    const node = hero.current;
    if (!node) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    function paint() {
      frame = 0;
      const box = node!.getBoundingClientRect();
      const progress = preference.matches
        ? 1
        : Math.max(0, Math.min(1, -box.top / (innerHeight * 0.55)));
      node!.style.setProperty("--sw-p", String(progress));
    }
    function scroll() {
      if (!frame) frame = requestAnimationFrame(paint);
    }
    paint();
    addEventListener("scroll", scroll, { passive: true });
    addEventListener("resize", scroll);
    preference.addEventListener("change", paint);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", scroll);
      removeEventListener("resize", scroll);
      preference.removeEventListener("change", paint);
    };
  }, []);
  return (
    <div className="draft-swiss">
      <OldDraftMotion />
      <title>In formation — Gentrit Rashiti</title>
      <header className="sw-header">
        <a href="/drafts">Gentrit Rashiti</a>
        <nav>
          <a href="#sw-work">Work</a>
          <a href="#sw-index">Index</a>
          <a href="#sw-about">About</a>
          <a href={`mailto:${links.email}`}>Email</a>
        </nav>
      </header>
      <main>
        <section className="sw-hero" ref={hero}>
          <div className="sw-hero-top">
            <p>
              Frontend & mobile developer.
              <br />
              Now full stack.
            </p>
            <p>
              Kosovo · Working remotely.
              <br />
              2021–2026
            </p>
            <button
              onClick={() => {
                setReset(reset + 1);
                hero.current?.scrollIntoView({
                  behavior: matchMedia("(prefers-reduced-motion: reduce)")
                    .matches
                    ? "instant"
                    : "smooth",
                });
              }}
            >
              Reset the type
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 8a8 8 0 1 1-1 8M5 3v5h5" />
              </svg>
            </button>
          </div>
          <h1 aria-label="Gentrit Rashiti" key={reset}><OutlineName>
            {["GENTRIT", "RASHITI"].map((name, row) => (
              <span className="sw-name-line" aria-hidden="true" key={name}>
                {name.split("").map((letter, i) => (
                  <span
                    className="sw-letter"
                    data-inverse={(i + row) % 3 === 1}
                    key={i}
                    style={
                      {
                        "--sw-offset": `${offsets[(i + row * 2) % 7]}px`,
                        "--sw-delay": `${i * 35}ms`,
                      } as React.CSSProperties
                    }
                  >
                    {letter}
                  </span>
                ))}
              </span>
            ))}
          </OutlineName></h1>
          <div className="sw-hero-bottom">
            <p>
              Web. Mobile.
              <br />
              The whole build.
            </p>
            <a href="#sw-work">
              Explore the work
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3v18m-7-7 7 7 7-7" />
              </svg>
            </a>
            <span>5+ years · {projects.length} projects</span>
          </div>
        </section>
        <section className="sw-work" id="sw-work">
          <h2>
            Selected
            <br />
            work.
          </h2>
          <div className="sw-work-grid">
            {selected.map((item) => {
              const p = projects.find((p) => p.slug === item.slug)!;
              return (
                <a
                  href={
                    item.slug === "care-platform"
                      ? "#sw-case"
                      : `/work/${item.slug}`
                  }
                  key={p.slug}
                >
                  <figure>
                    <img
                      src={item.image}
                      alt={`${p.name}. ${item.caption}`}
                      loading="lazy"
                    />
                    <figcaption>{item.caption}</figcaption>
                  </figure>
                  <h3>{p.name}</h3>
                  <p>
                    {p.kind} · {p.years}
                  </p>
                </a>
              );
            })}
          </div>
        </section>
        <section className="sw-case" id="sw-case">
          <div>
            <h2>
              One route
              <br />
              at a time.
            </h2>
            <p>Care-management platform · 2023–26</p>
          </div>
          <article>
            <OldCareFile slug={care.slug} /><p>{care.summary}</p>
            <blockquote>
              Vue to React.
              <br />
              Parity before cutover.
            </blockquote>
            <p>
              A multi-tenant platform for care teams, with vitals, care plans,
              lab results, claims, calls and chat. The interface supports
              English, German, Spanish and Turkish.
            </p>
            <a href="/work/care-platform">
              Read the complete case
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 20 20 4M4 4h16v16" />
              </svg>
            </a>
          </article>
        </section>
        <section className="sw-index" id="sw-index">
          <header>
            <h2>All work.</h2>
            <p>{projects.length} projects, 2021–26</p>
          </header>
          {projects.map((p) => (
            <details key={p.slug}>
              <summary>
                <strong>{p.name}</strong>
                <span>{p.kind}</span>
                <span>{p.years ?? "—"}</span>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 4v16M4 12h16" />
                </svg>
              </summary>
              <div>
                <OldCareFile slug={p.slug} /><p>{p.summary}</p>
                <p>{p.stack.join(" · ")}</p>
                <nav>
                  {p.links.map((l) => (
                    <a
                      href={l.href}
                      key={l.href}
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
        </section>
        <section className="sw-about" id="sw-about">
          <h2>
            Let's make
            <br />
            it work.
          </h2>
          <div>
            <p>
              I'm Gentrit Rashiti. I work on frontend and mobile products, and
              now across the full stack.
            </p>
            <p>
              React, React Native, Vue and Nuxt. Laravel and FastAPI behind the
              interface. Based in Kosovo, working remotely.
            </p>
            <p>Bachelor’s degree · UBT</p>
            <a className="sw-email" href={`mailto:${links.email}`}>
              {links.email}
            </a>
            <nav>
              <a href={links.linkedin}>LinkedIn</a>
              <a href={links.github}>GitHub</a>
              <a href={links.cv} download>Download CV</a>
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
