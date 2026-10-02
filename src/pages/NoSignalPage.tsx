import { ArrowLeftIcon } from '@phosphor-icons/react'
import { useLocation } from 'react-router'
import { Container } from '../components/Container'
import { SignalDot } from '../components/SignalDot'
import { TransitionLink } from '../components/TransitionLink'
import { channelOrder } from '../content/channels'

const bars: Record<(typeof channelOrder)[number], string> = {
  healthcare: 'bg-ch-healthcare',
  streaming: 'bg-ch-streaming',
  reading: 'bg-ch-reading',
  web3: 'bg-ch-web3',
  ai: 'bg-ch-ai',
  personal: 'bg-ch-personal',
}

/** A calm test card for routes with no broadcast. */
export function NoSignalPage() {
  const { pathname } = useLocation()

  return (
    <section aria-labelledby="no-signal-title" className="pt-12 sm:pt-20">
      <title>No signal, Gentrit Rashiti</title>
      <Container>
        <div aria-hidden className="overflow-hidden rounded-panel border border-hairline">
          <div className="grid h-36 grid-cols-6 sm:h-52">
            {channelOrder.map((key) => (
              <span key={key} className={`${bars[key]} opacity-80`} />
            ))}
          </div>
          <div className="grid h-8 grid-cols-4 sm:h-10">
            <span className="bg-panel-0" />
            <span className="bg-panel-1" />
            <span className="bg-panel-2" />
            <span className="bg-panel-3" />
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-12">
          <div className="md:col-span-7">
            <h1 id="no-signal-title" className="text-h1 text-ink">
              No signal
            </h1>
            <p className="mt-3 flex items-center gap-2 label text-ink-3">
              <SignalDot tone="off" />
              <span className="truncate">{pathname}</span>
            </p>
          </div>
          <div className="md:col-span-5 md:pt-3">
            <p className="max-w-[46ch] text-ink-2">
              Nothing is broadcast on this address. The schedule lists every channel and every project.
            </p>
            <TransitionLink
              to="/#schedule"
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-sm border border-hairline-strong px-4 label text-ink transition-[background-color,border-color] duration-200 ease-out hover:border-transparent hover:bg-panel-2"
            >
              <ArrowLeftIcon size={14} weight="light" aria-hidden />
              Back to the schedule
            </TransitionLink>
          </div>
        </div>
      </Container>
    </section>
  )
}
