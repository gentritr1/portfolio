import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import { ArrowRightIcon, XIcon } from '@phosphor-icons/react'
import { systems } from './data'
import { FullSize, type FullSizeHandle } from './FullSize'
import { tune } from './tune'
import { cropVars, LEADS, pct, shots, type Crop, type Shot } from './screens'

/**
 * Production work: five chapters, each one composition of real screens standing on a lit table, from the selected-work
 * sequence (design/selected-work-concepts/sequence-v2, owner-approved 2026-10-28). Positions are that study's pixels: a
 * 1440 × 900 frame on wide screens, a 390-wide stage on phones. Screens are crops of the existing assets, never redrawn.
 * Every figure is in CONTENT.md: the 100K+ download counts (§3, §4, checked 2026-10-27, cumulative Android reach only),
 * 41 components and 22 releases in 60 days (§6b), about 14 releases and RN 0.63 → 0.81 (§4). The care rebuild keeps its
 * approved name and stays marked in progress (§2, not in production).
 *
 * Motion: scrolled in, the screens settle a few degrees and pixels into place; pointers that hover bring Bayyinah's second
 * screen forward a little; "Read the case" grows the main screen into the case (Draft.tsx names it for the view transition).
 * The field behind the page stays visible around the work and quiets only behind the words.
 */

const BASE = '/drafts/refractive-engine'
const plain = (e: MouseEvent) => !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
const ReaderDemo = lazy(() => import('../../worlds/reading/Recreation').then((m) => ({ default: m.Recreation })))

type Vars = CSSProperties & Record<`--${string}`, string | number>

/** A text block placed on the 1440 × 900 frame (wide screens only; phones keep it in the flow). */
const at = (x: number, y: number, w?: number): Vars => ({ '--x': pct(x / 14.4), '--y': pct(y / 9), ...(w ? { '--w': pct(w / 14.4) } : {}) })

function Screen({ shot, eager }: { shot: Shot; eager?: boolean }) {
  return (
    <div className="re-sw-screen">
      <img src={shot.src} width={shot.w} height={shot.h} alt={shot.alt} draggable={false} loading={eager ? 'eager' : 'lazy'} decoding="async" />
    </div>
  )
}

/** Several real screens of one product, shown one at a time in the same slab. They share its crop, so the slab never moves. */
type Swap = { shots: Shot[]; index: number; armed: boolean; instant: boolean; set(i: number, instant: boolean): void; arm(): void }

function useSwap(shots: Shot[]): Swap {
  const [index, setIndex] = useState(0)
  const [armed, setArmed] = useState(false)
  const [instant, setInstant] = useState(false)
  return {
    shots, index, armed, instant,
    set: (i, inst) => { setArmed(true); setInstant(inst); setIndex(((i % shots.length) + shots.length) % shots.length) },
    arm: () => setArmed(true),
  }
}

/** The active screen is sharp; the others wait underneath and only load once the reader reaches for the controls. */
function SwapScreen({ swap }: { swap: Swap }) {
  return (
    <div className="re-sw-screen" data-swap data-instant={swap.instant || undefined}>
      {swap.shots.map((shot, i) => (i === swap.index || swap.armed) && (
        <img key={shot.src} src={shot.src} width={shot.w} height={shot.h} alt={i === swap.index ? shot.alt : ''} aria-hidden={i !== swap.index || undefined}
          data-on={i === swap.index || undefined} draggable={false} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" />
      ))}
    </div>
  )
}

/**
 * The swap's controls: one 44 px target per screen, the active one at full ink. A tap or click crossfades the screen; the
 * keyboard (Enter or Space, detail 0) swaps at once. On phones the row sits in the flow under the stage, and the slab
 * itself also takes a sideways swipe.
 */
