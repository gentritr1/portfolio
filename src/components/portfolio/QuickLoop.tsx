import { useEffect, useState } from "react";
import GuidedRecreation from "../case/GuidedRecreation";
import { recreations } from "../../lib/recreations";
import type { Project } from "../../content/projects";

/** One brief, muted recreation; never runs by default or under reduced motion. */
export default function QuickLoop({
  project,
  onEnd,
}: {
  project: Project;
  onEnd: () => void;
}) {
  const [step, setStep] = useState(0);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const key = project.featured?.monitor;
  useEffect(() => {
    if (reduced) return;
    const timer = window.setInterval(() => setStep((value) => value + 1), 750);
    return () => window.clearInterval(timer);
  }, [reduced]);
  useEffect(() => {
    if (step >= 4) onEnd();
  }, [step, onEnd]);
  if (!key || key === "gallery") return null;
  return (
    <div
      className="index-live-stage"
      data-world={recreations[key].world}
      inert
      aria-hidden
    >
      <GuidedRecreation
        kind={key}
        step={Math.min(step, 3)}
        playing={!reduced}
        reduced={reduced}
      />
    </div>
  );
}
