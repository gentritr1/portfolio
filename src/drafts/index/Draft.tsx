import { OldCareFile } from '../../components/portfolio/OldCareFile'
import { OldDraftMotion } from '../../components/portfolio/OldDraftMotion'
import { transitionOldDraft } from '../../components/portfolio/oldDraftTransition'
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { projects } from "../../content/projects";
import { links } from "../../content/links";
import {
  indexArt,
  indexGrounds,
  selectedSlugs,
} from "../../components/portfolio/indexArt";
import "./index.css";

const selected = selectedSlugs.map((slug) =>
  projects.find((p) => p.slug === slug)!,
);
const featured = projects.find((p) => p.slug === "read-to-feed")!;

/** The screen inside each 780 px store frame, below the glass corners. */
const screens: Record<string, { x: number; y: number; w: number; h: number }> = {
  "/mobile/reading-1.webp": { x: 91, y: 540, w: 598, h: 1149 },
  "/mobile/reading-3.webp": { x: 91, y: 452, w: 598, h: 1237 },
  "/mobile/grocery-1.webp": { x: 100, y: 360, w: 580, h: 1180 },
  "/mobile/grocery-2.webp": { x: 100, y: 360, w: 580, h: 1180 },
};

function LiquidName({ name, source }: { name: string; source: string }) {
  const text = useRef<HTMLSpanElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (
      matchMedia("(prefers-reduced-motion: reduce), (prefers-contrast: more)")
        .matches
    )
      return;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    import("./liquid")
      .then(async ({ mountLiquid }) => {
        if (disposed || !text.current || !canvas.current) return;
        cleanup = await mountLiquid(canvas.current, text.current, source);
        if (disposed) cleanup?.();
      })
      .catch(() => {});
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [name, source]);
  return (
    <span
      className="di-name"
      data-long={name.length > 18}
      ref={text}
      style={{ "--di-image": `url("${source}")` } as CSSProperties}
    >
      <span>{name}</span>
      <span aria-hidden="true" className="di-name-image">
        {name}
      </span>
      <canvas aria-hidden="true" ref={canvas} />
    </span>
  );
}

