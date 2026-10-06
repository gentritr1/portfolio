import { Link, useLocation } from "react-router";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { findProject } from "../content/projects";
import { caseCopy } from "./caseCopy";
import { usePageLight } from "./caseLight";
import { CaseEnd, CaseTop, LitLine } from "./caseShell";
import "./case.css";

/** The address has no page. The title says so once; the list opens every case. */
export default function NotFoundPage() {
  const { pathname } = useLocation();
  const page = usePageLight();
  const cases = Object.keys(caseCopy).flatMap((slug) => findProject(slug) ?? []);

  return (
    <div className="cs cs-404" data-fonts={page.fallback ? "fallback" : undefined}>
      <title>Page not found — Gentrit Rashiti</title>
      <meta name="robots" content="noindex" />
      <CaseTop />
      <main>
        <div className="cs-sky">
          <header className="cs-head">
            <div className="cs-id">
              <h1>There is no page at this address.</h1>
              <p className="cs-sentence">
                The link to <span className="cs-404-path">{pathname}</span> may be old, or the address may have a typing
                error. Every case is in the list.
              </p>
              <LitLine page={page} />
            </div>
          </header>
        </div>

        <section className="cs-404-list" aria-labelledby="cs-404-list-title">
          <h2 id="cs-404-list-title">Open a case</h2>
          <ol>
            {cases.map((project) => (
              <li key={project.slug}>
                <Link to={`/work/${project.slug}`}>
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
        <CaseEnd />
      </div>
    </div>
  );
}
