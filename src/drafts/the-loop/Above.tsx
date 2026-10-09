import { useRef, type MouseEvent, type ReactNode } from "react";
import { Link } from "react-router";
import { PhoneFrame } from "../../components/PhoneFrame";
import { arrive, useArrive } from "./arrive";
import { boards, own, phones, WEEK_SMALL } from "./data";
import { useReducedMotion } from "./hooks";
import { Next } from "./icons";
import { moving, OUT, pose } from "./room";

/** The camera starts low, looking across the floor, and rises until it looks straight down. */
const RISE = { y: 14, z: -320, rx: 62 };
const RISE_MS = 1500;

interface Spot {
  n?: string;
  name: string;
  /** A chapter of the home, or a page. */
  to: { chapter: string } | { page: string };
  wide?: boolean;
  shot: ReactNode;
}

const img = (src: string) => <img src={src} alt="" width={1440} height={900} loading="lazy" decoding="async" />;

const spots: Spot[] = [
  { n: "01", name: "AI engineering", to: { chapter: "ai" }, shot: img(WEEK_SMALL) },
  { n: "02", name: "Design System", to: { chapter: "design-system" }, shot: img(boards[0].small) },
  { n: "03", name: "Server work", to: { chapter: "server" }, wide: true, shot: img("/personal/shots/za-table-two-seats-1080.webp") },
  {
    n: "04",
    name: "Mobile apps",
    to: { chapter: "mobile" },
    shot: (
      <span className="ab-phones">
        {phones.map((p) => (
          <PhoneFrame key={p.src} src={p.src} alt="" />
        ))}
      </span>
    ),
  },
  { n: "05", name: "Web3", to: { chapter: "web3" }, shot: img("/showcase/incentiv/web-03-1080.webp") },
  { n: "06", name: "Own projects", to: { chapter: "own" }, shot: img(own[0].shot.small) },
  { name: "How the workflow works", to: { page: "/drafts/the-loop/workflow" }, shot: img("/showcase/care/old-new/new-compliance-1080.webp") },
];

function rise(floor: HTMLElement) {
  const box = { width: floor.offsetWidth, height: floor.offsetHeight };
  const run = floor.animate(
    [
      { transform: pose(RISE, box), opacity: 0 },
      { opacity: 1, offset: 0.3 },
      { transform: "none", opacity: 1 },
    ],
    { duration: RISE_MS, easing: OUT, fill: "backwards" },
  );
  return moving(floor, [run]);
}

/**
 * The finale: the camera rises over the room and every chapter's screen lies on the floor like a map.
 * Each screen is a link back to its chapter. At rest the map is flat to the camera, so it is sharp.
 */
export function Above() {
  const reduce = useReducedMotion();
  const view = useRef<HTMLDivElement>(null);
  const floor = useRef<HTMLElement>(null);
  const state = useArrive(
    view,
    (mode) => {
      const node = floor.current;
      if (!node) return;
      if (mode === "room") rise(node);
      else arrive(node, "flat");
    },
    0.35,
  );

  const go = (event: MouseEvent<HTMLAnchorElement>, chapter: string) => {
    const target = document.getElementById(`ch-${chapter}`);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reduce ? "instant" : "smooth" });
    if (!target.hasAttribute("tabindex")) target.tabIndex = -1;
    target.focus({ preventScroll: true });
    history.replaceState(history.state, "", `#ch-${chapter}`);
  };

  return (
    <section className="lp-ch lp-above" data-chapter="above" aria-labelledby="lp-above-title">
      <div className="lp-wrap">
        <h2 className="lp-h2" id="lp-above-title">
          The whole room, from above
        </h2>
        <p className="lp-ch-line">Pick a screen to go back to its chapter.</p>
        <div className="room-view ab-view" ref={view} data-arrive={state}>
          <nav className="ab-floor" ref={floor} aria-labelledby="lp-above-title">
            <ul className="ab-map">
              {spots.map((s) => {
                const label = (
                  <>
                    <span className="ab-shot">{s.shot}</span>
                    <span className="ab-label">
                      {s.n && <span className="ab-n">{`${s.n} `}</span>}
                      {"page" in s.to ? (
                        <>
                          {s.name.slice(0, s.name.lastIndexOf(" ") + 1)}
                          <span className="ab-tail">
                            {s.name.slice(s.name.lastIndexOf(" ") + 1)}
                            <Next />
                          </span>
                        </>
                      ) : (
                        s.name
                      )}
                    </span>
                  </>
                );
                return (
                  <li key={s.name} className="ab-spot" data-wide={s.wide ? "" : undefined}>
                    {"page" in s.to ? (
                      <Link className="ab-link" to={s.to.page} state={{ fromHome: true }}>
                        {label}
                      </Link>
                    ) : (
                      <a className="ab-link" href={`#ch-${s.to.chapter}`} onClick={(e) => go(e, (s.to as { chapter: string }).chapter)}>
                        {label}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
}
