import { ArrowUpRightIcon, DownloadSimpleIcon, EnvelopeSimpleIcon, GithubLogoIcon, LinkedinLogoIcon, type Icon } from '@phosphor-icons/react'
import { Button } from '../components/Button'
import { Container } from '../components/Container'
import { RevealGroup, RevealItem } from '../components/Reveal'
import { links } from '../content/links'

interface ContactLink {
  label: string
  value: string
  href: string
  icon: Icon
}

function contactLinks(): ContactLink[] {
  const list: ContactLink[] = []
  if (links.email) list.push({ label: 'Email', value: links.email, href: `mailto:${links.email}`, icon: EnvelopeSimpleIcon })
  list.push({ label: 'GitHub', value: links.githubLabel, href: links.github, icon: GithubLogoIcon })
  if (links.linkedin) {
    list.push({ label: 'LinkedIn', value: links.linkedin.replace(/^https?:\/\/(www\.)?/, ''), href: links.linkedin, icon: LinkedinLogoIcon })
  }
  return list
}

export function Contact() {
  return (
    <section id="contact" data-world="base" data-world-section aria-labelledby="contact-title" className="py-section">
      <Container>
        <RevealGroup className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-x-16">
          <div className="lg:col-span-6">
            <RevealItem>
              <h2 id="contact-title" className="text-display text-ink">
                Contact
              </h2>
            </RevealItem>
            <RevealItem as="p" className="mt-6 max-w-[34ch] text-lede text-muted">
              Based in Kosovo, working remotely.
            </RevealItem>
            <RevealItem className="mt-9">
              <Button href={links.cv} download icon={DownloadSimpleIcon}>
                Download CV
              </Button>
            </RevealItem>
          </div>

          <RevealItem as="ul" className="self-end lg:col-span-6">
            {contactLinks().map((link) => (
              <li key={link.label} className="border-t border-line last:border-b">
                <a
                  href={link.href}
                  className="group flex min-h-20 items-center gap-4 py-4 transition-colors duration-200 ease-out hover:text-accent-ink"
                >
                  <link.icon size={22} weight="light" aria-hidden className="shrink-0 text-muted" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="font-mono text-meta text-muted">{link.label}</span>
                    <span className="truncate font-display text-h3 font-medium text-ink">{link.value}</span>
                  </span>
                  <ArrowUpRightIcon
                    size={22}
                    weight="light"
                    aria-hidden
                    className="shrink-0 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </a>
              </li>
            ))}
          </RevealItem>
        </RevealGroup>
      </Container>
    </section>
  )
}
