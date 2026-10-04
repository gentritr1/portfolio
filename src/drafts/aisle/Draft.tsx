import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { CareFile } from './CareFile'
import { Receipt } from './Receipt'
import { receiptText } from './receiptText'
import { dur, ease, spring } from './motion'
import { links } from '../../content/links'
import { aisleProducts, productBySlug, shelves } from './products'
import { createScannerSound } from './scannerSound'
import './aisle.css'

type AisleProduct = (typeof aisleProducts)[number]
const basketStorage = 'gentrit-aisle-basket'
const soundStorage = 'gentrit-aisle-sound'

function readBasket(): string[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(basketStorage) ?? '[]')
    return Array.isArray(saved) ? [...new Set(saved.filter((slug): slug is string => typeof slug === 'string' && productBySlug.has(slug)))] : []
  } catch { return [] }
}

function readSound() {
  try { return localStorage.getItem(soundStorage) === 'on' } catch { return false }
}

function Arrow({ back = false }: { back?: boolean }) {
  return <svg width="21" height="21" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" style={back ? { transform: 'rotate(180deg)' } : undefined}><path d="M4 12h15M12 5l7 7-7 7" /></svg>
}

function BasketIcon() {
  return <svg width="25" height="25" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="m7 9 5-7 5 7M2 9h20l-3 12H5L2 9Zm6 4 1 5m7-5-1 5m-3-5v5" /></svg>
}

function CheckIcon() {
  return <svg width="23" height="23" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2"><path d="m4 12 5 5L20 6" /></svg>
}

function ProductBox({ item, index, inBasket, scanning, reduced, detailActive, scan }: { item: AisleProduct; index: number; inBasket: boolean; scanning: boolean; reduced: boolean; detailActive: boolean; scan: (slug: string) => void }) {
  const [preview, setPreview] = useState(false)
  const phase = inBasket ? 'in-basket' : scanning ? 'scanning' : preview ? 'preview' : 'idle'
  const transition = reduced ? { duration: .01 } : spring.ui
  return <motion.button type="button" className="as-product" data-in-basket={inBasket} data-state={phase} data-project={item.project.slug} aria-busy={scanning} aria-label={(inBasket ? 'Review ' : 'Scan ') + item.project.name + (inBasket ? ', already in basket. ' : ' into your basket. ') + item.fact.value + ' ' + item.fact.label} onClick={() => scan(item.project.slug)} onHoverStart={() => setPreview(true)} onHoverEnd={() => setPreview(false)} onFocus={() => setPreview(true)} onBlur={() => setPreview(false)} whileTap={reduced ? undefined : { scale: .975 }} transition={transition}>
    <motion.span className="as-box" initial={reduced ? false : { y: 9, rotateX: -6, rotateY: -21 }} animate={{ y: preview ? -3 : 0, rotateX: -6, rotateY: preview ? -8 : -15 }} transition={transition}>
      <span className="as-box-front"><span className="as-product-image">{item.image ? <img src={item.image.src} alt={item.image.alt} loading={index < 3 ? 'eager' : 'lazy'} decoding="async" style={{ objectPosition: item.image.position[0] * 100 + '% ' + item.image.position[1] * 100 + '%' }} /> : <span className="as-type-label"><strong>{item.project.stack[0]}</strong><span>{item.project.kind}</span></span>}<motion.span className="as-laser" aria-hidden="true" initial={false} animate={{ top: scanning || inBasket ? '100%' : preview ? '28%' : '0%', opacity: scanning ? 1 : preview && !inBasket ? .65 : 0 }} transition={transition} />{item.image?.recreation && <small>Recreation · invented data</small>}</span><motion.span className="as-product-title" layoutId={detailActive ? undefined : 'as-title-' + item.project.slug} transition={transition}>{item.project.name}</motion.span><span className="as-pack-meta"><span>GR / {item.reference}</span><span>{item.project.years ?? 'Independent'}</span></span></span>
      <span className="as-box-side" aria-hidden="true"><span>{item.project.name}</span></span><span className="as-box-top" aria-hidden="true"><span>GENTRIT RASHITI</span></span>
    </motion.span>
    <motion.span className="as-shelf-tag" animate={{ rotateX: inBasket ? 180 : scanning ? -12 : 0 }} transition={transition}><span className="as-tag-front"><strong>{item.fact.value}</strong><span>{scanning ? 'SCANNING…' : item.fact.label}</span></span><span className="as-tag-back"><CheckIcon /><strong>IN BASKET</strong><span>Scan saved</span></span></motion.span>
  </motion.button>
}

