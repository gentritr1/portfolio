import { ArrowUpIcon } from '@phosphor-icons/react'
import { links } from '../content/links'
import { primaryWorlds } from '../lib/worlds'
import { Container } from './Container'

export function Footer() {
  return (
    <footer data-world="base" data-world-section className="pb-10 pt-16">
      <Container>
        <div className="flex gap-1" aria-hidden>
          {primaryWorlds.map((id) => (
            <span key={id} data-world={id} className="h-1 flex-1 rounded-full bg-accent" />
          ))}
        </div>
        <div className="mt-8 grid gap-8 md:grid-cols-12">
          <p className="max-w-[52ch] text-[0.95rem] leading-relaxed text-muted md:col-span-7">
            Built with React, Tailwind and motion. No screenshots of client work: every demo above is a recreation with
            invented data.
          </p>
          <div className="flex flex-wrap items-start gap-x-6 gap-y-3 md:col-span-5 md:justify-end">
            <a href={links.github} className="inline-flex min-h-11 items-center text-[0.95rem] text-ink underline-offset-4 hover:underline">
              GitHub
            </a>
            <a href={links.cv} download className="inline-flex min-h-11 items-center text-[0.95rem] text-ink underline-offset-4 hover:underline">
              Download CV
            </a>
            <a
              href="#top"
              className="group inline-flex min-h-11 items-center gap-2 text-[0.95rem] text-ink underline-offset-4 hover:underline"
            >
              Back to top
              <ArrowUpIcon size={16} weight="light" aria-hidden className="transition-transform duration-200 ease-out group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>
        <p className="mt-10 font-mono text-meta text-muted">© 2026 Gentrit Rashiti</p>
      </Container>
    </footer>
  )
}
