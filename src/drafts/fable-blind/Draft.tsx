import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { projects, type Project } from "../../content/projects";
import {
  aiLine,
  capabilities,
  chapters,
  contact,
  docChat,
  hero,
  howItIsBuilt,
  monitorReel,
  personal,
  personalMore,
  phoneReel,
  skills,
  type Chapter,
  type Exhibits,
  type LinkPill,
  type Shot,
} from "./content";
import "./draft.css";

/* ---------- Lightbox ---------- */

const LightboxContext = createContext<(shot: Shot) => void>(() => {});

function Lightbox({
  shot,
  onClose,
}: {
  shot: Shot | null;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (shot && !dialog.open) dialog.showModal();
    if (!shot && dialog.open) dialog.close();
  }, [shot]);
  return (
    <dialog
      ref={ref}
      className="fb-lightbox"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {shot && (
        <figure>
          <img
            src={shot.src}
            alt={shot.alt}
            width={shot.width}
            height={shot.height}
          />
          <figcaption>{shot.alt}</figcaption>
          <button
            type="button"
            className="fb-lightbox-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </figure>
      )}
    </dialog>
  );
}

/* ---------- Devices ---------- */

function Monitor({
  children,
  ratio,
  stand,
}: {
  children: ReactNode;
  ratio?: string;
  stand?: boolean;
}) {
  return (
    <figure
      className="fb-monitor"
      style={ratio ? ({ "--ratio": ratio } as CSSProperties) : undefined}
    >
      <div className="fb-monitor-bar" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="fb-monitor-screen">{children}</div>
      {stand && <span className="fb-monitor-stand" aria-hidden="true" />}
    </figure>
  );
}

function PhoneFrame({
  children,
  plain,
}: {
  children: ReactNode;
  plain?: boolean;
}) {
  return (
    <figure className={plain ? "fb-phone is-plain" : "fb-phone"}>
      <div className="fb-phone-screen">{children}</div>
    </figure>
  );
}

function ExternalIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M3 9 9 3M4 3h5v5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Pills({ links }: { links: LinkPill[] }) {
  if (links.length === 0) return null;
  return (
    <span className="fb-pills">
      {links.map((link) => (
        <a
          key={link.href}
          className="fb-pill"
          href={link.href}
          target="_blank"
          rel="noreferrer noopener"
        >
          {link.label}
          <ExternalIcon />
        </a>
      ))}
    </span>
  );
}

/* ---------- Hero ---------- */

function useReel(length: number, interval: number) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (reduced || length < 2) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible")
        setIndex((value) => (value + 1) % length);
    }, interval);
    return () => window.clearInterval(id);
  }, [reduced, length, interval]);
  return index;
}

function Reel({ shots, index }: { shots: Shot[]; index: number }) {
  return (
    <div className="fb-reel">
      {shots.map((shot, i) => (
        <img
          key={shot.src}
          src={shot.src}
          alt={shot.alt}
          width={shot.width}
          height={shot.height}
          className={i === index ? "is-on" : undefined}
          loading={i === 0 ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={i === 0 ? "high" : "low"}
        />
      ))}
    </div>
  );
}

function Stage() {
  const reduced = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 16, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 50, damping: 16, mass: 0.6 });
  const rotateY = useTransform(sx, [-1, 1], [-6, 6]);
  const rotateX = useTransform(sy, [-1, 1], [3, -3]);
  const monitorIndex = useReel(monitorReel.length, 5200);
  const phoneIndex = useReel(phoneReel.length, 6700);

  return (
    <div className="fb-stage-wrap">
      <div
        className="fb-stage"
        onPointerMove={(event) => {
          if (reduced || event.pointerType !== "mouse") return;
          const rect = event.currentTarget.getBoundingClientRect();
          mx.set(((event.clientX - rect.left) / rect.width - 0.5) * 2);
          my.set(((event.clientY - rect.top) / rect.height - 0.5) * 2);
        }}
        onPointerLeave={() => {
          mx.set(0);
          my.set(0);
        }}
      >
        <div className="fb-stage-sky" aria-hidden="true" />
        <div className="fb-stage-ground" aria-hidden="true" />
        <motion.div className="fb-scene" style={{ rotateY, rotateX }}>
          <div className="fb-obj fb-obj-monitor">
            <Monitor stand>
              <Reel shots={monitorReel} index={monitorIndex} />
            </Monitor>
            <i className="fb-cast" aria-hidden="true" />
            <p className="fb-obj-caption fb-mono" aria-live="off">
              {monitorReel[monitorIndex].caption}
            </p>
          </div>
          <div className="fb-obj fb-obj-phone">
            <PhoneFrame>
              <Reel shots={phoneReel} index={phoneIndex} />
            </PhoneFrame>
            <i className="fb-cast" aria-hidden="true" />
            <p className="fb-obj-caption fb-mono" aria-live="off">
              {phoneReel[phoneIndex].caption}
            </p>
          </div>
        </motion.div>
      </div>
      <p className="fb-stage-note fb-mono">
        Public pages, store listings, product screens with invented data
      </p>
    </div>
  );
}

