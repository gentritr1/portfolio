import { lazy, Suspense, useEffect, useState } from "react";
import { useLocation } from "react-router";
import { links } from "../content/links";
import { SoundToggle } from "./SoundToggle";
import { ThemeToggle } from "./ThemeToggle";
import { TransitionLink } from "./TransitionLink";

const ProjectSearch = lazy(() => import("./portfolio/ProjectSearch"));

export function Masthead() {
  const [search, setSearch] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearch((value) => !value);
      }
    };
    document.addEventListener("keydown", shortcut);
    return () => document.removeEventListener("keydown", shortcut);
  }, []);
  return (
    <>
      <header data-masthead className="portfolio-masthead">
        <div className="portfolio-shell masthead-content">
          <TransitionLink
            to="/"
            className="identity-link"
            aria-label="Gentrit Rashiti, home"
          >
            <img src="/mark.svg" width="42" height="42" alt="" />
            <span>
              Gentrit Rashiti
              <span className="identity-location">Kosovo · Remote</span>
            </span>
          </TransitionLink>
          <nav aria-label="Main navigation" className="portfolio-navigation">
            <TransitionLink
              to="/#work"
              className={pathname === "/" ? "nav-current" : ""}
            >
              Work
            </TransitionLink>
            <TransitionLink to="/#about">About</TransitionLink>
            <a href={`mailto:${links.email}`}>
              Email
              <svg
                aria-hidden
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path d="M2 10 10 2M2 2h8v8" stroke="currentColor" />
              </svg>
            </a>
            <a href={links.cv} download className="cv-link">
              CV
              <svg
                aria-hidden
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path d="M6 1v7m-3-3 3 3 3-3M2 9v2h8V9" stroke="currentColor" />
              </svg>
            </a>
          </nav>
          <div className="masthead-tools">
            <button
              type="button"
              className="search-trigger"
              onClick={() => setSearch(true)}
              aria-label="Search projects"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden
              >
                <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" />
                <path d="m13 13 4 4" stroke="currentColor" />
              </svg>
              <kbd>⌘ K</kbd>
            </button>
            <SoundToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>
      {search && (
        <Suspense fallback={null}>
          <ProjectSearch onClose={() => setSearch(false)} />
        </Suspense>
      )}
    </>
  );
}
