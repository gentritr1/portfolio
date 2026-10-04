import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import type { Project } from "../../content/projects";
import type { ChannelKey } from "../../content/channels";
import { links } from "../../content/links";
import { wallAssets } from "../../components/portfolio/wallAssets";
import { CareFile } from "./CareFile";
import { deck, nextHand, projectBySlug, projectFact, suits } from "./data";
import { createCardTable, type CardTable } from "./physics";
import { dur, ease, spring } from "./motion";
import "./deal.css";

function Suit({
  channel,
  className,
}: {
  channel: ChannelKey;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      aria-hidden="true"
      fill="currentColor"
    >
      {channel === "healthcare" && (
        <path d="M25 4h14v21h21v14H39v21H25V39H4V25h21Z" />
      )}
      {channel === "streaming" && <path d="m32 3 27 29-27 29L5 32Z" />}
      {channel === "reading" && (
        <path d="M32 58 8 33C-10 11 20-5 32 15 44-5 74 11 56 33Z" />
      )}
      {channel === "web3" && (
        <path d="m32 3 8 20 21 1-16 14 5 22-18-12-18 12 5-22L3 24l21-1Z" />
      )}
      {channel === "ai" && (
        <path d="M32 3c15 0 19 14 11 24 21-5 25 23 7 26-8 2-14-3-18-10-4 7-10 12-18 10-18-3-14-31 7-26C13 17 17 3 32 3Zm-6 40h12l4 18H22Z" />
      )}
      {channel === "personal" && (
        <path d="M32 3 8 28c-17 17 7 37 22 15l-6 18h16l-6-18c15 22 39 2 22-15Z" />
      )}
    </svg>
  );
}

function Arrow({ back = false }: { back?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
      style={back ? { rotate: "180deg" } : undefined}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M4 12h16m-7-7 7 7-7 7" />
    </svg>
  );
}

interface PlayingCardProps {
  project: Project;
  index: number;
  selected: boolean;
  flipped: boolean;
  caseOpen: boolean;
  reduced: boolean;
  select: () => void;
  flip: () => void;
  node: (node: HTMLDivElement | null) => void;
  faceNode: (node: HTMLButtonElement | null) => void;
  start: (event: PointerEvent<HTMLButtonElement>) => void;
  move: (event: PointerEvent<HTMLButtonElement>) => void;
  end: (event: PointerEvent<HTMLButtonElement>, cancel?: boolean) => void;
  keyboard: (event: KeyboardEvent<HTMLButtonElement>, handle: boolean) => void;
}

