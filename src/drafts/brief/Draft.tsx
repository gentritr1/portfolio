import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router";
import { ArrowRightIcon, ArrowUpRightIcon } from "@phosphor-icons/react";
import { links } from "../../content/links";
import { CropShot } from "../../components/CropShot";
import { briefs, otherProjects, type Brief, type Media } from "./briefs";
import { Proof } from "./Proof";
import "./brief.css";

const pad = (n: number) => String(n).padStart(2, "0");
const sectionIds = ["bf-top", ...briefs.map((_, i) => `bf-${pad(i + 1)}`), "bf-all", "bf-contact"];

function go(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
  target.focus({ preventScroll: true });
}

function Work({ media, name }: { media: Media; name: string }) {
  if (media.kind === "shot") {
    return (
      <figure className="bf-work" data-kind="shot">
        <CropShot shot={media.shot} className="bf-shot" style={{ maxWidth: media.shot.crop.w }} />
        <figcaption>{media.label}</figcaption>
      </figure>
    );
  }
  if (media.kind === "web") {
    return (
      <figure className="bf-work" data-kind="web">
        <img src={media.src} alt={media.alt} width={1440} height={900} loading="lazy" decoding="async" />
        <figcaption>{media.label}</figcaption>
      </figure>
    );
  }
  return (
    <figure className="bf-work" data-kind="phones">
      <div className="bf-phones">
        {media.items.map((item) => (
          <img key={item.src} src={item.src} alt={item.alt} width={780} height={1689} loading="lazy" decoding="async" />
        ))}
      </div>
      <figcaption>
        {name}, {media.label}
      </figcaption>
    </figure>
  );
}

