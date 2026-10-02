import {
  ArrowRightIcon,
  CheckIcon,
  EyeIcon,
  GearSixIcon,
  PauseIcon,
  PlayIcon,
  PushPinIcon,
  SpeakerSlashIcon,
} from '@phosphor-icons/react'
import { AnimatePresence, motion, useInView } from 'motion/react'
import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import { cn } from '../../lib/cn'
import { duration, ease, usePrefersReducedMotion } from '../../lib/motion'

const css = `
.lr-screen { background: color-mix(in oklab, var(--accent) 9%, black); }
.lr-layer { position: absolute; inset: -40%; will-change: transform; }
.lr-layer-a {
  background:
    radial-gradient(38% 34% at 32% 42%, color-mix(in oklab, var(--accent) 62%, transparent), transparent 72%),
    radial-gradient(26% 30% at 62% 30%, color-mix(in oklab, var(--accent) 30%, white 6%), transparent 70%);
  animation: lr-drift-a 26s cubic-bezier(0.45, 0, 0.55, 1) infinite alternate;
}
.lr-layer-b {
  background:
    radial-gradient(34% 38% at 68% 62%, color-mix(in oklab, oklch(0.52 0.13 268) 55%, transparent), transparent 72%),
    radial-gradient(24% 22% at 40% 70%, color-mix(in oklab, var(--accent) 40%, transparent), transparent 70%);
  animation: lr-drift-b 34s cubic-bezier(0.45, 0, 0.55, 1) infinite alternate;
}
.lr-vignette { background: radial-gradient(120% 90% at 50% 45%, transparent 45%, color-mix(in oklab, black 55%, transparent)); }
@keyframes lr-drift-a {
  from { transform: translate3d(-7%, -5%, 0) rotate(0deg) scale(1); }
  to { transform: translate3d(8%, 6%, 0) rotate(14deg) scale(1.1); }
}
@keyframes lr-drift-b {
  from { transform: translate3d(6%, 4%, 0) rotate(0deg) scale(1.06); }
  to { transform: translate3d(-8%, -6%, 0) rotate(-10deg) scale(0.96); }
}
.lr-pulse { animation: lr-pulse 1.8s cubic-bezier(0.23, 1, 0.32, 1) infinite; }
@keyframes lr-pulse {
  from { transform: scale(1); opacity: 0.7; }
  to { transform: scale(2.6); opacity: 0; }
}
[data-run="false"] .lr-layer, [data-pulse="false"] .lr-pulse { animation-play-state: paused; }
[data-reduce="true"] .lr-layer, [data-reduce="true"] .lr-pulse { animation: none; }
.lr-player :focus-visible { outline-color: color-mix(in oklab, white 88%, var(--accent)); }
`

const playerInk = 'text-[color-mix(in_oklab,white_94%,var(--accent))]'
const playerMuted = 'text-[color-mix(in_oklab,white_72%,var(--accent))]'

const SESSION_SECONDS = 3600
const QUALITIES = ['Auto', '1080p', '720p', '480p'] as const
type Quality = (typeof QUALITIES)[number]

const HOST = 'lena.r'
const PINNED = 'Welcome in. Notes for tonight are under Study materials. Questions at the end.'
const MESSAGES = [
  { handle: 'mira_k', text: 'Joined from the train, the sound is clear.' },
  { handle: 'yusuf.a', text: 'Good evening, everyone.' },
  { handle: 'tomas_v', text: 'Could you show the chart from last week again?' },
  { handle: 'ana.lu', text: 'Notes are open in the other tab, thanks.' },
  { handle: 'jonah_r', text: 'First time here. Glad to join.' },
  { handle: 'sena.o', text: 'Audio dropped for a second, fine now.' },
  { handle: 'devi_p', text: 'That example made it click for me.' },
  { handle: 'karim.b', text: 'Will the replay be up tonight?' },
  { handle: 'mira_k', text: 'Saving this part for later.' },
  { handle: 'yusuf.a', text: 'Thanks for keeping it short and clear.' },
] as const
const FIRST_MESSAGES = [0, 1, 2, 3]
const ALL_MESSAGES = MESSAGES.map((_, index) => index)
const MAX_MESSAGES = 40