function PlayingCard({
  project,
  index,
  selected,
  flipped,
  caseOpen,
  reduced,
  select,
  flip,
  node,
  faceNode,
  start,
  move,
  end,
  keyboard: onKey,
}: PlayingCardProps) {
  const suit = suits[project.channel];
  const fact = projectFact(project);
  return (
    <div
      ref={node}
      className="dl-body"
      data-selected={selected}
      data-project={project.slug}
      style={
        {
          "--dl-suit": suit.ink,
          zIndex: selected ? 50 : index + 1,
        } as CSSProperties
      }
    >
      <motion.div
        className="dl-card-arrival"
        initial={
          reduced ? false : { opacity: 0, scale: 0.86, filter: "blur(4px)" }
        }
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={
          reduced
            ? { duration: 0.01 }
            : {
                duration: 0.45,
                delay: Math.min(index, 8) * 0.06,
                ease: ease.pop,
              }
        }
      >
        <motion.button
          ref={faceNode}
          type="button"
          className="dl-card"
          aria-label={`${project.name}, ${project.years ?? "independent work"}. ${flipped ? "Facts showing" : "Project face"}. Enter opens project; F flips; arrows choose a card.`}
          aria-pressed={selected}
          tabIndex={selected ? 0 : -1}
          onClick={select}
          onDoubleClick={flip}
          onFocus={select}
          onKeyDown={(event) => onKey(event, false)}
          whileHover={reduced ? undefined : { y: -5 }}
          whileFocus={reduced ? undefined : { y: -5 }}
          whileTap={reduced ? undefined : { scale: 0.98 }}
          transition={reduced ? { duration: 0.01 } : spring.ui}
        >
          <motion.span
            className="dl-card-turn"
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={reduced ? { duration: 0.01 } : spring.ui}
          >
            <span className="dl-card-front" aria-hidden={flipped}>
              <span className="dl-corner">
                <b>{suit.number}</b>
                <Suit channel={project.channel} />
              </span>
              <span className="dl-suit-name">{suit.name}</span>
              <Suit channel={project.channel} className="dl-centre-suit" />
              <motion.span
                className="dl-card-title"
                data-long={project.name.length > 23}
                layoutId={caseOpen ? undefined : `dl-title-${project.slug}`}
                transition={reduced ? { duration: 0.01 } : spring.ui}
              >
                {project.name}
              </motion.span>
              <span className="dl-card-fact">{fact.value}</span>
              <span className="dl-card-year">
                {project.years ?? "Independent work"}
              </span>
              <span className="dl-corner dl-corner-end">
                <b>{suit.number}</b>
                <Suit channel={project.channel} />
              </span>
            </span>
            <span className="dl-card-back" aria-hidden={!flipped}>
              <span className="dl-back-heading">
                <Suit channel={project.channel} />
                <b>{project.name}</b>
              </span>
              <strong>{fact.value}</strong>
              <span>{fact.label}</span>
              <p>{project.line}</p>
              <span className="dl-back-stack">
                {project.stack.slice(0, 3).join(" / ")}
              </span>
              <small>Enter opens the complete project.</small>
            </span>
          </motion.span>
        </motion.button>
        <button
          className="dl-drag-handle"
          type="button"
          aria-label={`Drag ${project.name}; arrow keys move it`}
          tabIndex={selected ? 0 : -1}
          onFocus={select}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={(event) => end(event)}
          onPointerCancel={(event) => end(event, true)}
          onLostPointerCapture={(event) => end(event, true)}
          onKeyDown={(event) => onKey(event, true)}
        >
          <span aria-hidden="true">⋮⋮</span> Drag to move
        </button>
      </motion.div>
    </div>
  );
}

