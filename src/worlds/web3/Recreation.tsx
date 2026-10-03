import {
  ArrowCounterClockwiseIcon,
  ArrowsDownUpIcon,
  CheckIcon,
  CopyIcon,
  FingerprintIcon,
  GasPumpIcon,
  LockSimpleIcon,
  PaperPlaneTiltIcon,
  QrCodeIcon,
  StackIcon,
} from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { Button } from '../../components/Button'
import { cn } from '../../lib/cn'
import { duration, ease, usePrefersReducedMotion } from '../../lib/motion'

const ADDRESS = '0x7a3Fe2B94c0D158a6F03b7E1c9A2d48F5e609c21'
const ADDRESS_SHORT = `${ADDRESS.slice(0, 6)}…${ADDRESS.slice(-4)}`
const ADDRESS_GROUPS = ADDRESS.slice(2).match(/.{4}/g) ?? []
const QR_TEXT = 'gentrit.portfolio'

/* ---------- QR code: version 1, error correction L, byte mode ---------- */

const QR_SIZE = 21
const QR_DATA_CODEWORDS = 19
const QR_EC_CODEWORDS = 7

type Put = (x: number, y: number, dark: boolean) => void

function gfMultiply(x: number, y: number): number {
  let z = 0
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d)
    z ^= ((y >>> i) & 1) * x
  }
  return z
}

function reedSolomon(data: number[], degree: number): number[] {
  const divisor = new Array<number>(degree).fill(0)
  divisor[degree - 1] = 1
  let root = 1
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) {
      divisor[j] = gfMultiply(divisor[j], root)
      if (j + 1 < degree) divisor[j] ^= divisor[j + 1]
    }
    root = gfMultiply(root, 0x02)
  }
  const remainder = new Array<number>(degree).fill(0)
  for (const byte of data) {
    const factor = byte ^ (remainder.shift() ?? 0)
    remainder.push(0)
    divisor.forEach((coefficient, i) => {
      remainder[i] ^= gfMultiply(coefficient, factor)
    })
  }
  return remainder
}

const QR_MASKS: Array<(x: number, y: number) => boolean> = [
  (x, y) => (x + y) % 2 === 0,
  (_x, y) => y % 2 === 0,
  (x) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
]

function drawFormatBits(put: Put, mask: number) {
  const data = (0b01 << 3) | mask
  let rem = data
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537)
  const bits = ((data << 10) | rem) ^ 0x5412
  const bit = (i: number) => ((bits >>> i) & 1) === 1
  for (let i = 0; i <= 5; i++) put(8, i, bit(i))
  put(8, 7, bit(6))
  put(8, 8, bit(7))
  put(7, 8, bit(8))
  for (let i = 9; i < 15; i++) put(14 - i, 8, bit(i))
  for (let i = 0; i < 8; i++) put(QR_SIZE - 1 - i, 8, bit(i))
  for (let i = 8; i < 15; i++) put(8, QR_SIZE - 15 + i, bit(i))
  put(8, QR_SIZE - 8, true)
}

function qrPenalty(grid: boolean[][]): number {
  const size = grid.length
  const columns = grid.map((_, x) => grid.map((row) => row[x]))
  let score = 0
  for (const line of [...grid, ...columns]) {
    let run = 1
    for (let i = 1; i <= size; i++) {
      if (i < size && line[i] === line[i - 1]) {
        run++
      } else {
        if (run >= 5) score += run - 2
        run = 1
      }
    }
    const text = line.map((dark) => (dark ? '1' : '0')).join('')
    for (const pattern of ['10111010000', '00001011101']) {
      for (let at = text.indexOf(pattern); at !== -1; at = text.indexOf(pattern, at + 1)) score += 40
    }
  }
  let dark = 0
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (grid[y][x]) dark++
      if (x < size - 1 && y < size - 1) {
        const c = grid[y][x]
        if (grid[y][x + 1] === c && grid[y + 1][x] === c && grid[y + 1][x + 1] === c) score += 3
      }
    }
  }
  return score + Math.floor(Math.abs((dark * 100) / (size * size) - 50) / 5) * 10
}

