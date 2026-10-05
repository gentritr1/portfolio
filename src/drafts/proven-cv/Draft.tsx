import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent,
} from "react";
import { flushSync } from "react-dom";
import { Link } from "react-router";
import { recreations } from "../../lib/recreations";
import {
  contact,
  education,
  experience,
  identity,
  personal,
  proofs,
  skills,
  type Claim,
  type Plate,
  type Proof,
} from "./data";
import "./proven-cv.css";

/** The proof card sticks at this offset; the pin band starts here. */
const STICKY_TOP = 40;
const order = proofs.map((proof) => proof.id);

function useMedia(query: string) {
  return useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => true,
  );
}

function useViewportHeight() {
  return useSyncExternalStore(
    (notify) => {
      window.addEventListener("resize", notify);
      return () => window.removeEventListener("resize", notify);
    },
    () => window.innerHeight,
    () => 900,
  );
}

/**
 * The pin line sits just under the first marker at load, so only the first
 * claim is current on arrival, and above the card's lower edge, so a current
 * marker always faces the card.
 */
function pinLine(root: HTMLElement) {
  const first = root.querySelector<HTMLElement>("[data-marker]");
  const card = root.querySelector<HTMLElement>(".pc-card");
  if (!first || !card) return 320;
  const firstTop = first.getBoundingClientRect().top + window.scrollY;
  const cardBottom = STICKY_TOP + card.offsetHeight;
  return Math.round(
    Math.min(Math.max(firstTop + 24, STICKY_TOP + 160), cardBottom - 48),
  );
}

/** Plates near the current one mount early; a mounted plate stays mounted. */
function near(id: string) {
  const index = order.indexOf(id);
  return order.slice(Math.max(0, index - 1), index + 3);
}

