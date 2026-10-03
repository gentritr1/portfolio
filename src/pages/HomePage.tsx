import {
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type CSSProperties,
} from "react";
import { flushSync } from "react-dom";
import { useNavigate, useSearchParams } from "react-router";
import { About } from "../components/home/About";
import { IndexPreview } from "../components/portfolio/IndexPreview";
import {
  selectedSlugs,
  indexArt,
  indexGrounds,
} from "../components/portfolio/indexArt";
import { TransitionLink } from "../components/TransitionLink";
import { ArrowRightIcon, ArrowUpRightIcon } from "../components/ShellIcons";
import { projects, findProject, type Project } from "../content/projects";
import { preloadCase } from "../lib/routes";
import { playChannelSound } from "../lib/channelSound";
import "../components/portfolio/portfolio.css";

const WorkWall = lazy(() => import("../components/portfolio/WorkWall"));
const ExploreCanvas = lazy(
  () => import("../components/portfolio/ExploreCanvas"),
);
const ProjectDrawer = lazy(() =>
  import("../components/home/ProjectDrawer").then((module) => ({
    default: module.ProjectDrawer,
  })),
);
const categories: Record<string, string> = {
  healthcare: "Healthcare",
  streaming: "Streaming",
  reading: "Mobile",
  web3: "Web3",
  personal: "Personal",
  ai: "AI / Web",
};
const selectedProjects = selectedSlugs
  .map((slug) => findProject(slug))
  .filter((project): project is Project => !!project);

