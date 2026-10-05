import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
import { AnimatePresence, motion, useInView } from 'motion/react'
import {
  ArrowsClockwiseIcon,
  BuildingsIcon,
  CaretDownIcon,
  CheckIcon,
  GlobeHemisphereWestIcon,
} from '@phosphor-icons/react'
import { Chip } from '../../components/Chip'
import { cn } from '../../lib/cn'
import { duration, ease, usePrefersReducedMotion } from '../../lib/motion'

type OrgId = 'northwind' | 'harbor'
type Unit = 'mmHg' | 'kPa'

interface Org {
  id: OrgId
  name: string
  patient: string
  utcOffset: string
  sys: number[]
  dia: number[]
}

const orgs: Org[] = [
  {
    id: 'northwind',
    name: 'Northwind Clinic',
    patient: 'Patient 4821',
    utcOffset: 'UTC−5',
    sys: [128, 131, 126, 134, 129, 137, 133, 130, 142, 135, 131, 147, 138, 134],
    dia: [82, 84, 80, 86, 83, 88, 85, 83, 91, 87, 84, 94, 89, 86],
  },
  {
    id: 'harbor',
    name: 'Harbor Health',
    patient: 'Patient 2093',
    utcOffset: 'UTC−8',
    sys: [122, 125, 143, 129, 124, 127, 121, 126, 130, 128, 145, 133, 127, 124],
    dia: [78, 80, 92, 82, 79, 81, 77, 80, 83, 81, 95, 85, 82, 79],
  },
]

const days = 14
const band = { low: 90, high: 140 }
const domain = { min: 64, max: 156 }
const kpaPerMmHg = 0.133322

function format(mmHg: number, unit: Unit) {
  return unit === 'mmHg' ? String(mmHg) : (mmHg * kpaPerMmHg).toFixed(1)
}

/* The wrapper captures the world tokens so the card can override --accent without a cycle. */
const worldTokens = {
  '--hc-accent': 'var(--accent)',
  '--hc-accent-soft': 'var(--accent-soft)',
  '--hc-accent-ink': 'var(--accent-ink)',
} as CSSProperties

const tenantTokens: Record<OrgId, CSSProperties> = {
  northwind: {
    '--accent': 'var(--hc-accent)',
    '--accent-soft': 'var(--hc-accent-soft)',
    '--accent-ink': 'var(--hc-accent-ink)',
  } as CSSProperties,
  harbor: {
    '--accent': 'oklch(from var(--hc-accent) l c calc(h + 38))',
    '--accent-soft': 'oklch(from var(--hc-accent-soft) l c calc(h + 38))',
    '--accent-ink': 'oklch(from var(--hc-accent-ink) l c calc(h + 38))',
  } as CSSProperties,
}

const chartTokens = {
  '--hc-dia': 'color-mix(in oklab, var(--accent) 42%, var(--muted))',
  '--hc-alert': 'oklch(from var(--accent-ink) l calc(c + 0.08) 32)',
  transition: ['--accent', '--accent-soft', '--accent-ink'].map((p) => `${p} 400ms var(--ease-world)`).join(', '),
} as CSSProperties

function smoothPath(points: Array<[number, number]>) {
  const r = (n: number) => Math.round(n * 10) / 10
  let d = `M${r(points[0][0])},${r(points[0][1])}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C${r(c1x)},${r(c1y)} ${r(c2x)},${r(c2y)} ${r(p2[0])},${r(p2[1])}`
  }
  return d
}

