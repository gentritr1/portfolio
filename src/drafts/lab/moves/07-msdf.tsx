import { useEffect, useRef, useState } from "react";
import { createNameMorph, type NameMorph } from "../../lap/msdf";
import type { LabMoveProps } from "../types";
import "./07-msdf.css";

const names = ["BAYYINAH TV", "FUTURISMA", "FJALË"];
export default function MsdfMove({ active, reduced }: LabMoveProps) {
  const host = useRef<HTMLDivElement>(null);
  const morph = useRef<NameMorph | null>(null);
  const current = useRef(0);
  const [selected, setSelected] = useState(0);
  const [previous, setPrevious] = useState(0);
  const [engine, setEngine] = useState<"loading" | "msdf" | "fallback">(
    "loading",
  );
  useEffect(() => {
    if (!active || !host.current) return;
    let cancelled = false;
    setEngine("loading");
    void createNameMorph(host.current, names, reduced)
      .then((value) => {
        if (cancelled) {
          value?.dispose();
          return;
        }
        morph.current = value;
        value?.set(current.current, true);
        setEngine(value ? "msdf" : "fallback");
      })
      .catch(() => {
        if (!cancelled) setEngine("fallback");
      });
    return () => {
      cancelled = true;
      morph.current?.dispose();
      morph.current = null;
    };
  }, [active, reduced]);
  function select(index: number) {
    setPrevious(current.current);
    current.current = index;
    setSelected(index);
    morph.current?.set(index, reduced);
  }
  return (
    <div className="lm07" data-engine={engine} data-reduced={reduced}>
      <div className="lm07-type">
        <div className="lm07-canvas" ref={host} />
        {engine !== "msdf" && (
          <div
            key={`${previous}-${selected}`}
            className="lm07-fallback"
            aria-hidden="true"
          >
            <span className="lm07-old">{names[previous]}</span>
            <span className="lm07-new">{names[selected]}</span>
          </div>
        )}
      </div>
      <div className="lm07-controls" aria-label="Name to morph to">
        {names.map((name, index) => (
          <button
            key={name}
            disabled={!active}
            onClick={() => select(index)}
            aria-pressed={selected === index}
          >
            {index === 0 ? "Bayyinah" : name}
          </button>
        ))}
      </div>
      <output aria-live="polite">
        {names[selected]}
        {engine === "fallback"
          ? " · cross-fade fallback"
          : engine === "loading"
            ? " · loading atlas"
            : " · distance-field morph"}
      </output>
      <p>RGB edge distances → median → mix → threshold</p>
    </div>
  );
}
