import { useCallback, useEffect, useState } from "react";
import { projects } from "../../../content/projects";
import Reel from "../../bitrate/Reel";
import { reelFrames } from "../../bitrate/data";
import type { LabMoveProps } from "../types";
import "./15-reel.css";

const project = projects.find((item) => item.slug === "bayyinah-tv")!;
const frames = reelFrames(project);

export default function ReelMove({ active, reduced }: LabMoveProps) {
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [caption, setCaption] = useState(
    frames[0]?.caption ?? "Public project image",
  );
  const ready = useCallback((value: string) => setCaption(value), []);
  useEffect(() => {
    let clock = 0;
    const sync = () => {
      window.clearInterval(clock);
      if (active && playing && !reduced && !document.hidden)
        clock = window.setInterval(() => setFrame((value) => value + 1), 2000);
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      window.clearInterval(clock);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [active, playing, reduced]);
  return (
    <div className="lm15" data-reduced={reduced}>
      <div className="lm15-screen">
        {active ? (
          <Reel
            project={project}
            frame={frame}
            quality="1080p"
            reduced={reduced || !playing}
            onFrameReady={ready}
          />
        ) : (
          <img
            src={frames[frame % frames.length]?.src}
            alt="Paused public Bayyinah TV image"
          />
        )}
      </div>
      <div className="lm15-controls">
        <button
          type="button"
          disabled={reduced}
          aria-pressed={!playing}
          onClick={() => setPlaying((value) => !value)}
        >
          {reduced
            ? "Automatic cuts off"
            : playing
              ? "Pause cuts"
              : "Resume cuts"}
        </button>
        <button type="button" onClick={() => setFrame((value) => value + 1)}>
          Next frame →
        </button>
        <span>
          {String((frame % Math.max(1, frames.length)) + 1).padStart(2, "0")} /{" "}
          {String(frames.length).padStart(2, "0")}
        </span>
      </div>
      <p className="lm15-caption">{caption}</p>
      <p className="lm15-note">
        Hard cut every 2 seconds · 120 ms additive colour bleed
        {reduced ? " · motion reduced" : ""}.
      </p>
    </div>
  );
}
