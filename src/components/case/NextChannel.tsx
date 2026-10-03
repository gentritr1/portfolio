import { ArrowRightIcon } from '@phosphor-icons/react'
import { TransitionLink } from '../TransitionLink'
import { caseHref, type Project } from '../../content/projects'
import { preloadCase } from '../../lib/routes'

/** The next featured project as one large link. */
export function NextChannel({ next }: { next: Project }) {
  return (
    <TransitionLink
      to={caseHref(next)}
      preload={() => preloadCase(next.slug)}
      data-channel={next.channel}
      className="group block border-t border-hairline py-8 transition-colors duration-200 ease-out hover:border-hairline-strong sm:py-10 lg:py-12"
    >
      <span className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="label-lg text-ink-2">Next project</span>
        <span className="label-lg text-ink-3">{next.kind}</span>
      </span>
      <span className="mt-6 flex items-center justify-between gap-6 sm:mt-8">
        <span className="font-display text-h1 font-semibold text-ink">{next.name}</span>
        <span className="grid size-12 shrink-0 place-items-center rounded-sm border border-hairline-strong text-ink transition-colors duration-200 ease-out group-hover:border-tint sm:size-14">
          <ArrowRightIcon size={22} weight="light" aria-hidden className="transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
        </span>
      </span>
    </TransitionLink>
  )
}
