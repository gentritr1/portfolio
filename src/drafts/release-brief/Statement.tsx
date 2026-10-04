import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { Release } from "./data";

type Role = "gone" | "was" | "now";

interface Segment {
  key: number;
  text: string;
  role: Role;
  from: Role | null;
}

const easeOut = "cubic-bezier(0.23, 1, 0.32, 1)";
const easeInOut = "cubic-bezier(0.77, 0, 0.175, 1)";
const clip = "inset(-0.5em 0 -0.5em 0)";
let nextKey = 1;

/**
 * The line for one selected year: the 2026 clause struck, then that year's
 * clause. On a phone only the year's clause stays.
 */
function arrange(previous: Segment[], text: string, present: string, narrow: boolean, instant: boolean) {
  const wanted = new Map<string, Role>(
    narrow || text === present ? [[text, "now"]] : [[present, "was"], [text, "now"]],
  );
  const next: Segment[] = previous
    .filter((segment) => segment.role !== "gone")
    .map((segment) => {
      const role = wanted.get(segment.text);
      wanted.delete(segment.text);
      return { ...segment, role: role ?? "gone", from: segment.role };
    })
    .filter((segment) => !instant || segment.role !== "gone");
  for (const [added, role] of wanted) {
    const segment = { key: nextKey++, text: added, role, from: null };
    if (role === "was") next.unshift(segment);
    else next.push(segment);
  }
  return next;
}

interface LineProps {
  text: string;
  present: string;
  index: number;
  instant: boolean;
  narrow: boolean;
}

function Line({ text, present, index, instant, narrow }: LineProps) {
  const [segments, setSegments] = useState<Segment[]>(() => [
    { key: 0, text, role: "now", from: null },
  ]);
  const [shown, setShown] = useState(text);
  const [change, setChange] = useState({ count: 0, animate: false, narrow });
  const ref = useRef<HTMLSpanElement>(null);

  if (shown !== text) {
    setShown(text);
    setChange({ count: change.count + 1, animate: !instant, narrow });
    setSegments(arrange(segments, text, present, narrow, instant));
  }

  const drop = (key: number) =>
    setSegments((current) => current.filter((segment) => segment.key !== key));

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || !change.animate) return;
    const delay = index * 70;
    const write = delay + (change.narrow ? 420 : 300);

    for (const element of root.querySelectorAll<HTMLElement>(".rb-seg")) {
      const segment = {
        key: Number(element.dataset.key),
        role: element.dataset.role as Role,
        from: (element.dataset.from ?? null) as Role | null,
      };
      const strike = element.querySelector<HTMLElement>(".rb-strike");
      const width = element.getBoundingClientRect().width;

      if (segment.role !== "now" && segment.from === "now") {
        strike?.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
          duration: 220,
          delay,
          easing: easeOut,
          fill: "backwards",
        });
      }

      if (segment.role === "now" && segment.from === "was") {
        strike?.animate(
          [
            { transform: "scaleX(1)", transformOrigin: "right" },
            { transform: "scaleX(0)", transformOrigin: "right" },
          ],
          { duration: 220, delay, easing: easeOut, fill: "backwards" },
        );
      }

      if (segment.role === "now" && segment.from === null) {
        element.animate(
          [
            { width: "0px", opacity: 0.4, clipPath: clip },
            { width: `${width}px`, opacity: 1, clipPath: clip },
          ],
          { duration: 340, delay: write, easing: easeInOut, fill: "backwards" },
        );
      }

      // A leaving clause folds while the new clause writes in, with the same timing,
      // so the line is never wider than the two clauses that stay.
      if (segment.role === "gone") {
        const gap = getComputedStyle(element).paddingRight;
        const fold = element.animate(
          [
            { width: `${width}px`, paddingRight: gap, opacity: 1, clipPath: clip },
            { paddingRight: gap, offset: 0.85 },
            { width: "0px", paddingRight: "0px", opacity: 0, clipPath: clip },
          ],
          { duration: 340, delay: write, easing: easeInOut, fill: "forwards" },
        );
        fold.onfinish = () => drop(segment.key);
      }
    }

    return () => {
      root.getAnimations({ subtree: true }).forEach((animation) => animation.finish());
    };
    // Only a new clause starts animations; dropping a folded segment must not.
  }, [change, index]);

  return (
    <span ref={ref} className="rb-clause" style={{ "--d": `${index * 70}ms` } as CSSProperties}>
      {segments.map((segment) => (
        <span
          key={segment.key}
          className="rb-seg"
          data-role={segment.role}
          data-from={segment.from ?? undefined}
          data-key={segment.key}
        >
          {segment.text}
          <span className="rb-strike" aria-hidden="true" />
        </span>
      ))}
    </span>
  );
}

interface StatementProps {
  release: Release;
  present: Release;
  instant: boolean;
  narrow: boolean;
  sentence: string;
  onCite: (note: number) => void;
}

export function Statement({ release, present, instant, narrow, sentence, onCite }: StatementProps) {
  return (
    <div className="rb-statement">
      <h1 className="rb-sentence">
        <span className="rb-sr">{sentence}</span>
        <span className="rb-lines" aria-hidden="true">
          <span className="rb-line">
            <span className="rb-name">Gentrit Rashiti</span> builds
          </span>
          {release.says.map((clause, index) => (
            <span className="rb-line" key={index}>
              <Line
                text={clause.text}
                present={present.says[index].text}
                index={index}
                instant={instant}
                narrow={narrow}
              />
            </span>
          ))}
        </span>
      </h1>
      <ol className="rb-cites" aria-label="Proof for each clause">
        <li aria-hidden="true" />
        {release.says.map((clause, index) => (
          <li key={index}>
            <button
              type="button"
              className="rb-cite"
              onClick={() => onCite(clause.cites)}
              aria-label={`Proof for “${clause.text.replace(/[,.]$/, "")}”: note ${release.major}.${clause.cites}`}
            >
              <span aria-hidden="true">↳</span>
              <span key={`${release.major}.${clause.cites}`} className="rb-cite-no">
                {release.major}.{clause.cites}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
