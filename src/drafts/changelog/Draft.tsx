import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  AnimatePresence,
  LayoutGroup,
  MotionConfig,
  motion,
  useReducedMotion,
  type Transition,
} from "motion/react";
import { PlusIcon } from "@phosphor-icons/react";
import { links } from "../../content/links";
import { CropShot } from "../../components/CropShot";
import {
  addedScope,
  newest,
  releaseOf,
  releases,
  type Change,
  type Release,
} from "./data";
import { fold, ease, still } from "./motion";
import { PlateView } from "./Plate";
import { Rail, type SelectSource } from "./Rail";
import "./changelog.css";

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

function documentTop(element: HTMLElement) {
  let top = 0;
  let node: HTMLElement | null = element;
  while (node) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return top;
}

const counted = (release: Release) =>
  `${release.changes.length} ${release.changes.length === 1 ? "change" : "changes"}`;

function Scope({ release, instant }: { release: Release; instant: boolean }) {
    const added = addedScope(release.major);
    return (
      <ul className="cl-scope">
        <AnimatePresence initial={false} mode="popLayout">
          {release.scope.map((item) => (
            <motion.li
              key={item}
              layout="position"
              initial={{ opacity: 0, filter: "blur(3px)", y: 6 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              exit={{ opacity: 0, filter: "blur(3px)", transition: { duration: instant ? 0 : 0.12 } }}
              transition={instant ? still : { duration: 0.24, ease: ease.out, layout: fold }}
            >
              {item}
              {added.has(item) && <em> new in {release.major}.0</em>}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    );
}

function Margin({ release, instant }: { release: Release; instant: boolean }) {
  const [shown, setShown] = useState(release.major);
  const [sign, setSign] = useState(0);
  if (shown !== release.major) {
    setSign(release.major > shown ? 1 : -1);
    setShown(release.major);
  }
  return (
    <aside className="cl-margin" aria-label="Selected release">
      <p className="cl-margin-ver">
        Release{" "}
        <span className="cl-roll">
          <AnimatePresence initial={false} mode="popLayout" custom={sign}>
            <motion.b
              key={release.major}
              custom={sign}
              variants={{
                enter: (s: number) => ({ y: s >= 0 ? "-0.9em" : "0.9em", opacity: 0 }),
                center: { y: 0, opacity: 1 },
                leave: (s: number) => ({ y: s >= 0 ? "0.9em" : "-0.9em", opacity: 0 }),
              }}
              initial="enter"
              animate="center"
              exit="leave"
              transition={instant ? still : { duration: 0.22, ease: ease.out }}
            >
              {release.major}.0
            </motion.b>
          </AnimatePresence>
        </span>
      </p>
      <p className="cl-margin-years">
        {release.years}
        {release.major === newest ? ", current" : ""}
      </p>
      <h3>Shipped to</h3>
      <Scope release={release} instant={instant} />
      <motion.div layout="position" transition={instant ? still : { layout: fold }}>
        <h3>Role</h3>
        <p className="cl-margin-role">{release.role}</p>
      </motion.div>
    </aside>
  );
}

interface ChangeProps {
  release: Release;
  change: Change;
  index: number;
  open: boolean;
  instant: boolean;
  layout: Transition;
  onToggle: () => void;
  onJump: (major: number) => void;
}

function ChangeRow({ release, change, index, open, instant, layout, onToggle, onJump }: ChangeProps) {
  const number = `${release.major}.${index + 1}`;
  const plateId = `cl-plate-${release.major}-${index + 1}`;
  const plate = change.plate;
  return (
    <motion.li layout="position" transition={{ layout }} className="cl-change">
      <span className="cl-kind">{change.kind}</span>
      <div className="cl-change-body">
        <p className="cl-change-text">{change.text}</p>
        <p className="cl-meta">
          {change.meta}
          {change.continues && (
            <>
              {" · "}
              <button type="button" className="cl-xref" onClick={() => onJump(change.continues!)}>
                Continues in {change.continues}.0
              </button>
            </>
          )}
        </p>
      </div>
      {plate && (
        <button
          type="button"
          className="cl-fig"
          aria-expanded={open}
          aria-controls={plateId}
          aria-label={`${open ? "Hide" : "Show"} plate ${number}: ${plate.title}`}
          onClick={onToggle}
        >
          <span className="cl-fig-thumb">
            {plate.kind === "shot" ? (
              <CropShot shot={plate.thumb} alt="" fill />
            ) : (
              <img src={plate.thumb} alt="" loading="lazy" decoding="async" width={128} height={80} />
            )}
          </span>
          <span className="cl-fig-label">
            Plate {number}
            <PlusIcon aria-hidden="true" weight="regular" />
          </span>
        </button>
      )}
      <AnimatePresence initial={false} mode="popLayout">
        {open && plate && (
          <PlateView
            key="plate"
            id={plateId}
            number={number}
            change={change}
            plate={plate}
            instant={instant}
          />
        )}
      </AnimatePresence>
    </motion.li>
  );
}

export default function Draft() {
  const reduced = useReducedMotion() ?? false;
  const horizontal = useMedia("(max-width: 759px)");
  const wide = useMedia("(min-width: 1100px)");
  const [major, setMajor] = useState(newest);
  const [source, setSource] = useState<SelectSource>("click");
  const [plates, setPlates] = useState<ReadonlySet<string>>(() => new Set());
  const [settled, setSettled] = useState(0);
  const [moved, setMoved] = useState(false);
  const scrollNext = useRef(false);

  const instant = reduced || source === "key";
  const layout: Transition = instant ? still : fold;

  const select = useCallback((next: number, from: SelectSource) => {
    setSource(from);
    setMoved(true);
    setMajor(next);
    if (from !== "drag") scrollNext.current = true;
  }, []);

  const settle = useCallback(() => {
    scrollNext.current = true;
    setSettled((count) => count + 1);
  }, []);

  useEffect(() => {
    if (!scrollNext.current) return;
    scrollNext.current = false;
    const head = document.getElementById(`cl-release-${major}`);
    if (!head) return;
    const top = documentTop(head) - window.scrollY;
    const offset = horizontal ? 12 : 32;
    if (top >= offset - 8 && top <= window.innerHeight * 0.55) return;
    window.scrollTo({
      top: major === newest ? 0 : documentTop(head) - offset,
      behavior: instant ? "auto" : "smooth",
    });
  }, [major, settled, horizontal, instant]);

  const togglePlate = (key: string) => {
    setSource("click");
    setPlates((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selected = releaseOf(major);

  return (
    <MotionConfig reducedMotion="user">
      <div className="cl" data-rail={horizontal ? "bottom" : "side"}>
        <title>Release notes — Gentrit Rashiti</title>
        <a className="cl-skip" href="#cl-notes">
          Skip to the release notes
        </a>
        <header className="cl-runner">
          <p className="cl-runner-title">
            <span>Gentrit Rashiti</span> <em>Release notes, 2021–2026</em>
          </p>
          <nav aria-label="Contact">
            <a href={links.cv} download>
              <span className="cl-wide">{"Download\u00a0"}</span>CV
            </a>
            <a href={`mailto:${links.email}`}>Email</a>
            <a className="cl-wide" href={links.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
          </nav>
        </header>

        <div className="cl-page">
          <Rail
            major={major}
            horizontal={horizontal}
            reduced={reduced}
            onSelect={select}
            onSettle={settle}
          />

          <main id="cl-notes" className="cl-notes" tabIndex={-1}>
            <div className="cl-intro">
              <h1 className="cl-statement">
                <span className="cl-name">Gentrit Rashiti</span> builds web and mobile
                products, from the first screen to the store release.{" "}
                <span
                  key={selected.major}
                  className="cl-clause"
                  data-animate={!instant && moved ? "" : undefined}
                >
                  Release {selected.major}.0 {selected.clause}.
                </span>
              </h1>
              <p className="cl-lede">
                More than five years of product work: two platform rewrites, a design
                system, apps on iOS and Android. Healthcare, video streaming, e-reading
                and Web3. Based in Kosovo, working remotely.
              </p>
            </div>

            <LayoutGroup>
              {releases.map((release) => {
                const open = release.major === major;
                const bodyId = `cl-body-${release.major}`;
                return (
                  <motion.section
                    key={release.major}
                    layout="position"
                    transition={{ layout }}
                    className="cl-release"
                    data-open={open}
                    aria-labelledby={`cl-release-${release.major}`}
                  >
                    <h2 className="cl-release-h">
                      <button
                        type="button"
                        id={`cl-release-${release.major}`}
                        className="cl-release-head"
                        aria-expanded={open}
                        aria-controls={bodyId}
                        aria-disabled={open || undefined}
                        onClick={() => !open && select(release.major, "click")}
                      >
                        <span className="cl-ver">{release.major}.0</span>
                        <span className="cl-release-title">{release.title}</span>
                        <span className="cl-release-years">{release.years}</span>
                        <span className="cl-release-count">{counted(release)}</span>
                      </button>
                    </h2>
                    <AnimatePresence initial={false} mode="popLayout">
                      {open && (
                        <motion.div
                          key="body"
                          id={bodyId}
                          className="cl-release-body"
                          initial={{ opacity: 0, clipPath: "inset(0% 0% 100% 0%)" }}
                          animate={{ opacity: 1, clipPath: "inset(0% 0% 0% 0%)" }}
                          exit={{ opacity: 0, transition: { duration: instant ? 0 : 0.12 } }}
                          transition={{ duration: instant ? 0 : 0.44, ease: ease.out }}
                        >
                          {!wide && (
                            <div className="cl-inline-meta">
                              <span>Shipped to</span>
                              <Scope release={release} instant={instant} />
                            </div>
                          )}
                          <ol className="cl-changes">
                            {release.changes.map((change, index) => {
                              const key = `${release.major}.${index}`;
                              return (
                                <ChangeRow
                                  key={key}
                                  release={release}
                                  change={change}
                                  index={index}
                                  open={plates.has(key)}
                                  instant={instant}
                                  layout={layout}
                                  onToggle={() => togglePlate(key)}
                                  onJump={(target) => select(target, "click")}
                                />
                              );
                            })}
                          </ol>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.section>
                );
              })}
              <motion.footer layout="position" transition={{ layout }} className="cl-colophon">
                <h2>Colophon</h2>
                <p>
                  Set in Newsreader. The Vianova care and design-system screens are
                  real product screens with invented data. Every other screen comes
                  from a public page or a store listing.
                </p>
                <p className="cl-colophon-links">
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
              </motion.footer>
            </LayoutGroup>
          </main>

          {wide && <Margin release={selected} instant={instant} />}
        </div>
      </div>
    </MotionConfig>
  );
}