function Thumbs({ swap, crop, place, label, thumbW }: { swap: Swap; crop: Crop; place: Vars; label: string; thumbW: number }) {
  return (
    <div className="re-sw-at re-sw-thumbs" style={place} role="group" aria-label={label} onPointerEnter={swap.arm} onFocus={swap.arm}>
      {swap.shots.map((shot, i) => (
        <button key={shot.src} type="button" aria-pressed={i === swap.index} aria-label={shot.alt} onClick={(e) => swap.set(i, e.detail === 0)}>
          <span className="re-sw-thumb" style={{ ...cropVars(shot, crop), width: thumbW } as Vars}>
            <img src={shot.src} width={shot.w} height={shot.h} alt="" loading="lazy" decoding="async" />
          </span>
        </button>
      ))}
    </div>
  )
}

/** One screen as a glass slab. `place` is [x, y, width] on the wide frame; `phone` on the 390-wide stage, or omitted to hide it there. */
function Slab({ shot, crop, phoneCrop, place, phone, nh, transform, z, kind = 'lead', eager, swap, onReal }: {
  shot: Shot; crop?: Crop; phoneCrop?: Crop; place: [number, number, number]; phone?: [number, number, number]; nh: number
  transform?: string; z?: number; kind?: 'lead' | 'companion' | 'swap'; eager?: boolean; swap?: Swap; onReal?(): void
}) {
  // Touch: a sideways swipe on a swapping slab moves to the next or previous screen; vertical moves stay page scrolls.
  const start = useRef<{ x: number; y: number } | null>(null)
  const touch = swap && {
    onPointerDown: (e: React.PointerEvent) => { if (e.pointerType === 'touch') { start.current = { x: e.clientX, y: e.clientY }; swap.arm() } },
    onPointerUp: (e: React.PointerEvent) => {
      const s0 = start.current
      start.current = null
      if (!s0) return
      const dx = e.clientX - s0.x, dy = e.clientY - s0.y
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) swap.set(swap.index + (dx < 0 ? 1 : -1), false)
    },
  }
  const style: Vars = {
    ...cropVars(shot, crop), ...cropVars(shot, phoneCrop ?? crop, 'n'),
    '--x': pct(place[0] / 14.4), '--y': pct(place[1] / 9), '--w': pct(place[2] / 14.4),
    ...(phone ? { '--nx': pct(phone[0] / 3.9), '--ny': pct((phone[1] / nh) * 100), '--nw': pct(phone[2] / 3.9) } : {}),
    ...(transform ? { '--t': transform } : {}), ...(z ? { '--z': z } : {}),
  }
  const shown = swap ? swap.shots[swap.index] : shot
  return (
    <figure className={`re-sw-slab re-sw-${kind}`} style={style} data-wide-only={phone ? undefined : ''} data-swipe={swap ? '' : undefined} {...touch}>
      {swap ? <SwapScreen swap={swap} /> : <Screen shot={shot} eager={eager} />}
      <div className="re-sw-reflection" aria-hidden="true"><Screen shot={{ ...shown, alt: '' }} /></div>
      {onReal && <button type="button" className="re-sw-real" aria-label={`${shot.alt}, at full size`} onClick={onReal} />}
    </figure>
  )
}

/** The table under one composition: its contact lights, from the study's canvas (frame pixels). */
function floor(top: number, bottom: number, lights: [number, number, number, number][]): Vars {
  const h = bottom - top
  const fl = lights.map(([x, y, rx, ry]) =>
    `radial-gradient(${pct(rx / 14.4)} ${pct((ry / h) * 100)} at ${pct(x / 14.4)} ${pct(((y - top) / h) * 100)}, rgb(226 236 248 / 0.33), rgb(208 221 238 / 0.18) 25%, rgb(183 200 220 / 0.065) 60%, transparent)`)
  return { '--ft': pct(top / 9), '--fh': pct(h / 9), '--fl': fl.join(', ') }
}

