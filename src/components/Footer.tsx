import { links } from '../content/links'
import { Container } from './Container'

const footerLink = 'inline-flex min-h-11 min-w-11 items-center justify-center text-ink-2 underline-offset-4 transition-colors duration-200 hover:text-ink hover:underline'

export function Footer() {
  return (
    <footer className="mt-section border-t border-hairline">
      <Container className="grid gap-x-8 gap-y-4 pb-10 pt-8 md:grid-cols-12">
        <p className="max-w-[60ch] text-meta text-ink-2 md:col-span-7">
          Internal screens are recreations with invented data; every screenshot comes from a public page or a store listing.
        </p>
        <ul className="flex flex-wrap items-start gap-x-6 label md:col-span-5 md:justify-end">
          <li>
            <a href={links.github} className={footerLink}>
              GitHub
            </a>
          </li>
          <li>
            <a href={links.cv} download className={footerLink}>
              CV
            </a>
          </li>
          {links.email && (
            <li>
              <a href={`mailto:${links.email}`} className={footerLink}>
                Email
              </a>
            </li>
          )}
          {links.linkedin && (
            <li>
              <a href={links.linkedin} className={footerLink}>
                LinkedIn
              </a>
            </li>
          )}
        </ul>
        <p className="label text-ink-3 md:col-span-12">© 2026 Gentrit Rashiti</p>
      </Container>
    </footer>
  )
}
