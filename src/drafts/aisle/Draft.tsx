import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { AnimatePresence, LayoutGroup, animate, motion } from 'motion/react'
import { useLocation } from 'react-router'
import { CareFile } from './CareFile'
import { ThermalReceipt } from './ThermalReceipt'
import { receiptText } from './receiptText'
import { dur, ease, spring } from './motion'
import { links } from '../../content/links'
import { aisleProducts, productBySlug, shelves } from './products'
import { createScannerSound } from './scannerSound'
import './aisle.css'

type AisleProduct = (typeof aisleProducts)[number]
const basketStorage = 'gentrit-aisle-basket'
const soundStorage = 'gentrit-aisle-sound'
const passMs = 220
const flightMs = 520
const shelfLabels: Record<string, string> = { platforms: 'Web & systems', mobile: 'Mobile', independent: 'Independent' }
const cubic = (curve: readonly number[]) => 'cubic-bezier(' + curve.join(',') + ')'

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
  return <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" style={back ? { transform: 'rotate(180deg)' } : undefined}><path d="M4 12h15M12 5l7 7-7 7" /></svg>
}

function BasketIcon() {
  return <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="m7 9 5-7 5 7M2 9h20l-3 12H5L2 9Zm6 4 1 5m7-5-1 5m-3-5v5" /></svg>
}

function CheckIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="m4 12 5 5L20 6" /></svg>
}

function SearchIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></svg>
}

function ProductBox({ item, index, enterDelay, settled, inBasket, scanning, reduced, detailActive, scan, register }: { item: AisleProduct; index: number; enterDelay: number; settled: boolean; inBasket: boolean; scanning: boolean; reduced: boolean; detailActive: boolean; scan: (slug: string) => void; register: (slug: string, node: HTMLSpanElement | null) => void }) {
  const [preview, setPreview] = useState(false)
  const phase = inBasket ? 'in-basket' : scanning ? 'scanning' : preview ? 'preview' : 'idle'
  const ui = reduced ? { duration: .01 } : spring.ui
  const arrive = reduced ? { duration: .01 } : settled ? spring.ui : { ...spring.lift, delay: enterDelay }
  const laser = phase === 'scanning'
    ? { animate: { top: ['0%', '100%', '0%'], opacity: 1 }, transition: { duration: passMs * 2 / 1000, times: [0, .5, 1], ease: 'easeInOut' as const } }
    : phase === 'preview'
      ? { animate: { top: ['0%', '100%'], opacity: [0, 1, 1, 0] }, transition: { duration: .36, ease: ease.out } }
      : { animate: { top: '0%', opacity: 0 }, transition: { duration: dur.tap } }
  const pack = { '--pack': item.pack.field, '--pack-ink': item.pack.ink, '--pack-window': item.pack.window } as CSSProperties
  const years = item.project.years ?? 'Independent'
  return <motion.button type="button" className="as-product" style={pack} data-state={phase} data-project={item.project.slug} aria-busy={scanning}
    aria-label={(inBasket ? item.project.name + ', in your basket. Read the label. ' : 'Scan ' + item.project.name + ' into your basket. ') + item.fact.value + ' ' + item.fact.label}
    onClick={() => scan(item.project.slug)} onHoverStart={() => setPreview(true)} onHoverEnd={() => setPreview(false)} onFocus={() => setPreview(true)} onBlur={() => setPreview(false)}
    initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={reduced ? { duration: .01 } : { duration: dur.ui, delay: settled ? 0 : enterDelay }}
    whileTap={reduced ? undefined : { scale: .97 }}>
    <motion.span className="as-box" initial={reduced ? false : { y: -36, rotateX: -6, rotateY: -24 }}
      animate={{ y: scanning ? -12 : preview ? -6 : 0, z: scanning ? 12 : 0, rotateX: -6, rotateY: scanning || preview ? -9 : -18 }} transition={arrive}>
      <span className="as-box-front" ref={node => register(item.project.slug, node)}>
        <motion.span className="as-box-name" layoutId={detailActive ? undefined : 'as-title-' + item.project.slug} transition={ui}>{item.project.name}</motion.span>
        <span className="as-window">
          {item.image
            ? <img src={item.image.src} alt="" loading={index < 5 ? 'eager' : 'lazy'} decoding="async" style={{ objectPosition: item.image.position[0] * 100 + '% ' + item.image.position[1] * 100 + '%' }} />
            : <span className="as-window-type"><strong>{item.project.stack[0]}</strong><span>{item.project.stack.slice(1, 3).join(' · ') || item.project.kind}</span></span>}
        </span>
        {item.image?.recreation && <small className="as-small-print">Invented data</small>}
        <motion.span className="as-laser" aria-hidden="true" initial={false} animate={laser.animate} transition={reduced ? { duration: .01 } : laser.transition} />
      </span>
      <span className="as-box-side" aria-hidden="true"><span>GR / {item.reference} · {years}</span></span>
      <span className="as-box-top" aria-hidden="true" />
    </motion.span>
    <motion.span className="as-shelf-tag" initial={reduced ? false : { rotateX: -90 }}
      animate={{ rotateX: scanning ? -14 : preview && !inBasket ? -12 : 0 }}
      transition={reduced ? { duration: .01 } : settled ? spring.lift : { ...spring.ui, delay: enterDelay + .15 }}>
      <motion.span className="as-tag-card" initial={false} animate={{ rotateX: inBasket ? 180 : 0 }} transition={ui}>
        <span className="as-tag-front"><strong>{item.fact.value}</strong><span>{item.fact.label}</span></span>
        <span className="as-tag-back"><CheckIcon /><strong>IN BASKET</strong></span>
      </motion.span>
    </motion.span>
  </motion.button>
}

