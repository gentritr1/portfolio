import { Link, useLocation } from "react-router";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { featuredProjects } from "../content/projects";
import { links } from "../content/links";
import { caseCopy } from "./caseCopy";
import "./case.css";

const pad = (n: number) => String(n).padStart(2, "0");

/** The address has no page. The title says so once; the list opens every case. */
export default function NotFoundPage() {
  const { pathname } = useLocation();

  return (
    <div className="cs cs-404">
      <title>Page not found — Gentrit Rashiti</title>
      <meta name="robots" content="noindex" />
      <main className="cs-main">
        <header className="cs-head">
          <nav className="cs-nav" aria-label="Site">
            <Link to="/" className="cs-back">
              <ArrowLeftIcon aria-hidden="true" size={16} weight="bold" />
              All work
            </Link>
            <span className="cs-nav-end">
              <a href={links.cv} download>
                CV (PDF)
              </a>
              <a href={`mailto:${links.email}`}>Email</a>
            </span>
          </nav>
          <p className="cs-name">
            <span>Gentrit Rashiti</span>
          </p>
          <h1>There is no page at this address.</h1>
          <p className="cs-sentence">
            The link to <span className="cs-404-path">{pathname}</span> may be old, or the address may have a typing
            error. Every case is in the list.
          </p>
        </header>

        <section className="cs-404-list" aria-labelledby="cs-404-list-title">
          <h2 id="cs-404-list-title" className="cs-label">
            Open a case
          </h2>
          <ol>
            {featuredProjects.map((project, index) => (
              <li key={project.slug}>
                <Link to={`/work/${project.slug}`}>
                  <span className="cs-num" aria-hidden="true">
                    {pad(index + 1)}
                  </span>
                  <span className="cs-404-name">
                    <strong>{project.name}</strong>
                    <span>{caseCopy[project.slug]?.title ?? project.kind}</span>
                  </span>
                  <ArrowRightIcon className="cs-404-arrow" aria-hidden="true" weight="bold" />
                </Link>
              </li>
            ))}
          </ol>
        </section>

      </main>

      <div className="cs-after">
        <footer className="cs-end">
          <p>Gentrit Rashiti. Based in Kosovo, working remotely.</p>
          <p className="cs-end-links">
            <a href={`mailto:${links.email}`}>{links.email}</a>
            <a href={links.cv} download>
              Download CV (PDF)
            </a>
            <a href={links.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href={links.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
