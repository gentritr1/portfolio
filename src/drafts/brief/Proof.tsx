import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { parseProof, readAs, type Token } from "./briefs";

type State = "problem" | "struck" | "result";

const easeOut = "cubic-bezier(0.23, 1, 0.32, 1)";
const easeMove = "cubic-bezier(0.65, 0, 0.35, 1)";
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Words({ tokens }: { tokens: Token[] }) {
  return tokens.map((token) => (
    <span key={token.id} className="bf-t" data-kind={token.kind}>
      {token.space ? " " : "⁠"}
      <span className="bf-w" data-id={token.id}>
        {token.text}
        {token.kind === "was" && <span className="bf-strike" data-join={token.joinsNext || undefined} />}
      </span>
    </span>
  ));
}

export function Proof({ source, label }: { source: string; label: string }) {
  const tokens = useMemo(() => parseProof(source), [source]);
  const [state, setState] = useState<State>("problem");
  const live = useRef<HTMLSpanElement>(null);
  const run = useRef(0);
  const touched = useRef(false);

  const rects = () => {
    const root = live.current!;
    const origin = root.getBoundingClientRect();
    const map = new Map<string, DOMRect>();
    root.querySelectorAll<HTMLElement>(".bf-w").forEach((word) => {
      if (word.offsetParent === null) return;
      const box = word.getBoundingClientRect();
      map.set(word.dataset.id!, new DOMRect(box.x - origin.x, box.y - origin.y, box.width, box.height));
    });
    return map;
  };

  const settle = (next: State) => {
    const root = live.current!;
    const before = rects();
    root.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
    flushSync(() => setState(next));
    return before;
  };

  const glide = (before: Map<string, DOMRect>) => {
    const after = rects();
    live.current!.querySelectorAll<HTMLElement>(".bf-w").forEach((word) => {
      const from = before.get(word.dataset.id!);
      const to = after.get(word.dataset.id!);
      if (!from || !to) return;
      const dx = from.x - to.x;
      const dy = from.y - to.y;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
      word.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }], {
        duration: 520,
        easing: easeMove,
      });
    });
  };

  const resolve = async () => {
    const id = ++run.current;
    if (reducedMotion()) {
      settle("result");
      return;
    }
    const before = settle("struck");
    glide(before);
    const strikes = [...live.current!.querySelectorAll<HTMLElement>(".bf-strike")];
    strikes.forEach((strike, index) => {
      strike.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
        duration: 240,
        delay: index * 60,
        easing: easeOut,
        fill: "backwards",
      });
    });
    await wait(strikes.length * 60 + 360);
    if (id !== run.current) return;
    glide(settle("result"));
    live.current!.querySelectorAll<HTMLElement>('[data-kind="now"] .bf-w').forEach((word, index) => {
      word.animate(
        [
          { clipPath: "inset(-10% 100% -20% 0)", opacity: 0.4 },
          { clipPath: "inset(-10% 0 -20% 0)", opacity: 1 },
        ],
        { duration: 360, delay: 140 + index * 45, easing: easeOut, fill: "backwards" },
      );
    });
  };

  const restore = async () => {
    const id = ++run.current;
    if (reducedMotion()) {
      settle("problem");
      return;
    }
    const root = live.current!;
    const inserted = [...root.querySelectorAll<HTMLElement>('[data-kind="now"] .bf-w')];
    if (state === "result" && inserted.some((word) => word.offsetParent !== null)) {
      root.getAnimations({ subtree: true }).forEach((animation) => animation.finish());
      await Promise.all(
        inserted.map(
          (word) =>
            word.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, easing: easeOut, fill: "forwards" })
              .finished,
        ),
      );
      if (id !== run.current) return;
    }
    glide(settle("problem"));
    live.current!.querySelectorAll<HTMLElement>(".bf-strike").forEach((strike) => {
      strike.animate([{ transform: "scaleX(1)", transformOrigin: "right" }, { transform: "scaleX(0)", transformOrigin: "right" }], {
        duration: 200,
        easing: easeOut,
      });
    });
  };

  useEffect(() => {
    const line = live.current!;
    let timer = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        window.clearTimeout(timer);
        if (entry.intersectionRatio < 0.97 || touched.current) return;
        timer = window.setTimeout(() => {
          if (touched.current) return;
          touched.current = true;
          observer.disconnect();
          void resolve();
        }, 450);
      },
      { threshold: [0, 0.97] },
    );
    observer.observe(line);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  const showing = state === "problem" ? "problem" : "result";
  const choose = (next: "problem" | "result") => {
    touched.current = true;
    if (next === showing) return;
    void (next === "result" ? resolve() : restore());
  };

  return (
    <span className="bf-proof-block">
      <span className="bf-switch" role="group" aria-label={`${label}: problem or result`}>
        {(["problem", "result"] as const).map((value) => (
          <button
            key={value}
            type="button"
            className="bf-switch-option"
            aria-pressed={showing === value}
            onClick={() => choose(value)}
          >
            {value === "problem" ? "Problem" : "Result"}
          </button>
        ))}
      </span>
      <span className="bf-proof">
        <span className="bf-sr">
          {`Problem: ${readAs(tokens, "problem")} Result: ${readAs(tokens, "result")}`}
        </span>
        <span ref={live} className="bf-proof-line" data-state={state} aria-hidden="true">
          <Words tokens={tokens} />
        </span>
        <span className="bf-proof-line bf-proof-sizer" data-state="result" aria-hidden="true">
          <Words tokens={tokens} />
        </span>
      </span>
    </span>
  );
}
