import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { PhonePicture } from "./PhonePicture";
import "./frames.css";

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface BrowserFrameProps extends HTMLAttributes<HTMLSpanElement> {
  src: string;
  alt: string;
  /** The capture's size in CSS pixels. The whole capture always shows. */
  width?: number;
  height?: number;
  /** The address bar text: a public domain, or a neutral label for a private app. */
  label: string;
  /** True when the label is a real public address. It then carries a lock. */
  site?: boolean;
  tone?: "light" | "dark";
  eager?: boolean;
  /** Marks over the screen, placed with `spotIn`. */
  children?: ReactNode;
}

/** A box in the capture's pixels, as percentages of the screen it shows in. */
export function spotIn(box: Box, width: number, height: number) {
  return { x: (box.x / width) * 100, y: (box.y / height) * 100, w: (box.w / width) * 100, h: (box.h / height) * 100 };
}

/** A whole desktop capture in a quiet browser window: three dots and an address pill. */
export function BrowserFrame({
  src,
  alt,
  width = 1440,
  height = 900,
  label,
  site = false,
  tone = "light",
  eager = false,
  children,
  className,
  ...rest
}: BrowserFrameProps) {
  return (
    <span {...rest} className={className ? `fr-browser ${className}` : "fr-browser"} data-tone={tone}>
      <span className="fr-browser-clip">
        <span className="fr-bar" aria-hidden="true">
          <span className="fr-dots">
            <i />
            <i />
            <i />
          </span>
          <span className="fr-url">
            {site && (
              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3">
                <rect x="2.5" y="5.5" width="7" height="5" rx="1" />
                <path d="M4 5.5V4a2 2 0 0 1 4 0v1.5" />
              </svg>
            )}
            <span>{label}</span>
          </span>
        </span>
        <span className="fr-screen" style={{ aspectRatio: `${width} / ${height}` } as CSSProperties}>
          <PhonePicture src={src}>
            <img
              src={src}
              alt={alt}
              width={width}
              height={height}
              loading={eager ? "eager" : "lazy"}
              fetchPriority={eager ? "high" : "auto"}
              decoding="async"
            />
          </PhonePicture>
          {children}
        </span>
      </span>
    </span>
  );
}
