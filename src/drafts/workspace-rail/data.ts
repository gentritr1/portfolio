import { groupPeriods, projects, type ProjectGroupName, type RecreationKey } from '../../content/projects'

export type WorkspaceId = 'vianova' | 'agency' | 'incentiv' | 'avahitech' | 'personal'

/** Where a row's hairline ends: an element inside a live plate, or a point in a screenshot (fractions of its box). */
export type Pin =
  | { kind: 'css'; css: string; text?: string; at?: 'edge' | 'mid' }
  | { kind: 'point'; x: number; y: number }

export interface Shot {
  id: string
  src: string
  alt: string
  width: number
  height: number
}

export type Plate =
  | { kind: 'live'; key: RecreationKey; world: string; ratio: number; phoneRatio: number }
  | { kind: 'shot'; shot: Shot }
  | { kind: 'phones'; shots: Shot[] }

export interface Row {
  id: string
  slug: string
  /** `{…}` marks the words that prove the section claim. */
  text: string
  result: string
  caption?: string
  pin?: Pin
  /** `over` and `under` enter the plate from a lane outside it, so the line does not cross other parts. */
  route?: 'side' | 'over' | 'under'
  caseSlug?: string
}

export interface Card {
  id: string
  name: string
  source: string
  line: string
  meta: string
  href?: string
  plate: Plate
  rows: Row[]
}

export interface Workspace {
  id: WorkspaceId
  group: ProjectGroupName
  name: string
  tint: string
  period: string
  claim: string
  cards: Card[]
  also: string[]
}

const phone = (id: string, src: string, alt: string): Shot => ({ id, src, alt, width: 780, height: 1689 })
const web = (id: string, src: string, alt: string): Shot => ({ id, src, alt, width: 1440, height: 900 })

