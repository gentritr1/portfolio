import { useEffect, useRef, useState } from "react";
import { createBoard, type Board } from "../../linja/board";
import { DISC_COUNT, putText } from "../../linja/bitmap";
import type { LabMoveProps } from "../types";
import "./03-board.css";

const messages = ["FJALË", "LINJA", "MORSE"];

export default function BoardMove({ active, reduced }: LabMoveProps) {
  const host = useRef<HTMLDivElement>(null);
  const board = useRef<Board | null>(null);
  const chosen = useRef(0);
  const columns = useRef(144);
  const [selected, setSelected] = useState(0);
  const [shape, setShape] = useState("144 × 48");
  function renderMessage(index: number, instant = false) {
    const cols = columns.current;
    const bits = new Uint8Array(DISC_COUNT);
    const scale = cols === 144 ? 3 : 2;
    const word = messages[index];
    putText(
      bits,
      cols,
      word,
      Math.floor((cols - word.length * 6 * scale) / 2),
      cols === 144 ? 12 : 25,
      scale,
    );
    if (cols === 72) putText(bits, cols, "6912", 24, 65);
    board.current?.set(bits, instant, [cols / 2, cols === 144 ? 24 : 48]);
  }
  useEffect(() => {
    if (!active || !host.current) return;
    const element = host.current;
    function resize() {
      const cols = element.parentElement!.clientWidth < 400 ? 72 : 144;
      if (board.current && columns.current === cols) return;
      board.current?.dispose();
      columns.current = cols;
      element.dataset.tall = String(cols === 72);
      setShape(cols === 144 ? "144 × 48" : "72 × 96");
      board.current = createBoard(
        element,
        cols,
        DISC_COUNT / cols,
        () => {},
        reduced,
      );
      renderMessage(chosen.current, true);
    }
    const observer = new ResizeObserver(resize);
    observer.observe(element.parentElement!);
    resize();
    return () => {
      observer.disconnect();
      board.current?.dispose();
      board.current = null;
    };
  }, [active, reduced]);
  function select(index: number) {
    chosen.current = index;
    setSelected(index);
    renderMessage(index, reduced);
  }
  return (
    <div className="lm03" data-reduced={reduced}>
      <div className="lm03-display">
        <div ref={host} className="lm03-board" />
      </div>
      <div className="lm03-controls" aria-label="Board message">
        {messages.map((name, index) => (
          <button
            key={name}
            disabled={!active}
            aria-pressed={selected === index}
            onClick={() => select(index)}
          >
            {name}
          </button>
        ))}
      </div>
      <output aria-live="polite">
        {messages[selected]} · {shape} · 6,912 discs
        {reduced ? " · final frame" : ""}
      </output>
    </div>
  );
}
