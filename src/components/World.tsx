import { CubeIcon } from '@phosphor-icons/react'
import type { CSSProperties, ReactNode } from 'react'
import { cn } from '../lib/cn'
import { worlds, type WorldId } from '../lib/worlds'
import { Chip } from './Chip'
import { Container } from './Container'
import { Eyebrow } from './Eyebrow'
import { Reveal, RevealGroup, RevealItem } from './Reveal'

export type WorldLayout = 'stage-end' | 'stage-start' | 'stage-wide'

export interface WorldProps {
  /** Selects the accent tokens and the section id. */
  world: WorldId
  title: string
  /** The eyebrow parts from CONTENT.md, shown as one metadata line under the title. */
  meta: string[]
  role: string
  /** Story paragraphs, in order. */
  story: string[]
  facts: string[]
  /** Stack groups. Each group renders on its own line. Omit when CONTENT.md names none. */
  stack?: string[]
  /** The live recreation. It fills the stage core. */
  recreation: ReactNode
  /** Name of the recreation, for the caption under the stage. */
  recreationName: string
  /** CSS aspect-ratio of the stage core on wide screens, for example "4 / 3". */
  stageAspect?: string
  /** CSS aspect-ratio of the stage core from 640px to 1023px. Defaults to stageAspect, or "1 / 1" for stage-wide. */
  stageAspectTablet?: string
  /** CSS aspect-ratio of the stage core below 640px. Defaults to stageAspect. */
  stageAspectMobile?: string
  layout?: WorldLayout
  /** Extra narrative content after the story, for example related projects. */
  children?: ReactNode
  /** Full-width content after the narrative and the stage. */
  after?: ReactNode
}

function Stage({
  recreation,
  recreationName,
  stageAspect = '4 / 3',
  stageAspectTablet,
  stageAspectMobile,
  layout,
}: Pick<
  WorldProps,
  'recreation' | 'recreationName' | 'stageAspect' | 'stageAspectTablet' | 'stageAspectMobile' | 'layout'
>) {
  const tablet = stageAspectTablet ?? (layout === 'stage-wide' ? '1 / 1' : stageAspect)
  const style = {
    '--stage-aspect': stageAspect,
    '--stage-aspect-tablet': tablet,
    '--stage-aspect-mobile': stageAspectMobile ?? stageAspect,
    '--stage-ratio': `calc(${stageAspect})`,
    '--stage-ratio-tablet': `calc(${tablet})`,
  } as CSSProperties

  return (
    <Reveal
      as="figure"
      style={style}
      className="mx-auto w-full sm:max-w-[calc(82svh*var(--stage-ratio-tablet))] lg:max-w-[calc(82svh*var(--stage-ratio))]"
    >
      <div className="rounded-stage bg-accent-soft p-1.5 shadow-stage ring-1 ring-[color-mix(in_oklab,var(--accent)_18%,transparent)] ring-inset">
        <div
          data-recreation-stage
          className="@container relative aspect-(--stage-aspect-mobile) w-full overflow-hidden rounded-stage-inner bg-surface sm:aspect-(--stage-aspect-tablet) lg:aspect-(--stage-aspect)"
        >
          {recreation}
        </div>
      </div>
      <figcaption className="mt-3 flex items-center gap-2 px-1 font-mono text-meta text-muted">
        <CubeIcon size={16} weight="light" aria-hidden className="shrink-0 text-accent-ink" />
        <span>
          Live recreation: {recreationName}. Invented data, no client screens.
        </span>
      </figcaption>
    </Reveal>
  )
}

