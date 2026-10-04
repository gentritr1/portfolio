import { ArrowLeftIcon } from '../components/ShellIcons'
import { useLocation } from 'react-router'
import { Container } from '../components/Container'
import { SignalDot } from '../components/SignalDot'
import { TransitionLink } from '../components/TransitionLink'
import { SignalStack } from '../components/signal-stack/SignalStack'
import { channelOrder } from '../content/channels'

/** A quiet stack losing its broadcast, with an immediate still for reduced motion. */
export default function NoSignalPage() {
  const { pathname } = useLocation()

  return (
    <section aria-labelledby="no-signal-title" className="pt-12 sm:pt-20">
      <title>No signal, Gentrit Rashiti</title>
      <Container>
        <div className="relative h-56 overflow-hidden rounded-panel border border-hairline bg-panel-1 sm:h-72">
          <SignalStack channels={channelOrder} active="streaming" lostSignal className="size-full" />
          <span aria-hidden className="absolute bottom-4 left-4 label text-ink-3">404 / Broadcast ended</span>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-12">
          <div className="min-w-0 md:col-span-7">
            <h1 id="no-signal-title" className="text-h1 text-ink">
              No signal
            </h1>
            <p className="mt-3 flex min-w-0 items-center gap-2 label text-ink-3">
              <SignalDot tone="off" />
              <span className="truncate">{pathname}</span>
            </p>
          </div>
          <div className="md:col-span-5 md:pt-3">
            <p className="max-w-[46ch] text-ink-2">
              There’s no page at this address. Explore the work to find a project.
            </p>
            <TransitionLink
              to="/#work"
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-sm border border-hairline-strong px-4 label text-ink transition-[background-color,border-color] duration-200 ease-out hover:border-transparent hover:bg-panel-2"
            >
              <ArrowLeftIcon size={14} aria-hidden />
              Back to the work
            </TransitionLink>
          </div>
        </div>
      </Container>
    </section>
  )
}
