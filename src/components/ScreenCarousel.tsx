import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import "./frames.css";

export interface Slide {
  /** A short name of the screen, shown beside the counter. */
  label: string;
  /** `current`: the slide is on view. A slide first renders when it, or the slide before it, is on view. */
  render: (current: boolean) => ReactNode;
}

interface ScreenCarouselProps {
  /** What the screens are, for assistive technology. */
  name: string;
  slides: Slide[];
}

/** A drag shorter than this, or more vertical than sideways, is not a swipe. */
const SWIPE_PX = 40;

const pad = (n: number) => String(n).padStart(2, "0");

function Arrow({ back }: { back?: boolean }) {
  return (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={back ? "M15 9H3m5-5L3 9l5 5" : "M3 9h12m-5-5 5 5-5 5"} />
    </svg>
  );
}

/**
 * Screens of one project, one at a time, in a stable box: all slides share one grid cell, so the box never changes size.
 * No autoplay. Arrow keys, the buttons and a swipe move it.
 */
export function ScreenCarousel({ name, slides }: ScreenCarouselProps) {
  const [at, setAt] = useState(0);
  const [seen, setSeen] = useState(() => new Set([0, 1]));
  const press = useRef<{ id: number; x: number; y: number } | null>(null);
  const view = useRef<HTMLDivElement>(null);
  const id = useId();

  // A hidden slide's picture decodes before it shows, so the switch never waits for a decode.
  useEffect(() => {
    for (const image of view.current?.querySelectorAll<HTMLImageElement>(".fr-slide[data-place] img") ?? []) {
      if (image.loading === "lazy") image.loading = "eager";
      void image.decode().catch(() => undefined);
    }
  }, [seen]);
  const count = slides.length;

  const go = (next: number) => {
    const to = (next + count) % count;
    setAt(to);
    setSeen((old) => (old.has(to) && old.has((to + 1) % count) ? old : new Set([...old, to, (to + 1) % count])));
  };

  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") go(at + 1);
    else if (event.key === "ArrowLeft") go(at - 1);
    else return;
    event.preventDefault();
  };

  const onDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") return;
    press.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
  };
  const onUp = (event: PointerEvent<HTMLDivElement>) => {
    const p = press.current;
    press.current = null;
    if (!p || p.id !== event.pointerId) return;
    const dx = event.clientX - p.x;
    if (Math.abs(dx) >= SWIPE_PX && Math.abs(dx) > Math.abs(event.clientY - p.y)) go(at + (dx < 0 ? 1 : -1));
  };

  return (
    <div className="fr-carousel" role="region" aria-roledescription="carousel" aria-label={name} onKeyDown={onKey}>
      <div
        ref={view}
        className="fr-carousel-view"
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={() => {
          press.current = null;
        }}
      >
        {slides.map((slide, i) => (
          <div
            key={slide.label}
            className="fr-slide"
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}: ${slide.label}`}
            data-place={i === at ? undefined : i < at ? "before" : "after"}
            inert={i !== at}
          >
            {seen.has(i) && slide.render(i === at)}
          </div>
        ))}
      </div>
      <div className="fr-carousel-bar">
        <p className="fr-count" id={`${id}-count`} aria-live="polite">
          <span className="fr-count-n">
            {pad(at + 1)} <span>/ {pad(count)}</span>
          </span>
          <span className="fr-count-label">{slides[at].label}</span>
        </p>
        <span className="fr-dashes" aria-hidden="true">
          {slides.map((slide, i) => (
            <i key={slide.label} data-on={i === at ? "" : undefined} />
          ))}
        </span>
        <span className="fr-steps">
          <button type="button" className="fr-step" aria-label="Previous screen" aria-describedby={`${id}-count`} onClick={() => go(at - 1)}>
            <Arrow back />
          </button>
          <button type="button" className="fr-step" aria-label="Next screen" aria-describedby={`${id}-count`} onClick={() => go(at + 1)}>
            <Arrow />
          </button>
        </span>
      </div>
    </div>
  );
}
