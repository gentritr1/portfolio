import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";
import { projects } from "../../../content/projects";
import type { LabMoveProps } from "../types";
import "./10-transition.css";

const project = projects.find((item) => item.slug === "fjale")!;
const image = project.media.galleries?.[0]?.items[0];

export default function TransitionMove({ active, reduced }: LabMoveProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(
    "Open the project; its title keeps its place in the transition.",
  );
  const host = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const lifecycle = useRef({
    running: null as ViewTransition | null,
    sequence: 0,
    mounted: true,
  });
  const id = "lm10-" + useId().replace(/[^a-zA-Z0-9-]/g, "");
  const name = id + "-title";
  useEffect(() => {
    const state = lifecycle.current;
    state.mounted = true;
    return () => {
      state.mounted = false;
      state.sequence++;
      state.running?.skipTransition();
    };
  }, []);
  useEffect(() => {
    if (!active || reduced) {
      lifecycle.current.running?.skipTransition();
      lifecycle.current.running = null;
      host.current?.removeAttribute("data-transition");
    }
  }, [active, reduced]);

  function change(next: boolean) {
    const token = ++lifecycle.current.sequence;
    lifecycle.current.running?.skipTransition();
    const focus = () => {
      if (!lifecycle.current.mounted || token !== lifecycle.current.sequence)
        return;
      if (next) heading.current?.focus({ preventScroll: true });
      else trigger.current?.focus({ preventScroll: true });
    };
    const update = () => {
      if (!lifecycle.current.mounted || token !== lifecycle.current.sequence)
        return;
      flushSync(() => setOpen(next));
      focus();
    };
    if (!active || reduced || !document.startViewTransition) {
      host.current?.removeAttribute("data-transition");
      lifecycle.current.running = null;
      update();
      setMode(
        reduced
          ? "Reduced motion: the same state change, without the morph."
          : "Native view transitions unavailable: direct state change.",
      );
      return;
    }
    host.current?.setAttribute("data-transition", "true");
    try {
      const transition = document.startViewTransition(update);
      lifecycle.current.running = transition;
      setMode(
        next ? "The tile became the case." : "The case returned to its tile.",
      );
      void transition.finished
        .catch(() => {})
        .then(() => {
          if (
            !lifecycle.current.mounted ||
            token !== lifecycle.current.sequence
          )
            return;
          host.current?.removeAttribute("data-transition");
          lifecycle.current.running = null;
          focus();
        });
    } catch {
      host.current?.removeAttribute("data-transition");
      update();
      setMode("Direct state change; native transition could not start.");
    }
  }

  return (
    <div
      className="lm10"
      id={id}
      ref={host}
      data-open={open}
      data-reduced={reduced}
    >
      <style>{`
      :root:has(#${id}[data-transition="true"])::view-transition{pointer-events:none}
      :root:has(#${id}[data-transition="true"])::view-transition-old(root),
      :root:has(#${id}[data-transition="true"])::view-transition-new(root){animation:none;mix-blend-mode:normal}
      ::view-transition-group(${name}){animation-duration:300ms;animation-timing-function:cubic-bezier(.32,.72,0,1)}
      ::view-transition-old(${name}){animation:lm10-out 150ms cubic-bezier(.215,.61,.355,1) both}
      ::view-transition-new(${name}){animation:lm10-in 220ms cubic-bezier(.16,1,.3,1) both}
    `}</style>
      <section
        className="lm10-project"
        aria-label={open ? "FJALË case preview" : "FJALË project tile"}
      >
        <div className="lm10-top">
          <span>FJALË / 2026</span>
          {open && (
            <button type="button" onClick={() => change(false)}>
              ← Back to tile
            </button>
          )}
        </div>
        <h3
          ref={heading}
          tabIndex={open ? -1 : undefined}
          style={{ viewTransitionName: name } as CSSProperties}
        >
          FJALË
        </h3>
        <p>
          {open ? project.summary : "21k Albanian words. One daily puzzle."}
        </p>
        {open ? (
          <>
            <dl>
              <div>
                <dt>Work</dt>
                <dd>{project.role}</dd>
              </div>
              <div>
                <dt>Made with</dt>
                <dd>{project.stack.join(" · ")}</dd>
              </div>
            </dl>
            {image && <img src={image.src} alt={image.alt} />}
            <a href={project.links[0]?.href} target="_blank" rel="noreferrer">
              Visit FJALË ↗
            </a>
          </>
        ) : (
          <button ref={trigger} type="button" onClick={() => change(true)}>
            Open project ↗
          </button>
        )}
      </section>
      <p className="lm10-status" role="status">
        {mode}
      </p>
    </div>
  );
}
