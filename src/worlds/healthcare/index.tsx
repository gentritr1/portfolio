import { World } from '../../components/World'
import { Recreation } from './Recreation'

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
      role="Software developer on the core team: frontend and mobile first, full stack since 2026."
      story={[
        "The platform helps care teams monitor patients remotely: vitals from connected devices, care plans, lab results, billing claims, calls and chat. Many client organizations run on one system, so every screen must keep each organization's data separate and respect each user's role.",
        'In 2026 the platform moved from Vue (Nuxt 2) to React, one route at a time. Each screen was inventoried from the old app, rebuilt in React, then proven with automated parity tests that run the same scenario against the old and the new app. The work is recorded in 31 architecture decision records, and CI gates check types, module boundaries, dead code, bundle size and translations on every merge.',
        'The backend (Laravel) gained program enrollment drafts, a standardized lab catalog, timezone-correct scheduling and multi-tenant security fixes. One billing report used to time out at 60 seconds; its 16 patient queries became one query plus one aggregate, so it no longer grows with the date range.',
      ]}
      facts={[
        'Vue → React rewrite, route by route, parity-tested',
        '31 architecture decision records',
        'Patient profile, care plans, labs & vitals, claims, calls',
        'Multi-tenant: data separation, roles, timezone correctness',
        'Laravel API: enrollment, lab catalog, 70 test files added',
        'Report query 16 → 2, no more timeouts',
        'AI-assisted QA scenarios + CI quality gates',
        '34-component React design system, WCAG 2.1 AA',
        '4 languages: EN, DE, ES, TR',
      ]}
      stack={[
        'React 19, TypeScript, TanStack Query/Router, Zustand, Zod, Tailwind, Vitest, Playwright',
        'Laravel 13, PHP 8.3, MySQL, Redis, Pest',
        'Twilio, Chime, Pusher, ECharts',
      ]}
      recreationName="Vitals trend card"
      recreation={<Recreation />}
    />
  )
}
