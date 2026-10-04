import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createBoardAudio, type BoardAudio } from "../../linja/audio";
import type { LabMoveProps } from "../types";
import "./04-sound.css";

const preference = "gentrit-lab-mechanical-sound";
export default function SoundMove({ active, reduced }: LabMoveProps) {
  const audio = useRef<BoardAudio | null>(null);
  const timers = useRef<number[]>([]);
  const [enabled, setEnabled] = useState(false);
  const [saved, setSaved] = useState(() => {
    try {
      return localStorage.getItem(preference) === "on";
    } catch {
      return false;
    }
  });
  const [burst, setBurst] = useState(0);
  const [status, setStatus] = useState("Sound off. Choose enable to listen.");
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      audio.current?.dispose();
      audio.current = null;
      setEnabled(false);
    },
    [active],
  );
  function toggle() {
    if (!active) return;
    const next = !enabled;
    try {
      if (next && !audio.current) audio.current = createBoardAudio();
      audio.current?.enable(next);
      setEnabled(next);
      setSaved(next);
      try {
        localStorage.setItem(preference, next ? "on" : "off");
      } catch {
        /* Sound still works without storage. */
      }
      setStatus(next ? "Sound enabled. Try the 64-disc burst." : "Sound off.");
    } catch {
      setStatus(
        "Audio is unavailable in this browser. The disc pulse remains visible.",
      );
    }
  }
  function play() {
    if (!active) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setBurst((value) => value + 1);
    for (let batch = 0; batch < 8; batch++)
      timers.current.push(
        window.setTimeout(() => audio.current?.flips(8), batch * 2),
      );
    setStatus(
      enabled
        ? "64 flips scheduled · 20 ms noise · 64-voice ceiling."
        : "64-disc visual pulse · sound is off.",
    );
  }
  return (
    <div className="lm04" data-reduced={reduced}>
      <div className="lm04-grains" key={burst} aria-hidden="true">
        {Array.from({ length: 64 }, (_, index) => (
          <i
            key={index}
            data-play={burst > 0}
            style={{ "--grain-delay": `${index * 0.7}ms` } as CSSProperties}
          />
        ))}
      </div>
      <div className="lm04-controls">
        <button onClick={toggle} disabled={!active} aria-pressed={enabled}>
          {enabled
            ? "Sound on ✓"
            : saved
              ? "Enable saved sound"
              : "Enable sound"}
        </button>
        <button onClick={play} disabled={!active}>
          Play 64 flips
        </button>
      </div>
      <output aria-live="polite">{status}</output>
    </div>
  );
}
