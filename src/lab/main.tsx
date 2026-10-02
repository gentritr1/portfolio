import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../styles/globals.css'
import { channelOrder, channels } from '../content/channels'
import { SignalStack } from '../components/signal-stack/SignalStack'
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

function Lab() {
  const [index, setIndex] = useState(0)
  const [forceCss, setForceCss] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const { fps, ms } = useFrameRate()
  const active = channelOrder[index]

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const Stack = forceCss ? SignalStackCss : SignalStack

  return (
    <main className="min-h-dvh bg-panel-0 p-6 text-ink">
      <div className="mb-6 flex flex-wrap items-center gap-2 label">
        {channelOrder.map((key, i) => (
          <button
            key={key}
            type="button"
            data-channel={key}
            data-lab-channel={i}
            aria-pressed={i === index}
            onClick={() => setIndex(i)}
            className={cn('min-h-9 border px-3', i === index ? 'border-signal text-ink' : 'border-hairline text-tint')}
          >
            {channels[key].number} {channels[key].label}
          </button>
        ))}
        <label className="ml-4 flex min-h-9 items-center gap-2 border border-hairline px-3">
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
          className="min-h-9 border border-hairline px-3"
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
            className="flex flex-col gap-6 border border-hairline bg-panel-0 p-6"
          >
            <p className="label text-ink-3">{scheme === 'dark' ? 'Dark' : 'Daylight'} panel</p>
            {sizes.map(({ w, h }) => (
              <div key={w} className="flex flex-col gap-2">
                <span className="label text-ink-3">
                  {w} × {h}
                </span>
                <div
                  data-lab-box={`${scheme}-${w}`}
                  style={{ width: w, height: h }}
                  className="outline outline-1 outline-dashed outline-hairline"
                >
                  <Stack channels={channelOrder} active={active} className="size-full" />
                </div>
              </div>
            ))}
          </section>
        ))}
      </div>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Lab />
  </StrictMode>,
)