export default function Draft() {
  const [active, setActive] = useState("read-to-feed");
  const [all, setAll] = useState(false);
  const preview = useRef<HTMLDivElement>(null);
  const current = projects.find((p) => p.slug === active)!;
  const art = indexArt[active];
  function chooseProject(slug: string) { if (slug !== active) transitionOldDraft(() => setActive(slug)) }
  function tilt(event: React.PointerEvent<HTMLDivElement>) {
    if (
      event.pointerType !== "mouse" ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--rx",
      `${((event.clientY - box.top - box.height / 2) / box.height) * -8}deg`,
    );
    event.currentTarget.style.setProperty(
      "--ry",
      `${((event.clientX - box.left - box.width / 2) / box.width) * 10}deg`,
    );
  }
  return (
    <div
      className="draft-index"
      style={
        {
          "--di-ground":
            active === "read-to-feed" ? "#074da1" : indexGrounds[active],
        } as CSSProperties
      }
    >
      <OldDraftMotion />
      <title>Work in focus — Gentrit Rashiti</title>
      <header className="di-header">
        <a href="/drafts">Gentrit Rashiti</a>
        <p>
          Frontend & mobile developer,
          <br />
          now full stack.
        </p>
        <nav>
          <a href="#di-about">About</a>
          <a href={`mailto:${links.email}`}>Email</a>
          <a href={links.cv} download>CV</a>
        </nav>
      </header>
      <main>
        <section className="di-work" aria-label="Selected work">
          <div className="di-selection">
            <div className="di-selection-label">
              <h1>Work in focus.</h1>
              <span>2021–26</span>
            </div>
            <ol>
              {selected.map((project, i) => (
                <li key={project.slug} data-active={active === project.slug}>
                  <button
                    onClick={() => chooseProject(project.slug)}
                    onFocus={() => chooseProject(project.slug)}
                    aria-pressed={active === project.slug}
                  >
                    <span className="di-ordinal">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {active === project.slug ? (
                      <LiquidName
                        name={project.name}
                        source={indexArt[project.slug].images[0]}
                      />
                    ) : (
                      <span className="di-inactive-name">{project.name}</span>
                    )}
                  </button>
                  {active === project.slug && (
                    <p className="di-mobile-context">
                      <span>{current.kind}</span>
                      <strong>{art.proof}</strong>
                    </p>
                  )}
                </li>
              ))}
            </ol>
            <button
              className="di-all"
              onClick={() => {
                setAll(true);
                requestAnimationFrame(() =>
                  document
                    .getElementById("di-all")
                    ?.scrollIntoView({ behavior: "instant" }),
                );
              }}
            >
              All {projects.length} projects <span aria-hidden="true">+</span>
            </button>
          </div>
          <aside className="di-preview" aria-label={`${current.name} preview`}>
            <div
              ref={preview}
              className="di-art"
              data-type={art.type}
              key={active}
              onPointerMove={tilt}
              onPointerLeave={() => {
                preview.current?.style.setProperty("--rx", "0deg");
                preview.current?.style.setProperty("--ry", "0deg");
              }}
            >
              {art.images.map((src, i) => {
                const alt = `${current.name}: ${art.caption}, frame ${i + 1}`;
                const crop = screens[src];
                if (!crop)
                  return <img key={src} src={src} alt={alt} decoding="async" />;
                return (
                  <span
                    key={src}
                    className="di-crop"
                    style={{ aspectRatio: `${crop.w} / ${crop.h}` }}
                  >
                    <img
                      src={src}
                      alt={alt}
                      decoding="async"
                      style={{
                        width: `${(780 / crop.w) * 100}%`,
                        left: `${(-crop.x / crop.w) * 100}%`,
                        top: `${(-crop.y / crop.h) * 100}%`,
                      }}
                    />
                  </span>
                );
              })}
            </div>
            <div className="di-preview-caption">
              <span>
                {current.kind} · {current.years}
              </span>
              <h2>{art.proof}</h2>
              <p>{art.detail}</p>
              <small>{art.caption}</small>
              <a
                href={current.featured ? `/work/${active}` : "#di-all"}
                onClick={() => !current.featured && setAll(true)}
              >
                Explore {current.name}
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 12h16M13 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </aside>
        </section>
        <section className="di-case" id="di-case">
          <div>
            <h2>
              Reading,
              <br />
              over time.
            </h2>
            <p>Read to Feed · 2022–25</p>
            <p>{featured.summary}</p>
            <a href="/work/read-to-feed">Read the full case</a>
          </div>
          <figure>
            <img
              src="/mobile/reading-3.webp"
              loading="lazy"
              alt="Read to Feed book reader, from its public store listing"
            />
            <figcaption>Public store frame</figcaption>
          </figure>
        </section>
        <section className="di-archive" id="di-all">
          <button
            className="di-archive-toggle"
            aria-expanded={all}
            onClick={() => setAll(!all)}
          >
            <h2>All {projects.length} projects</h2>
            <span>{all ? "Close" : "Open index"}</span>
          </button>
          {all && (
            <div>
              {projects.map((p) => (
                <details key={p.slug}>
                  <summary>
                    <span>{p.name}</span>
                    <span>{p.years ?? "—"}</span>
                  </summary>
                  <OldCareFile slug={p.slug} /><p>{p.summary}</p>
                  <p>{p.stack.join(" · ")}</p>
                  <div>
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
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>
        <section className="di-about" id="di-about">
          <h2>
            Gentrit
            <br />
            Rashiti.
          </h2>
          <div>
            <p>
              Web and mobile products, from the first screen to release. Five
              years of work across healthcare, streaming, reading and Web3.
            </p>
            <p>
              React, React Native, Vue and Nuxt. Laravel and FastAPI behind the
              interface.
            </p>
            <p>
              Based in Kosovo. Working remotely.
              <br />
              Bachelor’s degree · UBT
            </p>
            <a className="di-email" href={`mailto:${links.email}`}>
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