export function HomePage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [activeSlug, setActiveSlug] = useState("bayyinah-tv");
  const [hovering, setHovering] = useState(false);
  const [view, setView] = useState<"index" | "wall">("index");
  const [all, setAll] = useState(false);
  const [canvas, setCanvas] = useState(false);
  const list = useRef<HTMLDivElement>(null);
  const active = findProject(activeSlug) ?? selectedProjects[0];
  const drawer = findProject(params.get("p") ?? undefined);
  const rows = all ? projects : selectedProjects;
  const WorkHeading = view === "wall" ? "h1" : "h2";

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.portfolio = view;
    root.style.setProperty(
      "--portfolio-ground",
      indexGrounds[activeSlug] ?? "#244b83",
    );
    return () => {
      delete root.dataset.portfolio;
      root.style.removeProperty("--portfolio-ground");
    };
  }, [activeSlug, view]);

  function select(project: Project, hover = false) {
    setActiveSlug(project.slug);
    setHovering(hover);
  }
  async function openProject(slug: string) {
    const project = findProject(slug);
    if (!project) return;
    playChannelSound(projects.indexOf(project) % 6);
    if (!project.featured) {
      setParams({ p: slug }, { preventScrollReset: true });
      return;
    }
    await preloadCase(slug);
    const go = () => flushSync(() => navigate(`/work/${slug}`));
    if (
      document.startViewTransition &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      document.startViewTransition(go);
    else go();
  }
  function moveSelection(event: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const links = Array.from(
      list.current?.querySelectorAll<HTMLAnchorElement | HTMLButtonElement>(
        "[data-project-row]",
      ) ?? [],
    ).filter((node) => node.getClientRects().length > 0);
    const current = links.indexOf(document.activeElement as HTMLAnchorElement);
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? links.length - 1
          : (current + (event.key === "ArrowDown" ? 1 : -1) + links.length) %
            links.length;
    links[next]?.focus();
  }
  useEffect(() => {
    const handle = (event: globalThis.KeyboardEvent) => {
      if (
        event.key.toLowerCase() !== "o" ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        document.querySelector("dialog[open]")
      )
        return;
      setCanvas(true);
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, []);

  return (
    <>
      <title>Gentrit Rashiti — frontend, mobile & full stack</title>
      <div className="portfolio-shell">
        <section
          className="portfolio-intro"
          data-view={view}
          aria-labelledby="intro-title"
        >
          <h1 id="intro-title">Gentrit Rashiti</h1>
          <div className="portfolio-bio">
            <p>
              Frontend & mobile developer, <br />
              now full stack.
            </p>
            <p>
              5+ years · React · React Native · Vue · Laravel
              <br />
              Based in Kosovo. Working remotely.
            </p>
          </div>
        </section>
        <section id="work" aria-labelledby="work-title">
          <div className="work-toolbar">
            <WorkHeading id="work-title">
              {all || view === "wall" ? "All work" : "Selected work"}
              <span>{all || view === "wall" ? "28" : "08"}</span>
            </WorkHeading>
            <div
              className="work-view-switch"
              role="group"
              aria-label="Work view"
            >
              <button
                type="button"
                aria-pressed={view === "index"}
                onClick={() => setView("index")}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden
                >
                  <path d="M1 3h14M1 8h14M1 13h14" stroke="currentColor" />
                </svg>
                Index
              </button>
              <button
                type="button"
                aria-pressed={view === "wall"}
                onClick={() => setView("wall")}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M1 1h5v6H1zm9 0h5v4h-5zM1 11h5v4H1zm9-2h5v6h-5z"
                    stroke="currentColor"
                  />
                </svg>
                Wall
              </button>
            </div>
            <button
              type="button"
              className="canvas-entry"
              onClick={() => setCanvas(true)}
              aria-label="Explore the canvas"
            >
              <span className="canvas-label-desktop">Explore the canvas</span>
              <span className="canvas-label-mobile" aria-hidden>
                Canvas
              </span>
              <ArrowUpRightIcon size={16} aria-hidden />
            </button>
          </div>
          {view === "index" ? (
            <div className="index-layout">
              <div>
                <div
                  ref={list}
                  className="project-index"
                  onKeyDown={moveSelection}
                  onPointerLeave={() => setHovering(false)}
                >
                  {rows.map((project, index) => {
                    const content = (
                      <>
                        <span className="index-number">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="index-row-main">
                          <span
                            className="index-project-name"
                            data-name={project.name}
                            style={
                              {
                                "--name-image": `url("${indexArt[project.slug]?.images.at(-1) ?? project.media.shot?.src ?? ""}")`,
                              } as CSSProperties
                            }
                          >
                            {project.name}
                          </span>
                          <span className="index-mobile-kind">
                            {categories[project.channel]} · {project.years}
                          </span>
                        </span>
                        <span className="index-row-meta">
                          {categories[project.channel]}
                          <span>{project.years}</span>
                        </span>
                        <ArrowRightIcon
                          size={23}
                          aria-hidden
                          className="index-row-arrow"
                        />
                      </>
                    );
                    const props = {
                      "data-project-row": project.slug,
                      "data-active": activeSlug === project.slug,
                      className: "index-row",
                      onFocus: () => {
                        if (window.matchMedia("(min-width: 761px)").matches)
                          select(project);
                      },
                      onPointerEnter: (event: PointerEvent) => {
                        if (
                          event.pointerType === "mouse" &&
                          window.matchMedia("(min-width: 761px)").matches
                        )
                          select(project, true);
                      },
                    };
                    return project.featured ? (
                      <TransitionLink
                        {...props}
                        key={project.slug}
                        to={`/work/${project.slug}`}
                        preload={() => preloadCase(project.slug)}
                      >
                        {content}
                      </TransitionLink>
                    ) : (
                      <button
                        {...props}
                        key={project.slug}
                        type="button"
                        onClick={() => void openProject(project.slug)}
                      >
                        {content}
                      </button>
                    );
                  })}
                </div>
                <div className="index-after">
                  <button
                    type="button"
                    className="text-action"
                    onClick={() => setAll((value) => !value)}
                  >
                    {all ? "Back to selected work" : "View all 28 projects"}
                    <ArrowRightIcon size={18} aria-hidden />
                  </button>
                  <span>↑ ↓ to explore · Enter to open</span>
                </div>
              </div>
              <IndexPreview
                key={active.slug}
                project={active}
                hovering={hovering}
                onOpen={() => void openProject(active.slug)}
              />
            </div>
          ) : (
            <Suspense
              fallback={
                <div className="portfolio-view-loading" role="status">
                  Loading the work wall…
                </div>
              }
            >
              <WorkWall onProject={(slug) => void openProject(slug)} />
            </Suspense>
          )}
        </section>
      </div>
      <About />
      {canvas && (
        <Suspense
          fallback={
            <div className="portfolio-loading-overlay" role="status">
              Opening the canvas…
            </div>
          }
        >
          <ExploreCanvas onClose={() => setCanvas(false)} />
        </Suspense>
      )}
      {drawer && (
        <Suspense fallback={null}>
          <ProjectDrawer
            key={drawer.slug}
            project={drawer}
            onClose={() => setParams({}, { preventScrollReset: true })}
          />
        </Suspense>
      )}
    </>
  );
}