const PLANS = [
  { id: 'monthly', name: 'Monthly', price: '$12', note: null },
  { id: 'yearly', name: 'Yearly', price: '$99', note: 'save 30%' },
] as const

const viewersFormat = new Intl.NumberFormat('en-US')

function mulberry32(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function clock(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function tint(handle: string) {
  let sum = 0
  for (const char of handle) sum += char.charCodeAt(0)
  return [14, 24, 34][sum % 3]
}

export function Recreation() {
  const reduce = usePrefersReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const onScreen = useInView(rootRef, { amount: 0.25 })
  const running = onScreen && !reduce

  const [playing, setPlaying] = useState(true)
  const [premium, setPremium] = useState(false)
  const [viewers, setViewers] = useState(1284)
  const [elapsed, setElapsed] = useState(38 * 60 + 12)
  const randomRef = useRef(mulberry32(1284))

  const signalRuns = running && playing && !premium

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      const step = Math.round(randomRef.current() * 14) - 6
      setViewers((count) => Math.max(1100, count + step))
    }, 3000)
    return () => window.clearInterval(id)
  }, [running])

  useEffect(() => {
    if (!signalRuns) return
    const id = window.setInterval(() => setElapsed((s) => Math.min(SESSION_SECONDS, s + 1)), 1000)
    return () => window.clearInterval(id)
  }, [signalRuns])

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 grid grid-rows-[auto_minmax(0,1fr)] bg-surface lg:grid-cols-[minmax(0,1fr)_clamp(17rem,30cqi,21rem)] lg:grid-rows-1 lg:gap-3 lg:bg-[color-mix(in_oklab,var(--accent-soft)_40%,var(--surface))] lg:p-3"
    >
      <style>{css}</style>
      <div className="flex min-h-0 flex-col lg:gap-3">
        <div
          data-reduce={reduce}
          data-run={signalRuns}
          data-pulse={running}
          className="lr-player @container/player relative aspect-video w-full shrink-0 lg:rounded-[10px]"
        >
          <div aria-hidden className="lr-screen absolute inset-0 overflow-hidden rounded-[inherit]">
            <div
              className={cn(
                'absolute inset-0 transition-opacity duration-500 ease-out',
                playing && !premium ? 'opacity-100' : 'opacity-60',
              )}
            >
              <div className="lr-layer lr-layer-a" />
              <div className="lr-layer lr-layer-b" />
            </div>
            <div className="lr-vignette absolute inset-0" />
            <div className="absolute inset-x-0 top-0 h-16 bg-linear-to-b from-black/45 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/60 to-transparent" />
          </div>

          <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
            <span className="inline-flex h-6 items-center gap-1.5 rounded-md bg-accent px-2 font-mono text-[0.7rem] font-medium tracking-[0.08em] text-on-accent">
              <span aria-hidden className="relative size-1.5">
                <span className="lr-pulse absolute inset-0 rounded-full bg-on-accent" />
                <span className="absolute inset-0 rounded-full bg-on-accent" />
              </span>
              LIVE
            </span>
            <span
              className={cn(
                'inline-flex h-6 items-center gap-1.5 rounded-md bg-black/40 px-2 font-mono text-[0.72rem] tabular',
                playerInk,
              )}
            >
              <EyeIcon size={14} weight="regular" aria-hidden />
              <span>{viewersFormat.format(viewers)}</span>
              <span className={cn('hidden @md/player:inline', playerMuted)}>watching</span>
            </span>
          </div>

          <div inert={premium} className="absolute inset-x-0 bottom-0 z-10 px-2 pb-1.5 @md/player:px-3 @md/player:pb-2">
            <div aria-hidden className="mx-1 h-1 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full origin-left rounded-full bg-accent transition-transform duration-1000 ease-linear motion-reduce:transition-none"
                style={{ transform: `scaleX(${elapsed / SESSION_SECONDS})` }}
              />
            </div>
            <div className="mt-0.5 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPlaying((value) => !value)}
                aria-label={playing ? 'Pause' : 'Play'}
                className={cn(
                  'grid size-11 place-items-center rounded-full transition-[background-color,transform] duration-200 ease-out hover:bg-white/10 active:scale-[0.94]',
                  playerInk,
                )}
              >
                {playing ? <PauseIcon size={20} weight="regular" aria-hidden /> : <PlayIcon size={20} weight="regular" aria-hidden />}
              </button>
              <span className={cn('font-mono text-[0.75rem] tabular', playerInk)}>{clock(elapsed)}</span>
              <span className={cn('ml-1 hidden font-mono text-[0.75rem] @md/player:inline', playerMuted)}>
                / {clock(SESSION_SECONDS)}
              </span>
              <span className="flex-1" />
              <QualityMenu locked={premium} reduce={reduce} />
            </div>
          </div>

          <AnimatePresence>{premium && <Paywall key="paywall" reduce={reduce} />}</AnimatePresence>

          <div className="absolute top-1.5 right-1.5 z-30">
            <PremiumSwitch on={premium} onToggle={() => setPremium((value) => !value)} />
          </div>
        </div>

        <div className="hidden min-w-0 items-start gap-3 px-4 py-3 @2xl:flex lg:px-1 lg:py-0">
          <span
            aria-hidden
            className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-soft font-display text-[0.95rem] font-medium text-accent-ink"
          >
            L
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-[1.05rem] leading-snug font-medium tracking-[-0.01em] text-ink">
              Evening study circle · Session 12
            </p>
            <p className="mt-0.5 text-[0.85rem] text-muted">
              Hosted by {HOST} <span aria-hidden>·</span>{' '}
              <span className="font-mono text-[0.78rem] tabular">Started {Math.floor(elapsed / 60)} min ago</span>
            </p>
          </div>
        </div>
      </div>

      <Chat running={running} reduce={reduce} />
    </div>
  )
}

