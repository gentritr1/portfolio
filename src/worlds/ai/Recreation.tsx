import { ArrowCounterClockwiseIcon, ArrowUpIcon, FilePdfIcon } from '@phosphor-icons/react'
import { AnimatePresence, motion, useInView } from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties, type FocusEvent, type PointerEvent } from 'react'
import { cn } from '../../lib/cn'
import { duration, ease, usePrefersReducedMotion } from '../../lib/motion'

const QUESTION = 'What is the notice period in this contract?'
const ANSWER_LEAD = 'The notice period is 30 days for either party, in writing. It starts on the day the notice is received'
const CITATION = 'page 3, §4.2'

type Token = { kind: 'word'; text: string; gap: boolean } | { kind: 'cite' }

const TOKENS: Token[] = [
  ...ANSWER_LEAD.split(' ').map((text, i): Token => ({ kind: 'word', text, gap: i > 0 })),
  { kind: 'cite' },
  { kind: 'word', text: '.', gap: false },
]
const CITE_INDEX = TOKENS.findIndex((token) => token.kind === 'cite')

interface Frame {
  typed: number
  sent: boolean
  thinking: boolean
  shown: number
  cited: boolean
  /** Milliseconds to wait before this frame shows. */
  wait: number
}

function buildScript(): Frame[] {
  const empty = { typed: 0, sent: false, thinking: false, shown: 0, cited: false }
  const frames: Frame[] = [{ ...empty, wait: 0 }]
  for (let i = 1; i <= QUESTION.length; i++) frames.push({ ...empty, typed: i, wait: i === 1 ? 450 : 35 })
  frames.push({ ...empty, sent: true, wait: 380 })
  frames.push({ ...empty, sent: true, thinking: true, wait: 200 })
  for (let n = 1; n <= TOKENS.length; n++) {
    frames.push({ ...empty, sent: true, shown: n, cited: n > CITE_INDEX, wait: n === 1 ? 700 : 45 })
  }
  frames.push({ ...empty, sent: true, shown: TOKENS.length, wait: 1800 })
  return frames
}

const SCRIPT = buildScript()
const LAST = SCRIPT.length - 1

const PARAGRAPHS = [
  { clause: '4.1', lines: [100, 93, 68] },
  { clause: '4.2', lines: [100, 96, 100, 61] },
  { clause: '4.3', lines: [100, 87, 52] },
] as const
const CITED_CLAUSE = '4.2'

const palette = {
  '--paper': 'light-dark(var(--surface), color-mix(in oklab, var(--surface) 90%, var(--ink)))',
  '--desk': 'color-mix(in oklab, var(--ink) 5%, var(--surface))',
  '--bar': 'color-mix(in oklab, var(--ink) 15%, transparent)',
  '--bar-strong': 'color-mix(in oklab, var(--ink) 38%, transparent)',
  '--mark': 'color-mix(in oklab, var(--accent) 34%, transparent)',
} as CSSProperties

function DocumentPage({ lit, reduce }: { lit: boolean; reduce: boolean }) {
  return (
    <div className="flex min-h-0 items-stretch border-r border-line bg-(--desk) p-[clamp(0.625rem,2.6cqi,1.125rem)]">
      <div
        role="img"
        aria-label={
          lit
            ? 'Page 3 of 14 of contract-2026.pdf. Clause 4.2 is highlighted.'
            : 'Page 3 of 14 of contract-2026.pdf.'
        }
        className="flex w-full flex-col rounded-[6px] bg-(--paper) p-[clamp(0.75rem,3cqi,1.375rem)] shadow-float"
      >
        <span className="block h-[clamp(0.375rem,1.3cqi,0.55rem)] w-[58%] rounded-full bg-(--bar-strong)" />
        <div className="mt-[clamp(1.25rem,4cqi,1.75rem)] flex flex-col gap-[clamp(1.25rem,4.5cqi,1.75rem)]">
          {PARAGRAPHS.map(({ clause, lines }) => {
            const cited = clause === CITED_CLAUSE
            return (
              <div key={clause} className="relative grid grid-cols-[auto_minmax(0,1fr)] gap-x-[clamp(0.25rem,1.2cqi,0.5rem)]">
                {cited && (
                  <AnimatePresence>
                    {lit && (
                      <motion.span
                        key="mark"
                        className="absolute -inset-x-[3px] -inset-y-[3px] rounded-[3px] bg-(--mark)"
                        initial={reduce ? { opacity: 0 } : { opacity: 1, clipPath: 'inset(0% 100% 0% 0%)' }}
                        animate={reduce ? { opacity: 1 } : { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: reduce ? duration.hover : 0.42, ease: ease.out }}
                      />
                    )}
                  </AnimatePresence>
                )}
                {cited && (
                  <motion.span
                    className="absolute top-0 bottom-0 -left-[clamp(0.5rem,1.9cqi,0.8rem)] w-[3px] origin-top rounded-full bg-accent-ink"
                    initial={false}
                    animate={lit ? { opacity: 1, transform: 'scaleY(1)' } : { opacity: 0, transform: reduce ? 'scaleY(1)' : 'scaleY(0.4)' }}
                    transition={{ duration: duration.ui, ease: ease.out }}
                  />
                )}
                <span
                  className={cn(
                    'relative font-mono text-[clamp(0.5rem,1.5cqi,0.6875rem)] leading-none transition-colors duration-200',
                    cited && lit ? 'text-accent-ink' : 'text-muted',
                  )}
                >
                  {clause}
                </span>
                <span className="relative flex flex-col gap-[clamp(0.6rem,2cqi,0.8rem)]">
                  {lines.map((width, i) => (
                    <span key={i} className="block h-[clamp(0.3rem,1cqi,0.45rem)] rounded-full bg-(--bar)" style={{ width: `${width}%` }} />
                  ))}
                </span>
              </div>
            )
          })}
        </div>
        <span className="mt-auto pt-3 font-mono text-[clamp(0.5625rem,1.6cqi,0.75rem)] text-muted tabular">Page 3 of 14</span>
      </div>
    </div>
  )
}

