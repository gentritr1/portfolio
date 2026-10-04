import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { flushSync } from 'react-dom'
import { AnimatePresence, LayoutGroup, MotionConfig, motion, useInView, type PanInfo } from 'motion/react'
import {
  ArrowDownIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CheckCircleIcon,
  CheckIcon,
  EyeIcon,
  FloppyDiskBackIcon,
  InfoIcon,
  LockSimpleIcon,
  MoonIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  SunIcon,
  WarningCircleIcon,
  WarningIcon,
  WarningOctagonIcon,
  XIcon,
} from '@phosphor-icons/react'
import { usePrefersReducedMotion } from '../../lib/motion'
import { coreName, coreValue, component, lanes, semantic, steps as rampSteps, tokenStyle, type Mode, type Step } from './tokens'
import './recreation.css'

const easeOut = [0.23, 1, 0.32, 1] as const
const quick = { duration: 0.2, ease: easeOut }
const glide = { type: 'spring', duration: 0.32, bounce: 0 } as const

type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

/* ---------- Tokens ---------- */

function ThemeSwitch({ mode, onChange, id }: { mode: Mode; onChange: (mode: Mode, from: HTMLElement) => void; id: string }) {
  return (
    <div className="dsr-segment" role="radiogroup" aria-label="Theme">
      {(['light', 'dark'] as const).map((value) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={mode === value}
          className="dsr-segment-option"
          onClick={(event) => onChange(value, event.currentTarget)}
          onKeyDown={(event) => {
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
              event.preventDefault()
              const next = mode === 'light' ? 'dark' : 'light'
              const sibling = event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(`[data-value="${next}"]`)
              onChange(next, sibling ?? event.currentTarget)
              sibling?.focus()
            }
          }}
          data-value={value}
          tabIndex={mode === value ? 0 : -1}
        >
          {mode === value && <motion.span layoutId={`${id}-theme`} className="dsr-segment-pill" transition={glide} />}
          <span className="dsr-segment-label">
            {value === 'light' ? <SunIcon size={15} weight="bold" aria-hidden /> : <MoonIcon size={15} weight="bold" aria-hidden />}
            {value === 'light' ? 'Light' : 'Dark'}
          </span>
        </button>
      ))}
    </div>
  )
}

function LanePreview({ kind }: { kind: (typeof lanes)[number]['preview'] }) {
  if (kind === 'button') return <span className="dsr-pv dsr-pv-button">Ship</span>
  if (kind === 'card') return <span className="dsr-pv dsr-pv-card" />
  if (kind === 'text') return <span className="dsr-pv dsr-pv-text">Aa</span>
  if (kind === 'icon') return <CheckCircleIcon className="dsr-pv-icon" size={20} weight="fill" aria-hidden />
  return <span className="dsr-pv dsr-pv-ring" />
}

