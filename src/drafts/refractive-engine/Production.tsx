import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import { ArrowRightIcon, XIcon } from '@phosphor-icons/react'

/**
 * Production work: five chapters, each one composition of real screens standing on a lit table, from the selected-work
 * sequence (design/selected-work-concepts/sequence-v2, owner-approved 2026-10-28). Positions are that study's pixels: a
 * 1440 × 900 frame on wide screens, a 390-wide stage on phones. Screens are crops of the existing assets, never redrawn.
 * Every figure is in CONTENT.md: the 100K+ download counts (§3, §4, checked 2026-10-27, cumulative Android reach only),
 * 41 components and 22 releases in 60 days (§6b), about 14 releases and RN 0.63 → 0.81 (§4). The care rebuild keeps its
 * approved name and stays marked in progress (§2, not in production).
 *
 * Motion (bayyinah-motion storyboard): scrolled in, the screens rise from 70° about their lower edge to frontal as the
 * field's dots gather onto the main screen's bevel; pointers that hover bring Bayyinah's second screen forward; "Read the
 * case" grows the main screen into the case (Draft.tsx names it for the view transition).
 */

const BASE = '/drafts/refractive-engine'
const plain = (e: MouseEvent) => !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
const ReaderDemo = lazy(() => import('../../worlds/reading/Recreation').then((m) => ({ default: m.Recreation })))

type Crop = [x: number, y: number, w: number, h: number]
type Shot = { src: string; w: number; h: number; alt: string }
type Vars = CSSProperties & Record<`--${string}`, string | number>

const pct = (v: number) => `${+v.toFixed(3)}%`
const cropVars = ({ w, h }: Shot, c: Crop | undefined, p = '') =>
  c
    ? { [`--${p}sw`]: pct((w / c[2]) * 100), [`--${p}sl`]: pct((-c[0] / c[2]) * 100), [`--${p}st`]: pct((-c[1] / c[3]) * 100), [`--${p}ar`]: `${c[2]} / ${c[3]}` }
    : { [`--${p}sw`]: '100%', [`--${p}sl`]: '0%', [`--${p}st`]: '0%', [`--${p}ar`]: `${w} / ${h}` }
/** A text block placed on the 1440 × 900 frame (wide screens only; phones keep it in the flow). */
const at = (x: number, y: number, w?: number): Vars => ({ '--x': pct(x / 14.4), '--y': pct(y / 9), ...(w ? { '--w': pct(w / 14.4) } : {}) })

function Screen({ shot, eager }: { shot: Shot; eager?: boolean }) {
  return (
    <div className="re-sw-screen">
      <img src={shot.src} width={shot.w} height={shot.h} alt={shot.alt} draggable={false} loading={eager ? 'eager' : 'lazy'} decoding="async" />
    </div>
  )
}

/** One screen as a glass slab. `place` is [x, y, width] on the wide frame; `phone` on the 390-wide stage, or omitted to hide it there. */
function Slab({ shot, crop, phoneCrop, place, phone, nh, transform, z, kind = 'lead', eager }: {
  shot: Shot; crop?: Crop; phoneCrop?: Crop; place: [number, number, number]; phone?: [number, number, number]; nh: number
  transform?: string; z?: number; kind?: 'lead' | 'companion' | 'swap'; eager?: boolean
}) {
  const style: Vars = {
    ...cropVars(shot, crop), ...cropVars(shot, phoneCrop ?? crop, 'n'),
    '--x': pct(place[0] / 14.4), '--y': pct(place[1] / 9), '--w': pct(place[2] / 14.4),
    ...(phone ? { '--nx': pct(phone[0] / 3.9), '--ny': pct((phone[1] / nh) * 100), '--nw': pct(phone[2] / 3.9) } : {}),
    ...(transform ? { '--t': transform } : {}), ...(z ? { '--z': z } : {}),
  }
  return (
    <figure className={`re-sw-slab re-sw-${kind}`} style={style} data-wide-only={phone ? undefined : ''}>
      <Screen shot={shot} eager={eager} />
      <div className="re-sw-reflection" aria-hidden="true"><Screen shot={{ ...shot, alt: '' }} /></div>
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
    <article className={`re-sw re-sw-${id}`} style={{ '--nh': nh, '--hs': hs } as Vars}>
      <div className="re-sw-stage">
        <div className="re-sw-floor" style={table} aria-hidden="true" />
        <div className="re-sw-slabs">{slabs}</div>
        <canvas className="re-sw-dots" aria-hidden="true" />
      </div>
      {children}
    </article>
  )
}