export default function Draft() {
  const [basket, setBasket] = useState(readBasket)
  const [soundEnabled, setSoundEnabled] = useState(readSound)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [inspected, setInspected] = useState('read-to-feed')
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [receiptDate, setReceiptDate] = useState(() => new Date())
  const [message, setMessage] = useState('Scan a box to add its work to your shortlist.')
  const [scanning, setScanning] = useState<string[]>([])
  const [cvRequested, setCvRequested] = useState(false)
  const [printing, setPrinting] = useState(false)
  const [mobile, setMobile] = useState(() => matchMedia('(max-width: 900px)').matches)
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const receiptDialog = useRef<HTMLDialogElement>(null)
  const focusLabelAfterClose = useRef(false)
  const labelPanel = useRef<HTMLElement>(null)
  const shelfNodes = useRef(new Map<string, HTMLDivElement>())
  const sound = useRef<ReturnType<typeof createScannerSound> | null>(null)
  const scanTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>())
  const drawerAnimation = useRef<Animation | null>(null)
  const basketButton = useRef<HTMLButtonElement>(null)
  const selected = productBySlug.get(inspected)!
  const items = basket.map(slug => productBySlug.get(slug)!)
  const matching = new Set(aisleProducts.filter(item => (item.project.name + ' ' + item.project.kind + ' ' + item.project.stack.join(' ') + ' ' + item.project.line).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())).map(item => item.project.slug))
  const visibleShelves = shelves.filter(shelf => filter === 'all' || filter === shelf.id)
  const matchCount = visibleShelves.reduce((total, shelf) => total + shelf.slugs.filter(slug => matching.has(slug)).length, 0)

  useEffect(() => {
    const screen = matchMedia('(max-width: 900px)')
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    const changeScreen = () => setMobile(screen.matches)
    const changeMotion = () => { setReduced(motion.matches); if (motion.matches) sound.current?.stop() }
    screen.addEventListener('change', changeScreen)
    motion.addEventListener('change', changeMotion)
    const scanner = createScannerSound()
    const timers = scanTimers.current
    sound.current = scanner
    return () => {
      screen.removeEventListener('change', changeScreen)
      motion.removeEventListener('change', changeMotion)
      scanner.dispose()
      timers.forEach(clearTimeout)
      drawerAnimation.current?.cancel()
    }
  }, [])

  useEffect(() => {
    try { localStorage.setItem(basketStorage, JSON.stringify(basket)) } catch { /* A private session can keep a basket in memory. */ }
  }, [basket])

  useEffect(() => {
    const node = receiptDialog.current
    if (!node) return
    const currentStyle = getComputedStyle(node)
    const from = { transform: currentStyle.transform, opacity: currentStyle.opacity, filter: currentStyle.filter }
    drawerAnimation.current?.cancel()
    if (!mobile) {
      if (node.matches(':modal')) node.close()
      if (!node.open) node.setAttribute('open', '')
      return
    }
    if (receiptOpen) {
      const entering = !node.open
      if (entering) node.showModal()
      drawerAnimation.current = node.animate([entering ? { transform: 'translateX(32px)', opacity: 0, filter: 'blur(4px)' } : from, { transform: 'translateX(0)', opacity: 1, filter: 'blur(0)' }], { duration: reduced ? 10 : dur.panel * 1000, easing: 'cubic-bezier(.32,.72,0,1)' })
    } else if (node.open) {
      const animation = node.animate([from, { transform: 'translateX(32px)', opacity: 0, filter: 'blur(4px)' }], { duration: reduced ? 10 : dur.ui * 1000, easing: 'cubic-bezier(.215,.61,.355,1)' })
      drawerAnimation.current = animation
      animation.onfinish = () => {
        node.close()
        if (focusLabelAfterClose.current) { labelPanel.current?.focus({ preventScroll: true }); focusLabelAfterClose.current = false }
        else basketButton.current?.focus({ preventScroll: true })
      }
    }
  }, [mobile, receiptOpen, reduced])

  function scan(slug: string) {
    const item = productBySlug.get(slug)!
    setInspected(slug)
    if (basket.includes(slug)) {
      setMessage(item.project.name + ' is already in your basket. Its facts are on the receipt.')
      return
    }
    if (scanTimers.current.has(slug)) return
    setScanning(current => [...current, slug])
    setMessage('Scanning ' + item.project.name + '. ' + item.fact.value + ' ' + item.fact.label + '.')
    if (soundEnabled && !reduced) void sound.current?.play()
    scanTimers.current.set(slug, setTimeout(() => {
      scanTimers.current.delete(slug)
      setScanning(current => current.filter(value => value !== slug))
      setBasket(current => current.includes(slug) ? current : [...current, slug])
      setReceiptDate(new Date())
      setMessage('Scanned ' + item.project.name + '. ' + item.fact.value + ' ' + item.fact.label + '. Added to your selected-work receipt.')
    }, reduced ? 10 : dur.ui * 1000))
  }

  function remove(slug: string) {
    setBasket(current => current.filter(item => item !== slug))
    setReceiptDate(new Date())
    setMessage(productBySlug.get(slug)!.project.name + ' removed from your basket.')
  }

  function resetBasket() {
    setBasket([])
    scanTimers.current.forEach(clearTimeout)
    scanTimers.current.clear()
    setScanning([])
    setReceiptDate(new Date())
    setMessage('Basket reset. Scan another project to start a new shortlist.')
  }

  function toggleSound() {
    const enabled = !soundEnabled
    setSoundEnabled(enabled)
    try { localStorage.setItem(soundStorage, enabled ? 'on' : 'off') } catch { /* Preference still applies for this visit. */ }
    if (!enabled) sound.current?.stop()
    setMessage('Scanner sound ' + (enabled ? 'on. Your next scan will beep.' : 'off. Scans remain visible.'))
  }

  function viewReceipt() {
    if (mobile) setReceiptOpen(true)
    else receiptDialog.current?.scrollIntoView({ block: 'nearest', behavior: reduced ? 'instant' : 'smooth' })
  }

  function closeReceipt() {
    setReceiptOpen(false)
    if (!mobile) basketButton.current?.focus({ preventScroll: true })
  }

  function inspect(slug: string) {
    setInspected(slug)
    setDetailsOpen(true)
    if (mobile) { focusLabelAfterClose.current = !!receiptDialog.current?.open; setReceiptOpen(false) }
    if (!focusLabelAfterClose.current) requestAnimationFrame(() => labelPanel.current?.focus({ preventScroll: true }))
    requestAnimationFrame(() => labelPanel.current?.scrollIntoView({ block: 'start', behavior: reduced ? 'instant' : 'smooth' }))
  }

  function moveShelf(id: string, direction: number) {
    const node = shelfNodes.current.get(id)
    node?.scrollBy({ left: direction * Math.max(210, node.clientWidth * .8), behavior: reduced ? 'instant' : 'smooth' })
  }

  async function printReceipt() {
    if (!items.length) return
    setPrinting(true)
    await document.fonts.ready
    try { window.print(); setMessage('Your selected-work receipt is ready to print or save as a PDF.') }
    catch { setMessage('The print dialog could not open. Use your browser’s Print command, or download the text receipt.') }
    finally { setPrinting(false) }
  }

  function downloadReceipt() {
    if (!items.length) return
    const url = URL.createObjectURL(new Blob([receiptText(items, receiptDate)], { type: 'text/plain;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'Gentrit-Rashiti-shortlist.txt'
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setMessage('Your selected-work text receipt was downloaded.')
  }

  return <LayoutGroup id="aisle"><main className="draft-aisle">
    <title>Aisle 7 — Gentrit Rashiti</title>
    <a className="as-skip" href="#as-shelves">Go to the project shelves</a>
    <header className="as-header"><a href="/drafts">All art directions <Arrow back /></a><p>Gentrit Rashiti <span>·</span> Kosovo</p><button type="button" aria-pressed={soundEnabled && !reduced} disabled={reduced} onClick={toggleSound} title={reduced ? 'Sound stays off with reduced motion enabled' : undefined}>Scanner sound {soundEnabled && !reduced ? 'on' : 'off'}<span className="as-sound-dot" aria-hidden="true" /></button></header>
    <div className="as-intro"><h1>AISLE <span>7</span></h1><p className="as-disciplines">WEB<br />MOBILE<br />FULL STACK</p><p className="as-intro-copy">Scan the work. <br />Build your shortlist.</p><button className="as-desktop-basket" type="button" onClick={viewReceipt}><BasketIcon /><span>{basket.length} in basket</span><Arrow /></button></div>
    <div className="as-store-controls"><nav aria-label="Choose a shelf"><button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>All 28</button>{shelves.map(shelf => <button key={shelf.id} type="button" aria-pressed={filter === shelf.id} onClick={() => setFilter(shelf.id)}>{shelf.id === 'platforms' ? 'Web & systems' : shelf.id === 'mobile' ? 'Mobile' : 'Independent'}</button>)}</nav><label><span className="as-sr">Find a project or technology</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Find a project or technology…" /></label></div>
    <div className="as-main">
      <div className="as-shelves" id="as-shelves">
        <div className="as-scan-feedback" aria-label="Scanner readout"><span>{scanning.includes(inspected) ? 'SCANNING' : basket.includes(inspected) ? 'SCAN SAVED' : 'ON THE SHELF'}</span><strong>{selected.project.name}</strong><p>{selected.fact.value} {selected.fact.label}</p></div>
        {visibleShelves.map(shelf => {
          const stock = shelf.slugs.filter(slug => matching.has(slug))
          if (!stock.length) return null
          return <section className="as-shelf" key={shelf.id} aria-labelledby={'as-shelf-' + shelf.id}>
            <header><h2 id={'as-shelf-' + shelf.id}>{shelf.title}</h2><p>{shelf.note}</p><div><button type="button" aria-label={'Previous products on ' + shelf.title} onClick={() => moveShelf(shelf.id, -1)}><Arrow back /></button><button type="button" aria-label={'Next products on ' + shelf.title} onClick={() => moveShelf(shelf.id, 1)}><Arrow /></button></div></header>
            <div className="as-shelf-stock" ref={node => { if (node) shelfNodes.current.set(shelf.id, node); else shelfNodes.current.delete(shelf.id) }} aria-label={shelf.title + ', horizontally scrollable'}>
              {stock.map((slug, index) => <ProductBox key={slug} item={productBySlug.get(slug)!} index={index} inBasket={basket.includes(slug)} scanning={scanning.includes(slug)} reduced={reduced} detailActive={detailsOpen && inspected === slug} scan={scan} />)}
            </div>
          </section>
        })}
        {!matchCount && <div className="as-empty"><h2>This shelf is empty.</h2><p>No project matches “{query}” here.</p><button type="button" onClick={() => { setQuery(''); setFilter('all') }}>Restock all 28 projects <Arrow /></button></div>}
        <section className="as-label-readout" aria-label="Selected project fact"><div><span>{basket.includes(inspected) ? 'In your basket' : 'On the shelf'}</span><h2>{selected.project.name}</h2></div><p>{selected.project.line}</p><button type="button" onClick={() => inspect(inspected)}>Read the label <Arrow /></button></section>
        <p className="as-status" role="status" aria-live="polite" aria-atomic="true">{message}</p>
      </div>
      <dialog className="as-checkout" ref={receiptDialog} open={!mobile} aria-labelledby="as-checkout-title" onClose={() => setReceiptOpen(false)} onCancel={event => { event.preventDefault(); closeReceipt() }} onClick={event => { if (mobile && event.target === event.currentTarget) closeReceipt() }}>
        <header className="as-checkout-heading"><h2 id="as-checkout-title">Your basket <span>{String(basket.length).padStart(2, '0')}</span></h2><button type="button" className="as-close-receipt" onClick={closeReceipt} aria-label="Close the receipt"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M5 15 15 5" /></svg></button></header>
        <div className="as-printer"><Receipt items={items} date={receiptDate} reduced={reduced} remove={remove} inspect={inspect} /></div>
        <div className="as-receipt-actions"><button type="button" className="as-print-button" disabled={!basket.length || printing} onClick={() => void printReceipt()}>{printing ? 'Preparing receipt…' : 'Print / save PDF'}<Arrow /></button><div><button type="button" disabled={!basket.length} onClick={downloadReceipt}>Download text</button><button type="button" disabled={!basket.length} onClick={resetBasket}>Reset basket</button></div><p>A receipt of the work you chose.<br />Formatted for an 80 mm paper roll.</p></div>
      </dialog>
    </div>
    <AnimatePresence mode="popLayout">{detailsOpen && <motion.section key={inspected} initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }} transition={reduced ? { duration: .01 } : { duration: dur.panel, ease: ease.arrive }} className="as-label-detail" tabIndex={-1} ref={labelPanel} aria-labelledby="as-detail-title"><div><p>{selected.project.kind} · {selected.project.years ?? 'Independent work'}</p><motion.h2 id="as-detail-title" layoutId={'as-title-' + inspected} transition={reduced ? { duration: .01 } : spring.ui}>{selected.project.name}</motion.h2><button className="as-close-case" type="button" onClick={() => setDetailsOpen(false)}>Close label <Arrow back /></button><button type="button" onClick={() => scan(inspected)}>{basket.includes(inspected) ? 'In your basket' : 'Add to your shortlist'}{basket.includes(inspected) ? <CheckIcon /> : <BasketIcon />}</button></div><div><p>{selected.project.summary}</p><dl><div><dt>Work</dt><dd>{selected.project.role}</dd></div><div><dt>Technology</dt><dd>{selected.project.stack.join(' · ')}</dd></div></dl><nav aria-label={selected.project.name + ' links'}>{selected.project.featured && <a href={'/work/' + inspected}>Full case study <Arrow /></a>}{selected.project.links.map(link => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label} <Arrow /></a>)}</nav></div>{inspected === 'care-platform' ? <CareFile reduced={reduced} /> : selected.image && <figure><img src={selected.image.src} alt={selected.image.alt} loading="lazy" /><figcaption>{selected.image.recreation ? 'Recreation · invented data' : 'Public project image'}</figcaption></figure>}</motion.section>}</AnimatePresence>
    <footer className="as-footer"><div><h2>Gentrit Rashiti</h2><p>Frontend & mobile developer, now full stack.<br />5+ years, from the first screen to release. Kosovo · Remote.</p></div><p>The scanner belongs here.<br /><span>Viva Fresh handles groceries and loyalty.<br />Read to Feed includes a barcode scanner.</span></p><nav aria-label="Contact"><a href={'mailto:' + links.email}>Email <Arrow /></a><a href={links.github}>GitHub <Arrow /></a><a href={links.cv} onClick={() => { setCvRequested(true); setMessage('Full CV requested. Your project shortlist remains on the receipt.') }}>{cvRequested ? 'CV requested' : 'Full CV'} <Arrow /></a></nav></footer>
    <button ref={basketButton} className="as-mobile-basket" type="button" onClick={viewReceipt}><BasketIcon /><span>Your shortlist</span><strong>{basket.length}</strong><span>View receipt <Arrow /></span></button>
  </main></LayoutGroup>
}
