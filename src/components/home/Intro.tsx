import type { Ref } from 'react'
import type { SignalStackHandle } from '../signal-stack/SignalStack'
import type { ChannelKey } from '../../content/channels'
import { Container } from '../Container'
import { HeaderVisual } from '../HeaderVisual'
import { SignalDot } from '../SignalDot'

const status = ['5+ yrs', '2 platform rewrites']

export function Intro({ active, stackRef, transitionName }: { active: ChannelKey; stackRef?: Ref<SignalStackHandle>; transitionName?: string }) {
  return (
    <section aria-labelledby="intro-title" className="pt-8 sm:pt-10">
      <Container className="grid items-center gap-x-8 md:grid-cols-[minmax(0,1fr)_300px] lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          <h1 id="intro-title" className="text-display text-ink">
            Gentrit Rashiti
          </h1>
          <p className="mt-2 font-display text-h3 font-medium text-ink-2 [font-stretch:112%] sm:text-[1.5rem]">
            Frontend & mobile developer, now full stack
          </p>
          <p className="mt-3 max-w-[60ch] text-lede text-ink">
            Web and mobile products, from the first screen to release: healthcare, video streaming, e-reading and Web3.
          </p>
          <ul className="mt-5 inline-flex flex-col border border-hairline label text-ink-2 sm:flex-row">
            <li className="flex min-h-9 items-center gap-2 px-3 whitespace-nowrap text-ink">
              <SignalDot />
              Available · Remote
            </li>
            {status.map((item) => (
              <li
                key={item}
                className="flex min-h-9 items-center border-t border-hairline px-3 whitespace-nowrap sm:border-t-0 sm:border-l"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
        <HeaderVisual
          active={active}
          stackRef={stackRef}
          transitionName={transitionName}
          className="hidden md:block md:h-[200px] md:w-[300px] md:justify-self-end lg:h-[220px] lg:w-[380px]"
        />
      </Container>
    </section>
  )
}