function PremiumSwitch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={cn(
        'flex min-h-11 items-center gap-2 rounded-full px-2.5 text-[0.78rem] font-medium transition-colors duration-200 ease-out hover:bg-white/10',
        playerInk,
      )}
    >
      <span>Premium</span>
      <span
        aria-hidden
        className={cn(
          'relative h-[18px] w-8 rounded-full ring-1 transition-colors duration-200 ease-out ring-inset',
          on ? 'bg-accent ring-transparent' : 'bg-black/35 ring-white/30',
        )}
      >
        <span
          className={cn(
            'absolute top-[3px] left-[3px] size-3 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out motion-reduce:transition-none',
            on && 'translate-x-3.5',
          )}
        />
      </span>
    </button>
  )
}

function QualityMenu({ locked, reduce }: { locked: boolean; reduce: boolean }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState<Quality>('Auto')
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const menuId = useId()
  const shown = open && !locked

  useEffect(() => {
    if (!shown) return
    itemRefs.current[QUALITIES.indexOf(value)]?.focus()
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (menuRef.current?.contains(target) || buttonRef.current?.contains(target)) return
      const hadFocus = menuRef.current?.contains(document.activeElement) ?? false
      setOpen(false)
      if (hadFocus) buttonRef.current?.focus()
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [shown, value])

  const close = () => {
    setOpen(false)
    buttonRef.current?.focus()
  }

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = itemRefs.current
    const current = items.findIndex((item) => item === document.activeElement)
    const last = QUALITIES.length - 1
    const move = (index: number) => {
      event.preventDefault()
      items[index]?.focus()
    }
    if (event.key === 'ArrowDown') move(current >= last ? 0 : current + 1)
    else if (event.key === 'ArrowUp') move(current <= 0 ? last : current - 1)
    else if (event.key === 'Home') move(0)
    else if (event.key === 'End') move(last)
    else if (event.key === 'Escape') {
      event.preventDefault()
      close()
    } else if (event.key === 'Tab') setOpen(false)
  }

  const onButtonKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
    }
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={shown}
        aria-controls={shown ? menuId : undefined}
        aria-label={`Quality: ${value}`}
        onClick={() => setOpen((state) => !state)}
        onKeyDown={onButtonKeyDown}
        className={cn(
          'flex min-h-11 items-center gap-1.5 rounded-full px-3 font-mono text-[0.75rem] transition-[background-color,transform] duration-200 ease-out hover:bg-white/10 active:scale-[0.97]',
          shown && 'bg-white/10',
          playerInk,
        )}
      >
        <GearSixIcon size={16} weight="regular" aria-hidden />
        {value}
      </button>
      <AnimatePresence>
        {shown && (
          <motion.div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label="Quality"
            onKeyDown={onMenuKeyDown}
            initial={reduce ? { opacity: 0 } : { opacity: 0, transform: 'scale(0.96)' }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, transform: 'scale(1)' }}
            exit={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, transform: 'scale(0.98)', transition: { duration: 0.12, ease: ease.out } }
            }
            transition={{ duration: duration.hover, ease: ease.out }}
            className="absolute top-full right-0 mt-1 w-36 origin-top-right rounded-chip bg-surface p-1 text-ink shadow-float ring-1 ring-line @md/player:top-auto @md/player:bottom-full @md/player:mt-0 @md/player:mb-1.5 @md/player:origin-bottom-right"
          >
            {QUALITIES.map((quality, index) => {
              const selected = quality === value
              return (
                <button
                  key={quality}
                  ref={(node) => {
                    itemRefs.current[index] = node
                  }}
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  tabIndex={-1}
                  onClick={() => {
                    setValue(quality)
                    close()
                  }}
                  className="flex h-11 w-full items-center justify-between rounded-[6px] px-3 text-left font-mono text-[0.8rem] tabular outline-offset-[-2px] transition-colors duration-150 ease-out hover:bg-accent-soft focus-visible:bg-accent-soft"
                >
                  {quality}
                  {selected && <CheckIcon size={16} weight="regular" aria-hidden className="text-accent-ink" />}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Paywall({ reduce }: { reduce: boolean }) {
  const [plan, setPlan] = useState<(typeof PLANS)[number]['id']>('yearly')
  const [subscribed, setSubscribed] = useState(false)
  const timerRef = useRef<number | undefined>(undefined)
  const titleId = useId()

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  const subscribe = () => {
    setSubscribed(true)
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setSubscribed(false), 2200)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: duration.hover, ease: ease.out } }}
      transition={{ duration: duration.ui, ease: ease.out }}
      className="absolute inset-0 z-20 flex flex-col overflow-hidden rounded-[inherit] bg-[color-mix(in_oklab,black_42%,transparent)] backdrop-blur-md backdrop-saturate-150 @md/player:items-center @md/player:justify-center @md/player:p-4"
    >
      <motion.section
        aria-labelledby={titleId}
        initial={reduce ? false : { opacity: 0, transform: 'translateY(8px) scale(0.98)' }}
        animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
        transition={{ duration: duration.reveal, ease: ease.out, delay: 0.04 }}
        className={cn(
          'flex h-full w-full flex-col px-3 pt-1.5 pb-3',
          playerInk,
          '@md/player:h-auto @md/player:max-w-[21rem] @md/player:rounded-panel @md/player:bg-surface @md/player:p-5 @md/player:text-ink @md/player:shadow-float',
        )}
      >
        <div className="flex min-h-11 items-center pr-28 @md/player:block @md/player:min-h-0 @md/player:pr-0">
          <p id={titleId} className="font-display text-[0.95rem] font-medium tracking-[-0.01em] @md/player:text-[1.2rem]">
            Premium episode
          </p>
          <p className="mt-1 hidden text-[0.85rem] leading-snug text-muted @md/player:block">
            This session is for members. Pick a plan to keep watching.
          </p>
        </div>

        <fieldset className="mt-auto grid grid-cols-2 gap-2 @md/player:mt-4">
          <legend className="sr-only">Plan</legend>
          {PLANS.map((option) => (
            <label
              key={option.id}
              className={cn(
                'relative flex min-h-11 cursor-pointer flex-col justify-center rounded-chip px-3 py-1.5 ring-1 transition-[background-color,box-shadow] duration-200 ease-out ring-inset has-focus-visible:outline-2 has-focus-visible:outline-offset-2',
                'ring-white/30 has-checked:bg-white/15 has-checked:ring-2 has-checked:ring-white/80',
                '@md/player:py-3 @md/player:ring-line @md/player:has-checked:bg-accent-soft @md/player:has-checked:ring-accent',
              )}
            >
              <input
                type="radio"
                name="plan"
                value={option.id}
                checked={plan === option.id}
                onChange={() => setPlan(option.id)}
                className="sr-only"
              />
              <span className="text-[0.72rem] leading-tight opacity-85 @md/player:text-[0.8rem] @md/player:text-muted @md/player:opacity-100">
                {option.name}
                {option.note && (
                  <>
                    {' '}
                    <span aria-hidden>·</span> <span className="@md/player:text-accent-ink">{option.note}</span>
                  </>
                )}
              </span>
              <span className="font-mono text-[0.9rem] leading-tight font-medium tabular @md/player:mt-1 @md/player:text-[1.15rem]">
                {option.price}
              </span>
            </label>
          ))}
        </fieldset>

        <button
          type="button"
          onClick={subscribe}
          aria-pressed={subscribed}
          className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-accent px-5 text-[0.9rem] font-medium text-on-accent shadow-float transition-[transform,background-color] duration-200 ease-out select-none hover:bg-[color-mix(in_oklab,var(--accent)_86%,var(--ink))] active:scale-[0.97] @md/player:mt-4"
        >
          {subscribed ? (
            <>
              <CheckIcon size={18} weight="regular" aria-hidden />
              Subscribed
            </>
          ) : (
            <>
              Subscribe
              <ArrowRightIcon size={18} weight="regular" aria-hidden />
            </>
          )}
        </button>
        <p aria-live="polite" className="sr-only">
          {subscribed ? 'Subscribed' : ''}
        </p>
      </motion.section>
    </motion.div>
  )
}

