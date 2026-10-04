import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent } from 'react'
import { useSearchParams } from 'react-router'
import { EnvelopeSimpleIcon, FileTextIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { links } from '../../content/links'
import { matches, tenantById, tenants, totalProjects, type Row, type TenantId } from './data'
import { ProofBody } from './Proof'
import { Switcher } from './Switcher'
import './tenant-switch.css'

function useMedia(query: string) {
  return useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', notify)
      return () => list.removeEventListener('change', notify)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

function useLastInput() {
  const last = useRef<'pointer' | 'keyboard'>('pointer')
  useEffect(() => {
    const onKey = () => (last.current = 'keyboard')
    const onPointer = () => (last.current = 'pointer')
    window.addEventListener('keydown', onKey, true)
    window.addEventListener('pointerdown', onPointer, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      window.removeEventListener('pointerdown', onPointer, true)
    }
  }, [])
  return last
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

export default function Draft() {
  const [params, setParams] = useSearchParams()
  const tenant = tenantById(params.get('w'))
  const [filter, setFilter] = useState('')
  const [switched, setSwitched] = useState(false)
  const [picked, setPicked] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [announce, setAnnounce] = useState('')
  const wide = useMedia('(min-width: 1024px)')
  const lastInput = useLastInput()
  const filterRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const rows = filter.trim() ? tenant.rows.filter((row) => matches(row.haystack, filter)) : tenant.rows
  const selected: Row = rows.find((row) => row.slug === params.get('p')) ?? rows[0] ?? tenant.rows[0]
  const instant = lastInput.current === 'keyboard'

  const query = filter.trim()
  const elsewhere = query
    ? tenants
        .filter((t) => t.id !== tenant.id)
        .map((t) => ({ tenant: t, count: t.rows.filter((row) => matches(row.haystack, query)).length }))
        .filter((hit) => hit.count > 0)
    : []

  const switchTo = (id: TenantId, slug?: string, keepFilter = false) => {
    const next = tenantById(id)
    setParams(
      (prev) => {
        const out = new URLSearchParams(prev)
        out.set('w', id)
        if (slug) out.set('p', slug)
        else out.delete('p')
        return out
      },
      { replace: true },
    )
    if (!keepFilter) setFilter('')
    setCollapsed(false)
    if (next.id !== tenant.id) setSwitched(true)
    setAnnounce(`Switched to ${next.group}. ${plural(next.rows.length, 'project')}. Role: ${next.role}.`)
  }

  const anchor = useRef<{ slug: string; top: number } | null>(null)

  useLayoutEffect(() => {
    const held = anchor.current
    anchor.current = null
    if (!held) return
    const button = listRef.current?.querySelector<HTMLElement>(`[data-slug="${held.slug}"]`)
    if (button) window.scrollBy(0, button.getBoundingClientRect().top - held.top)
  })

  const select = (slug: string) => {
    if (!wide) {
      const button = listRef.current?.querySelector<HTMLElement>(`[data-slug="${slug}"]`)
      if (button) anchor.current = { slug, top: button.getBoundingClientRect().top }
    }
    if (!wide && slug === selected.slug) {
      setCollapsed((c) => !c)
      return
    }
    setCollapsed(false)
    setPicked(true)
    setParams(
      (prev) => {
        const out = new URLSearchParams(prev)
        out.set('w', tenant.id)
        out.set('p', slug)
        return out
      },
      { replace: true },
    )
  }

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (event.key === '/' && !/^(INPUT|TEXTAREA)$/.test(target.tagName)) {
        event.preventDefault()
        filterRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const onRowKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    const next = rows[index + (event.key === 'ArrowDown' ? 1 : -1)]
    if (!next) return
    listRef.current?.querySelector<HTMLButtonElement>(`[data-slug="${next.slug}"]`)?.focus()
    if (wide) select(next.slug)
  }

  const shellStyle = { '--ts-accent': tenant.accent } as CSSProperties

  return (
    <div className="ts" style={shellStyle} data-tenant={tenant.id} data-switched={switched || undefined}>
      <title>{`${tenant.group} · Gentrit Rashiti`}</title>
      <header className="ts-bar">
        <div className="ts-bar-left">
          <Switcher current={tenant} onSwitch={switchTo} />
          <span className="ts-crumb" aria-hidden="true">
            /
          </span>
          <span className="ts-crumb-page">Projects</span>
        </div>
        <nav className="ts-bar-right" aria-label="Contact">
          <a className="ts-navlink ts-hide-sm" href={links.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a className="ts-navlink ts-hide-sm" href={links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a className="ts-navlink" href={links.cv}>
            <FileTextIcon size={16} aria-hidden="true" />
            CV
          </a>
          <a className="ts-button ts-button-primary ts-bar-email" href={`mailto:${links.email}`}>
            <EnvelopeSimpleIcon size={16} weight="bold" aria-hidden="true" />
            <span className="ts-hide-sm">Email</span>
            <span className="ts-sr ts-show-sm">Email Gentrit</span>
          </a>
        </nav>
      </header>

      <main className="ts-main">
        <div className="ts-intro">
          <h1>Gentrit Rashiti, frontend and mobile developer, full stack since 2026. 5+ years, two platform rewrites.</h1>
          <p>
            {plural(totalProjects, 'project')} in {tenants.length} workspaces. Each keeps its own projects, role and colour, like each
            organization in the care platform he builds.{' '}
            <span className="ts-hint-touch">Switch in the top bar.</span>
            <span className="ts-hint-k">
              Press <kbd>⌘</kbd>
              <kbd>K</kbd> to switch.
            </span>
          </p>
        </div>

        <div className="ts-grid">
          <section className="ts-list" aria-labelledby="ts-ws-name">
            <div className="ts-ws" key={`ws-${tenant.id}`} data-enter={switched || undefined} data-instant={instant || undefined}>
              <div className="ts-ws-title">
                <h2 id="ts-ws-name">{tenant.group}</h2>
                <span className="ts-role">{tenant.role}</span>
              </div>
              <p className="ts-ws-summary">{tenant.summary}</p>
            </div>

            <div className="ts-toolbar">
              <label className="ts-filter">
                <MagnifyingGlassIcon size={16} aria-hidden="true" />
                <span className="ts-sr">Filter projects in {tenant.group}</span>
                <input
                  ref={filterRef}
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  placeholder={`Filter ${plural(tenant.rows.length, 'project')}`}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') setFilter('')
                    if (event.key === 'ArrowDown') {
                      event.preventDefault()
                      listRef.current?.querySelector<HTMLButtonElement>('[data-slug]')?.focus()
                    }
                  }}
                />
                <kbd className="ts-hint-k">/</kbd>
              </label>
              <span className="ts-toolbar-meta">
                <span className="ts-period">{tenant.period}</span>
                <span className="ts-toolbar-count" key={`${tenant.id}-${rows.length}`} data-enter={switched || undefined}>
                  {rows.length === tenant.rows.length ? plural(rows.length, 'project') : `${rows.length} of ${tenant.rows.length}`}
                </span>
              </span>
            </div>

            <div className="ts-head" aria-hidden="true">
              <span>Project</span>
              <span>Outcome</span>
              <span>Scope</span>
              <span>Years</span>
            </div>

            <ul className="ts-rows" ref={listRef} key={`rows-${tenant.id}`} data-enter={switched || undefined} data-instant={instant || undefined}>
              {rows.map((row, index) => {
                const isSelected = row.slug === selected.slug
                const expanded = !wide && isSelected && !collapsed
                return (
                  <li key={row.slug} className="ts-row" style={{ '--i': index } as CSSProperties} data-selected={isSelected || undefined}>
                    <button
                      type="button"
                      className="ts-row-button"
                      data-slug={row.slug}
                      aria-current={wide && isSelected ? 'true' : undefined}
                      aria-expanded={wide ? undefined : expanded}
                      aria-controls={wide ? 'ts-proof' : `ts-inline-${row.slug}`}
                      onClick={() => select(row.slug)}
                      onKeyDown={(event) => onRowKey(event, index)}
                    >
                      <span className="ts-row-name">
                        <span className="ts-dot" aria-hidden="true" />
                        {row.name}
                      </span>
                      <span className="ts-row-outcome">{row.outcome}</span>
                      <span className="ts-row-scope">{row.scope}</span>
                      <span className="ts-row-years">{row.years}</span>
                    </button>
                    {expanded && (
                      <div className="ts-inline" id={`ts-inline-${row.slug}`}>
                        <ProofBody row={row} />
                      </div>
                    )}
                  </li>
                )
              })}
              {rows.length === 0 && (
                <li className="ts-empty">
                  No project in {tenant.group} matches “{query}”.{' '}
                  {elsewhere.length === 0 && 'No other workspace has one either. Press Esc to clear the filter.'}
                </li>
              )}
            </ul>

            {elsewhere.length > 0 && (
              <div className="ts-elsewhere" aria-live="polite">
                <span>{rows.length === 0 ? 'Found in other workspaces:' : 'Also in other workspaces:'}</span>
                {elsewhere.map(({ tenant: other, count }) => (
                  <button
                    key={other.id}
                    type="button"
                    className="ts-elsewhere-button"
                    style={{ '--ts-mark': other.accent } as CSSProperties}
                    onClick={() => switchTo(other.id, undefined, true)}
                  >
                    <span className="ts-mark" data-small aria-hidden="true">
                      {other.mark}
                    </span>
                    {other.group}
                    <span className="ts-elsewhere-count">{count}</span>
                  </button>
                ))}
              </div>
            )}
          </section>

          {wide && (
            <aside className="ts-proof" id="ts-proof" aria-label={`Proof: ${selected.name}`}>
              <div
                className="ts-proof-card"
                key={selected.slug}
                data-enter={switched || picked || undefined}
                data-instant={instant || undefined}
              >
                <header className="ts-proof-head">
                  <h3>{selected.name}</h3>
                  <span>{selected.years === '—' ? selected.kind : `${selected.kind} · ${selected.years}`}</span>
                </header>
                <ProofBody row={selected} />
              </div>
            </aside>
          )}
        </div>
      </main>

      <footer className="ts-foot">
        <span>Gentrit Rashiti. Based in Kosovo, working remotely.</span>
        <span className="ts-foot-links">
          <a href={`mailto:${links.email}`}>{links.email}</a>
          <a href={links.cv}>CV</a>
          <a href={links.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </span>
      </footer>

      <p className="ts-sr" aria-live="polite">
        {announce}
      </p>
    </div>
  )
}
