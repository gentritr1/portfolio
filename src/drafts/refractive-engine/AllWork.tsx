import { ArrowRightIcon, ArrowUpRightIcon } from '@phosphor-icons/react'
import { projects } from '../../content/projects'
import { channelOrder, channels } from '../../content/channels'
import { systems } from './data'

const BASE = '/drafts/refractive-engine'
const CASES = new Set(systems.map((s) => s.slug))
const plain = (e: React.MouseEvent) => !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)

/** CONTENT.md §1, word for word. */
const CAPABILITIES: [string, string][] = [
  ['Rewrites & migrations', 'move a live app to a new framework step by step, with parity checks.'],
  ['Mobile apps', 'iOS and Android, from build to store release and major upgrades.'],
  ['Multi-tenant platforms', 'separate data, roles and permissions for each client.'],
  ['Streaming & media', 'live streams, realtime chat, video on demand, PDF and EPUB reading.'],
  ['Payments', 'web and in-app subscriptions, gifts, promo codes.'],
  ['AI features', 'document chat, AI image generation, AI-assisted QA automation.'],
  ['Full stack', 'APIs, databases, background jobs, performance.'],
]

/** CONTENT.md §8, word for word. */
const SKILLS: [string, string][] = [
  ['Frontend', 'React, Next.js, Vue, Nuxt, TypeScript, Tailwind'],
  ['Mobile', 'React Native, iOS, Android'],
  ['Backend', 'Node.js, Laravel / PHP, MySQL, PostgreSQL, MongoDB, Redis'],
  ['Quality', 'Playwright, Vitest, Pest, CI/CD'],
  ['Services', 'Stripe, Firebase, AWS IVS, Twilio, Pusher'],
  ['Localization', 'multi-language, Arabic RTL'],
]

/**
 * The whole picture after the selected work: every project in projects.ts under the six areas the owner named
 * (CONTENT.md channel labels, 2026-10-02), each area with the years of its own projects, then what the work covers (§1)
 * and the tools (§8). A project with a case opens it; one with a public page links there; the rest are a line.
 */
export function AllWork({ onOpen }: { onOpen(slug: string): void }) {
  return (
    <section id="re-all" className="re-all" aria-labelledby="re-all-h">
      <div className="re-all-head">
        <h2 id="re-all-h" className="re-h2">All projects</h2>
        <p className="re-lede">Every product so far, in one list.</p>
      </div>
      {channelOrder.map((key) => {
        const area = channels[key]
        return (
          <div key={key} className="re-all-group">
            <h3 className="re-all-area">
              {area.label}
              {area.period && <span className="re-num">{area.period}</span>}
            </h3>
            <ul className="re-all-rows">
              {projects.filter((p) => p.channel === key).map((p) => {
                const link = p.links[0]
                return (
                  <li key={p.slug}>
                    <p className="re-all-name">{p.name}</p>
                    <p className="re-all-meta re-num">{[p.years, p.role].filter(Boolean).join(' · ')}</p>
                    <p className="re-all-line">{p.line}</p>
                    {CASES.has(p.slug) ? (
                      <a className="re-all-go" href={`${BASE}/${p.slug}`} onClick={(e) => { if (!plain(e)) return; e.preventDefault(); onOpen(p.slug) }}>
                        Read the case<ArrowRightIcon size={14} weight="regular" aria-hidden="true" />
                      </a>
                    ) : link ? (
                      <a className="re-all-go" href={link.href} target="_blank" rel="noreferrer">
                        {link.label}<ArrowUpRightIcon size={14} weight="regular" aria-hidden="true" /><span className="re-sr"> (opens in a new tab)</span>
                      </a>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
      <div className="re-all-cols">
        <div>
          <h3 className="re-all-area">Capabilities</h3>
          <dl className="re-all-dl">
            {CAPABILITIES.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
        </div>
        <div>
          <h3 className="re-all-area">Skills</h3>
          <dl className="re-all-dl">
            {SKILLS.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
        </div>
      </div>
    </section>
  )
}
