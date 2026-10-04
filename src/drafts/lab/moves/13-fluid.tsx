import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import type { LabMoveProps } from "../types";
import { createFluidSolver } from "./13-fluid-solver";
import type { Dye, FluidSolver } from "./13-fluid-solver";
import "./13-fluid.css";

const rows: { name: string; fact: string; colour: Dye }[] = [
  {
    name: "Bayyinah TV",
    fact: "34 routes · English / Arabic",
    colour: [0.86, 0.14, 0.22],
  },
  {
    name: "Read to Feed",
    fact: "PDF · EPUB · ISBN",
    colour: [0.16, 0.59, 0.62],
  },
  { name: "FJALË", fact: "21k Albanian words", colour: [0.91, 0.65, 0.07] },
];

export default function FluidMove({ active, reduced }: LabMoveProps) {
  const field = useRef<HTMLDivElement>(null),
    engine = useRef<FluidSolver | null>(null);
  const previous = useRef<{
    x: number;
    y: number;
    time: number;
    pointer: number;
  } | null>(null);
  const [ready, setGpu] = useState(false),
    [selected, setSelected] = useState(-1),
    [notice, setNotice] = useState("Move across a row, or press it.");
  const gpu = active && !reduced && ready;
  useEffect(() => {
    let disposed = false;
    if (!active || reduced || !field.current) return;
    const host = field.current,
      buttons = Array.from(host.querySelectorAll<HTMLButtonElement>("button"));
    engine.current = createFluidSolver(host, buttons, () => {
      setGpu(false);
      setNotice("Static colours · float graphics unavailable");
    });
    queueMicrotask(() => {
      if (!disposed) {
        setGpu(Boolean(engine.current));
        if (!engine.current)
          setNotice("Static colours · float graphics unavailable");
      }
    });
    if (engine.current) {
      const bounds = host.getBoundingClientRect();
      buttons.forEach((button, index) => {
        const rect = button.getBoundingClientRect();
        engine.current?.inject(
          0.25 + index * 0.2,
          1 - (rect.top + rect.height / 2 - bounds.top) / bounds.height,
          0.36,
          0.12,
          rows[index].colour,
        );
      });
    }
    return () => {
      disposed = true;
      engine.current?.dispose();
      engine.current = null;
      previous.current = null;
    };
  }, [active, reduced]);
  function injectRow(index: number) {
    const host = field.current,
      button = host?.querySelectorAll("button")[index];
    if (!host || !button) return;
    const bounds = host.getBoundingClientRect(),
      rect = button.getBoundingClientRect();
    engine.current?.inject(
      0.28,
      1 - (rect.top + rect.height / 2 - bounds.top) / bounds.height,
      0.7,
      0.18,
      rows[index].colour,
    );
    setSelected(index);
    setNotice(rows[index].name + " colour added.");
  }
  function move(event: PointerEvent<HTMLDivElement>) {
    if (!engine.current || !field.current) return;
    const bounds = field.current.getBoundingClientRect(),
      x = (event.clientX - bounds.left) / bounds.width,
      y = 1 - (event.clientY - bounds.top) / bounds.height;
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "button[data-row]",
    );
    const index = button ? Number(button.dataset.row) : -1;
    const last = previous.current;
    previous.current = {
      x,
      y,
      time: event.timeStamp,
      pointer: event.pointerId,
    };
    if (
      index < 0 ||
      !last ||
      last.pointer !== event.pointerId ||
      event.timeStamp - last.time > 180
    )
      return;
    const dt = Math.max(0.008, (event.timeStamp - last.time) / 1000);
    engine.current.inject(
      x,
      y,
      ((x - last.x) / dt) * 0.3,
      ((y - last.y) / dt) * 0.3,
      rows[index].colour,
    );
  }
  return (
    <div
      className="lm13"
      data-renderer={gpu ? "webgl" : "static"}
      data-reduced={reduced}
      data-grid="128"
      data-pressure-iterations="20"
    >
      <p className="lm13-instruction">
        Move between the rows. Their colours travel.
      </p>
      <div
        className="lm13-field"
        ref={field}
        onPointerMove={move}
        onPointerLeave={() => {
          previous.current = null;
        }}
      >
        {rows.map((row, index) => (
          <button
            key={row.name}
            data-row={index}
            aria-pressed={selected === index}
            onClick={() => injectRow(index)}
          >
            <span>
              <strong>{row.name}</strong>
              <small>{row.fact}</small>
            </span>
            <span className="lm13-add" aria-hidden="true">
              +
            </span>
          </button>
        ))}
      </div>
      <div className="lm13-footer">
        <p role="status">
          {reduced ? "Static row colours · reduced motion" : notice}
        </p>
        <button
          onClick={() => {
            engine.current?.clear();
            setSelected(-1);
            setNotice("Flow cleared. Press a row to add colour.");
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
