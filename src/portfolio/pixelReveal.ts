/**
 * A screen that is still loading holds the page's own dot field (`[data-wait]` in the CSS: the 9 px grid, sparser
 * brighter stars, a slow twinkle). Once the file is in and in view it resolves in pixel steps: 28 px blocks, 10 px at
 * 90 ms, then the sharp picture crossfades in from 180 to 300 ms (ease-out). Under 300 ms and front-loaded, so it reads as
 * the picture arriving, not as an effect (Emil: UI motion under 300 ms; stagger 30-80 ms). A cached file shows at once,
 * and reduced motion gets a short fade only. Use it as the `ref` of an `<img>` whose parent clips it (position: relative,
 * overflow: hidden); the blocks are drawn over that parent's box, so they match however the picture is cropped.
 *
 * The blocks are cut from the file by the browser's image decoder (`createImageBitmap` on the cached bytes, cropped and
 * shrunk there), not by drawing the full picture into a canvas: drawing a 2880 px screen on the main thread cost 70-140
 * ms per screen on a throttled phone and stalled the scroll (measured 2026-11-04). Where that path is missing the picture
 * simply appears.
 */
import { dlog } from './sceneSupport'

const STEPS: [block: number, at: number][] = [[28, 0], [10, 90]]
const SHARP = 180 // the picture shows under the blocks, which fade out by 300 ms (see .re-pixel)
/** Once seen, a screen never waits longer than this for its blocks (a slow refetch, a busy decoder): it just appears. */
const LATEST = 1000