function encodeQr(text: string, forcedMask?: number): boolean[][] {
  const bytes = Array.from(new TextEncoder().encode(text))
  if (bytes.length > QR_DATA_CODEWORDS - 2) throw new Error('Version 1-L holds 17 bytes')

  const bits: number[] = []
  const push = (value: number, length: number) => {
    for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1)
  }
  push(0b0100, 4)
  push(bytes.length, 8)
  for (const byte of bytes) push(byte, 8)
  const capacity = QR_DATA_CODEWORDS * 8
  push(0, Math.min(4, capacity - bits.length))
  push(0, (8 - (bits.length % 8)) % 8)
  for (let pad = 0xec; bits.length < capacity; pad ^= 0xec ^ 0x11) push(pad, 8)

  const data: number[] = []
  for (let i = 0; i < bits.length; i += 8) data.push(bits.slice(i, i + 8).reduce((acc, b) => (acc << 1) | b, 0))
  const codewords = [...data, ...reedSolomon(data, QR_EC_CODEWORDS)]

  const modules = Array.from({ length: QR_SIZE }, () => new Array<boolean>(QR_SIZE).fill(false))
  const reserved = Array.from({ length: QR_SIZE }, () => new Array<boolean>(QR_SIZE).fill(false))
  const put: Put = (x, y, dark) => {
    modules[y][x] = dark
    reserved[y][x] = true
  }

  for (let i = 0; i < QR_SIZE; i++) {
    put(6, i, i % 2 === 0)
    put(i, 6, i % 2 === 0)
  }
  for (const [cx, cy] of [
    [3, 3],
    [QR_SIZE - 4, 3],
    [3, QR_SIZE - 4],
  ]) {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const x = cx + dx
        const y = cy + dy
        if (x < 0 || y < 0 || x >= QR_SIZE || y >= QR_SIZE) continue
        const ring = Math.max(Math.abs(dx), Math.abs(dy))
        put(x, y, ring !== 2 && ring !== 4)
      }
    }
  }
  drawFormatBits(put, 0)

  let i = 0
  for (let right = QR_SIZE - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5
    const upward = ((right + 1) & 2) === 0
    for (let vert = 0; vert < QR_SIZE; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j
        const y = upward ? QR_SIZE - 1 - vert : vert
        if (reserved[y][x] || i >= codewords.length * 8) continue
        modules[y][x] = ((codewords[i >>> 3] >>> (7 - (i & 7))) & 1) === 1
        i++
      }
    }
  }

  let best = modules
  let bestScore = Infinity
  for (let mask = 0; mask < QR_MASKS.length; mask++) {
    if (forcedMask !== undefined && mask !== forcedMask) continue
    const candidate = modules.map((row, y) => row.map((dark, x) => (reserved[y][x] ? dark : dark !== QR_MASKS[mask](x, y))))
    drawFormatBits((x, y, dark) => {
      candidate[y][x] = dark
    }, mask)
    const score = qrPenalty(candidate)
    if (score < bestScore) {
      best = candidate
      bestScore = score
    }
  }
  return best
}

const QR_PATH = encodeQr(QR_TEXT)
  .flatMap((row, y) => row.map((dark, x) => (dark ? `M${x} ${y}h1v1h-1z` : '')))
  .join('')

/* ---------- Identicon: 5 by 5, mirrored, seeded ---------- */

const IDENTICON_TONES = [
  'var(--accent)',
  'color-mix(in oklab, var(--accent) 55%, var(--ink))',
  'color-mix(in oklab, var(--accent) 50%, var(--canvas))',
]

function identiconCells(seed: string) {
  let h = 0x811c9dc5
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 0x01000193) >>> 0
  const next = () => {
    h ^= h << 13
    h >>>= 0
    h ^= h >>> 17
    h ^= h << 5
    h >>>= 0
    return h
  }
  const cells: Array<{ x: number; y: number; tone: number }> = []
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 3; x++) {
      const r = next()
      if (r % 5 < 2) continue
      const tone = (r >>> 8) % IDENTICON_TONES.length
      cells.push({ x, y, tone })
      if (x < 2) cells.push({ x: 4 - x, y, tone })
    }
  }
  return cells
}

const IDENTICON = identiconCells(ADDRESS)