function NarrativeMain({ world, title, meta, role, story, children, layout, headingId }: WorldProps & { headingId: string }) {
  const info = worlds[world]
  return (
    <div>
      <RevealGroup as="header">
        <RevealItem>
          <h2
            id={headingId}
            className={cn('text-h2 text-ink', layout !== 'stage-wide' && 'lg:text-[clamp(2.25rem,0.9rem+2.4vw,2.75rem)]')}
          >
            {title}
          </h2>
        </RevealItem>
        <RevealItem className="mt-5">
          <Eyebrow items={meta} />
        </RevealItem>
        <RevealItem as="p" className="mt-6 text-[0.95rem] leading-relaxed">
          <span className="font-medium text-ink">{info.employer}</span>
          <span className="tabular text-muted">, {info.period}</span>
          <span className="block text-muted">{role}</span>
        </RevealItem>
      </RevealGroup>

      <RevealGroup className="mt-8 max-w-[62ch] space-y-5 text-[1.0625rem] leading-[1.7] text-[color-mix(in_oklab,var(--ink)_86%,var(--world-bg))]">
        {story.map((paragraph) => (
          <RevealItem as="p" key={paragraph.slice(0, 32)}>
            {paragraph}
          </RevealItem>
        ))}
      </RevealGroup>

      {children && <div className="mt-10">{children}</div>}
    </div>
  )
}

function NarrativeFacts({ facts, stack }: Pick<WorldProps, 'facts' | 'stack'>) {
  return (
    <div>
      <h3 className="sr-only">Highlights</h3>
      <RevealGroup as="ul" gap={0.04} className="flex flex-wrap gap-2">
        {facts.map((fact) => (
          <RevealItem as="li" key={fact}>
            <Chip font="sans">{fact}</Chip>
          </RevealItem>
        ))}
      </RevealGroup>

      {stack && stack.length > 0 && (
        <Reveal className="mt-8 border-t border-line pt-5">
          <h3 className="font-mono text-meta font-normal text-ink">Stack</h3>
          <ul className="mt-2 space-y-1 font-mono text-meta text-muted">
            {stack.map((group) => (
              <li key={group}>{group}</li>
            ))}
          </ul>
        </Reveal>
      )}
    </div>
  )
}

/**
 * Section shell for one world. It scopes the world's accent tokens, marks
 * the section for the page cross-fade, and places the narrative beside the
 * recreation stage. Below 1024px the stage comes first.
 */
export function World(props: WorldProps) {
  const { world, layout = 'stage-end' } = props
  const headingId = `${world}-title`
  const stage = (
    <Stage
      recreation={props.recreation}
      recreationName={props.recreationName}
      stageAspect={props.stageAspect}
      stageAspectTablet={props.stageAspectTablet}
      stageAspectMobile={props.stageAspectMobile}
      layout={layout}
    />
  )

  return (
    <section id={world} data-world={world} data-world-section aria-labelledby={headingId} className="pt-section">
      <Container>
        {layout === 'stage-wide' ? (
          <div className="flex flex-col gap-12 lg:gap-16">
            {stage}
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-x-16">
              <div className="lg:col-span-7">
                <NarrativeMain {...props} headingId={headingId} />
              </div>
              <div className="lg:col-span-5 lg:pt-2">
                <NarrativeFacts facts={props.facts} stack={props.stack} />
              </div>
            </div>
            {props.after}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16">
            <div
              className={cn(
                'lg:sticky lg:top-24 lg:row-start-1 lg:self-start',
                layout === 'stage-end' ? 'lg:col-span-7 lg:col-start-6' : 'lg:col-span-7 lg:col-start-1',
              )}
            >
              {stage}
            </div>
            <div
              className={cn(
                'lg:row-start-1',
                layout === 'stage-end' ? 'lg:col-span-5 lg:col-start-1' : 'lg:col-span-5 lg:col-start-8',
              )}
            >
              <NarrativeMain {...props} headingId={headingId} />
              <div className="mt-10">
                <NarrativeFacts facts={props.facts} stack={props.stack} />
              </div>
            </div>
          </div>
        )}
        {layout !== 'stage-wide' && props.after && <div className="mt-12 lg:mt-16">{props.after}</div>}
      </Container>
    </section>
  )
}

/** Temporary stage content: a soft accent panel with a one-word label. */
export function StagePlaceholder({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-[color-mix(in_oklab,var(--accent-soft)_55%,var(--surface))]">
      <div className="flex flex-col items-center gap-4">
        <span aria-hidden className="h-1 w-12 rounded-full bg-accent" />
        <span className="font-display text-[clamp(2rem,8cqi,4.5rem)] font-medium tracking-[-0.03em] text-accent-ink">
          {label}
        </span>
      </div>
    </div>
  )
}
