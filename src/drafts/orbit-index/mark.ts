type Rgb = [number, number, number]

const DOTS = 25
const DIM: Rgb = [112, 112, 106]
const TILT = 0.42
const RING = 0.085
const SLOPE = (33 * Math.PI) / 180

const hex = (value: string): Rgb => {
  const n = parseInt(value.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function createMark(canvas: HTMLCanvasElement, reduced: () => boolean) {
  const ctx = canvas.getContext('2d')
  const cur = { x: 0.7, y: 0.7, c: hex('#a3b0ff') }
  const tgt = { x: 0.7, y: 0.7, c: hex('#a3b0ff') }
  let frame = 0
  let last = 0

  const fit = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const side = Math.round(canvas.clientWidth * dpr)
    if (side && canvas.width !== side) canvas.width = canvas.height = side
  }

  const draw = () => {
    if (!ctx) return
    const S = canvas.width
    const step = S / DOTS
    const R = S / 2 - step * 0.35
    ctx.clearRect(0, 0, S, S)
    const len = Math.hypot(cur.x, cur.y) || 1
    const dx = cur.x / len
    const dy = cur.y / len
    const lx = dx * 0.74
    const ly = dy * 0.74
    const lz = 0.67
    const a = [-Math.sin(SLOPE), Math.cos(SLOPE), 0]
    const kx = -dy
    const ky = dx
    const cos = Math.cos(TILT)
    const sin = Math.sin(TILT)
    const kv = kx * a[0] + ky * a[1]
    const ax = a[0] * cos + ky * a[2] * sin + kx * kv * (1 - cos)
    const ay = a[1] * cos - kx * a[2] * sin + ky * kv * (1 - cos)
    const az = a[2] * cos + (kx * a[1] - ky * a[0]) * sin
    for (let j = 0; j < DOTS; j++) {
      for (let i = 0; i < DOTS; i++) {
        const px = (i + 0.5) * step
        const py = (j + 0.5) * step
        const nx = (px - S / 2) / R
        const ny = (py - S / 2) / R
        const rr = nx * nx + ny * ny
        if (rr > 1) continue
        const nz = Math.sqrt(1 - rr)
        if (Math.abs(nx * ax + ny * ay + nz * az) < RING) continue
        const shade = Math.max(0, nx * lx + ny * ly + nz * lz)
        const t = Math.pow(shade, 1.6)
        const radius = step * 0.48 * (0.3 + 0.7 * shade)
        const c = cur.c
        ctx.fillStyle = `rgb(${DIM[0] + (c[0] - DIM[0]) * t | 0},${DIM[1] + (c[1] - DIM[1]) * t | 0},${DIM[2] + (c[2] - DIM[2]) * t | 0})`
        ctx.beginPath()
        ctx.arc(px, py, radius, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  const tick = (now: number) => {
    const dt = Math.min(64, now - (last || now))
    last = now
    const k = 1 - Math.exp(-dt / 70)
    cur.x += (tgt.x - cur.x) * k
    cur.y += (tgt.y - cur.y) * k
    let moving = Math.abs(tgt.x - cur.x) + Math.abs(tgt.y - cur.y) > 0.002
    for (let n = 0; n < 3; n++) {
      cur.c[n] += (tgt.c[n] - cur.c[n]) * k
      if (Math.abs(tgt.c[n] - cur.c[n]) > 0.6) moving = true
    }
    if (!moving) {
      cur.x = tgt.x
      cur.y = tgt.y
      cur.c = [...tgt.c]
    }
    draw()
    frame = moving ? requestAnimationFrame(tick) : 0
  }

  const onResize = () => {
    fit()
    draw()
  }
  window.addEventListener('resize', onResize)
  fit()
  draw()

  return {
    set(x: number, y: number, accent: string, instant = false) {
      tgt.x = x
      tgt.y = y
      tgt.c = hex(accent)
      if (instant || reduced()) {
        cancelAnimationFrame(frame)
        frame = 0
        cur.x = x
        cur.y = y
        cur.c = [...tgt.c]
        draw()
        return
      }
      if (!frame) {
        last = 0
        frame = requestAnimationFrame(tick)
      }
    },
    destroy() {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
    },
  }
}
