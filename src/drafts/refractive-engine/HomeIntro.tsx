import { useEffect, useState, type CSSProperties } from 'react'
import { ArrowUpRightIcon } from '@phosphor-icons/react'
import { BASE, plain } from './data'
import { STAGE } from './sceneSupport'
import { cropVars, type Shot } from './screens'

const LAYERS = [
  { name: 'Interface', text: 'Team requests, approvals and a shared calendar.' },
  { name: 'Server rules', text: 'Roles and organization membership are checked on the server.' },
  { name: 'Data', text: 'SQLite stores workspaces, requests and balances.' },
]

/**
 * Server rules: Offday's own privacy section (capture manifest: design/selected-work-concepts/offday-shots), cut to the
 * request card in its Teammate view. Wide frames take a 2.05 cut, narrower ones a 1.55 cut around the card alone.
 */
const RULES: Shot = {
  src: '/showcase/offday/offday-landing-security.webp', w: 2880, h: 1800,
  alt: "Offday's privacy section: Sofia's vacation request as a teammate sees it, with the dates and her private note locked. Invented data.",
}
// The wide cut starts at x 1280: the section's paragraph ends at 1264 and would show as a sliver at the left edge.
const rulesCrop = { ...cropVars(RULES, [1280, 226, 1558, 760]), ...cropVars(RULES, [1451, 239, 1130, 729], 'n') } as CSSProperties

/** Data: Offday's tables as its schema declares them (Offday dacf3ab, lib/store.ts), a few columns each. */
const TABLES: [table: string, tenant: boolean, columns: string][] = [
  ['organizations', false, 'id · name · allowance'],
  ['employees', true, 'department · allowance'],
  ['users', true, 'role: manager or employee'],
  ['requests', true, 'start · end · status · note'],
  ['shifts', true, 'employee_id · date'],
]

/** The work is readable before the field loads. Each layer button brings that layer of Offday to the front of the stack. */
export function HomeIntro({ onOpen }: { onOpen(slug: string, trigger: HTMLAnchorElement, keyboard: boolean): void }) {
  const [layer, setLayer] = useState(0)
  const [instant, setInstant] = useState(false)
  // The server-rules screen loads once a pointer or focus reaches the layer buttons, or 2.5 s in, so it never competes with
  // the calendar for the first paint; until then its plate shows as a bare edge.
  const [armed, setArmed] = useState(false)
  // The description animates only once a reader has changed the layer, never on the first paint.
  const [moved, setMoved] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setArmed(true), 2500)
    return () => clearTimeout(id)
  }, [])
  const choose = (i: number, keyboard: boolean) => {
    setArmed(true)
    setMoved(true)
    setInstant(keyboard)
    setLayer(i)
  }
  return (
    <>
      <header id="re-top" className="re-intro re-own-item" data-stage={STAGE.hero} data-instant={instant || undefined} data-moved={moved || undefined}>
        <div className="re-intro-copy re-solid">
          <h1 tabIndex={-1}><span>I build web and mobile products,</span>{' '}<span>from interface to backend.</span></h1>
          <p className="re-intro-role">Frontend · Backend · Mobile</p>
          <p className="re-intro-bio">5+ years shipping web and mobile products.<br />Based in Kosovo, working remotely.</p>
          <a className="re-text-link" href="#re-workflow">AI in the workflow <ArrowUpRightIcon aria-hidden="true" size={17} /></a>
        </div>

        <div className="re-intro-product re-solid">
          <h2>Offday</h2>
          {/* The live region stays; the line inside it is replaced, so it is announced and can arrive with the plate. */}
          <p className="re-intro-detail" aria-live="polite"><span key={layer}>{LAYERS[layer].text}</span></p>
          <p className="re-intro-credit">Own product, a working MVP built with one other developer</p>
          <a className="re-text-link" href={`${BASE}/offday`} onClick={(e) => {
            if (!plain(e)) return
            e.preventDefault()
            onOpen('offday', e.currentTarget, e.detail === 0)
          }}>Read the case <ArrowUpRightIcon aria-hidden="true" size={17} /></a>
        </div>

        <figure className="re-intro-art" data-work="offday">
          {/* Phones only: the product's name and status inside the first screen; its description and case link follow the stack. */}
          <p className="re-stk-status">Offday, a working MVP built with one other developer.</p>
          {/* Offday's layers as a stack of plates, Interface in front. data-d is each plate's depth from the chosen one. */}
          <div className="re-stk re-sw-lead">
            {LAYERS.map((item, i) => (
              // A plate behind the chosen one also takes a click on its visible edge; the buttons below are the keyboard way.
              <div key={item.name} className="re-stk-plate" data-l={i} data-d={i - layer} aria-hidden={i !== layer || undefined}
                onClick={i > layer ? () => choose(i, false) : undefined}>
                {i === 0 && (
                  <img className="re-intro-ui" src="/showcase/offday/offday-desktop-calendar.webp" width={2880} height={1800}
                    alt="Offday's October team calendar, leave bars and manager approval queue. Invented data."
                    fetchPriority="high" decoding="async" />
                )}
                {i === 1 && (armed || layer === 1) && (
                  <img className="re-intro-rules" src={RULES.src} width={RULES.w} height={RULES.h} alt={RULES.alt} style={rulesCrop} decoding="async" />
                )}
                {i === 2 && (
                  <div className="re-intro-tables">
                    <p>Offday's tables · SQLite</p>
                    <dl>
                      {TABLES.map(([table, tenant, columns]) => (
                        <div key={table}><dt>{table}</dt><dd>{tenant && <b>org_id</b>}{tenant && ' · '}{columns}</dd></div>
                      ))}
                    </dl>
                    <p>From lib/store.ts. Company records carry an org_id.</p>
                  </div>
                )}
                <span className="re-stk-name">{item.name}</span>
              </div>
            ))}
          </div>
          <div className="re-stk-control" role="group" aria-label="Explore Offday's layers" style={{ '--i': layer } as CSSProperties}
            onPointerEnter={() => setArmed(true)} onFocus={() => setArmed(true)}>
            <span className="re-stk-thumb" aria-hidden="true" />
            {LAYERS.map((item, i) => (
              <button key={item.name} type="button" data-l={i} aria-pressed={layer === i} onClick={(e) => choose(i, e.detail === 0)}>{item.name}</button>
            ))}
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
