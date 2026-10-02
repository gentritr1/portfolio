import { Container } from '../components/Container'
import { RevealGroup, RevealItem } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'
import { cn } from '../lib/cn'
import { worlds, type WorldId } from '../lib/worlds'

interface Capability {
  title: string
  body: string
  /** Worlds on this page where the capability shows. The first one tints the cell. */
  seenIn: WorldId[]
  span: string
}

const capabilities: Capability[] = [
  {
    title: 'Rewrites & migrations',
    body: 'Move a live app to a new framework step by step, with parity checks.',
    seenIn: ['healthcare'],
    span: 'lg:col-span-7',
  },
  {
    title: 'Mobile apps',
    body: 'iOS and Android, from build to store release and major upgrades.',
    seenIn: ['reading'],
    span: 'lg:col-span-5',
  },
  {
    title: 'Multi-tenant platforms',
    body: 'Separate data, roles and permissions for each client.',
    seenIn: ['healthcare'],
    span: 'lg:col-span-4',
  },
  {
    title: 'Streaming & media',
    body: 'Live streams, realtime chat, video on demand, PDF and EPUB reading.',
    seenIn: ['streaming', 'reading'],
    span: 'lg:col-span-4',
  },
  {
    title: 'Payments',
    body: 'Web and in-app subscriptions, gifts, promo codes.',
    seenIn: ['streaming'],
    span: 'lg:col-span-4',
  },
  {
    title: 'AI features',
    body: 'Document chat, AI image generation, AI-assisted QA automation.',
    seenIn: ['ai', 'healthcare'],
    span: 'lg:col-span-5',
  },
  {
    title: 'Full stack',
    body: 'APIs, databases, background jobs, performance.',
    seenIn: ['healthcare', 'ai'],
    span: 'md:col-span-2 lg:col-span-7',
  },
]

function WorldLink({ id }: { id: WorldId }) {
  return (
    <a href={`#${id}`} data-world={id} className="group/link inline-flex min-h-11 items-center">
      <span className="inline-flex h-8 items-center gap-2 rounded-full px-3 font-mono text-[0.75rem] text-accent-ink ring-1 ring-line ring-inset transition-colors duration-200 ease-out group-hover/link:bg-accent-soft group-hover/link:ring-transparent">
        <span aria-hidden className="h-1.5 w-3.5 rounded-[2px] bg-accent" />
        {worlds[id].label}
      </span>
    </a>
  )
}

export function Capabilities() {
  return (
    <section id="capabilities" data-world="base" data-world-section aria-labelledby="capabilities-title" className="pt-section">
      <Container>
        <SectionHeading id="capabilities-title" title="Capabilities" />
        <RevealGroup
          as="ul"
          gap={0.05}
          className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-panel bg-line ring-1 ring-line md:grid-cols-2 lg:mt-16 lg:grid-cols-12"
        >
          {capabilities.map((item) => (
            <RevealItem
              as="li"
              key={item.title}
              data-world={item.seenIn[0]}
              className={cn('flex min-h-[13rem] flex-col bg-[var(--world-bg)] p-6 sm:p-8', item.span)}
            >
              <h3 className="text-h3 font-medium text-ink">{item.title}</h3>
              <p className="mt-3 max-w-[44ch] text-muted">{item.body}</p>
              <div className="mt-auto flex flex-wrap gap-x-2 pt-6">
                {item.seenIn.map((id) => (
                  <WorldLink key={id} id={id} />
                ))}
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </section>
  )
}