function BriefSection({ brief, index }: { brief: Brief; index: number }) {
  const { project } = brief;
  const id = `bf-${pad(index + 1)}`;
  return (
    <section className="bf-brief" id={id} tabIndex={-1} aria-labelledby={`${id}-title`}>
      <header className="bf-brief-head">
        <span className="bf-num">{pad(index + 1)}</span>
        <h2 id={`${id}-title`}>{project.name}</h2>
        <span className="bf-meta">
          {brief.domain}
          {project.years ? `, ${project.years}` : ""}
        </span>
      </header>
      <Proof source={brief.proof} label={project.name} />
      <div className="bf-brief-body">
        <div className="bf-decision">
          <p>
            <strong>Decision.</strong> {brief.decision}
          </p>
          <p className="bf-role">{project.role}</p>
          <ul className="bf-links">
            <li>
              <Link to={`/work/${project.slug}`} className="bf-case">
                Case study
                <ArrowRightIcon aria-hidden="true" size={16} weight="bold" />
              </Link>
            </li>
            {project.links.map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noreferrer">
                  {link.label}
                  <ArrowUpRightIcon aria-hidden="true" size={14} weight="bold" />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <Work media={brief.media} name={project.name} />
      </div>
    </section>
  );
}

export default function Draft() {
  const [active, setActive] = useState(0);
  const main = useRef<HTMLElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("bf-html");
    return () => html.classList.remove("bf-html");
  }, []);

  useEffect(() => {
    const sections = sectionIds.map((id) => document.getElementById(id)!);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(sections.indexOf(entry.target as HTMLElement));
        });
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let last = { index: 0, time: -Infinity };
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const keys = ["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"];
      if (!keys.includes(event.key)) return;
      const target = event.target as HTMLElement;
      if (target.closest(".bf-work, input, textarea, select, [contenteditable], [role=tab], [role=radio], [role=slider], [role=listbox], [role=menu], [role=combobox]")) return;
      const tops = sectionIds.map((id) => document.getElementById(id)!.getBoundingClientRect().top);
      const forward = event.key === "ArrowDown" || event.key === "ArrowRight";
      const vertical = event.key === "ArrowDown" || event.key === "ArrowUp";
      const moving = performance.now() - last.time < 900;
      const current = moving
        ? last.index
        : tops.reduce((best, top, i) => (Math.abs(top) < Math.abs(tops[best]) ? i : best), 0);
      const aligned = moving || Math.abs(tops[current]) < 24;
      if (vertical && (!aligned || current >= sectionIds.length - 2)) return;
      let next = current;
      if (aligned) next = current + (forward ? 1 : -1);
      else next = forward ? tops.findIndex((top) => top > 24) : tops.findLastIndex((top) => top < -24);
      if (next < 0 || next >= sectionIds.length) return;
      event.preventDefault();
      last = { index: next, time: performance.now() };
      go(sectionIds[next]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const railActive = Math.min(active, briefs.length + 1);

  return (
    <div className="bf">
      <title>Gentrit Rashiti · Briefs</title>
      <nav
        className="bf-rail"
        aria-label="Briefs"
        style={
          {
            "--rail-i": railActive === 0 ? 0 : railActive - 1,
            "--rail-gap": railActive === briefs.length + 1 ? 1 : 0,
          } as CSSProperties
        }
        data-on={railActive > 0 || undefined}
      >
        <span className="bf-rail-mark" aria-hidden="true" />
        <ol>
          {briefs.map((brief, i) => (
            <li key={brief.project.slug}>
              <button
                type="button"
                aria-current={railActive === i + 1 ? "true" : undefined}
                aria-label={`${pad(i + 1)} ${brief.topic}: ${brief.project.name}`}
                onClick={() => go(`bf-${pad(i + 1)}`)}
              >
                <span className="bf-rail-num">{pad(i + 1)}</span>
                <span className="bf-rail-topic">{brief.topic}</span>
              </button>
            </li>
          ))}
          <li className="bf-rail-after">
            <button
              type="button"
              aria-current={railActive === briefs.length + 1 ? "true" : undefined}
              onClick={() => go("bf-all")}
            >
              <span className="bf-rail-num">+{otherProjects.length}</span>
              <span className="bf-rail-topic">All work</span>
            </button>
          </li>
        </ol>
      </nav>

      <main ref={main}>
        <header className="bf-hero" id="bf-top" tabIndex={-1}>
          <h1 className="bf-hero-title">
            Gentrit Rashiti has spent more than five years shipping web and mobile products, through two platform
            rewrites and a design system.
          </h1>
          <p className="bf-hero-sub">
            Frontend and mobile developer, full stack since 2026. Based in Kosovo, working remotely.
          </p>
          <ul className="bf-links bf-hero-links">
            <li>
              <a href={`mailto:${links.email}`}>Email</a>
            </li>
            <li>
              <a href={links.cv}>CV (PDF)</a>
            </li>
            <li>
              <a href={links.github} target="_blank" rel="noreferrer">
                GitHub
              </a>
            </li>
            <li>
              <a href={links.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            </li>
          </ul>
        </header>

        {briefs.map((brief, i) => (
          <BriefSection key={brief.project.slug} brief={brief} index={i} />
        ))}

        <section className="bf-all" id="bf-all" tabIndex={-1} aria-labelledby="bf-all-title">
          <h2 id="bf-all-title">
            {otherProjects.length} more, in one list
          </h2>
          <ol className="bf-rows">
            {otherProjects.map((project) => {
              const link = project.links[0];
              return (
                <li key={project.slug} className="bf-row">
                  <span className="bf-row-name">
                    {link ? (
                      <a href={link.href} target="_blank" rel="noreferrer">
                        {project.name}
                        <ArrowUpRightIcon aria-hidden="true" size={13} weight="bold" />
                      </a>
                    ) : (
                      project.name
                    )}
                  </span>
                  <span className="bf-row-line">{project.line}</span>
                  <span className="bf-row-role">{project.role}</span>
                  <span className="bf-row-years">{project.years ?? "Freelance"}</span>
                </li>
              );
            })}
          </ol>
        </section>

        <footer className="bf-contact" id="bf-contact" tabIndex={-1}>
          <h2 className="bf-mail-line">
            Write to <a href={`mailto:${links.email}`}>{links.email}</a>
          </h2>
          <ul className="bf-links">
            <li>
              <a href={links.cv}>CV (PDF)</a>
            </li>
            <li>
              <a href={links.github} target="_blank" rel="noreferrer">
                {links.githubLabel}
              </a>
            </li>
            <li>
              <a href={links.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            </li>
          </ul>
          <p className="bf-note">
            Bachelor's degree, UBT. The Vianova care and design-system screens on this page are real product screens
            with invented data. Every other screenshot comes from a public page or store listing.
          </p>
        </footer>
      </main>
    </div>
  );
}
