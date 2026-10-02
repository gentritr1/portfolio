import {
  BarcodeIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CheckIcon,
  FireIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { cn } from "../../lib/cn";
import { duration, ease, usePrefersReducedMotion } from "../../lib/motion";

const SERIF_FONT_ID = "reader-serif-font";
const SERIF_FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400..500;1,6..72,400&display=swap";

const TOTAL_PAGES = 96;
const FLIP_SECONDS = 0.55;
const TOAST_MS = 2200;
const SCAN_MS = 600;
const SIZE_STEPS = [0.88, 1, 1.14] as const;

interface Paragraph {
  text: string;
  /** The paragraph started on the previous page, so it has no first-line indent. */
  continued?: boolean;
}

interface Passage {
  page: number;
  paragraphs: Paragraph[];
}

const passages: Passage[] = [
  {
    page: 12,
    paragraphs: [
      {
        text: "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, “and what is the use of a book,” thought Alice, “without pictures or conversations?”",
      },
      {
        text: "So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies,",
      },
    ],
  },
  {
    page: 13,
    paragraphs: [
      {
        text: "when suddenly a White Rabbit with pink eyes ran close by her.",
        continued: true,
      },
      {
        text: "There was nothing so very remarkable in that; nor did Alice think it so very much out of the way to hear the Rabbit say to itself, “Oh dear! Oh dear! I shall be late!” But when the Rabbit actually took a watch out of its waistcoat-pocket, and looked at it, and then hurried on, Alice started to her feet,",
      },
    ],
  },
  {
    page: 14,
    paragraphs: [
      {
        text: "for it flashed across her mind that she had never before seen a rabbit with either a waistcoat-pocket, or a watch to take out of it, and burning with curiosity, she ran across the field after it.",
        continued: true,
      },
      {
        text: "In another moment down went Alice after it, never once considering how in the world she was to get out again.",
      },
    ],
  },
];

/* EAN-13 for 9780141439761: guard, six left digits in L/G parity, centre guard, six right digits in R. */
const EAN_DIGITS = "9780141439761";
const L_CODES = [
  "0001101",
  "0011001",
  "0010011",
  "0111101",
  "0100011",
  "0110001",
  "0101111",
  "0111011",
  "0110111",
  "0001011",
];
const PARITY = [
  "LLLLLL",
  "LLGLGG",
  "LLGGLG",
  "LLGGGL",
  "LGLLGG",
  "LGGLLG",
  "LGGGLL",
  "LGLGLG",
  "LGLGGL",
  "LGGLGL",
];
const invert = (code: string) =>
  [...code].map((bit) => (bit === "1" ? "0" : "1")).join("");

interface Bar {
  x: number;
  width: number;
  guard: boolean;
}

function eanBars(digits: string): Bar[] {
  const first = Number(digits[0]);
  const left = [...digits.slice(1, 7)].map((d, i) => {
    const l = L_CODES[Number(d)];
    return PARITY[first][i] === "L" ? l : [...invert(l)].reverse().join("");
  });
  const right = [...digits.slice(7)].map((d) => invert(L_CODES[Number(d)]));
  const bits = ["101", ...left, "01010", ...right, "101"].join("");
  const guardRanges = [
    [0, 3],
    [45, 50],
    [92, 95],
  ];
  const result: Bar[] = [];
  let i = 0;
  while (i < bits.length) {
    if (bits[i] === "1") {
      let j = i;
      while (bits[j] === "1") j++;
      result.push({
        x: i,
        width: j - i,
        guard: guardRanges.some(([a, b]) => i >= a && i < b),
      });
      i = j;
    } else i++;
  }
  return result;
}

const bars = eanBars(EAN_DIGITS);

const tokens = {
  "--paper": "color-mix(in oklab, var(--world-bg) 80%, var(--accent-soft))",
  "--paper-ink": "color-mix(in oklab, var(--ink) 92%, var(--accent))",
  "--bezel": "color-mix(in oklab, var(--line-strong) 72%, var(--accent-soft))",
  "--sticker":
    "light-dark(var(--surface), color-mix(in oklab, var(--ink) 90%, var(--accent-soft)))",
  "--sticker-ink": "light-dark(var(--ink), var(--surface))",
  "--reader-base": "clamp(13.5px, 12px + 0.5cqi, 15.5px)",
} as CSSProperties;

const iconButton =
  "grid size-11 shrink-0 place-items-center rounded-full text-(--paper-ink) transition-[transform,background-color,opacity] duration-150 ease-out hover:bg-accent-soft active:scale-[0.97] aria-disabled:opacity-35 aria-disabled:hover:bg-transparent aria-disabled:active:scale-100";

function PageText({ passage, step }: { passage: Passage; step: number }) {
  return (
    <div className="absolute inset-0 bg-(--paper) px-[1.15rem] pt-3 pb-1">
      <div
        lang="en"
        style={{ fontSize: `calc(var(--reader-base) * ${SIZE_STEPS[step]})` }}
        className="h-full overflow-hidden font-[Newsreader,'Source_Serif_4',Georgia,serif] leading-[1.55] text-(--paper-ink) [font-optical-sizing:auto] [hyphens:auto] [mask-image:linear-gradient(to_bottom,black_calc(100%-2.2em),transparent)] [text-align:justify] [transition:font-size_200ms_var(--ease-out)]"
      >
        {passage.paragraphs.map((p) => (
          <p
            key={p.text.slice(0, 24)}
            className={cn(!p.continued && "indent-[1.4em]")}
          >
            {p.text}
          </p>
        ))}
      </div>
    </div>
  );
}

interface Flip {
  from: number;
  to: number;
  dir: "next" | "prev";
}

/*
 * The page splits at the spine. The leaf is the right half: its front shows the
 * outgoing page, its back shows the incoming page. Every layer renders the full
 * page and clips, so the text lines up across the fold.
 */
function PageLeaf({
  flip,
  step,
  onDone,
}: {
  flip: Flip;
  step: number;
  onDone: () => void;
}) {
  const next = flip.dir === "next";
  const leftUnder = passages[next ? flip.from : flip.to];
  const rightUnder = passages[next ? flip.to : flip.from];
  const front = passages[next ? flip.from : flip.to];
  const back = passages[next ? flip.to : flip.from];
  const transition = { duration: FLIP_SECONDS, ease: ease.inOut };
  return (
    <>
      <div className="absolute inset-0 [clip-path:inset(0_50%_0_0)]">
        <PageText passage={leftUnder} step={step} />
      </div>
      <div className="absolute inset-0 [clip-path:inset(0_0_0_50%)]">
        <PageText passage={rightUnder} step={step} />
      </div>
      <motion.div
        aria-hidden
        className="absolute inset-y-0 left-1/2 w-1/2 origin-left transform-3d"
        initial={{ transform: next ? "rotateY(0deg)" : "rotateY(-180deg)" }}
        animate={{ transform: next ? "rotateY(-180deg)" : "rotateY(0deg)" }}
        transition={transition}
        onAnimationComplete={onDone}
      >
        <div className="absolute inset-0 overflow-hidden backface-hidden">
          <div className="absolute inset-y-0 right-0 w-[200%]">
            <PageText passage={front} step={step} />
          </div>
          <motion.div
            className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklab,var(--ink)_26%,transparent),transparent_60%)]"
            initial={{ opacity: next ? 0 : 1 }}
            animate={{ opacity: next ? 1 : 0 }}
            transition={transition}
          />
        </div>
        <div className="absolute inset-0 overflow-hidden backface-hidden [transform:rotateY(180deg)]">
          <div className="absolute inset-y-0 left-0 w-[200%]">
            <PageText passage={back} step={step} />
          </div>
          <motion.div
            className="absolute inset-0 bg-[linear-gradient(to_left,color-mix(in_oklab,var(--ink)_22%,transparent),transparent_55%)]"
            initial={{ opacity: next ? 1 : 0 }}
            animate={{ opacity: next ? 0 : 1 }}
            transition={transition}
          />
        </div>
      </motion.div>
    </>
  );
}

