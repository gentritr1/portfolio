import { useLayoutEffect, useState, type CSSProperties, type MouseEventHandler } from "react";
import { phoneFit, type Crop, type PhoneShot, type WebShot } from "./shots";

interface ShotProps {
  shot: WebShot;
  /** App pixel at the window's top-left, from 960 px up. */
  wide: Crop;
  /** App pixel at the window's top-left, below 960 px. */
  narrow: Crop;
  work: string;
  className?: string;
  eager?: boolean;
  ground?: string;
  href?: string;
  label?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  story?: boolean;
  /** Window height below 960 px, when the crop needs its own. */
  narrowHeight?: number;
  id?: string;
}

/** A window onto one screen at actual size. The image is never scaled; the window crops it. */
export function Shot({ shot, wide, narrow, work, className = "", eager, ground, href, label, onClick, story, narrowHeight, id }: ShotProps) {
  const style = {
    "--x": `${wide.x}px`,
    "--y": `${wide.y}px`,
    "--nx": `${narrow.x}px`,
    "--ny": `${narrow.y}px`,
    "--shot-ground": ground,
    "--nh": narrowHeight ? `${narrowHeight}px` : undefined,
  } as CSSProperties;
  const img = (
    <img
      src={shot.src}
      alt={shot.alt}
      width={shot.w}
      height={shot.h}
      style={{ width: shot.w, height: shot.h }}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      decoding={eager ? "sync" : "async"}
      draggable={false}
    />
  );
  const cls = `p12p-win ${className}`;
  return href ? (
    <a id={id} href={href} className={cls} style={style} data-work={work} aria-label={label} onClick={onClick} data-motion={story ? "story" : undefined}>
      {img}
    </a>
  ) : (
    <div id={id} className={cls} style={style} data-work={work} data-motion={story ? "story" : undefined}>
      {img}
    </div>
  );
}

interface PhoneProps {
  shot: PhoneShot;
  /** Window height from 960 px up, and below. */
  height: number;
  narrowHeight: number;
  /** Display pixels skipped at the top of the app screen, to start on a whole UI row. */
  skip?: number;
  className?: string;
}

/** A phone app screen cut out of its public store listing, drawn at phone width (390 px). */
export function Phone({ shot, height, narrowHeight, skip = 0, className = "" }: PhoneProps) {
  const fit = phoneFit(shot);
  const room = fit.screenHeight - skip;
  return (
    <figure className={`p12p-phone ${className}`}>
      <div
        className="p12p-phone-win"
        data-work={shot.app}
        style={
          {
            "--phone-h": `${Math.min(height, room)}px`,
            "--phone-nh": `${Math.min(narrowHeight, room)}px`,
          } as CSSProperties
        }
      >
        <img
          src={shot.src}
          alt={shot.alt}
          width={780}
          height={1689}
          style={{ width: fit.width, height: fit.height, left: fit.left, top: fit.top - skip }}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      </div>
      <figcaption>
        <strong>{shot.app}</strong> <span>{shot.screen}</span>
        <span className="p12p-phone-links">
          {shot.links.map((l) => (
            <a key={l.href} href={l.href} className="p12p-link" target="_blank" rel="noreferrer">
              {l.label}
            </a>
          ))}
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * How much of the real screen a window shows, in the app's own pixels: the part of the window that
 * is inside both the image and the viewport. Measured before the first paint and on every resize.
 */
function useVisibleWidth(selector: string, total: number) {
  const [width, setWidth] = useState<number | null>(null);
  useLayoutEffect(() => {
    const win = document.querySelector<HTMLElement>(selector);
    const img = win?.querySelector("img");
    if (!win || !img) return;
    const read = () => {
      const w = win.getBoundingClientRect();
      const i = img.getBoundingClientRect();
      const shown = Math.min(w.right, i.right, innerWidth) - Math.max(w.left, i.left, 0);
      setWidth(Math.max(0, Math.min(total, Math.round(shown))));
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(win);
    addEventListener("resize", read);
    return () => {
      ro.disconnect();
      removeEventListener("resize", read);
    };
  }, [selector, total]);
  return width;
}

/**
 * The page's one visual rule, readable in a still: a dimension line over every screen, as on a
 * drawing at 1:1. It spans exactly the window and says how much of the real screen is in it.
 */
export function Dim({ of, total, className = "" }: { of: string; total: number; className?: string }) {
  const width = useVisibleWidth(of, total);
  const text =
    width === null
      ? "Actual size"
      : width >= total
        ? `Actual size: all ${total} pixels across`
        : `Actual size: ${width} of ${total} pixels across`;
  return (
    <p className={`p12p-dim ${className}`} data-measured>
      <span className="p12p-dim-rule" aria-hidden="true" />
      <span className="p12p-dim-label">{text}</span>
    </p>
  );
}

export function Caption({ title, real }: { title: string; real?: boolean }) {
  return (
    <p className="p12p-caption">
      <span className="p12p-caption-title">{title}</span>
      {real && <span className="p12p-real"> Real product screens, invented data.</span>}
    </p>
  );
}

export function Arrow() {
  return (
    <svg className="p12p-arrow" aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1 7h11M7.5 2.5 12 7l-4.5 4.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function Out() {
  return (
    <svg className="p12p-out" aria-hidden="true" width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path d="M2 9 9 2M3.5 2H9v5.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