export default function Draft() {
  const { pathname } = useLocation()
  const [basket, setBasket] = useState(readBasket)
  const [inFlight, setInFlight] = useState<string[]>([])
  const [soundEnabled, setSoundEnabled] = useState(readSound)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [inspected, setInspected] = useState('dukagjini-bookstore')
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [receiptDate, setReceiptDate] = useState(() => new Date())
  const [message, setMessage] = useState('')
  const [scanning, setScanning] = useState<string[]>([])
  const [printing, setPrinting] = useState(false)
  const [mobile, setMobile] = useState(() => matchMedia('(max-width: 900px)').matches)
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [settled, setSettled] = useState(reduced)
  const root = useRef<HTMLElement>(null)
  const receiptDialog = useRef<HTMLDialogElement>(null)
  const paperFeed = useRef<HTMLDivElement>(null)
  const labelPanel = useRef<HTMLElement>(null)
  const searchInput = useRef<HTMLInputElement>(null)
  const focusLabelAfterClose = useRef(false)
  const shelfNodes = useRef(new Map<string, HTMLDivElement>())
  const boxFronts = useRef(new Map<string, HTMLSpanElement>())
  const flights = useRef(new Set<{ node: HTMLElement; animation: Animation; timer: ReturnType<typeof setTimeout> | 0 }>())
  const sound = useRef<ReturnType<typeof createScannerSound> | null>(null)
  const scanTimers = useRef(new Map<string, ReturnType<typeof setTimeout>[]>())
  const sheetAnimation = useRef<Animation | null>(null)
  const tillBasket = useRef<HTMLSpanElement>(null)
  const tillCount = useRef<HTMLSpanElement>(null)
  const barBasket = useRef<HTMLSpanElement>(null)
  const barCount = useRef<HTMLElement>(null)
  const basketButton = useRef<HTMLButtonElement>(null)
  const selected = productBySlug.get(inspected)!
  const landed = basket.filter(slug => !inFlight.includes(slug))
  const items = landed.map(slug => productBySlug.get(slug)!)
  const count = String(landed.length).padStart(2, '0')
  const needle = query.trim().toLocaleLowerCase()
  const matching = new Set(aisleProducts.filter(item => (item.project.name + ' ' + item.project.kind + ' ' + item.project.stack.join(' ') + ' ' + item.project.line).toLocaleLowerCase().includes(needle)).map(item => item.project.slug))
  const visibleShelves = shelves.filter(shelf => filter === 'all' || filter === shelf.id)
  const matchCount = visibleShelves.reduce((total, shelf) => total + shelf.slugs.filter(slug => matching.has(slug)).length, 0)

  useEffect(() => {
    const screen = matchMedia('(max-width: 900px)')
    const motionQuery = matchMedia('(prefers-reduced-motion: reduce)')
    const changeScreen = () => setMobile(screen.matches)
    const changeMotion = () => { setReduced(motionQuery.matches); if (motionQuery.matches) sound.current?.stop() }
    screen.addEventListener('change', changeScreen)
    motionQuery.addEventListener('change', changeMotion)
    const scanner = createScannerSound()
    const timers = scanTimers.current
    const running = flights.current
    sound.current = scanner
    const settle = setTimeout(() => setSettled(true), 1700)
    return () => {
      screen.removeEventListener('change', changeScreen)
      motionQuery.removeEventListener('change', changeMotion)
      scanner.dispose()
      clearTimeout(settle)
      timers.forEach(list => list.forEach(clearTimeout))
      running.forEach(flight => { clearTimeout(flight.timer); flight.animation.cancel(); flight.node.remove() })
      sheetAnimation.current?.cancel()
    }
  }, [])

  useEffect(() => {
    try { localStorage.setItem(basketStorage, JSON.stringify(basket)) } catch { /* A private session keeps the basket in memory. */ }
  }, [basket])

  useEffect(() => {
    const node = receiptDialog.current
    if (!node) return
    sheetAnimation.current?.cancel()
    if (!mobile) {
      if (node.matches(':modal')) node.close()
      if (!node.open) node.setAttribute('open', '')
      return
    }
    const from = getComputedStyle(node).transform
    if (receiptOpen) {
      const entering = !node.open
      if (entering) node.showModal()
      sheetAnimation.current = node.animate([{ transform: entering || from === 'none' ? 'translateY(100%)' : from }, { transform: 'translateY(0)' }], { duration: reduced ? 10 : dur.panel * 1000, easing: cubic(ease.sheet) })
    } else if (node.open) {
      const animation = node.animate([{ transform: from === 'none' ? 'translateY(0)' : from }, { transform: 'translateY(100%)' }], { duration: reduced ? 10 : dur.ui * 1000, easing: cubic(ease.out), fill: 'forwards' })
      sheetAnimation.current = animation
      animation.onfinish = () => {
        node.close()
        animation.cancel()
        if (focusLabelAfterClose.current) { labelPanel.current?.focus({ preventScroll: true }); focusLabelAfterClose.current = false }
        else basketButton.current?.focus({ preventScroll: true })
      }
    }
  }, [mobile, receiptOpen, reduced])

  useEffect(() => { if (searchOpen) searchInput.current?.focus() }, [searchOpen])

  function registerFront(slug: string, node: HTMLSpanElement | null) {
    if (node) boxFronts.current.set(slug, node)
    else boxFronts.current.delete(slug)
  }

  function bumpCount() {
    const node = mobile ? barCount.current : tillCount.current
    const basketNode = mobile ? barBasket.current : tillBasket.current
    if (!node || reduced) return
    basketNode?.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.16, .82)' }, { transform: 'scale(.96, 1.06)' }, { transform: 'scale(1)' }], { duration: 260, easing: cubic(ease.out) })
    void animate(node, { scale: 1.18 }, { duration: .07, ease: ease.out }).then(() => animate(node, { scale: 1 }, spring.play))
  }

  function land(slug: string) {
    setInFlight(current => current.filter(value => value !== slug))
    bumpCount()
    requestAnimationFrame(() => {
      const feed = paperFeed.current
      if (feed && !mobile) feed.scrollTo({ top: feed.scrollHeight, behavior: reduced ? 'instant' : 'smooth' })
    })
  }

  function fly(slug: string) {
    const source = boxFronts.current.get(slug)
    const target = mobile ? barBasket.current : tillBasket.current
    const host = root.current
    if (reduced || !source || !target || !host) return
    const from = source.getBoundingClientRect()
    const to = target.getBoundingClientRect()
    if (!from.width || !to.width) return
    const node = document.createElement('div')
    node.className = 'as-flyer'
    node.setAttribute('aria-hidden', 'true')
    Object.assign(node.style, { left: from.left + 'px', top: from.top + 'px', width: from.width + 'px', height: from.height + 'px' })
    const product = source.closest<HTMLElement>('.as-product')
    for (const name of ['--pack', '--pack-ink', '--pack-window']) node.style.setProperty(name, product?.style.getPropertyValue(name) ?? '')
    node.appendChild(source.cloneNode(true))
    host.appendChild(node)
    const dx = to.left + to.width / 2 - (from.left + from.width / 2)
    const dy = to.top + to.height / 2 - (from.top + from.height / 2)
    const cx = dx * .5
    const cy = Math.min(0, dy) * .5 - Math.min(180, 80 + Math.abs(dx) * .12)
    const end = Math.max(.12, Math.min(.24, 44 / from.width))
    const frames: Keyframe[] = []
    for (let i = 0; i <= 16; i++) {
      const t = i / 16
      const x = 2 * (1 - t) * t * cx + t * t * dx
      const y = 2 * (1 - t) * t * cy + t * t * dy
      const scale = t < .18 ? 1 - (t / .18) * .38 : .62 - ((t - .18) / .82) * (.62 - end)
      const turn = Math.sin(t * Math.PI) * -16 + t * 8
      frames.push({ transform: `translate(${x}px, ${y}px) rotate(${turn}deg) scale(${scale})`, offset: t })
    }
    setInFlight(current => [...current, slug])
    const animation = node.animate(frames, { duration: flightMs, easing: cubic(ease.out), fill: 'forwards' })
    const flight = { node, animation, timer: 0 as ReturnType<typeof setTimeout> | 0 }
    flights.current.add(flight)
    flight.timer = setTimeout(() => {
      const squash = node.animate([
        { transform: `translate(${dx}px, ${dy}px) rotate(8deg) scale(${end})`, opacity: 1 },
        { transform: `translate(${dx}px, ${dy + 4}px) rotate(4deg) scale(${end * 1.3}, ${end * .62})`, opacity: 1, offset: .55 },
        { transform: `translate(${dx}px, ${dy + 6}px) rotate(0deg) scale(${end * .9}, ${end * .4})`, opacity: 0 },
      ], { duration: 140, easing: cubic(ease.out), fill: 'forwards' })
      animation.cancel()
      flight.animation = squash
      land(slug)
      flight.timer = setTimeout(() => { node.remove(); flights.current.delete(flight) }, 160)
    }, flightMs)
  }

  function scan(slug: string) {
    const item = productBySlug.get(slug)!
    setInspected(slug)
    if (basket.includes(slug)) {
      inspect(slug)
      return
    }
    if (scanTimers.current.has(slug)) return
    setScanning(current => [...current, slug])
    setMessage('Scanning ' + item.project.name + '.')
    const timers: ReturnType<typeof setTimeout>[] = []
    if (soundEnabled && !reduced) timers.push(setTimeout(() => void sound.current?.play(), passMs))
    timers.push(setTimeout(() => {
      scanTimers.current.delete(slug)
      setScanning(current => current.filter(value => value !== slug))
      setBasket(current => current.includes(slug) ? current : [...current, slug])
      setReceiptDate(new Date())
      setMessage(item.project.name + ' is in your basket. ' + item.fact.value + ' ' + item.fact.label + ' printed on the receipt.')
      if (reduced) requestAnimationFrame(() => paperFeed.current?.scrollTo({ top: paperFeed.current.scrollHeight }))
      else fly(slug)
    }, reduced ? 10 : passMs * 2))
    scanTimers.current.set(slug, timers)
  }

  function remove(slug: string) {
    setBasket(current => current.filter(item => item !== slug))
    setReceiptDate(new Date())
    setMessage(productBySlug.get(slug)!.project.name + ' removed from your basket.')
  }

  function resetBasket() {
    scanTimers.current.forEach(list => list.forEach(clearTimeout))
    scanTimers.current.clear()
    flights.current.forEach(flight => { clearTimeout(flight.timer); flight.animation.cancel(); flight.node.remove() })
    flights.current.clear()
    setBasket([])
    setInFlight([])
    setScanning([])
    setReceiptDate(new Date())
    setMessage('Basket empty. The receipt is cleared.')
  }

  function toggleSound() {
    const enabled = !soundEnabled
    setSoundEnabled(enabled)
    try { localStorage.setItem(soundStorage, enabled ? 'on' : 'off') } catch { /* The preference still applies for this visit. */ }
    if (!enabled) sound.current?.stop()
    setMessage('Scanner sound ' + (enabled ? 'on.' : 'off.'))
  }

  function closeReceipt() {
    setReceiptOpen(false)
  }

  function inspect(slug: string) {
    setInspected(slug)
    setDetailsOpen(true)
    if (mobile && receiptDialog.current?.open) { focusLabelAfterClose.current = true; setReceiptOpen(false) }
    else requestAnimationFrame(() => labelPanel.current?.focus({ preventScroll: true }))
    requestAnimationFrame(() => labelPanel.current?.scrollIntoView({ block: 'start', behavior: reduced ? 'instant' : 'smooth' }))
  }

  function moveShelf(id: string, direction: number) {
    const node = shelfNodes.current.get(id)
    node?.scrollBy({ left: direction * Math.max(220, node.clientWidth * .75), behavior: reduced ? 'instant' : 'smooth' })
  }

  async function printReceipt() {
    if (!items.length || printing) return
    setPrinting(true)
    const paper = paperFeed.current?.firstElementChild as HTMLElement | null
    if (paper && !reduced) await paper.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-12px)' }], { duration: 180, easing: cubic(ease.out) }).finished.catch(() => undefined)
    await document.fonts.ready
    try { window.print(); setMessage('The receipt is ready to print or save as a PDF.') }
    catch { setMessage('The print dialog did not open. Use the browser Print command, or download the text receipt.') }
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
    setMessage('The text receipt was downloaded.')
  }

  let shelfOrder = 0
  const home = pathname === '/'
  return <LayoutGroup id="aisle"><main className="draft-aisle" ref={root} data-settled={settled}>
    <title>{home ? 'Gentrit Rashiti — web, mobile & full stack' : 'Aisle 7 — Gentrit Rashiti'}</title>
    <a className="as-skip" href="#as-shelves">Go to the project shelves</a>
    <div className="as-store">
      <header className="as-talker">
        <h1 aria-label="Aisle 7, Gentrit Rashiti">
          <motion.span className="as-aisle" initial={reduced ? false : { clipPath: 'inset(0 100% 0 0)' }} animate={{ clipPath: 'inset(0 0% 0 0)' }} transition={reduced ? { duration: .01 } : { duration: .5, ease: ease.arrive }}>AISLE <em>7</em></motion.span>
          <motion.span className="as-aisle-line" initial={reduced ? false : { clipPath: 'inset(0 100% 0 0)' }} animate={{ clipPath: 'inset(0 0% 0 0)' }} transition={reduced ? { duration: .01 } : { duration: .5, ease: ease.arrive, delay: .12 }}><span>Gentrit Rashiti</span><i aria-hidden="true">—</i><span>Web · Mobile · Full stack</span></motion.span>
        </h1>
        <div className="as-talker-tools">
          {home ? <a href={links.cv} download>CV <Arrow /></a> : <a href="/drafts"><Arrow back />All aisles</a>}
          <button type="button" aria-pressed={soundEnabled && !reduced} disabled={reduced} onClick={toggleSound}>Sound {soundEnabled && !reduced ? 'on' : 'off'}<span className="as-sound-dot" aria-hidden="true" /></button>
        </div>
      </header>
      <div className="as-store-controls" data-search={searchOpen || !!query}>
        <nav aria-label="Choose a shelf">
          {[{ id: 'all', label: 'All 28' }, ...shelves.map(shelf => ({ id: shelf.id, label: shelfLabels[shelf.id] }))].map(tab => <button key={tab.id} type="button" aria-pressed={filter === tab.id} onClick={() => setFilter(tab.id)}>
            {tab.label}{filter === tab.id && <motion.span className="as-tab-mark" layoutId="as-tab-mark" transition={reduced ? { duration: .01 } : spring.ui} />}
          </button>)}
        </nav>
        <button type="button" className="as-search-toggle" aria-expanded={searchOpen || !!query} aria-controls="as-search" aria-label="Find a project or technology" onClick={() => setSearchOpen(open => !open)}><SearchIcon /></button>
        <label className="as-search"><span className="as-sr">Find a project or technology</span><SearchIcon /><input id="as-search" ref={searchInput} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Find a project or technology" /></label>
      </div>
      <div className="as-shelves" id="as-shelves">
        {visibleShelves.map(shelf => {
          const stock = shelf.slugs.filter(slug => matching.has(slug))
          if (!stock.length) return null
          const order = shelfOrder++
          const shelfDelay = .1 + order * .12
          return <motion.section className="as-shelf" key={shelf.id} aria-labelledby={'as-shelf-' + shelf.id}
            initial={reduced ? false : { y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={reduced ? { duration: .01 } : { duration: dur.panel, ease: ease.arrive, delay: settled ? 0 : shelfDelay }}>
            <header><h2 id={'as-shelf-' + shelf.id}>{shelf.title}</h2><p>{shelf.note}</p><div className="as-shelf-arrows"><button type="button" aria-label={'Previous products on ' + shelf.title} onClick={() => moveShelf(shelf.id, -1)}><Arrow back /></button><button type="button" aria-label={'Next products on ' + shelf.title} onClick={() => moveShelf(shelf.id, 1)}><Arrow /></button></div></header>
            <div className="as-shelf-unit">
              <span className="as-deck" aria-hidden="true" />
              <div className="as-shelf-stock" ref={node => { if (node) shelfNodes.current.set(shelf.id, node); else shelfNodes.current.delete(shelf.id) }}>
                {stock.map((slug, index) => <ProductBox key={slug} item={productBySlug.get(slug)!} index={index} enterDelay={shelfDelay + .06 + index * .035} settled={settled} inBasket={basket.includes(slug)} scanning={scanning.includes(slug)} reduced={reduced} detailActive={detailsOpen && inspected === slug} scan={scan} register={registerFront} />)}
              </div>
            </div>
          </motion.section>
        })}
        {!matchCount && <div className="as-empty"><h2>Empty shelf.</h2><p>No project matches “{query}”.</p><button type="button" onClick={() => { setQuery(''); setFilter('all'); setSearchOpen(false) }}>Restock all 28 <Arrow /></button></div>}
        <section className="as-readout" aria-label="Scanner display">
          <span>{scanning.includes(inspected) ? 'SCANNING' : basket.includes(inspected) ? 'IN YOUR BASKET' : 'ON THE SHELF'} · GR / {selected.reference}</span>
          <h2>{selected.project.name}</h2>
          <p>{selected.project.line}</p>
          <button type="button" onClick={() => inspect(inspected)}>Read the label <Arrow /></button>
        </section>
      </div>
      <AnimatePresence mode="popLayout">{detailsOpen && <motion.section key={inspected} initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }} transition={reduced ? { duration: .01 } : { duration: dur.panel, ease: ease.arrive }} className="as-label-detail" tabIndex={-1} ref={labelPanel} aria-labelledby="as-detail-title">
        <div><p>{selected.project.kind} · {selected.project.years ?? 'Independent work'}</p><motion.h2 id="as-detail-title" layoutId={'as-title-' + inspected} transition={reduced ? { duration: .01 } : spring.ui}>{selected.project.name}</motion.h2>
          <button type="button" className="as-detail-scan" onClick={() => scan(inspected)} disabled={basket.includes(inspected)}>{basket.includes(inspected) ? 'In your basket' : 'Add to your basket'}{basket.includes(inspected) ? <CheckIcon /> : <BasketIcon />}</button>
          <button className="as-close-case" type="button" onClick={() => setDetailsOpen(false)}>Close the label</button></div>
        <div><p>{selected.project.summary}</p><dl><div><dt>Work</dt><dd>{selected.project.role}</dd></div><div><dt>Technology</dt><dd>{selected.project.stack.join(' · ')}</dd></div></dl><nav aria-label={selected.project.name + ' links'}>{selected.project.featured && <a href={'/work/' + inspected}>Full case study <Arrow /></a>}{selected.project.links.map(link => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label} <Arrow /></a>)}</nav></div>
        {inspected === 'care-platform' ? <CareFile reduced={reduced} /> : selected.image && <figure><img src={selected.poster ?? selected.image.src} alt={selected.image.alt} loading="lazy" /><figcaption>{selected.image.recreation ? 'Recreation · invented data' : 'Public store or web page'}</figcaption></figure>}
      </motion.section>}</AnimatePresence>
      <footer className="as-footer">
        <div><h2>Gentrit Rashiti</h2><p>Web and mobile products, from the first screen to release: healthcare, video streaming, e-reading and Web3. Kosovo, working remotely.</p></div>
        <nav aria-label="Contact"><a href={'mailto:' + links.email}>Email <Arrow /></a><a href={links.github}>GitHub <Arrow /></a><a href={links.linkedin}>LinkedIn <Arrow /></a><a href={links.cv}>Full CV <Arrow /></a></nav>
      </footer>
    </div>
    <dialog className="as-till" ref={receiptDialog} open={!mobile} aria-labelledby="as-till-title" onClose={() => setReceiptOpen(false)} onCancel={event => { event.preventDefault(); closeReceipt() }} onClick={event => { if (mobile && event.target === event.currentTarget) closeReceipt() }}>
      <header className="as-till-head">
        <span className="as-till-basket" ref={tillBasket}><BasketIcon /></span>
        <h2 id="as-till-title">Basket</h2>
        <span className="as-till-count" ref={tillCount} aria-label={landed.length + ' projects'}>{count}</span>
        <button type="button" className="as-close-receipt" onClick={closeReceipt} aria-label="Close the receipt"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M5 15 15 5" /></svg></button>
      </header>
      <div className="as-printer" data-printing={inFlight.length > 0}>
        <span className="as-printer-body" aria-hidden="true"><span className="as-printer-led" /><span className="as-printer-slot" /></span>
        <div className="as-paper-feed" ref={paperFeed}>
          <ThermalReceipt items={items} date={receiptDate} reduced={reduced} remove={remove} inspect={inspect} />
        </div>
      </div>
      <AnimatePresence initial={false}>
        {items.length > 0 && <motion.div className="as-receipt-actions" initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: 8, filter: 'blur(4px)' }} transition={reduced ? { duration: .01 } : { duration: dur.ui, ease: ease.out }}>
          <button type="button" className="as-print-button" disabled={printing} onClick={() => void printReceipt()}>{printing ? 'Preparing…' : 'Print / save PDF'}<Arrow /></button>
          <div><button type="button" onClick={downloadReceipt}>Download text</button><button type="button" onClick={resetBasket}>Empty basket</button></div>
        </motion.div>}
      </AnimatePresence>
    </dialog>
    <button ref={basketButton} className="as-mobile-basket" type="button" onClick={() => setReceiptOpen(true)} aria-label={'Open the receipt, ' + landed.length + ' projects in the basket'}>
      <span className="as-bar-basket" ref={barBasket}><BasketIcon /></span><span>Basket</span><strong ref={barCount}>{count}</strong><span>Receipt <Arrow /></span>
    </button>
    <p className="as-sr" role="status" aria-live="polite" aria-atomic="true">{message}</p>
  </main></LayoutGroup>
}
