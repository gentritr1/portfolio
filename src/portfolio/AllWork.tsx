import { ArrowRightIcon, ArrowUpRightIcon, CaretDownIcon } from '@phosphor-icons/react'
import { channelOrder, channels } from "../content/channels"
import { ARROW, plain, BASE } from "./data"
import { cases, period, work } from "./products"
import { CUT } from "./cut"

const CASES = new Set(cases.map((s) => s.slug))
/** Unlinked rows that stay in view under ?cut=1, folded or not. */
const KEEP = new Set(['Care-management API', 'Sadaqah app for Islamic Relief USA'])

/** Capabilities from CONTENT.md §1, described in plain language. */
const CAPABILITIES: [string, string][] = [
  ['Rewrites & migrations', 'Move a live app to a new framework in stages, checking that existing behavior still works.'],
  ['Mobile apps', 'iOS and Android, from the first build to store releases and major upgrades.'],
  ['Multi-tenant platforms', 'Separate data, roles and permissions for each organization.'],
  ['Streaming & media', 'Live streams, realtime chat, video on demand, PDF and EPUB reading.'],
  ['Payments', 'Web and in-app subscriptions, gifts and promo codes.'],
  ['AI features', 'Document chat, image generation and AI-assisted testing.'],
  ['Full stack', 'APIs, databases, background jobs and performance work.'],
  ['Team delivery', 'Onboard developers, discuss existing behavior and guide a shared rewrite process.'],
]

/** Tools and language support from CONTENT.md §8. */
const SKILLS: [string, string][] = [
  ['Frontend', 'React, Next.js, Vue, Nuxt, TypeScript, Tailwind CSS, Bootstrap'],
  ['State & data fetching', 'Redux / Redux Toolkit, Zustand, Pinia, Vuex, TanStack Query'],
  ['Mobile', 'React Native, iOS, Android'],
  ['Backend', 'Node.js, Laravel / PHP, MySQL, PostgreSQL, MongoDB, Redis'],
  ['Quality & validation', 'Zod, Playwright, Vitest, Pest, CI/CD'],
  ['Services', 'Stripe, Firebase, AWS IVS, Twilio, Pusher'],
  ['Localization', 'Multiple languages, including right-to-left Arabic'],
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
              {period(key) && <span className="re-num">{period(key)}</span>}
            </h3>
            <ul className="re-all-rows">
              {(() => {
                const rows = work.filter((p) => p.channel === key)
                // ?cut=1: a group's unlinked rows fold into one disclosure at its end, when there are two or more of them.
                const folded = CUT ? rows.filter((p) => !CASES.has(p.slug) && !p.links[0] && !KEEP.has(p.name)) : []
                const fold = folded.length >= 2 ? new Set(folded) : new Set<typeof rows[number]>()
                const row = (p: typeof rows[number]) => {
                const link = p.links[0]
                // The name is the link: to the case, or to the project's first public page.
                const name = CASES.has(p.slug) ? (
                  <a className="re-link-secondary" href={`${BASE}/${p.slug}`} aria-label={`Read the ${p.name} case`} onClick={(e) => { if (!plain(e)) return; e.preventDefault(); onOpen(p.slug) }}>
                    {p.name}<ArrowRightIcon {...ARROW} />
                  </a>
                ) : link ? (
                  <a className="re-link-secondary" href={link.href} target="_blank" rel="noreferrer" aria-label={`${p.name}, ${link.label} (opens in a new tab)`}>
                    {p.name}<ArrowUpRightIcon {...ARROW} />
                  </a>
                ) : p.name
                return (
                  <li key={p.slug}>
                    <p className="re-all-name">{name}</p>
                    <p className="re-all-meta re-num">{[p.years, p.role].filter(Boolean).join(' · ')}</p>
                    <p className="re-all-line">{p.line}</p>
                  </li>
                )
                }
                return <>
                  {rows.filter((p) => !fold.has(p)).map(row)}
                  {fold.size > 0 && (
                    <li className="re-all-more">
                      <details>
                        <summary className="re-action">{fold.size} more<CaretDownIcon {...ARROW} /></summary>
                        <ul className="re-all-rows">{[...fold].map(row)}</ul>
                      </details>
                    </li>
                  )}
                </>
              })()}
            </ul>
          </div>
        )
      })}
      <div className="re-all-cols" data-one={CUT || undefined}>
        {!CUT && <div>
          <h3 className="re-all-area">Capabilities</h3>
          <dl className="re-all-dl">
            {CAPABILITIES.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
        </div>}
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
