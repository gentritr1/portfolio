import { links } from "../content/links";
import { ArrowUpRightIcon } from "./ShellIcons";

export function Footer() {
  return (
    <footer className="portfolio-footer">
      <div className="portfolio-shell">
        <div className="footer-invitation">
          <h2>
            Have something
            <br />
            in mind?
          </h2>
          <a href={`mailto:${links.email}`}>
            {links.email}
            <ArrowUpRightIcon size={26} aria-hidden />
          </a>
        </div>
        <div className="footer-links">
          <p>© 2026 Gentrit Rashiti · Kosovo</p>
          <a href={links.github}>GitHub</a>
          <a href={links.linkedin}>LinkedIn</a>
          <a href={links.cv} download>
            Download CV
          </a>
          <a href="#main">Back to top</a>
        </div>
      </div>
    </footer>
  );
}