function TokenLanes({ mode, id }: { mode: Mode; id: string }) {
  return (
    <div className="dsr-lanes">
      <div className="dsr-lane dsr-lane-head" aria-hidden>
        <span>Core value</span>
        <span />
        <span>Semantic role</span>
        <span />
        <span>Component part</span>
      </div>
      <ol className="dsr-lane-list" aria-label={`How tokens resolve in the ${mode} theme`}>
        {lanes.map((lane, index) => {
          const role = component[lane.component]
          const core = semantic[role][mode]
          const ramp: Step[] = [0, ...rampSteps]
          return (
            <li className="dsr-lane" key={lane.component} style={{ '--lane': index } as CSSProperties}>
              <span className="dsr-sr">{`${lane.component} uses ${role}, which is ${coreName(core)}.`}</span>
              <span className="dsr-core" aria-hidden>
                <span className="dsr-ramp">
                  {ramp.map((step) => (
                    <span key={step} className="dsr-ramp-step" style={{ background: coreValue(core.family, step) }}>
                      {step === core.step && <motion.span layoutId={`${id}-lane-${index}`} className="dsr-ramp-mark" transition={{ ...glide, delay: index * 0.04 }} />}
                    </span>
                  ))}
                </span>
                <span className="dsr-token-name dsr-swap">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={coreName(core)}
                      initial={{ opacity: 0, filter: 'blur(3px)', transform: 'translateY(6px)' }}
                      animate={{ opacity: 1, filter: 'blur(0px)', transform: 'translateY(0px)' }}
                      exit={{ opacity: 0, filter: 'blur(3px)', transform: 'translateY(-6px)' }}
                      transition={{ ...quick, delay: index * 0.04 }}
                    >
                      {coreName(core)}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </span>
              <span className="dsr-arrow dsr-arrow-a" aria-hidden />
              <span className="dsr-chip-token" aria-hidden>
                <span className="dsr-dot" style={{ background: `var(--${role.replaceAll('.', '-')})` }} />
                <span className="dsr-token-name">{role}</span>
                <motion.span
                  key={mode}
                  className="dsr-flash"
                  initial={{ opacity: 0.9 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: easeOut, delay: 0.08 + index * 0.04 }}
                />
              </span>
              <span className="dsr-arrow dsr-arrow-b" aria-hidden />
              <span className="dsr-chip-token dsr-chip-component" aria-hidden>
                <LanePreview kind={lane.preview} />
                <span className="dsr-token-name">{lane.component}</span>
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/* ---------- Alerts ---------- */

const alertIcons: Record<Tone, ReactNode> = {
  neutral: <FloppyDiskBackIcon size={18} weight="fill" aria-hidden />,
  info: <InfoIcon size={18} weight="fill" aria-hidden />,
  success: <CheckCircleIcon size={18} weight="fill" aria-hidden />,
  warning: <WarningIcon size={18} weight="fill" aria-hidden />,
  danger: <WarningOctagonIcon size={18} weight="fill" aria-hidden />,
}

const alerts: { tone: Tone; title: string; body: string }[] = [
  { tone: 'neutral', title: 'Draft saved', body: 'Release notes for 1.2 are saved on this device.' },
  { tone: 'info', title: 'Release 1.2 is scheduled', body: 'It ships Thursday at 10:00. Reviewers get a reminder.' },
  { tone: 'success', title: 'Contrast check passed', body: 'All 48 text pairs hold 4.5:1 in both themes.' },
  { tone: 'warning', title: 'Two tokens have no owner', body: 'Assign an owner before the next release.' },
  { tone: 'danger', title: 'Build stopped at step 3', body: 'One token points to a value that does not exist.' },
]

/* ---------- Select ---------- */

function Select({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (value: string) => void }) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(() => Math.max(0, options.indexOf(value)))
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const list = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (!open) return
    list.current?.focus({ preventScroll: true })
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const show = () => {
    setActive(Math.max(0, options.indexOf(value)))
    setOpen(true)
  }
  const choose = (index: number) => {
    onChange(options[index])
    setOpen(false)
    trigger.current?.focus({ preventScroll: true })
  }
  const onListKey = (event: KeyboardEvent) => {
    const keys: Record<string, () => void> = {
      ArrowDown: () => setActive((i) => Math.min(options.length - 1, i + 1)),
      ArrowUp: () => setActive((i) => Math.max(0, i - 1)),
      Home: () => setActive(0),
      End: () => setActive(options.length - 1),
      Enter: () => choose(active),
      ' ': () => choose(active),
      Escape: () => {
        setOpen(false)
        trigger.current?.focus({ preventScroll: true })
      },
    }
    if (event.key === 'Tab') setOpen(false)
    const run = keys[event.key]
    if (run) {
      event.preventDefault()
      run()
    }
  }

  return (
    <div className="dsr-field" ref={root}>
      <span className="dsr-label" id={`${id}-label`}>{label}</span>
      <button
        ref={trigger}
        id={`${id}-trigger`}
        type="button"
        className="dsr-control dsr-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-labelledby={`${id}-label ${id}-trigger`}
        data-open={open}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={(event) => {
          if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
            event.preventDefault()
            show()
          }
        }}
      >
        <span>{value}</span>
        <CaretDownIcon className="dsr-caret" size={16} weight="bold" aria-hidden />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            ref={list}
            id={`${id}-list`}
            role="listbox"
            tabIndex={-1}
            aria-labelledby={`${id}-label`}
            aria-activedescendant={`${id}-option-${active}`}
            className="dsr-popover"
            onKeyDown={onListKey}
            initial={{ opacity: 0, transform: 'translateY(-4px) scale(0.97)' }}
            animate={{ opacity: 1, transform: 'translateY(0px) scale(1)', transition: quick }}
            exit={{ opacity: 0, transform: 'translateY(-2px) scale(0.98)', transition: { duration: 0.12, ease: easeOut } }}
          >
            {options.map((option, index) => (
              <li
                key={option}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={option === value}
                data-active={index === active}
                className="dsr-option"
                onPointerMove={() => setActive(index)}
                onClick={() => choose(index)}
              >
                {option}
                {option === value && <CheckIcon size={16} weight="bold" aria-hidden />}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---------- Combobox with chips ---------- */

const labelPool = ['Tokens', 'Accessibility', 'Motion', 'Forms', 'Icons', 'Layout', 'Docs']

function ChipCombobox({ chips, onChange }: { chips: string[]; onChange: (chips: string[]) => void }) {
  const id = useId()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const suggestions = labelPool.filter((item) => !chips.includes(item) && item.toLowerCase().includes(query.trim().toLowerCase()))
  const expanded = open && suggestions.length > 0
  const current = Math.min(active, suggestions.length - 1)

  const add = (item: string) => {
    onChange([...chips, item])
    setQuery('')
    setActive(0)
  }
  const onKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setActive((i) => Math.min(suggestions.length - 1, i + 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((i) => Math.max(0, i - 1))
    } else if (event.key === 'Enter' && expanded) {
      event.preventDefault()
      add(suggestions[current])
    } else if (event.key === 'Escape') {
      setOpen(false)
    } else if (event.key === 'Backspace' && query === '' && chips.length > 0) {
      onChange(chips.slice(0, -1))
    }
  }

  return (
    <div className="dsr-field">
      <div className="dsr-label-row">
        <label className="dsr-label" htmlFor={`${id}-input`}>Labels</label>
        <span className="dsr-badge dsr-badge-info">Beta</span>
      </div>
      <div className="dsr-control dsr-chipfield" onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          event.preventDefault()
          input.current?.focus()
        }
      }}>
        <ul className="dsr-chips" aria-label="Chosen labels">
          <AnimatePresence mode="popLayout" initial={false}>
            {chips.map((chip) => (
              <motion.li
                key={chip}
                layout
                className="dsr-chip"
                initial={{ opacity: 0, transform: 'scale(0.9)', filter: 'blur(2px)' }}
                animate={{ opacity: 1, transform: 'scale(1)', filter: 'blur(0px)' }}
                exit={{ opacity: 0, transform: 'scale(0.9)', filter: 'blur(2px)', transition: { duration: 0.14, ease: easeOut } }}
                transition={glide}
              >
                {chip}
                <button type="button" className="dsr-chip-remove" aria-label={`Remove ${chip}`} onClick={() => onChange(chips.filter((item) => item !== chip))}>
                  <XIcon size={12} weight="bold" aria-hidden />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <motion.input
          layout="position"
          transition={glide}
          ref={input}
          id={`${id}-input`}
          className="dsr-chip-input"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={expanded}
          aria-controls={`${id}-list`}
          aria-activedescendant={expanded ? `${id}-option-${current}` : undefined}
          placeholder={chips.length ? 'Add' : 'Add a label'}
          value={query}
          autoComplete="off"
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
            setActive(0)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKey}
        />
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.ul
            id={`${id}-list`}
            role="listbox"
            aria-label="Suggested labels"
            className="dsr-popover"
            initial={{ opacity: 0, transform: 'translateY(-4px) scale(0.97)' }}
            animate={{ opacity: 1, transform: 'translateY(0px) scale(1)', transition: quick }}
            exit={{ opacity: 0, transform: 'translateY(-2px) scale(0.98)', transition: { duration: 0.12, ease: easeOut } }}
          >
            {suggestions.map((item, index) => (
              <li
                key={item}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={index === current}
                data-active={index === current}
                className="dsr-option"
                onPointerDown={(event) => event.preventDefault()}
                onPointerMove={() => setActive(index)}
                onClick={() => add(item)}
              >
                {item}
                <PlusIcon size={14} weight="bold" aria-hidden />
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---------- Fields ---------- */

function Fields() {
  const id = useId()
  const [name, setName] = useState('Release 1.2')
  const [version, setVersion] = useState('1.2')
  const valid = /^\d+\.\d+\.\d+$/.test(version.trim())
  return (
    <div className="dsr-fields">
      <div className="dsr-field">
        <label className="dsr-label" htmlFor={`${id}-name`}>Release name</label>
        <input id={`${id}-name`} className="dsr-control dsr-input" value={name} onChange={(event) => setName(event.target.value)} />
        <p className="dsr-help">Shown in the changelog.</p>
      </div>
      <div className="dsr-field">
        <label className="dsr-label" htmlFor={`${id}-version`}>Version</label>
        <span className="dsr-input-wrap">
          <input
            id={`${id}-version`}
            className="dsr-control dsr-input"
            value={version}
            aria-invalid={!valid}
            aria-describedby={`${id}-version-help`}
            data-state={valid ? 'valid' : 'invalid'}
            onChange={(event) => setVersion(event.target.value)}
          />
          {valid && <CheckCircleIcon className="dsr-input-icon dsr-ok" size={16} weight="fill" aria-hidden />}
        </span>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={valid ? 'ok' : 'bad'}
            id={`${id}-version-help`}
            className={valid ? 'dsr-help' : 'dsr-help dsr-error'}
            initial={{ opacity: 0, transform: 'translateY(-3px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            exit={{ opacity: 0 }}
            transition={quick}
          >
            {valid ? 'Looks right.' : <><WarningCircleIcon size={14} weight="fill" aria-hidden /> Use three numbers: 1.2.0</>}
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="dsr-field">
        <label className="dsr-label" htmlFor={`${id}-key`}>Project key</label>
        <span className="dsr-input-wrap">
          <input id={`${id}-key`} className="dsr-control dsr-input" value="TRK" readOnly aria-describedby={`${id}-key-help`} />
          <LockSimpleIcon className="dsr-input-icon" size={15} weight="bold" aria-hidden />
        </span>
        <p className="dsr-help" id={`${id}-key-help`}>Read-only after the first release.</p>
      </div>
      <div className="dsr-field">
        <label className="dsr-label" htmlFor={`${id}-owner`}>Owner</label>
        <input id={`${id}-owner`} className="dsr-control dsr-input" value="Assigned after review" disabled />
        <p className="dsr-help">Disabled until review ends.</p>
      </div>
    </div>
  )
}

/* ---------- Steps ---------- */

const milestones = [
  { title: 'Tokens rebuilt', note: 'Monday, 09:12' },
  { title: 'Contrast check passed', note: '48 pairs, both themes' },
  { title: 'Design review', note: '2 of 3 approvals' },
  { title: 'Publish 1.2.0', note: 'Thursday' },
]

function Steps({ current }: { current: number }) {
  return (
    <ol className="dsr-steps">
        {milestones.map((step, index) => {
          const state = index < current ? 'done' : index === current ? 'current' : 'ahead'
          return (
            <li key={step.title} className="dsr-step" data-state={state} aria-current={state === 'current' ? 'step' : undefined}>
              <span className="dsr-step-marker" aria-hidden>
                <AnimatePresence mode="popLayout" initial={false}>
                  {state === 'done' ? (
                    <motion.svg key="done" viewBox="0 0 20 20" width="14" height="14" initial={{ opacity: 0, transform: 'scale(0.8)' }} animate={{ opacity: 1, transform: 'scale(1)' }} exit={{ opacity: 0 }} transition={quick}>
                      <motion.path d="M4.5 10.5l3.6 3.6L15.5 6.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.28, ease: easeOut, delay: 0.08 }} />
                    </motion.svg>
                  ) : (
                    <motion.span key="number" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={quick}>{index + 1}</motion.span>
                  )}
                </AnimatePresence>
              </span>
              {index < milestones.length - 1 && (
                <span className="dsr-step-line" aria-hidden>
                  <motion.span className="dsr-step-fill" initial={false} animate={{ transform: `scaleY(${index < current ? 1 : 0})` }} transition={{ duration: 0.32, ease: easeOut }} />
                </span>
              )}
              <span className="dsr-step-text">
                <span className="dsr-step-title">{step.title}</span>
                <span className="dsr-step-note">{state === 'done' && index === 2 ? '3 of 3 approvals' : step.note}</span>
              </span>
              <span className="dsr-sr">{state === 'done' ? ', done' : state === 'current' ? ', in progress' : ', not started'}</span>
            </li>
          )
        })}
    </ol>
  )
}

/* ---------- Tasks: tabs, badges, pagination ---------- */

type TabId = 'open' | 'review' | 'done'
const tabs: { id: TabId; label: string; count: number }[] = [
  { id: 'open', label: 'Open', count: 12 },
  { id: 'review', label: 'In review', count: 4 },
  { id: 'done', label: 'Done', count: 31 },
]
const tasks: Record<TabId, { title: string; tag: string; tone: Tone }[]> = {
  open: [
    { title: 'Add a hover step to the accent ramp', tag: 'Tokens', tone: 'info' },
    { title: 'Write usage notes for Combobox', tag: 'Docs', tone: 'neutral' },
    { title: 'Focus ring is faint on dark cards', tag: 'Bug', tone: 'danger' },
    { title: 'Narrow layout for the toast stack', tag: 'Layout', tone: 'warning' },
  ],
  review: [
    { title: 'Split Select and Combobox', tag: 'Components', tone: 'info' },
    { title: 'Rename the border roles', tag: 'Tokens', tone: 'neutral' },
    { title: 'Reduced-motion path for Steps', tag: 'Motion', tone: 'success' },
    { title: 'Check icon sizes at 320 px', tag: 'Layout', tone: 'warning' },
  ],
  done: [
    { title: 'Ship one stylesheet per component', tag: 'Build', tone: 'success' },
    { title: 'Theme scope for dark cards', tag: 'Tokens', tone: 'info' },
    { title: 'Publish 1.1.0', tag: 'Release', tone: 'success' },
    { title: 'Keyboard support for Tabs', tag: 'A11y', tone: 'neutral' },
  ],
}
const pageCount = 9

function pageWindow(page: number): (number | 'gap')[] {
  if (page <= 3) return [1, 2, 3, 4, 'gap', pageCount]
  if (page >= pageCount - 2) return [1, 'gap', pageCount - 3, pageCount - 2, pageCount - 1, pageCount]
  return [1, 'gap', page - 1, page, page + 1, 'gap', pageCount]
}

function Tasks({ tab, onTab, page, onPage, id }: { tab: TabId; onTab: (tab: TabId) => void; page: number; onPage: (page: number) => void; id: string }) {
  const rows = tasks[tab]
  const shown = [0, 1, 2].map((offset) => rows[(offset + page - 1) % rows.length])
  const onKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const map: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 }
    if (!(event.key in map)) return
    event.preventDefault()
    const next = tabs[(map[event.key] + tabs.length) % tabs.length]
    onTab(next.id)
    document.getElementById(`${id}-tab-${next.id}`)?.focus()
  }
  return (
    <div className="dsr-tasks">
      <div className="dsr-tablist" role="tablist" aria-label="Tasks">
        {tabs.map((item, index) => (
          <button
            key={item.id}
            id={`${id}-tab-${item.id}`}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            aria-controls={`${id}-panel`}
            tabIndex={tab === item.id ? 0 : -1}
            className="dsr-tab"
            onClick={() => onTab(item.id)}
            onKeyDown={(event) => onKey(event, index)}
          >
            {tab === item.id && <motion.span layoutId={`${id}-tab-pill`} className="dsr-tab-pill" transition={glide} />}
            <span className="dsr-tab-label">{item.label}</span>
            <span className="dsr-count">{item.count}</span>
          </button>
        ))}
      </div>
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${tab}`} className="dsr-panel">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.ul
            key={`${tab}-${page}`}
            className="dsr-task-list"
            initial={{ opacity: 0, filter: 'blur(2px)', transform: 'translateY(4px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)', transform: 'translateY(0px)' }}
            exit={{ opacity: 0, filter: 'blur(2px)', transition: { duration: 0.12 } }}
            transition={quick}
          >
            {shown.map((task) => (
              <li key={task.title} className="dsr-task">
                <span className="dsr-task-check" data-done={tab === 'done'} aria-hidden>{tab === 'done' && <CheckIcon size={11} weight="bold" />}</span>
                <span className="dsr-task-title">{task.title}</span>
                <span className={`dsr-badge dsr-badge-${task.tone}`}>{task.tag}</span>
              </li>
            ))}
          </motion.ul>
        </AnimatePresence>
      </div>
      <nav className="dsr-pagination" aria-label="Task pages">
        <button type="button" className="dsr-page dsr-page-step" aria-label="Previous page" disabled={page === 1} onClick={() => onPage(page - 1)}>
          <CaretLeftIcon size={14} weight="bold" aria-hidden />
        </button>
        {pageWindow(page).map((item, index) =>
          item === 'gap' ? (
            <span key={`gap-${index}`} className="dsr-page-gap" aria-hidden>…</span>
          ) : (
            <button key={item} type="button" className="dsr-page" aria-current={item === page ? 'page' : undefined} aria-label={`Page ${item}`} onClick={() => onPage(item)}>
              {item === page && <motion.span layoutId={`${id}-page-pill`} className="dsr-page-pill" transition={glide} />}
              <span className="dsr-page-number">{item}</span>
            </button>
          ),
        )}
        <button type="button" className="dsr-page dsr-page-step" aria-label="Next page" disabled={page === pageCount} onClick={() => onPage(page + 1)}>
          <CaretRightIcon size={14} weight="bold" aria-hidden />
        </button>
      </nav>
    </div>
  )
}

/* ---------- Switch, avatars ---------- */

function Switch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  const id = useId()
  return (
    <div className="dsr-switch-row">
      <span id={id} className="dsr-switch-label">{label}</span>
      <button type="button" role="switch" aria-checked={checked} aria-labelledby={id} className="dsr-switch" onClick={() => onChange(!checked)}>
        <motion.span className="dsr-switch-thumb" layout transition={{ type: 'spring', duration: 0.32, bounce: 0.18 }} />
      </button>
    </div>
  )
}

const people = [
  { initials: 'AK', tone: 'info' },
  { initials: 'LB', tone: 'success' },
  { initials: 'DR', tone: 'warning' },
  { initials: 'VM', tone: 'danger' },
] as const

/* ---------- Toasts ---------- */

interface Toast {
  id: number
  tone: 'neutral' | 'success' | 'danger'
  title: string
  body: string
}

const toastCopy: Record<Toast['tone'], Omit<Toast, 'id' | 'tone'>> = {
  neutral: { title: 'Link copied', body: 'Share it with the reviewers.' },
  success: { title: 'Release 1.2 published', body: 'Tokens rebuilt in 2.1 s.' },
  danger: { title: 'Could not sync tokens', body: 'The source changed. Try again.' },
}
const toastIcons: Record<Toast['tone'], ReactNode> = {
  neutral: <InfoIcon size={18} weight="fill" aria-hidden />,
  success: <CheckCircleIcon size={18} weight="fill" aria-hidden />,
  danger: <WarningOctagonIcon size={18} weight="fill" aria-hidden />,
}
const toastHeight = 64
const toastGap = 8

function ToastItem({ toast, index, expanded, paused, onDismiss }: { toast: Toast; index: number; expanded: boolean; paused: boolean; onDismiss: (id: number) => void }) {
  const remaining = useRef(4200)
  const hold = paused || expanded
  useEffect(() => {
    if (hold) return
    const started = Date.now()
    const timer = window.setTimeout(() => onDismiss(toast.id), remaining.current)
    return () => {
      window.clearTimeout(timer)
      remaining.current = Math.max(800, remaining.current - (Date.now() - started))
    }
  }, [hold, onDismiss, toast.id])

  const y = expanded ? -index * (toastHeight + toastGap) : -index * 12
  const scale = expanded ? 1 : 1 - index * 0.05
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 72 || Math.abs(info.velocity.x) > 500) onDismiss(toast.id)
  }
  return (
    <motion.li
      className="dsr-toast-slot"
      style={{ zIndex: 10 - index }}
      initial={{ opacity: 0, transform: 'translateY(100%) scale(1)' }}
      animate={{ opacity: index < 3 ? 1 : 0, transform: `translateY(${y}px) scale(${scale})` }}
      exit={{ opacity: 0, transform: `translateY(${y + 8}px) scale(${scale * 0.96})`, transition: { duration: 0.18, ease: easeOut } }}
      transition={{ duration: 0.4, ease: [0.21, 1.02, 0.73, 1] }}
      inert={!expanded && index > 0}
    >
      <motion.div
        className="dsr-toast"
        data-tone={toast.tone}
        data-behind={!expanded && index > 0}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragEnd={onDragEnd}
      >
        <span className="dsr-toast-icon">{toastIcons[toast.tone]}</span>
        <span className="dsr-toast-text">
          <strong>{toast.title}</strong>
          <span>{toast.body}</span>
        </span>
        <button type="button" className="dsr-toast-close" aria-label={`Dismiss: ${toast.title}`} onClick={() => onDismiss(toast.id)}>
          <XIcon size={14} weight="bold" aria-hidden />
        </button>
      </motion.div>
    </motion.li>
  )
}

function ToastStack({ toasts, paused, onDismiss }: { toasts: Toast[]; paused: boolean; onDismiss: (id: number) => void }) {
  const [expanded, setExpanded] = useState(false)
  const newestFirst = [...toasts].reverse()
  return (
    <section
      className="dsr-toasts"
      aria-label="Notifications"
      data-expanded={expanded}
      data-empty={toasts.length === 0}
      style={{ height: expanded ? toasts.length * (toastHeight + toastGap) : toastHeight + 24 }}
      onPointerEnter={() => setExpanded(true)}
      onPointerLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      onBlur={(event: FocusEvent) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setExpanded(false)
      }}
    >
      <ol>
        <AnimatePresence initial={false}>
          {newestFirst.map((toast, index) => (
            <ToastItem key={toast.id} toast={toast} index={index} expanded={expanded} paused={paused} onDismiss={onDismiss} />
          ))}
        </AnimatePresence>
      </ol>
    </section>
  )
}

/* ---------- Board ---------- */

function Card({ title, meta, className, children, index }: { title: string; meta?: ReactNode; className: string; children: ReactNode; index: number }) {
  const id = useId()
  return (
    <section className={`dsr-card ${className}`} aria-labelledby={id} style={{ '--i': index } as CSSProperties}>
      <header className="dsr-card-head">
        <h3 id={id}>{title}</h3>
        {meta && <span className="dsr-card-meta">{meta}</span>}
      </header>
      {children}
    </section>
  )
}

const demoActions = ['toast', 'step', 'tab', 'chip', 'page'] as const

export function Recreation({ demoStep }: { demoStep?: number; demoPlaying?: boolean } = {}) {
  const id = useId().replaceAll(':', '')
  const reduce = usePrefersReducedMotion()
  const root = useRef<HTMLDivElement>(null)
  const inView = useInView(root, { amount: 0.25 })
  const [chosenMode, setMode] = useState<Mode>('light')
  const mode: Mode = demoStep === undefined ? chosenMode : demoStep % 2 === 1 ? 'dark' : 'light'
  const [remapping, setRemapping] = useState(false)
  const [demoOn, setDemoOn] = useState(!reduce)
  const [hovering, setHovering] = useState(false)
  const [focused, setFocused] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [project, setProject] = useState('Components')
  const [chips, setChips] = useState(['Tokens', 'Accessibility'])
  const [step, setStep] = useState(2)
  const [tab, setTab] = useState<TabId>('open')
  const [page, setPage] = useState(1)
  const [publishing, setPublishing] = useState(false)
  const [notifyRelease, setNotifyRelease] = useState(true)
  const [digest, setDigest] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [announcement, setAnnouncement] = useState('')
  const nextToast = useRef(1)
  const tick = useRef(0)

  const running = demoOn && demoStep === undefined && inView && !hovering && !focused && !hidden

  const pushToast = (tone: Toast['tone'], announce: boolean) => {
    const toast = { id: nextToast.current++, tone, ...toastCopy[tone] }
    setToasts((list) => [...list.slice(-3), toast])
    if (announce) setAnnouncement(`${toast.title}. ${toast.body}`)
  }
  const dismiss = useCallback((toastId: number) => setToasts((list) => list.filter((item) => item.id !== toastId)), [])
  const advance = () => setStep((value) => (value >= milestones.length ? 0 : value + 1))

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => {
      const action = demoActions[tick.current % demoActions.length]
      tick.current += 1
      if (action === 'toast') pushToast(tick.current % 2 ? 'success' : 'neutral', false)
      if (action === 'step') advance()
      if (action === 'tab') setTab((value) => tabs[(tabs.findIndex((item) => item.id === value) + 1) % tabs.length].id)
      if (action === 'chip') setChips((list) => (list.includes('Motion') ? list.filter((item) => item !== 'Motion') : [...list, 'Motion']))
      if (action === 'page') setPage((value) => (value % 4) + 1)
    }, 2600)
    return () => window.clearInterval(timer)
  }, [running])

  useEffect(() => {
    if (!remapping) return
    const timer = window.setTimeout(() => setRemapping(false), 900)
    return () => window.clearTimeout(timer)
  }, [remapping])

  const changeMode = (next: Mode, from: HTMLElement) => {
    const element = root.current
    if (next === mode || !element) return
    if (reduce || typeof document.startViewTransition !== 'function') {
      setRemapping(true)
      setMode(next)
      return
    }
    const box = element.getBoundingClientRect()
    const origin = from.getBoundingClientRect()
    const x = origin.left + origin.width / 2 - box.left
    const y = origin.top + origin.height / 2 - box.top
    const radius = Math.hypot(Math.max(x, box.width - x), Math.max(y, box.height - y))
    element.style.viewTransitionName = 'dsr-theme'
    const transition = document.startViewTransition(() => flushSync(() => setMode(next)))
    transition.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 560, easing: 'cubic-bezier(0.77, 0, 0.175, 1)', pseudoElement: '::view-transition-new(dsr-theme)' },
        )
      })
      .catch(() => undefined)
    transition.finished.finally(() => {
      element.style.viewTransitionName = ''
    })
  }

  const publish = () => {
    if (publishing) return
    setPublishing(true)
    window.setTimeout(() => {
      setPublishing(false)
      pushToast('success', true)
    }, 1400)
  }

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={root}
        className="dsr"
        data-mode={mode}
        data-remapping={remapping || undefined}
        style={tokenStyle(mode)}
        onPointerEnter={() => setHovering(true)}
        onPointerLeave={() => setHovering(false)}
        onFocus={() => setFocused(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) setFocused(false)
        }}
      >
        <div className="dsr-scroll">
          <header className="dsr-top">
            <div className="dsr-brand">
              <span className="dsr-mark" aria-hidden>
                <span /><span /><span />
              </span>
              <span className="dsr-brand-text">
                <strong>Specimen</strong>
                <span>Project-tracker kit</span>
              </span>
            </div>
            <div className="dsr-top-tools">
              <span className="dsr-note">Recreation · invented data</span>
              <button
                type="button"
                className="dsr-button dsr-button-ghost dsr-button-sm dsr-demo"
                aria-pressed={demoOn}
                onClick={() => setDemoOn((value) => !value)}
              >
                {demoOn ? <PauseIcon size={14} weight="fill" aria-hidden /> : <PlayIcon size={14} weight="fill" aria-hidden />}
                {demoOn ? 'Pause demo' : 'Play demo'}
              </button>
            </div>
          </header>

          <LayoutGroup id={id}>
            <div className="dsr-board">
              <Card index={0} className="dsr-area-tokens" title="Tokens" meta={<ThemeSwitch mode={mode} onChange={changeMode} id={id} />}>
                <TokenLanes mode={mode} id={id} />
                <p className="dsr-pipeline">
                  <span>One source</span>
                  <CaretRightIcon size={12} weight="bold" aria-hidden />
                  <code>tokens.css</code>
                  <code>tokens.ts</code>
                  <code>figma.json</code>
                </p>
              </Card>

              <Card index={1} className="dsr-area-alerts" title="Alert" meta="5 tones">
                <ul className="dsr-alerts">
                  {alerts.map((alert) => (
                    <li key={alert.tone} className="dsr-alert" data-tone={alert.tone}>
                      <span className="dsr-alert-icon">{alertIcons[alert.tone]}</span>
                      <span className="dsr-alert-text">
                        <strong>{alert.title}</strong>
                        <span>{alert.body}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card index={2} className="dsr-area-filters" title="Select and Combobox" meta="Keyboard ready">
                <div className="dsr-stack">
                  <Select label="Project" options={['Design tokens', 'Components', 'Documentation', 'Website']} value={project} onChange={setProject} />
                  <ChipCombobox chips={chips} onChange={setChips} />
                </div>
                <p className="dsr-keys">
                  <kbd><ArrowDownIcon size={12} weight="bold" aria-label="Down arrow" /></kbd> Open <kbd>Enter</kbd> Choose <kbd>Esc</kbd> Close
                </p>
              </Card>

              <Card index={3} className="dsr-area-fields" title="Input" meta="4 states">
                <Fields />
              </Card>

              <Card
                index={4}
                className="dsr-area-steps"
                title="Steps"
                meta={
                  <button type="button" className="dsr-button dsr-button-outline dsr-button-sm" onClick={advance}>
                    {step >= milestones.length ? 'Start over' : 'Complete step'}
                  </button>
                }
              >
                <Steps current={step} />
              </Card>

              <Card index={5} className="dsr-area-buttons" title="Button" meta="Hierarchy, sizes, toast">
                <div className="dsr-button-rows">
                  <div className="dsr-row">
                    <button type="button" className="dsr-button dsr-button-solid" aria-busy={publishing} onClick={publish}>
                      <span className="dsr-button-content" data-busy={publishing}>
                        {publishing && <span className="dsr-spinner" aria-hidden />}
                        {publishing ? 'Publishing' : 'Publish'}
                      </span>
                    </button>
                    <button type="button" className="dsr-button dsr-button-outline"><EyeIcon size={16} weight="bold" aria-hidden />Preview</button>
                    <button type="button" className="dsr-button dsr-button-ghost">Cancel</button>
                    <button type="button" className="dsr-button dsr-button-link">Changelog</button>
                  </div>
                  <div className="dsr-row">
                    <button type="button" className="dsr-button dsr-button-solid dsr-button-sm">Small</button>
                    <button type="button" className="dsr-button dsr-button-solid">Medium</button>
                    <button type="button" className="dsr-button dsr-button-solid dsr-button-lg">Large</button>
                    <button type="button" className="dsr-button dsr-button-outline dsr-button-icon" aria-label="Add a task"><PlusIcon size={18} weight="bold" aria-hidden /></button>
                  </div>
                  <div className="dsr-row">
                    <button type="button" className="dsr-button dsr-button-solid" aria-busy="true" aria-disabled="true">
                      <span className="dsr-button-content"><span className="dsr-spinner" aria-hidden />Saving</span>
                    </button>
                    <button type="button" className="dsr-button dsr-button-solid" disabled>Disabled</button>
                  </div>
                  <div className="dsr-row dsr-toast-triggers" role="group" aria-labelledby={`${id}-toast-label`}>
                    <span className="dsr-row-label" id={`${id}-toast-label`}>Show a toast</span>
                    {(['neutral', 'success', 'danger'] as const).map((tone) => (
                      <button key={tone} type="button" className="dsr-button dsr-button-outline dsr-button-sm" data-tone={tone} onClick={() => pushToast(tone, true)}>
                        <span className="dsr-tone-swatch" aria-hidden />
                        {tone === 'neutral' ? 'Neutral' : tone === 'success' ? 'Success' : 'Danger'}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>

              <Card index={6} className="dsr-area-tasks" title="Tabs and Pagination" meta="Tasks">
                <Tasks tab={tab} onTab={setTab} page={page} onPage={setPage} id={id} />
              </Card>

              <Card index={7} className="dsr-area-team" title="Team" meta="Avatar and Switch">
                <div className="dsr-team">
                  <div className="dsr-avatars" role="group" aria-label="Reviewers: AK, LB, DR, VM and 3 more">
                    {people.map((person) => (
                      <span key={person.initials} className="dsr-avatar" data-tone={person.tone} aria-hidden>{person.initials}</span>
                    ))}
                    <span className="dsr-avatar dsr-avatar-more" aria-hidden>+3</span>
                  </div>
                  <Switch label="Email me when a release ships" checked={notifyRelease} onChange={setNotifyRelease} />
                  <Switch label="Weekly digest" checked={digest} onChange={setDigest} />
                </div>
              </Card>
            </div>
          </LayoutGroup>
        </div>

        <ToastStack toasts={toasts} paused={hidden} onDismiss={dismiss} />
        <span className="dsr-sr" role="status" aria-live="polite">{announcement}</span>
      </div>
    </MotionConfig>
  )
}
