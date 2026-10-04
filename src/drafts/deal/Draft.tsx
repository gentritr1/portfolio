import {
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
import {
  art,
  deck,
  nextHand,
  projectBySlug,
  projectFact,
  rankOf,
  spreadOrder,
  suitOrder,
  suits,
} from "./data";
import { createCardTable, type CardPosition, type CardTable } from "./physics";
import { dur, ease, spring } from "./motion";
import { riffle, wakeSound } from "./sound";
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

function CardBack() {
  return (
    <>
      <span className="dl-back-field" aria-hidden="true" />
      <span className="dl-medallion" aria-hidden="true">
        <b>GR</b>
      </span>
    </>
  );
}

interface PlayingCardProps {
  project: Project;
  selected: boolean;
  flipped: boolean;
  landed: boolean;
  play: boolean;
  caseOpen: boolean;
  reduced: boolean;
  eager: boolean;
  node: (node: HTMLDivElement | null) => void;
  faceNode: (node: HTMLButtonElement | null) => void;
  select: () => void;
  flip: () => void;
  hover: (on: boolean) => void;
  start: (event: PointerEvent<HTMLButtonElement>) => void;
  move: (event: PointerEvent<HTMLButtonElement>) => void;
  end: (event: PointerEvent<HTMLButtonElement>, cancel?: boolean) => void;
  keyboard: (event: KeyboardEvent<HTMLButtonElement>) => void;
}

function PlayingCard({
  project,
  selected,
  flipped,
  landed,
  play,
  caseOpen,
  reduced,
  eager,
  node,
  faceNode,
  select,
  flip,
  hover,
  start,
  move,
  end,
  keyboard,
}: PlayingCardProps) {
  const suit = suits[project.channel];
  const fact = projectFact(project);
  const rank = rankOf(project.slug);
  const picture = art[project.slug];
  const faceDown = flipped || !landed;
  const [firstTurn, setFirstTurn] = useState(!landed);
  const factSize =
    fact.value.length > 10 ? "s" : fact.value.length > 6 ? "m" : "l";
  return (
    <div
      ref={node}
      className="dl-body"
      data-selected={selected}
      data-project={project.slug}
      style={{ "--dl-suit": suit.ink } as CSSProperties}
    >
      <span className="dl-shadow" aria-hidden="true" />
      <span className="dl-puff" aria-hidden="true" />
      <div className="dl-lift">
        <button
          ref={faceNode}
          type="button"
          className="dl-card"
          aria-label={`${project.name}. ${rank} of ${suit.name}, ${project.kind}, ${project.years ?? "independent work"}.${flipped ? ` ${fact.value}, ${fact.label}. ${project.line}.` : ""}`}
          aria-describedby="dl-keys"
          aria-pressed={selected}
          tabIndex={selected ? 0 : -1}
          onClick={select}
          onDoubleClick={flip}
          onFocus={select}
          onKeyDown={keyboard}
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") hover(true);
          }}
          onPointerLeave={(event) => {
            if (event.pointerType === "mouse") hover(false);
          }}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={(event) => end(event)}
          onPointerCancel={(event) => end(event, true)}
        >
          <motion.span
            className="dl-card-turn"
            initial={landed ? false : { rotateY: 180 }}
            animate={{ rotateY: faceDown ? 180 : 0 }}
            transition={
              reduced
                ? { duration: 0.01 }
                : play && firstTurn
                  ? spring.play
                  : spring.ui
            }
            onAnimationComplete={() => {
              if (landed && firstTurn) setFirstTurn(false);
            }}
          >
            <span className="dl-face" aria-hidden="true">
              <span className="dl-index">
                <b>{rank}</b>
                <Suit channel={project.channel} />
              </span>
              <span className="dl-index dl-index-end">
                <b>{rank}</b>
                <Suit channel={project.channel} />
              </span>
              <span className="dl-strip-name">{project.name}</span>
              {picture ? (
                <span className="dl-art dl-art-picture">
                  <img
                    src={picture.src}
                    alt=""
                    style={{
                      objectPosition: picture.position,
                      transformOrigin: picture.position,
                      scale: String(picture.zoom ?? 1),
                    }}
                    loading={eager ? "eager" : "lazy"}
                    decoding="async"
                    draggable={false}
                  />
                </span>
              ) : (
                <span className="dl-art dl-art-type" data-size={factSize}>
                  <Suit channel={project.channel} className="dl-art-pip" />
                  <strong>{fact.value}</strong>
                  <small>{fact.label}</small>
                </span>
              )}
              <motion.span
                className="dl-face-name"
                data-long={project.name.length > 22}
                layoutId={caseOpen ? undefined : `dl-title-${project.slug}`}
                transition={reduced ? { duration: 0.01 } : spring.ui}
              >
                {project.name}
              </motion.span>
              {picture && <span className="dl-face-fact">{fact.value}</span>}
              <span className="dl-face-meta">
                {project.kind} · {project.years ?? "Independent"}
              </span>
            </span>
            <span className="dl-back" aria-hidden="true">
              <CardBack />
              <span className="dl-plate" data-show={flipped}>
                <span className="dl-plate-head">
                  <Suit channel={project.channel} />
                  <b>
                    {rank} · {suit.name}
                  </b>
                </span>
                <strong>{fact.value}</strong>
                <span className="dl-plate-label">{fact.label}</span>
                <span className="dl-plate-line">{project.line}</span>
                <span className="dl-plate-stack">
                  {project.stack.slice(0, 3).join(" · ")}
                </span>
              </span>
            </span>
          </motion.span>
        </button>
      </div>
    </div>
  );
}

