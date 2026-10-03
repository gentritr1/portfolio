import { recreations } from '../lib/recreations'
import type { RecreationKey } from '../content/projects'
import { StrictMode, Suspense, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../styles/globals.css'
import { channelOrder, channels } from '../content/channels'
import { SignalStack, type SignalStackHandle } from '../components/signal-stack/SignalStack'
import { SignalStackCss } from '../components/signal-stack/SignalStackCss'
import { cn } from '../lib/cn'

const sizes = [
  { w: 440, h: 260 },
  { w: 380, h: 220 },
]

function useFrameRate() {
  const [stats, setStats] = useState({ fps: 0, ms: 0 })
  useEffect(() => {
    let raf = 0
    let frames = 0
    let start = performance.now()
    let last = start
    let worst = 0
    const tick = (now: number) => {
      frames++
      worst = Math.max(worst, now - last)
      last = now
      if (now - start >= 1000) {
        setStats({
          fps: Math.round((frames * 1000) / (now - start)),
          ms: Math.round(worst * 10) / 10,
        })
        frames = 0
        worst = 0
        start = now
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  return stats
}

function DollyPreview({ active }: { active: typeof channelOrder[number] }) {
  const stack = useRef<SignalStackHandle>(null)
  const wrapper = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)
  const [contextLost, setContextLost] = useState(false)
  return <div ref={wrapper} className="relative size-full">
    <SignalStack ref={stack} channels={channelOrder} active={active} className="size-full" />
    <div className="absolute right-0 bottom-0 left-0 flex flex-wrap justify-end gap-2">
      <button type="button" disabled={contextLost} className="min-h-11 border border-hairline bg-panel-0 px-3 label disabled:text-ink-3" onClick={() => {
        const gl = wrapper.current?.querySelector('canvas')?.getContext('webgl2')
        const extension = gl?.getExtension('WEBGL_lose_context')
        if (!extension) return
        extension.loseContext()
        setContextLost(true)
      }}>{contextLost ? 'Context lost' : 'Lose WebGL context'}</button>
      <button type="button" disabled={busy || contextLost} className="min-h-11 border border-hairline bg-panel-0 px-3 label disabled:text-ink-3" onClick={async () => {
        setBusy(true)
        await stack.current?.tuneIn()
        stack.current?.reset()
        setBusy(false)
      }}>Test tune in</button>
    </div>
  </div>
}

function Lab() {
  const [index, setIndex] = useState(0)
  const [single, setSingle] = useState(false)
  const [lostSignal, setLostSignal] = useState(false)
  const [forceGlass, setForceGlass] = useState(false)
  const [forceCss, setForceCss] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const { fps, ms } = useFrameRate()
  const active = channelOrder[index]

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const Stack = forceCss ? SignalStackCss : DollyPreview

  return (
    <main data-lab-glass={forceGlass ? "force" : "auto"} className="min-h-dvh bg-panel-0 p-6 text-ink">
      <div className="mb-6 flex flex-wrap items-center gap-2 label">
        {channelOrder.map((key, i) => (
          <button
            key={key}
            type="button"
            data-channel={key}
            data-lab-channel={i}
            aria-pressed={i === index}
            onClick={() => setIndex(i)}
            className={cn('min-h-11 border px-3', i === index ? 'border-signal text-ink' : 'border-hairline text-tint')}
          >
            {channels[key].number} {channels[key].label}
          </button>
        ))}
        <button type="button" aria-pressed={single} onClick={() => setSingle(!single)} className="min-h-11 border border-hairline px-3">Single pane</button>
        <button type="button" aria-pressed={lostSignal} onClick={() => setLostSignal(!lostSignal)} className="min-h-11 border border-hairline px-3">Lose signal</button>
        <button type="button" aria-pressed={forceGlass} onClick={() => setForceGlass(!forceGlass)} className="min-h-11 border border-hairline px-3">Test glass tier</button>
        <label className="ml-4 flex min-h-11 items-center gap-2 border border-hairline px-3">
          <input
            type="checkbox"
            data-lab="force-css"
            checked={forceCss}
            onChange={(e) => setForceCss(e.target.checked)}
          />
          Force CSS
        </label>
        <button
          type="button"
          data-lab="theme"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="min-h-11 border border-hairline px-3"
        >
          Page theme: {theme}
        </button>
        <output data-lab="fps" className="ml-4 tabular-nums text-ink-2">
          {fps} fps · worst {ms} ms
        </output>
      </div>
      <div className="flex flex-wrap gap-6">
        {(['dark', 'light'] as const).map((scheme) => (
          <section
            key={scheme}
            data-lab-panel={scheme}
            style={{ colorScheme: scheme }}
            className="flex min-w-0 max-w-full flex-col gap-6 border border-hairline bg-panel-0 p-6"
          >
            <p className="label text-ink-3">{scheme === 'dark' ? 'Dark' : 'Daylight'} panel</p>
            {sizes.map(({ w, h }) => (
              <div key={w} className="flex flex-col gap-2">
                <span className="label text-ink-3">
                  {w} × {h}
                </span>
                <div
                  data-lab-box={`${scheme}-${w}`}
                  style={{ width: w, height: h, maxWidth: '100%' }}
                  className="outline outline-1 outline-dashed outline-hairline"
                >
                  {lostSignal || single ? (forceCss ? <SignalStackCss channels={single ? [active] : channelOrder} active={active} still lostSignal={lostSignal} className="size-full" /> : <SignalStack channels={single ? [active] : channelOrder} active={active} still lostSignal={lostSignal} className="size-full" />) : <Stack key={String(forceGlass)} channels={channelOrder} active={active} className="size-full" />}
                </div>
              </div>
            ))}
          </section>
        ))}
      </div>
    </main>
  )
}

function Review() {
  const [width, setWidth] = useState(375)
  const [theme, setTheme] = useState('dark')
  const [motion, setMotion] = useState('full')
  const [path, setPath] = useState('/')
  const frame = useRef<HTMLIFrameElement>(null)
  const [gestureResult, setGestureResult] = useState('')
  function testSwipe() {
    const doc = frame.current?.contentDocument
    const target = doc?.querySelector('#monitor-panel figure [data-world]')
    if (!target || !doc) return
    const before = doc.querySelector('[role="tab"][aria-selected="true"]')?.id
    target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', isPrimary: true, clientX: 240, clientY: 400 }))
    target.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'touch', isPrimary: true, clientX: 100, clientY: 403 }))
    const clicked = target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }))
    requestAnimationFrame(() => {
      const after = doc.querySelector('[role="tab"][aria-selected="true"]')?.id
      setGestureResult(`${before} → ${after}; synthetic click ${clicked ? 'not blocked' : 'blocked'}`)
    })
  }
  return <main className="p-4 text-ink">
    <div className="mb-4 flex flex-wrap gap-2">
      {[375, 820, 1440].map(size => <button type="button" key={size} onClick={() => setWidth(size)} className="min-h-11 border border-hairline px-3">{size} px</button>)}
      <button type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="min-h-11 border border-hairline px-3">Theme: {theme}</button>
      <button type="button" onClick={() => setMotion(motion === 'full' ? 'reduce' : 'full')} className="min-h-11 border border-hairline px-3">Motion: {motion}</button>
      <select aria-label="Review page" value={path} onChange={e => setPath(e.target.value)} className="min-h-11 border border-hairline bg-panel-1 px-3"><option value="/">Home</option><option value="/work/bayyinah-tv">Bayyinah TV</option><option value="/work/read-to-feed">Read to Feed</option><option value="/work/care-platform">Care platform</option><option value="/work/incentiv">Incentiv</option><option value="/work/viva-fresh">Viva Fresh</option><option value="/missing-channel">No signal</option><option value="/drafts">Draft picker</option><optgroup label="Live drafts">{['hybrid', 'studio', 'desktop', 'canvas', 'index', 'blueprint', 'savefile', 'zine', 'issue', 'wall', 'riso', 'dither', 'swiss', 'orbit', 'primetime', 'desk'].map(id => <option key={id} value={`/drafts/${id}`}>{id}</option>)}</optgroup></select>
      <button type="button" onClick={() => setPath(path === '/' ? '/work/bayyinah-tv' : '/')} className="min-h-11 border border-hairline px-3">Page: {path === '/' ? 'Home' : 'Project'}</button>
    </div>
    {path === '/' && width === 375 && <button type="button" onClick={testSwipe} className="mb-4 min-h-11 border border-hairline px-3">Test touch swipe</button>}
    <output className="mb-2 block label">{gestureResult}</output>
    <iframe ref={frame} key={`${width}-${theme}-${motion}-${path}`} title="Portfolio review" src={`${path}?review=1&theme=${theme}&motion=${motion}`} style={{ width: width + 0.5, height: 812.5 }} className="outline outline-hairline" />
  </main>
}

function Poster() {
  if (new URLSearchParams(location.search).has('review')) return <Review />
  const key = new URLSearchParams(location.search).get('poster') as RecreationKey
  const entry = recreations[key]
  if (!entry) return <Lab />
  const Recreation = entry.Component
  return <main data-world={entry.world} className="@container relative h-[500px] w-[800px] overflow-hidden bg-surface" data-poster>
    <div className={key === 'reader' ? '@container absolute inset-y-0 left-[150px] w-[500px]' : '@container absolute inset-0'}><Suspense fallback={<span>Loading recreation</span>}><Recreation /></Suspense></div>
  </main>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Poster />
  </StrictMode>,
)
