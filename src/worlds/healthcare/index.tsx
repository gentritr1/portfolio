import { Showcase } from '../../components/Showcase'
import { World } from '../../components/World'
import { Recreation } from './Recreation'

const intakePages = [
  {
    src: '/showcase/care/book-1.webp',
    alt: 'Public patient intake page of a care-platform tenant: welcome and consent step with personal information fields',
    caption: 'Welcome and consent',
    width: 1440,
    height: 727,
  },
  {
    src: '/showcase/care/book-2.webp',
    alt: 'Public patient intake page: address step and the start of the medical intake form',
    caption: 'Address and medical intake',
    width: 1440,
    height: 727,
  },
  {
    src: '/showcase/care/book-3.webp',
    alt: 'Public patient intake page: review and consent step before submission',
    caption: 'Review and consent',
    width: 1440,
    height: 727,
  },
]

function Showcases() {
  return (
    <Showcase
      title="Public intake pages"
      aspect="web"
      links={[{ label: 'Website', href: 'https://app.goodcannanow.com/goodcannanow/' }]}
      items={intakePages}
    />
  )
}

export function HealthcareWorld() {
  return (
    <World
      world="healthcare"
      layout="stage-end"
      stageAspect="4 / 3"
      stageAspectTablet="4 / 3"
      stageAspectMobile="4 / 5"
      title="A care‑management platform, rebuilt one screen at a time"
      meta={['Healthcare', 'Care management', 'Web + backend']}
      role="Frontend and mobile, full stack since 2026"
      story={[
        "A care-management platform for remote patient monitoring. Care teams use it to follow vitals from connected devices, care plans, lab results, billing claims, calls and chat. Many client organizations share one multi-tenant system, so each screen keeps each organization's data separate and respects each user's role.",
        'The frontend moved from Vue (Nuxt 2) to React route by route, with parity tests that run each scenario against both apps, 31 architecture decision records and CI quality gates. The Laravel backend gained enrollment drafts, a lab catalog and multi-tenant security fixes; one billing report went from 16 queries to 2.',
      ]}
      facts={[
        'Vue → React rewrite, route by route, parity-tested',
        '31 architecture decision records, CI quality gates',
        'Patient profile, care plans, labs and vitals, claims, calls',
        'Multi-tenant: data separation, roles, timezones',
        'Laravel API: enrollment drafts, lab catalog, security fixes',
        'Report query 16 → 2, no more timeouts',
        '4 languages: EN, DE, ES, TR',
      ]}
      stack={[
        'React 19, TypeScript, TanStack Query/Router, Zustand, Zod, Tailwind, Vitest, Playwright',
        'Laravel 13, PHP 8.3, MySQL, Redis, Pest',
        'Twilio, Chime, Pusher, ECharts',
      ]}
      recreationName="Vitals trend card"
      recreation={<Recreation />}
      after={<Showcases />}
    />
  )
}