function ThinkingDots({ active }: { active: boolean }) {
  return (
    <span className="inline-flex h-[1.6em] items-center gap-1" role="status" aria-label="Reading the document">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-muted"
          initial={{ opacity: 0.35 }}
          animate={active ? { opacity: [0.35, 1, 0.35] } : { opacity: 0.6 }}
          transition={active ? { duration: 1, ease: 'easeInOut', repeat: Infinity, delay: i * 0.16 } : { duration: 0 }}
        />
      ))}
    </span>
  )
}

interface CitationProps {
  lit: boolean
  pinned: boolean
  onToggle: () => void
  onPeek: (peek: boolean) => void
}

function Citation({ lit, pinned, onToggle, onPeek }: CitationProps) {
  const mousePeek = (peek: boolean) => (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'mouse') onPeek(peek)
  }
  const onFocus = (event: FocusEvent<HTMLButtonElement>) => {
    if (event.currentTarget.matches(':focus-visible')) onPeek(true)
  }
  return (
    <button
      type="button"
      aria-pressed={pinned}
      onClick={onToggle}
      onPointerEnter={mousePeek(true)}
      onPointerLeave={mousePeek(false)}
      onFocus={onFocus}
      onBlur={() => onPeek(false)}
      className={cn(
        "relative mx-[0.15em] inline-flex cursor-pointer items-center rounded-[6px] px-[0.4em] py-px align-baseline font-mono text-[0.86em] leading-snug transition-[background-color,color,transform] duration-200 ease-out before:absolute before:-inset-x-1 before:-inset-y-3 before:content-[''] active:scale-[0.97]",
        lit ? 'bg-accent text-on-accent' : 'bg-accent-soft text-accent-ink',
      )}
    >
      <span className="sr-only">Highlight </span>
      {CITATION}
    </button>
  )
}