export function pixelReveal(img: HTMLImageElement | null) {
  const box = img?.parentElement
  if (!img || !box || (img.complete && img.naturalWidth)) return
  box.dataset.wait = ''
  const timers: number[] = []
  let canvas: HTMLCanvasElement | undefined
  let io: IntersectionObserver | undefined
  let gone = false, seenAt = 0, done = false
  const name = (img.currentSrc || img.src).split('/').pop()
  const settle = () => {
    delete box.dataset.wait
    canvas?.remove()
    if (seenAt && !done) dlog('reveal settle', `${name} ${Math.round(performance.now() - seenAt)}ms`)
    done = true
  }

  const play = async () => {
    seenAt = performance.now()
    dlog('reveal start', name)
    // Visible content settles on a timer, never only on the animation finishing.
    timers.push(window.setTimeout(settle, LATEST))
    const b = box.getBoundingClientRect(), r = img.getBoundingClientRect()
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !b.width || !r.width || typeof createImageBitmap !== 'function') return settle()
    // The part of the file the box shows, in the file's own pixels.
    const k = img.naturalWidth / r.width
    const sx = Math.max(0, (b.left - r.left) * k), sy = Math.max(0, (b.top - r.top) * k)
    const sw = Math.min(b.width * k, img.naturalWidth - sx), sh = Math.min(b.height * k, img.naturalHeight - sy)
    let steps: ImageBitmap[]
    try {
      const file = await (await fetch(img.currentSrc || img.src, { cache: 'force-cache' })).blob()
      steps = await Promise.all(STEPS.map(([block]) => createImageBitmap(file, sx, sy, sw, sh, {
        resizeWidth: Math.max(1, Math.ceil(b.width / block)), resizeHeight: Math.max(1, Math.ceil(b.height / block)), resizeQuality: 'medium',
      })))
    } catch { return settle() }
    if (gone || done) return steps.forEach((s) => s.close())
    canvas = document.createElement('canvas')
    canvas.className = 're-pixel'
    canvas.width = Math.round(b.width)
    canvas.height = Math.round(b.height)
    const ctx = canvas.getContext('2d')
    if (!ctx) return settle()
    ctx.imageSmoothingEnabled = false
    const draw = (s: ImageBitmap) => ctx.drawImage(s, 0, 0, canvas!.width, canvas!.height)
    draw(steps[0])
    box.append(canvas)
    delete box.dataset.wait
    // Screens side by side resolve left to right, up to 60 ms apart, instead of all in one beat.
    const lag = Math.round(Math.min(Math.max(b.left / innerWidth, 0), 1) * 60)
    STEPS.slice(1).forEach(([, at], i) => timers.push(window.setTimeout(() => draw(steps[i + 1]), at + lag)))
    timers.push(window.setTimeout(() => { canvas!.dataset.out = '' }, SHARP + lag))
    timers.push(window.setTimeout(() => { settle(); steps.forEach((s) => s.close()) }, SHARP + lag + 140))
  }

  // Decoded off-screen (lazy loading starts early), the picture waits in its dot field until it is actually seen.
  const loaded = () => img.decode().catch(() => {}).then(() => {
    if (!img.isConnected || gone) return
    if (far) { done = true; return }
    io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io?.disconnect(); play() } }, { threshold: 0.12 })
    // A slab's reflection is clipped to a strip that never reaches the threshold: it watches its slab, so both resolve
    // together. A screen in a sideways row watches its row: the screen peeking in at the edge (under the threshold) and
    // the one past it resolve with the row, so a sideways scroll finds them sharp, not still waiting.
    io.observe(box.closest('.re-sw-slab, .re-cs-loop') ?? box)
  })
  const failed = () => settle()
  img.addEventListener('load', loaded, { once: true })
  img.addEventListener('error', failed, { once: true })
  // A sideways row: the screens it shows and the one just past its edge load once the row nears the view, so a swipe
  // always finds a sharp screen; each swipe moves the edge and fetches the next. A screen farther out is an ordinary lazy
  // picture (no dot field, no reveal) until the edge reaches it: nobody sees it without swiping, so nobody downloads it.
  const row = box.closest('.re-cs-loop')
  let near: IntersectionObserver | undefined, stopRow = () => {}
  let far = false, inReach = false, nearView = false
  if (row && img.loading === 'lazy') {
    const index = [...row.children].indexOf(box.closest('li') as Element)
    const fetchIt = () => { if (inReach && nearView) img.loading = 'eager' }
    stopRow = watchRow(row, (reach) => {
      if (index <= reach) { inReach = true; fetchIt() }
      else if (!inReach && !far && !done) { far = true; delete box.dataset.wait }
    })
    near = new IntersectionObserver(([e]) => { if (e.isIntersecting) { near?.disconnect(); nearView = true; fetchIt() } }, { rootMargin: '200px 0px' })
    near.observe(row)
  }
  return () => {
    gone = true
    near?.disconnect()
    stopRow()
    img.removeEventListener('load', loaded)
    img.removeEventListener('error', failed)
    io?.disconnect()
    timers.forEach(clearTimeout)
    settle()
  }
}

/**
 * One observer per sideways row, rooted on the row itself: which of its screens show (any part, sideways scroll
 * included). Each screen hears the reach, the index one past the last screen showing, whenever that changes.
 */
type Row = { seen: Set<Element>; subs: Set<(reach: number) => void>; io?: IntersectionObserver; reach: number }
const rows = new WeakMap<Element, Row>()
function watchRow(row: Element, sub: (reach: number) => void) {
  let r = rows.get(row)
  if (!r) {
    const state: Row = { seen: new Set(), subs: new Set(), reach: -1 }
    state.io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) state.seen.add(e.target); else state.seen.delete(e.target)
      const kids = [...row.children]
      state.reach = Math.max(-1, ...[...state.seen].map((li) => kids.indexOf(li))) + 1
      state.subs.forEach((f) => f(state.reach))
    }, { root: row })
    for (const li of row.children) state.io.observe(li)
    r = state
    rows.set(row, r)
  }
  const s = r
  s.subs.add(sub)
  if (s.reach >= 0) sub(s.reach)
  return () => { s.subs.delete(sub); if (!s.subs.size) { s.io?.disconnect(); rows.delete(row) } }
}