export const workspaces: Workspace[] = [
  {
    id: 'vianova',
    group: 'Vianova',
    name: 'Vianova',
    tint: '#0E7C7B',
    period: groupPeriods.Vianova ?? '2021–now',
    claim: 'A care platform, rebuilt one route at a time.',
    cards: [
      {
        id: 'care',
        name: 'Care-management platform',
        source: 'Recreation, invented data',
        line: 'Many client organizations share one system → every screen keeps their data apart.',
        meta: 'Frontend and mobile, full stack since 2026 · 2023–26',
        href: '/work/care-platform',
        plate: { kind: 'live', key: 'care', world: 'healthcare', ratio: 16 / 10, phoneRatio: 1 },
        rows: [
          {
            id: 'vn-react',
            slug: 'care-platform',
            text: 'Move the frontend from Vue to React {one route at a time}.',
            result: 'parity test on both apps first',
            caption: 'Switch the organization: the data changes, the controls stay.',
            pin: { kind: 'css', css: 'button[aria-label^="Organization"]' },
          },
          {
            id: 'vn-report',
            slug: 'care-api',
            text: 'Rework one billing report in the Laravel API.',
            result: '16 → 2 queries, no timeout',
          },
          {
            id: 'vn-ds',
            slug: 'design-system-react',
            text: 'Build Design System v2 from one token source, in three tiers.',
            result: '36 components · 805 tokens · 20 releases',
            caseSlug: 'design-system-react',
          },
          {
            id: 'vn-vue',
            slug: 'care-platform',
            text: 'Build profiles, care plans, labs and vitals, and claims on Vue.',
            result: '4 languages: EN, DE, ES, TR',
            pin: { kind: 'css', css: '[role="group"][aria-label^="Blood pressure"]', at: 'mid' },
          },
        ],
      },
    ],
    also: ['design-system-vue', 'design-dashboard'],
  },
  {
    id: 'agency',
    group: 'Agency work',
    name: 'Agency work',
    tint: '#4338CA',
    period: groupPeriods['Agency work'] ?? '2021–26',
    claim: 'Three apps in both stores.',
    cards: [
      {
        id: 'stores',
        name: 'Read to Feed, Viva Fresh, Dukagjini Bookstore',
        source: 'Screens from the public store listings',
        line: 'Reading, grocery and book shopping for iOS and Android, each from one React Native codebase.',
        meta: 'Mobile, iOS and Android · 2021–25',
        plate: {
          kind: 'phones',
          shots: [
            phone('read', '/mobile/reading-1.webp', 'Read to Feed store screenshot: My Books with reading progress'),
            phone('viva', '/mobile/grocery-1.webp', 'Viva Fresh store screenshot: home with product categories, Albanian interface'),
            phone('duka', '/mobile/bookstore-1.webp', 'Dukagjini Bookstore store screenshot: home with book search, categories and books on sale'),
          ],
        },
        rows: [
          {
            id: 'ag-read',
            slug: 'read-to-feed',
            text: 'Keep a children’s reading app shipping through three React Native upgrades.',
            result: 'about 14 releases to {both stores}',
            pin: { kind: 'css', css: '[data-shot="read"]' },
            route: 'over',
            caseSlug: 'read-to-feed',
          },
          {
            id: 'ag-viva',
            slug: 'viva-fresh',
            text: 'Take grocery orders for a delivery slot, with loyalty and a map search.',
            result: 'one codebase, live in {both stores}',
            pin: { kind: 'css', css: '[data-shot="viva"]' },
            route: 'over',
            caseSlug: 'viva-fresh',
          },
          {
            id: 'ag-duka',
            slug: 'dukagjini-bookstore',
            text: 'Open the right book from a push notification, through a deep link.',
            result: 'live in {both stores}',
            pin: { kind: 'css', css: '[data-shot="duka"]' },
            route: 'over',
            caseSlug: 'dukagjini-bookstore',
          },
        ],
      },
      {
        id: 'bayyinah',
        name: 'Bayyinah TV',
        source: 'Screen from the public website',
        line: 'A video-learning platform needed live streams and subscriptions → a full rebuild on Nuxt 3.',
        meta: 'Frontend, core team · 2023–26',
        href: '/work/bayyinah-tv',
        plate: {
          kind: 'shot',
          shot: web('btv', '/showcase/bayyinah/web-01.webp', 'Bayyinah TV landing page: "Quran Studies Made Simple" with the app on a laptop, a monitor and phones'),
        },
        rows: [
          {
            id: 'ag-nuxt',
            slug: 'bayyinah-tv',
            text: 'Rebuild the platform from an empty template, in English and Arabic.',
            result: '34 routes · 270+ components',
            pin: { kind: 'point', x: 0.478, y: 0.52 },
          },
          {
            id: 'ag-pay',
            slug: 'bayyinah-tv',
            text: 'Sell access through Stripe, Apple and Google subscriptions.',
            result: 'gifts and promo codes too',
            pin: { kind: 'point', x: 0.12, y: 0.648 },
            route: 'under',
          },
          {
            id: 'ag-native',
            slug: 'bayyinah-tv',
            text: 'Run the same web app inside the iOS and Android apps.',
            result: 'one codebase, web and native',
            pin: { kind: 'point', x: 0.787, y: 0.6 },
          },
        ],
      },
    ],
    also: [
      'bayyinah-institute',
      'chatbot-runtime',
      'chatbot-runtime-web',
      'epub-reader-prototype',
      'donation-app',
      'coaching-app',
      'member-portal',
      'fuel-loyalty-app',
    ],
  },
  {
    id: 'incentiv',
    group: 'Incentiv',
    name: 'Incentiv',
    tint: '#8A5300',
    period: groupPeriods.Incentiv ?? '2024',
    claim: 'A smart-wallet UI in two languages.',
    cards: [
      {
        id: 'portal',
        name: 'Incentiv portal',
        source: 'Screen from the public sign-in page',
        line: 'The UI layer of a smart-wallet portal. Teammates built the wallet and blockchain layer.',
        meta: 'Frontend, UI layer · 2024',
        href: '/work/incentiv',
        plate: {
          kind: 'shot',
          shot: web('inc', '/showcase/incentiv/web-03.webp', 'Incentiv Portal sign-in: Passkey, MetaMask and WalletConnect options beside a dashboard preview'),
        },
        rows: [
          {
            id: 'in-sign',
            slug: 'incentiv',
            text: 'Sign people in with a passkey or an external wallet.',
            result: 'Passkey, MetaMask, WalletConnect',
            pin: { kind: 'point', x: 0.482, y: 0.577 },
          },
          {
            id: 'in-dash',
            slug: 'incentiv',
            text: 'Build the dashboard cards, the asset list and a QR balance popup.',
            result: 'animated onboarding too',
            pin: { kind: 'point', x: 0.79, y: 0.53 },
          },
          {
            id: 'in-lang',
            slug: 'incentiv',
            text: 'Ship every screen in {English and French}, private routes behind sign-in.',
            result: 'live at portal.incentiv.io',
          },
        ],
      },
    ],
    also: [],
  },
  {
    id: 'avahitech',
    group: 'AvahiTech',
    name: 'AvahiTech',
    tint: '#475569',
    period: groupPeriods.AvahiTech ?? 'Freelance',
    claim: 'Two AI features in one dashboard.',
    cards: [
      {
        id: 'doc-chat',
        name: 'AI business dashboard',
        source: 'Recreation, invented data',
        line: 'Staff needed help with profile photos and long PDFs → two AI flows in a React dashboard.',
        meta: 'Frontend, some FastAPI · freelance',
        plate: { kind: 'live', key: 'doc-chat', world: 'ai', ratio: 16 / 10, phoneRatio: 4 / 5 },
        rows: [
          {
            id: 'av-pdf',
            slug: 'ai-dashboard',
            text: '{Answer questions about an uploaded PDF}, and cite the page.',
            result: 'document chat',
            pin: { kind: 'css', css: 'span', text: 'Page 3 of 14' },
          },
          {
            id: 'av-head',
            slug: 'ai-dashboard',
            text: 'Turn uploaded photos into {professional headshots}.',
            result: 'photo upload → headshots',
          },
        ],
      },
    ],
    also: [],
  },
  {
    id: 'personal',
    group: 'Personal',
    name: 'Personal',
    tint: '#BE185D',
    period: '2022–26',
    claim: 'Multi-tenant again, in his own app.',
    cards: [
      {
        id: 'offday',
        name: 'Offday',
        source: 'Screen from the app’s demo workspace',
        line: 'A time-off app that many teams share → no team sees another team’s leave.',
        meta: 'Owner: design, code and release · 2026',
        plate: {
          kind: 'shot',
          shot: web('off', '/personal/shots/offday-app-desktop.webp', 'Offday team calendar with October leave bars and the approval queue'),
        },
        rows: [
          {
            id: 'pe-tenant',
            slug: 'offday',
            text: 'Keep {every team’s data apart} in one shared app.',
            result: '16 security and tenant-isolation tests',
            pin: { kind: 'point', x: 0.142, y: 0.15 },
          },
          {
            id: 'pe-approve',
            slug: 'offday',
            text: 'Approve requests from a queue beside the team calendar.',
            result: 'drag-select dates, invite links',
            pin: { kind: 'point', x: 0.918, y: 0.442 },
          },
          {
            id: 'pe-snaxx',
            slug: 'snaxx-tech',
            text: 'Cut a studio site’s images from 972 KB to 337 KB.',
            result: 'deploy 28 MB → 9.5 MB, strict CSP',
          },
          {
            id: 'pe-fjale',
            slug: 'fjale',
            text: 'Build a daily Albanian word game that plays offline.',
            result: '21,000 words, live on the web',
          },
        ],
      },
    ],
    also: ['offbeat', 'form', 'geo-guesser', 'za', 'morse-trainer', 'futurisma', 'secret-dictator', 'open-source-forks'],
  },
]

