import { useCallback, useId, useState, type CSSProperties } from "react";
import { projects } from "../../../content/projects";
import Reel from "../../bitrate/Reel";
import { qualities, type Quality } from "../../bitrate/data";
import type { LabMoveProps } from "../types";
import "./09-quality.css";

const project = projects.find((item) => item.slug === "bayyinah-tv")!;
const levels: Record<Quality, string> = {
  Auto: "0 .067 .133 .2 .267 .333 .4 .467 .533 .6 .667 .733 .8 .867 .933 1",
  "1080p": "0 .067 .133 .2 .267 .333 .4 .467 .533 .6 .667 .733 .8 .867 .933 1",
  "720p": "0 .143 .286 .429 .571 .714 .857 1",
  "480p": "0 .2 .4 .6 .8 1",
  "240p": "0 .333 .667 1",
};

export default function QualityMove({ active, reduced }: LabMoveProps) {
  const [quality, setQuality] = useState<Quality>("1080p");
  const [caption, setCaption] = useState("Public Bayyinah TV image");
  const id = "lm09-" + useId().replace(/[^a-zA-Z0-9-]/g, "");
  const ready = useCallback((value: string) => setCaption(value), []);
  return (
    <div className="lm09" data-quality={quality}>
      <svg className="lm09-filter" aria-hidden="true" width="0" height="0">
        <defs>
          <filter id={id} colorInterpolationFilters="sRGB">
            <feComponentTransfer>
              <feFuncR type="discrete" tableValues={levels[quality]} />
              <feFuncG type="discrete" tableValues={levels[quality]} />
              <feFuncB type="discrete" tableValues={levels[quality]} />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>
      <div
        className="lm09-page"
        style={{ "--lm09-filter": `url(#${id})` } as CSSProperties}
      >
        <div className="lm09-player">
          {active ? (
            <Reel
              project={project}
              frame={0}
              quality={quality}
              reduced={reduced}
              onFrameReady={ready}
            />
          ) : (
            <p>Player paused while this tile is inactive.</p>
          )}
        </div>
        <div className="lm09-copy">
          <h3>Bayyinah TV</h3>
          <p>34 routes. English / Arabic.</p>
          <p>HLS playback, live chat and a premium paywall.</p>
        </div>
      </div>
      <div className="lm09-controls">
        <label>
          Render quality{" "}
          <select
            value={quality}
            onChange={(event) => setQuality(event.target.value as Quality)}
          >
            {qualities.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <output aria-live="polite">
          {quality === "240p"
            ? "4 colour levels · coarse samples"
            : quality === "480p"
              ? "6 colour levels · fewer samples"
              : quality === "720p"
                ? "8 colour levels"
                : "16 colour levels"}
        </output>
      </div>
      <p className="lm09-caption">
        {caption}. At phone widths, only the player is posterised.
      </p>
    </div>
  );
}