const chips = [
  { label: "CV", href: links.cv, tone: "cream", download: true },
  { label: "Email", href: `mailto:${links.email}`, tone: "ink" },
  { label: "GitHub", href: links.github, tone: "cobalt" },
  { label: "LinkedIn", href: links.linkedin, tone: "forest" },
] as const;

export default function Draft() {
  const [hand, setHand] = useState(() => nextHand(0));
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState("za");
  const [flipped, setFlipped] = useState(new Set<string>());
  const [landed, setLanded] = useState(new Set<string>());
  const [caseSlug, setCaseSlug] = useState<string | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [sound, setSound] = useState(false);
  const [dealNumber, setDealNumber] = useState(1);
  const [message, setMessage] = useState("");
  const felt = useRef<HTMLDivElement>(null);
  const cardNodes = useRef(new Map<string, HTMLElement>());
  const faceNodes = useRef(new Map<string, HTMLButtonElement>());
  const engine = useRef<CardTable | null>(null);
  const offset = useRef(0);
  const dealStamp = useRef(0);
  const hovered = useRef<string | null>(null);
  const suppressClick = useRef(false);
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
    started: boolean;
  } | null>(null);
  const swipe = useRef<{
    pointer: number;
    startX: number;
    startY: number;
    from: number;
    position: number;
    lastX: number;
    lastAt: number;
    velocity: number;
    active: boolean;
  } | null>(null);

  const width = size.width;
  const height = size.height;
  const narrow = width > 0 && width < 640;
  const cardWidth = narrow ? 200 : 212;
  const cardHeight = narrow ? 282 : 298;
  const deckPoint = narrow
    ? { x: 46, y: 162, angle: -12 }
    : { x: 150, y: 214, angle: -10 };
  const selectedProject = projectBySlug.get(selected) ?? deck[0];
  const activeCase = caseSlug ? projectBySlug.get(caseSlug)! : null;
  const lastDealt = showAll ? null : hand[hand.length - 1];
  const spreadCentre = 0.48;

  useLayoutEffect(() => {
    const element = felt.current;
    if (!element) return;
    const measure = () => {
      const box = element.getBoundingClientRect();
      setSize((current) =>
        Math.abs(current.width - box.width) < 1 &&
        Math.abs(current.height - box.height) < 1
          ? current
          : { width: box.width, height: box.height },
      );
    };
    measure();
    dealStamp.current = performance.now();
    const observer = new ResizeObserver(measure);
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
    if (!felt.current || !width) return;
    engine.current = createCardTable({
      element: felt.current,
      nodes: cardNodes.current,
      width,
      height,
      cardWidth,
      cardHeight,
      reduced,
      onReturn: (id) => returnRef.current(id),
      onLand: (id) =>
        setLanded((current) =>
          current.has(id) ? current : new Set(current).add(id),
        ),
    });
    return () => {
      engine.current?.dispose();
      engine.current = null;
    };
  }, [width, height, cardWidth, cardHeight, reduced]);

  function positions(fanAt?: number): CardPosition[] {
    const count = hand.length;
    const chosen = Math.max(0, hand.indexOf(selected));
    const hover = hovered.current ? hand.indexOf(hovered.current) : -1;
    if (narrow) {
      const centre = fanAt ?? chosen;
      const baseY = height * 0.535;
      return hand.map((id, index) => {
        const k = index - centre;
        const distance = Math.abs(k);
        const side = Math.sign(k);
        const near = Math.min(distance, 1);
        return {
          id,
          x: width / 2 + side * (near * 64 + Math.max(0, distance - 1) * 24),
          y: baseY + Math.min(distance, 4) ** 1.25 * 9 - (1 - near) * 18,
          angle: Math.max(-18, Math.min(18, k * 6)),
          z: 200 - Math.round(distance * 10),
          fade: Math.max(0, Math.min(1, 4.2 - distance)),
        };
      });
    }
    if (showAll) {
      const theta = (22 * Math.PI) / 180;
      const half = (width - 220 - cardWidth) / 2;
      const radius = half / Math.sin(theta);
      const centreY = height * spreadCentre;
      return hand.map((id, index) => {
        const a = -theta + (2 * theta * index) / Math.max(1, count - 1);
        let x = width / 2 + radius * Math.sin(a);
        let y = centreY + radius * (1 - Math.cos(a));
        const lift = id === selected ? 76 : index === hover ? 26 : 0;
        x += Math.sin(a) * lift;
        y -= Math.cos(a) * lift;
        if (hover >= 0 && index !== hover) x += index < hover ? -12 : 12;
        return {
          id,
          x,
          y,
          angle: (a * 180) / Math.PI,
          z: id === selected ? 120 : index === hover ? 110 : index + 1,
        };
      });
    }
    const span = Math.min(
      cardWidth * 0.94,
      (width - cardWidth - 380) / Math.max(1, count - 1),
    );
    return hand.map((id, index) => {
      const t = count === 1 ? 0 : (index / (count - 1)) * 2 - 1;
      let x = width / 2 + (index - (count - 1) / 2) * span;
      if (hover >= 0 && index !== hover) x += index < hover ? -18 : 18;
      const y =
        height * 0.545 +
        Math.abs(t) * 34 -
        (id === selected ? 16 : 0) -
        (index === hover ? 8 : 0);
      return {
        id,
        x,
        y,
        angle: t * 10,
        z: index === hover ? 110 : id === selected ? 100 : index + 1,
      };
    });
  }

  useLayoutEffect(() => {
    if (!width) return;
    const fresh = performance.now() - dealStamp.current < 400;
    engine.current?.layout(positions(), {
      from: fresh ? deckPoint : undefined,
      stagger: showAll ? 0.024 : 0.06,
      gather: fresh,
    });
  }, [hand, showAll, selected, width, height, cardWidth, cardHeight, reduced]);

  function relayout() {
    engine.current?.layout(positions());
  }

  function choose(id: string, focus = false) {
    setSelected(id);
    if (focus) faceNodes.current.get(id)?.focus({ preventScroll: true });
  }

  function flip(id: string) {
    const turning = !flipped.has(id);
    setFlipped((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    const project = projectBySlug.get(id)!;
    const fact = projectFact(project);
    setMessage(
      turning
        ? `${project.name}, facts: ${fact.value}, ${fact.label}. ${project.line}.`
        : `${project.name}, face up.`,
    );
  }

  function openProject(id: string) {
    setCaseSlug(id);
    setSelected(id);
  }

  useLayoutEffect(() => {
    if (!caseSlug) return;
    const frame = requestAnimationFrame(() => {
      caseHeading.current?.focus({ preventScroll: true });
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
      felt.current?.scrollIntoView({
        block: "center",
        behavior: reduced ? "instant" : "smooth",
      });
    });
  }

  function dealAgain() {
    offset.current = (offset.current + 5) % deck.length;
    const next = nextHand(offset.current);
    dealStamp.current = performance.now();
    hovered.current = null;
    setShowAll(false);
    setHand(next);
    setSelected(next[2]);
    setFlipped(new Set());
    setLanded(new Set());
    setDealNumber((value) => value + 1);
    if (sound) riffle(5, 0.06);
    setMessage(
      `A new hand of five projects. ${projectBySlug.get(next[2])!.name} is selected.`,
    );
  }

  function spread() {
    dealStamp.current = performance.now();
    hovered.current = null;
    if (showAll) {
      const next = nextHand(offset.current);
      setShowAll(false);
      setHand(next);
      setSelected(next.includes(selected) ? selected : next[2]);
      setMessage("The deck is gathered. A hand of five is on the table.");
    } else {
      setShowAll(true);
      setHand(spreadOrder);
      if (sound) riffle(deck.length, 0.024);
      setMessage(
        `All ${deck.length} project cards are spread in suit order. ${selectedProject.name} is pulled out. Use the arrow keys to choose another.`,
      );
    }
  }

  function toggleSound() {
    if (!sound) wakeSound();
    setSound(!sound);
  }

  function startDrag(id: string, event: PointerEvent<HTMLButtonElement>) {
    if (narrow || event.button !== 0) return;
    drag.current = {
      id,
      pointer: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: 0,
      originY: 0,
      lastX: event.clientX,
      lastY: event.clientY,
      lastAt: event.timeStamp,
      velocityX: 0,
      velocityY: 0,
      started: false,
    };
  }

  function moveDrag(event: PointerEvent<HTMLButtonElement>) {
    const current = drag.current;
    if (!current || current.pointer !== event.pointerId) return;
    if (!current.started) {
      if (
        Math.hypot(
          event.clientX - current.startX,
          event.clientY - current.startY,
        ) < 5
      )
        return;
      const body = engine.current?.grab(current.id);
      if (!body) return;
      current.started = true;
      current.originX = body.x;
      current.originY = body.y;
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        /* A synthetic pointer cannot be captured. */
      }
      choose(current.id);
    }
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
      current.velocityX,
    );
  }

  function endDrag(event: PointerEvent<HTMLButtonElement>, cancel = false) {
    const current = drag.current;
    if (!current || current.pointer !== event.pointerId) return;
    drag.current = null;
    if (!current.started) return;
    suppressClick.current = true;
    const stale = event.timeStamp - current.lastAt > 100;
    const limit = (value: number) => Math.max(-4500, Math.min(4500, value));
    const thrown = engine.current?.release(
      current.id,
      cancel || stale ? 0 : limit(current.velocityX),
      cancel || stale ? 0 : limit(current.velocityY),
    );
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    setMessage(
      thrown
        ? `${projectBySlug.get(current.id)!.name} is returning to the deck.`
        : `${projectBySlug.get(current.id)!.name} placed on the table.`,
    );
  }

  function swipeStart(event: PointerEvent<HTMLDivElement>) {
    if (!narrow || !hand.length) return;
    const from = Math.max(0, hand.indexOf(selected));
    swipe.current = {
      pointer: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      from,
      position: from,
      lastX: event.clientX,
      lastAt: event.timeStamp,
      velocity: 0,
      active: false,
    };
  }

  function swipeMove(event: PointerEvent<HTMLDivElement>) {
    const current = swipe.current;
    if (!current || current.pointer !== event.pointerId) return;
    const dx = event.clientX - current.startX;
    if (!current.active) {
      if (
        Math.abs(dx) < 8 ||
        Math.abs(dx) < Math.abs(event.clientY - current.startY)
      )
        return;
      current.active = true;
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        /* A synthetic pointer cannot be captured. */
      }
    }
    const elapsed = Math.max(1, event.timeStamp - current.lastAt) / 1000;
    current.velocity =
      current.velocity * 0.3 +
      ((event.clientX - current.lastX) / elapsed) * 0.7;
    current.lastX = event.clientX;
    current.lastAt = event.timeStamp;
    current.position = Math.max(
      -0.4,
      Math.min(hand.length - 0.6, current.from - dx / 64),
    );
    engine.current?.layout(positions(current.position));
  }

  function swipeEnd(event: PointerEvent<HTMLDivElement>) {
    const current = swipe.current;
    if (!current || current.pointer !== event.pointerId) return;
    swipe.current = null;
    if (!current.active) return;
    suppressClick.current = true;
    const stale = event.timeStamp - current.lastAt > 100;
    const predicted =
      current.position - (stale ? 0 : current.velocity * 0.2) / 64;
    const index = Math.max(0, Math.min(hand.length - 1, Math.round(predicted)));
    const id = hand[index];
    if (id === selected) relayout();
    else choose(id);
    setMessage(`${projectBySlug.get(id)!.name} is in front.`);
  }

  function cardKey(id: string, event: KeyboardEvent<HTMLButtonElement>) {
    const key = event.key;
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(key)) {
      event.preventDefault();
      if (
        !narrow &&
        (event.shiftKey || key === "ArrowUp" || key === "ArrowDown")
      ) {
        engine.current?.nudge(
          id,
          key === "ArrowLeft" ? -24 : key === "ArrowRight" ? 24 : 0,
          key === "ArrowUp" ? -24 : key === "ArrowDown" ? 24 : 0,
        );
        setMessage(`${projectBySlug.get(id)!.name} moved.`);
        return;
      }
      const direction = key === "ArrowRight" || key === "ArrowDown" ? 1 : -1;
      const next = (hand.indexOf(id) + direction + hand.length) % hand.length;
      choose(hand[next], true);
    } else if (key === "Enter" || key === " " || key.toLowerCase() === "f") {
      event.preventDefault();
      flip(id);
    } else if (key.toLowerCase() === "o") {
      event.preventDefault();
      openProject(id);
    }
  }

  const suitLabels =
    showAll && !narrow && width
      ? suitOrder.map((channel) => {
          const indexes = spreadOrder
            .map((slug, index) => [slug, index] as const)
            .filter(([slug]) => projectBySlug.get(slug)!.channel === channel)
            .map(([, index]) => index);
          const middle = (indexes[0] + indexes[indexes.length - 1]) / 2;
          const theta = (22 * Math.PI) / 180;
          const half = (width - 220 - cardWidth) / 2;
          const radius = half / Math.sin(theta);
          const a = -theta + (2 * theta * middle) / (spreadOrder.length - 1);
          const below =
            cardHeight / 2 + 28 + (suitOrder.indexOf(channel) % 2 ? 26 : 0);
          const along = -(cardWidth / 2 - 20);
          const x =
            width / 2 +
            radius * Math.sin(a) -
            Math.sin(a) * below +
            Math.cos(a) * along;
          const y =
            height * spreadCentre +
            radius * (1 - Math.cos(a)) +
            Math.cos(a) * below +
            Math.sin(a) * along;
          return {
            channel,
            x,
            y,
            angle: (a * 180) / Math.PI,
            count: indexes.length,
          };
        })
      : [];

  const remaining = deck.length - (showAll ? deck.length : hand.length);

  return (
    <LayoutGroup id="deal">
      <title>Deal — Gentrit Rashiti</title>
      <main
        className="draft-deal"
        lang="en"
        data-narrow={narrow}
        style={
          {
            "--dl-card-width": `${cardWidth}px`,
            "--dl-card-height": `${cardHeight}px`,
          } as CSSProperties
        }
      >
        <a className="dl-exit" href="/drafts" aria-label="All art directions">
          <Arrow back />
          <span>Drafts</span>
        </a>
        <section className="dl-table" aria-label="The card table">
          <div className="dl-rim">
            <nav className="dl-tray" aria-label="The dealer's chips">
              {chips.map((chip) => (
                <a
                  key={chip.label}
                  className="dl-chip"
                  data-tone={chip.tone}
                  href={chip.href}
                  {...("download" in chip ? { download: true } : {})}
                  {...(chip.href.startsWith("http")
                    ? { target: "_blank", rel: "noreferrer" }
                    : {})}
                >
                  <span>{chip.label}</span>
                </a>
              ))}
              <button
                type="button"
                className="dl-chip"
                data-tone="mustard"
                aria-pressed={sound}
                aria-label="Card sound"
                onClick={toggleSound}
              >
                <span>
                  Sound
                  <small>{sound ? "On" : "Off"}</small>
                </span>
              </button>
            </nav>
            <div
              ref={felt}
              className="dl-felt"
              data-all={showAll}
              onPointerDown={swipeStart}
              onPointerMove={swipeMove}
              onPointerUp={swipeEnd}
              onPointerCancel={() => (swipe.current = null)}
            >
              <h1 className="dl-printing">
                <svg viewBox="0 0 1000 230" aria-hidden="true">
                  <path
                    id="dl-arc-name"
                    d="M110 46 Q500 178 890 46"
                    fill="none"
                  />
                  <path
                    id="dl-arc-line"
                    d="M190 112 Q500 222 810 112"
                    fill="none"
                  />
                  <path className="dl-rule" d="M160 84 Q500 206 840 84" />
                  <path className="dl-rule" d="M206 140 Q500 246 794 140" />
                  <text className="dl-print-name">
                    <textPath
                      href="#dl-arc-name"
                      startOffset="50%"
                      textAnchor="middle"
                    >
                      Gentrit Rashiti
                    </textPath>
                  </text>
                  <text className="dl-print-line">
                    <textPath
                      href="#dl-arc-line"
                      startOffset="50%"
                      textAnchor="middle"
                    >
                      Web · mobile · full stack — Kosovo
                    </textPath>
                  </text>
                </svg>
                <span className="dl-sr">
                  Gentrit Rashiti, web, mobile and full-stack developer in
                  Kosovo. {deck.length} projects dealt as playing cards in six suits.
                </span>
              </h1>
              <button
                type="button"
                className="dl-deck"
                data-empty={remaining === 0}
                style={{ left: deckPoint.x, top: deckPoint.y }}
                onClick={dealAgain}
                aria-label={`Deal five different project cards. ${remaining} cards in the deck.`}
              >
                <span className="dl-deck-cards" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span className="dl-deck-top">
                    <CardBack />
                  </span>
                </span>
                <span className="dl-deck-mark" aria-hidden="true">
                  Deal <b>{remaining}</b>
                </span>
              </button>
              <AnimatePresence>
                {suitLabels.map((label, index) => (
                  <motion.span
                    key={label.channel}
                    className="dl-suit-label"
                    aria-hidden="true"
                    style={{ left: label.x, top: label.y, rotate: label.angle }}
                    initial={
                      reduced ? false : { opacity: 0, filter: "blur(4px)" }
                    }
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(4px)" }}
                    transition={{
                      duration: reduced ? 0.01 : dur.panel,
                      delay: reduced ? 0 : 0.5 + index * 0.05,
                      ease: ease.out,
                    }}
                  >
                    <Suit channel={label.channel} />
                    {suits[label.channel].name}
                    <b>{label.count}</b>
                  </motion.span>
                ))}
              </AnimatePresence>
              <div
                className="dl-hand"
                role="group"
                aria-label={
                  showAll
                    ? `All ${deck.length} project cards, spread in suit order`
                    : "A hand of five project cards"
                }
              >
                {hand.map((id) => (
                  <PlayingCard
                    key={`${dealNumber}-${id}`}
                    project={projectBySlug.get(id)!}
                    selected={selected === id}
                    flipped={flipped.has(id)}
                    landed={landed.has(id)}
                    play={id === lastDealt && dealNumber === 1}
                    caseOpen={caseSlug === id}
                    reduced={reduced}
                    eager={!showAll}
                    node={(node) => {
                      if (node) cardNodes.current.set(id, node);
                      else cardNodes.current.delete(id);
                    }}
                    faceNode={(node) => {
                      if (node) faceNodes.current.set(id, node);
                      else faceNodes.current.delete(id);
                    }}
                    select={() => {
                      if (suppressClick.current) {
                        suppressClick.current = false;
                        return;
                      }
                      choose(id);
                    }}
                    flip={() => flip(id)}
                    hover={(on) => {
                      if (on) hovered.current = id;
                      else if (hovered.current === id) hovered.current = null;
                      relayout();
                    }}
                    start={(event) => startDrag(id, event)}
                    move={moveDrag}
                    end={endDrag}
                    keyboard={(event) => cardKey(id, event)}
                  />
                ))}
              </div>
              <div className="dl-spots">
                <button
                  type="button"
                  className="dl-spot"
                  onClick={() => flip(selected)}
                  disabled={!hand.length}
                  aria-label={`${flipped.has(selected) ? "Show the face of" : "Flip for the facts of"} ${selectedProject.name}`}
                >
                  <small>Flip</small>
                  <span>{flipped.has(selected) ? "Face" : "Facts"}</span>
                </button>
                <button
                  type="button"
                  className="dl-spot dl-spot-open"
                  onClick={() => openProject(selected)}
                  disabled={!hand.length}
                  aria-label={`Open ${selectedProject.name}`}
                >
                  <small>Open</small>
                  <span>{selectedProject.name}</span>
                </button>
                <button
                  type="button"
                  className="dl-spot"
                  onClick={spread}
                  aria-pressed={showAll}
                  aria-label={
                    showAll
                      ? "Gather the deck into a hand of five"
                      : `Spread all ${deck.length} cards`
                  }
                >
                  <small>{showAll ? "Gather" : "Spread"}</small>
                  <span>{showAll ? "Five" : `All ${deck.length}`}</span>
                </button>
              </div>
            </div>
          </div>
        </section>
        <p id="dl-keys" className="dl-sr">
          Left and right arrows choose a card. Enter, Space or F flips it. O
          opens the project. Shift with an arrow moves the card on the table.
        </p>
        <p
          className="dl-sr"
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
              style={
                { "--dl-suit": suits[activeCase.channel].ink } as CSSProperties
              }
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
              <span className="dl-index" aria-hidden="true">
                <b>{rankOf(activeCase.slug)}</b>
                <Suit channel={activeCase.channel} />
              </span>
              <span className="dl-index dl-index-end" aria-hidden="true">
                <b>{rankOf(activeCase.slug)}</b>
                <Suit channel={activeCase.channel} />
              </span>
              <div className="dl-case-head">
                <span>
                  {rankOf(activeCase.slug)} of {suits[activeCase.channel].name}{" "}
                  · {activeCase.years ?? "Independent work"}
                </span>
                <button type="button" onClick={closeCase}>
                  <Arrow back />
                  Back to the table
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
      </main>
    </LayoutGroup>
  );
}
