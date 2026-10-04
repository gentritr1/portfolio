import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import type { Project } from "../../content/projects";
import { indexArt } from "./indexArt";
import { ArrowRightIcon } from "../ShellIcons";

const QuickLoop = lazy(() => import("./QuickLoop"));

export function IndexPreview({
  project,
  hovering,
  onOpen,
}: {
  project: Project;
  hovering: boolean;
  onOpen: () => void;
}) {
  const art = indexArt[project.slug];
  const stage = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [manual, setManual] = useState(false);
  const showLoop = playing && (hovering || manual);
  const finish = useCallback(() => setPlaying(false), []);
  const canPlay = project.featured && project.featured.monitor !== "gallery";

  useEffect(() => {
    if (
      !hovering ||
      !canPlay ||
      !window.matchMedia(
        "(hover: hover) and (prefers-reduced-motion: no-preference)",
      ).matches
    )
      return;
    const timer = window.setTimeout(() => setPlaying(true), 650);
    return () => window.clearTimeout(timer);
  }, [project.slug, hovering, canPlay]);
  useEffect(() => {
    const stop = () => {
      if (document.hidden) setPlaying(false);
    };
    const node = stage.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) setPlaying(false);
    });
    if (node) observer.observe(node);
    document.addEventListener("visibilitychange", stop);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", stop);
    };
  }, []);

  function tilt(event: PointerEvent<HTMLDivElement>) {
    if (
      event.pointerType !== "mouse" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--preview-x",
      `${((event.clientX - rect.left) / rect.width - 0.5) * 9}deg`,
    );
    event.currentTarget.style.setProperty(
      "--preview-y",
      `${-((event.clientY - rect.top) / rect.height - 0.5) * 6}deg`,
    );
  }
  const style = {
    "--art-ground": art?.background ?? "#283339",
    viewTransitionName: `monitor-${project.slug}`,
  } as CSSProperties;
  return (
    <aside className="index-preview" aria-label={`${project.name} preview`}>
      <div
        ref={stage}
        className="index-preview-art"
        data-format={art?.type ?? "web"}
        style={style}
        onPointerMove={tilt}
        onPointerLeave={(event) => {
          event.currentTarget.style.setProperty("--preview-x", "0deg");
          event.currentTarget.style.setProperty("--preview-y", "0deg");
        }}
      >
        <div key={project.slug} className="index-art-composition">
          {(
            art?.images ?? [
              project.media.galleries?.[0]?.items[0]?.src ??
                project.media.shot?.src,
            ]
          )
            .filter(Boolean)
            .map((src, i) => (
              <img
                key={src}
                src={src}
                alt={
                  i === 0
                    ? `${project.name}, ${art?.caption ?? "public project image"}`
                    : ""
                }
                width={art?.type === "portrait" ? 778 : 1440}
                height={art?.type === "portrait" ? 1690 : 900}
                fetchPriority={
                  project.slug === "bayyinah-tv" && i === 0 ? "high" : "auto"
                }
                decoding="async"
                className={`index-art-image image-${i}`}
              />
            ))}
          {!art && !project.media.galleries?.length && !project.media.shot && (
            <p className="index-text-art">
              {project.kind}
              <span>{project.stack.slice(0, 3).join(" / ")}</span>
            </p>
          )}
        </div>
        {showLoop && (
          <Suspense fallback={null}>
            <QuickLoop key={project.slug} project={project} onEnd={finish} />
          </Suspense>
        )}
        <span className="index-art-source">
          {showLoop ? "Interactive recreation" : (art?.caption ?? project.kind)}
        </span>
        {canPlay && (
          <button
            type="button"
            className="index-play"
            aria-label={
              showLoop ? "Stop preview" : "Play a three-second preview"
            }
            aria-pressed={showLoop}
            onClick={() => {
              setManual(true);
              setPlaying(!showLoop);
            }}
          >
            {showLoop ? "Stop" : "Play preview"}
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden
            >
              {showLoop ? (
                <path d="M3 2v8M9 2v8" stroke="currentColor" strokeWidth="2" />
              ) : (
                <path d="m4 2 6 4-6 4Z" fill="currentColor" />
              )}
            </svg>
          </button>
        )}
      </div>
      <div className="index-preview-note" key={`${project.slug}-copy`}>
        <p
          className="index-preview-project"
        >
          {project.name}
        </p>
        <p className="index-proof">{art?.proof ?? project.name}</p>
        <p className="index-proof-detail">
          {art?.detail ?? project.stack.slice(0, 3).join(" · ")}
        </p>
        <button type="button" onClick={onOpen} className="text-action">
          {project.featured ? "Read the case study" : "Explore the project"}
          <ArrowRightIcon size={20} aria-hidden />
        </button>
      </div>
    </aside>
  );
}
