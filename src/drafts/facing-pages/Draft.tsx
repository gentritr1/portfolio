import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { flushSync } from "react-dom";
import { LayoutGroup, motion } from "motion/react";
import { links } from "../../content/links";
import { projects } from "../../content/projects";
import { chapters } from "./content";
import { Page, type PageMetrics, type ReadingPosition } from "./Page";
import { snapshotSpread } from "./snapshot";
import { ease, spring } from "./motion";
import type { PageCurl } from "./curl";
import "./facing-pages.css";

const firstPage: ReadingPosition = { chapter: "all", project: null, page: 0 };
interface Turn {
  from: ReadingPosition;
  to: ReadingPosition;
  direction: number;
  step: number;
  mode: "preparing" | "webgl" | "css";
}
function Arrow({ back = false }: { back?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      style={back ? { transform: "rotate(180deg)" } : undefined}
    >
      <path d="M4 12h15M12 5l7 7-7 7" />
    </svg>
  );
}
function FlipIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M3 7h17l-4-4M21 17H4l4 4M12 4v16" />
    </svg>
  );
}

export default function Draft() {
  const [opened, setOpened] = useState(false);
  const [freshOpen, setFreshOpen] = useState(false);
  const [position, setPosition] = useState<ReadingPosition>(firstPage);
  const [fontSize, setFontSize] = useState(17);
  const [rtl, setRtl] = useState(false);
  const [mobile, setMobile] = useState(
    () => matchMedia("(max-width: 760px)").matches,
  );
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [renderer, setRenderer] = useState<"css" | "webgl">("css");
  const [turning, setTurning] = useState(false);
  const [metrics, setMetrics] = useState({
    en: { pages: 1, width: 1 },
    ar: { pages: 1, width: 1 },
  });
  const [status, setStatus] = useState(
    "Open the book or choose a chapter tab.",
  );
  const [cvRequested, setCvRequested] = useState(false);
  const [drag, setDrag] = useState(0);
  const spread = useRef<HTMLDivElement>(null);
  const curlHost = useRef<HTMLDivElement>(null);
  const leaf = useRef<HTMLDivElement>(null);
  const leafFront = useRef<HTMLDivElement>(null);
  const leafBack = useRef<HTMLDivElement>(null);
  const reader = useRef<HTMLDivElement>(null);
  const book = useRef<HTMLDivElement>(null);
  const curl = useRef<PageCurl | null>(null);
  const cssAnimation = useRef<Animation | null>(null);
  const currentTurn = useRef<Turn | null>(null);
  const requestVersion = useRef(0);
  const pointer = useRef<{
    id: number;
    x: number;
    y: number;
    previousX: number;
    previousTime: number;
    vx: number;
  } | null>(null);
  const measuredMetrics = useRef(metrics);
  const count = Math.max(metrics.en.pages, metrics.ar.pages);
  const title = position.project
    ? projects.find((project) => project.slug === position.project)!.name
    : (chapters.find((chapter) => chapter.id === position.chapter)?.en ??
      "Contents");
  const onMeasure = useCallback((language: "en" | "ar", next: PageMetrics) => {
    const current = measuredMetrics.current;
    if (
      current[language].pages === next.pages &&
      current[language].width === next.width
    )
      return;
    const measured = { ...current, [language]: next };
    measuredMetrics.current = measured;
    setMetrics(measured);
    const maximum = Math.max(measured.en.pages, measured.ar.pages);
    setPosition((value) =>
      value.page >= maximum
        ? { ...value, page: Math.max(0, maximum - 1) }
        : value,
    );
  }, []);

  useEffect(() => {
    const screen = matchMedia("(max-width: 760px)");
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const resize = () => setMobile(screen.matches);
    const change = () => setReduced(preference.matches);
    screen.addEventListener("change", resize);
    preference.addEventListener("change", change);
    return () => {
      screen.removeEventListener("change", resize);
      preference.removeEventListener("change", change);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    if (
      reduced ||
      connection?.saveData ||
      (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 2)
    )
      return;
    void import("./curl")
      .then((module) => {
        if (cancelled || !curlHost.current) return;
        const renderer = module.createPageCurl(curlHost.current);
        curl.current = renderer;
        setRenderer(renderer ? "webgl" : "css");
      })
      .catch(() => setRenderer("css"));
    return () => {
      cancelled = true;
      curl.current?.dispose();
      curl.current = null;
    };
  }, [reduced]);

  useEffect(
    () => () => {
      requestVersion.current += 1;
      cssAnimation.current?.cancel();
    },
    [],
  );

  function finishTurn(completed: boolean) {
    const turn = currentTurn.current;
    if (!turn) return;
    setPosition(completed ? turn.to : turn.from);
    if (leaf.current) leaf.current.style.visibility = "hidden";
    leafFront.current?.replaceChildren();
    leafBack.current?.replaceChildren();
    currentTurn.current = null;
    setTurning(false);
    setStatus(completed ? "Page turned." : "Page turn reversed.");
    reader.current?.focus({ preventScroll: true });
  }

  function cancelTurn() {
    requestVersion.current += 1;
    curl.current?.finish();
    cssAnimation.current?.cancel();
    if (currentTurn.current) finishTurn(true);
  }

  function reverseTurn() {
    const turn = currentTurn.current;
    if (!turn) return;
    if (turn.mode === "webgl") curl.current?.reverse();
    else if (turn.mode === "css") cssAnimation.current?.reverse();
    else {
      requestVersion.current += 1;
      finishTurn(false);
    }
    setStatus("Reversing the page turn.");
  }

  function cloneSpread(target: HTMLElement | null) {
    if (!spread.current || !target) return;
    const clone = spread.current.cloneNode(true) as HTMLElement;
    const sourcePages =
      spread.current.querySelectorAll<HTMLElement>(".fp-paper");
    clone.querySelectorAll<HTMLElement>(".fp-paper").forEach((page, index) => {
      page.style.order = getComputedStyle(sourcePages[index]).order;
    });
    clone
      .querySelectorAll("[id]")
      .forEach((node) => node.removeAttribute("id"));
    clone.setAttribute("aria-hidden", "true");
    clone.inert = true;
    target.replaceChildren(clone);
  }

  async function navigate(next: ReadingPosition, direction = 1, momentum = 0) {
    cancelTurn();
    if (
      next.page === position.page &&
      next.project === position.project &&
      next.chapter === position.chapter
    )
      return;
    if (reduced || !spread.current || !leaf.current) {
      setPosition(next);
      setStatus("Page changed.");
      requestAnimationFrame(() =>
        reader.current?.focus({ preventScroll: true }),
      );
      spread.current?.animate([{ opacity: 0.6 }, { opacity: 1 }], {
        duration: 10,
      });
      return;
    }
    const version = ++requestVersion.current;
    const turn: Turn = {
      from: position,
      to: next,
      direction,
      step: direction * (rtl ? -1 : 1),
      mode: "preparing",
    };
    currentTurn.current = turn;
    setTurning(true);
    let first: HTMLCanvasElement | null = null;
    if (curl.current) {
      try {
        first = await snapshotSpread(spread.current);
      } catch {
        /* The readable CSS book is the fallback. */
      }
    }
    if (version !== requestVersion.current || !spread.current || !leaf.current)
      return;
    cloneSpread(leafFront.current);
    leaf.current.style.transform = "rotateY(0deg)";
    leaf.current.style.transformOrigin =
      direction > 0 ? "left center" : "right center";
    leaf.current.style.visibility = "visible";
    flushSync(() => setPosition(next));
    reader.current?.focus({ preventScroll: true });
    // Allow the real columns to settle before capturing the back of the leaf.
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
    if (version !== requestVersion.current || !spread.current || !leaf.current)
      return;
    cloneSpread(leafBack.current);
    if (first && curl.current) {
      try {
        const second = await snapshotSpread(spread.current);
        if (version !== requestVersion.current) return;
        turn.mode = "webgl";
        curl.current.start(first, second, direction, finishTurn, momentum);
        setRenderer("webgl");
        leaf.current.style.visibility = "hidden";
        return;
      } catch {
        /* Font/image capture or WebGL can be unavailable; DOM pages remain complete. */
      }
    }
    turn.mode = "css";
    setRenderer("css");
    const animation = leaf.current.animate(
      [
        { transform: "rotateY(0deg)" },
        { transform: "rotateY(" + -direction * 180 + "deg)" },
      ],
      { duration: 500, easing: "cubic-bezier(.32,.72,0,1)", fill: "forwards" },
    );
    cssAnimation.current = animation;
    animation.onfinish = () => finishTurn(animation.playbackRate >= 0);
  }

  function turnPage(delta: number, momentum = 0) {
    const turn = currentTurn.current;
    if (turn) {
      if (delta === -turn.step) reverseTurn();
      else setStatus("This page is turning. The opposite arrow reverses it.");
      return;
    }
    const page = Math.max(0, Math.min(count - 1, position.page + delta));
    if (page !== position.page)
      void navigate({ ...position, page }, delta * (rtl ? -1 : 1), momentum);
  }

  function openBook(chapter = "all") {
    cancelTurn();
    if (!opened) {
      setFreshOpen(true);
      window.setTimeout(() => setFreshOpen(false), 1600);
    }
    setOpened(true);
    setPosition({ chapter, project: null, page: 0 });
    setStatus(
      chapter === "all"
        ? "Contents open. All 28 projects are in this book."
        : (chapters.find((item) => item.id === chapter)?.en ?? "Contents") +
            " chapter open.",
    );
    requestAnimationFrame(() => reader.current?.focus({ preventScroll: true }));
  }

  function openProject(slug: string) {
    void navigate({ ...position, project: slug, page: 0 }, rtl ? -1 : 1);
    setStatus(
      "Opening " +
        projects.find((project) => project.slug === slug)!.name +
        ".",
    );
  }

  function contents() {
    void navigate({ ...position, project: null, page: 0 }, rtl ? 1 : -1);
  }

  function resizeType(delta: number) {
    cancelTurn();
    setFontSize((current) => Math.max(14, Math.min(23, current + delta)));
    setPosition((current) => ({ ...current, page: 0 }));
    setStatus(
      "Type size changed. Both languages are being repaginated from their actual text.",
    );
  }

  function flipDirection() {
    cancelTurn();
    setRtl((value) => !value);
    setStatus(
      rtl
        ? "English on the left. Read from left to right."
        : "Arabic on the right-to-left side; English is the facing page.",
    );
  }

  function bookKeys(event: KeyboardEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("input,select,textarea")) return;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      if (!opened) {
        openBook();
        return;
      }
      turnPage((event.key === "ArrowRight" ? 1 : -1) * (rtl ? -1 : 1));
    } else if (event.key === "Home" && opened) {
      event.preventDefault();
      void navigate({ ...position, page: 0 }, -1);
    } else if (event.key === "End" && opened) {
      event.preventDefault();
      void navigate({ ...position, page: count - 1 }, 1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      if (currentTurn.current) reverseTurn();
      else if (position.project) contents();
      else {
        setOpened(false);
        setStatus("Book closed.");
      }
    }
  }

  function startSwipe(event: PointerEvent<HTMLDivElement>) {
    if (
      event.button !== 0 ||
      (event.target as HTMLElement).closest("button,a,input")
    )
      return;
    pointer.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      previousX: event.clientX,
      previousTime: event.timeStamp,
      vx: 0,
    };
  }
  function moveSwipe(event: PointerEvent<HTMLDivElement>) {
    const start = pointer.current;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    if (Math.abs(event.clientY - start.y) > Math.abs(dx) + 12) {
      pointer.current = null;
      setDrag(0);
      return;
    }
    start.vx =
      (event.clientX - start.previousX) /
      Math.max(0.008, (event.timeStamp - start.previousTime) / 1000);
    start.previousX = event.clientX;
    start.previousTime = event.timeStamp;
    setDrag(Math.max(-3, Math.min(3, dx * 0.025)));
  }
  function endSwipe(event: PointerEvent<HTMLDivElement>) {
    const start = pointer.current;
    pointer.current = null;
    setDrag(0);
    if (
      !start ||
      start.id !== event.pointerId ||
      event.type === "pointercancel"
    )
      return;
    const predicted = event.clientX - start.x + start.vx * 0.2;
    if (Math.abs(predicted) < 45) return;
    if (!opened) openBook();
    else
      turnPage(
        (predicted < 0 ? 1 : -1) * (rtl ? -1 : 1),
        Math.min(
          1.5,
          Math.abs(start.vx) / Math.max(1, reader.current?.clientWidth ?? 1),
        ),
      );
  }

  return (
    <LayoutGroup id="facing-pages">
      <main
        className="draft-facing-pages"
        onKeyDown={bookKeys}
        data-open={opened}
        data-fresh-open={freshOpen}
      >
        <title>Facing Pages — Gentrit Rashiti</title>
        <h1 className="fp-sr">Facing Pages — Gentrit Rashiti</h1>
        <a className="fp-skip" href="#fp-reader" onClick={() => openBook()}>
          Open the contents
        </a>
        <div className="fp-reader" id="fp-reader" ref={reader} tabIndex={-1}>
          <div
            className="fp-toolbar"
            aria-label="Reading controls"
            data-visible={opened}
            inert={!opened}
          >
            <button
              type="button"
              onClick={() => {
                cancelTurn();
                setOpened(false);
                setStatus("Book closed.");
              }}
            >
              Close book
            </button>
            <button type="button" onClick={() => openBook()}>
              Contents <span>28</span>
            </button>
            <div className="fp-type-controls" aria-label="Text size">
              <button
                type="button"
                aria-label="Decrease text size"
                disabled={fontSize <= 14}
                onClick={() => resizeType(-1)}
              >
                A<span>−</span>
              </button>
              <output aria-label="Current text size">{fontSize}</output>
              <button
                type="button"
                aria-label="Increase text size"
                disabled={fontSize >= 23}
                onClick={() => resizeType(1)}
              >
                A<span>+</span>
              </button>
            </div>
            <motion.button
              type="button"
              className="fp-direction"
              aria-label={
                rtl
                  ? "Arabic first. Switch to English first"
                  : "English first. Switch to Arabic first"
              }
              aria-pressed={rtl}
              onClick={flipDirection}
              whileTap={reduced ? undefined : { rotateY: -8 }}
              transition={reduced ? { duration: 0.01 } : spring.ui}
            >
              <FlipIcon />
              <span>{rtl ? "Arabic first" : "English first"}</span>
            </motion.button>
          </div>
          <motion.div
            ref={book}
            className="fp-book"
            data-rtl={rtl}
            data-renderer={reduced ? "reduced" : renderer}
            data-turning={turning}
            initial={reduced ? false : { opacity: 0, y: 28, rotateX: 9 }}
            animate={{ rotateY: reduced ? 0 : drag, opacity: 1, y: 0, rotateX: 0 }}
            transition={
              reduced
                ? { duration: 0.01 }
                : {
                    default: spring.ui,
                    opacity: { duration: 0.5, ease: ease.out },
                    y: { duration: 0.9, ease: ease.arrive },
                    rotateX: { duration: 1.1, ease: ease.arrive },
                  }
            }
            onPointerDown={startSwipe}
            onPointerMove={moveSwipe}
            onPointerUp={endSwipe}
            onPointerCancel={endSwipe}
          >
            <div className="fp-binding" aria-hidden="true">
              <span>GENTRIT RASHITI</span>
              <span>2021—2026</span>
            </div>
            <div className="fp-page-edges" aria-hidden="true" />
            <div
              className="fp-spread"
              ref={spread}
              inert={!opened}
              aria-label="English and Arabic facing pages"
            >
              {(["en", "ar"] as const).map((language) => (
                <Page
                  key={language}
                  language={language}
                  position={position}
                  fontSize={fontSize}
                  reduced={reduced}
                  mobileHidden={
                    mobile && (rtl ? language === "en" : language === "ar")
                  }
                  onMeasure={onMeasure}
                  onOpen={openProject}
                  onContents={contents}
                  onFocusPage={(page) =>
                    setPosition((current) => ({
                      ...current,
                      page: Math.min(count - 1, page),
                    }))
                  }
                />
              ))}
            </div>
            <div
              className="fp-curl-layer"
              ref={curlHost}
              data-snapshot-exclude
              aria-hidden="true"
            />
            <div className="fp-css-leaf" ref={leaf} aria-hidden="true" inert>
              <div className="fp-leaf-front" ref={leafFront} />
              <div className="fp-leaf-back" ref={leafBack} />
            </div>
            <motion.button
              type="button"
              className="fp-cover"
              onClick={() => openBook()}
              aria-label="Open Facing Pages, the 28-project contents"
              aria-hidden={opened}
              tabIndex={opened ? -1 : 0}
              animate={
                reduced
                  ? { opacity: opened ? 0 : 1, rotateY: 0 }
                  : { rotateY: opened ? -176 : 0, opacity: opened ? 0 : 1 }
              }
              transition={
                reduced
                  ? { duration: 0.01 }
                  : opened
                    ? {
                        rotateY: { duration: 1.1, ease: ease.story },
                        opacity: { delay: 1.0, duration: 0.25, ease: ease.out },
                      }
                    : {
                        rotateY: { duration: 0.85, ease: ease.story },
                        opacity: { duration: 0.01 },
                      }
              }
              onUpdate={(latest) => {
                const turn = Math.min(1, Math.abs(Number(latest.rotateY ?? 0)) / 176);
                book.current?.style.setProperty("--fp-turn", turn.toFixed(3));
              }}
              onPointerMove={(event) => {
                const box = event.currentTarget.getBoundingClientRect();
                const x = ((event.clientX - box.left) / box.width) * 100;
                event.currentTarget.style.setProperty("--fp-sheen", x.toFixed(1) + "%");
              }}
              style={{ pointerEvents: opened ? "none" : "auto" }}
            >
              <span className="fp-cover-front">
                <span className="fp-cover-edition">
                  2021—2026 <span>EN / AR</span>
                </span>
                <span className="fp-cover-title">
                  Facing
                  <br />
                  <i>pages.</i>
                </span>
                <span className="fp-cover-arabic" lang="ar" dir="rtl">
                  صفحات
                  <br />
                  متقابلة
                </span>
                <span className="fp-cover-credit">
                  Gentrit Rashiti<span>Web, mobile & full stack · Kosovo</span>
                </span>
                <span className="fp-cover-facts">
                  <span>
                    <strong>Bayyinah TV</strong>34 routes · English / Arabic
                  </span>
                  <span>
                    <strong>Read to Feed</strong>PDF, EPUB & an ISBN scanner
                  </span>
                  <span>
                    <strong>FJALË</strong>21k Albanian words
                  </span>
                </span>
                <span className="fp-open-label">
                  Open the book <Arrow />
                  <small>28 projects · 5 chapters</small>
                </span>
              </span>
              <span className="fp-cover-back" aria-hidden="true">
                <span>Facing Pages</span>
                <span lang="ar">صفحات متقابلة</span>
              </span>
            </motion.button>
            <nav className="fp-thumb-tabs" aria-label="Book chapters">
              {chapters.map((chapter) => (
                <button
                  type="button"
                  key={chapter.id}
                  style={{ "--fp-tab": chapter.color } as CSSProperties}
                  aria-pressed={opened && position.chapter === chapter.id}
                  onClick={() => openBook(chapter.id)}
                  title={
                    chapter.en + " · " + chapter.slugs.length + " projects"
                  }
                >
                  <span>{chapter.en}</span>
                  <span lang="ar" dir="rtl">
                    {chapter.ar}
                  </span>
                </button>
              ))}
            </nav>
          </motion.div>
          <div
            className="fp-reader-bottom"
            data-visible={opened}
            inert={!opened}
          >
            <div className="fp-pagination">
              <button
                type="button"
                aria-label="Previous page"
                disabled={position.page === 0 && !turning}
                onClick={() => turnPage(-1)}
              >
                <Arrow back={!rtl} />
              </button>
              <div>
                <strong>{title}</strong>
                <span>
                  Page {position.page + 1} of {count}
                </span>
              </div>
              <button
                type="button"
                aria-label="Next page"
                disabled={position.page >= count - 1 && !turning}
                onClick={() => turnPage(1)}
              >
                <Arrow back={rtl} />
              </button>
            </div>
            <div
              className="fp-progress"
              role="progressbar"
              aria-label="Reading progress"
              aria-valuemin={1}
              aria-valuemax={count}
              aria-valuenow={position.page + 1}
            >
              <motion.span
                animate={{ scaleX: (position.page + 1) / count }}
                transition={reduced ? { duration: 0.01 } : spring.ui}
              />
            </div>
            <p className="fp-reader-hint">
              {mobile
                ? "Swipe a page. Flip English / Arabic above."
                : "Arrow keys turn pages. A− / A+ reflows the text."}
            </p>
          </div>
          <footer className="fp-footer">
            <a href="/drafts">All art directions</a>
            <p role="status" aria-live="polite">
              {status}
            </p>
            <a
              href={links.cv}
              onClick={() => {
                setCvRequested(true);
                setStatus("CV requested.");
              }}
            >
              {cvRequested ? "CV requested" : "Download CV"}
            </a>
          </footer>
        </div>
      </main>
    </LayoutGroup>
  );
}
