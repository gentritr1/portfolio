import { ArrowUpRightIcon } from '@phosphor-icons/react'
import { BASE, plain } from './data'

type OpenCase = (slug: string, trigger: HTMLAnchorElement, keyboard: boolean) => void

/** Backend decisions and AI delivery are visible evidence, rather than items buried in the tools list. */
export function Evidence({ onOpen }: { onOpen: OpenCase }) {
  return (
    <>
      <section id="re-backend" className="re-engineering re-solid" aria-labelledby="re-backend-h">
        <div className="re-engineering-head"><h2 id="re-backend-h" className="re-h2">The servers behind the screens.</h2><p>Game state, company data and scan jobs. Different products, different boundaries to get right.</p></div>
        <div className="re-engineering-rows">
          <article>
            <img className="re-backend-shot" src="/personal/shots/tondo-desktop.webp" width={2880} height={1800} alt="Tondo's round card table with bot players." loading="lazy" decoding="async" />
            <h3>Tondo &amp; Za!</h3>
            <p className="re-engineering-decision">The server decides every move.</p>
            <p>Players send their intended move. A Node server checks the rules and sends each player the new state over WebSockets. Tondo keeps saved crews in PostgreSQL.</p>
            <p className="re-engineering-meta">Own products · Node · WebSocket · PostgreSQL</p>
            <a className="re-text-link" href="https://github.com/gentritr1/tondo" target="_blank" rel="noreferrer">Explore the code <ArrowUpRightIcon aria-hidden="true" size={17} /><span className="re-sr"> (opens in a new tab)</span></a>
          </article>
          <article>
            <img className="re-backend-shot" src="/showcase/leakscan/leakscan-desktop-report.webp" width={2880} height={1800} alt="LeakScan's report for an invented app, showing findings and fixes. Invented data." loading="lazy" decoding="async" />
            <p className="re-engineering-meta">Real product screen, invented data.</p>
            <h3>LeakScan</h3>
            <p className="re-engineering-decision">Verify ownership. Run the checks. Explain the findings.</p>
            <p>Domain verification, payments, scan jobs and rescans form one flow. Stored credentials are encrypted, can be deleted by the app’s owner, and expire after 14 days.</p>
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
        <div className="re-engineering-head"><h2 id="re-workflow-h" className="re-h2">AI in the workflow.</h2><p>The care-platform rewrite, a team effort.</p></div>
        <div className="re-workflow-body">
          <p>The team wrote the rules and the checks. AI agents build inside them, and a person on the team approves each change.</p>
          <ol aria-label="The care-platform delivery process"><li>Test the existing screen</li><li>Agents build</li><li>Run the checks</li><li>A person approves</li></ol>
          <p className="re-workflow-note">A check fails? Back to the agents. A check is trusted only after it is shown to fail.</p>
          <a className="re-text-link" href={`${BASE}/care-platform`} onClick={(e) => {
            if (!plain(e)) return
            e.preventDefault()
            onOpen('care-platform', e.currentTarget, e.detail === 0)
          }}>See the rewrite <ArrowUpRightIcon aria-hidden="true" size={17} /></a>
          <p className="re-workflow-products">AI inside products, too: document chat, image generation and Offday’s workspace assistant.</p>
        </div>
      </section>

      <section id="re-about" className="re-about re-solid" aria-labelledby="re-about-h">
        <h2 id="re-about-h" className="re-h2">From the interface to the whole product.</h2>
        <div><p>My background is frontend and mobile: web platforms, iOS and Android apps, store releases and framework upgrades.</p><p>Recent work extends across APIs, databases, realtime game servers and AI-enabled products. The same care goes into what a person sees and the systems behind it.</p><p className="re-engineering-meta">Based in Kosovo · Working remotely · Bachelor’s degree, UBT</p></div>
      </section>
    </>
  )
}
