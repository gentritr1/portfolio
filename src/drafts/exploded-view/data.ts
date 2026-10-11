/**
 * Content for Exploded View. Every result line comes from CONTENT.md, projects.ts, caseNarratives.ts
 * or THE LOOP's sourced data. Bracketed values from the brief that the repo cannot answer are left out
 * (client-organization counts, screen counts), never filled with examples.
 */
import { links } from '../../content/links'

export { links }

export type LayerId = 'interface' | 'mobile' | 'api' | 'data' | 'quality'

export interface Layer {
  id: LayerId
  name: string
  tools: string[]
}

/** Top to bottom, as drawn. Tools are the ones listed on the CV and in CONTENT.md. */
export const layers: Layer[] = [
  { id: 'interface', name: 'Interface', tools: ['React 19', 'Next.js', 'Vue / Nuxt', 'TypeScript', 'Tailwind', 'TanStack Query and Router', 'Zustand', 'Zod'] },
  { id: 'mobile', name: 'Mobile', tools: ['React Native for iOS and Android', 'Store releases', 'Firebase Messaging', 'Vision Camera', 'PDF and EPUB readers'] },
  { id: 'api', name: 'API & services', tools: ['Laravel / PHP 8.3', 'Python / FastAPI', 'Stripe', 'Twilio', 'AWS IVS', 'Pusher'] },
  { id: 'data', name: 'Data', tools: ['MySQL', 'Redis', 'SQLite', 'Per-tenant data separation'] },
  { id: 'quality', name: 'Quality', tools: ['Playwright', 'Vitest', 'Pest', 'axe', 'Parity tests', 'CI merge gates'] },
]

export interface Case {
  slug: string
  question: string
  answer: string
  /** Shown in the signal colour: only real, sourced outcomes. */
  result: string
  layers: LayerId[]
}

export const cases: Case[] = [
  {
    slug: 'care-platform',
    question: 'How do you rewrite a live healthcare platform without breaking it for patients?',
    answer: 'Vue to React, one route at a time, with parity tests that run the same scenario against the old app and the new one. I wrote most of the rules and merge gates the work runs inside.',
    result: 'One screen went from first note to merged in a working day, and the same test passed on both apps.',
    layers: ['interface', 'quality'],
  },
  {
    slug: 'design-system-react',
    question: 'How do you make accessibility the default, not a checklist?',
    answer: 'A team design system on one token source. I researched five leading systems and wrote the guides its AI agents follow; rendered checks decide each release.',
    result: '36 components, 805 tokens and 20 releases in about six weeks, with 96.6% less JavaScript for a page that uses only the Button.',
    layers: ['interface', 'quality'],
  },
  {
    slug: 'multi-tenant',
    question: "How do you keep each clinic's data separate inside one platform?",
    answer: "Per-tenant data separation, role-based access and patient times in each patient's own timezone, across the Vue app and the Laravel API.",
    result: 'On the same API, one billing report went from 16 database queries to 2 and no longer times out.',
    layers: ['interface', 'api', 'data'],
  },
  {
    slug: 'read-to-feed',
    question: "How do you keep a kids' reading app alive through years of OS changes?",
    answer: 'A PDF and EPUB reader, ISBN scanning and rewards, on maintained forks of epubjs-react-native and react-native-pdf.',
    result: 'About 14 releases to both stores, and React Native 0.63 to 0.81 through three major upgrades.',
    layers: ['mobile', 'interface'],
  },
]

export const alsoShipped = 'Also shipped: an AI business dashboard (headshot generation and chat with uploaded PDFs) and a donations app with Stripe subscriptions.'

export interface LabItem {
  name: string
  line: string
  link?: { label: string; href: string }
  /** Only where a lesson is written down in the project itself. */
  learned?: string
  /** The AI story: what the agents do, what I still decide, one thing that failed. */
  agents?: { do: string; decide: string; failed: string }
}

export const lab: LabItem[] = [
  {
    name: 'Futurisma',
    line: 'A browser hover racer with 9 circuits, built with a multi-agent pipeline.',
    link: { label: 'GitHub', href: 'https://github.com/gentritr1/futurisma' },
    agents: {
      do: 'A planning Claude writes each brief, a building Claude writes the code, Codex models in Blender, and Higgsfield makes pictures and sound.',
      decide: 'Every question of taste, when to commit, and whether it is fun.',
      failed: 'A tower planned 16 m wide with a 14 m tunnel left one metre of wall each side. The plan was fixed and a rule was written down: when you describe a hole, say how much wall is left.',
    },
    learned: 'No number is typed by hand if it can be measured.',
  },
  {
    name: 'Offday',
    line: 'A multi-tenant time-off app, built with one other developer, with about 200 Playwright tests including tenant isolation.',
  },
  {
    name: 'FJALË',
    line: 'A daily Albanian word game that works offline.',
    link: { label: 'Website', href: 'https://xn--fjal-opa.com/' },
  },
  {
    name: 'Za!',
    line: 'A multiplayer card game where the server decides every move.',
    link: { label: 'Website', href: 'https://za-game.vercel.app/' },
  },
]

/** The owner's own lesson from shipping the side projects end to end (2026-10-11). */
export const labLesson = 'Shipping these end to end, from deployment and backends on Neon and Render to the WebSocket server behind Za!, taught me to see a product as one stack, from the first commit to production.'

/** The owner's own four sentences, from the brief. */
export const howIWork = [
  'I start with the question, not the tool.',
  'I test assumptions early and cheaply, before they become expensive.',
  "I write down what went wrong, because that's where the next improvement comes from.",
  'I use AI daily, as a collaborator I verify, not an author I trust blindly.',
]