export default function Draft() {
  const [hand, setHand] = useState(() => nextHand(0));
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState("za");
  const [flipped, setFlipped] = useState(new Set<string>());
  const [caseSlug, setCaseSlug] = useState<string | null>(null);
  const [size, setSize] = useState({ width: 1200, narrow: false });
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [cvDone, setCvDone] = useState(false);
  const [dealNumber, setDealNumber] = useState(1);
  const [message, setMessage] = useState(
    "Five projects dealt. Za! is selected. Flip it for facts or open the project.",
  );
  const [help, setHelp] = useState(false);
  const scroll = useRef<HTMLDivElement>(null);
  const table = useRef<HTMLDivElement>(null);
  const cardNodes = useRef(new Map<string, HTMLElement>());
  const faceNodes = useRef(new Map<string, HTMLButtonElement>());
  const engine = useRef<CardTable | null>(null);
  const offset = useRef(0);
  const caseHeading = useRef<HTMLHeadingElement>(null);
  const casePanel = useRef<HTMLElement>(null);
  const returnRef = useRef<(id: string) => void>(() => undefined);
  const currentHand = useRef(hand);
  const currentSelected = useRef(selected);
  const drag = useRef<{
    id: string;
    pointer: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    lastX: number;
    lastY: number;
    lastAt: number;
    velocityX: number;
    velocityY: number;
  } | null>(null);
  const cardWidth = size.narrow ? 174 : 202;
  const cardHeight = size.narrow ? 260 : 286;
  const height = size.narrow ? 374 : 454;
  const tableWidth = showAll ? hand.length * (cardWidth + 28) + 80 : size.width;
  const selectedProject = projectBySlug.get(selected) ?? deck[0];
  const activeCase = caseSlug ? projectBySlug.get(caseSlug)! : null;

  useEffect(() => {
    const element = scroll.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      setSize({ width, narrow: width < 700 });
    });
    observer.observe(element);
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(preference.matches);
    preference.addEventListener("change", change);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", change);
    };
  }, []);

  useLayoutEffect(() => {
    currentHand.current = hand;
    currentSelected.current = selected;
    returnRef.current = (id) => {
      const remaining = currentHand.current.filter((value) => value !== id);
      setHand(remaining);
      if (currentSelected.current === id) setSelected(remaining[0] ?? "za");
      setMessage(
        `${projectBySlug.get(id)!.name} returned to the deck. ${remaining.length} cards remain on the table.`,
      );
    };
  }, [hand, selected]);

  useLayoutEffect(() => {
    if (!table.current) return;
    engine.current = createCardTable({
      element: table.current,
      nodes: cardNodes.current,
      width: tableWidth,
      height,
      cardWidth,
      cardHeight,
      reduced,
      onReturn: (id) => returnRef.current(id),
    });
    return () => {
      engine.current?.dispose();
      engine.current = null;
    };
  }, [tableWidth, height, cardWidth, cardHeight, reduced]);

  useLayoutEffect(() => {
    const centre = tableWidth / 2;
    const span = size.narrow
      ? Math.max(
          34,
          (tableWidth - cardWidth - 40) / Math.max(1, hand.length - 1),
        )
      : Math.min(
          cardWidth * 0.99,
          (tableWidth - cardWidth - 240) / Math.max(1, hand.length - 1),
        );
    const positions = hand.map((id, index) => {
      const t = hand.length === 1 ? 0 : (index / (hand.length - 1)) * 2 - 1;
      if (showAll)
        return {
          id,
          x: 40 + cardWidth / 2 + index * (cardWidth + 28),
          y: height / 2 + 30 * t * t,
          angle: t * 5,
        };
      return {
        id,
        x: centre + (index - (hand.length - 1) / 2) * span,
        y: height / 2 + 16 + Math.abs(t) * (size.narrow ? 21 : 39),
        angle: t * (size.narrow ? 14 : 11),
      };
    });
    engine.current?.layout(positions, true);
  }, [
    hand,
    showAll,
    tableWidth,
    height,
    cardWidth,
    cardHeight,
    reduced,
    size.narrow,
  ]);

  function choose(id: string, focus = false) {
    setSelected(id);
    if (focus) {
      faceNodes.current.get(id)?.focus({ preventScroll: true });
      if (showAll)
        cardNodes.current.get(id)?.scrollIntoView({
          block: "nearest",
          inline: "center",
          behavior: reduced ? "instant" : "smooth",
        });
    }
  }

  function flip(id: string) {
    setFlipped((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    const fact = projectFact(projectBySlug.get(id)!);
    setMessage(`${projectBySlug.get(id)!.name}. ${fact.value}, ${fact.label}.`);
  }

  function openProject(id: string) {
    if (!hand.includes(id)) setHand((current) => [...current.slice(0, 4), id]);
    setCaseSlug(id);
    setSelected(id);
  }

  useLayoutEffect(() => {
    if (!caseSlug) return;
    const frame = requestAnimationFrame(() => {
      caseHeading.current?.focus({ preventScroll: true });
      // The shared title still occupies the card while its layout morph begins.
      // Scroll the stable case panel so reading starts at the case itself.
      casePanel.current?.scrollIntoView({
        block: "start",
        behavior: reduced ? "instant" : "smooth",
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [caseSlug, reduced]);

  function closeCase() {
    setCaseSlug(null);
    requestAnimationFrame(() => {
      faceNodes.current.get(selected)?.focus({ preventScroll: true });
      scroll.current?.scrollIntoView({
        block: "center",
        behavior: reduced ? "instant" : "smooth",
      });
    });
  }

  function dealAgain() {
    offset.current = (offset.current + 5) % deck.length;
    const next = nextHand(offset.current);
    setShowAll(false);
    setHand(next);
    setSelected(next[2]);
    setFlipped(new Set());
    setDealNumber((value) => value + 1);
    setMessage(
      `A new hand of five projects. ${projectBySlug.get(next[2])!.name} is selected.`,
    );
    if (scroll.current) scroll.current.scrollLeft = 0;
  }

  function spread() {
    if (showAll) {
      setShowAll(false);
      setHand(nextHand(offset.current));
      setSelected(nextHand(offset.current)[2]);
      setMessage("Back to a hand of five.");
    } else {
      setShowAll(true);
      setHand(deck.map((project) => project.slug));
      setMessage(
        "All 28 project cards are spread in an arc. Scroll sideways or use the arrow keys to choose.",
      );
    }
    if (scroll.current) scroll.current.scrollLeft = 0;
  }

  function startDrag(id: string, event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return;
    const body = engine.current?.grab(id);
    if (!body) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    choose(id);
    drag.current = {
      id,
      pointer: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: body.x,
      originY: body.y,
      lastX: event.clientX,
      lastY: event.clientY,
      lastAt: event.timeStamp,
      velocityX: 0,
      velocityY: 0,
    };
  }

  function moveDrag(event: PointerEvent<HTMLButtonElement>) {
    const current = drag.current;
    if (!current || current.pointer !== event.pointerId) return;
    const now = event.timeStamp;
    const elapsed = Math.max(1, now - current.lastAt) / 1000;
    current.velocityX =
      current.velocityX * 0.25 +
      ((event.clientX - current.lastX) / elapsed) * 0.75;
    current.velocityY =
      current.velocityY * 0.25 +
      ((event.clientY - current.lastY) / elapsed) * 0.75;
    current.lastX = event.clientX;
    current.lastY = event.clientY;
    current.lastAt = now;
    engine.current?.move(
      current.id,
      current.originX + event.clientX - current.startX,
      current.originY + event.clientY - current.startY,
      event.clientX - current.startX,
    );
  }

  function endDrag(event: PointerEvent<HTMLButtonElement>, cancel = false) {
    const current = drag.current;
    if (!current || current.pointer !== event.pointerId) return;
    drag.current = null;
    const stale = event.timeStamp - current.lastAt > 100;
    const thrown = engine.current?.release(
      current.id,
      cancel || stale ? 0 : Math.max(-4500, Math.min(4500, current.velocityX)),
      cancel || stale ? 0 : Math.max(-4500, Math.min(4500, current.velocityY)),
    );
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    setMessage(
      thrown
        ? `${projectBySlug.get(current.id)!.name} is returning to the deck.`
        : `${projectBySlug.get(current.id)!.name} placed on the table.`,
    );
  }

  function cardKey(
    id: string,
    event: KeyboardEvent<HTMLButtonElement>,
    handle: boolean,
  ) {
    if (
      ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)
    ) {
      event.preventDefault();
      if (
        handle ||
        event.shiftKey ||
        ["ArrowUp", "ArrowDown"].includes(event.key)
      ) {
        engine.current?.nudge(
          id,
          event.key === "ArrowLeft" ? -24 : event.key === "ArrowRight" ? 24 : 0,
          event.key === "ArrowUp" ? -24 : event.key === "ArrowDown" ? 24 : 0,
        );
        setMessage(`${projectBySlug.get(id)!.name} moved.`);
      } else {
        const next =
          (hand.indexOf(id) +
            (event.key === "ArrowRight" ? 1 : -1) +
            hand.length) %
          hand.length;
        choose(hand[next], true);
      }
    } else if (event.key.toLowerCase() === "f" || event.key === " ") {
      event.preventDefault();
      flip(id);
    } else if (event.key === "Enter") {
      event.preventDefault();
      openProject(id);
    }
  }

  return (
    <LayoutGroup id="deal">
      <title>Deal — Gentrit Rashiti</title>
      <main
        className="draft-deal"
        lang="en"
        style={
          {
            "--dl-card-width": `${cardWidth}px`,
            "--dl-card-height": `${cardHeight}px`,
          } as CSSProperties
        }
      >
        <header className="dl-header">
          <a href="/drafts">
            <Arrow back />
            All art directions
          </a>
          <p>
            DEAL <span>28 projects / six suits</span>
          </p>
          <button
            onClick={() => setHelp((value) => !value)}
            aria-expanded={help}
          >
            How to play <span aria-hidden="true">?</span>
          </button>
        </header>
        <div className="dl-intro">
          <h1>Your move.</h1>
          <p>
            Pick a project.
            <br />
            Flip the card. Read the work.
          </p>
          <div className="dl-deal-actions">
            <motion.button
              whileTap={reduced ? undefined : { scale: 0.96, rotateX: -8 }}
              transition={spring.ui}
              onClick={dealAgain}
            >
              Deal again <Arrow />
            </motion.button>
            <button onClick={spread} aria-pressed={showAll}>
              {showAll ? "Back to five" : "Show all 28"}{" "}
              <span aria-hidden="true">↗</span>
            </button>
          </div>
        </div>
        <AnimatePresence>
          {help && (
            <motion.aside
              className="dl-help"
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
              transition={{ duration: reduced ? 0.01 : dur.ui, ease: ease.out }}
            >
              <p>
                <strong>On the table:</strong> select a card, then flip or open
                it. Double-click also flips. Use the handle to drag; a throw
                beyond the edge returns the card to the deck.
              </p>
              <p>
                <strong>With keys:</strong> ← → choose; Shift + arrows move; F
                or Space flips; Enter opens. Drag handles also move with arrows.
                Scroll normally everywhere outside a handle.
              </p>
            </motion.aside>
          )}
        </AnimatePresence>
        <div
          ref={scroll}
          className="dl-table-scroll"
          data-all={showAll}
          aria-label={
            showAll
              ? `${hand.length} cards in a horizontally scrollable arc`
              : "A hand of project cards"
          }
        >
          <div
            ref={table}
            className="dl-table"
            style={{ width: tableWidth, height }}
          >
            <span className="dl-table-line" aria-hidden="true" />
            {!showAll && (
              <button
                className="dl-deck"
                onClick={dealAgain}
                aria-label="Deal five different project cards"
              >
                <span className="dl-deck-pattern">
                  <Suit channel="personal" />
                  <span>DEAL</span>
                  <Suit channel="reading" />
                </span>
                <span className="dl-deck-count">
                  {deck.length - hand.length} in deck
                </span>
              </button>
            )}
            {hand.map((id, index) => (
              <PlayingCard
                key={`${dealNumber}-${id}`}
                project={projectBySlug.get(id)!}
                index={index}
                selected={selected === id}
                flipped={flipped.has(id)}
                caseOpen={caseSlug === id}
                reduced={reduced}
                select={() => choose(id)}
                flip={() => flip(id)}
                node={(node) => {
                  if (node) cardNodes.current.set(id, node);
                  else cardNodes.current.delete(id);
                }}
                faceNode={(node) => {
                  if (node) faceNodes.current.set(id, node);
                  else faceNodes.current.delete(id);
                }}
                start={(event) => startDrag(id, event)}
                move={moveDrag}
                end={endDrag}
                keyboard={(event, handle) => cardKey(id, event, handle)}
              />
            ))}
            {!hand.length && (
              <div className="dl-empty">
                <p>Back in the deck.</p>
                <button onClick={dealAgain}>
                  Deal five more <Arrow />
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="dl-table-foot">
          <p>
            {showAll
              ? "The full deck. Scroll sideways to explore."
              : "Drag the handle to move. Double-click a card to flip."}
          </p>
          <span>{hand.length} on the table</span>
        </div>
        <section className="dl-selection" aria-label="Selected card">
          <div>
            <Suit channel={selectedProject.channel} />
            <div>
              <small>In your hand</small>
              <strong>{selectedProject.name}</strong>
            </div>
          </div>
          <div className="dl-selection-actions">
            <button onClick={() => flip(selected)} disabled={!hand.length}>
              {flipped.has(selected) ? "Show face" : "Flip for facts"}{" "}
              <span aria-hidden="true">↻</span>
            </button>
            <button
              className="dl-open"
              onClick={() => openProject(selected)}
              disabled={!hand.length}
            >
              Open project <Arrow />
            </button>
          </div>
        </section>
        <div className="dl-chip-rack">
          <span className="dl-chip" aria-hidden="true">
            <Suit channel="personal" />
          </span>
          <div>
            <strong>Gentrit Rashiti</strong>
            <span>Dealer · Web, mobile & full stack · Kosovo</span>
          </div>
          <a
            href={links.cv}
            download
            onClick={() => {
              setCvDone(true);
              setMessage("CV download requested.");
            }}
          >
            {cvDone ? "CV requested" : "Take the CV"} <Arrow />
          </a>
        </div>
        <p
          className="dl-status"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {message}
        </p>
        <AnimatePresence mode="wait">
          {activeCase && (
            <motion.section
              ref={casePanel}
              className="dl-case"
              key={activeCase.slug}
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
              transition={{
                duration: reduced ? 0.01 : dur.panel,
                ease: ease.arrive,
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") closeCase();
              }}
              aria-labelledby="dl-case-title"
            >
              <div className="dl-case-head">
                <span>
                  <Suit channel={activeCase.channel} />
                  {suits[activeCase.channel].name} /{" "}
                  {activeCase.years ?? "Independent work"}
                </span>
                <button onClick={closeCase}>
                  <Arrow back />
                  Return to the table
                </button>
              </div>
              <div className="dl-case-body">
                <div>
                  <motion.h2
                    ref={caseHeading}
                    tabIndex={-1}
                    id="dl-case-title"
                    layoutId={`dl-title-${activeCase.slug}`}
                    transition={reduced ? { duration: 0.01 } : spring.ui}
                  >
                    {activeCase.name}
                  </motion.h2>
                  <p className="dl-case-kind">{activeCase.kind}</p>
                  <p>{activeCase.summary}</p>
                  <dl>
                    <div>
                      <dt>Work</dt>
                      <dd>{activeCase.role}</dd>
                    </div>
                    <div>
                      <dt>Made with</dt>
                      <dd>{activeCase.stack.join(" · ")}</dd>
                    </div>
                  </dl>
                  <nav aria-label={`${activeCase.name} links`}>
                    {activeCase.featured && (
                      <a href={`/work/${activeCase.slug}`}>
                        Complete case <Arrow />
                      </a>
                    )}
                    {activeCase.links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {link.label}
                        <Arrow />
                      </a>
                    ))}
                  </nav>
                </div>
                <div>
                  {activeCase.slug === "care-platform" ? (
                    <CareFile reduced={reduced} />
                  ) : wallAssets[activeCase.slug] ? (
                    <figure className="dl-project-image">
                      <img
                        src={wallAssets[activeCase.slug].src}
                        alt={`${activeCase.name}, public project image`}
                        loading="lazy"
                      />
                      <figcaption>Public project image</figcaption>
                    </figure>
                  ) : (
                    <div className="dl-case-fact">
                      <Suit channel={activeCase.channel} />
                      <strong>{projectFact(activeCase).value}</strong>
                      <span>{projectFact(activeCase).label}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
        <footer className="dl-footer">
          <div>
            <h2>A hand from Za!</h2>
            <p>
              A multiplayer card game for 2–8 players, built with a
              server-authoritative game loop. Its cards become a way through
              this portfolio.
            </p>
            <button onClick={() => openProject("za")}>
              Read the Za! project <Arrow />
            </button>
          </div>
          <div className="dl-suits" aria-label="Six project suits">
            {(Object.keys(suits) as ChannelKey[]).map((channel) => (
              <span
                key={channel}
                style={{ "--dl-suit": suits[channel].ink } as CSSProperties}
              >
                <Suit channel={channel} />
                {suits[channel].name}
              </span>
            ))}
          </div>
          <nav aria-label="Contact">
            <a href={`mailto:${links.email}`}>
              Email <Arrow />
            </a>
            <a href={links.linkedin}>
              LinkedIn <Arrow />
            </a>
            <a href={links.github}>
              GitHub <Arrow />
            </a>
          </nav>
        </footer>
      </main>
    </LayoutGroup>
  );
}
