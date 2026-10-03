import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { ChannelKey } from '../../content/channels'
import { cn } from '../../lib/cn'
import type { Rgb, SignalScene, Tints } from './scene'
import { SignalStackCss } from './SignalStackCss'
import { waveIndex } from './waves'

export interface SignalStackProps {
  channels: ChannelKey[]
  active: ChannelKey
  className?: string
}

type Mode = 'css' | 'webgl'

const REDUCED = '(prefers-reduced-motion: reduce)'
function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia(REDUCED)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
const getReduced = () => window.matchMedia(REDUCED).matches
const getReducedServer = () => true

// The host is display:none below md, so the scene must not load there.
const WIDE = '(min-width: 768px)'
function subscribeWide(cb: () => void) {
  const mq = window.matchMedia(WIDE)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
const getWide = () => window.matchMedia(WIDE).matches
const getWideServer = () => false

interface NetworkInformation {
  saveData?: boolean
}

function lightweightDevice(): boolean {
  const nav = navigator as Navigator & {
    connection?: NetworkInformation
    deviceMemory?: number
  }
  if (nav.connection?.saveData) return true
  return typeof nav.deviceMemory === 'number' && nav.deviceMemory < 4
}

function whenIdle(cb: () => void): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(cb, { timeout: 2000 })
    return () => window.cancelIdleCallback(id)
  }
  const id = window.setTimeout(cb, 1000)
  return () => window.clearTimeout(id)
}

let swatch: CanvasRenderingContext2D | null = null
function toRgb(color: string): Rgb {
  swatch ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  if (!swatch) return [0.5, 0.5, 0.5]
  swatch.clearRect(0, 0, 1, 1)
  swatch.fillStyle = '#808080'
  swatch.fillStyle = color
  swatch.fillRect(0, 0, 1, 1)
  const [r, g, b] = swatch.getImageData(0, 0, 1, 1).data
  return [r / 255, g / 255, b / 255]
}

function readTints(probe: HTMLElement, channels: ChannelKey[]): Tints {
  const read = (token: string) => {
    probe.style.color = `var(${token})`
    return toRgb(getComputedStyle(probe).color)
  }
  return {
    panes: channels.map((key) => read(`--ch-${key}`)),
    signal: read('--signal'),
    panel: read('--panel-2'),
    line: read('--hairline-strong'),
  }
}

/**
 * Six channel panes on a shallow arc. The active channel's pane steps forward and tunes in.
 * WebGL (OGL, lazy chunk) when the device can afford it; the CSS stack otherwise and as the first paint.
 */
export function SignalStack({ channels, active, className }: SignalStackProps) {
  const reduced = useSyncExternalStore(subscribeReduced, getReduced, getReducedServer)
  const wide = useSyncExternalStore(subscribeWide, getWide, getWideServer)
  const [mode, setMode] = useState<Mode>('css')
  const [cssGone, setCssGone] = useState(false)
  const host = useRef<HTMLDivElement>(null)
  const probe = useRef<HTMLSpanElement>(null)
  const scene = useRef<SignalScene | null>(null)
  const activeIndex = Math.max(0, channels.indexOf(active))
  const activeRef = useRef(activeIndex)
  const channelKey = channels.join(',')

  useEffect(() => {
    const el = host.current
    const pr = probe.current
    if (!el || !pr || reduced || !wide || lightweightDevice()) return
    const list = channelKey.split(',') as ChannelKey[]

    const canvas = document.createElement('canvas')
    canvas.className = 'absolute inset-0 size-full opacity-0 transition-opacity duration-[400ms] ease-out'
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
      depth: false,
      failIfMajorPerformanceCaveat: true,
      powerPreference: 'low-power',
    })
    if (!gl) return

    let cancelled = false
    let fade = 0
    el.appendChild(canvas)

    const syncTints = () => scene.current?.setTints(readTints(pr, list))
    const themeObserver = new MutationObserver(syncTints)
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    const scheme = window.matchMedia('(prefers-color-scheme: dark)')
    scheme.addEventListener('change', syncTints)

    const cancelIdle = whenIdle(() => {
      import('./scene')
        .then(({ createScene }) => {
          if (cancelled) return
          scene.current = createScene(gl, {
            host: el,
            tints: readTints(pr, list),
            active: activeRef.current,
            waves: list.map((key) => waveIndex[key]),
            onFirstFrame: () => {
              canvas.classList.replace('opacity-0', 'opacity-100')
              setMode('webgl')
              fade = window.setTimeout(() => setCssGone(true), 450)
            },
            onDegrade: () => {
              scene.current?.dispose()
              scene.current = null
              canvas.remove()
              setCssGone(false)
              setMode('css')
            },
          })
        })
        .catch(() => {
          if (!cancelled) setMode('css')
        })
    })

    return () => {
      cancelled = true
      cancelIdle()
      window.clearTimeout(fade)
      themeObserver.disconnect()
      scheme.removeEventListener('change', syncTints)
      scene.current?.dispose()
      scene.current = null
      canvas.remove()
      setCssGone(false)
      setMode('css')
    }
  }, [reduced, wide, channelKey])

  useEffect(() => {
    activeRef.current = activeIndex
    scene.current?.setActive(activeIndex)
  }, [activeIndex])

  return (
    <div ref={host} aria-hidden data-mode={mode} className={cn('relative', className)}>
      <span ref={probe} hidden />
      {!cssGone && (
        <SignalStackCss
          channels={channels}
          active={active}
          className={cn(
            'absolute inset-0 transition-opacity duration-[400ms] ease-out',
            mode === 'webgl' && 'opacity-0',
          )}
        />
      )}
    </div>
  )
}
