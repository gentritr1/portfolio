import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import "./frames.css";

/** Relative luminance of a #rrggbb colour. */
function luminanceOf(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

interface StageProps extends HTMLAttributes<HTMLElement> {
  /** The project's own colour, #rrggbb. The text colour follows it. */
  ground: string;
  /** The words under the frames. They are the figure's caption. */
  caption?: ReactNode;
  children: ReactNode;
}

/** An inset panel in the project's own colour, with one frame or a frame and a phone on it. */
export function Stage({ ground, caption, className, style, children, ...rest }: StageProps) {
  const tone = luminanceOf(ground) < 0.18 ? "dark" : "light";
  return (
    <figure
      {...rest}
      className={className ? `fr-stage ${className}` : "fr-stage"}
      data-tone={tone}
      style={{ ...style, "--fr-stage": ground } as CSSProperties}
    >
      {children}
      {caption && <figcaption className="fr-stage-caption">{caption}</figcaption>}
    </figure>
  );
}