function Identicon() {
  return (
    <span
      aria-hidden
      className="grid size-9 shrink-0 place-items-center rounded-[10px]"
      style={{ background: 'color-mix(in oklab, var(--accent) 16%, var(--canvas))' }}
    >
      <svg viewBox="0 0 5 5" className="size-6" shapeRendering="crispEdges">
        {IDENTICON.map(({ x, y, tone }) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} style={{ fill: IDENTICON_TONES[tone] }} />
        ))}
      </svg>
    </span>
  )
}

/* ---------- Wallet card ---------- */

/*
 * The card keeps a dark scheme in both page themes. The neutral tokens are
 * light-dark() pairs, so they resolve dark inside it. The registered accent
 * tokens resolve on the section, so the card derives its own soft and ink
 * shades.
 */
const cardScheme = {
  colorScheme: 'dark',
  '--accent-soft': 'color-mix(in oklab, var(--accent) 24%, var(--canvas))',
  '--accent-ink': 'color-mix(in oklab, var(--accent) 55%, var(--ink))',
} as CSSProperties

const shellStyle: CSSProperties = {
  background: 'color-mix(in oklab, var(--accent) 12%, var(--canvas))',
  boxShadow:
    'inset 0 0 0 1px color-mix(in oklab, var(--accent) 42%, transparent), 0 2px 4px color-mix(in oklab, var(--canvas) 30%, transparent), 0 28px 56px -28px color-mix(in oklab, var(--canvas) 85%, transparent)',
}

const coreStyle: CSSProperties = {
  background:
    'linear-gradient(158deg, color-mix(in oklab, var(--accent) 22%, var(--surface)) 0%, var(--surface) 42%, var(--canvas) 100%)',
  boxShadow:
    'inset 0 1px 0 color-mix(in oklab, var(--ink) 12%, transparent), inset 0 0 0 1px color-mix(in oklab, var(--ink) 7%, transparent)',
}

const faceStyle: CSSProperties = { backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }

function Bezel({ children }: { children: ReactNode }) {
  return (
    <div className="h-full rounded-[22px] p-1.5" style={shellStyle}>
      <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[16px] p-4 @sm:p-5" style={coreStyle}>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-8 top-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, var(--accent), transparent)' }}
        />
        {children}
      </div>
    </div>
  )
}

function CardChip({ icon, children, accent }: { icon: ReactNode; children: ReactNode; accent?: boolean }) {
  return (
    <li
      className={cn(
        'inline-flex items-center gap-1.5 rounded-chip px-2 py-1 font-mono text-[0.7rem] leading-snug tabular',
        accent ? 'bg-accent-soft text-accent-ink' : 'text-muted',
      )}
      style={accent ? undefined : { boxShadow: 'inset 0 0 0 1px color-mix(in oklab, var(--ink) 14%, transparent)' }}
    >
      {icon}
      {children}
    </li>
  )
}

/** Two labels share one grid cell, so the swap never changes the width. */
function SwapLabel({ show, base, alt }: { show: boolean; base: ReactNode; alt: ReactNode }) {
  return (
    <span className="grid">
      <span className={cn('[grid-area:1/1] transition-opacity duration-200 ease-out', show && 'opacity-0')}>{base}</span>
      <span aria-hidden={!show} className={cn('[grid-area:1/1] transition-opacity duration-200 ease-out', !show && 'opacity-0')}>
        {alt}
      </span>
    </span>
  )
}

type Notice = 'copied' | 'blocked' | 'send' | null

const NOTICE_TEXT: Record<Exclude<Notice, null>, string> = {
  copied: 'Address copied',
  blocked: 'Copy is blocked in this browser',
  send: 'Sending is off in this demo',
}

