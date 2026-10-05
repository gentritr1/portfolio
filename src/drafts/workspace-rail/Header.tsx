import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { projectCount, search, workspaces, type Hit, type Workspace, type WorkspaceId } from './data'

export interface Signal {
  ws: WorkspaceId
  nonce: number
  query?: string
}

interface HeaderProps {
  ws: Workspace
  first: boolean
  wide: boolean
  openSignal: Signal | null
  searchSignal: Signal | null
  onSwitch: (id: WorkspaceId) => void
  onFound: (target: string) => void
  onElsewhere: (id: WorkspaceId, query: string) => void
}

const tintStyle = (ws: Workspace) => ({ '--wr-tint': ws.tint }) as CSSProperties

function Switcher({ ws, startOpen, onSwitch }: Pick<HeaderProps, 'ws' | 'onSwitch'> & { startOpen: boolean }) {
  const here = workspaces.findIndex((w) => w.id === ws.id)
  const [open, setOpen] = useState(startOpen)
  const [instant, setInstant] = useState(startOpen)
  const [active, setActive] = useState(here)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const listId = useId()

  const show = (viaKeyboard: boolean) => {
    setInstant(viaKeyboard)
    setActive(here)
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    listRef.current?.focus()
    const away = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', away)
    return () => document.removeEventListener('pointerdown', away)
  }, [open])

  const choose = (index: number) => {
    setOpen(false)
    const target = workspaces[index]
    if (target.id === ws.id) buttonRef.current?.focus()
    else onSwitch(target.id)
  }

  const onListKey = (event: KeyboardEvent<HTMLUListElement>) => {
    const last = workspaces.length - 1
    if (event.key === 'ArrowDown') setActive((i) => (i >= last ? 0 : i + 1))
    else if (event.key === 'ArrowUp') setActive((i) => (i <= 0 ? last : i - 1))
    else if (event.key === 'Home') setActive(0)
    else if (event.key === 'End') setActive(last)
    else if (event.key === 'Enter' || event.key === ' ') choose(active)
    else if (event.key === 'Escape') {
      setOpen(false)
      buttonRef.current?.focus()
    } else if (event.key === 'Tab') {
      setOpen(false)
      return
    } else return
    event.preventDefault()
  }

  return (
    <div className="wr-switch" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="wr-chip"
        data-switcher={ws.id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`Workspace: ${ws.name}, ${ws.period}. Switch workspace`}
        onClick={(event) => (open ? setOpen(false) : show(event.detail === 0))}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            show(true)
          }
        }}
      >
        <span className="wr-chip-dot" aria-hidden="true" />
        <span className="wr-chip-name">{ws.name}</span>
        <span className="wr-chip-period">{ws.period}</span>
        <svg className="wr-caret" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-label="Workspaces"
          aria-activedescendant={`${listId}-${active}`}
          className="wr-pop wr-pop-switch"
          data-instant={instant || undefined}
          onKeyDown={onListKey}
        >
          {workspaces.map((w, index) => (
            <li
              key={w.id}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={w.id === ws.id}
              data-active={index === active || undefined}
              className="wr-option"
              style={tintStyle(w)}
              onPointerMove={() => setActive(index)}
              onClick={() => choose(index)}
            >
              <span className="wr-chip-dot" aria-hidden="true" />
              <span className="wr-option-name">{w.name}</span>
              <span className="wr-option-period">{w.period}</span>
              <span className="wr-option-count">{projectCount(w)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Search({ ws, wide, seed, onFound, onElsewhere }: Pick<HeaderProps, 'ws' | 'wide' | 'onFound' | 'onElsewhere'> & { seed?: string }) {
  const [query, setQuery] = useState(seed ?? '')
  const [open, setOpen] = useState(seed !== undefined)
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()

  const hits: Hit[] = search(ws.id, query).slice(0, 6)
  const elsewhere = query.trim()
    ? workspaces
        .filter((w) => w.id !== ws.id)
        .map((w) => ({ ws: w, count: search(w.id, query).length }))
        .filter((e) => e.count > 0)
    : []

  useEffect(() => {
    if (seed !== undefined) inputRef.current?.focus({ preventScroll: true })
  }, [seed])

  useEffect(() => {
    if (!open) return
    const away = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', away)
    return () => document.removeEventListener('pointerdown', away)
  }, [open])

  const pick = (hit: Hit | undefined) => {
    if (!hit) return
    setOpen(false)
    onFound(hit.target)
  }

  const onKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      if (!hits.length) return
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActive((i) => (i + step + hits.length) % hits.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      pick(hits[active])
    } else if (event.key === 'Escape') {
      if (open) setOpen(false)
      else setQuery('')
    }
  }

  const showPop = open && query.trim().length > 0

  return (
    <div className="wr-search" ref={rootRef}>
      <svg className="wr-search-icon" width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="7" cy="7" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d="m10.5 10.5 3.2 3.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <input
        ref={inputRef}
        type="search"
        role="combobox"
        data-search={ws.id}
        aria-label={`Search in ${ws.name}`}
        aria-expanded={showPop}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showPop && hits.length ? `${listId}-${active}` : undefined}
        placeholder={wide ? `Search in ${ws.name}` : 'Search'}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setActive(0)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKey}
      />
      <div className="wr-pop wr-pop-search" hidden={!showPop} data-instant="">
        <ul id={listId} role="listbox" aria-label={`Projects in ${ws.name}`}>
          {hits.map((hit, index) => (
            <li
              key={hit.slug}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              className="wr-hit"
              onPointerMove={() => setActive(index)}
              onClick={() => pick(hit)}
            >
              <span className="wr-hit-name">{hit.name}</span>
              <span className="wr-hit-line">{hit.line}</span>
            </li>
          ))}
        </ul>
        {hits.length === 0 && (
          <div className="wr-none" aria-live="polite">
            <p>Nothing in {ws.name} matches “{query.trim()}”.</p>
            {elsewhere.length > 0 && (
              <div className="wr-elsewhere">
                <span>Found in</span>
                {elsewhere.map((e) => (
                  <button key={e.ws.id} type="button" style={tintStyle(e.ws)} onClick={() => {
                      setOpen(false)
                      onElsewhere(e.ws.id, query)
                    }}>
                    <span className="wr-chip-dot" aria-hidden="true" />
                    {e.ws.name} · {e.count}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function Header(props: HeaderProps) {
  const { ws, first } = props
  const opened = props.openSignal?.ws === ws.id
  const seeded = props.searchSignal?.ws === ws.id
  return (
    <header className="wr-head" style={tintStyle(ws)}>
      <div className="wr-head-in">
        <Switcher key={`s-${opened ? props.openSignal!.nonce : 0}`} ws={ws} startOpen={opened} onSwitch={props.onSwitch} />
        <Search
          key={`q-${seeded ? props.searchSignal!.nonce : 0}`}
          ws={ws}
          wide={props.wide}
          seed={seeded ? props.searchSignal!.query ?? '' : undefined}
          onFound={props.onFound}
          onElsewhere={props.onElsewhere}
        />
        <p className="wr-id" aria-hidden={first ? undefined : true}>
          <strong>Gentrit Rashiti</strong> builds web and mobile products, 5+ years.
        </p>
      </div>
    </header>
  )
}
