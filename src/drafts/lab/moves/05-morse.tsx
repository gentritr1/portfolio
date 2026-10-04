import { useEffect, useRef, useState } from "react";
import { createBoardAudio, type BoardAudio } from "../../linja/audio";
import type { LabMoveProps } from "../types";
import "./05-morse.css";

const dit = 60;
const soundPreference = "gentrit-lab-morse-sound";
const letters: Record<string, string> = {
  ".-": "A",
  "-...": "B",
  "-.-.": "C",
  "-..": "D",
  ".": "E",
  "..-.": "F",
  "--.": "G",
  "....": "H",
  "..": "I",
  ".---": "J",
  "-.-": "K",
  ".-..": "L",
  "--": "M",
  "-.": "N",
  "---": "O",
  ".--.": "P",
  "--.-": "Q",
  ".-.": "R",
  "...": "S",
  "-": "T",
  "..-": "U",
  "...-": "V",
  ".--": "W",
  "-..-": "X",
  "-.--": "Y",
  "--..": "Z",
};

export default function MorseMove({ active, reduced }: LabMoveProps) {
  const audio = useRef<BoardAudio | null>(null);
  const timers = useRef<number[]>([]);
  const started = useRef<number | null>(null);
  const sequence = useRef("");
  const playing = useRef(false);
  const [sound, setSound] = useState(false);
  const [savedSound, setSavedSound] = useState(() => {
    try {
      return localStorage.getItem(soundPreference) === "on";
    } catch {
      return false;
    }
  });
  const [down, setDown] = useState(false);
  const [marks, setMarks] = useState("· − −");
  const [result, setResult] = useState(
    "Try W, or hold the key to send a letter.",
  );
  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }
  function key(value: boolean) {
    audio.current?.key(value);
    setDown(value);
  }
  useEffect(() => {
    const stop = () => {
      clearTimers();
      audio.current?.key(false);
      started.current = null;
      playing.current = false;
      sequence.current = "";
      setDown(false);
    };
    const hidden = () => {
      if (document.hidden) stop();
    };
    if (!active) stop();
    document.addEventListener("visibilitychange", hidden);
    return () => {
      clearTimers();
      audio.current?.dispose();
      audio.current = null;
      setSound(false);
      setDown(false);
      document.removeEventListener("visibilitychange", hidden);
    };
  }, [active]);
  function toggleSound() {
    try {
      if (!audio.current) audio.current = createBoardAudio();
      if (sound) audio.current.key(false);
      const next = !sound;
      audio.current.enable(next);
      setSound(next);
      setSavedSound(next);
      try {
        localStorage.setItem(soundPreference, next ? "on" : "off");
      } catch {
        // Opt-in still works when storage is unavailable.
      }
    } catch {
      setResult("Audio unavailable. The visual key keeps its timing.");
    }
  }
  function playW() {
    clearTimers();
    key(false);
    started.current = null;
    sequence.current = "";
    playing.current = true;
    setMarks("");
    setResult("Playing W: 60 / 180 / 180 ms.");
    let cursor = 0;
    let text = "";
    for (const symbol of ".--") {
      const start = cursor;
      text += symbol;
      const label = text;
      timers.current.push(
        window.setTimeout(() => {
          key(true);
          setMarks(label);
        }, start),
      );
      cursor += symbol === "." ? dit : dit * 3;
      timers.current.push(window.setTimeout(() => key(false), cursor));
      cursor += dit;
    }
    timers.current.push(
      window.setTimeout(
        () => {
          playing.current = false;
          setResult("W decoded ✓ · 420 ms letter pause.");
        },
        cursor - dit + dit * 7,
      ),
    );
  }
  function press() {
    if (!active || started.current !== null) return;
    clearTimers();
    if (playing.current) {
      sequence.current = "";
      playing.current = false;
      key(false);
    }
    started.current = performance.now();
    key(true);
    setResult("Key down · release to send.");
  }
  function release() {
    if (started.current === null) return;
    const symbol = performance.now() - started.current < dit * 2 ? "." : "-";
    started.current = null;
    key(false);
    sequence.current = (sequence.current + symbol).slice(-6);
    setMarks(sequence.current);
    timers.current.push(
      window.setTimeout(() => {
        const value = sequence.current;
        setResult(
          letters[value]
            ? `${letters[value]} decoded ✓ · ${value}`
            : `No letter for ${value}. Try .-- for W.`,
        );
        sequence.current = "";
      }, dit * 7),
    );
  }
  return (
    <div className="lm05" data-reduced={reduced} data-down={down}>
      <div className="lm05-signal">
        <i aria-hidden="true" />
        <span aria-label={`Morse pattern ${marks}`}>{marks}</span>
      </div>
      <button
        className="lm05-key"
        disabled={!active}
        aria-label="Morse key. Hold Space or Enter, then release."
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          press();
        }}
        onPointerUp={release}
        onPointerCancel={release}
        onBlur={release}
        onKeyDown={(event) => {
          if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            if (!event.repeat) press();
          }
        }}
        onKeyUp={(event) => {
          if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            release();
          }
        }}
      >
        Hold key
      </button>
      <div className="lm05-controls">
        <button disabled={!active} onClick={playW}>
          Play W · .--
        </button>
        <button disabled={!active} aria-pressed={sound} onClick={toggleSound}>
          {sound
            ? "Sound on ✓"
            : savedSound
              ? "Enable saved sound"
              : "Sound off"}
        </button>
      </div>
      <output aria-live="polite">
        {active ? result : "Paused while inactive."}
      </output>
      <p>60 ms dit · 180 ms dah · 420 ms pause</p>
    </div>
  );
}
