import { useId, type CSSProperties } from "react";
import "./seal.css";

/** Ring text radius in the 132 viewBox: the band between the inner ring (r 44) and the outer ring (r 63). */
const TEXT_R = 49.5;

/** The landing of the seal, for WAAPI runs; seal.css has the same frames as `seal-land`. */
export const SEAL_LAND: Keyframe[] = [
  { offset: 0, opacity: 0, transform: "scale(1.18) rotate(-14deg)", easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
  { offset: 0.684, opacity: 1, transform: "scale(0.985) rotate(-8deg)", easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
  { offset: 1, opacity: 1, transform: "rotate(-8deg)" },
];
export const SEAL_MS = 380;

/**
 * Step 4 of the loop as one stamped mark: a person approved the change, then merged it.
 * Ink on a dark disc, so it reads on a white screen and on the dark room.
 */
export function Seal({ className, style, land }: { className?: string; style?: CSSProperties; land?: boolean }) {
  const ring = useId();
  return (
    <svg
      className={className ? `seal ${className}` : "seal"}
      viewBox="0 0 132 132"
      role="img"
      aria-label="Step 4: approved by a person, then merged"
      style={style}
      data-land={land ? "" : undefined}
    >
      <defs>
        <path id={ring} d={`M66 ${66 + TEXT_R} A${TEXT_R} ${TEXT_R} 0 1 1 66 ${66 - TEXT_R} A${TEXT_R} ${TEXT_R} 0 1 1 66 ${66 + TEXT_R}`} />
      </defs>
      <circle className="seal-disc" cx="66" cy="66" r="65.5" />
      <g className="seal-ink">
        <circle cx="66" cy="66" r="63" strokeWidth="2" />
        <circle cx="66" cy="66" r="44" strokeWidth="1" />
        <text>
          <textPath href={`#${ring}`} startOffset="50%" textAnchor="middle">
            4 · APPROVED BY A PERSON · MERGED
          </textPath>
        </text>
        <path className="seal-check" d="M50.5 67 l10.5 10.5 l21.5 -23" />
      </g>
    </svg>
  );
}
