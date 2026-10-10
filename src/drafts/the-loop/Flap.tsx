import { useContext, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { Settled, useReducedMotion } from "./hooks";
import { OUT } from "./room";
import "./flap.css";

/** The time between the starts of two digits of one figure, in ms. */
const STAGGER = 55;
/** One quick turn: the top half falls in FALL ms; the bottom half lands in LAND ms; the next turn starts NEXT ms after this one. */
const FALL = 80;
const LAND = 100;
const NEXT = 130;
/** The last turn is slower, so the real digit settles. */
const LAST_FALL = 120;
const LAST_LAND = 200;
/** No digit turns for longer than this, in ms from the figure's start. */
const BUDGET = 900;
/** The tiles fade out after the last digit lands, and the plain number stays. */
const FADE = 260;

type State = "wait" | "run" | "fade" | "rest";

const isDigit = (c: string) => c >= "0" && c <= "9";

/** The digits one card shows, from the first to the real one. 2 to 4 turns, fewer for a later digit, so the whole figure lands in BUDGET ms. */
function sequence(target: number, j: number) {
  const room = Math.floor((BUDGET - j * STAGGER - (LAST_FALL + LAST_LAND)) / NEXT) + 1;
  const turns = Math.max(2, Math.min(2 + ((j + target) % 3), room));
  return Array.from({ length: turns + 1 }, (_, i) => (target + 10 - (turns - i) * 3) % 10);
}

/** One digit's card: the halves of every digit it shows. Top halves fall, bottom halves land; at rest each half is flat. */
function Card({ digits }: { digits: number[] }) {
  const n = digits.length - 1;
  return (
    <span className="fl-card" aria-hidden="true">
      <i className="fl-half" data-h="b" data-d={digits[0]} style={{ zIndex: 0 }} />
      {digits.slice(1).map((d, k) => (
        <i key={`b${k}`} className="fl-half fl-land" data-h="b" data-d={d} data-final={k === n - 1 ? "" : undefined} style={{ zIndex: k + 1 }} />
      ))}
      <i className="fl-half" data-h="t" data-d={digits[n]} data-final="" style={{ zIndex: 0 }} />
      {digits.slice(0, n).map((d, k) => (
        <i key={`t${k}`} className="fl-half fl-fall" data-h="t" data-d={d} style={{ zIndex: n - k }} />
      ))}
    </span>
  );
}

/** Starts every turn of every card now. Returns the time, in ms, when the last half lands. */
function turn(root: HTMLElement, at: number) {
  let end = 0;
  root.querySelectorAll<HTMLElement>(".fl-card").forEach((card, j) => {
    const falls = [...card.querySelectorAll<HTMLElement>(".fl-fall")];
    const lands = [...card.querySelectorAll<HTMLElement>(".fl-land")];
    let t = at + 80 + j * STAGGER;
    falls.forEach((fall, k) => {
      const last = k === falls.length - 1;
      const fallMs = last ? LAST_FALL : FALL;
      const landMs = last ? LAST_LAND : LAND;
      fall.animate([{ transform: "none" }, { transform: "rotateX(-90deg)" }], { duration: fallMs, delay: t, easing: "linear", fill: "forwards" });
      lands[k].animate([{ transform: "rotateX(90deg)" }, { transform: "none" }], {
        duration: landMs,
        delay: t + fallMs,
        easing: last ? OUT : "linear",
        fill: "both",
      });
      end = Math.max(end, t + fallMs + landMs);
      t += NEXT;
    });
  });
  root.querySelector(".fl-cards")?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120, delay: at, easing: OUT, fill: "backwards" });
  return end;
}

/**
 * A figure that turns into place like a station board, once, when it arrives.
 * The real number is always the text of the element: the cards are aria-hidden and their digits are CSS content, so copy and screen readers read the number.
 * Without `play`, it starts when it is fully on screen. With `play`, it waits for `play` and starts `at` ms later.
 */
export function Flap({ value, at = 0, play }: { value: string; at?: number; play?: boolean }) {
  const reduce = useReducedMotion();
  const settled = useContext(Settled);
  const root = useRef<HTMLSpanElement>(null);
  const [stage, setStage] = useState<Exclude<State, "run">>(() => (settled ? "rest" : "wait"));
  const [seen, setSeen] = useState(false);
  const go = play ?? seen;
  const state: State = reduce ? "rest" : stage === "wait" && go ? "run" : stage;

  useEffect(() => {
    const node = root.current;
    if (!node || play !== undefined || state !== "wait") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setSeen(true);
      },
      { threshold: 1, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [play, state]);

  useLayoutEffect(() => {
    const node = root.current;
    if (!node || state !== "run") return;
    const end = turn(node, at);
    const fade = window.setTimeout(() => setStage("fade"), end);
    return () => window.clearTimeout(fade);
  }, [state, at]);

  useEffect(() => {
    if (state !== "fade") return;
    const id = window.setTimeout(() => setStage("rest"), FADE);
    return () => window.clearTimeout(id);
  }, [state]);

  if (state === "rest")
    return (
      <span className="fl" ref={root}>
        {value}
      </span>
    );

  let j = 0;
  return (
    <span className="fl" ref={root} data-flap={state} style={{ "--fl-fade": `${FADE}ms` } as CSSProperties}>
      <span className="fl-cards">
        {[...value].map((c, i) =>
          isDigit(c) ? (
            <span key={i} className="fl-c">
              {c}
              <Card digits={sequence(Number(c), j++)} />
            </span>
          ) : (
            c
          ),
        )}
      </span>
    </span>
  );
}
