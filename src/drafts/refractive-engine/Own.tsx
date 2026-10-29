import type { CSSProperties } from 'react'
import { ArrowRightIcon } from '@phosphor-icons/react'
import { plain, BASE } from './data'
import { own } from './products'
import { cropVars, LEADS } from './screens'

type Vars = CSSProperties & Record<`--${string}`, string | number>

/**
 * The owner's own products, side by side after the selected work (owner, 2026-10-29): each one's opening screen as a
 * slab, its name, line and case. The slab carries the case's own crop, so Read the case grows it into the same picture;
 * narrower screens show the phone crop, as the chapters do.
 */
export function Own({ onOpen }: { onOpen(slug: string, trigger?: HTMLAnchorElement, keyboard?: boolean): void }) {
  return (
    <section id="re-own" className="re-own" aria-labelledby="re-own-h">
      <h2 id="re-own-h" className="re-h2">Own products</h2>
      <ul className="re-own-list">
        {own.map((s) => {
          const { shot, crop, phoneCrop } = LEADS[s.slug]
          return (
            <li key={s.slug} className="re-own-item">
              <figure className="re-sw-slab re-sw-lead" style={{ ...cropVars(shot, crop), ...cropVars(shot, phoneCrop ?? crop, 'n') } as Vars}>
                <div className="re-sw-screen"><img src={shot.src} width={shot.w} height={shot.h} alt={shot.alt} loading="lazy" decoding="async" /></div>
              </figure>
              <h3 className="re-own-name">{s.name}</h3>
              <p className="re-own-meta re-num">{[s.kind, s.years, s.role].join(' · ')}</p>
              <p className="re-own-line">{s.line}</p>
              <a className="re-prod-case" href={`${BASE}/${s.slug}`} onClick={(e) => { if (!plain(e)) return; e.preventDefault(); onOpen(s.slug, e.currentTarget, e.detail === 0) }}>
                Read the case<span className="re-sr">: {s.name}</span>
                <ArrowRightIcon size={20} weight="light" aria-hidden="true" />
              </a>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