export function Recreation() {
  const reduce = usePrefersReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const threadRef = useRef<HTMLDivElement>(null)
  const seen = useInView(rootRef, { once: true, amount: 0.35 })
  const inView = useInView(rootRef, { amount: 0.35 })
  const [step, setStep] = useState(0)
  const [pinned, setPinned] = useState(false)
  const [peek, setPeek] = useState(false)

  const playing = seen && !reduce && step < LAST
  const running = playing && inView
  const frame = reduce ? SCRIPT[LAST] : SCRIPT[step]
  const lit = frame.cited || peek || pinned

  useEffect(() => {
    if (!running) return
    const id = window.setTimeout(() => setStep((s) => Math.min(s + 1, LAST)), SCRIPT[step + 1].wait)
    return () => window.clearTimeout(id)
  }, [running, step])

  useEffect(() => {
    const thread = threadRef.current
    if (thread && thread.scrollHeight > thread.clientHeight) thread.scrollTop = thread.scrollHeight
  }, [step])

  const replay = () => {
    setPinned(false)
    setPeek(false)
    setStep(0)
  }

  const enter = reduce ? false : { opacity: 0, transform: 'translateY(8px)' }

  return (
    <div
      ref={rootRef}
      style={palette}
      className="absolute inset-0 flex flex-col text-[clamp(0.75rem,2.15cqi,0.9rem)] leading-normal text-ink"
    >
      <div className="flex items-center gap-3 border-b border-line py-[clamp(0.375rem,1.4cqi,0.625rem)] pr-[clamp(0.375rem,1.4cqi,0.75rem)] pl-[clamp(0.75rem,2.6cqi,1.125rem)]">
        <span className="grid size-9 shrink-0 place-items-center rounded-chip bg-accent-soft text-accent-ink">
          <FilePdfIcon size={19} weight="light" aria-hidden />
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate font-mono text-ink">contract-2026.pdf</span>
          <span className="mt-0.5 block truncate font-mono text-[0.85em] text-muted">Upload · Index · Ask</span>
        </span>
        <button
          type="button"
          onClick={replay}
          disabled={playing}
          className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 text-ink transition-[background-color,transform,opacity] duration-200 ease-out hover:bg-accent-soft active:scale-[0.97] disabled:cursor-default disabled:opacity-45 disabled:hover:bg-transparent"
        >
          <ArrowCounterClockwiseIcon size={16} weight="light" aria-hidden />
          Replay
        </button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <DocumentPage lit={lit} reduce={reduce} />

        <div className="flex min-h-0 flex-col">
          <div
            ref={threadRef}
            aria-busy={playing}
            className="min-h-0 flex-1 overflow-y-auto px-[clamp(0.75rem,2.6cqi,1.125rem)] py-[clamp(0.75rem,2.6cqi,1.125rem)]"
          >
            {!frame.sent && <p className="text-[0.92em] text-muted">Indexed 14 pages. Ask a question.</p>}
            <AnimatePresence initial={false}>
              {frame.sent && (
                <motion.p
                  key="question"
                  initial={enter}
                  animate={{ opacity: 1, transform: 'translateY(0px)' }}
                  exit={{ opacity: 0, transition: { duration: duration.press } }}
                  transition={{ duration: duration.ui, ease: ease.out }}
                  className="ml-auto w-fit max-w-[90%] rounded-[14px] rounded-br-[4px] bg-[color-mix(in_oklab,var(--ink)_7%,var(--surface))] px-[0.85em] py-[0.55em] text-pretty"
                >
                  {QUESTION}
                </motion.p>
              )}
              {(frame.thinking || frame.shown > 0) && (
                <motion.div
                  key="answer"
                  initial={enter}
                  animate={{ opacity: 1, transform: 'translateY(0px)' }}
                  exit={{ opacity: 0, transition: { duration: duration.press } }}
                  transition={{ duration: duration.ui, ease: ease.out }}
                  className="mt-[1.1em]"
                >
                  <span className="flex items-center gap-1.5 font-mono text-[0.8em] text-muted">
                    <span aria-hidden className="size-1.5 rounded-[2px] bg-accent" />
                    Assistant
                  </span>
                  {frame.thinking ? (
                    <ThinkingDots active={running} />
                  ) : (
                    <p className="mt-1 text-pretty">
                      {TOKENS.slice(0, frame.shown).map((token, i) =>
                        token.kind === 'cite' ? (
                          <span key={i}>
                            {' '}
                            <Citation lit={lit} pinned={pinned} onToggle={() => setPinned((p) => !p)} onPeek={setPeek} />
                          </span>
                        ) : (
                          <span key={i}>
                            {token.gap && ' '}
                            <motion.span
                              initial={reduce ? false : { opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: duration.hover, ease: ease.out }}
                            >
                              {token.text}
                            </motion.span>
                          </span>
                        ),
                      )}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div aria-hidden className="border-t border-line p-[clamp(0.5rem,1.8cqi,0.75rem)]">
            <div className="flex items-end gap-2 rounded-[14px] bg-(--desk) py-[0.4em] pr-[0.4em] pl-[0.85em] ring-1 ring-line ring-inset">
              <span className="min-h-[1.6em] min-w-0 flex-1 self-center py-[0.1em] text-pretty">
                {frame.typed > 0 ? (
                  <>
                    {QUESTION.slice(0, frame.typed)}
                    <span className="ml-px inline-block h-[1.1em] w-px translate-y-[0.2em] bg-ink" />
                  </>
                ) : (
                  <span className="text-muted">Ask about this file</span>
                )}
              </span>
              <span
                className={cn(
                  'grid size-[2em] shrink-0 place-items-center rounded-full transition-colors duration-200',
                  frame.typed > 0 ? 'bg-accent text-on-accent' : 'bg-[color-mix(in_oklab,var(--ink)_8%,transparent)] text-muted',
                )}
              >
                <ArrowUpIcon size={14} weight="regular" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