function Meta({ name, role, stack }: { name: string; role: ReactNode; stack?: boolean }) {
  return <p className="re-sw-meta" data-stack={stack || undefined}><span>{name}</span><span>{role}</span></p>
}

function Reach({ href }: { href: string }) {
  return (
    <a className="re-sw-proof" href={href} target="_blank" rel="noreferrer" data-numbers>
      100K+ Google Play downloads
      <small>Product reach · October 2026<span className="re-sr"> (opens in a new tab)</span></small>
    </a>
  )
}

// The storyboard's three scroll poses, mapped 1:1 to progress: 70° and 32% light, 30° and 70%, frontal and full.
const tiltAt = (p: number) => (p < 0.5 ? 70 - 80 * p : 30 - 60 * (p - 0.5))
const litAt = (p: number) => (p < 0.5 ? 0.32 + 0.76 * p : 0.7 + 0.6 * (p - 0.5))
const glowAt = (p: number) => (p < 0.5 ? 0.9 * p : 0.45 + 1.1 * (p - 0.5))
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const DOTS = 150

/** Scroll-driven arrival: tilt and light as CSS variables, and the dots on a small 2D canvas, only while a chapter is in view. */
function useArrival(root: React.RefObject<HTMLElement | null>, reduced: boolean) {
  useEffect(() => {
    const host = root.current
    if (!host) return
    const chapters = [...host.querySelectorAll<HTMLElement>('.re-sw')]
    // transform and opacity are written on the two moving layers themselves, not as variables on the chapter, which
    // would restyle every image and line of text in it on each scroll frame.
    const layers = (el: HTMLElement) => [el.querySelector<HTMLElement>('.re-sw-slabs')!, el.querySelector<HTMLElement>('.re-sw-floor')!] as const
    const rest = (el: HTMLElement) => {
      el.removeAttribute('data-tilting')
      for (const l of layers(el)) { l.style.removeProperty('transform'); l.style.removeProperty('opacity') }
    }
    if (reduced) { chapters.forEach(rest); return }

    let seed = 42
    const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296)
    const all = chapters.map((el) => ({
      el,
      stage: el.querySelector<HTMLElement>('.re-sw-stage')!,
      lead: el.querySelector<HTMLElement>('.re-sw-lead')!,
      canvas: el.querySelector<HTMLCanvasElement>('.re-sw-dots')!,
      layers: layers(el),
      // Each dot has a home on the bevel and a start 20–160 px outside it, most of them close in.
      dots: Array.from({ length: DOTS }, () => ({ t: rand(), d: 20 + 140 * rand() ** 1.6, r: 0.5 + rand() * 0.5 })),
      geo: { w: 0, h: 0, x: 0, y: 0, lw: 0, lh: 0, persp: 2200 },
      p: -1,
      still: false,
    }))
    const visible = new Set<(typeof all)[number]>()
    const dpr = Math.min(2, devicePixelRatio || 1)

    const measure = () => {
      for (const c of all) {
        const w = c.stage.clientWidth, h = c.stage.clientHeight
        c.geo = { w, h, x: c.lead.offsetLeft, y: c.lead.offsetTop, lw: c.lead.offsetWidth, lh: c.lead.offsetHeight, persp: (2200 * w) / 1440 }
        c.canvas.width = Math.round(w * dpr)
        c.canvas.height = Math.round(h * dpr)
        c.layers[0].style.transformOrigin = `50% ${c.geo.y + c.geo.lh}px`
        // A chapter already in the opening screen stays at rest: it was never scrolled in.
        c.still = c.lead.getBoundingClientRect().top + scrollY < innerHeight
        c.p = -1
      }
    }

    const draw = (c: (typeof all)[number], p: number) => {
      const ctx = c.canvas.getContext('2d')
      if (!ctx) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, c.geo.w, c.geo.h)
      if (p <= 0 || p >= 1) return
      const { x, y, lw, lh, persp, w } = c.geo
      const th = (tiltAt(p) * Math.PI) / 180, cos = Math.cos(th), sin = Math.sin(th)
      const ox = w / 2, oy = y + lh
      const a = clamp01(p / 0.5), near = 1 - (1 - a) ** 3
      ctx.fillStyle = `rgb(221 227 240 / ${p < 0.5 ? 0.3 + 0.55 * a : 0.85 * (1 - (p - 0.5) / 0.5)})`
      const per = 2 * (lw + lh)
      for (const d of c.dots) {
        // A point on the screen's outline, pushed out along that edge's normal, then put through the same perspective.
        let s = d.t * per, px: number, py: number, nx = 0, ny = 0
        if (s < lw) { px = x + s; py = y; ny = -1 }
        else if ((s -= lw) < lh) { px = x + lw; py = y + s; nx = 1 }
        else if ((s -= lh) < lw) { px = x + lw - s; py = y + lh; ny = 1 }
        else { s -= lw; px = x; py = y + lh - s; nx = -1 }
        const off = d.d * (1 - near)
        const X = px + nx * off - ox, Y = py + ny * off - oy
        const k = persp / (persp - Y * sin)
        ctx.beginPath()
        ctx.arc(ox + X * k, oy + Y * cos * k, d.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    let frame = 0
    const update = () => {
      frame = 0
      for (const c of visible) {
        // Driven by the main screen itself: it starts rising as its top enters and is frontal once that top reaches 35%.
        const p = c.still ? 1 : clamp01((innerHeight - c.lead.getBoundingClientRect().top) / (innerHeight * 0.65))
        if (p === c.p) continue
        c.p = p
        if (p >= 1) rest(c.el)
        else {
          c.el.setAttribute('data-tilting', '')
          c.layers[0].style.transform = `perspective(${c.geo.persp.toFixed(0)}px) rotateX(${tiltAt(p).toFixed(2)}deg)`
          c.layers[0].style.opacity = litAt(p).toFixed(3)
          c.layers[1].style.opacity = glowAt(p).toFixed(3)
        }
        draw(c, p)
      }
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const c = all.find((x) => x.el === e.target)
        if (c && e.isIntersecting) visible.add(c)
        else if (c) visible.delete(c)
      }
      schedule()
    })
    const onResize = () => { measure(); schedule() }
    measure()
    all.forEach((c) => io.observe(c.el))
    addEventListener('scroll', schedule, { passive: true })
    addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(frame)
      io.disconnect()
      removeEventListener('scroll', schedule)
      removeEventListener('resize', onResize)
      chapters.forEach(rest)
    }
  }, [root, reduced])
}