function OrgSwitcher({ value, onChange }: { value: OrgId; onChange: (id: OrgId) => void }) {
  const reduce = usePrefersReducedMotion()
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const listId = useId()
  const current = orgs.find((o) => o.id === value) ?? orgs[0]

  useEffect(() => {
    if (!open) return
    listRef.current?.focus()
    const onPointerDown = (event: globalThis.PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  function openMenu() {
    setActiveIndex(orgs.findIndex((o) => o.id === value))
    setOpen(true)
  }

  function choose(index: number) {
    onChange(orgs[index].id)
    setOpen(false)
    buttonRef.current?.focus()
  }

  function onButtonKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      openMenu()
    }
  }

  function onListKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    const last = orgs.length - 1
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setActiveIndex((i) => Math.min(last, i + 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        setActiveIndex((i) => Math.max(0, i - 1))
        break
      case 'Home':
        event.preventDefault()
        setActiveIndex(0)
        break
      case 'End':
        event.preventDefault()
        setActiveIndex(last)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        choose(activeIndex)
        break
      case 'Escape':
        event.preventDefault()
        setOpen(false)
        buttonRef.current?.focus()
        break
      case 'Tab':
        setOpen(false)
        break
    }
  }

  const hidden = reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateY(-4px) scale(0.97)' }
  const shown = reduce ? { opacity: 1 } : { opacity: 1, transform: 'translateY(0px) scale(1)' }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`Organization: ${current.name}`}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onButtonKeyDown}
        className="flex min-h-11 items-center gap-2 rounded-full bg-surface py-1.5 pr-3 pl-3.5 text-[0.8125rem] font-medium text-ink ring-1 ring-line-strong ring-inset transition-[background-color,transform] duration-200 ease-out hover:bg-accent-soft active:scale-[0.98] @md:text-[0.875rem]"
      >
        <BuildingsIcon size={16} weight="light" aria-hidden className="shrink-0 text-accent-ink" />
        <span className="whitespace-nowrap">{current.name}</span>
        <CaretDownIcon
          size={14}
          weight="regular"
          aria-hidden
          className={cn('shrink-0 text-muted transition-transform duration-200 ease-out', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            ref={listRef}
            id={listId}
            role="listbox"
            tabIndex={-1}
            aria-label="Organization"
            aria-activedescendant={`${listId}-${orgs[activeIndex].id}`}
            onKeyDown={onListKeyDown}
            initial={hidden}
            animate={shown}
            exit={hidden}
            transition={{ duration: 0.16, ease: ease.out }}
            style={{ transformOrigin: 'top right' }}
            className="absolute top-full right-0 z-20 mt-1.5 w-max min-w-full rounded-[12px] bg-surface p-1 shadow-float ring-1 ring-line outline-none"
          >
            {orgs.map((org, index) => {
              const selected = org.id === value
              return (
                <li
                  key={org.id}
                  id={`${listId}-${org.id}`}
                  role="option"
                  aria-selected={selected}
                  onPointerEnter={() => setActiveIndex(index)}
                  onClick={() => choose(index)}
                  className={cn(
                    'flex min-h-11 cursor-pointer items-center justify-between gap-4 rounded-[8px] px-3 text-[0.8125rem] text-ink @md:text-[0.875rem]',
                    index === activeIndex && 'bg-accent-soft',
                  )}
                >
                  <span className="whitespace-nowrap">{org.name}</span>
                  <CheckIcon
                    size={14}
                    weight="regular"
                    aria-hidden
                    className={cn('shrink-0 text-accent-ink', !selected && 'invisible')}
                  />
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

function UnitToggle({ value, onChange }: { value: Unit; onChange: (unit: Unit) => void }) {
  const units: Unit[] = ['mmHg', 'kPa']
  const refs = useRef<Array<HTMLButtonElement | null>>([])

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
    event.preventDefault()
    const next: Unit = value === 'mmHg' ? 'kPa' : 'mmHg'
    onChange(next)
    refs.current[units.indexOf(next)]?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-label="Pressure unit"
      onKeyDown={onKeyDown}
      className="relative grid shrink-0 grid-cols-2 rounded-full ring-1 ring-line-strong ring-inset"
    >
      <span
        aria-hidden
        className="absolute top-1 bottom-1 left-1 w-[calc(50%-8px)] rounded-full bg-accent transition-transform duration-[240ms] ease-out motion-reduce:transition-none"
        style={{ transform: value === 'kPa' ? 'translateX(calc(100% + 8px))' : 'translateX(0px)' }}
      />
      {units.map((unit, index) => {
        const checked = unit === value
        return (
          <button
            key={unit}
            ref={(el) => {
              refs.current[index] = el
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(unit)}
            className={cn(
              'relative z-10 h-11 rounded-full px-3.5 font-mono text-[0.75rem] transition-[color,transform] duration-200 ease-out active:scale-[0.97]',
              checked ? 'text-on-accent' : 'text-muted hover:text-ink',
            )}
          >
            {unit}
          </button>
        )
      })}
    </div>
  )
}

const pad = { l: 34, r: 10, t: 26, b: 24 }

function TrendChart({ org, unit, play }: { org: Org; unit: Unit; play: boolean }) {
  const reduce = usePrefersReducedMotion()
  const boxRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<{ w: number; h: number } | null>(null)
  const [active, setActive] = useState<number | null>(null)
  const [drawn, setDrawn] = useState(false)
  const focusedRef = useRef(false)

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width <= pad.l + pad.r || height <= pad.t + pad.b) return
      setSize({ w: Math.round(width), h: Math.round(height) })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const w = size?.w ?? 0
  const h = size?.h ?? 0
  const step = (w - pad.l - pad.r) / (days - 1)
  const x = (i: number) => pad.l + i * step
  const y = (v: number) => pad.t + ((domain.max - v) * (h - pad.t - pad.b)) / (domain.max - domain.min)
  const sysPath = size ? smoothPath(org.sys.map((v, i) => [x(i), y(v)])) : ''
  const diaPath = size ? smoothPath(org.dia.map((v, i) => [x(i), y(v)])) : ''
  const alerts = org.sys.flatMap((v, i) => (v > band.high ? [i] : []))
  const showAll = w >= 420
  const reveal = play || reduce

  function onPointer(event: PointerEvent<HTMLDivElement>) {
    const rect = boxRef.current?.getBoundingClientRect()
    if (!rect || step <= 0) return
    setActive(Math.max(0, Math.min(days - 1, Math.round((event.clientX - rect.left - pad.l) / step))))
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = active ?? days - 1
    let next: number | null
    if (event.key === 'ArrowLeft') next = Math.max(0, current - 1)
    else if (event.key === 'ArrowRight') next = Math.min(days - 1, current + 1)
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = days - 1
    else if (event.key === 'Escape') next = null
    else return
    event.preventDefault()
    setActive(next)
  }

  const lineTransition = {
    pathLength: { duration: reduce ? 0 : 1.1, ease: ease.inOut },
    d: { duration: reduce ? 0 : 0.4, ease: ease.drawer },
  }

  const tipX = active === null ? 0 : Math.max(84, Math.min(w - 84, x(active)))
  const tipY = active === null ? 0 : y(org.sys[active]) - 12
  const reading =
    active === null
      ? ''
      : `Day ${active + 1}: ${format(org.sys[active], unit)} over ${format(org.dia[active], unit)} ${unit}${
          org.sys[active] > band.high ? ', above threshold' : ''
        }`

  return (
    <div
      ref={boxRef}
      role="group"
      tabIndex={0}
      aria-label={`Blood pressure, ${days} days. Use the arrow keys to read each day.`}
      onPointerMove={onPointer}
      onPointerDown={onPointer}
      onPointerLeave={() => {
        if (!focusedRef.current) setActive(null)
      }}
      onFocus={() => {
        focusedRef.current = true
        setActive((a) => a ?? days - 1)
      }}
      onBlur={() => {
        focusedRef.current = false
        setActive(null)
      }}
      onKeyDown={onKeyDown}
      className="relative min-h-0 flex-1 touch-pan-y rounded-[10px]"
    >
      <span className="sr-only" aria-live="polite">
        {reading}
      </span>

      {size && (
        <svg width={w} height={h} className="absolute inset-0 overflow-visible" aria-hidden>
          <rect
            x={pad.l}
            y={y(band.high)}
            width={w - pad.l - pad.r}
            height={y(band.low) - y(band.high)}
            style={{ fill: 'color-mix(in oklab, var(--accent) 9%, transparent)' }}
          />
          {[band.high, band.low].map((v) => (
            <g key={v}>
              <line
                x1={pad.l}
                x2={w - pad.r}
                y1={y(v)}
                y2={y(v)}
                strokeDasharray="2 4"
                style={{ stroke: 'color-mix(in oklab, var(--accent) 45%, transparent)' }}
              />
              <text
                x={pad.l - 7}
                y={y(v)}
                textAnchor="end"
                dominantBaseline="middle"
                className="tabular fill-muted font-mono text-[10px]"
              >
                {format(v, unit)}
              </text>
            </g>
          ))}

          {Array.from({ length: days }, (_, i) =>
            showAll || i % 2 === 0 || i === active ? (
              <text
                key={i}
                x={x(i)}
                y={h - 6}
                textAnchor="middle"
                className={cn('tabular font-mono text-[10px]', i === active ? 'fill-ink' : 'fill-muted')}
              >
                {i + 1}
              </text>
            ) : null,
          )}

          {active !== null && (
            <line
              x1={x(active)}
              x2={x(active)}
              y1={pad.t - 8}
              y2={h - pad.b + 2}
              strokeWidth={1}
              className="stroke-line-strong"
            />
          )}

          <motion.path
            initial={{ pathLength: reduce ? 1 : 0, d: diaPath }}
            animate={{ pathLength: reveal ? 1 : 0, d: diaPath }}
            transition={{ ...lineTransition, pathLength: { ...lineTransition.pathLength, delay: reduce ? 0 : 0.1 } }}
            fill="none"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ stroke: 'var(--hc-dia)' }}
          />
          <motion.path
            initial={{ pathLength: reduce ? 1 : 0, d: sysPath }}
            animate={{ pathLength: reveal ? 1 : 0, d: sysPath }}
            transition={lineTransition}
            onAnimationComplete={() => {
              if (reveal) setDrawn(true)
            }}
            fill="none"
            strokeWidth={2.25}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-accent"
          />

          {(drawn || reduce) &&
            alerts.map((i) => (
              <motion.g
                key={`${org.id}-${i}`}
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
                animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                transition={{ duration: duration.ui, ease: ease.out, delay: reduce ? 0 : 0.18 }}
              >
                <circle
                  cx={x(i)}
                  cy={y(org.sys[i])}
                  r={4.5}
                  strokeWidth={2}
                  style={{ fill: 'var(--hc-alert)', stroke: 'var(--surface)' }}
                />
                {active !== i && (
                  <text
                    x={x(i)}
                    y={y(org.sys[i]) - 11}
                    textAnchor="middle"
                    className="font-mono text-[9.5px] font-medium"
                    style={{ fill: 'var(--hc-alert)' }}
                  >
                    Alert
                  </text>
                )}
              </motion.g>
            ))}

          {active !== null &&
            [
              { v: org.sys[active], stroke: 'var(--accent)' },
              { v: org.dia[active], stroke: 'var(--hc-dia)' },
            ].map((dot) => (
              <circle
                key={dot.stroke}
                cx={x(active)}
                cy={y(dot.v)}
                r={3.5}
                strokeWidth={2}
                style={{ fill: 'var(--surface)', stroke: dot.stroke }}
              />
            ))}
        </svg>
      )}

      {size && active !== null && (
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 z-10 flex items-center gap-1.5 rounded-[8px] bg-ink px-2 py-1 font-mono text-[0.6875rem] whitespace-nowrap text-surface shadow-float transition-transform duration-150 ease-out motion-reduce:transition-none"
          style={{ transform: `translate(${tipX}px, ${tipY}px) translate(-50%, -100%)` }}
        >
          {org.sys[active] > band.high && (
            <span className="size-1.5 shrink-0 rounded-full" style={{ background: 'var(--hc-alert)' }} />
          )}
          <span className="tabular">
            {format(org.sys[active], unit)} / {format(org.dia[active], unit)} · Day {active + 1}
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * Vitals trend card: one patient's 14-day blood pressure, scoped to the
 * selected organization. All data is invented.
 */
export function Recreation({ demoStep }: { demoStep?: number } = {}) {
  const reduce = usePrefersReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const inView = useInView(rootRef, { once: true, amount: 0.4 })
  const [selectedOrg, setOrgId] = useState<OrgId>('northwind')
  const [selectedUnit, setUnit] = useState<Unit>('mmHg')
  const orgId = demoStep === undefined ? selectedOrg : demoStep >= 2 ? 'harbor' : 'northwind'
  const unit = demoStep === undefined ? selectedUnit : demoStep === 1 || demoStep === 2 ? 'kPa' : 'mmHg'
  const org = orgs.find((o) => o.id === orgId) ?? orgs[0]
  const fade = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, transform: 'translateY(4px)' }, animate: { opacity: 1, transform: 'translateY(0px)' } }

  return (
    <div ref={rootRef} className="absolute inset-0" style={worldTokens}>
      <div className="flex h-full flex-col gap-3 p-4 @md:gap-4 @md:p-6" style={{ ...tenantTokens[orgId], ...chartTokens }}>
        <span className="sr-only" aria-live="polite">
          {`${org.name}, ${org.patient}`}
        </span>

        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <motion.p
              key={org.patient}
              {...fade}
              transition={{ duration: duration.ui, ease: ease.out }}
              className="font-display text-[clamp(1.0625rem,5cqi,1.5rem)] leading-tight font-medium tracking-[-0.02em] text-ink"
            >
              {org.patient}
            </motion.p>
            <Chip tone="accent" className="mt-1.5 px-2 py-1 text-[0.6875rem] whitespace-nowrap @md:text-[0.75rem]">
              Care manager
            </Chip>
          </div>
          <OrgSwitcher value={orgId} onChange={setOrgId} />
        </header>

        <div className="flex items-center justify-between gap-3 border-t border-line pt-3 text-[0.75rem] @md:text-[0.8125rem]">
          <p className="min-w-0 truncate">
            <span className="font-medium text-ink">Blood pressure</span>
            <span className="hidden font-mono text-muted @sm:inline"> · 14 days</span>
          </p>
          <ul className="flex shrink-0 items-center gap-3 text-muted">
            <li className="flex items-center gap-1.5">
              <span aria-hidden className="h-0.5 w-3.5 rounded-full bg-accent" />
              Systolic
            </li>
            <li className="flex items-center gap-1.5">
              <span aria-hidden className="h-0.5 w-3.5 rounded-full" style={{ background: 'var(--hc-dia)' }} />
              Diastolic
            </li>
          </ul>
        </div>

        <TrendChart org={org} unit={unit} play={inView} />

        <footer className="flex flex-col items-start gap-2 @sm:flex-row @sm:items-center @sm:justify-between @sm:gap-3">
          <UnitToggle value={unit} onChange={setUnit} />
          <div className="min-w-0 space-y-0.5 font-mono text-[0.6875rem] @sm:text-right leading-snug text-muted @md:text-[0.75rem]">
            <p>
              <ArrowsClockwiseIcon size={13} weight="light" aria-hidden className="mr-1.5 inline align-[-2px]" />
              Last sync 2 min ago
            </p>
            <p className="text-balance">
              <GlobeHemisphereWestIcon size={13} weight="light" aria-hidden className="mr-1.5 inline align-[-2px]" />
              Timezone: patient local ({org.utcOffset})
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
