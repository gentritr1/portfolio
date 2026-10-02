import { ArrowRightIcon } from '@phosphor-icons/react'
import type { Readout } from '../../content/projects'

/** Hard numbers under the monitor, read like the meters below a broadcast screen. */
export function Readouts({ readouts }: { readouts: Readout[] }) {
  return (
    <dl className="mt-10 grid border-t border-hairline sm:mt-12 sm:grid-cols-3">
      {readouts.map((readout) => (
        <div
          key={readout.label}
          className="relative flex flex-col-reverse gap-3 border-b border-hairline py-5 before:absolute before:-top-px before:left-0 before:h-px before:w-8 before:bg-tint sm:border-b-0 sm:border-l sm:px-6 sm:py-6 sm:before:left-6 sm:first:border-l-0 sm:first:pl-0 sm:first:before:left-0"
        >
          <dt className="label text-ink-3">{readout.label}</dt>
          <dd className="flex items-center gap-[0.18em] font-display text-[clamp(2.5rem,1.7rem+2.4vw,3.75rem)] leading-none font-semibold tracking-[-0.03em] text-ink tabular [font-stretch:112%]">
            {readout.value}
            {readout.to && (
              <>
                <ArrowRightIcon size="0.62em" weight="light" aria-hidden className="shrink-0 text-tint" />
                <span className="sr-only">to</span>
                {readout.to}
              </>
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}
