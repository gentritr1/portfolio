import { useEffect, useRef, useState } from "react";
import { createLetterPhysics } from "../../fjalekryq/letterPhysics";
import type { LabMoveProps } from "../types";
import "./06-letters.css";

export default function LettersMove({ active, reduced }: LabMoveProps) {
  const host = useRef<HTMLDivElement>(null);
  const physics = useRef<ReturnType<typeof createLetterPhysics> | null>(null);
  const [runs, setRuns] = useState(0);
  useEffect(() => {
    if (!active || reduced || !host.current) return;
    physics.current = createLetterPhysics(host.current);
    return () => {
      physics.current?.dispose();
      physics.current = null;
    };
  }, [active, reduced]);
  function drop() {
    host.current
      ?.querySelectorAll<HTMLElement>("[data-letter]")
      .forEach((letter, index) =>
        physics.current?.drop(letter, index * 50, 74),
      );
    setRuns((value) => value + 1);
  }
  return (
    <div className="lm06" ref={host} data-reduced={reduced}>
      <div className="lm06-cells" aria-label="FJALË">
        {[..."FJALË"].map((letter, index) => (
          <div className="lm06-cell" key={index}>
            <small>{index + 1}</small>
            <span data-letter aria-hidden="true">
              {letter}
            </span>
          </div>
        ))}
      </div>
      <button onClick={drop} disabled={!active}>
        Drop the letters
      </button>
      <output aria-live="polite">
        {runs
          ? reduced
            ? "FJALË placed · reduced motion"
            : `Drop ${runs} · letters settle into their cells`
          : "Five letters. Five fixed cells."}
      </output>
    </div>
  );
}