function WalletCard({ demoStep }: { demoStep?: number }) {
  const reduce = usePrefersReducedMotion()
  const [selectedFlipped, setFlipped] = useState(false)
  const flipped = demoStep === undefined ? selectedFlipped : demoStep === 1
  const [notice, setNotice] = useState<Notice>(null)
  const noticeTimer = useRef<number | undefined>(undefined)
  const frontRef = useRef<HTMLDivElement>(null)
  const backRef = useRef<HTMLDivElement>(null)

  useEffect(() => () => window.clearTimeout(noticeTimer.current), [])

  const flash = (next: Notice) => {
    window.clearTimeout(noticeTimer.current)
    setNotice(next)
    noticeTimer.current = window.setTimeout(() => setNotice(null), 1500)
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ADDRESS)
      flash('copied')
    } catch {
      flash('blocked')
    }
  }

  const flip = (next: boolean) => {
    flushSync(() => setFlipped(next))
    const face = next ? backRef.current : frontRef.current
    face?.querySelector<HTMLButtonElement>('[data-flip]')?.focus({ preventScroll: true })
  }

  const onBackKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') flip(false)
  }

  return (
    <div className="w-full max-w-[440px]" style={{ ...cardScheme, perspective: '1400px' }}>
      <p className="sr-only" aria-live="polite">
        {notice ? NOTICE_TEXT[notice] : ''}
      </p>
      <motion.div
        className="grid @3xl:aspect-[3/2]"
        style={{ transformStyle: 'preserve-3d' }}
        initial={false}
        animate={{ transform: !reduce && flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        transition={{ duration: 0.6, ease: ease.drawer }}
      >
        <motion.div
          ref={frontRef}
          inert={flipped}
          className="[grid-area:1/1]"
          style={faceStyle}
          initial={false}
          animate={{ opacity: reduce && flipped ? 0 : 1 }}
          transition={{ duration: duration.ui, ease: ease.out }}
        >
          <Bezel>
            <div className="flex items-center gap-2.5">
              <Identicon />
              <button
                type="button"
                onClick={copy}
                aria-label={`Copy address ${ADDRESS_SHORT}`}
                className="-my-1 inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 font-mono text-[0.8rem] text-ink transition-colors duration-200 ease-out hover:bg-[color-mix(in_oklab,var(--ink)_8%,transparent)]"
              >
                <SwapLabel
                  show={notice === 'copied' || notice === 'blocked'}
                  base={ADDRESS_SHORT}
                  alt={<span className="text-accent-ink">{notice === 'blocked' ? 'Blocked' : 'Copied'}</span>}
                />
                {notice === 'copied' ? (
                  <CheckIcon size={15} weight="regular" aria-hidden className="text-accent-ink" />
                ) : (
                  <CopyIcon size={15} weight="light" aria-hidden className="text-muted" />
                )}
              </button>
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-accent-soft py-1 pr-2.5 pl-2 font-mono text-[0.7rem] text-accent-ink">
                <span aria-hidden className="size-1.5 rounded-full bg-accent" />
                Testnet
              </span>
            </div>

            <div className="py-3 @3xl:py-0">
              <p className="flex items-baseline gap-2 font-display font-semibold text-ink tabular">
                <span className="text-[clamp(1.875rem,1.3rem+2.4cqi,2.5rem)] leading-none tracking-[-0.03em]">12,480.00</span>
                <span className="text-[0.95rem] font-medium tracking-[-0.01em] text-muted">INC</span>
              </p>
              <p className="mt-1.5 font-mono text-[0.8rem] text-muted tabular">≈ $3,210.40</p>
              <ul className="mt-3.5 flex flex-wrap gap-1 @3xl:mt-4" aria-label="Wallet stats">
                <CardChip accent icon={<GasPumpIcon size={13} weight="light" aria-hidden />}>
                  Gas saved · 0.42
                </CardChip>
                <CardChip icon={<ArrowsDownUpIcon size={13} weight="light" aria-hidden />}>42 transactions</CardChip>
                <CardChip icon={<StackIcon size={13} weight="light" aria-hidden />}>3 assets</CardChip>
              </ul>
            </div>

            <div className="flex items-center gap-2">
              <Button data-flip icon={QrCodeIcon} onClick={() => flip(true)}>
                Receive
              </Button>
              <Button variant="quiet" icon={PaperPlaneTiltIcon} onClick={() => flash('send')}>
                <SwapLabel show={notice === 'send'} base="Send" alt="Demo only" />
              </Button>
            </div>
          </Bezel>
        </motion.div>

        <motion.div
          ref={backRef}
          inert={!flipped}
          onKeyDown={onBackKey}
          className="[grid-area:1/1]"
          style={{ ...faceStyle, transform: reduce ? 'none' : 'rotateY(180deg)' }}
          initial={false}
          animate={{ opacity: reduce && !flipped ? 0 : 1 }}
          transition={{ duration: duration.ui, ease: ease.out }}
        >
          <Bezel>
            <div className="flex h-full items-center gap-4 @sm:gap-5">
              <div className="w-[7.25rem] shrink-0 @md:w-[9.5rem]">
                <svg
                  viewBox="-3 -3 27 27"
                  role="img"
                  aria-label={`QR code for ${QR_TEXT}`}
                  shapeRendering="crispEdges"
                  className="block w-full rounded-[10px]"
                  style={{ background: 'var(--ink)' }}
                >
                  <path d={QR_PATH} style={{ fill: 'var(--canvas)' }} />
                </svg>
                <p className="mt-2 text-center font-mono text-[0.6875rem] text-muted">{QR_TEXT}</p>
              </div>
              <div className="flex min-w-0 flex-1 flex-col self-stretch">
                <p className="font-display text-[1.05rem] font-semibold tracking-[-0.015em] text-ink">Receive INC</p>
                <p className="mt-0.5 text-[0.8rem] text-muted">Testnet address</p>
                <p
                  aria-label={ADDRESS}
                  className="mt-3 flex flex-wrap gap-x-1.5 gap-y-0.5 font-mono text-[0.72rem] leading-relaxed text-ink"
                >
                  {ADDRESS_GROUPS.map((group, index) => (
                    <span key={group} aria-hidden className={cn(index === 0 && 'text-accent-ink')}>
                      {index === 0 ? `0x${group}` : group}
                    </span>
                  ))}
                </p>
                <div className="mt-auto pt-3">
                  <Button data-flip variant="quiet" onClick={() => flip(false)}>
                    Done
                  </Button>
                </div>
              </div>
            </div>
          </Bezel>
        </motion.div>
      </motion.div>
    </div>
  )
}

/* ---------- Passkey sign-in ---------- */

type Step = 'idle' | 'touch' | 'verified' | 'welcome'

const STEP_COPY: Record<Step, { title: string; detail: string }> = {
  idle: { title: 'Signed out', detail: 'Use the passkey on this device' },
  touch: { title: 'Touch sensor', detail: 'Hold a finger on the sensor' },
  verified: { title: 'Verified', detail: 'Passkey matched' },
  welcome: { title: 'Welcome, Gentrit', detail: 'Signed in with passkey' },
}

const STEP_INDEX: Record<Step, number> = { idle: 0, touch: 1, verified: 2, welcome: 3 }

function StepGlyph({ step }: { step: Step }) {
  if (step === 'welcome') {
    return (
      <span className="grid size-8 place-items-center rounded-full bg-accent font-display text-[0.9rem] font-semibold text-on-accent">
        G
      </span>
    )
  }
  if (step === 'verified') return <CheckIcon size={22} weight="regular" />
  if (step === 'touch') return <FingerprintIcon size={24} weight="light" />
  return <LockSimpleIcon size={20} weight="light" className="text-muted" />
}

function PasskeyCard({ demoStep }: { demoStep?: number }) {
  const reduce = usePrefersReducedMotion()
  const [selectedStep, setStep] = useState<Step>('idle')
  const step: Step = demoStep === undefined ? selectedStep : demoStep === 2 ? 'touch' : demoStep === 3 ? 'welcome' : 'idle'
  const timers = useRef<number[]>([])
  const rootRef = useRef<HTMLDivElement>(null)

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id))
    timers.current = []
  }
  useEffect(() => clearTimers, [])

  const running = step === 'touch' || step === 'verified'

  const focusAction = () =>
    rootRef.current?.querySelector<HTMLButtonElement>('[data-passkey-action]')?.focus({ preventScroll: true })

  const start = () => {
    if (step !== 'idle') return
    setStep('touch')
    timers.current.push(
      window.setTimeout(() => setStep('verified'), 700),
      window.setTimeout(() => {
        const hadFocus = rootRef.current?.contains(document.activeElement) ?? false
        flushSync(() => setStep('welcome'))
        if (hadFocus) focusAction()
      }, 1200),
    )
  }

  const reset = () => {
    clearTimers()
    flushSync(() => setStep('idle'))
    focusAction()
  }

  const still = { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0 } }
  const glyphSwap = reduce
    ? still
    : step === 'touch'
      ? {
          initial: { opacity: 0, transform: 'scale(0.86)' },
          animate: { opacity: 1, transform: ['scale(0.86)', 'scale(1.12)', 'scale(1)'] },
          exit: { opacity: 0, transform: 'scale(0.86)' },
          transition: { duration: 0.7, ease: ease.out },
        }
      : {
          initial: { opacity: 0, transform: 'scale(0.86)' },
          animate: { opacity: 1, transform: 'scale(1)' },
          exit: { opacity: 0, transform: 'scale(0.86)' },
          transition: { duration: duration.ui, ease: ease.out },
        }
  const textSwap = reduce
    ? still
    : {
        initial: { opacity: 0, transform: 'translateY(6px)' },
        animate: { opacity: 1, transform: 'translateY(0px)' },
        exit: { opacity: 0, transform: 'translateY(-6px)' },
        transition: { duration: duration.ui, ease: ease.out },
      }

  const copy = STEP_COPY[step]

  return (
    <div ref={rootRef} className="w-full max-w-[440px] rounded-panel bg-surface p-3.5 shadow-float @sm:p-4 @3xl:w-[18rem]">
      <p className="sr-only" aria-live="polite">
        {step === 'idle' ? '' : copy.title}
      </p>
      <div className="flex items-center gap-3">
        <span className="relative grid size-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-ink">
          {step === 'touch' && !reduce && (
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-xl ring-2 ring-accent ring-inset"
              initial={{ opacity: 0.7, transform: 'scale(1)' }}
              animate={{ opacity: 0, transform: 'scale(1.45)' }}
              transition={{ duration: 0.7, ease: ease.out }}
            />
          )}
          <AnimatePresence initial={false}>
            <motion.span key={step} aria-hidden className="absolute inset-0 grid place-items-center" {...glyphSwap}>
              <StepGlyph step={step} />
            </motion.span>
          </AnimatePresence>
        </span>
        <div aria-hidden className="relative h-[2.6rem] min-w-0 flex-1 overflow-hidden">
          <AnimatePresence initial={false}>
            <motion.div key={step} className="absolute inset-0" {...textSwap}>
              <p className="truncate font-display text-[0.98rem] leading-snug font-semibold tracking-[-0.01em] text-ink">
                {copy.title}
              </p>
              <p className="truncate text-[0.8rem] leading-snug text-muted">{copy.detail}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div aria-hidden className="mt-3 grid grid-cols-3 gap-1.5 @sm:mt-3.5">
        {[1, 2, 3].map((n) => (
          <span key={n} className="h-0.5 overflow-hidden rounded-full bg-line">
            <span
              className={cn(
                'block h-full origin-left bg-accent transition-transform duration-300 ease-out',
                STEP_INDEX[step] >= n ? 'scale-x-100' : 'scale-x-0',
              )}
            />
          </span>
        ))}
      </div>

      <div className="mt-3 flex min-h-12 items-center @sm:mt-3.5">
        {step === 'welcome' ? (
          <button
            type="button"
            data-passkey-action
            onClick={reset}
            className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-[0.9rem] text-muted transition-[transform,background-color,color] duration-200 ease-out hover:bg-accent-soft hover:text-accent-ink active:scale-[0.98]"
          >
            <ArrowCounterClockwiseIcon size={16} weight="light" aria-hidden />
            Reset
          </button>
        ) : (
          <Button
            data-passkey-action
            variant="quiet"
            icon={FingerprintIcon}
            onClick={start}
            aria-disabled={running}
            className={cn('w-full justify-center', running && 'opacity-55')}
          >
            Sign in with passkey
          </Button>
        )}
      </div>
    </div>
  )
}

/* ---------- Stage ---------- */

export function Recreation({ demoStep }: { demoStep?: number } = {}) {
  return (
    <div
      className="absolute inset-0 grid place-items-center overflow-hidden p-3 @sm:p-6"
      style={{
        background: 'linear-gradient(to bottom, var(--surface), color-mix(in oklab, var(--accent-soft) 55%, var(--surface)))',
      }}
    >
      <div className="flex w-full flex-col items-center gap-2.5 @sm:gap-3 @3xl:flex-row @3xl:items-center @3xl:justify-center @3xl:gap-8">
        <WalletCard demoStep={demoStep} />
        <PasskeyCard demoStep={demoStep} />
      </div>
    </div>
  )
}
