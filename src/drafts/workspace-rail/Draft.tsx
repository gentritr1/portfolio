import { useCallback, useEffect, useState, useSyncExternalStore, type CSSProperties } from 'react'
import { links } from '../../content/links'
import { projectName, workspaces, type WorkspaceId } from './data'
import { Header, type Signal } from './Header'
import { Block } from './Rail'
import './workspace-rail.css'

function useMedia(query: string, fallback: boolean) {
  return useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', notify)
      return () => list.removeEventListener('change', notify)
    },
    () => window.matchMedia(query).matches,
    () => fallback,
  )
}

function currentSection(): WorkspaceId {
  for (const ws of workspaces) {
    const rect = document.getElementById(`wr-ws-${ws.id}`)?.getBoundingClientRect()
    if (rect && rect.bottom > 60) return ws.id
  }
  return workspaces[0].id
}

export default function Draft() {
  const wide = useMedia('(min-width: 1024px) and (min-height: 700px)', true)
  const reduced = useMedia('(prefers-reduced-motion: reduce)', false)
  const [openSignal, setOpenSignal] = useState<Signal | null>(null)
  const [searchSignal, setSearchSignal] = useState<Signal | null>(null)
  const [found, setFound] = useState<string | null>(null)

  const jump = useCallback((id: WorkspaceId) => {
    const section = document.getElementById(`wr-ws-${id}`)
    if (!section) return
    window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY, behavior: 'instant' })
    section.querySelector<HTMLElement>(`[data-switcher="${id}"]`)?.focus({ preventScroll: true })
  }, [])

  const reveal = useCallback((target: string) => {
    const el = document.getElementById(target)
    if (!el) return
    const rect = el.getBoundingClientRect()
    const block = el.closest<HTMLElement>('.wr-block')
    const line = block
      ? parseFloat(getComputedStyle(block).getPropertyValue('--wr-top')) + parseFloat(getComputedStyle(block).getPropertyValue('--wr-station'))
      : (window.innerHeight - rect.height) / 2
    window.scrollTo({ top: window.scrollY + rect.top - line, behavior: 'instant' })
    el.focus({ preventScroll: true })
    setFound(target)
  }, [])

  const elsewhere = useCallback(
    (id: WorkspaceId, query: string) => {
      jump(id)
      setSearchSignal({ ws: id, nonce: Date.now(), query })
    },
    [jump],
  )

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      const typing = /^(INPUT|TEXTAREA)$/.test(target.tagName)
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpenSignal({ ws: currentSection(), nonce: Date.now() })
      } else if (event.key === '/' && !typing) {
        event.preventDefault()
        const id = currentSection()
        document.querySelector<HTMLInputElement>(`[data-search="${id}"]`)?.focus({ preventScroll: true })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!found) return
    document.querySelectorAll('[data-found]').forEach((el) => el.removeAttribute('data-found'))
    document.getElementById(found)?.setAttribute('data-found', '')
  }, [found])

  return (
    <div className="wr">
      <title>Gentrit Rashiti, workspaces</title>
      <main>
        {workspaces.map((ws, wsIndex) => (
          <section key={ws.id} id={`wr-ws-${ws.id}`} className="wr-ws" aria-labelledby={`wr-claim-${ws.id}`} style={{ '--wr-tint': ws.tint } as CSSProperties}>
            <Header
              ws={ws}
              first={wsIndex === 0}
              wide={wide}
              openSignal={openSignal}
              searchSignal={searchSignal}
              onSwitch={jump}
              onFound={reveal}
              onElsewhere={elsewhere}
            />
            {wsIndex === 0 && (
              <p className="wr-id-phone">
                <strong>Gentrit Rashiti</strong> builds web and mobile products, 5+ years.
              </p>
            )}
            <h2 id={`wr-claim-${ws.id}`} className="wr-claim">
              {ws.claim}
            </h2>
            {ws.cards.map((card, cardIndex) => (
              <Block key={card.id} card={card} wide={wide} eager={wsIndex === 0 && cardIndex === 0} reduced={reduced} />
            ))}
            {ws.also.length > 0 && (
              <p className="wr-also">
                <span className="wr-also-label">Also in {ws.name}</span>
                {ws.also.map((slug, index) => (
                  <span key={slug} id={`wr-also-${slug}`} className="wr-also-item" tabIndex={-1}>
                    {projectName(slug)}
                    {index < ws.also.length - 1 && <span aria-hidden="true"> · </span>}
                  </span>
                ))}
              </p>
            )}
          </section>
        ))}
      </main>
      <footer className="wr-foot">
        <p>
          <strong>Gentrit Rashiti</strong>. Web and mobile, full stack since 2026. Bachelor’s degree, UBT. Based in Kosovo, working remotely.
        </p>
        <p className="wr-foot-links">
          <a href={`mailto:${links.email}`}>{links.email}</a>
          <a href={links.cv}>Download CV</a>
          <a href={links.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </p>
        <p className="wr-foot-note">Vianova and AvahiTech screens are recreations with invented data. The others come from public store and web pages.</p>
      </footer>
    </div>
  )
}