export const projectCount = (ws: Workspace) => projects.filter((p) => p.group === ws.group).length

export const fold = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

export interface Hit {
  slug: string
  name: string
  line: string
  years: string | null
  /** Page element that shows this project. */
  target: string
}

const targetOf = (ws: Workspace, slug: string) => {
  for (const card of ws.cards) {
    const row = card.rows.find((r) => r.slug === slug)
    if (row) return `wr-row-${row.id}`
  }
  return `wr-also-${slug}`
}

export const hitsByWorkspace: Record<WorkspaceId, Array<Hit & { haystack: string }>> = Object.fromEntries(
  workspaces.map((ws) => [
    ws.id,
    projects
      .filter((p) => p.group === ws.group)
      .map((p) => ({
        slug: p.slug,
        name: p.name,
        line: p.line,
        years: p.years,
        target: targetOf(ws, p.slug),
        haystack: fold([p.name, p.kind, p.line, p.role, ...p.stack].join(' ')),
      })),
  ]),
) as Record<WorkspaceId, Array<Hit & { haystack: string }>>

export const search = (id: WorkspaceId, query: string) => {
  const words = fold(query).split(/\s+/).filter(Boolean)
  if (!words.length) return []
  return hitsByWorkspace[id].filter((hit) => words.every((w) => hit.haystack.includes(w)))
}

export const projectName = (slug: string) => projects.find((p) => p.slug === slug)?.name ?? slug
