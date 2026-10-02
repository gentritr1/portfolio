import { Container } from '../components/Container'
import { RevealGroup, RevealItem } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'

const groups = [
  { label: 'Frontend', items: 'React, Next.js, Vue, Nuxt, TypeScript, Tailwind' },
  { label: 'Mobile', items: 'React Native, iOS, Android' },
  { label: 'Backend', items: 'Laravel / PHP, Python / FastAPI, MySQL, Redis' },
  { label: 'Quality', items: 'Playwright, Vitest, Pest, CI/CD' },
  { label: 'Services', items: 'Stripe, Firebase, AWS IVS, Twilio, Pusher' },
  { label: 'Localization', items: 'Multi-language, Arabic RTL' },
]

export function Skills() {
  return (
    <section id="skills" data-world="base" data-world-section aria-labelledby="skills-title" className="pt-section">
      <Container className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-x-16">
        <div className="lg:col-span-4">
          <SectionHeading id="skills-title" title="Skills" />
        </div>
        <RevealGroup as="dl" gap={0.04} className="grid grid-cols-1 gap-x-10 sm:grid-cols-2 lg:col-span-8">
          {groups.map((group) => (
            <RevealItem key={group.label} className="border-t border-line py-5">
              <dt className="font-mono text-meta text-muted">{group.label}</dt>
              <dd className="mt-1.5 text-[1.0625rem] text-ink">{group.items}</dd>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </section>
  )
}
