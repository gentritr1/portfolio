import type { ChannelKey } from '../../content/channels'
import { Container } from '../Container'
import { HeaderVisual } from '../HeaderVisual'
import { SignalDot } from '../SignalDot'

const status = ['5+ yrs', '2 platform rewrites']

export function Intro({ active }: { active: ChannelKey }) {
  return (
    <section aria-labelledby="intro-title" className="pt-10 sm:pt-14 lg:pt-16">
      <Container className="grid items-center gap-x-8 md:grid-cols-12">
        <div className="md:col-span-7">
          <h1 id="intro-title" className="text-display text-ink">
            Gentrit Rashiti
          </h1>
          <p className="mt-4 font-display text-h3 font-medium text-ink-2 [font-stretch:112%] sm:text-[1.5rem]">
            Frontend & mobile developer, now full stack
          </p>
          <p className="mt-6 max-w-[46ch] text-lede text-ink">
            Web and mobile products, from the first screen to release: healthcare, video streaming, e-reading and Web3.
          </p>
          <ul className="mt-7 inline-flex flex-col border border-hairline label text-ink-2 sm:flex-row">
            <li className="flex min-h-9 items-center gap-2 px-3 text-ink">
              <SignalDot />
              Available · Remote
            </li>
            {status.map((item) => (
              <li key={item} className="flex min-h-9 items-center border-t border-hairline px-3 sm:border-t-0 sm:border-l">
                {item}
              </li>
            ))}
          </ul>
        </div>
        <HeaderVisual
          active={active}
          className="hidden md:col-span-5 md:block md:h-[232px] md:w-full md:max-w-[340px] md:justify-self-end lg:h-[300px] lg:max-w-[440px]"
        />
      </Container>
    </section>
  )
}
