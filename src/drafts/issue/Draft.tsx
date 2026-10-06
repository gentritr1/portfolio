import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { OldCareFile } from "../../components/portfolio/OldCareFile";
import { OldDraftMotion } from "../../components/portfolio/OldDraftMotion";
import { links } from "../../content/links";
import { projects } from "../../content/projects";
import { Book, type BookControl } from "./Book";
import { aboutFolio, features, folio, indexFolio, leftFolio, storyFolio } from "./features";
import { ease } from "./motion";
import "./issue.css";

const offday = projects.find((p) => p.slug === "offday")!;
const NARROW = "(max-width: 800px)";

function useNarrow() {
  const [narrow, setNarrow] = useState(() => matchMedia(NARROW).matches);
  useEffect(() => {
    const query = matchMedia(NARROW);
    const change = () => setNarrow(query.matches);
    query.addEventListener("change", change);
    return () => query.removeEventListener("change", change);
  }, []);
  return narrow;
}

/** Where the cover word crosses the spread, it prints in the ground colour. */
function usePrintClip(verb: RefObject<HTMLHeadingElement | null>) {
  useLayoutEffect(() => {
    const heading = verb.current;
    const spread = heading?.parentElement?.querySelector<HTMLElement>(".iss-spread");
    if (!heading || !spread) return;
    const book = spread.parentElement!;
    const measure = () => {
      const top = book.offsetTop - heading.offsetTop;
      const left = book.offsetLeft - heading.offsetLeft;
      heading.style.setProperty("--print-top", `${top}px`);
      heading.style.setProperty("--print-left", `${left}px`);
      heading.style.setProperty("--print-right", `${heading.offsetWidth - left - book.offsetWidth}px`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(heading);
    observer.observe(spread);
    return () => observer.disconnect();
  }, [verb]);
}

const letter: Variants = {
  hidden: ({ first }: { first: boolean }) =>
    first
      ? { clipPath: "inset(-30% -20% 130% -20%)", y: 40, opacity: 1, filter: "blur(0px)" }
      : { clipPath: "inset(-30% -20% -40% -20%)", y: 12, opacity: 0, filter: "blur(4px)" },
  shown: ({ i, first, reduced }: { i: number; first: boolean; reduced: boolean }) => ({
    clipPath: "inset(-30% -20% -40% -20%)",
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: reduced
      ? { duration: 0.01 }
      : first
        ? { duration: 0.9, ease: ease.arrive, delay: 0.45 + i * 0.04 }
        : { duration: 0.22, ease: ease.arrive, delay: 0.08 + i * 0.018 },
  }),
  gone: ({ i, reduced }: { i: number; reduced: boolean }) => ({
    y: reduced ? 0 : -12,
    opacity: 0,
    filter: reduced ? "blur(0px)" : "blur(4px)",
    transition: { duration: reduced ? 0.01 : 0.15, ease: ease.out, delay: reduced ? 0 : i * 0.01 },
  }),
};

const settledWord: Variants = {
  hidden: { opacity: 1 },
  shown: { opacity: 1 },
  gone: ({ reduced }: { reduced: boolean }) => ({
    y: reduced ? 0 : -12,
    opacity: 0,
    filter: reduced ? "blur(0px)" : "blur(4px)",
    transition: { duration: reduced ? 0.01 : 0.15, ease: ease.out },
  }),
};

/** Letters animate one by one, then the word becomes one text run so its kerning pairs return. */
function Word({ word, first, reduced }: { word: string; first: boolean; reduced: boolean }) {
  const [settled, setSettled] = useState(reduced);
  return (
    <motion.span
      className="iss-word"
      initial="hidden"
      animate="shown"
      exit="gone"
      custom={{ reduced }}
      variants={settled ? settledWord : undefined}
      onAnimationComplete={(definition) => {
        if (definition === "shown") setSettled(true);
      }}
    >
      {settled
        ? word
        : [...word].map((char, i) => (
            <motion.span key={i} custom={{ i, first, reduced }} variants={letter}>
              {char}
            </motion.span>
          ))}
    </motion.span>
  );
}

function Verb({ word }: { word: string }) {
  const reduced = Boolean(useReducedMotion());
  const [first, setFirst] = useState(true);
  useEffect(() => setFirst(false), []);
  return (
    <span className="iss-verb-slot">
      <AnimatePresence initial={!reduced}>
        <Word key={word} word={word} first={first} reduced={reduced} />
      </AnimatePresence>
    </span>
  );
}

export default function Draft() {
  const narrow = useNarrow();
  const [shown, setShown] = useState(0);
  const book = useRef<BookControl>(null);
  const verb = useRef<HTMLHeadingElement>(null);
  usePrintClip(verb);
  const feature = features[shown];
  const project = projects.find((p) => p.slug === feature.slug)!;

  return (
    <div className="draft-issue" style={{ "--ground": feature.ground } as CSSProperties}>
      <OldDraftMotion />
      <title>The working issue — Gentrit Rashiti</title>
      <header className="iss-mast">
        <p>
          <a href="/drafts">Gentrit Rashiti</a>
          <span>Issue 01</span>
          <span>2021–26</span>
        </p>
        <nav aria-label="Sections">
          <a href="#iss-index">Contents</a>
          <a href="#iss-about">About</a>
          <a href={`mailto:${links.email}`}>Email</a>
        </nav>
      </header>
      <main>
        <section className="iss-cover" aria-label="The working issue">
          <h1 className="iss-verb" ref={verb}>
            <span className="iss-sr">{feature.verb}</span>
            <span className="iss-verb-ink" aria-hidden="true">
              <Verb word={feature.verb} />
            </span>
            <span className="iss-verb-print" aria-hidden="true">
              <Verb word={feature.verb} />
            </span>
          </h1>
          <div className="iss-cover-grid">
            <nav className="iss-contents" aria-label="Features in this issue">
              <h2>Contents</h2>
              <ol>
                {features.map((f, i) => {
                  const name = projects.find((p) => p.slug === f.slug)!.name;
                  return (
                    <li key={f.slug} style={{ "--i": i } as CSSProperties}>
                      <button
                        type="button"
                        aria-current={i === shown ? "page" : undefined}
                        onClick={() => book.current?.turnTo(i)}
                      >
                        <span className="iss-folio">{folio(leftFolio(i))}</span>
                        <strong>{name}</strong>
                        <span className="iss-line">{f.line}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
              <a className="iss-contents-index" href="#iss-index" style={{ "--i": features.length } as CSSProperties}>
                <span className="iss-folio">{folio(indexFolio)}</span>
                <strong>The complete index</strong>
                <span className="iss-line">{projects.length} projects</span>
              </a>
            </nav>
            <Book ref={book} narrow={narrow} onShow={setShown} />
          </div>
          <p className="iss-sr" role="status">
            {project.name}, feature {shown + 1} of {features.length}
          </p>
        </section>

        <section className="iss-story" id="iss-story" aria-labelledby="iss-story-title">
          <header className="iss-section-head">
            <span className="iss-folio">{folio(storyFolio)}</span>
            <span>Cover story · Offday · Personal project · 2026</span>
          </header>
          <h2 id="iss-story-title">
            A little less
            <br />
            <span className="iss-light">back and forth.</span>
          </h2>
          <div className="iss-story-columns">
            <p className="iss-drop">{offday.summary}</p>
            <aside>
              <blockquote>About 200 tests, including security and tenant isolation.</blockquote>
              <p className="iss-meta">{offday.stack.join(" · ")}</p>
            </aside>
          </div>
          <figure>
            <img
              src="/personal/shots/offday-app-desktop.webp"
              loading="lazy"
              alt="Offday team calendar in the demo workspace, October leave bars and approval queue"
            />
            <figcaption>
              <span>The team calendar, light theme</span>
              <span>Owner’s public capture</span>
            </figcaption>
          </figure>
        </section>

        <section className="iss-index" id="iss-index" aria-labelledby="iss-index-title">
          <header className="iss-section-head">
            <span className="iss-folio">{folio(indexFolio)}</span>
            <span>{projects.length} projects, 2021–26</span>
          </header>
          <h2 id="iss-index-title">
            The complete <span className="iss-light">index.</span>
          </h2>
          <div className="iss-index-rows">
            {projects.map((p, i) => (
              <details key={p.slug}>
                <summary>
                  <span className="iss-folio">{folio(i + 1)}</span>
                  <strong>{p.name}</strong>
                  <span className="iss-leader" aria-hidden="true" />
                  <span className="iss-folio">{p.years ?? "—"}</span>
                </summary>
                <div>
                  <OldCareFile slug={p.slug} />
                  <p>{p.summary}</p>
                  <p className="iss-meta">{p.stack.join(" · ")}</p>
                  {p.links.length > 0 && (
                    <nav aria-label={`${p.name} links`}>
                      {p.links.map((l) => (
                        <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
                          {l.label}
                        </a>
                      ))}
                    </nav>
                  )}
                </div>
              </details>
            ))}
          </div>
        </section>

        <section className="iss-about" id="iss-about" aria-labelledby="iss-about-title">
          <header className="iss-section-head">
            <span className="iss-folio">{folio(aboutFolio)}</span>
            <span>Editor’s note</span>
          </header>
          <h2 id="iss-about-title">
            Behind <span className="iss-light">the pages.</span>
          </h2>
          <div className="iss-about-body">
            <p>
              Gentrit Rashiti makes web and mobile products, from the first screen to release: healthcare,
              video streaming, e-reading and Web3.
            </p>
            <p>
              Five years and more, and part of two platform rewrites. React, Next.js, Vue and Nuxt on the web.
              React Native on iOS and Android. Laravel and FastAPI behind the interface.
            </p>
            <p className="iss-meta">Based in Kosovo, working remotely · Bachelor’s degree, UBT</p>
          </div>
          <div className="iss-about-contact">
            <a className="iss-email" href={`mailto:${links.email}`}>
              {links.email}
            </a>
            <nav aria-label="Elsewhere">
              <a href={links.linkedin}>LinkedIn</a>
              <a href={links.github}>GitHub</a>
              <a href={links.cv} download>
                Download CV
              </a>
            </nav>
          </div>
        </section>
      </main>
      <footer className="iss-colophon">
        <a href="/drafts">All drafts</a>
        <span>Set in Cormorant Garamond, Literata and JetBrains Mono · Issue 01 · 2026</span>
      </footer>
    </div>
  );
}