function Reader() {
  const reduce = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [flip, setFlip] = useState<Flip | null>(null);
  const [step, setStep] = useState(1);
  const [toast, setToast] = useState(false);
  const flips = useRef(0);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(false), TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const shown = flip ? flip.to : index;
  const page = passages[shown].page;
  const canPrev = shown > 0;
  const canNext = shown < passages.length - 1;

  function turn(dir: "next" | "prev") {
    if (flip) return;
    const to = dir === "next" ? index + 1 : index - 1;
    if (to < 0 || to >= passages.length) return;
    if (reduce) setIndex(to);
    else setFlip({ from: index, to, dir });
    flips.current += 1;
    if (flips.current === 2) setToast(true);
  }

  function finishFlip() {
    if (!flip) return;
    setIndex(flip.to);
    setFlip(null);
  }

  function onPageKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      turn("next");
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      turn("prev");
    }
  }

  function onPageClick(event: MouseEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    turn(event.clientX - box.left < box.width / 2 ? "prev" : "next");
  }

  return (
    <div className="relative flex min-h-0 w-[82cqi] flex-1 flex-col rounded-[30px] bg-(--bezel) p-[7px] shadow-float ring-1 ring-line-strong ring-inset @lg:h-[82cqi] @lg:w-[50cqi] @lg:flex-none">
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[23px] bg-(--paper)">
        <header className="px-[1.15rem] pt-3.5 pb-1 font-mono text-[0.6875rem] leading-tight text-muted">
          <span className="block truncate">
            Chapter I · Down the Rabbit-Hole
          </span>
        </header>

        <div
          role="region"
          aria-roledescription="page"
          aria-label={`Page ${page} of ${TOTAL_PAGES}. Use the left and right arrow keys to turn the page.`}
          aria-keyshortcuts="ArrowLeft ArrowRight"
          tabIndex={0}
          onKeyDown={onPageKey}
          onClick={onPageClick}
          className="relative min-h-0 flex-1 cursor-pointer overflow-hidden select-none [perspective:1100px] focus-visible:outline-offset-[-3px]"
        >
          {flip ? (
            <PageLeaf flip={flip} step={step} onDone={finishFlip} />
          ) : reduce ? (
            <AnimatePresence initial={false}>
              <motion.div
                key={index}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: duration.hover, ease: ease.out }}
              >
                <PageText passage={passages[index]} step={step} />
              </motion.div>
            </AnimatePresence>
          ) : (
            <PageText passage={passages[index]} step={step} />
          )}
        </div>

        <div className="flex items-center gap-3 px-[1.15rem] pt-2 pb-1">
          <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-line">
            <div
              className="h-full origin-left rounded-full bg-accent transition-transform duration-[550ms] ease-in-out motion-reduce:transition-none"
              style={{ transform: `scaleX(${page / TOTAL_PAGES})` }}
            />
          </div>
          <p
            aria-live="polite"
            className="tabular font-mono text-[0.6875rem] text-muted"
          >
            <span className="sr-only">Page </span>
            {page} / {TOTAL_PAGES}
          </p>
        </div>

        <div className="flex items-center justify-between px-1.5 pb-1.5">
          <button
            type="button"
            aria-label="Previous page"
            aria-disabled={!canPrev}
            onClick={() => turn("prev")}
            className={iconButton}
          >
            <CaretLeftIcon size={18} weight="regular" aria-hidden />
          </button>
          <div
            className="flex items-center"
            role="group"
            aria-label="Text size"
          >
            <button
              type="button"
              aria-label="Smaller text"
              aria-disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className={cn(
                iconButton,
                "font-[Newsreader,Georgia,serif] text-[0.95rem]",
              )}
            >
              <span aria-hidden>A−</span>
            </button>
            <span aria-hidden className="flex h-3 items-end gap-[3px] px-0.5">
              {SIZE_STEPS.map((size, i) => (
                <span
                  key={size}
                  className={cn(
                    "w-[3px] rounded-full transition-colors duration-200",
                    i <= step ? "bg-accent" : "bg-line-strong",
                  )}
                  style={{ height: `${6 + i * 3}px` }}
                />
              ))}
            </span>
            <button
              type="button"
              aria-label="Larger text"
              aria-disabled={step === SIZE_STEPS.length - 1}
              onClick={() =>
                setStep((s) => Math.min(SIZE_STEPS.length - 1, s + 1))
              }
              className={cn(
                iconButton,
                "font-[Newsreader,Georgia,serif] text-[1.2rem]",
              )}
            >
              <span aria-hidden>A+</span>
            </button>
          </div>
          <button
            type="button"
            aria-label="Next page"
            aria-disabled={!canNext}
            onClick={() => turn("next")}
            className={iconButton}
          >
            <CaretRightIcon size={18} weight="regular" aria-hidden />
          </button>
        </div>

        <div
          role="status"
          className="pointer-events-none absolute inset-x-3 bottom-3 flex justify-center"
        >
          <AnimatePresence>
            {toast && (
              <motion.div
                className="flex items-center gap-2 rounded-full bg-accent-soft py-2 pr-4 pl-3 text-[0.8125rem] font-medium text-accent-ink shadow-float"
                initial={
                  reduce
                    ? { opacity: 0 }
                    : { opacity: 0, transform: "translateY(140%)" }
                }
                animate={
                  reduce
                    ? { opacity: 1 }
                    : { opacity: 1, transform: "translateY(0%)" }
                }
                exit={
                  reduce
                    ? { opacity: 0 }
                    : { opacity: 0, transform: "translateY(140%)" }
                }
                transition={{
                  duration: reduce ? duration.hover : duration.world,
                  ease: ease.drawer,
                }}
              >
                <FireIcon size={18} weight="regular" aria-hidden />
                <span>Streak · 7 days</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Barcode({ active, fast }: { active: boolean; fast: boolean }) {
  return (
    <div className="relative flex h-full min-h-0 flex-col items-center justify-center overflow-hidden rounded-chip bg-(--sticker) px-2.5 py-2.5 ring-1 ring-line ring-inset">
      <svg
        viewBox="-6 0 107 52"
        preserveAspectRatio="none"
        aria-hidden
        className="min-h-0 w-full flex-1 text-(--sticker-ink)"
      >
        {bars.map((bar) => (
          <rect
            key={bar.x}
            x={bar.x}
            y={0}
            width={bar.width}
            height={bar.guard ? 52 : 46}
            fill="currentColor"
          />
        ))}
      </svg>
      <span className="tabular mt-1 font-mono text-[0.625rem] leading-none tracking-[0.04em] whitespace-nowrap text-(--sticker-ink) @lg:tracking-[0.12em]">
        9 780141 439761
      </span>
      <AnimatePresence>
        {active && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0, transform: "translateY(-100%)" }}
            animate={{
              opacity: 1,
              transform: ["translateY(-100%)", "translateY(0%)"],
            }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: duration.hover },
              transform: {
                duration: fast ? 0.3 : 1.2,
                ease: ease.inOut,
                repeat: Infinity,
                repeatType: "reverse",
              },
            }}
          >
            <div className="h-full border-b-2 border-accent bg-[linear-gradient(to_bottom,transparent_62%,color-mix(in_oklab,var(--accent)_24%,transparent))]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type ScanStatus = "idle" | "reading" | "done";

function ScanCard() {
  const reduce = usePrefersReducedMotion();
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [shelved, setShelved] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function scan() {
    if (status !== "idle") return;
    setStatus("reading");
    timer.current = window.setTimeout(() => setStatus("done"), SCAN_MS);
  }

  const sweeping = !reduce && (hovered || focused || status === "reading");
  const swap = { duration: duration.ui, ease: ease.out };

  return (
    <section
      aria-label="Scan a book"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
      className="h-[9.5rem] w-[82cqi] shrink-0 rounded-panel bg-surface p-3 shadow-float ring-1 ring-line ring-inset @lg:h-auto @lg:w-[34cqi] @lg:p-4"
    >
      <AnimatePresence mode="wait" initial={false}>
        {status !== "done" ? (
          <motion.div
            key="scan"
            className="grid h-full grid-cols-[minmax(0,1fr)_minmax(0,1fr)] grid-rows-[auto_1fr_auto] gap-x-3 gap-y-2 @lg:grid-cols-1 @lg:grid-rows-[auto_7.5rem_auto] @lg:gap-y-3.5"
            exit={{ opacity: 0 }}
            transition={swap}
          >
            <div className="col-start-2 row-start-1 @lg:col-start-1">
              <h3 className="font-sans text-[0.9375rem] leading-snug font-medium text-ink">
                Scan a book
              </h3>
              <p className="mt-0.5 font-mono text-[0.6875rem] leading-snug text-muted">
                {status === "reading"
                  ? "Reading the barcode…"
                  : "EAN-13 · ISBN"}
              </p>
            </div>
            <div className="col-start-1 row-span-3 row-start-1 min-h-0 @lg:row-span-1 @lg:row-start-2">
              <Barcode active={sweeping} fast={status === "reading"} />
            </div>
            <button
              type="button"
              onClick={scan}
              aria-busy={status === "reading"}
              className="col-start-2 row-start-3 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-accent px-4 text-[0.875rem] font-medium text-on-accent transition-[transform,background-color] duration-150 ease-out hover:bg-[color-mix(in_oklab,var(--accent)_86%,var(--ink))] active:scale-[0.97] @lg:col-start-1"
            >
              <BarcodeIcon size={18} weight="regular" aria-hidden />
              {status === "reading" ? "Reading" : "Scan"}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            className="flex h-full flex-col gap-2.5 @lg:gap-3.5"
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={swap}
          >
            <div className="hidden @lg:block">
              <h3 className="font-sans text-[0.9375rem] leading-snug font-medium text-ink">
                Scan a book
              </h3>
              <p
                role="status"
                className="mt-0.5 font-mono text-[0.6875rem] leading-snug text-muted"
              >
                Found by ISBN
              </p>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-2 @lg:h-[7.5rem] @lg:flex-none">
              <div className="flex min-h-0 items-start gap-3">
                <div
                  aria-hidden
                  className="relative h-[3.6rem] w-10 shrink-0 overflow-hidden rounded-[5px] bg-accent shadow-float @lg:h-[4.75rem] @lg:w-[3.25rem]"
                >
                  <span className="absolute inset-y-0 left-[5px] w-px bg-[color-mix(in_oklab,var(--on-accent)_22%,transparent)]" />
                  <span className="absolute inset-x-[22%] top-[24%] h-[2px] rounded-full bg-[color-mix(in_oklab,var(--on-accent)_40%,transparent)]" />
                  <span className="absolute inset-x-[30%] top-[34%] h-[2px] rounded-full bg-[color-mix(in_oklab,var(--on-accent)_28%,transparent)]" />
                </div>
                <div className="min-w-0">
                  <p className="font-[Newsreader,Georgia,serif] text-[0.98rem] leading-[1.2] font-medium text-ink">
                    Alice's Adventures in Wonderland
                  </p>
                  <p className="mt-0.5 text-[0.8125rem] leading-snug text-muted">
                    Lewis Carroll
                  </p>
                  <p className="tabular mt-0.5 font-mono text-[0.6875rem] leading-snug text-muted @lg:hidden">
                    ISBN 978-0-14-143976-1
                  </p>
                </div>
              </div>
              <p className="tabular hidden font-mono text-[0.6875rem] leading-snug whitespace-nowrap text-muted @lg:block">
                ISBN 978-0-14-143976-1
              </p>
            </div>
            <button
              type="button"
              aria-pressed={shelved}
              onClick={() => setShelved((s) => !s)}
              className={cn(
                "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full px-4 text-[0.875rem] font-medium ring-1 ring-inset transition-[transform,background-color,color,box-shadow] duration-150 ease-out active:scale-[0.97]",
                shelved
                  ? "bg-accent-soft text-accent-ink ring-transparent"
                  : "text-ink ring-line-strong hover:bg-accent-soft hover:ring-transparent",
              )}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={shelved ? "on" : "add"}
                  className="inline-flex items-center gap-2"
                  initial={{
                    opacity: 0,
                    transform: reduce ? "scale(1)" : "scale(0.92)",
                  }}
                  animate={{ opacity: 1, transform: "scale(1)" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: duration.hover, ease: ease.out }}
                >
                  {shelved ? (
                    <CheckIcon size={18} weight="regular" aria-hidden />
                  ) : (
                    <PlusIcon size={18} weight="regular" aria-hidden />
                  )}
                  {shelved ? "On shelf" : "Add to shelf"}
                </motion.span>
              </AnimatePresence>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export function Recreation() {
  useEffect(() => {
    if (document.getElementById(SERIF_FONT_ID)) return;
    const link = document.createElement("link");
    link.id = SERIF_FONT_ID;
    link.rel = "stylesheet";
    link.href = SERIF_FONT_HREF;
    document.head.appendChild(link);
  }, []);

  return (
    <div
      style={tokens}
      className="absolute inset-0 flex flex-col items-center gap-3 bg-[color-mix(in_oklab,var(--accent-soft)_35%,var(--surface))] p-4 @lg:flex-row @lg:justify-center @lg:gap-[4cqi]"
    >
      <Reader />
      <ScanCard />
    </div>
  );
}
