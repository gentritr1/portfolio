import { useEffect, useRef } from 'react'
import { AnimatePresence, animate, motion } from 'motion/react'
import { links } from '../../content/links'
import type { ReceiptItem } from './receiptText'
import { ease } from './motion'

/** Thermal printers advance in whole lines, so reveals jump in steps. */
const steps = (count: number) => (t: number) => (t >= 1 ? 1 : Math.floor(t * count) / count)

function Barcode({ seed }: { seed: string }) {
  const bars: { x: number; w: number }[] = []
  let x = 0
  for (const char of seed) {
    const code = char.charCodeAt(0)
    for (let bit = 0; bit < 4; bit++) {
      const w = 1 + ((code >> bit) & 1) + ((code >> (bit + 3)) & 1)
      if (bit % 2 === 0) bars.push({ x, w })
      x += w + 1
    }
  }
  return <svg className="as-r-barcode" viewBox={`0 0 ${x} 40`} preserveAspectRatio="none" aria-hidden="true">{bars.map(bar => <rect key={bar.x} x={bar.x} width={bar.w} height="40" />)}</svg>
}

export function ThermalReceipt({ items, date, reduced, remove, inspect }: { items: ReceiptItem[]; date: Date; reduced: boolean; remove: (slug: string) => void; inspect: (slug: string) => void }) {
  const paper = useRef<HTMLElement>(null)
  const printed = useRef(items.length)
  const day = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Belgrade', day: '2-digit', month: 'short', year: 'numeric' }).format(date).toUpperCase()
  const time = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Belgrade', hour: '2-digit', minute: '2-digit' }).format(date)
  const count = String(items.length).padStart(2, '0')

  useEffect(() => {
    const grew = items.length > printed.current
    printed.current = items.length
    if (!grew || reduced || !paper.current) return
    const feed = animate(paper.current, { y: [0, -2, 0, -2, 0] }, { duration: .16, ease: steps(4) })
    return () => feed.stop()
  }, [items.length, reduced])

  return <article className="as-paper" ref={paper} aria-label="Your selected-work receipt">
    <header className="as-r-head">
      <h2>GENTRIT RASHITI</h2>
      <p>WEB · MOBILE · FULL STACK</p>
      <p>Kosovo · Working remotely</p>
    </header>
    <p className="as-r-row"><span>SELECTED WORK</span><time dateTime={date.toISOString()}>{day} {time}</time></p>
    <ol className="as-r-items">
      <AnimatePresence initial={false} mode="popLayout">
        {items.map((item, index) => <motion.li layout={!reduced} key={item.project.slug}
          initial={reduced ? { opacity: 0 } : { clipPath: 'inset(0 0 100% 0)' }}
          animate={reduced ? { opacity: 1 } : { clipPath: 'inset(0 0 0% 0)' }}
          exit={reduced ? { opacity: 0, transition: { duration: .01 } } : { opacity: 0, clipPath: 'inset(0 0 100% 0)', transition: { duration: .18, ease: ease.out } }}
          transition={reduced ? { duration: .01 } : { clipPath: { duration: .42, ease: steps(6) }, layout: { duration: .22, ease: ease.out } }}>
          <div className="as-r-line">
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h3><button type="button" className="as-r-name" onClick={() => inspect(item.project.slug)}>{item.project.name}</button></h3>
            <strong>{item.fact.value}</strong>
            <button type="button" className="as-r-void as-screen-only" aria-label={'Remove ' + item.project.name + ' from the basket'} onClick={() => remove(item.project.slug)}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6 6 8 8M6 14l8-8" /></svg></button>
          </div>
          <p className="as-r-sub">{item.fact.label}</p>
          <p className="as-r-sub">{item.project.years ?? 'Independent'} · {item.project.role}</p>
          <p className="as-r-sub as-print-only">{item.project.line}</p>
          <p className="as-r-sub as-print-only">{item.project.stack.slice(0, 5).join(' / ')}</p>
          {item.project.links[0] && <p className="as-r-sub as-print-only">{item.project.links[0].href}</p>}
        </motion.li>)}
      </AnimatePresence>
    </ol>
    {!items.length && <p className="as-r-empty">** NO ITEMS SCANNED **</p>}
    <dl className="as-r-total">
      <div><dt>ITEMS</dt><dd>{count}</dd></div>
      <div><dt>TOTAL</dt><dd>{count} PROJECT{items.length === 1 ? '' : 'S'}</dd></div>
      <div><dt>EXPERIENCE</dt><dd>5+ YEARS</dd></div>
    </dl>
    <footer className="as-r-foot">
      <p>React · React Native · Vue · Nuxt<br />Laravel · FastAPI</p>
      <a href={'mailto:' + links.email}>{links.email}</a>
      <a href={links.github}>{links.githubLabel}</a>
      <Barcode seed={'GR' + count + day} />
      <p>GR-{count}-{date.getFullYear()}</p>
      <p className="as-r-thanks">THANK YOU FOR LOOKING</p>
    </footer>
  </article>
}
