import { useContext, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { Settled, useReducedMotion } from "./hooks";
import "./flap.css";

/** The time between the starts of two digits of one figure, in ms. */
const STAGGER = 70;
/** One turn: the top half falls in FALL ms, then the bottom half lands in LAND ms. The next turn starts when this one is half landed. */
const FALL = 80;
const LAND = 110;
/** The last turn, onto the real digit, is a little slower. */
const LAST_FALL = 100;
const LAST_LAND = 120;
/** A falling half speeds up; a landing half slows down. No overshoot. */
const FALL_EASE = "cubic-bezier(0.5, 0, 0.75, 0)";
const LAND_EASE = "cubic-bezier(0.25, 1, 0.5, 1)";
/** How dark a half is when it stands on its edge. */
const SHADE = 0.6;
/** After the last digit lands, the tiles fade and the plain number stays. */
const FADE = 240;

type State = "wait" | "run" | "settle" | "rest";

const isDigit = (c: string) => c >= "0" && c <= "9";

/** A card with no digit on it, as on a station board before it turns. */
const BLANK = -1;

/**
 * The digits one card shows: a blank tile, then counting up into the real digit, 3 turns or 2 for every second digit.
 * Public Sans has no tabular digits, and its 1 is about 0.4em wide where the other digits are about 0.62em, so a wide
 * digit never turns on a 1's narrow card and a 1 never stands in for a wide digit: a 1 turns once, from blank.
 */
function sequence(target: number, j: number) {
  if (target === 1) return [BLANK, 1];
  const shown = [target];
  for (let d = target; shown.length < 3 - (j % 2); ) {
    d = (d + 9) % 10;
    if (d !== 1) shown.unshift(d);
  }
  return [BLANK, ...shown];
}

const face = (d: number) => (d === BLANK ? "" : d);

/** One digit's card: the halves of every digit it shows. Top halves fall, bottom halves land; at rest each half is flat. */
function Card({ digits }: { digits: number[] }) {
  const n = digits.length - 1;
  return (
    <span className="fl-card">
      <i className="fl-half" data-h="b" data-d={face(digits[0])} style={{ zIndex: 0 }} />
      {digits.slice(1).map((d, k) => (
        <i key={`b${k}`} className="fl-half fl-land" data-h="b" data-d={face(d)} style={{ zIndex: k + 1 }}>
          <b className="fl-shade" />
        </i>
      ))}
      <i className="fl-half" data-h="t" data-d={face(digits[n])} style={{ zIndex: 0 }} />
      {digits.slice(0, n).map((d, k) => (
        <i key={`t${k}`} className="fl-half fl-fall" data-h="t" data-d={face(d)} style={{ zIndex: n - k }}>
          <b className="fl-shade" />
        </i>
      ))}
    </span>
  );
}

/**
 * Puts each card and each hinge on its character of the real text. A card is as high as the line; its glyph box is the
 * character's own box, so a card's last digit stands on the same pixels as the real digit under it.
 */
function place(root: HTMLElement) {
  const text = root.firstChild;
  if (!text || text.nodeType !== Node.TEXT_NODE) return;
  const base = root.getBoundingClientRect();
  const line = parseFloat(getComputedStyle(root).lineHeight);
  const cards = root.querySelectorAll<HTMLElement>(".fl-card");
  const hinges = root.querySelectorAll<HTMLElement>(".fl-hinge");
  const range = document.createRange();
  let h = 0;
  for (let i = 0; i < cards.length; i++) {
    range.setStart(text, i);
    range.setEnd(text, i + 1);
    const r = range.getBoundingClientRect();
    const high = Number.isNaN(line) ? r.height : line;
    const dy = (r.height - high) / 2;
    const left = `${r.left - base.left}px`;
    const top = r.top - base.top + dy;
    Object.assign(cards[i].style, { left, top: `${top}px`, width: `${r.width}px`, height: `${high}px` });
    cards[i].style.setProperty("--fl-dy", `${dy}px`);
    cards[i].style.setProperty("--fl-h", `${r.height}px`);
    if (cards[i].classList.contains("fl-still")) continue;
    Object.assign(hinges[h++].style, { left, top: `${top + high / 2}px`, width: `${r.width}px` });
  }
}

/** Starts every turn of every card. The promise settles when the last half has landed on screen. */
function turn(root: HTMLElement, at: number) {
  const runs: Animation[] = [];
  root.querySelectorAll<HTMLElement>(".fl-card:not(.fl-still)").forEach((card, j) => {
    const falls = [...card.querySelectorAll<HTMLElement>(".fl-fall")];
    const lands = [...card.querySelectorAll<HTMLElement>(".fl-land")];
    // A card with fewer turns starts later, so its last turn lands with its neighbours'.
    let t = at + 60 + j * STAGGER + (3 - (j % 2) - falls.length) * (FALL + LAND / 2);
    falls.forEach((fall, k) => {
      const last = k === falls.length - 1;
      const fallMs = last ? LAST_FALL : FALL;
      const landMs = last ? LAST_LAND : LAND;
      const falling = { duration: fallMs, delay: t, easing: FALL_EASE, fill: "forwards" } as const;
      const landing = { duration: landMs, delay: t + fallMs, easing: LAND_EASE, fill: "both" } as const;
      runs.push(
        fall.animate([{ transform: "none" }, { transform: "rotateX(-90deg)" }], falling),
        fall.firstElementChild!.animate([{ opacity: 0 }, { opacity: SHADE }], falling),
        lands[k].animate([{ transform: "rotateX(90deg)" }, { transform: "none" }], landing),
        lands[k].firstElementChild!.animate([{ opacity: SHADE }, { opacity: 0 }], landing),
      );
      t += fallMs + landMs / 2;
    });
  });
  for (const layer of root.querySelectorAll(".fl-cards, .fl-hinges"))
    runs.push(layer.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, delay: at, easing: "ease-out", fill: "backwards" }));
  return Promise.all(runs.map((r) => r.finished));
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
  const placed = useRef(false);
  const go = play ?? seen;
  const state: State = reduce ? "rest" : stage === "wait" && go ? "run" : stage;

  // The cards are put on their characters while the figure is still on its way in, so the frame that starts the turns
  // reads no layout. A resize puts them again.
  useEffect(() => {
    const node = root.current;
    if (!node || state !== "wait") return;
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || placed.current) return;
        place(node);
        placed.current = true;
      },
      { rootMargin: "0px 0px 50% 0px" },
    );
    const resize = () => {
      placed.current = false;
      near.unobserve(node);
      near.observe(node);
    };
    near.observe(node);
    window.addEventListener("resize", resize);
    return () => {
      near.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [state]);

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

  // The real digits take over from the cards only when the last half has landed, on the animation clock, so a slow
  // frame cannot cut a turn short.
  useLayoutEffect(() => {
    const node = root.current;
    if (!node || state !== "run") return;
    let live = true;
    if (!placed.current) place(node);
    turn(node, at).then(
      () => live && setStage("settle"),
      () => undefined,
    );
    return () => {
      live = false;
    };
  }, [state, at]);

  useEffect(() => {
    if (state !== "settle") return;
    const id = window.setTimeout(() => setStage("rest"), FADE + 60);
    return () => window.clearTimeout(id);
  }, [state]);

  if (state === "rest")
    return (
      <span className="fl" ref={root}>
        {value}
      </span>
    );

  let j = 0;
  const digits = [...value].map((c) => (isDigit(c) ? sequence(Number(c), j++) : null));
  return (
    <span className="fl" ref={root} data-flap={state} style={{ "--fl-fade": `${FADE}ms` } as CSSProperties}>
      {value}
      <span className="fl-cards" aria-hidden="true">
        {digits.map((d, i) => (d ? <Card key={i} digits={d} /> : <span key={i} className="fl-card fl-still" data-d={value[i]} />))}
      </span>
      <span className="fl-hinges" aria-hidden="true">
        {digits.map((d, i) => d && <i key={i} className="fl-hinge" />)}
      </span>
    </span>
  );
}
