import { ArrowRightIcon, ArrowUpRightIcon, PauseIcon, PlayIcon } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
import { Chip } from '../components/Chip'
import { Container } from '../components/Container'
import { Reveal, RevealGroup, RevealItem } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'
import { links } from '../content/links'
import { usePrefersReducedMotion } from '../lib/motion'

const apps = [
  { src: '/personal/app-arrows.webp', alt: 'Illustration for the Arrows app: a blue paper plane leading a swarm of arrows' },
  { src: '/personal/app-block-destroy.webp', alt: 'Illustration for the Block Destroy game' },
  { src: '/personal/app-fjale.webp', alt: 'Illustration for the Fjale word app' },
  { src: '/personal/app-geo-guesser.webp', alt: 'Illustration for the Geo Guesser game' },
]

function SnaxxVideo() {
  const video = useRef<HTMLVideoElement>(null)
  const reduce = usePrefersReducedMotion()
  const [playing, setPlaying] = useState(false)
  const [pausedByVisitor, setPausedByVisitor] = useState(false)

  useEffect(() => {
    const element = video.current
    if (!element || reduce || pausedByVisitor) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) element.play().catch(() => setPlaying(false))
        else element.pause()
      },
      { threshold: 0.25 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [reduce, pausedByVisitor])

  const toggle = () => {
    const element = video.current
    if (!element) return
    if (playing) {
      element.pause()
      setPausedByVisitor(true)
    } else {
      setPausedByVisitor(false)
      element.play().catch(() => setPlaying(false))
    }
  }

  return (
    <div className="relative overflow-hidden rounded-panel bg-accent-soft ring-1 ring-line">
      <video
        ref={video}
        className="block aspect-video w-full object-cover"
        poster="/personal/hero-almanac-poster.jpg"
        src="/personal/snaxx-hero.mp4"
        muted
        loop
        playsInline
        preload="none"
        aria-label="Looping hero of the Snaxx Tech studio site: an illustrated almanac landscape with a workshop, an observatory and a game portal"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Pause the video' : 'Play the video'}
        className="absolute bottom-3 right-3 grid size-11 place-items-center rounded-full bg-[color-mix(in_oklab,var(--surface)_88%,transparent)] text-ink shadow-float ring-1 ring-line transition-transform duration-200 ease-out hover:scale-105 active:scale-95"
      >
        {playing ? <PauseIcon size={18} weight="light" aria-hidden /> : <PlayIcon size={18} weight="light" aria-hidden />}
      </button>
    </div>
  )
}

function Delta({ label, from, to }: { label: string; from: string; to: string }) {
  return (
    <Chip className="gap-2">
      <span className="text-muted">{label}</span>
      <span className="tabular">{from}</span>
      <ArrowRightIcon size={13} weight="light" aria-label="to" />
      <span className="tabular">{to}</span>
    </Chip>
  )
}

export function Personal() {
  return (
    <section id="personal" data-world="base" data-world-section aria-labelledby="personal-title" className="pt-section">
      <Container>
        <SectionHeading id="personal-title" title="Personal projects" />

        <div className="mt-12 grid grid-cols-1 gap-14 lg:mt-16 lg:grid-cols-12 lg:gap-x-16">
          <article className="lg:col-span-7">
            <Reveal>
              <SnaxxVideo />
            </Reveal>
            <RevealGroup className="mt-8">
              <RevealItem>
                <h3 className="text-h3 font-medium text-ink">Snaxx Tech studio site</h3>
              </RevealItem>
              <RevealItem as="p" className="mt-3 max-w-[58ch] text-muted">
                Marketing site for an indie app studio: a three.js hero, a seamless cinemagraph video loop, Almanac visual
                theme, strict CSP on Vercel.
              </RevealItem>
              <RevealItem className="mt-5 flex flex-wrap gap-2">
                <Delta label="Images" from="972 KB" to="337 KB" />
                <Delta label="Deploy" from="28 MB" to="9.5 MB" />
              </RevealItem>
            </RevealGroup>
            <RevealGroup as="ul" gap={0.04} className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {apps.map((app) => (
                <RevealItem as="li" key={app.src}>
                  <img
                    src={app.src}
                    alt={app.alt}
                    loading="lazy"
                    decoding="async"
                    width={1200}
                    height={896}
                    className="aspect-[4/3] w-full rounded-[10px] object-cover ring-1 ring-line"
                  />
                </RevealItem>
              ))}
            </RevealGroup>
          </article>

          <div className="flex flex-col gap-12 lg:col-span-5">
            <RevealGroup as="article" className="border-t border-line pt-8">
              <RevealItem>
                <h3 className="text-h3 font-medium text-ink">Offday</h3>
              </RevealItem>
              <RevealItem as="p" className="mt-3 text-muted">
                Multi-tenant time-off app: employee requests, manager approvals, team calendar with drag-select, invite
                links, streaming AI assistant, dark theme.
              </RevealItem>
              <RevealItem className="mt-5 flex flex-wrap gap-2">
                <Chip>Next.js 16</Chip>
                <Chip>SQLite</Chip>
                <Chip>Zod</Chip>
                <Chip>Playwright: 16 security and tenant-isolation tests</Chip>
              </RevealItem>
            </RevealGroup>

            <RevealGroup as="article" className="border-t border-line pt-8">
              <RevealItem>
                <h3 className="text-h3 font-medium text-ink">Open source</h3>
              </RevealItem>
              <RevealItem as="p" className="mt-3 text-muted">
                Maintained forks of <code className="font-mono text-[0.9em] text-ink">epubjs-react-native</code> and{' '}
                <code className="font-mono text-[0.9em] text-ink">react-native-pdf</code>, used in a production reading app.
              </RevealItem>
              <RevealItem className="mt-4">
                <a
                  href={links.github}
                  className="group inline-flex min-h-11 items-center gap-2 font-mono text-meta text-ink underline decoration-line-strong underline-offset-4 transition-colors duration-200 hover:decoration-current"
                >
                  {links.githubLabel}
                  <ArrowUpRightIcon
                    size={15}
                    weight="light"
                    aria-hidden
                    className="transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </a>
              </RevealItem>
            </RevealGroup>
          </div>
        </div>
      </Container>
    </section>
  )
}
