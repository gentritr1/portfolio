import { OldCareFile } from '../../components/portfolio/OldCareFile'
import { OldDraftMotion } from '../../components/portfolio/OldDraftMotion'
import { transitionOldDraft } from '../../components/portfolio/oldDraftTransition'
import { useCallback, useEffect, useRef, useState } from "react";
import { currentYear, projects } from "../../content/projects";
import { links } from "../../content/links";
import { objects } from "./objects";
import type { DeskScene } from "./scene";
import "./desk.css";

function Arrow() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M4 12h15M12 5l7 7-7 7" />
    </svg>
  );
}

export default function Draft() {
  const host = useRef<HTMLDivElement>(null);
  const fallback = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const scene = useRef<DeskScene | null>(null);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const [staticView, setStaticView] = useState(
    () =>
      matchMedia("(prefers-reduced-motion: reduce), (max-width: 599px)")
        .matches,
  );
  const selected = objects[active];
  const snaxx = objects[0].project;

  const select = useCallback((index: number) => {
    transitionOldDraft(() => setActive(index));
    scene.current?.select(index);
    requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true });
      document
        .getElementById("dk-project")
        ?.scrollIntoView({ behavior: "instant", block: "start" });
    });
  }, []);

  useEffect(() => {
    const preference = matchMedia(
      "(prefers-reduced-motion: reduce), (max-width: 599px)",
    );
    const change = () => setStaticView(preference.matches);
    preference.addEventListener("change", change);
    return () => preference.removeEventListener("change", change);
  }, []);

  useEffect(() => {
    if (staticView || !host.current || !fallback.current) return;
    let cancelled = false;
    const images = Array.from(
      fallback.current.querySelectorAll<HTMLImageElement>("img"),
    );
    void Promise.all([
      import("./scene"),
      Promise.all(images.map((image) => image.decode())),
    ])
      .then(([module]) => {
        if (cancelled || !host.current) return;
        const result = module.createDesk(
          host.current,
          images,
          () => {
            if (!cancelled) setReady(true);
          },
          select,
          () => {
            if (!cancelled) setReady(false);
          },
        );
        scene.current = result;
      })
      .catch(() => {
        /* The complete image-backed workbench remains visible. */
      });
    return () => {
      cancelled = true;
      scene.current?.dispose();
      scene.current = null;
      setReady(false);
    };
  }, [staticView, select]);

  return (
    <div className="draft-desk">
      <OldDraftMotion />
      <title>At work — Gentrit Rashiti</title>
      <header className="dk-header">
        <a href="/drafts">Gentrit Rashiti</a>
        <nav aria-label="Portfolio navigation">
          <a href="#dk-work">All {projects.length}</a>
          <a href="#dk-about">About</a>
          <a href={`mailto:${links.email}`}>
            Email
            <Arrow />
          </a>
        </nav>
      </header>
      <main>
        <section className="dk-cover" aria-labelledby="dk-title">
          <div className="dk-title">
            <h1 id="dk-title">
              At
              <br />
              <span className="dk-title-word">work.</span>
            </h1>
            <p>
              Frontend & mobile developer,
              <br />
              now full stack.
            </p>
            <p>Kosovo · Remote · 5+ years</p>
          </div>
          <div className="dk-stage" data-ready={ready}>
            <div className="dk-fallback" ref={fallback}>
              <div className="dk-table" aria-hidden="true" />
              {objects.map((item, index) => (
                <button
                  className={`dk-object dk-object-${index}`}
                  type="button"
                  key={item.slug}
                  onClick={() => select(index)}
                  aria-label={`Open ${item.project.name}, ${item.object.toLowerCase()}`}
                  tabIndex={ready ? -1 : 0}
                  aria-hidden={ready || undefined}
                >
                  <span className="dk-object-poster" aria-hidden="true">
                    {item.project.name}
                  </span>
                  <img
                    src={item.src}
                    alt={item.alt}
                    decoding="async"
                    loading="eager"
                    fetchPriority={index === 0 ? "high" : "auto"}
                  />
                  <span className="dk-object-base" aria-hidden="true" />
                </button>
              ))}
            </div>
            <div className="dk-canvas" ref={host} aria-hidden="true" />
          </div>
          <div className="dk-workbench-links">
            <div className="dk-workbench-intro">
              <p>Pick something from the desk.</p>
              {!staticView && (
                <button
                  type="button"
                  onClick={() => scene.current?.replay()}
                  disabled={!ready}
                >
                  Replay the view
                  <Arrow />
                </button>
              )}
            </div>
            <div className="dk-object-list" aria-label="Projects on the desk">
              {objects.map((item, index) => (
                <button
                  type="button"
                  key={item.slug}
                  aria-pressed={active === index}
                  onClick={() => select(index)}
                >
                  <span>{item.object}</span>
                  <strong>{item.project.name}</strong>
                  <Arrow />
                </button>
              ))}
            </div>
          </div>
        </section>

        <section
          className="dk-project"
          id="dk-project"
          aria-labelledby="dk-project-title"
        >
          <div>
            <h2 id="dk-project-title" tabIndex={-1} ref={heading}>
              {selected.project.name}
            </h2>
            <p className="dk-project-meta">
              {selected.project.kind} · {selected.project.years}
            </p>
            <p className="dk-project-summary">{selected.project.summary}</p>
            <dl>
              <div>
                <dt>Role</dt>
                <dd>{selected.project.role}</dd>
              </div>
              <div>
                <dt>Stack</dt>
                <dd>{selected.project.stack.join(" · ")}</dd>
              </div>
            </dl>
            <div className="dk-project-links">
              {selected.slug === "snaxx-tech" && (
                <a href="#dk-case">
                  Read the featured case
                  <Arrow />
                </a>
              )}
              {selected.project.featured && (
                <a href={`/work/${selected.slug}`}>
                  Read the full case
                  <Arrow />
                </a>
              )}
              {selected.project.links.map((link) => (
                <a
                  href={link.href}
                  key={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                  <Arrow />
                  <span className="dk-sr"> (opens in a new tab)</span>
                </a>
              ))}
            </div>
          </div>
          <figure>
            <img src={selected.src} alt={selected.alt} />
            <figcaption>
              {selected.slug === "offday"
                ? "Personal project · demonstration workspace"
                : selected.slug === "read-to-feed" ||
                    selected.slug === "viva-fresh"
                  ? "Public store frame"
                  : "Public project screenshot"}
            </figcaption>
          </figure>
        </section>

        <article
          className="dk-case"
          id="dk-case"
          aria-labelledby="dk-case-title"
        >
          <h2 id="dk-case-title">
            A studio
            <br />
            on a screen.
          </h2>
          <div className="dk-case-body">
            <p className="dk-case-lead">
              Snaxx Tech · Personal project · {snaxx.years}
            </p>
            <p>{snaxx.summary}</p>
            <p>
              The visual world brings the studio’s apps and games together in
              the Snaxx Almanac. A three.js hero and a seamless cinemagraph loop
              sit inside a React and Vite site.
            </p>
            <p>
              Image weight went from 972 KB to 337 KB. The deploy went from 28
              MB to 9.5 MB. The site runs on Vercel under a strict content
              security policy.
            </p>
            <a
              href={snaxx.links[0].href}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit Snaxx Tech
              <Arrow />
              <span className="dk-sr"> (opens in a new tab)</span>
            </a>
          </div>
          <figure>
            <img src={objects[0].src} alt={objects[0].alt} loading="lazy" />
            <figcaption>Snaxx Tech · public website</figcaption>
          </figure>
        </article>

        <section
          id="dk-work"
          className="dk-work"
          aria-labelledby="dk-work-title"
        >
          <div className="dk-section-heading">
            <h2 id="dk-work-title">The whole desk.</h2>
            <p>{projects.length} projects across web & mobile.</p>
          </div>
          {projects.map((project) => (
            <details key={project.slug}>
              <summary>
                <span>{project.name}</span>
                <span>{project.years ?? "—"}</span>
                <Arrow />
              </summary>
              <div className="dk-work-detail">
                <OldCareFile slug={project.slug} /><p>{project.summary}</p>
                <dl>
                  <div>
                    <dt>Role</dt>
                    <dd>{project.role}</dd>
                  </div>
                  <div>
                    <dt>Stack</dt>
                    <dd>{project.stack.join(" · ")}</dd>
                  </div>
                </dl>
                <div className="dk-project-links">
                  {project.slug === snaxx.slug && (
                    <a href="#dk-case">
                      Read the featured case
                      <Arrow />
                    </a>
                  )}
                  {project.links.map((link) => (
                    <a
                      href={link.href}
                      key={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label}
                      <Arrow />
                      <span className="dk-sr"> (opens in a new tab)</span>
                    </a>
                  ))}
                </div>
              </div>
            </details>
          ))}
        </section>

        <section
          className="dk-about"
          id="dk-about"
          aria-labelledby="dk-about-title"
        >
          <h2 id="dk-about-title">
            Screen.
            <br />
            System.
            <br />
            Release.
          </h2>
          <div>
            <p>
              Gentrit Rashiti builds web and mobile products. Five-plus years of
              work includes two platform rewrites, healthcare, streaming,
              e-reading and Web3.
            </p>
            <p>
              React, Next.js, Vue and Nuxt. React Native for iOS and Android.
              Laravel and FastAPI behind the interface.
            </p>
            <p>
              Kosovo · Remote
              <br />
              Bachelor’s degree · UBT
            </p>
            <nav aria-label="Profile links">
              <a href={links.cv} download>
                Download CV
                <Arrow />
              </a>
              <a href={links.github} target="_blank" rel="noopener noreferrer">
                GitHub
                <Arrow />
              </a>
              <a
                href={links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
                <Arrow />
              </a>
            </nav>
          </div>
          <a className="dk-email" href={`mailto:${links.email}`}>
            {links.email}
            <Arrow />
          </a>
        </section>
      </main>
      <footer className="dk-footer">
        <a href="/drafts">All art directions</a>
        <span>Gentrit Rashiti · {currentYear}</span>
        <a href="#dk-title">
          Back to the desk
          <Arrow />
        </a>
      </footer>
    </div>
  );
}
