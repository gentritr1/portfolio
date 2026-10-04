import { useEffect, useRef, useState } from "react";
import type { LabMoveProps } from "../types";
import "./12-width.css";

interface AxisControl {
  move: (x: number) => void;
  set: (width: number) => void;
}
const clamp = (value: number, low: number, high: number) =>
  Math.max(low, Math.min(high, value));

export default function WidthMove({ active, reduced }: LabMoveProps) {
  const title = useRef<HTMLHeadingElement>(null);
  const readout = useRef<HTMLOutputElement>(null);
  const control = useRef<AxisControl | null>(null);
  const baseline = useRef(100);
  const [width, setWidth] = useState(100);
  useEffect(() => {
    let frame = 0;
    let previousTime = 0;
    let lastPointer = 0;
    let lastPointerTime = 0;
    let impulse = 0;
    let impulseAt = 0;
    let value = baseline.current;
    let velocity = 0;
    const draw = () => {
      if (title.current)
        title.current.style.fontVariationSettings = `"wght" 760, "wdth" ${value.toFixed(2)}`;
      if (readout.current) readout.current.value = value.toFixed(1);
    };
    const tick = (now: number) => {
      frame = 0;
      if (!active || reduced || document.hidden) {
        previousTime = 0;
        return;
      }
      const target = clamp(
        baseline.current + impulse * Math.max(0, 1 - (now - impulseAt) / 1000),
        62,
        125,
      );
      let remaining = previousTime
        ? Math.min((now - previousTime) / 1000, 0.035)
        : 1 / 60;
      previousTime = now;
      while (remaining > 0) {
        const dt = Math.min(remaining, 1 / 120);
        velocity += (350 * (target - value) - 35 * velocity) * dt;
        velocity = clamp(velocity, -160, 160);
        value = clamp(value + velocity * dt, 62, 125);
        remaining -= dt;
      }
      draw();
      if (
        now - impulseAt < 1000 ||
        Math.abs(value - baseline.current) > 0.01 ||
        Math.abs(velocity) > 0.01
      )
        frame = requestAnimationFrame(tick);
      else {
        value = baseline.current;
        velocity = 0;
        previousTime = 0;
        draw();
      }
    };
    const wake = () => {
      if (!frame && active && !reduced && !document.hidden)
        frame = requestAnimationFrame(tick);
    };
    control.current = {
      move(x) {
        if (!active || reduced) return;
        const now = performance.now();
        if (lastPointerTime && now - lastPointerTime < 200) {
          const pointerVelocity =
            (x - lastPointer) / Math.max(0.008, (now - lastPointerTime) / 1000);
          impulse = clamp(pointerVelocity * 0.025, -38, 25);
          impulseAt = now;
          wake();
        }
        lastPointer = x;
        lastPointerTime = now;
      },
      set(next) {
        baseline.current = next;
        value = next;
        velocity = 0;
        impulse = 0;
        impulseAt = 0;
        cancelAnimationFrame(frame);
        frame = 0;
        previousTime = 0;
        draw();
      },
    };
    const visibility = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
      if (!document.hidden) {
        value = baseline.current;
        velocity = 0;
        impulse = 0;
        draw();
      }
    };
    document.addEventListener("visibilitychange", visibility);
    draw();
    return () => {
      cancelAnimationFrame(frame);
      control.current = null;
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [active, reduced]);
  function choose(next: number) {
    baseline.current = next;
    setWidth(next);
    control.current?.set(next);
  }
  return (
    <div className="lm12" data-reduced={reduced}>
      <div
        className="lm12-stage"
        onPointerMove={(event) => control.current?.move(event.clientX)}
      >
        <span>Archivo / genuine width axis</span>
        <h3 ref={title}>
          BAYYINAH
          <br />
          TV
        </h3>
        <div>
          wdth{" "}
          <output ref={readout} aria-label="Current font width">
            100.0
          </output>
        </div>
      </div>
      <label className="lm12-control">
        Resting width{" "}
        <input
          aria-label="Archivo width axis"
          type="range"
          min="62"
          max="125"
          step="1"
          value={width}
          onChange={(event) => choose(Number(event.target.value))}
        />
        <span>{width}</span>
      </label>
      <div className="lm12-bottom">
        <p>
          {reduced
            ? "Use the slider to change the width directly."
            : "Move across the letters. Velocity stretches them and fades over one second."}
        </p>
        <button type="button" onClick={() => choose(100)}>
          Reset
        </button>
      </div>
    </div>
  );
}
