import {
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { animate, motion, useMotionValue } from "motion/react";
import { newest, oldest, releaseOf, releases, sentenceOf } from "./data";

export type SelectSource = "key" | "click" | "drag";

const first = 2021;
const last = 2026;
const fraction = (at: number) => (at - first) / (last - first);
const settle = { type: "spring", duration: 0.38, bounce: 0.12 } as const;
const stopOf = (major: number, length: number) => fraction(releaseOf(major).at) * length;
const nearest = (px: number, length: number) =>
  releases.reduce((best, release) =>
    Math.abs(fraction(release.at) * length - px) < Math.abs(fraction(best.at) * length - px)
      ? release
      : best,
  ).major;

interface RailProps {
  major: number;
  reduced: boolean;
  touched: boolean;
  onSelect: (major: number, source: SelectSource) => void;
}

export function Rail({ major, reduced, touched, onSelect }: RailProps) {
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
      length.current = element.getBoundingClientRect().width;
      if (dragging.current === null) pos.set(stopOf(current.current, length.current));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [pos]);

  useEffect(() => {
    if (dragging.current !== null) return;
    const to = stopOf(major, length.current);
    if (reduced) pos.set(to);
    else animate(pos, to, settle);
  }, [major, reduced, pos]);

  const pointerPx = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    return Math.max(0, Math.min(length.current, event.clientX - box.left));
  };

  const follow = (event: PointerEvent<HTMLDivElement>) => {
    const px = pointerPx(event);
    pos.set(px);
    const next = nearest(px, length.current);
    if (next !== current.current) onSelect(next, "drag");
  };

  const down = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || dragging.current !== null) return;
    dragging.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    pos.stop();
    follow(event);
  };

  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (dragging.current === event.pointerId) follow(event);
  };

  const up = (event: PointerEvent<HTMLDivElement>) => {
    if (dragging.current !== event.pointerId) return;
    dragging.current = null;
    const to = stopOf(current.current, length.current);
    if (reduced) pos.set(to);
    else animate(pos, to, settle);
  };

  const key = (event: KeyboardEvent<HTMLDivElement>) => {
    const step: Record<string, number> = {
      ArrowRight: major + 1,
      ArrowUp: major + 1,
      PageUp: major + 1,
      ArrowLeft: major - 1,
      ArrowDown: major - 1,
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
    <div className="rb-rail">
      <div
        ref={track}
        className="rb-rail-track"
        role="slider"
        tabIndex={0}
        aria-label="Year. The sentence above changes to what was true in that year."
        aria-orientation="horizontal"
        aria-valuemin={oldest}
        aria-valuemax={newest}
        aria-valuenow={major}
        aria-valuetext={`${release.years}: ${sentenceOf(release)}`}
        onKeyDown={key}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      >
        <span className="rb-rail-line" aria-hidden="true">
          <motion.span className="rb-rail-past" style={{ x: pos }} />
        </span>
        {releases.map((item) => (
          <span
            key={item.major}
            className="rb-rail-stop"
            data-selected={item.major === major}
            style={{ "--t": fraction(item.at) } as CSSProperties}
            aria-hidden="true"
          >
            <span className="rb-rail-tick" />
            <span className="rb-rail-label">
              <b>{item.years}</b>
              <small>{item.major}.0</small>
            </span>
          </span>
        ))}
        <motion.span className="rb-rail-thumb" style={{ x: pos }} aria-hidden="true">
          <span className="rb-rail-knob" />
          {!touched && (
            <span className="rb-rail-cue">
              <span aria-hidden="true">←</span> drag to an earlier year
            </span>
          )}
        </motion.span>
      </div>
    </div>
  );
}
