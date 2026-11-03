/**
 * A screen that is still loading holds the page's own dot field (`[data-wait]` in the CSS: the 9 px grid, sparser
 * brighter stars, a slow twinkle). Once the file is decoded and in view it resolves in pixel steps, 28 px blocks, then
 * 10 px at 120 ms, sharp by 320 ms, front-loaded so the picture is readable almost at once. A cached file shows at once,
 * and reduced motion gets a short fade only. Use it as the `ref` of an `<img>` whose parent clips it (position: relative,
 * overflow: hidden); the blocks are drawn over that parent's box, so they match however the picture is cropped.
 */
const STEPS: [block: number, at: number][] = [[28, 0], [10, 120]]
const SHARP = 240 // the picture shows under the blocks, which fade out by 320 ms

export function pixelReveal(img: HTMLImageElement | null) {
  const box = img?.parentElement
  if (!img || !box || (img.complete && img.naturalWidth)) return
  box.dataset.wait = ''
  const timers: number[] = []
  let canvas: HTMLCanvasElement | undefined
  let io: IntersectionObserver | undefined
  const settle = () => { delete box.dataset.wait; canvas?.remove() }

  const play = () => {
    const b = box.getBoundingClientRect(), r = img.getBoundingClientRect()
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !b.width || !r.width) return settle()
    // The part of the file the box shows, in the file's own pixels.
    const k = img.naturalWidth / r.width
    const src = [(b.left - r.left) * k, (b.top - r.top) * k, b.width * k, b.height * k] as const
    canvas = document.createElement('canvas')
    canvas.className = 're-pixel'
    canvas.width = Math.round(b.width)
    canvas.height = Math.round(b.height)
    const ctx = canvas.getContext('2d')
    const small = document.createElement('canvas').getContext('2d')
    if (!ctx || !small) return settle()
    const draw = (block: number) => {
      const w = Math.max(1, Math.ceil(b.width / block)), h = Math.max(1, Math.ceil(b.height / block))
      small.canvas.width = w
      small.canvas.height = h
      small.drawImage(img, ...src, 0, 0, w, h)
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(small.canvas, 0, 0, w, h, 0, 0, canvas!.width, canvas!.height)
    }
    draw(STEPS[0][0])
    box.append(canvas)
    delete box.dataset.wait
    for (const [block, at] of STEPS.slice(1)) timers.push(window.setTimeout(() => draw(block), at))
    timers.push(window.setTimeout(() => { canvas!.dataset.out = '' }, SHARP))
    timers.push(window.setTimeout(settle, SHARP + 100))
  }

  // Decoded off-screen (lazy loading starts early), the picture waits in its dot field until it is actually seen.
  const loaded = () => img.decode().catch(() => {}).then(() => {
    if (!img.isConnected) return
    io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io?.disconnect(); play() } }, { threshold: 0.12 })
    // A slab's reflection is clipped to a strip that never reaches the threshold: it watches its slab, so both resolve together.
    io.observe(box.closest('.re-sw-slab') ?? box)
  })
  const failed = () => settle()
  img.addEventListener('load', loaded, { once: true })
  img.addEventListener('error', failed, { once: true })
  return () => {
    img.removeEventListener('load', loaded)
    img.removeEventListener('error', failed)
    io?.disconnect()
    timers.forEach(clearTimeout)
    settle()
  }
}
