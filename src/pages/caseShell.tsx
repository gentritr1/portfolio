import { Link } from "react-router";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { links } from "../content/links";
import { clockText, RISE, type PageLight } from "./caseLight";

export function CaseTop() {
  return (
    <header className="cs-top">
      <Link to="/" className="cs-back">
        <ArrowLeftIcon aria-hidden="true" size={16} weight="bold" />
        All work
      </Link>
      <nav aria-label="Contact">
        <a href={links.cv} download>
          CV (PDF)
        </a>
        <a href={`mailto:${links.email}`}>Email</a>
      </nav>
    </header>
  );
}

export function LitLine({ page }: { page: PageLight }) {
  const time = clockText(page.ms);
  return (
    <p className="cs-lit">
      <span className="cs-lit-sun" aria-hidden="true" data-down={page.sun.altitude < RISE || undefined} />
      {page.sun.altitude >= RISE ? `Lit by the sun over Kosovo at ${time}.` : `${time} in Kosovo. The sun is down.`}
    </p>
  );
}

export function CaseEnd() {
  return (
    <footer className="cs-end">
      <p>Gentrit Rashiti. Based in Kosovo, working remotely.</p>
      <p className="cs-end-links">
        <a href={`mailto:${links.email}`}>{links.email}</a>
        <a href={links.cv} download>
          Download CV (PDF)
        </a>
        <a href={links.github} target="_blank" rel="noreferrer">
          GitHub<span className="cs-sr"> (opens in a new tab)</span>
        </a>
        <a href={links.linkedin} target="_blank" rel="noreferrer">
          LinkedIn<span className="cs-sr"> (opens in a new tab)</span>
        </a>
      </p>
    </footer>
  );
}
