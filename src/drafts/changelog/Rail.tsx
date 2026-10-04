import {
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { animate, motion, useMotionValue } from "motion/react";
import { newest, oldest, releaseOf, releases } from "./data";

export type SelectSource = "key" | "click" | "drag";

const first = 2021;
const last = 2026;
const fraction = (at: number) => (at - first) / (last - first);
const settle = { type: "spring", duration: 0.38, bounce: 0.14 } as const;
const toPx = (at: number, horizontal: boolean, length: number) =>
  horizontal ? fraction(at) * length : (1 - fraction(at)) * length;
const stopOf = (major: number, horizontal: boolean, length: number) =>
  toPx(releaseOf(major).at, horizontal, length);
const nearest = (px: number, horizontal: boolean, length: number) =>
  releases.reduce((best, release) =>
    Math.abs(toPx(release.at, horizontal, length) - px) <
    Math.abs(toPx(best.at, horizontal, length) - px)
      ? release
      : best,
  ).major;

interface RailProps {
  major: number;
  horizontal: boolean;
  reduced: boolean;
  onSelect: (major: number, source: SelectSource) => void;
  onSettle: () => void;
}

export function Rail({ major, horizontal, reduced, onSelect, onSettle }: RailProps) {
  const track = useRef<HTMLDivElement>(null);
  const length = useRef(0);
  const dragging = useRef<number | null>(null);
  const current = useRef(major);
  const pos = useMotionValue(0);

  useLayoutEffect(() => {
    current.current = major;
  }, [major]);


  useLayoutEffect(() => {
    const element = track.current;
    if (!element) return;
    const measure = () => {
      const box = element.getBoundingClientRect();
      length.current = horizontal ? box.width : box.height;
      if (dragging.current === null)
        pos.set(stopOf(current.current, horizontal, length.current));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [horizontal, pos]);

  useEffect(() => {
    if (dragging.current !== null) return;
    const to = stopOf(major, horizontal, length.current);
    if (reduced) pos.set(to);
    else animate(pos, to, settle);
  }, [major, reduced, horizontal, pos]);

  const pointerPx = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const value = horizontal ? event.clientX - box.left : event.clientY - box.top;
    return Math.max(0, Math.min(length.current, value));
  };

  const down = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || dragging.current !== null) return;
    dragging.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    const px = pointerPx(event);
    pos.stop();
    pos.set(px);
    const next = nearest(px, horizontal, length.current);
    if (next !== current.current) onSelect(next, "drag");
  };

  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (dragging.current !== event.pointerId) return;
    const px = pointerPx(event);
    pos.set(px);
    const next = nearest(px, horizontal, length.current);
    if (next !== current.current) onSelect(next, "drag");
  };

  const up = (event: PointerEvent<HTMLDivElement>) => {
    if (dragging.current !== event.pointerId) return;
    dragging.current = null;
    const to = stopOf(current.current, horizontal, length.current);
    if (reduced) pos.set(to);
    else animate(pos, to, settle);
    onSettle();
  };

  const key = (event: KeyboardEvent<HTMLDivElement>) => {
    const step: Record<string, number> = {
      ArrowUp: major + 1,
      ArrowRight: major + 1,
      PageUp: major + 1,
      ArrowDown: major - 1,
      ArrowLeft: major - 1,
      PageDown: major - 1,
      Home: oldest,
      End: newest,
    };
    if (!(event.key in step)) return;
    event.preventDefault();
    const next = Math.max(oldest, Math.min(newest, step[event.key]));
    if (next !== major) onSelect(next, "key");
  };

  const release = releaseOf(major);

  return (
    <div className="cl-rail" data-orientation={horizontal ? "horizontal" : "vertical"}>
      <div
        ref={track}
        className="cl-rail-track"
        role="slider"
        tabIndex={0}
        aria-label="Release"
        aria-orientation={horizontal ? "horizontal" : "vertical"}
        aria-valuemin={oldest}
        aria-valuemax={newest}
        aria-valuenow={major}
        aria-valuetext={`Release ${major}.0, ${release.years}: ${release.title}`}
        onKeyDown={key}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      >
        <span className="cl-rail-line" aria-hidden="true" />
        {releases.map((item) => (
          <span
            key={item.major}
            className="cl-rail-stop"
            data-selected={item.major === major}
            style={{ "--t": fraction(item.at) } as CSSProperties}
            aria-hidden="true"
          >
            <span className="cl-rail-tick" />
            <span className="cl-rail-minor">
              {item.changes.map((change, index) => (
                <i key={index} data-kind={change.kind} />
              ))}
            </span>
            <span className="cl-rail-label">
              <b>{item.major}.0</b>
              <small>{item.years}</small>
            </span>
          </span>
        ))}
        <motion.span
          className="cl-rail-thumb"
          style={horizontal ? { x: pos } : { y: pos }}
          aria-hidden="true"
        />
      </div>
      <p className="cl-rail-hint">
        Drag the rail to read an earlier release.
      </p>
    </div>
  );
}
