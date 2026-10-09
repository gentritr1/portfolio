import { useEffect, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { spotIn, type Box } from "../../components/BrowserFrame";
import { Back, Next } from "./icons";
import "./cases.css";

const HOME = "/drafts/the-loop";

/** A ring on the part of a screen that proves the chapter. `box` is in the capture's CSS pixels. */
export function Ring({
  box,
  label,
  side = "right",
  above = false,
  width = 1440,
  height = 900,
}: {
  box: Box;
  label: string;
  side?: "left" | "right";
  above?: boolean;
  width?: number;
  height?: number;
}) {
  const s = spotIn(box, width, height);
  return (
    <span
      className="lp-proof"
      data-reveal=""
      data-side={side}
      data-above={above ? "" : undefined}
      style={{ "--x": `${s.x}%`, "--y": `${s.y}%`, "--w": `${s.w}%`, "--h": `${s.h}%` } as CSSProperties}
    >
      <span className="lp-proof-ring" aria-hidden="true" />
      <span className="lp-proof-label">{label}</span>
    </span>
  );
}

export function Chapter({ name, title, children, figure }: { name: string; title: string; children: ReactNode; figure: ReactNode }) {
  return (
    <section className="lp-chapter" aria-labelledby={`lp-ch-${name}`}>
      <div className="lp-chapter-text lp-wrap">
        <p className="lp-chapter-name" id={`lp-ch-${name}`}>
          {name}
        </p>
        <h2 className="lp-chapter-title" data-reveal="">
          {title}
        </h2>
        <div className="lp-chapter-body">{children}</div>
      </div>
      <div className="lp-chapter-figure lp-wrap">{figure}</div>
    </section>
  );
}

let restoreHome: (() => void) | undefined;

/**
 * The home's links into a case carry the state `fromHome`. The app scrolls to the top on each route change,
 * so on the way back this restores the place where the reader left the home.
 */
export function CaseTop() {
  const { state } = useLocation();
  const [homeY] = useState(() => window.scrollY);
  useEffect(() => {
    if (!state?.fromHome) return;
    if (restoreHome) window.removeEventListener("popstate", restoreHome);
    restoreHome = () => {
      restoreHome = undefined;
      let frames = 0;
      const step = () => {
        if (window.location.pathname.replace(/\/$/, "") !== HOME || ++frames > 60) return;
        const home = document.querySelector('.lp[data-view="home"]');
        if (home && document.documentElement.scrollHeight >= homeY + window.innerHeight) window.scrollTo(0, homeY);
        else requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    window.addEventListener("popstate", restoreHome, { once: true });
  }, [state, homeY]);
  return (
    <div className="lp-wrap lp-case-top">
      <BackLink />
    </div>
  );
}

function BackLink() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const back = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!state?.fromHome) return;
    event.preventDefault();
    navigate(-1);
  };
  return (
    <Link to={HOME} className="lp-link lp-back" onClick={back}>
      <Back />
      Back to the loop
    </Link>
  );
}

export function NextCase({ to, name, line }: { to: string; name: string; line: string }) {
  return (
    <Link to={to} className="lp-next">
      <span className="lp-next-label">Next case</span>
      <span className="lp-next-name">
        {name}
        <Next />
      </span>
      <span className="lp-next-line">{line}</span>
    </Link>
  );
}

export function CaseEnd({ stack, engineers, next }: { stack: string[]; engineers: string[]; next: ReactNode }) {
  return (
    <section className="lp-wrap lp-case-end" aria-labelledby="lp-built-with">
      <h2 id="lp-built-with" className="lp-h3">
        Built with
      </h2>
      <ul className="lp-pills">
        {stack.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      <details className="lp-eng" open>
        <summary>For engineers</summary>
        <ul>
          {engineers.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      </details>
      {next}
      <BackLink />
    </section>
  );
}
