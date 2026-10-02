import type { ChannelKey } from '../../content/channels'

/** Waveform index per channel. The fragment shader and the CSS stack draw the same six shapes. */
export const waveIndex: Record<ChannelKey, number> = {
  healthcare: 0,
  streaming: 1,
  reading: 2,
  web3: 3,
  ai: 4,
  personal: 5,
}

const TAU = Math.PI * 2
const g = (x: number, c: number, w: number) => Math.exp(-(((x - c) / w) ** 2))
const fract = (x: number) => x - Math.floor(x)
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

export function wave(kind: number, s: number): number {
  switch (kind) {
    case 0: {
      const u = fract(s * 0.5)
      return 0.95 * g(u, 0.46, 0.018) - 0.42 * g(u, 0.51, 0.02) - 0.18 * g(u, 0.41, 0.025) + 0.2 * g(u, 0.7, 0.05)
    }
    case 1:
      return Math.sin(TAU * s) * 0.8
    case 2: {
      const q = Math.sin(TAU * s * 0.75) * 1.5
      return (Math.floor(q) + smooth(0.4, 0.6, fract(q))) / 2.2
    }
    case 3:
      return Math.min(1, Math.max(-1, Math.sin(TAU * s * 0.75) * 7)) * 0.7
    case 4:
      return 0.5 * Math.sin(TAU * s) + 0.38 * Math.sin(TAU * s * 2.7 + 1.3) * Math.cos(TAU * s * 0.35)
    default:
      return (1 - 4 * Math.abs(fract(s * 0.8 + 0.25) - 0.5)) * 0.75
  }
}

/** Polyline points for a trace in a 136 × 30 box (scene units × 100), baseline at y = 15. */
export function tracePoints(kind: number, phase: number, amp = 12): string {
  const n = 240
  const out: string[] = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const env = smooth(0, 0.1, t) * (1 - smooth(0.9, 1, t))
    const y = 15 - wave(kind, t * 2.4 - phase) * env * amp
    out.push(`${(t * 136).toFixed(1)},${y.toFixed(2)}`)
  }
  return out.join(' ')
}
