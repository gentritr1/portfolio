import {
  animate,
  useMotionValue,
  useReducedMotion,
  type AnimationPlaybackControls,
  type ValueAnimationTransition,
} from "motion/react";
import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type Ref,
} from "react";
import { flushSync } from "react-dom";
import { projects } from "../../content/projects";
import { features, folio, leftFolio } from "./features";
import { dur, ease, spring } from "./motion";

const count = features.length;
const wrap = (index: number) => (index + count) % count;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const CURL = 32;

export interface BookControl {
  turnTo(index: number): void;
}

interface Pair {
  a: number;
  b: number;
}

interface Drag {
  id: number;
  startX: number;
  startY: number;
  decided: boolean;
  moved: boolean;
  offset: number;
  pivot: number;
  width: number;
  samples: { x: number; t: number }[];
}

function CopyPage({ index, inert }: { index: number; inert?: boolean }) {
  const feature = features[index];
  const project = projects.find((p) => p.slug === feature.slug)!;
  return (
    <article className="iss-page iss-page-copy" inert={inert} aria-hidden={inert || undefined}>
      <header className="iss-run">
        <span>{project.name}</span>
        <span>{project.years}</span>
      </header>
      <h2>
        <span>{feature.title[0]}</span>
        <span>{feature.title[1]}</span>
      </h2>
      <p className="iss-deck">{feature.deck}</p>
      <blockquote>{feature.quote}</blockquote>
      <footer className="iss-foot">
        <span className="iss-folio">{folio(leftFolio(index))}</span>
        <a href={feature.href} aria-label={`Continue reading: ${project.name}`}>
          Continued <span aria-hidden="true">→</span>
        </a>
      </footer>
    </article>
  );
}

function PlatePage({ index, inert }: { index: number; inert?: boolean }) {
  const feature = features[index];
  return (
    <figure
      className="iss-page iss-page-plate"
      data-aspect={feature.aspect}
      inert={inert}
      aria-hidden={inert || undefined}
    >
      <figcaption className="iss-run">
        <span>{feature.caption}</span>
        <span>{folio(leftFolio(index) + 1)}</span>
      </figcaption>
      <div className="iss-plates">
        {feature.plates.map((plate) => (
          <img key={plate.src} src={plate.src} alt={plate.alt} draggable={false} decoding="async" />
        ))}
      </div>
    </figure>
  );
}

function Spread({ index, inert, plateFirst }: { index: number; inert?: boolean; plateFirst?: boolean }) {
  return plateFirst ? (
    <>
      <PlatePage index={index} inert={inert} />
      <CopyPage index={index} inert={inert} />
    </>
  ) : (
    <>
      <CopyPage index={index} inert={inert} />
      <PlatePage index={index} inert={inert} />
    </>
  );
}