function Chapter({ id, nh, table, hs, slabs, children }: { id: string; nh: number; table: Vars; hs: number; slabs: ReactNode; children: ReactNode }) {
  return (
    <article id={`work-${id}`} className={`re-sw re-sw-${id}`} style={{ '--nh': nh, '--hs': hs } as Vars}>
      <div className="re-sw-stage">
        <div className="re-sw-floor" style={table} aria-hidden="true" />
        <div className="re-sw-contact" aria-hidden="true"><span className="re-sw-contact-soft" /><span className="re-sw-contact-sharp" /></div>
        <div className="re-sw-slabs">{slabs}</div>
      </div>
      {children}
    </article>
  )
}

function Meta({ name, role, stack }: { name: string; role: ReactNode; stack?: boolean }) {
  return <p className="re-sw-meta" data-stack={stack || undefined}><span>{name}</span><span>{role}</span></p>
}

/** The product's layers, as the chamber names them (systems[].layers), quiet beside the screen until the chapter is hovered or focused. */
function Layers({ slug, place, row }: { slug: string; place: Vars; row?: boolean }) {
  const layers = systems.find((s) => s.slug === slug)?.layers ?? []
  if (!layers.length) return null
  return (
    <ol className="re-sw-at re-sw-layers" style={place} data-row={row || undefined} aria-label={`Built in ${layers.length} layers`}>
      {layers.map((l, i) => (
        <li key={l.title}>
          <span><span className="re-num">{String(i + 1).padStart(2, '0')}</span> {l.title}</span>
          <span>{l.stack}</span>
        </li>
      ))}
    </ol>
  )
}

function Reach({ href }: { href: string }) {
  return (
    <a className="re-sw-proof" href={href} target="_blank" rel="noreferrer" data-numbers>
      100K+ Google Play downloads
      <small>Product reach · October 2026<span className="re-sr"> (opens in a new tab)</span></small>
    </a>
  )
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/** The screens each swapping slab steps through, in the order a visitor meets them (NN/g: five or fewer per carousel). */
const BAYYINAH: Shot[] = [
  shots.landing,
  { src: '/showcase/bayyinah/web-03.webp', w: 2880, h: 1800, alt: 'Bayyinah TV library, Arabic tab: beginner courses and the flagship Arabic program' },
  { src: '/showcase/bayyinah/web-04.webp', w: 2880, h: 1800, alt: 'Bayyinah TV library, Stories tab: filters by prophet and a row of story courses' },
  { src: '/showcase/bayyinah/web-05.webp', w: 2880, h: 1800, alt: 'Bayyinah TV series page: episode list in a side column, series summary and video cards' },
  { src: '/showcase/bayyinah/web-06.webp', w: 2880, h: 1800, alt: 'Bayyinah TV pricing: Choose Your Plan with a monthly and annual switch and the Premium plan' },
]
// The achievements screen has its own slab and a different crop, so the reader's slab steps through the other three.
const READER: Shot[] = [
  shots.reader,
  { src: '/mobile/reading-1.webp', w: 780, h: 1689, alt: 'Read to Feed My Books: reading progress for The Tale of Peter Rabbit and Anne of Green Gables' },
  { src: '/mobile/reading-4.webp', w: 780, h: 1689, alt: 'Read to Feed New Badge pop-up for 50,000 eggs' },
]

/**
 * Real size on request: hovering or focusing the companion grows it to the size a visitor saw it, its crop width ÷ 2 for
 * a 2× capture (960 ÷ 2 = 480 px), instead of a fixed zoom. The factor follows the page's width, so it is measured.
 */
function useRealSize(root: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const host = root.current
    if (!host) return
    const measure = () => host.querySelectorAll<HTMLElement>('.re-sw-swap').forEach((el) => {
      const screen = el.querySelector<HTMLElement>('.re-sw-screen')
      if (screen?.offsetWidth) el.style.setProperty('--real', (480 / screen.offsetWidth).toFixed(3))
    })
    measure()
    const ro = new ResizeObserver(measure)
    host.querySelectorAll('.re-sw-swap').forEach((el) => ro.observe(el))
    return () => ro.disconnect()
  }, [root])
}

