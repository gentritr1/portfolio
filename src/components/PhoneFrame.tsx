import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { phoneScreens } from "../content/phoneScreens";
import type { Box } from "./BrowserFrame";
import "./frames.css";

/** The app view under the status bar, as height over width: a 393 x 852 screen less its 54 status bar. */
const VIEW = 2.0305;

interface PhoneFrameProps extends HTMLAttributes<HTMLSpanElement> {
  /** A store-listing capture measured in content/phoneScreens.ts. */
  src: string;
  alt: string;
  eager?: boolean;
  /** Marks over the screen, placed with `phoneSpot`. */
  children?: ReactNode;
}

function screenOf(src: string) {
  const screen = phoneScreens[src];
  if (!screen) throw new Error(`No measured phone screen for ${src}`);
  return screen;
}

/** A box in the listing's pixels, as percentages of the app view. */
export function phoneSpot(src: string, box: Box) {
  const { box: view } = screenOf(src);
  const tall = view.w * VIEW;
  return { x: ((box.x - view.x) / view.w) * 100, y: ((box.y - view.y) / tall) * 100, w: (box.w / view.w) * 100, h: (box.h / tall) * 100 };
}

/** A modern phone drawn in CSS. The screen is the app's whole screen as the store listing shows it, edge to edge. */
export function PhoneFrame({ src, alt, eager = false, children, className, style, ...rest }: PhoneFrameProps) {
  const { width, height, box, top, fill } = screenOf(src);
  const tall = box.w * VIEW;
  const short = box.h < tall - 1;
  return (
    <span
      {...rest}
      className={className ? `fr-phone ${className}` : "fr-phone"}
      style={{ ...style, "--fr-fill": fill } as CSSProperties}
    >
      <span className="fr-phone-body">
        <span className="fr-phone-glass">
          <span className="fr-phone-status" style={{ background: top }} aria-hidden="true">
            <span className="fr-phone-island" />
          </span>
          <span className="fr-phone-view">
            <img
              src={src}
              alt={alt}
              width={width}
              height={height}
              loading={eager ? "eager" : "lazy"}
              fetchPriority={eager ? "high" : "auto"}
              decoding="async"
              style={{
                width: `${(width / box.w) * 100}%`,
                left: `${(-box.x / box.w) * 100}%`,
                top: `${(-box.y / tall) * 100}%`,
              }}
            />
            {short && (
              <span className="fr-phone-fill" style={{ top: `calc(${((box.h / tall) * 100).toFixed(3)}% - 9cqi)` }} aria-hidden="true" />
            )}
            {children}
          </span>
        </span>
      </span>
    </span>
  );
}
