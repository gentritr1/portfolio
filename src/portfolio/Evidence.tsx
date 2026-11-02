import { ArrowUpRightIcon } from '@phosphor-icons/react'
import { BASE, plain } from "./data"

type OpenCase = (slug: string, trigger: HTMLAnchorElement, keyboard: boolean) => void

/** Backend decisions and AI delivery are visible evidence, rather than items buried in the tools list. */
export function Evidence({ onOpen }: { onOpen: OpenCase }) {
  return (
    <>
      <section id="re-backend" className="re-engineering re-solid" aria-labelledby="re-backend-h">
        <div className="re-engineering-head"><h2 id="re-backend-h" className="re-h2">The servers behind the screens.</h2><p>Game moves, company records and security scans all need rules the server can enforce.</p></div>
        <div className="re-engineering-rows">
          <article>
            <figure className="re-backend-media">
              <img className="re-backend-shot" src="/personal/shots/tondo-desktop.webp" width={2880} height={1800} alt="Tondo's round card table with bot players." loading="lazy" decoding="async" />
            </figure>
            <h3>Tondo &amp; Za!</h3>
            <p className="re-engineering-decision">The server checks every move.</p>
            <p>Players choose a move. A Node.js server checks it against the game rules and sends the updated state to each player over WebSockets. Tondo stores saved crews in PostgreSQL.</p>
            <p className="re-engineering-meta">Own products · Node · WebSocket · PostgreSQL</p>
            <a className="re-text-link" href="https://github.com/gentritr1/tondo" target="_blank" rel="noreferrer">Explore the code <ArrowUpRightIcon aria-hidden="true" size={17} /><span className="re-sr"> (opens in a new tab)</span></a>
          </article>
          <article>
            <figure className="re-backend-media">
              <img className="re-backend-shot" src="/showcase/leakscan/leakscan-desktop-report.webp" width={2880} height={1800} alt="LeakScan's report for an invented app, showing findings and fixes. Invented data." loading="lazy" decoding="async" />
              <figcaption>Real product screen, invented data.</figcaption>
            </figure>
            <h3>LeakScan</h3>
            <p className="re-engineering-decision">Check ownership before scanning an app.</p>
            <p>The flow covers payment, proof of domain ownership, scans and rescans. Stored credentials are encrypted and expire after 14 days. The app’s owner can delete them at any time.</p>
            <p className="re-engineering-meta">Built alone · Pre-launch · Next.js · Postgres</p>
            <a className="re-text-link" href={`${BASE}/leakscan`} onClick={(e) => {
              if (!plain(e)) return
              e.preventDefault()
              onOpen('leakscan', e.currentTarget, e.detail === 0)
            }}>Read the case <ArrowUpRightIcon aria-hidden="true" size={17} /></a>
          </article>
        </div>
      </section>

      <section id="re-workflow" className="re-workflow re-solid" aria-labelledby="re-workflow-h">
        <div className="re-engineering-head"><h2 id="re-workflow-h" className="re-h2">Checked before it changes.</h2><p>The care-platform rewrite. A team effort, in progress.</p></div>
        <div className="re-workflow-body">
          <p>The team wrote the rules and the checks. AI agents build inside them, and a person on the team approves each change.</p>
          <ol aria-label="The care-platform delivery process"><li>Test the existing screen</li><li>Agents build</li><li>Run the checks</li><li>A person approves</li></ol>
          <p className="re-workflow-note">When a check fails, the agents revise the change. The team also tests the checks themselves to make sure they catch failures.</p>
          <a className="re-text-link" href={`${BASE}/care-platform`} onClick={(e) => {
            if (!plain(e)) return
            e.preventDefault()
            onOpen('care-platform', e.currentTarget, e.detail === 0)
          }}>See the rewrite <ArrowUpRightIcon aria-hidden="true" size={17} /></a>
          <p className="re-workflow-products">Other projects put AI in the product itself: document chat, image generation and Offday’s workspace assistant.</p>
        </div>
      </section>

      <section id="re-about" className="re-about re-solid" aria-labelledby="re-about-h">
        <h2 id="re-about-h" className="re-h2">From the interface to the whole product.</h2>
        <div>
          <p>I’m a software engineer with a background in frontend and mobile. I’ve stayed with products through store releases, framework upgrades and the fixes that come after launch.</p>
          <p>Since 2026, my work also includes Laravel APIs, database reports and permissions. My own projects extend that into realtime Node.js servers and AI features.</p>
          {/* Owner's mentoring account, 2026-11-02. No claim of a measured onboarding improvement. */}
          <p>I onboard developers to the care-platform rewrite. We discuss existing behavior, bugs and how to move one slice at a time. I also guide how we choose and coordinate AI agents within the team’s rules and checks.</p>
          <p>New tools keep me learning. The work still needs clear decisions, tests I can trust and a person accountable for the result.</p>
          <a className="re-text-link" href={`${BASE}/care-platform`} onClick={(e) => {
            if (!plain(e)) return
            e.preventDefault()
            onOpen('care-platform', e.currentTarget, e.detail === 0)
          }}>See the care-platform work <ArrowUpRightIcon aria-hidden="true" size={17} /></a>
          <p className="re-engineering-meta">Based in Kosovo · Working remotely</p>
        </div>
      </section>
    </>
  )
}