/**
 * The settle's shape: a critically damped ("deadbeat") response, 1 − (1 + ωp)·e^(−ωp). It moves fastest early and its
 * slope reaches zero at rest, so the screen lands instead of stopping dead. ω = 7.5 leaves 0.13 px and 0.05° at p = 1,
 * under half a device pixel, so the cut to the resting styles cannot be seen. (Chosen over a slower glide and a 0.46°
 * overshoot, compared live on 2026-10-28.)
 */
const deadbeat = (p: number) => 1 - (1 + 7.5 * p) * Math.exp(-7.5 * p)

/**
 * Scroll-driven arrival, kept small: the screens settle from 10° and 28 px lower to rest along the deadbeat curve, solid
 * the whole way, by the time the main screen's top reaches 60% of the viewport. The table's light comes up under them and
 * a contact shadow tightens as the gap closes: its blur follows the penumbra law, 2 + 0.5 × gap px (16 px → 2 px), drawn
 * as a soft and a sharp layer crossfaded by opacity, so nothing repaints. transform and opacity are written on the moving
 * layers themselves, not as variables on the chapter, which would restyle every image and line of text in it each frame.
 */
function useArrival(root: React.RefObject<HTMLElement | null>, reduced: boolean, onFocus?: (x: number, y: number, r: number, w: number) => void) {
  // The contact shadow sits on the table under the main screen, whatever the layout; placed for reduced motion too.
  useEffect(() => {
    const host = root.current
    if (!host) return
    const place = () => {
      for (const el of host.querySelectorAll<HTMLElement>('.re-sw')) {
        const lead = el.querySelector<HTMLElement>('.re-sw-lead'), contact = el.querySelector<HTMLElement>('.re-sw-contact')
        if (!lead || !contact) continue
        contact.style.left = `${lead.offsetLeft + lead.offsetWidth * 0.06}px`
        contact.style.width = `${lead.offsetWidth * 0.88}px`
        contact.style.top = `${lead.offsetTop + lead.offsetHeight - 10}px`
      }
    }
    place()
    const ro = new ResizeObserver(place)
    host.querySelectorAll('.re-sw-stage').forEach((s) => ro.observe(s))
    return () => ro.disconnect()
  }, [root])

  useEffect(() => {
    const host = root.current
    if (!host || reduced) return
    const all = [...host.querySelectorAll<HTMLElement>('.re-sw')].map((el) => ({
      lead: el.querySelector<HTMLElement>('.re-sw-lead')!,
      slabs: el.querySelector<HTMLElement>('.re-sw-slabs')!,
      floor: el.querySelector<HTMLElement>('.re-sw-floor')!,
      contact: el.querySelector<HTMLElement>('.re-sw-contact')!,
      soft: el.querySelector<HTMLElement>('.re-sw-contact-soft')!,
      sharp: el.querySelector<HTMLElement>('.re-sw-contact-sharp')!,
      p: -1,
    }))
    const set = (c: (typeof all)[number], p: number) => {
      if (p >= 1) {
        for (const l of [c.slabs, c.floor, c.contact, c.soft, c.sharp]) { l.style.removeProperty('transform'); l.style.removeProperty('opacity') }
        return
      }
      const e = deadbeat(p), q = 1 - e, gap = 28 * q
      c.slabs.style.transform = `perspective(1600px) translateY(${gap.toFixed(2)}px) rotateX(${(10 * q).toFixed(3)}deg)`
      c.floor.style.opacity = (0.4 + 0.6 * e).toFixed(3)
      // Penumbra: the soft layer is the 16 px shadow of the full gap, the sharp one the 2 px shadow at contact.
      c.soft.style.opacity = q.toFixed(3)
      c.sharp.style.opacity = e.toFixed(3)
      c.contact.style.transform = `translateY(${(0.58 * gap).toFixed(2)}px)`
    }
    let frame = 0, focusW = 0
    const update = () => {
      frame = 0
      // The field behind the settling screen snaps into the lens's page layout and lets go again by the time it rests.
      let best = 0, fx = 0, fy = 0, fr = 0
      for (const c of all) {
        const r = c.lead.getBoundingClientRect()
        if (r.top > innerHeight * 1.2 || r.top < -innerHeight) continue
        // At rest once the top reaches 60%: Lenis converges sub-pixel and fires no last scroll, so p alone never lands on 1.
        const p = r.top <= innerHeight * 0.6 + 0.5 ? 1 : clamp01((innerHeight - r.top) / (innerHeight * 0.4))
        if (p !== c.p) { c.p = p; set(c, p); if (tune.debug) c.lead.closest<HTMLElement>('.re-sw')!.dataset.p = p.toFixed(2) }
        const w = Math.sin(Math.PI * p) * 0.55
        if (w > best) { best = w; fx = r.left + r.width / 2; fy = r.top + r.height / 2; fr = Math.max(r.width, r.height) * 0.62 }
      }
      if (best > 0.01 || focusW > 0.01) onFocus?.(fx, fy, fr, best)
      focusW = best
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    addEventListener('scroll', schedule, { passive: true })
    addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      removeEventListener('scroll', schedule)
      removeEventListener('resize', schedule)
      all.forEach((c) => set(c, 1))
      onFocus?.(0, 0, 0, 0)
    }
  }, [root, reduced, onFocus])
}

