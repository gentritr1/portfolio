import { ArrowLeftIcon, DownloadSimpleIcon } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { links } from '../content/links'
import { caseHref, featuredProjects } from '../content/projects'
import { Container } from './Container'
import { SignalDot } from './SignalDot'
import { ThemeToggle } from './ThemeToggle'
import { TransitionLink } from './TransitionLink'

const clock = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Belgrade',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/** Local time in Kosovo, HH:MM, updated on each minute boundary. */
function useKosovoTime(): string {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    let interval: number | undefined
    const timeout = window.setTimeout(
      () => {
        setNow(new Date())
        interval = window.setInterval(() => setNow(new Date()), 60_000)
      },
      60_000 - (Date.now() % 60_000),
    )
    return () => {
      window.clearTimeout(timeout)
      window.clearInterval(interval)
    }
  }, [])

  return clock.format(now)
}

const control =
  'inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-sm px-2.5 text-ink-2 transition-[background-color,color] duration-200 ease-out hover:bg-panel-2 hover:text-ink'

export function Masthead() {
  const { pathname } = useLocation()
  const onCase = pathname.startsWith('/work/')
  const onAir = pathname === '/' || featuredProjects.some((project) => pathname === caseHref(project))
  const time = useKosovoTime()

  return (
    <header data-masthead className="sticky top-0 z-(--z-masthead) border-b border-hairline bg-panel-0">
      <Container className="flex h-14 items-center gap-1 sm:gap-3">
        <TransitionLink to="/" className="-ml-1 flex min-h-11 min-w-11 items-center justify-center gap-2.5 rounded-sm px-1 text-ink">
          <span
            aria-hidden
            className="grid size-8 place-items-center rounded-sm border border-hairline-strong font-display text-[0.8125rem] font-semibold [font-stretch:112%] tracking-[-0.01em]"
          >
            GR
          </span>
          <span className="hidden font-display text-[0.9375rem] font-semibold [font-stretch:112%] tracking-[-0.01em] md:inline">
            Gentrit Rashiti
          </span>
          <span className="sr-only md:hidden">Gentrit Rashiti, home</span>
        </TransitionLink>

        {onCase && (
          <TransitionLink to="/#schedule" className={`${control} label`}>
            <ArrowLeftIcon size={15} weight="light" aria-hidden />
            <span className="hidden sm:inline">Schedule</span>
            <span className="sr-only sm:hidden">Back to the schedule</span>
          </TransitionLink>
        )}

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <p className="flex items-center gap-x-3 px-1 label">
            <span className={onAir ? 'flex items-center gap-2 text-ink' : 'flex items-center gap-2 text-ink-3'}>
              <SignalDot tone={onAir ? 'signal' : 'off'} />
              {onAir ? 'On air' : 'Off air'}
            </span>
            <span className="flex items-center gap-1.5 text-ink-2">
              <span aria-hidden>KOS</span>
              <time className="text-ink tabular" dateTime={time} aria-label={`Local time in Kosovo, ${time}`}>
                {time}
              </time>
            </span>
          </p>
          <ThemeToggle />
          <a href={links.cv} download className={`${control} label`}>
            <DownloadSimpleIcon size={16} weight="light" aria-hidden />
            <span className="hidden sm:inline">CV</span>
            <span className="sr-only sm:hidden">Download CV</span>
          </a>
        </div>
      </Container>
    </header>
  )
}
