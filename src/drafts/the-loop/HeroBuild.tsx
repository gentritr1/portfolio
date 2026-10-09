import { useEffect, useRef, useState, type CSSProperties } from "react";
import { BrowserFrame } from "../../components/BrowserFrame";
import { APPROVED_AT, BUILD_DONE, CHECKS_AT, H, pieces, W, WEEK, WEEK_SMALL, type Piece } from "./data";
import { Approved, Checked, Replay } from "./icons";
import { useReducedMotion } from "./hooks";
import { sheen, SHEEN_AFTER } from "./room";

const pct = (n: number, of: number) => `${((n / of) * 100).toFixed(4)}%`;

export function pieceStyle(p: Piece): CSSProperties {
  const timing = { animationDelay: `${p.at}ms`, animationDuration: `${p.len}ms` };
  if (p.wipe === "drop") {
    return {
      ...timing,
      left: pct(p.x, W),
      top: pct(p.y, H),
      width: pct(p.w, W),
      height: pct(p.h, H),
      backgroundPosition: `${((-p.x / W) * 100).toFixed(4)}cqw ${((-p.y / H) * 100).toFixed(4)}cqh`,
    } as CSSProperties;
  }
  // A structural piece covers the whole screen and shows its part through a clip, so every piece snaps to the same box.
  return {
    ...timing,
    inset: 0,
    backgroundPosition: `${(((p.x - (p.sx ?? p.x)) / W) * 100).toFixed(4)}cqw 0`,
    "--t": pct(p.y, H),
    "--r": pct(W - p.x - p.w, W),
    "--b": pct(H - p.y - p.h, H),
    "--l": pct(p.x, W),
  } as CSSProperties;
}

type Phase = "wait" | "build" | "done";

let built = false;

/**
 * The care calendar fills itself from its own capture: the shell, the grid, the events, then two stamps.
 * The construction is real pixels of one file; the settled frame is the file itself.
 */
export function HeroBuild() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(reduce || built ? "done" : "wait");
  const [run, setRun] = useState(0);
  const timer = useRef<number | undefined>(undefined);
  const light = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reduce || (built && run === 0)) {
      setPhase("done");
      return;
    }
    let live = true;
    const small = window.matchMedia("(max-width: 640px)").matches;
    const image = new Image();
    image.src = small ? WEEK_SMALL : WEEK;
    const start = () => {
      if (!live) return;
      built = true;
      setPhase("build");
      timer.current = window.setTimeout(() => {
        setPhase("done");
        if (light.current) sheen(light.current, SHEEN_AFTER);
      }, BUILD_DONE);
    };
    image.decode().then(start, start);
    return () => {
      live = false;
      window.clearTimeout(timer.current);
    };
  }, [reduce, run]);

  const replay = () => {
    window.clearTimeout(timer.current);
    setPhase("wait");
    setRun((n) => n + 1);
  };

  return (
    <div className="lp-build" data-phase={phase}>
      <BrowserFrame
        src={WEEK}
        alt="Care team calendar for one week in the new React app: calls, video calls and office visits for each patient, with filters and a line at the current time. Invented data."
        width={1440}
        height={900}
        label="Care platform, new app. Real screen, invented data."
        tone="dark"
        eager
        className="lp-build-frame"
      >
        {phase !== "done" && (
          <span className="lp-pieces" key={run} aria-hidden="true">
            {pieces.map((p, i) => (
              <span key={i} className="lp-piece" data-wipe={p.wipe} style={pieceStyle(p)} />
            ))}
          </span>
        )}
        <span className="room-sheen" ref={light} aria-hidden="true" />
      </BrowserFrame>
      <div className="lp-build-foot">
        {reduce ? (
          <span />
        ) : (
          <button type="button" className="lp-replay" onClick={replay} disabled={phase !== "done"} aria-label="Replay the build of the screen">
            <Replay />
            Replay
          </button>
        )}
        <span className="lp-stamps" aria-label="Status of this screen: checks passed, approved by a person">
          <span className="lp-stamp lp-stamp-checks" style={{ animationDelay: `${CHECKS_AT}ms` }}>
            <Checked />
            Checks passed
          </span>
          <span className="lp-stamp lp-stamp-approved" style={{ animationDelay: `${APPROVED_AT}ms` }}>
            <Approved />
            Approved
          </span>
        </span>
      </div>
    </div>
  );
}