function Chat({ running, reduce }: { running: boolean; reduce: boolean }) {
  const [ids, setIds] = useState<number[]>(FIRST_MESSAGES)
  const [muted, setMuted] = useState<ReadonlySet<number>>(() => new Set())
  const listRef = useRef<HTMLDivElement>(null)
  const stickRef = useRef(true)
  const firstRef = useRef(true)
  const shown = reduce ? ALL_MESSAGES : ids
  const lastId = shown[shown.length - 1]

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      setIds((prev) => [...prev, prev[prev.length - 1] + 1].slice(-MAX_MESSAGES))
    }, 2000)
    return () => window.clearInterval(id)
  }, [running])

  useLayoutEffect(() => {
    const list = listRef.current
    if (!list || !stickRef.current) return
    list.scrollTo({ top: list.scrollHeight, behavior: firstRef.current || reduce ? 'auto' : 'smooth' })
    firstRef.current = false
  }, [lastId, reduce])

  const mute = (id: number) => setMuted((prev) => new Set(prev).add(id))

  return (
    <section
      aria-label="Live chat"
      className="relative z-0 flex min-h-0 flex-col border-t border-line bg-surface lg:rounded-[10px] lg:border-t-0 lg:ring-1 lg:ring-line"
    >
      <header className="flex h-10 shrink-0 items-center justify-between border-b border-line px-3 lg:h-12 lg:px-4">
        <p className="font-sans text-[0.85rem] font-medium text-ink">Live chat</p>
        <span className="font-mono text-[0.72rem] text-muted tabular">{shown.length} messages</span>
      </header>

      <div className="mx-2 mt-2 flex shrink-0 gap-2 rounded-chip bg-accent-soft px-2.5 py-2 lg:mx-3 lg:mt-3 lg:px-3">
        <PushPinIcon size={16} weight="regular" aria-hidden className="mt-0.5 shrink-0 text-accent-ink" />
        <p className="line-clamp-2 text-[0.8rem] leading-snug text-ink lg:line-clamp-3">
          <span className="sr-only">Pinned. </span>
          <span className="font-medium text-accent-ink">{HOST}</span> {PINNED}
        </p>
      </div>

      <div
        ref={listRef}
        onScroll={(event) => {
          const list = event.currentTarget
          stickRef.current = list.scrollHeight - list.scrollTop - list.clientHeight < 80
        }}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 [mask-image:linear-gradient(to_bottom,transparent,black_40px)] [scrollbar-width:thin] lg:px-1.5"
      >
        <ol aria-label="Messages" className="flex min-h-full flex-col justify-end py-2">
        {shown.map((id) => {
          const message = MESSAGES[id % MESSAGES.length]
          const fresh = !reduce && !FIRST_MESSAGES.includes(id)
          return (
            <motion.li
              key={id}
              initial={fresh ? { opacity: 0, transform: 'translateY(8px)' } : false}
              animate={{ opacity: 1, transform: 'translateY(0px)' }}
              transition={{ duration: duration.ui, ease: ease.out }}
              className="group relative rounded-chip px-2 py-1.5 transition-colors duration-150 ease-out focus-within:bg-[color-mix(in_oklab,var(--accent-soft)_45%,transparent)] hover:bg-[color-mix(in_oklab,var(--accent-soft)_45%,transparent)]"
            >
              {muted.has(id) ? (
                <p className="flex items-center gap-2 py-0.5 text-[0.78rem] text-muted italic">
                  <SpeakerSlashIcon size={14} weight="regular" aria-hidden />
                  Muted {message.handle}
                </p>
              ) : (
                <div className="flex gap-2.5 pr-9 [@media(hover:hover)]:pr-0">
                  <span
                    aria-hidden
                    style={{ background: `color-mix(in oklab, var(--accent) ${tint(message.handle)}%, var(--surface))` }}
                    className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full font-mono text-[0.68rem] text-accent-ink uppercase"
                  >
                    {message.handle[0]}
                  </span>
                  <p className="min-w-0 text-[0.82rem] leading-snug">
                    <span className="font-medium text-muted">{message.handle}</span>{' '}
                    <span className="text-[color-mix(in_oklab,var(--ink)_88%,var(--surface))]">{message.text}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => mute(id)}
                    aria-label={`Mute ${message.handle}`}
                    className="absolute top-1/2 right-1.5 inline-flex h-8 -translate-y-1/2 items-center gap-1.5 rounded-full bg-surface px-2.5 text-[0.75rem] text-muted opacity-0 ring-1 ring-line transition-[opacity,color] duration-150 ease-out ring-inset before:absolute before:-inset-1.5 before:content-[''] group-focus-within:opacity-100 group-hover:opacity-100 hover:text-ink focus-visible:opacity-100 [@media(hover:none)]:px-2 [@media(hover:none)]:opacity-70"
                  >
                    <SpeakerSlashIcon size={14} weight="regular" aria-hidden />
                    <span className="[@media(hover:none)]:sr-only">Mute</span>
                  </button>
                </div>
              )}
            </motion.li>
          )
        })}
        </ol>
      </div>
    </section>
  )
}
