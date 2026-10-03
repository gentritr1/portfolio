import { ArrowRightIcon } from '@phosphor-icons/react'
import type { Readout } from '../../content/projects'

/** Hard numbers under the monitor, read like the meters below a broadcast screen. */
export function Readouts({ readouts }: { readouts: Readout[] }) {
  return (
    <dl className="@container mt-10 grid border-t border-hairline sm:mt-12 md:grid-cols-3">
      {readouts.map((readout) => (
        <div
          key={readout.label}
          className="relative flex min-w-0 flex-col gap-3 border-b border-hairline py-5 before:absolute before:-top-px before:left-0 before:h-px before:w-8 before:bg-tint md:border-b-0 md:border-l md:px-5 md:py-6 md:before:left-5 md:first:border-l-0 md:first:pl-0 md:first:before:left-0 lg:px-6 lg:before:left-6"
        >
          <dt className="order-2 max-w-[28ch] label leading-relaxed text-ink-3">{readout.label}</dt>
          <dd className="order-1 flex flex-wrap items-center gap-x-[0.18em] gap-y-1 font-display text-[clamp(2.5rem,12cqw,3.75rem)] leading-none font-semibold tracking-[-0.03em] text-ink tabular [font-stretch:112%] md:text-readout">
            <span className="whitespace-nowrap">{readout.value}</span>
            {readout.to && (
              <>
                <ArrowRightIcon size="0.62em" weight="light" aria-hidden className="shrink-0 text-tint" />
                <span className="sr-only">to</span>
                <span className="whitespace-nowrap">{readout.to}</span>
              </>
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}