const shots = {
  stories: { src: '/showcase/bayyinah/web-04.webp', w: 2880, h: 1800, alt: 'Bayyinah TV Stories library with illustrated courses and topic filters' },
  courses: { src: '/showcase/bayyinah/web-02.webp', w: 2880, h: 1800, alt: 'Bayyinah TV course row with the live Ramadan 2026 course' },
  reader: { src: '/mobile/reading-3.webp', w: 780, h: 1689, alt: 'Read to Feed reader page, with its keep-reading prompt' },
  achievements: { src: '/mobile/reading-2.webp', w: 780, h: 1689, alt: 'Read to Feed achievements: eggs collected, badges and quizzes' },
  calendar: { src: '/showcase/care-dashboard/appointments-week.webp', w: 2880, h: 1800, alt: 'Care-team week calendar with appointments and filters' },
  matrix: { src: '/showcase/design-system/boards/xv/board-03.webp', w: 3200, h: 1740, alt: 'Real button variants and states, with the measured contrast of each label' },
  picker: { src: '/showcase/design-system/date-range-picker.webp', w: 1560, h: 976, alt: 'Date-range picker from the design system' },
  catalog: { src: '/mobile/grocery-2.webp', w: 780, h: 1689, alt: 'Viva Fresh catalog with product prices and cart controls' },
  cart: { src: '/mobile/grocery-3.webp', w: 780, h: 1689, alt: 'Viva Fresh cart with quantities and the checkout button' },
} satisfies Record<string, Shot>