function Hero() {
  return (
    <section className="fb-wrap fb-hero" aria-labelledby="fb-h1">
      <div className="fb-hero-copy">
        <p className="fb-hero-eyebrow">
          <strong>{hero.name}</strong>
          <span className="fb-mono">{hero.roleLine}</span>
        </p>
        <h1 id="fb-h1" className="fb-h1">
          Web and mobile products, from the <em>first screen</em> to release.
        </h1>
        <p className="fb-hero-sub">
          <b>{hero.fields}</b> {hero.secondary}
        </p>
        <p className="fb-hero-ctas">
          <a className="fb-cta is-ember" href="#healthcare">
            See the work
          </a>
          <a className="fb-cta is-ghost" href={hero.cv} download>
            Download CV
          </a>
        </p>
      </div>
      <Stage />
    </section>
  );
}

/* ---------- Capabilities ---------- */

function Capabilities() {
  return (
    <section className="fb-wrap fb-caps" aria-labelledby="fb-caps-h">
      <div className="fb-caps-head">
        <p className="fb-mono">What Gentrit does</p>
        <h2 id="fb-caps-h">Seven kinds of work</h2>
      </div>
      <ol>
        {capabilities.map(([name, line], i) => (
          <li key={name}>
            <span className="fb-mono">{String(i + 1).padStart(2, "0")}</span>
            <span>
              <b>{name}</b>
              {line}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ---------- Chapters ---------- */

function ExhibitRow({ exhibits }: { exhibits: Exhibits }) {
  const open = useContext(LightboxContext);
  return (
    <div className="fb-exhibits">
      <div className="fb-exhibits-head">
        <h3>{exhibits.title}</h3>
        {exhibits.note && <span className="fb-note">{exhibits.note}</span>}
        <Pills links={exhibits.links} />
      </div>
      <ul
        className="fb-row"
        data-aspect={exhibits.aspect}
        data-count={exhibits.items.length}
      >
        {exhibits.items.map((shot) => (
          <li key={shot.src}>
            <button
              type="button"
              className="fb-shot"
              onClick={() => open(shot)}
              aria-label={`Open large: ${shot.caption}`}
            >
              {exhibits.aspect === "phone" ? (
                <PhoneFrame plain>
                  <img
                    src={shot.src}
                    alt={shot.alt}
                    width={shot.width}
                    height={shot.height}
                    loading="lazy"
                    decoding="async"
                  />
                </PhoneFrame>
              ) : (
                <Monitor ratio={`${shot.width} / ${shot.height}`}>
                  <img
                    src={shot.src}
                    alt={shot.alt}
                    width={shot.width}
                    height={shot.height}
                    loading="lazy"
                    decoding="async"
                  />
                </Monitor>
              )}
            </button>
            <span className="fb-cap">{shot.caption}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HowItIsBuilt() {
  return (
    <div className="fb-how">
      <div className="fb-how-head">
        <p className="fb-mono">How it is built</p>
        <h3>Rebuilding a live care platform, one tested screen at a time</h3>
        <p>{howItIsBuilt.text}</p>
      </div>
      <div className="fb-flow-wrap">
        <ol className="fb-flow">
          {howItIsBuilt.steps.map((step) => (
            <li key={step} data-gate={step === "Checks" ? "" : undefined}>
              {step}
            </li>
          ))}
        </ol>
        <p className="fb-flow-back">
          <span className="fb-mono">↩</span>
          {howItIsBuilt.back}
        </p>
      </div>
      <p className="fb-proof">“{howItIsBuilt.proof}”</p>
    </div>
  );
}

function DocChat() {
  const reduced = useReducedMotion();
  const [seen, setSeen] = useState(false);
  const [run, setRun] = useState(0);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [phase, setPhase] = useState<"idle" | "question" | "answer" | "done">(
    "idle",
  );
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setSeen(true);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);

  useEffect(() => {
    if (!seen) return;
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) =>
      timers.push(window.setTimeout(fn, ms));
    if (reduced) {
      at(0, () => {
        setQuestion(docChat.question);
        setAnswer(docChat.answer);
        setPhase("done");
      });
      return () => timers.forEach((id) => window.clearTimeout(id));
    }
    at(0, () => {
      setQuestion("");
      setAnswer("");
      setPhase("question");
    });
    const letters = [...docChat.question];
    letters.forEach((_, i) =>
      at(400 + i * 34, () => setQuestion(docChat.question.slice(0, i + 1))),
    );
    const questionEnd = 400 + letters.length * 34 + 600;
    at(questionEnd, () => setPhase("answer"));
    const words = docChat.answer.split(" ");
    words.forEach((_, i) =>
      at(questionEnd + 500 + i * 85, () =>
        setAnswer(words.slice(0, i + 1).join(" ")),
      ),
    );
    at(questionEnd + 500 + words.length * 85 + 120, () => setPhase("done"));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [seen, run, reduced]);

  return (
    <div
      className="fb-docchat"
      ref={rootRef}
      aria-label="Document chat, recreation with invented data"
    >
      <div className="fb-docchat-page" aria-hidden="true">
        <span className="fb-mono">Page 3 · Service availability</span>
        {[92, 78, 88, 70, 95, 60].map((width, i) => (
          <span
            key={i}
            className={`fb-docchat-line${i === 3 && phase !== "idle" && phase !== "question" ? " is-hl" : ""}`}
            style={{ width: `${width}%` }}
          />
        ))}
      </div>
      <div className="fb-docchat-chat">
        <span className="fb-mono">Recreation · invented data</span>
        <p className="fb-bubble is-q" aria-live="polite">
          {question}
          {phase === "question" && <span className="fb-cursor" />}
        </p>
        {phase !== "idle" && phase !== "question" && (
          <p className="fb-bubble is-a" aria-live="polite">
            {answer}
            {phase === "answer" && <span className="fb-cursor" />}
          </p>
        )}
        <div className="fb-docchat-foot">
          <button
            type="button"
            className="fb-pill"
            onClick={() => setRun((n) => n + 1)}
            disabled={!seen || (phase !== "done" && !reduced)}
          >
            Replay
          </button>
          <span className="fb-note fb-mono">PDF → chat, cites the page</span>
        </div>
      </div>
    </div>
  );
}

function ChapterView({ chapter }: { chapter: Chapter }) {
  const style = { "--sw": `var(--sw-${chapter.id})` } as CSSProperties;
  return (
    <section
      id={chapter.id}
      className="fb-wrap fb-chapter"
      style={style}
      aria-labelledby={`fb-${chapter.id}-h`}
    >
      <header className="fb-chapter-head">
        <p className="fb-eyebrow fb-mono">
          <span className="fb-num">{chapter.n}</span>
          {chapter.eyebrow}
        </p>
        <h2 id={`fb-${chapter.id}-h`} className="fb-h2">
          {chapter.title}
        </h2>
        <p className="fb-role">
          <span>
            <b>Role</b> {chapter.role}
          </span>
          <span>
            <b>{chapter.whenLabel ?? "When"}</b> {chapter.years}
          </span>
        </p>
      </header>
      <div className="fb-chapter-body">
        <div className="fb-story">
          <p>{chapter.story[0]}</p>
          <p>{chapter.story[1]}</p>
          {chapter.resultLine && (
            <p className="fb-result">{chapter.resultLine}</p>
          )}
          {chapter.id === "design-system" && (
            <p className="fb-result">{aiLine}</p>
          )}
        </div>
        <aside className="fb-facts">
          <h3 className="fb-mono">In short</h3>
          <ul>
            {chapter.facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </aside>
      </div>
      {chapter.id === "healthcare" && <HowItIsBuilt />}
      {chapter.id === "ai" && <DocChat />}
      {chapter.exhibits.map((exhibits) => (
        <ExhibitRow key={exhibits.title} exhibits={exhibits} />
      ))}
      {chapter.readouts && (
        <div className="fb-readouts">
          {chapter.readouts.map((readout) => (
            <div key={readout.label} className="fb-readout">
              <span className="fb-readout-value">
                <span>{readout.value}</span>
                {readout.to && (
                  <>
                    <span className="fb-arrow" aria-label="to">
                      →
                    </span>
                    <span className="fb-to">{readout.to}</span>
                  </>
                )}
              </span>
              <span className="fb-readout-label">{readout.label}</span>
            </div>
          ))}
        </div>
      )}
      <p className="fb-stack">
        <b>Stack</b>
        {chapter.stack}
      </p>
    </section>
  );
}

/* ---------- Personal ---------- */

function Personal() {
  const open = useContext(LightboxContext);
  const style = { "--sw": "var(--sw-personal)" } as CSSProperties;
  return (
    <section
      id="personal"
      className="fb-wrap fb-chapter"
      style={style}
      aria-labelledby="fb-personal-h"
    >
      <header className="fb-chapter-head">
        <p className="fb-eyebrow fb-mono">
          <span className="fb-num">07</span>
          Personal · Sites · Games
        </p>
        <h2 id="fb-personal-h" className="fb-h2">
          Personal projects, built end to end
        </h2>
        <p className="fb-role">
          <span>
            <b>Role</b> Owner
          </span>
          <span>
            <b>When</b> 2022 – 2026
          </span>
        </p>
      </header>
      <ul className="fb-tiles">
        {personal.map((tile) => (
          <li key={tile.name} className="fb-tile">
            <button
              type="button"
              className="fb-shot"
              onClick={() => open(tile.shot)}
              aria-label={`Open large: ${tile.name}`}
            >
              <Monitor>
                <img
                  src={tile.shot.src}
                  alt={tile.shot.alt}
                  width={tile.shot.width}
                  height={tile.shot.height}
                  loading="lazy"
                  decoding="async"
                />
              </Monitor>
            </button>
            <div className="fb-tile-meta">
              <h3>
                {tile.name}
                <Pills links={tile.links} />
              </h3>
              <p>{tile.line}</p>
            </div>
          </li>
        ))}
      </ul>
      <ul className="fb-more">
        {personalMore.map((item) => (
          <li key={item.name}>
            <b>{item.name}</b>
            <span>{item.line}</span>
            {item.link && <Pills links={[item.link]} />}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------- Index ---------- */

const chapterOf: Record<string, string> = {
  "care-platform": "healthcare",
  "care-api": "healthcare",
  "design-system-react": "design-system",
  "bayyinah-tv": "streaming",
  "bayyinah-institute": "streaming",
  "read-to-feed": "reading",
  "viva-fresh": "reading",
  "dukagjini-bookstore": "reading",
  "chatbot-runtime": "reading",
  incentiv: "web3",
  "ai-dashboard": "ai",
  offbeat: "personal",
  form: "personal",
  "snaxx-tech": "personal",
  offday: "personal",
  fjale: "personal",
  za: "personal",
  "morse-trainer": "personal",
  "geo-guesser": "personal",
  futurisma: "personal",
  "secret-dictator": "personal",
  "open-source-forks": "personal",
};

const groups: Project["group"][] = [
  "Vianova",
  "Agency work",
  "Incentiv",
  "AvahiTech",
  "Personal",
];

function Row({ project }: { project: Project }) {
  const chapter = chapterOf[project.slug];
  const style = chapter
    ? ({ "--sw": `var(--sw-${chapter})` } as CSSProperties)
    : undefined;
  const body = (
    <>
      <span className="fb-name">
        <i aria-hidden="true" />
        {project.name}
        {chapter && <small>Case ↑</small>}
      </span>
      <span className="fb-years">{project.years ?? "—"}</span>
      <span className="fb-rrole">{project.role}</span>
      <span className="fb-rstack">{project.stack.join(", ")}</span>
      <span className="fb-line">{project.line}</span>
      <span className="fb-meta">
        <b>{project.years ?? "—"}</b>
        {project.role} · {project.stack.join(", ")}
      </span>
    </>
  );
  return chapter ? (
    <a className="fb-rowline" href={`#${chapter}`} style={style}>
      {body}
    </a>
  ) : (
    <div className="fb-rowline" style={style}>
      {body}
    </div>
  );
}

function ProjectIndex() {
  return (
    <section
      id="projects"
      className="fb-wrap fb-index"
      aria-labelledby="fb-index-h"
    >
      <div className="fb-index-head">
        <p className="fb-mono">Index</p>
        <h2 id="fb-index-h" className="fb-h2">
          All projects
        </h2>
        <p className="fb-lede">
          Every product so far, in one list. Rows marked “Case” open the chapter
          above.
        </p>
      </div>
      {groups.map((group) => {
        const rows = projects.filter((project) => project.group === group);
        return (
          <div key={group} className="fb-group">
            <h3>
              {group}
              <span className="fb-mono">
                {rows.length} {rows.length === 1 ? "project" : "projects"}
              </span>
            </h3>
            <div className="fb-rows-head fb-mono" aria-hidden="true">
              <span>Project</span>
              <span>Years</span>
              <span>Role</span>
              <span>Stack</span>
              <span>One line</span>
            </div>
            <ul className="fb-rows">
              {rows.map((project) => (
                <li key={project.slug}>
                  <Row project={project} />
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}

/* ---------- Closing ---------- */

function Closing() {
  return (
    <section className="fb-wrap fb-closing" aria-label="Skills and education">
      <div>
        <h2>Skills</h2>
        <dl className="fb-skills">
          {skills.map(([area, list]) => (
            <div key={area}>
              <dt>{area}</dt>
              <dd>{list}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div>
        <h2>Education</h2>
        <p className="fb-edu">
          <b>{contact.education}</b>
        </p>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <footer id="contact" className="fb-contact">
      <div className="fb-wrap fb-contact-in">
        <div>
          <p className="fb-mono">Contact</p>
          <h2>
            Remote from Kosovo, <em>ready for the next screen.</em>
          </h2>
        </div>
        <div className="fb-contact-links">
          <a href={`mailto:${contact.email}`}>
            <span>{contact.email}</span>
            <span className="fb-mono">Email</span>
          </a>
          <a href={contact.github} target="_blank" rel="noreferrer noopener">
            <span>github.com/gentritr1</span>
            <span className="fb-mono">GitHub</span>
          </a>
          <a href={contact.linkedin} target="_blank" rel="noreferrer noopener">
            <span>linkedin.com/in/gentrit-rashiti</span>
            <span className="fb-mono">LinkedIn</span>
          </a>
          <a href={hero.cv} download>
            <span>Gentrit-Rashiti-CV.pdf</span>
            <span className="fb-mono">Download CV</span>
          </a>
        </div>
        <div className="fb-foot">
          <p>
            Built with React, Tailwind and motion. Screenshots come from public
            pages and store listings. The care-platform and design-system
            screens are real product screens with invented data; the document
            chat is a recreation.
          </p>
          <p>© 2026 Gentrit Rashiti</p>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Top bar ---------- */

function TopBar({
  phoneMode,
  onPhone,
}: {
  phoneMode: boolean;
  onPhone: () => void;
}) {
  return (
    <header className="fb-top">
      <div className="fb-wrap fb-top-in">
        <a className="fb-brand" href="#fb-h1">
          Gentrit Rashiti
          <small>Web · Mobile · Full stack</small>
        </a>
        <nav className="fb-nav" aria-label="Sections">
          <a href="#healthcare">Work</a>
          <a href="#personal">Personal</a>
          <a href="#projects">All projects</a>
          <a href="#contact">Contact</a>
        </nav>
        {!phoneMode && (
          <button
            type="button"
            className="fb-phone-toggle"
            onClick={onPhone}
            aria-pressed={phoneMode}
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect
                x="4"
                y="1.5"
                width="8"
                height="13"
                rx="1.8"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <path
                d="M7 12.5h2"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
            See it on a phone
          </button>
        )}
        <a className="fb-cta" href={hero.cv} download>
          Download CV
        </a>
      </div>
    </header>
  );
}

/* ---------- Draft ---------- */

export default function Draft() {
  const [phoneMode, setPhoneMode] = useState(false);
  const [shot, setShot] = useState<Shot | null>(null);
  const open = useCallback((next: Shot) => setShot(next), []);
  const close = useCallback(() => setShot(null), []);

  return (
    <LightboxContext.Provider value={open}>
      <title>Gentrit Rashiti — web, mobile and full-stack developer</title>
      <div className="fb" data-phone={phoneMode ? "true" : undefined}>
        {phoneMode && (
          <div className="fb-dock">
            <button
              type="button"
              className="fb-cta"
              onClick={() => setPhoneMode(false)}
            >
              ← Back to the desktop
            </button>
            <p>
              The same page at 390 px. The layout reflows inside the frame with
              container queries; nothing is rebuilt for the phone.
            </p>
          </div>
        )}
        <div className="fb-frame">
          <div className="fb-page">
            <a className="fb-skip" href="#healthcare">
              Skip to the work
            </a>
            <TopBar phoneMode={phoneMode} onPhone={() => setPhoneMode(true)} />
            <main>
              <Hero />
              <Capabilities />
              {chapters.map((chapter) => (
                <ChapterView key={chapter.id} chapter={chapter} />
              ))}
              <Personal />
              <ProjectIndex />
              <Closing />
            </main>
            <Contact />
          </div>
        </div>
        <Lightbox shot={shot} onClose={close} />
      </div>
    </LightboxContext.Provider>
  );
}