export function Production({ onOpen, reduced, onFocus }: { onOpen(slug: string, trigger: HTMLAnchorElement, keyboard: boolean): void; reduced: boolean; onFocus?(x: number, y: number, r: number, w: number): void }) {
  const root = useRef<HTMLElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const [reading, setReading] = useState(false)
  const full = useRef<FullSizeHandle>(null)
  useArrival(root, reduced, onFocus)
  const bayyinah = useSwap(BAYYINAH)
  const reader = useSwap(READER)
  useRealSize(root)
  // Real size on request: the course row at the size a visitor saw it (the 2880 px capture at 2×), opened on the live course.
  const openReal = () => full.current?.open([1248 + 960 / 2, 1148 + 620 / 2])

  // Pressing the link starts the move and warms the case's opening screen; the click then opens it.
  const press = (slug: string) => (e: React.PointerEvent<HTMLAnchorElement>) => {
    const lead = LEADS[slug]
    if (lead) { const img = new Image(); img.src = lead.shot.src; img.decode().catch(() => {}) }
    if (e.pointerType === 'mouse' && e.button === 0) e.currentTarget.closest('.re-sw')?.setAttribute('data-lift', '')
  }
  const release = (e: React.PointerEvent<HTMLAnchorElement>) => e.currentTarget.closest('.re-sw')?.removeAttribute('data-lift')
  const caseLink = (slug: string) => (
    <a className="re-prod-case" href={`${BASE}/${slug}`} onPointerDown={press(slug)} onPointerLeave={release} onPointerCancel={release} onClick={(e) => { if (!plain(e)) return; e.preventDefault(); onOpen(slug, e.currentTarget, e.detail === 0) }}>
      Read the case
      <ArrowRightIcon size={20} weight="light" aria-hidden="true" />
    </a>
  )

  return (
    <section ref={root} id="re-work" className="re-prod" aria-labelledby="re-prod-h">
      <h2 id="re-prod-h" className="re-sr">Production work</h2>

      <Chapter
        id="bayyinah" nh={440} hs={50}
        table={floor(654, 820, [[570, 731, 515, 51], [1160, 724, 210, 45]])}
        slabs={<>
          {/* The hero only: the row under it shows the site's own audience figures, which are not the sourced Play count beside it. */}
          <Slab shot={shots.landing} swap={bayyinah} crop={[0, 0, 2880, 1420]} phoneCrop={[40, 400, 1400, 1000]} place={[70, 110, 1008]} phone={[16, 11, 358]} nh={440} transform="rotate(-0.55deg)" eager />
          <Slab shot={shots.courses} kind="swap" onReal={openReal} crop={[1248, 1148, 960, 620]} place={[984, 461, 370]} phone={[20, 188, 350]} nh={440} transform="rotate(2deg)" z={4} eager />
        </>}
      >
        <Thumbs swap={bayyinah} crop={[0, 0, 2880, 1420]} place={at(64, 636)} label="Bayyinah TV screens" thumbW={64} />
        <div className="re-sw-at re-sw-copy" style={at(48, 742, 865)}>
          <Meta name="Bayyinah TV" role="Frontend · 2023–2026" />
          <h3>Rebuilt a live learning platform.</h3>
          <p className="re-sw-line">Live and on-demand video, subscriptions and English/Arabic support across web and mobile.</p>
        </div>
        <Layers slug="bayyinah-tv" place={at(1110, 175, 290)} />
        <div className="re-sw-at re-sw-act" style={at(1040, 787, 310)}>
          <Reach href="https://play.google.com/store/apps/details?id=com.zombiesoup.bayyinah" />
          {caseLink('bayyinah-tv')}
        </div>
      </Chapter>

      <Chapter
        id="reading" nh={445} hs={46}
        table={floor(702, 865, [[1047, 805, 195, 46], [705, 809, 195, 46]])}
        slabs={<>
          <Slab shot={shots.reader} swap={reader} crop={[82, 462, 616, 1227]} phoneCrop={[82, 462, 616, 566]} place={[867, 70, 370]} phone={[58, 20, 312]} nh={445} />
          <Slab shot={shots.achievements} kind="companion" crop={[82, 620, 616, 1069]} phoneCrop={[82, 620, 616, 405]} place={[520, 166, 370]} phone={[20, 222, 312]} nh={445} z={4} />
        </>}
      >
        <Thumbs swap={reader} crop={[82, 462, 616, 1227]} place={at(862, 838)} label="Read to Feed screens" thumbW={29} />
        <p className="re-sw-at re-sw-cap" style={at(520, 838)}>Store listing images.</p>
        <div className="re-sw-at re-sw-copy" style={at(64, 196, 420)}>
          <Meta name="Read to Feed" role="Mobile, iOS and Android · 2022–25" stack />
          <h3>Kept a children's reading app shipping for four years.</h3>
          <p className="re-sw-line">EPUB and PDF reader, barcode scanning, quizzes, badges and streaks, in three languages.</p>
          <p className="re-sw-proof" data-numbers>About 14 store releases<small>React Native 0.63 → 0.81</small></p>
          <div className="re-sw-actions">
            {caseLink('read-to-feed')}
            <button type="button" className="re-sw-try" onClick={() => { setReading(true); dialog.current?.showModal() }}>Try the reader</button>
          </div>
        </div>
        <Layers slug="read-to-feed" place={at(64, 690, 420)} row />
      </Chapter>

      <Chapter
        id="care" nh={345} hs={42}
        table={floor(639, 802, [[880, 711, 515, 48]])}
        slabs={<Slab shot={shots.calendar} place={[412, 96, 970]} phoneCrop={[440, 380, 1100, 960]} phone={[16, 10, 358]} nh={345} transform="rotate(-2deg)" />}
      >
        <p className="re-sw-at re-sw-cap" style={at(430, 744)}>Real product screens, invented data.</p>
        <div className="re-sw-at re-sw-copy" style={at(64, 77, 305)}>
          <Meta name="Care-management platform" role="A team effort" stack />
          <h3>Rebuilding the dashboard, one tested screen at a time.</h3>
          <p className="re-sw-status">In progress</p>
        </div>
        <ol className="re-sw-at re-sw-process" style={at(65, 790, 1310)} aria-label="How each screen moves over">
          <li>Test the existing screen</li>
          <li>AI agents build</li>
          <li>Run the checks</li>
          <li>A person approves</li>
        </ol>
        <Layers slug="care-platform" place={at(64, 440, 300)} />
        <div className="re-sw-at re-sw-act" style={at(64, 842)}>{caseLink('care-platform')}</div>
      </Chapter>

      <Chapter
        id="system" nh={400} hs={44}
        table={floor(561, 760, [[428, 653, 363, 45], [1098, 462, 255, 36], [812, 731, 480, 42]])}
        slabs={<>
          <Slab shot={shots.matrix} crop={[1280, 145, 1780, 1430]} place={[64, 68, 720]} phone={[16, 10, 300]} nh={400} />
          <Slab shot={shots.picker} kind="companion" place={[845, 117, 523]} nh={400} transform="rotate(1deg)" />
          <figure className="re-sw-slab re-sw-states" style={{ '--x': pct(338 / 14.4), '--y': pct(570 / 9), '--w': pct(936 / 14.4), '--nx': pct(30 / 3.9), '--ny': pct((200 / 400) * 100), '--nw': pct(344 / 3.9), '--z': 4 } as Vars}>
            <div className="re-sw-states-row">
              {(['rest', 'hover', 'focus', 'disabled', 'loading'] as const).map((s) => (
                <img key={s} src={`/showcase/design-system/boards/xv/inspect/btn-${s}.webp`} width={280} height={214} alt={`Save plan button, ${s} state, with its measured contrast`} loading="lazy" decoding="async" />
              ))}
            </div>
          </figure>
        </>}
      >
        <p className="re-sw-at re-sw-cap" style={at(64, 669)}>Real product screens, invented data.</p>
        <div className="re-sw-at re-sw-copy" style={at(64, 749, 760)}>
          <Meta name="Design System v2" role="A team effort · 2026" />
          <h3>One shared library, checked before release.</h3>
        </div>
        <Layers slug="design-system-react" place={at(852, 466, 516)} row />
        <div className="re-sw-at re-sw-act" style={at(962, 786, 350)}>
          <p className="re-sw-proof" data-numbers>41 components, 22 releases in 60 days.</p>
          {caseLink('design-system-react')}
        </div>
      </Chapter>

      <Chapter
        id="viva" nh={400} hs={52}
        table={floor(626, 819, [[384, 714, 182, 53], [650, 721, 170, 48]])}
        slabs={<>
          <Slab shot={shots.cart} kind="companion" crop={[88, 298, 604, 1308]} place={[503, 154, 256]} phone={[192, 34, 165]} nh={400} transform="perspective(1700px) rotateY(5deg)" z={2} />
          <Slab shot={shots.catalog} crop={[88, 298, 604, 1308]} place={[251, 95, 280]} phone={[28, 10, 170]} nh={400} transform="perspective(1700px) rotateY(-4deg)" z={3} />
        </>}
      >
        <div className="re-sw-at re-sw-copy re-sw-right" style={at(899, 281, 476)}>
          <Meta name="Viva Fresh" role="Mobile · 2023" />
          <h3>Shipped grocery shopping on iOS and Android.</h3>
          <Reach href="https://play.google.com/store/apps/details?id=com.zs.vivafresh" />
          {caseLink('viva-fresh')}
        </div>
        <Layers slug="viva-fresh" place={at(64, 170, 175)} />
      </Chapter>

      <FullSize ref={full} src={shots.courses.src} w={shots.courses.w} h={shots.courses.h} alt={shots.courses.alt} />

      <dialog ref={dialog} className="re-sw-reader" aria-label="Read to Feed, interactive recreation" data-lenis-prevent onClose={() => setReading(false)}>
        <div className="re-ch-demo-bar">
          <p>Interactive recreation</p>
          <button type="button" onClick={() => dialog.current?.close()}>
            Close
            <XIcon size={16} weight="regular" aria-hidden="true" />
          </button>
        </div>
        <div className="re-ch-demo-stage">
          {reading && (
            <Suspense fallback={<p className="re-ch-demo-loading" role="status">Opening the reader…</p>}>
              <ReaderDemo bare />
            </Suspense>
          )}
        </div>
      </dialog>
    </section>
  )
}