export function Production({ onOpen, reduced }: { onOpen(slug: string, trigger: HTMLAnchorElement, keyboard: boolean): void; reduced: boolean }) {
  const root = useRef<HTMLElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const [reading, setReading] = useState(false)
  useArrival(root, reduced)

  const caseLink = (slug: string) => (
    <a className="re-prod-case" href={`${BASE}/${slug}`} onClick={(e) => { if (!plain(e)) return; e.preventDefault(); onOpen(slug, e.currentTarget, e.detail === 0) }}>
      Read the case
      <ArrowRightIcon size={20} weight="light" aria-hidden="true" />
    </a>
  )

  return (
    <section ref={root} className="re-prod re-solid" aria-labelledby="re-prod-h">
      <h2 id="re-prod-h" className="re-sr">Production work</h2>

      <Chapter
        id="bayyinah" nh={440} hs={50}
        table={floor(654, 820, [[570, 731, 515, 51], [1160, 724, 210, 45]])}
        slabs={<>
          <Slab shot={shots.stories} place={[70, 86, 1008]} phoneCrop={[120, 860, 1040, 940]} phone={[16, 11, 358]} nh={440} transform="rotate(-0.55deg)" eager />
          <Slab shot={shots.courses} kind="swap" crop={[1248, 1148, 960, 620]} place={[984, 461, 370]} phone={[20, 188, 350]} nh={440} transform="rotate(2deg)" z={4} eager />
        </>}
      >
        <div className="re-sw-at re-sw-copy re-sw-scrim" style={at(48, 742, 865)}>
          <Meta name="Bayyinah TV" role="Frontend · 2023–2026" />
          <h3>Rebuilt a live learning platform.</h3>
          <p className="re-sw-line">Live and on-demand video, subscriptions and English/Arabic support across web and mobile.</p>
        </div>
        <div className="re-sw-at re-sw-act" style={at(1040, 787, 310)}>
          <Reach href="https://play.google.com/store/apps/details?id=com.zombiesoup.bayyinah" />
          {caseLink('bayyinah-tv')}
        </div>
      </Chapter>

      <Chapter
        id="reading" nh={445} hs={46}
        table={floor(702, 865, [[1047, 805, 195, 46], [705, 809, 195, 46]])}
        slabs={<>
          <Slab shot={shots.reader} crop={[82, 462, 616, 1227]} phoneCrop={[82, 462, 616, 566]} place={[867, 70, 370]} phone={[58, 20, 312]} nh={445} />
          <Slab shot={shots.achievements} kind="companion" crop={[82, 620, 616, 1069]} phoneCrop={[82, 620, 616, 405]} place={[520, 166, 370]} phone={[20, 222, 312]} nh={445} z={4} />
        </>}
      >
        <p className="re-sw-at re-sw-cap" style={at(520, 838)}>Store listing images.</p>
        <div className="re-sw-at re-sw-copy" style={at(64, 196, 420)}>
          <Meta name="Read to Feed" role="Mobile, iOS and Android · 2021–25" stack />
          <h3>Kept a children's reading app shipping for four years.</h3>
          <p className="re-sw-line">EPUB and PDF reader, barcode scanning, quizzes, badges and streaks, in three languages.</p>
          <p className="re-sw-proof" data-numbers>About 14 store releases<small>React Native 0.63 → 0.81</small></p>
          <div className="re-sw-actions">
            {caseLink('read-to-feed')}
            <button type="button" className="re-sw-try" onClick={() => { setReading(true); dialog.current?.showModal() }}>Try the reader</button>
          </div>
        </div>
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
      </Chapter>

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
