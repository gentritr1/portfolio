import { ArrowUpRightIcon, DownloadSimpleIcon } from '@phosphor-icons/react'
import { links } from '../../content/links'
import { Container } from '../Container'

const capabilities = [
  {
    name: 'Rewrites & migrations',
    note: 'A live app moves to a new framework step by step, with parity checks.',
  },
  {
    name: 'Mobile iOS / Android',
    note: 'From the first build to the store release and major upgrades.',
  },
  {
    name: 'Multi-tenant platforms',
    note: 'Separate data, roles and permissions for each client.',
  },
  {
    name: 'Streaming & media',
    note: 'Live streams, realtime chat, video on demand, PDF and EPUB reading.',
  },
  {
    name: 'Payments',
    note: 'Web and in-app subscriptions, gifts, promo codes.',
  },
  {
    name: 'AI features',
    note: 'Document chat, AI image generation, AI-assisted QA.',
  },
  {
    name: 'Full stack',
    note: 'APIs, databases, background jobs, performance.',
  },
]

const secondary =
  'group inline-flex min-h-11 items-center gap-1.5 rounded-sm border border-hairline-strong px-3.5 label-lg text-ink transition-[background-color,border-color] duration-200 ease-out hover:border-transparent hover:bg-panel-2'

export function About() {
  const contact = [
    { label: 'GitHub', href: links.github },
    links.email ? { label: 'Email', href: `mailto:${links.email}` } : null,
    links.linkedin ? { label: 'LinkedIn', href: links.linkedin } : null,
  ].filter((item): item is { label: string; href: string } => item !== null)

  return (
    <section id="about" aria-labelledby="about-title" className="pt-section">
      <Container>
        <div className="grid gap-x-8 gap-y-10 border-t border-hairline pt-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="about-title" className="text-h2 text-ink">
              About
            </h2>
            <div className="mt-5 max-w-[56ch] space-y-4 text-story text-ink-2">
              <p>Products for healthcare, video streaming, e-reading and Web3, built from the first screen to release.</p>
              <p>
                The web side runs on React, Next.js, Vue and Nuxt; the apps run on iOS and Android with React Native; the APIs
                behind them are Laravel and FastAPI.
              </p>
              <p>
                The work includes two platform rewrites, where a live app moves to a new framework step by step. Based in Kosovo,
                working remotely.
              </p>
            </div>
          </div>

          <dl className="grid content-start gap-x-8 sm:grid-cols-2 lg:col-span-7 lg:pt-2">
            {capabilities.map((item) => (
              <div key={item.name} className="border-b border-hairline py-3.5">
                <dt className="label-lg text-ink">{item.name}</dt>
                <dd className="mt-1.5 text-meta text-ink-2">{item.note}</dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-wrap items-center gap-2 lg:col-span-12">
            <a
              href={links.cv}
              download
              className="group inline-flex min-h-11 items-center gap-2 rounded-sm bg-ink px-4 label-lg text-panel-0 transition-[background-color,transform] duration-150 ease-out hover:bg-ink-2 active:scale-[0.98]"
            >
              <DownloadSimpleIcon size={16} weight="light" aria-hidden />
              Download CV
            </a>
            {contact.map((item) => (
              <a
                key={item.label}
                href={item.href}
                {...(item.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className={secondary}
              >
                {item.label}
                <ArrowUpRightIcon size={14} weight="light" aria-hidden className="text-ink-3" />
              </a>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
