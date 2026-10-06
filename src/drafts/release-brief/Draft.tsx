import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Link } from "react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowDownIcon, ArrowRightIcon, ArrowUpRightIcon } from "@phosphor-icons/react";
import { links } from "../../content/links";
import { CropShot } from "../../components/CropShot";
import { REAL_SCREENS } from "../../content/careShots";
import { newest, oldest, releaseOf, sentenceOf, type Change, type Release } from "./data";
import { PlateStage } from "./Plate";
import { Rail, type SelectSource } from "./Rail";
import { Statement } from "./Statement";
import "./release-brief.css";

function useMedia(query: string) {
  return useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

const firstPlated = (release: Release) => release.changes.findIndex((change) => change.plate);

interface ChangeProps {
  release: Release;
  change: Change;
  index: number;
  open: boolean;
  cited: boolean;
  onToggle: () => void;
}

function ChangeRow({ release, change, index, open, cited, onToggle }: ChangeProps) {
  const number = `${release.major}.${index + 1}`;
  const plateId = `rb-plate-${release.major}-${index + 1}`;
  const plate = change.plate;
  return (
    <li
      id={`rb-note-${release.major}-${index + 1}`}
      className="rb-change"
      data-cited={cited || undefined}
      data-open={open || undefined}
      tabIndex={-1}
    >
      <p className="rb-change-head">
        <span className="rb-no">{number}</span>
        <span className="rb-kind">{change.kind}</span>
      </p>
      <div className="rb-change-body">
        <p className="rb-change-text">{change.text}</p>
        <p className="rb-meta">{change.meta}</p>
        {(change.caseSlug || change.links?.length) && (
          <p className="rb-links">
            {change.caseSlug && (
              <Link to={`/work/${change.caseSlug}`}>
                Read the case
                <ArrowRightIcon aria-hidden="true" weight="regular" />
              </Link>
            )}
            {change.links?.map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                {link.label}
                <ArrowUpRightIcon aria-hidden="true" weight="regular" />
              </a>
            ))}
          </p>
        )}
      </div>
      {plate && (
        <figure className="rb-fig">
          {open ? (
            <div id={plateId} className="rb-plate">
              <PlateStage plate={plate} />
            </div>
          ) : (
            <button
              type="button"
              className="rb-thumb"
              tabIndex={-1}
              aria-hidden="true"
              onClick={onToggle}
            >
              {plate.kind === "shot" ? (
                <CropShot shot={plate.thumb} alt="" fill />
              ) : (
                <img src={plate.thumb} alt="" loading="lazy" decoding="async" width={160} height={100} />
              )}
            </button>
          )}
          <figcaption className="rb-caption">
            <span className="rb-no">Plate {number}</span>{" "}
            <span>
              {plate.title}.{" "}
              {plate.kind === "shot" ? REAL_SCREENS : "Screens from public pages."}
            </span>{" "}
            <button
              type="button"
              className="rb-toggle"
              aria-expanded={open}
              aria-controls={plateId}
              onClick={onToggle}
            >
              {open ? "Close" : "Open"}
              <span className="rb-sr"> plate {number}</span>
            </button>
          </figcaption>
        </figure>
      )}
    </li>
  );
}