function PlateView({ plate, eager }: { plate: Plate; eager: boolean }) {
  if (plate.kind === "live") {
    const entry = recreations[plate.key];
    const Recreation = entry.Component;
    return (
      <div className="pc-live" data-world={entry.world}>
        <Suspense fallback={null}>
          <Recreation />
        </Suspense>
      </div>
    );
  }
  if (plate.kind === "web")
    return (
      <img
        className="pc-web"
        src={plate.shot.src}
        alt={plate.shot.alt}
        width={plate.shot.width}
        height={plate.shot.height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
    );
  if (plate.kind === "phones")
    return (
      <div className="pc-phones">
        {plate.shots.map((shot) => (
          <img
            key={shot.src}
            src={shot.src}
            alt={shot.alt}
            width={shot.width}
            height={shot.height}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
          />
        ))}
      </div>
    );
  return (
    <figure className="pc-count">
      <figcaption>{plate.subject}</figcaption>
      {(
        [
          ["Before", plate.before, "timed out"],
          ["After", plate.after, ""],
        ] as const
      ).map(([label, value, note]) => (
        <div className="pc-count-row" key={label} data-row={label}>
          <span className="pc-count-label">{label}</span>
          <span className="pc-count-value">{value}</span>
          <span className="pc-count-ticks" aria-hidden="true">
            {Array.from({ length: value }, (_, index) => (
              <i key={index} />
            ))}
          </span>
          <span className="pc-count-note">
            {value} {value === 1 ? "query" : "queries"}
            {note && `, ${note}`}
          </span>
        </div>
      ))}
    </figure>
  );
}

function Foot({ proof }: { proof: Proof }) {
  return (
    <div className="pc-foot">
      <p className="pc-kind">
        <span className="pc-kind-id">{proof.id}</span> {proof.kind}
      </p>
      <p className="pc-result">{proof.result}</p>
      <div className="pc-foot-row">
        <span className="pc-meta">{proof.meta}</span>
        <Link className="pc-link" to={proof.href}>
          {proof.label} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}

interface View {
  current: string;
  prev: string | null;
  linked: boolean;
  mounted: ReadonlySet<string>;
}

export default function Draft() {
  const wide = useMedia("(min-width: 1024px)");
  const viewport = useViewportHeight();
  const rootRef = useRef<HTMLDivElement>(null);
  const [intro, setIntro] = useState(true);
  const [view, setView] = useState<View>(() => ({
    current: order[0],
    prev: null,
    linked: false,
    mounted: new Set(near(order[0])),
  }));
  const [open, setOpen] = useState<string | null>(order[0]);
  const [opened, setOpened] = useState<ReadonlySet<string>>(
    () => new Set([order[0]]),
  );

  const select = useCallback((id: string, linked: boolean) => {
    setView((state) => {
      if (state.current === id && state.linked === linked) return state;
      const missing = near(id).filter((item) => !state.mounted.has(item));
      return {
        current: id,
        prev: state.current === id ? state.prev : state.current,
        linked,
        mounted: missing.length
          ? new Set([...state.mounted, ...missing])
          : state.mounted,
      };
    });
  }, []);

  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIntro(false), 900);
    let live = true;
    void document.fonts.ready.then(() => {
      if (live) setFontsReady(true);
    });
    return () => {
      live = false;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!wide || !root) return;
    const markers = [
      ...root.querySelectorAll<HTMLElement>("[data-marker]"),
    ];
    const inBand = new Map<string, boolean>();
    const pin = pinLine(root);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.marker;
          if (id) inBand.set(id, entry.isIntersecting);
        }
        const last = order.filter((id) => inBand.get(id)).at(-1);
        setView((state) =>
          last
            ? state
            : state.linked
              ? { ...state, linked: false }
              : state,
        );
        if (last) select(last, true);
      },
      {
        rootMargin: `-${STICKY_TOP}px 0px -${Math.max(0, viewport - pin)}px 0px`,
      },
    );
    for (const marker of markers) observer.observe(marker);
    return () => observer.disconnect();
  }, [wide, viewport, fontsReady, select]);

  const activate = (id: string, event: MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const root = rootRef.current;
    if (event.detail === 0 && root) {
      root.dataset.instant = "";
      requestAnimationFrame(() =>
        requestAnimationFrame(() => delete root.dataset.instant),
      );
    }
    if (wide) {
      const top = button.getBoundingClientRect().top;
      const pin = root ? pinLine(root) : 320;
      if (top < STICKY_TOP || top > pin)
        window.scrollBy({ top: top - (pin - 4), behavior: "instant" });
      select(id, true);
      return;
    }
    const before = button.getBoundingClientRect().top;
    flushSync(() => {
      setOpen((value) => (value === id ? null : id));
      setOpened((set) => (set.has(id) ? set : new Set([...set, id])));
    });
    const shift = button.getBoundingClientRect().top - before;
    if (shift !== 0) window.scrollBy({ top: shift, behavior: "instant" });
  };

  const renderClaim = (claim: Claim) => {
    const proof = claim.proof;
    const isCurrent = proof
      ? wide
        ? view.current === proof.id
        : open === proof.id
      : false;
    return (
      <li
        key={claim.text}
        className="pc-claim"
        data-current={isCurrent || undefined}
        data-linked={(wide && isCurrent && view.linked) || undefined}
      >
        <p className="pc-claim-text">{claim.text}</p>
        {proof && (
          <button
            type="button"
            className="pc-marker"
            data-marker={proof.id}
            aria-label={`Proof ${proof.id}: ${proof.kind}`}
            aria-controls={wide ? "pc-proof" : `pc-proof-${proof.id}`}
            {...(wide
              ? { "aria-current": isCurrent || undefined }
              : { "aria-expanded": isCurrent })}
            onClick={(event) => activate(proof.id, event)}
          >
            <span>{proof.id}</span>
          </button>
        )}
        {proof && wide && <span className="pc-hair" aria-hidden="true" />}
        {proof && !wide && opened.has(proof.id) && (
          <div
            className="pc-inline"
            id={`pc-proof-${proof.id}`}
            hidden={!isCurrent}
            data-plate={proof.plate.kind}
          >
            <div className="pc-plate">
              <PlateView plate={proof.plate} eager={proof.id === order[0]} />
            </div>
            <Foot proof={proof} />
          </div>
        )}
      </li>
    );
  };

  const currentProof = proofs.find((proof) => proof.id === view.current)!;

  return (
    <div
      className="pc"
      ref={rootRef}
      data-wide={wide || undefined}
      data-intro={intro || undefined}
    >
      <title>Gentrit Rashiti — CV with proof</title>
      <div className="pc-page">
        <div className="pc-cv">
          <header className="pc-head">
            <h1>{identity.name}</h1>
            <p className="pc-line">{identity.line}</p>
            <nav aria-label="Contact" className="pc-contact">
              {contact.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  {...(item.href.startsWith("http")
                    ? { target: "_blank", rel: "noreferrer" }
                    : {})}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </header>

          <main>
            <section className="pc-section" aria-labelledby="pc-experience">
              <h2 id="pc-experience">Experience</h2>
              {experience.map((entry) => (
                <article className="pc-entry" key={entry.name}>
                  <header className="pc-entry-head">
                    <h3>{entry.name}</h3>
                    <span className="pc-years">{entry.years}</span>
                    <p className="pc-role">{entry.role}</p>
                  </header>
                  <ul className="pc-claims">{entry.claims.map(renderClaim)}</ul>
                </article>
              ))}
            </section>

            <section className="pc-section" aria-labelledby="pc-personal">
              <h2 id="pc-personal">Own projects</h2>
              <ul className="pc-claims">{personal.map(renderClaim)}</ul>
            </section>

            <section className="pc-section" aria-labelledby="pc-skills">
              <h2 id="pc-skills">Skills</h2>
              <dl className="pc-skills">
                {skills.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="pc-section" aria-labelledby="pc-education">
              <h2 id="pc-education">Education</h2>
              <p>{education}</p>
            </section>
          </main>

          <footer className="pc-end">
            <nav aria-label="Contact again" className="pc-contact">
              {contact.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  {...(item.href.startsWith("http")
                    ? { target: "_blank", rel: "noreferrer" }
                    : {})}
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <p className="pc-note">
              The care platform and the design system are recreations with
              invented data. The other proofs come from public store and web
              pages.
            </p>
          </footer>
        </div>

        {wide && (
          <aside className="pc-aside" aria-label="Proof for the current line">
            <div className="pc-card" id="pc-proof">
              <div className="pc-plates" data-plate={currentProof.plate.kind}>
                {proofs.map((proof) =>
                  view.mounted.has(proof.id) ? (
                    <div
                      key={proof.id}
                      className="pc-plate"
                      data-plate={proof.plate.kind}
                      data-state={
                        proof.id === view.current
                          ? "current"
                          : proof.id === view.prev
                            ? "prev"
                            : "idle"
                      }
                      aria-hidden={proof.id !== view.current || undefined}
                      inert={proof.id !== view.current || undefined}
                    >
                      <PlateView
                        plate={proof.plate}
                        eager={proof.id === order[0]}
                      />
                    </div>
                  ) : null,
                )}
              </div>
              <div className="pc-foot-wrap" key={currentProof.id}>
                <Foot proof={currentProof} />
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
