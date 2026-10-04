import { useEffect, useRef, useState } from "react";
import type { LabMoveProps } from "../types";
import "./17-cursors.css";

const bots = [
  { name: "Bot A", colour: "#005c47" },
  { name: "Bot B", colour: "#9c2043" },
  { name: "Bot C", colour: "#51379c" },
];
function position(index: number, tick: number) {
  const phase = tick * 0.085 + index * 2.1;
  return {
    x: 0.43 + Math.sin(phase) * 0.28,
    y: 0.48 + Math.cos(phase * 0.73 + index) * 0.27,
  };
}

export default function CursorsMove({ active, reduced }: LabMoveProps) {
  const board = useRef<HTMLDivElement>(null);
  const nodes = useRef<Array<HTMLSpanElement | null>>([]);
  const tick = useRef(0);
  const manual = useRef<(() => void) | null>(null);
  const [playing, setPlaying] = useState(true);
  const [selection, setSelection] = useState("FJALË");
  useEffect(() => {
    let clock = 0;
    let frame = 0;
    let sampledAt = performance.now();
    let width = board.current?.clientWidth ?? 300;
    let height = board.current?.clientHeight ?? 250;
    let from = bots.map((_, index) => position(index, tick.current));
    let to = from.map((value) => ({ ...value }));
    const draw = (progress: number) => {
      nodes.current.forEach((node, index) => {
        if (!node) return;
        const x = from[index].x + (to[index].x - from[index].x) * progress;
        const y = from[index].y + (to[index].y - from[index].y) * progress;
        node.style.transform = `translate3d(${x * Math.max(1, width - 64)}px,${y * Math.max(1, height - 35)}px,0)`;
      });
    };
    const sample = () => {
      tick.current++;
      from = to;
      to = bots.map((_, index) => position(index, tick.current));
      sampledAt = performance.now();
    };
    const paint = (now: number) => {
      frame = 0;
      if (!active || reduced || !playing || document.hidden) return;
      draw(Math.min(1, (now - sampledAt) / 100));
      frame = requestAnimationFrame(paint);
    };
    const sync = () => {
      window.clearInterval(clock);
      cancelAnimationFrame(frame);
      frame = 0;
      if (active && !reduced && playing && !document.hidden) {
        sampledAt = performance.now();
        clock = window.setInterval(sample, 100);
        frame = requestAnimationFrame(paint);
      } else draw(1);
    };
    manual.current = () => {
      sample();
      draw(1);
    };
    const observer = new ResizeObserver(() => {
      width = board.current?.clientWidth ?? width;
      height = board.current?.clientHeight ?? height;
      draw(1);
    });
    if (board.current) observer.observe(board.current);
    document.addEventListener("visibilitychange", sync);
    draw(1);
    sync();
    return () => {
      window.clearInterval(clock);
      cancelAnimationFrame(frame);
      observer.disconnect();
      manual.current = null;
      document.removeEventListener("visibilitychange", sync);
    };
  }, [active, playing, reduced]);
  return (
    <div className="lm17" data-reduced={reduced}>
      <div className="lm17-label">
        <strong>Simulated collaborators</strong>
        <span>10 Hz{reduced || !playing ? " · paused" : ""}</span>
      </div>
      <div
        ref={board}
        className="lm17-board"
        aria-label="Three simulated local cursor bots moving over project choices"
      >
        <div className="lm17-projects">
          {["FJALË", "Za!"].map((name) => (
            <button
              type="button"
              key={name}
              aria-pressed={selection === name}
              onClick={() => setSelection(name)}
            >
              <strong>{name}</strong>
              <span>
                {name === "FJALË" ? "21k Albanian words" : "2–8 players"}
              </span>
            </button>
          ))}
        </div>
        {bots.map((bot, index) => (
          <span
            key={bot.name}
            ref={(node) => {
              nodes.current[index] = node;
            }}
            className="lm17-cursor"
            style={{ color: bot.colour }}
            aria-hidden="true"
          >
            <svg width="17" height="23" viewBox="0 0 17 23">
              <path
                d="M1 1v18l4.5-4 3.5 7 3-1.5-3.5-7 6-.5Z"
                fill="currentColor"
                stroke="#fffdf4"
                strokeWidth="1.5"
              />
            </svg>
            <span style={{ backgroundColor: bot.colour, color: "#fff" }}>
              {bot.name}
            </span>
          </span>
        ))}
      </div>
      <div className="lm17-controls">
        <button
          type="button"
          disabled={reduced}
          aria-pressed={!playing}
          onClick={() => setPlaying((value) => !value)}
        >
          {reduced ? "Motion reduced" : playing ? "Pause bots" : "Resume bots"}
        </button>
        <button
          type="button"
          onClick={() => {
            setPlaying(false);
            manual.current?.();
          }}
        >
          Step one update
        </button>
        <output aria-live="polite">Selected: {selection}</output>
      </div>
      <p className="lm17-note">
        Local bots only. No live visitors, server or network connection.
      </p>
    </div>
  );
}
