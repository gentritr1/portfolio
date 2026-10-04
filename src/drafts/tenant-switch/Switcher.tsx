import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { CaretUpDownIcon, CheckIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { matches, tenantHaystack, tenants, type Tenant, type TenantId } from './data'

type Option =
  | { type: 'tenant'; tenant: Tenant }
  | { type: 'project'; tenant: Tenant; slug: string; name: string; outcome: string }

interface SwitcherProps {
  current: Tenant
  onSwitch: (id: TenantId, slug?: string) => void
}

const markStyle = (tenant: Tenant) => ({ '--ts-mark': tenant.accent }) as CSSProperties

export function Switcher({ current, onSwitch }: SwitcherProps) {
  const [open, setOpen] = useState(false)
  const [instant, setInstant] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()

  const options = useMemo<Option[]>(() => {
    const q = query.trim()
    const found: Option[] = tenants
      .filter((t) => !q || matches(tenantHaystack(t), q))
      .map((tenant) => ({ type: 'tenant', tenant }))
    if (!q) return found
    for (const tenant of tenants) {
      for (const row of tenant.rows) {
        if (matches(row.haystack, q)) found.push({ type: 'project', tenant, slug: row.slug, name: row.name, outcome: row.outcome })
      }
    }
    return found
  }, [query])

  const show = (viaKeyboard: boolean) => {
    setInstant(viaKeyboard)
    setQuery('')
    setActive(Math.max(0, tenants.findIndex((t) => t.id === current.id)))
    setOpen(true)
  }

  const close = (returnFocus: boolean) => {
    setOpen(false)
    if (returnFocus) triggerRef.current?.focus()
  }

  const choose = (option: Option | undefined) => {
    if (!option) return
    if (option.type === 'tenant') onSwitch(option.tenant.id)
    else onSwitch(option.tenant.id, option.slug)
    close(true)
  }

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (open) close(true)
        else show(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active, open, listId])

  const onInputKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActive((i) => (options.length ? (i + step + options.length) % options.length : 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      choose(options[active])
    } else if (event.key === 'Escape') {
      event.preventDefault()
      close(true)
    } else if (event.key === 'Tab') {
      close(false)
    }
  }

  const firstProject = options.findIndex((o) => o.type === 'project')

  return (
    <div className="ts-switcher" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="ts-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={(event) => (open ? close(false) : show(event.detail === 0))}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            show(true)
          }
        }}
      >
        <span className="ts-mark" aria-hidden="true">
          {current.mark}
        </span>
        <span className="ts-trigger-name">{current.group}</span>
        <span className="ts-trigger-count" key={current.id}>
          {current.rows.length}
          <span className="ts-sr"> projects</span>
        </span>
        <CaretUpDownIcon className="ts-trigger-caret" size={14} weight="bold" aria-hidden="true" />
      </button>

      {open && (
        <div className="ts-pop" role="dialog" aria-label="Switch workspace" data-instant={instant || undefined}>
          <div className="ts-pop-search">
            <MagnifyingGlassIcon size={16} aria-hidden="true" />
            <input
              ref={inputRef}
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-activedescendant={options.length ? `${listId}-${active}` : undefined}
              aria-autocomplete="list"
              aria-label="Find a workspace or a project"
              placeholder="Find a workspace or a project"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setActive(0)
              }}
              onKeyDown={onInputKey}
            />
            <kbd>esc</kbd>
          </div>

          <ul className="ts-pop-list" id={listId} role="listbox" aria-label="Workspaces and projects">
            {options.length > 0 && options[0].type === 'tenant' && (
              <li className="ts-pop-group" role="presentation">
                Workspaces
              </li>
            )}
            {options.map((option, index) => {
              const selected = option.type === 'tenant' && option.tenant.id === current.id
              return (
                <li key={option.type === 'tenant' ? option.tenant.id : `${option.tenant.id}/${option.slug}`} role="presentation">
                  {index === firstProject && (
                    <div className="ts-pop-group" role="presentation">
                      Projects
                    </div>
                  )}
                  <div
                    id={`${listId}-${index}`}
                    role="option"
                    aria-selected={index === active}
                    data-current={selected || undefined}
                    className={`ts-option ts-option-${option.type}`}
                    style={markStyle(option.tenant)}
                    onPointerMove={() => setActive(index)}
                    onClick={() => choose(option)}
                  >
                    <span className="ts-mark" data-small={option.type === 'project' || undefined} aria-hidden="true">
                      {option.tenant.mark}
                    </span>
                    {option.type === 'tenant' ? (
                      <>
                        <span className="ts-option-name">
                          {option.tenant.group}
                          <span className="ts-option-sub">{option.tenant.period}</span>
                        </span>
                        <span className="ts-option-count">{option.tenant.rows.length}</span>
                        <CheckIcon className="ts-option-check" size={14} weight="bold" aria-hidden="true" data-on={selected || undefined} />
                      </>
                    ) : (
                      <span className="ts-option-name">
                        {option.name}
                        <span className="ts-option-sub">{option.outcome}</span>
                      </span>
                    )}
                  </div>
                </li>
              )
            })}
            {options.length === 0 && (
              <li className="ts-pop-empty" role="presentation">
                No workspace or project matches “{query}”.
              </li>
            )}
          </ul>

          <div className="ts-pop-foot" aria-hidden="true">
            <span>
              <kbd>↑</kbd>
              <kbd>↓</kbd> move
            </span>
            <span>
              <kbd>↵</kbd> switch
            </span>
            <span className="ts-pop-foot-k">
              <kbd>⌘</kbd>
              <kbd>K</kbd> open
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
