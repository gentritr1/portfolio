import { ArrowClockwiseIcon, ArrowRightIcon, PauseIcon, PlayIcon } from '@phosphor-icons/react'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { Featured, Project } from '../../content/projects'
import { cn } from '../../lib/cn'
import { recreations } from '../../lib/recreations'
import { Container } from '../Container'
import { Monitor } from '../Monitor'

const GuidedRecreation = lazy(() => import('./GuidedRecreation'))
const stepDuration = 4000
const sequenceDuration = stepDuration * 4

const steps = {
  care: ['Inspect the 14-day trend', 'Convert pressure units', 'Switch the organization', 'Read the other dataset'],
  'live-room': ['Join the live room', 'Choose 1080p playback', 'Open the premium paywall', 'Return to the live stream'],
  reader: ['Open the reader', 'Increase the text size', 'Turn the page', 'Find a book by its barcode'],
  wallet: ['Check the wallet balance', 'Receive with a QR address', 'Verify with a passkey', 'Complete sign-in'],
  gallery: ['Browse product categories', 'Explore fresh products', 'Review the shopping cart', 'See the Android cart'],
}

export function WatchItWork({ project, featured }: { project: Project; featured: Featured }) {
  const rootRef = useRef<HTMLElement>(null)
  const [onScreen, setOnScreen] = useState(false)
  const [tabVisible, setTabVisible] = useState(() => !document.hidden)
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [started, setStarted] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const running = playing && onScreen && tabVisible && !reduced
  const step = Math.floor(elapsed / stepDuration)
  const labels = steps[featured.monitor]
  const recreation = featured.monitor === 'gallery' ? undefined : recreations[featured.monitor]
  const gallery = project.media.galleries?.[0]
  const galleryFrame = gallery?.items[[0, 1, 2, 4][step]] ?? gallery?.items[0]
  const poster = featured.monitor === 'gallery' ? gallery?.items[0].src : `/signal-posters/${project.channel}.avif`

  useEffect(() => {
    const node = rootRef.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting && entry.intersectionRatio >= 0.2), { threshold: 0.2 })
    observer.observe(node)
    const visibilityChanged = () => setTabVisible(!document.hidden)
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const preferenceChanged = () => {
      setReduced(preference.matches)
      if (preference.matches) setPlaying(false)
    }
    document.addEventListener('visibilitychange', visibilityChanged)
    preference.addEventListener('change', preferenceChanged)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', visibilityChanged)
      preference.removeEventListener('change', preferenceChanged)
    }
  }, [])

  useEffect(() => {
    if (!running) return
    let previous = performance.now()
    const interval = window.setInterval(() => {
      const now = performance.now()
      const delta = now - previous
      previous = now
      setElapsed((value) => (value + delta) % sequenceDuration)
    }, 250)
    return () => window.clearInterval(interval)
  }, [running])

  function playOrPause() {
    setStarted(true)
    if (reduced) {
      if (started) setElapsed(((step + 1) % labels.length) * stepDuration)
      return
    }
    setPlaying((value) => !value)
  }

  function replay() {
    setElapsed(0)
    setStarted(true)
    setPlaying(!reduced)
  }

  return (
    <section ref={rootRef} aria-labelledby="watch-title" className="pt-section" data-demo-step={step} data-demo-running={running}>
      <Container>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="watch-title" className="text-h2 text-ink">Watch it work</h2>
            <p className="mt-2 text-ink-2">
              {featured.monitor === 'gallery' ? 'A tour of the public store frames.' : 'A guided recreation with invented data.'}
              {reduced ? ' Advance one step at a time.' : ' A 16-second loop.'}
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={playOrPause} className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-signal px-4 label text-on-signal">
              {reduced && started ? <ArrowRightIcon size={16} aria-hidden /> : playing ? <PauseIcon size={16} aria-hidden /> : <PlayIcon size={16} aria-hidden />}
              {reduced ? started ? 'Next step' : 'Explore steps' : playing ? 'Pause' : started ? 'Resume' : 'Play sequence'}
            </button>
            <button type="button" onClick={replay} disabled={!started} className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-hairline-strong px-3 label text-ink transition-colors hover:bg-panel-2 disabled:cursor-default disabled:opacity-40">
              <ArrowClockwiseIcon size={16} aria-hidden />
              Replay
            </button>
          </div>
        </div>

        <Monitor
          channel={project.channel}
          label={recreation?.name ?? 'Store frames'}
          world={recreation?.world}
          live={running}
          aspect={recreation?.aspect ?? { base: '3 / 4', sm: '4 / 3', lg: '16 / 10' }}
          maxWidth={recreation?.maxWidth ?? '960px'}
        >
          <div inert aria-hidden className={cn('absolute inset-0', !running && '[&_*]:[animation-play-state:paused]')}>
            <img src={poster} alt="" width={featured.monitor === 'gallery' ? 780 : 512} height={featured.monitor === 'gallery' ? 1689 : 320} loading="lazy" decoding="async" className="absolute inset-0 size-full bg-bezel object-contain" />
            {started && (featured.monitor === 'gallery' ? (
              <img src={galleryFrame?.src} alt="" width={galleryFrame?.width} height={galleryFrame?.height} decoding="async" className="absolute inset-0 size-full bg-bezel object-contain" />
            ) : (
              <Suspense fallback={null}>
                <GuidedRecreation kind={featured.monitor} step={step} playing={running} reduced={reduced} />
              </Suspense>
            ))}
          </div>
        </Monitor>

        <div className="mt-5 grid gap-x-6 gap-y-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <p className="text-ink" aria-live={playing ? 'off' : 'polite'}>
            <span className="mr-3 label text-tint">{String(step + 1).padStart(2, '0')} / 04</span>
            {labels[step]}
          </p>
          <div role="group" aria-label="Demonstration steps" className="flex gap-2">
            {labels.map((label, index) => (
              <button key={label} type="button" aria-label={`Step ${index + 1}: ${label}`} aria-pressed={step === index} onClick={() => { setStarted(true); setPlaying(false); setElapsed(index * stepDuration) }} className={cn('grid size-11 place-items-center rounded-sm border label transition-colors hover:bg-panel-2', step === index ? 'border-tint text-tint' : 'border-hairline text-ink-3')}>
                {String(index + 1).padStart(2, '0')}
              </button>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