export function Book({
  narrow,
  onShow,
  ref,
}: {
  narrow: boolean;
  onShow: (index: number) => void;
  ref: Ref<BookControl>;
}) {
  const reduced = Boolean(useReducedMotion());
  const theta = useMotionValue(!narrow && !reduced ? -60 : 0);
  const curl = useMotionValue(0);
  const [pair, setPair] = useState<Pair>({ a: 0, b: 1 });
  const pairRef = useRef(pair);
  const pageRef = useRef(0);
  const shownRef = useRef(0);
  const spread = useRef<HTMLDivElement>(null);
  const leaf = useRef<HTMLDivElement>(null);
  const run = useRef<AnimationPlaybackControls | null>(null);
  const curlRun = useRef<AnimationPlaybackControls | null>(null);
  const drag = useRef<Drag | null>(null);
  const dragged = useRef(false);
  const showRef = useRef(onShow);
  useEffect(() => {
    showRef.current = onShow;
  }, [onShow]);

  function paint() {
    const angle = theta.get();
    const lift = Math.sin((-angle * Math.PI) / 180);
    if (leaf.current) leaf.current.style.transform = `rotateY(${angle.toFixed(2)}deg)`;
    const node = spread.current;
    if (node) {
      node.style.setProperty("--lift", lift.toFixed(3));
      node.style.setProperty("--lift-right", angle > -90 ? lift.toFixed(3) : "0");
      node.style.setProperty("--lift-left", angle <= -90 ? lift.toFixed(3) : "0");
      node.style.setProperty("--curl", `${curl.get().toFixed(1)}px`);
    }
    const showing = angle < -90 ? pairRef.current.b : pairRef.current.a;
    if (showing !== shownRef.current) {
      shownRef.current = showing;
      showRef.current(showing);
    }
  }

  function setPairNow(next: Pair) {
    pairRef.current = next;
    flushSync(() => setPair(next));
  }

  function settle(to: number) {
    run.current = null;
    const landed = to <= -180 ? pairRef.current.b : pairRef.current.a;
    pageRef.current = landed;
    if (to <= -180 || pairRef.current.b !== wrap(landed + 1)) {
      setPairNow({ a: landed, b: wrap(landed + 1) });
      theta.jump(0);
      paint();
    }
  }

  function swing(to: number, transition: ValueAnimationTransition<number>) {
    run.current?.stop();
    const controls = animate(theta, to, {
      ...transition,
      onComplete: () => {
        if (run.current === controls) settle(to);
      },
    });
    run.current = controls;
  }

  const turnMotion: ValueAnimationTransition<number> = reduced
    ? { duration: 0.01 }
    : { duration: 0.8, ease: ease.story };

  function curlTo(px: number) {
    if (reduced && px > 0) return;
    curlRun.current?.stop();
    curlRun.current = animate(curl, px, { duration: reduced ? 0.01 : dur.tap + 0.03, ease: ease.out });
  }

  function turnTo(index: number, forward?: boolean) {
    const target = wrap(index);
    if (run.current) {
      if (target === pairRef.current.b) return swing(-180, turnMotion);
      if (target === pairRef.current.a) return swing(0, turnMotion);
      run.current.stop();
      settle(theta.get() < -90 ? -180 : 0);
    }
    const page = pageRef.current;
    if (target === page) return;
    curlTo(0);
    if (forward ?? target > page) {
      setPairNow({ a: page, b: target });
      swing(-180, turnMotion);
    } else {
      setPairNow({ a: target, b: page });
      theta.jump(-180);
      paint();
      swing(0, turnMotion);
    }
  }

  useImperativeHandle(ref, () => ({ turnTo }));

  useEffect(() => {
    const offTheta = theta.on("change", paint);
    const offCurl = curl.on("change", paint);
    paint();
    if (theta.get() === -60) swing(0, { duration: 0.7, ease: ease.sheet, delay: 0.3 });
    return () => {
      offTheta();
      offCurl();
      run.current?.stop();
      run.current = null;
      curlRun.current?.stop();
    };
  }, []);

  function geometry() {
    const box = spread.current!.getBoundingClientRect();
    return narrow ? { pivot: box.left, width: box.width } : { pivot: box.left + box.width / 2, width: box.width / 2 };
  }

  function grab(d: Drag, x: number) {
    run.current?.stop();
    run.current = null;
    const angle = theta.get();
    d.offset = d.width * Math.cos((angle * Math.PI) / 180) - (x - d.pivot);
    d.decided = true;
  }

  function down(event: ReactPointerEvent<HTMLElement>) {
    if (event.button !== 0 || drag.current) return;
    if (event.target instanceof Element && event.target.closest("a")) return;
    const { pivot, width } = geometry();
    const d: Drag = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      decided: false,
      moved: false,
      offset: 0,
      pivot,
      width,
      samples: [{ x: event.clientX, t: event.timeStamp }],
    };
    drag.current = d;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* Synthetic pointers cannot be captured. */
    }
  }

  function move(event: ReactPointerEvent<HTMLElement>) {
    const d = drag.current;
    if (!d || d.id !== event.pointerId) return;
    const dx = event.clientX - d.startX;
    const dy = event.clientY - d.startY;
    if (!d.decided) {
      const threshold = narrow ? 8 : 4;
      if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;
      if (narrow && Math.abs(dy) > Math.abs(dx)) {
        drag.current = null;
        return;
      }
      if (!run.current && theta.get() === 0 && dx > 0) {
        if (!narrow) {
          drag.current = null;
          return;
        }
        setPairNow({ a: wrap(pageRef.current - 1), b: pageRef.current });
        theta.jump(-180);
      }
      grab(d, d.startX);
      d.moved = true;
      curlTo(0);
    }
    const u = clamp((event.clientX - d.pivot + d.offset) / d.width, -1, 1);
    theta.set((-Math.acos(u) * 180) / Math.PI);
    d.samples.push({ x: event.clientX, t: event.timeStamp });
    if (d.samples.length > 6) d.samples.shift();
  }

  function up(event: ReactPointerEvent<HTMLElement>) {
    const d = drag.current;
    if (!d || d.id !== event.pointerId) return;
    drag.current = null;
    if (!d.moved) return;
    dragged.current = true;
    window.setTimeout(() => (dragged.current = false), 0);
    const first = d.samples[0];
    const last = d.samples[d.samples.length - 1];
    const span = Math.max(16, last.t - first.t);
    const vx = event.type === "pointercancel" ? 0 : ((last.x - first.x) / span) * 1000;
    const angle = theta.get();
    const to = vx < -300 ? -180 : vx > 300 ? 0 : angle < -90 ? -180 : 0;
    const u = Math.cos((angle * Math.PI) / 180);
    const omega = clamp(((vx / d.width) * (180 / Math.PI)) / Math.max(0.3, Math.sqrt(1 - u * u)), -1400, 1400);
    swing(to, reduced ? { duration: 0.01 } : { ...spring.ui, velocity: omega });
  }

  function key(event: ReactKeyboardEvent) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      turnTo(pageRef.current + 1, true);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      turnTo(pageRef.current - 1, false);
    }
  }

  const next = features[pair.b];
  const pointer = { onPointerMove: move, onPointerUp: up, onPointerCancel: up };

  if (narrow) {
    return (
      <div className="iss-book iss-book-stack" onKeyDown={key}>
        <div className="iss-spread" ref={spread} onPointerDown={down} {...pointer}>
          <div className="iss-under">
            <Spread index={pair.b} inert plateFirst />
          </div>
          <div className="iss-leaf" ref={leaf}>
            <div className="iss-face iss-front">
              <Spread index={pair.a} plateFirst />
            </div>
            <div className="iss-face iss-back" aria-hidden="true" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="iss-book" onKeyDown={key}>
      <div className="iss-spread" ref={spread}>
        <div className="iss-under-left">
          <CopyPage index={pair.a} />
        </div>
        <div className="iss-under-right">
          <PlatePage index={pair.b} inert />
        </div>
        <div className="iss-leaf" ref={leaf} onPointerDown={down} {...pointer}>
          <div className="iss-face iss-front">
            <PlatePage index={pair.a} />
          </div>
          <span className="iss-flap" aria-hidden="true">
            <span />
          </span>
          <div className="iss-face iss-back">
            <CopyPage index={pair.b} inert />
          </div>
        </div>
        <button
          type="button"
          className="iss-corner"
          aria-label={`Turn the page to ${projects.find((p) => p.slug === next.slug)!.name}`}
          onPointerEnter={(event) => event.pointerType === "mouse" && curlTo(CURL)}
          onPointerLeave={() => !drag.current && curlTo(0)}
          onFocus={(event) => event.currentTarget.matches(":focus-visible") && curlTo(CURL)}
          onBlur={() => curlTo(0)}
          onPointerDown={down}
          {...pointer}
          onClick={() => {
            if (!dragged.current) turnTo(pageRef.current + 1, true);
          }}
        />
      </div>
    </div>
  );
}
