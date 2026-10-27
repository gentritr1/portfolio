import type { MouseEvent, ReactNode } from 'react'
import { ArrowRightIcon } from '@phosphor-icons/react'

/**
 * Production work: four products, each as one chapter. The delivered change is the largest type; name, role and date give it
 * context; one proof sits beside it; the product image carries the rest. From the seniority study
 * (design/art-directions/refractive-products/seniority-study, 2026-10-27). Every figure is in CONTENT.md: the 100K+ download
 * counts (§3, §4, checked 2026-10-27, cumulative Android reach only), 41 components and 22 releases in 60 days (§6b), and the
 * team's AI line, verbatim (§2). The care rebuild keeps its approved name and stays marked in progress (§2, not in production).
 */

const BASE = '/drafts/refractive-engine'
const plain = (e: MouseEvent) => !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)

function Reach({ href }: { href: string }) {
  return (
    <a className="re-prod-proof" href={href} target="_blank" rel="noreferrer" data-numbers>
      <strong className="re-num">100K+</strong>
      <span>Google Play downloads</span>
      <small>Product reach · October 2026<span className="re-sr"> (opens in a new tab)</span></small>
    </a>
  )
}

export function Production({ onOpen }: { onOpen(slug: string, trigger: HTMLAnchorElement): void }) {
  const toCase = (slug: string) => (e: MouseEvent<HTMLAnchorElement>) => { if (!plain(e)) return; e.preventDefault(); onOpen(slug, e.currentTarget) }
  const caseLink = (slug: string) => (
    <a className="re-prod-case" href={`${BASE}/${slug}`} onClick={toCase(slug)}>
      Read the case
      <ArrowRightIcon size={18} weight="regular" aria-hidden="true" />
    </a>
  )
  const title = (slug: string, name: string, role: ReactNode) => (
    <p className="re-prod-name">
      <a href={`${BASE}/${slug}`} onClick={toCase(slug)}>{name}</a>
      <span>{role}</span>
    </p>
  )
  return (
    <section className="re-prod re-solid" aria-labelledby="re-prod-h">
      <h2 id="re-prod-h" className="re-sr">Production work</h2>

      <article className="re-prod-chapter">
        {title('bayyinah-tv', 'Bayyinah TV', 'Frontend, core team · 2023–26')}
        <div className="re-prod-summary">
          <div>
            <h3>Rebuilt a live learning platform.</h3>
            <p className="re-prod-line">Live and on-demand video, subscriptions and English/Arabic support across web and mobile.</p>
          </div>
          <Reach href="https://play.google.com/store/apps/details?id=com.zombiesoup.bayyinah" />
        </div>
        <figure data-work="Bayyinah TV">
          <div className="re-prod-art re-prod-bayyinah">
            <img src="/showcase/bayyinah/web-04.webp" width={2880} height={1800} alt="Bayyinah TV Stories library with illustrated courses and topic filters" decoding="async" />
          </div>
          <figcaption>Stories library, public page.</figcaption>
        </figure>
        <div className="re-prod-after">
          <p>A new experience for an existing audience.</p>
          {caseLink('bayyinah-tv')}
        </div>
      </article>

      <article className="re-prod-chapter">
        {title('care-platform', 'Care-management platform', <>A team effort · <span className="re-prod-status">In progress</span></>)}
        <div className="re-prod-summary">
          <div>
            <h3>Rebuilding the dashboard, one tested screen at a time.</h3>
            <p className="re-prod-line">The same tests check the old and new screens before they move over.</p>
          </div>
        </div>
        <div className="re-prod-rewrite">
          <figure data-work="Care platform">
            <div className="re-prod-art re-prod-calendar">
              <picture>
                <source media="(max-width: 760px)" srcSet="/showcase/care-dashboard/overview.webp" />
                <img src="/showcase/care-dashboard/appointments-week.webp" width={2880} height={1800} alt="Care-team dashboard with operational data and navigation" loading="lazy" decoding="async" />
              </picture>
            </div>
            <figcaption>Real product screens, invented data.</figcaption>
          </figure>
          <aside className="re-prod-method" aria-label="How each screen moves over">
            <p>Each change has a path to approval.</p>
            <ol>
              <li>Test the existing screen</li>
              <li>AI agents build</li>
              <li>Run the checks</li>
              <li>A person approves</li>
            </ol>
          </aside>
        </div>
        <div className="re-prod-after">
          <details>
            <summary>How the team uses AI</summary>
            <p>The team wrote the rules and the checks. AI agents build inside them, and a person on the team approves each change.</p>
          </details>
          {caseLink('care-platform')}
        </div>
      </article>

      <article className="re-prod-chapter re-prod-ds">
        <div>
          {title('design-system-react', 'Design System v2', 'A team effort · 2026')}
          <h3>One shared library, checked before release.</h3>
          <p className="re-prod-line">AI agents follow written guides. Browser checks and human review control each release.</p>
          <p className="re-prod-proof" data-numbers>
            <strong className="re-num">41 components</strong>
            <span>22 releases in 60 days</span>
          </p>
          <div className="re-prod-after">{caseLink('design-system-react')}</div>
        </div>
        <figure data-work="Design System v2">
          <div className="re-prod-art re-prod-states">
            <img src="/showcase/design-system/boards/xv/board-03.webp" width={3200} height={1740} alt="Real button variants and states, with the measured contrast of each label" loading="lazy" decoding="async" />
          </div>
          {/* Phones: two of the button's real states, readable at that width, cut from the same board. */}
          <div className="re-prod-pair">
            <img src="/showcase/design-system/boards/xv/inspect/btn-focus.webp" width={280} height={214} alt="Save plan button with its focus ring and measured contrast" loading="lazy" decoding="async" />
            <img src="/showcase/design-system/boards/xv/inspect/btn-loading.webp" width={280} height={214} alt="Save plan button in its loading state with measured contrast" loading="lazy" decoding="async" />
          </div>
          <figcaption>Real product screens, invented data.</figcaption>
        </figure>
      </article>

      <article className="re-prod-chapter re-prod-viva">
        <figure data-work="Viva Fresh">
          <div className="re-prod-art re-prod-catalog">
            <img src="/mobile/grocery-1.webp" width={780} height={1689} alt="Viva Fresh catalog with grocery categories, product prices and cart controls" loading="lazy" decoding="async" />
          </div>
          <figcaption>Catalog, store listing image.</figcaption>
        </figure>
        <div>
          {title('viva-fresh', 'Viva Fresh', 'Mobile · 2023')}
          <h3>Shipped grocery shopping on iOS and Android.</h3>
          <p className="re-prod-line">Product browsing, cart, delivery slots and loyalty.</p>
          <Reach href="https://play.google.com/store/apps/details?id=com.zs.vivafresh" />
          <div className="re-prod-after">{caseLink('viva-fresh')}</div>
        </div>
      </article>
    </section>
  )
}