export default function Draft() {
  const reduced = useReducedMotion() ?? false;
  const narrow = useMedia("(max-width: 759px)");
  const [major, setMajor] = useState(newest);
  const [source, setSource] = useState<SelectSource>("click");
  const [touched, setTouched] = useState(false);
  const [plates, setPlates] = useState<ReadonlyMap<string, boolean>>(() => new Map());
  const [cited, setCited] = useState<string | null>(null);
  const [heard, setHeard] = useState("");
  const top = useRef<HTMLDivElement>(null);
  const toNote = useRef<string | null>(null);

  const instant = reduced || source === "key";
  const release = releaseOf(major);
  const sentence = sentenceOf(release);

  const select = useCallback((next: number, from: SelectSource) => {
    setSource(from);
    setTouched(true);
    setCited(null);
    setMajor(next);
    setHeard(`${releaseOf(next).years}. ${sentenceOf(releaseOf(next))}`);
  }, []);

  const isOpen = (key: string, index: number) =>
    plates.get(key) ?? index === firstPlated(release);

  const toggle = (key: string, index: number) =>
    setPlates((current) => new Map(current).set(key, !isOpen(key, index)));

  const cite = (note: number) => {
    const key = `${major}.${note - 1}`;
    if (release.changes[note - 1]?.plate) setPlates((current) => new Map(current).set(key, true));
    setCited(key);
    toNote.current = `rb-note-${major}-${note}`;
  };

  useEffect(() => {
    if (!toNote.current) return;
    const target = document.getElementById(toNote.current);
    toNote.current = null;
    if (!target) return;
    target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    target.focus({ preventScroll: true });
  }, [cited, reduced]);

  const step = (next: number) => {
    select(next, "click");
    top.current?.scrollIntoView({ behavior: "auto", block: "start" });
  };

  const earlier = major > oldest ? releaseOf(major - 1) : null;

  return (
    <div className="rb">
      <title>Release brief — Gentrit Rashiti</title>
      <a className="rb-skip" href="#rb-notes">
        Skip to the release notes
      </a>
      <header className="rb-runner">
        <p className="rb-runner-title">
          <span>Gentrit Rashiti</span>{" "}
          <em>Frontend and mobile developer, full stack since 2026</em>
        </p>
        <nav aria-label="Contact">
          <a href={links.cv} download>
            <span className="rb-wide">{"Download "}</span>CV
          </a>
          <a href={`mailto:${links.email}`}>Email</a>
          <a className="rb-wide" href={links.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
        </nav>
      </header>

      <main className="rb-page">
        <div ref={top} className="rb-top">
          <Statement
            release={release}
            present={releaseOf(newest)}
            instant={instant}
            narrow={narrow}
            sentence={sentence}
            onCite={cite}
          />
          <Rail major={major} reduced={reduced} touched={touched} onSelect={select} />
          <p className="rb-sr" aria-live="polite">
            {heard}
          </p>
        </div>

        <div id="rb-notes" className="rb-notes">
          <AnimatePresence initial={false}>
            <motion.section
              key={release.major}
              className="rb-release"
              aria-labelledby={`rb-release-${release.major}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, pointerEvents: "none" }}
              transition={{ duration: reduced ? 0 : 0.2, ease: [0.23, 1, 0.32, 1] }}
            >
              <header className="rb-release-head">
                <h2 id={`rb-release-${release.major}`}>
                  <span className="rb-no">{release.major}.0</span>
                  <span className="rb-release-title">{release.title}</span>
                </h2>
                <p className="rb-release-meta">
                  {release.years} · {release.role} · {release.scope.join(", ")}
                </p>
              </header>
              <ol className="rb-changes">
                {release.changes.map((change, index) => {
                  const key = `${release.major}.${index}`;
                  return (
                    <ChangeRow
                      key={key}
                      release={release}
                      change={change}
                      index={index}
                      open={isOpen(key, index)}
                      cited={cited === key}
                      onToggle={() => toggle(key, index)}
                    />
                  );
                })}
              </ol>
              <footer className="rb-next">
                {earlier ? (
                  <button type="button" onClick={() => step(earlier.major)}>
                    <span className="rb-next-label">Earlier</span>
                    <span className="rb-next-title">
                      <span className="rb-no">{earlier.major}.0</span> {earlier.years},{" "}
                      {earlier.title.charAt(0).toLowerCase() + earlier.title.slice(1)}
                    </span>
                    <ArrowDownIcon aria-hidden="true" weight="regular" />
                  </button>
                ) : (
                  <button type="button" onClick={() => step(newest)}>
                    <span className="rb-next-label">Back to now</span>
                    <span className="rb-next-title">
                      <span className="rb-no">{newest}.0</span> {releaseOf(newest).years}
                    </span>
                    <ArrowDownIcon aria-hidden="true" weight="regular" />
                  </button>
                )}
              </footer>
            </motion.section>
          </AnimatePresence>
        </div>

        <footer className="rb-colophon">
          <p>
            Set in Newsreader and JetBrains Mono. The Vianova care and design-system screens
            are real product screens with invented data. Every other screen comes from a
            public page or a store listing.
          </p>
          <p className="rb-colophon-links">
            <a href={`mailto:${links.email}`}>{links.email}</a>
            <a href={links.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a href={links.github} target="_blank" rel="noreferrer">
              {links.githubLabel}
            </a>
            <a href={links.cv} download>
              Download CV
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
