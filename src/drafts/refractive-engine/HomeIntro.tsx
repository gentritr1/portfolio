import { useState } from 'react'
import { ArrowUpRightIcon } from '@phosphor-icons/react'
import { BASE, plain } from './data'
import { STAGE } from './sceneSupport'

const LAYERS = [
  { name: 'Interface', text: 'Team requests, approvals and a shared calendar.' },
  { name: 'Server rules', text: 'Roles and organization membership are checked on the server.' },
  { name: 'Data', text: 'SQLite stores workspaces, requests and balances.' },
]

/** The work is readable before the field loads. Layer choices explain the actual Offday boundaries. */
export function HomeIntro({ onOpen }: { onOpen(slug: string, trigger: HTMLAnchorElement, keyboard: boolean): void }) {
  const [layer, setLayer] = useState(0)
  const [instant, setInstant] = useState(false)
  return (
    <>
      <header id="re-top" className="re-intro re-own-item" data-stage={STAGE.hero} data-instant={instant || undefined}>
        <div className="re-intro-copy re-solid">
          <h1 tabIndex={-1}><span>I build web and mobile products,</span>{' '}<span>from interface to backend.</span></h1>
          <p className="re-intro-role">Frontend · Backend · Mobile</p>
          <p className="re-intro-bio">5+ years shipping web and mobile products.<br />Based in Kosovo, working remotely.</p>
          <a className="re-text-link" href="#re-workflow">AI in the workflow <ArrowUpRightIcon aria-hidden="true" size={17} /></a>
        </div>

        <div className="re-intro-product re-solid">
          <h2>Offday</h2>
          <p className="re-intro-detail" aria-live="polite">{LAYERS[layer].text}</p>
          <p className="re-intro-credit">Own product, built with one other developer</p>
          <a className="re-text-link" href={`${BASE}/offday`} onClick={(e) => {
            if (!plain(e)) return
            e.preventDefault()
            onOpen('offday', e.currentTarget, e.detail === 0)
          }}>Read the case <ArrowUpRightIcon aria-hidden="true" size={17} /></a>
        </div>

        <figure className="re-intro-art" data-work="offday" data-layer={layer}>
          <div className="re-intro-stack">
            <div className="re-intro-plate re-intro-data" aria-hidden="true" />
            <div className="re-intro-plate re-intro-server" aria-hidden="true" />
            <div className="re-intro-layer-controls" role="group" aria-label="Explore Offday's layers">
              {LAYERS.map((item, i) => (
                <button key={item.name} type="button" aria-pressed={layer === i} onClick={(e) => {
                  setInstant(e.detail === 0)
                  setLayer(i)
                }}>{item.name}</button>
              ))}
            </div>
            <div className="re-intro-screen re-sw-lead">
              <img src="/showcase/offday/offday-desktop-calendar.webp" width={2880} height={1800}
                alt="Offday's October team calendar, leave bars and manager approval queue. Invented data."
                fetchPriority="high" decoding="async" />
            </div>
          </div>
          <figcaption>Real product screens, invented data.</figcaption>
        </figure>
      </header>

      <nav className="re-evidence re-solid" aria-label="Across the stack">
        <ul>
          <li><a href="#work-bayyinah">Bayyinah TV <ArrowUpRightIcon aria-hidden="true" size={17} /></a><p>Frontend · streaming, English + Arabic</p></li>
          <li><a href="#re-backend">Tondo + LeakScan <ArrowUpRightIcon aria-hidden="true" size={17} /></a><p>Backend · realtime servers, scan jobs</p></li>
          <li><a href="#work-reading">Read to Feed <ArrowUpRightIcon aria-hidden="true" size={17} /></a><p>Mobile · about 14 store releases</p></li>
          <li><a href="#re-workflow">Care platform <ArrowUpRightIcon aria-hidden="true" size={17} /></a><p>AI workflow · tests, agents, checks, human review</p></li>
        </ul>
      </nav>
    </>
  )
}
