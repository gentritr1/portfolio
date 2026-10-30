import { projects, type Project } from '../../content/projects'
import { periodOf, type ChannelKey } from '../../content/channels'
import { systems } from './data'
import type { System } from '../event-horizon/data'

/** A case page's content. The own products carry a section of their own in place of the three layers. */
export type Case = System & { layersTitle?: string }

const W = 2880, H = 1800
const shot = (dir: string, file: string, caption: string, alt: string) => ({ src: `/showcase/${dir}/${file}.webp`, alt, caption, width: W, height: H })

/**
 * The owner's own products (owner, 2026-10-29: one chapter, a case each; LeakScan under Web apps & AI, built alone).
 * Offday: CONTENT.md §7 and projects.ts, word for word. LeakScan: its README and landing copy (src/lib/content.ts) at
 * SlopRemover main 025f13b, word for word except "the owner" made "an app's owner" (on this page it would read as
 * Gentrit); no price, since the README and the code disagree on it. Screens: captured
 * from each repo's main with invented data (design/selected-work-concepts/{offday,appcare}-shots/manifest.json).
 */
export const own: Case[] = [
  {
    slug: 'offday',
    name: 'Offday',
    kind: 'Time-off app',
    years: '2026',
    role: 'Built with one other developer',
    line: 'Time off for teams: approvals, shared calendar, shift cover, best-dates planner, AI assistant',
    stack: ['Next.js 16', 'SQLite', 'Zod', 'Playwright'],
    readouts: [{ value: 'About 200', label: 'Playwright tests, including security and tenant isolation' }],
    texture: '',
    aspect: W / H,
    tint: '#3ee6a4',
    story: {
      product: 'A multi-tenant time-off app.',
      built: projects.find((p) => p.slug === 'offday')?.summary ?? '',
      result: '',
    },
    facts: [],
    layers: [],
    gallery: [
      shot('offday', 'offday-landing-hero', 'Landing page', 'The top of Offday\'s landing page: Time off, without the back-and-forth., the pitch, Create your workspace and Try the live demo, and the top of the product demo'),
      shot('offday', 'offday-landing-hero-demo', 'Live demo', 'The landing page\'s product demo after the approve click: a vacation marked Approved and the toast Request approved. The team calendar is up to date.'),
      shot('offday', 'offday-desktop-calendar', 'Team calendar', 'Offday team calendar for October 2026: approved leave as one bar per week, a morning off marked AM, Columbus Day, and the approvals queue with an Over limit flag on a Thanksgiving request'),
      shot('offday', 'offday-desktop-approvals', 'Approvals', 'Every November request in one list: three pending with Approve and Decline, three approved and one declined'),
      shot('offday', 'offday-desktop-request', 'Request review', 'A pending vacation request opened for review: Engineering would have two people off against a limit of one, and the dialog names who else is away'),
      shot('offday', 'offday-desktop-best-dates', 'Best dates', 'Find the best dates: three windows that turn 3 vacation days into 6 days off around Veterans Day, Thanksgiving and Christmas'),
      shot('offday', 'offday-desktop-shifts', 'Shifts', 'The week\'s shift grid after cover was assigned, with one Friday shift still needing cover'),
            shot('offday', 'offday-desktop-assistant', 'Assistant', 'The workspace assistant answering who is off today and what is pending, from the workspace\'s own data'),
      shot('offday', 'offday-desktop-calendar-dark', 'Dark theme', 'The same October calendar and approvals queue in the dark theme'),
      shot('offday', 'offday-landing-rest', 'Built for rest', 'The landing page\'s Same days off. More rest. section: Find the best dates, See who needs a break, A heads-up, not a wall, and Bridge days, spotted'),
      shot('offday', 'offday-landing-features', 'Features', 'The landing page\'s Everything time off needs. Nothing it doesn\'t. section: the shared calendar, balances, clear roles, overlaps caught early and private notes'),
      shot('offday', 'offday-landing-security', 'Privacy and security', 'The landing page\'s Your company\'s data, kept in its lane. section: one request as Sofia, her manager, a teammate and another company see it, above six safeguards'),
    ],
    links: [],
  },
  {
    slug: 'leakscan',
    name: 'LeakScan',
    kind: 'Security scanner',
    years: '2026',
    role: 'Owner, built alone',
    line: 'Security scans for AI-built apps: seven checks, one plain-English report',
    stack: ['Next.js 16', 'Postgres (PGlite)', 'Drizzle', 'Paddle'],
    readouts: [
      { value: '7', label: 'checks, one plain-English report' },
      { value: '4', label: 'free checks that show what a stranger can see' },
    ],
    texture: '',
    aspect: W / H,
    tint: '#3ee6a4',
    story: {
      product: 'Security scans for AI-built apps.',
      built:
        "An app's owner adds it, pays, proves they control the domain, optionally connects the repository and a read-only database role, and a worker runs seven checks and writes a plain-English report with a fix prompt per finding. One free rescan within 14 days marks each finding fixed or still open. Nothing runs before the domain is verified. Credentials are encrypted at rest, deleted by the app's owner with one click, and expire after 14 days.",
      result: '',
    },
    facts: [],
    layersTitle: 'The seven checks',
    layers: [
      { title: 'Secrets in code', stack: 'Needs a repository token', description: 'Files and the last 300 commits of the repository, matched against known key patterns.' },
      { title: 'Secrets in the live app', stack: 'Needs nothing', description: 'The home page and its first-party JavaScript.' },
      { title: 'Database lints', stack: 'Needs a read-only role', description: 'Catalog queries over the owner\'s Postgres, covering the Supabase advisor catalog.' },
      { title: 'Anonymous data probe', stack: 'Needs nothing', description: 'One select per table through the app\'s own public Supabase key; never a write.' },
      { title: 'Passive web scan', stack: 'Needs nothing', description: 'Cookies, mixed content, public source maps, exposed .env and .git.' },
      { title: 'Headers and certificate', stack: 'Needs nothing', description: 'Security headers, TLS expiry and trust, HTTP to HTTPS redirect, version disclosure.' },
      { title: 'Dependencies', stack: 'Needs a repository token', description: 'Lockfiles (npm, pnpm, yarn, bun) against the OSV database.' },
    ],
    gallery: [
      shot('leakscan', 'leakscan-desktop-hero-scan', 'Landing page', 'The landing hero: Is your AI-built app leaking data?, the address field, and the layered app model with the scan plane passing through it'),
      shot('leakscan', 'leakscan-desktop-report', 'Full Scan report', 'The Full Scan report for an invented app: health score 48 from 7 of 7 checks, seven serious leaks to fix first, and the three critical fixes to start with'),
      shot('leakscan', 'leakscan-desktop-report-finding', 'Finding and fix prompt', 'A critical finding, an OpenAI-shaped key shipped in the browser bundle, in plain English, with the prompt to paste into the builder and the steps to do by hand'),
      shot('leakscan', 'leakscan-desktop-report-access', 'Who can reach each table', 'The access map for the invented database: visitors can read and write bookings and update gift cards, classes are public, profiles are own-rows only'),
      shot('leakscan', 'leakscan-desktop-free-check', 'Free check', 'The free check for an invented app: two serious leaks to fix first, followed by one result row per free check in the What a stranger can see card'),
      shot('leakscan', 'leakscan-desktop-app-scanned', 'After the scan', 'The app page after the Full Scan: the report is ready with 15 things to fix, then Fix, Rescan and Clean up'),
      shot('leakscan', 'leakscan-desktop-checks', 'Seven checks', 'The landing page\'s seven checks, each tagged Free check or Full Scan, with what it finds and how it works'),
      shot('leakscan', 'leakscan-desktop-inside', 'Inside the report', 'The landing page\'s report carousel: the health score, Start here, and one question only the app\'s owner can answer'),
      shot('leakscan', 'leakscan-desktop-fix', 'Fix prompt', 'The landing page\'s finding beside the fix prompt written for it, with Copy prompt'),
      shot('leakscan', 'leakscan-desktop-how', 'From proof to report', 'The landing page\'s seven steps from proving the app is yours to the report, starting with Prove it\'s yours'),
    ],
    links: [],
  },
]

/**
 * The care platform's second screen is Vitals and labs (board 02 of its case boards, the Loop's words for its alt) in place
 * of the glucose overview, whose one-day chart read as empty (owner, 2026-10-30). The site's own gallery keeps both.
 */
const VITALS = {
  src: '/showcase/care-dashboard/vitals-graph.webp', caption: 'Vitals and labs', width: 2880, height: 1800,
  alt: 'The vitals and labs screen for one patient, with the glucose graph open: the latest reading of 146 mg/dL and a 7-day trend line from Sep 26 to Oct 2, with one high reading of 192 mg/dL marked in red. Invented data.',
}

/** Every case page: the eight featured products, then the two own products (their slugs also in home.ts). */
export const cases: Case[] = [
  ...systems.map((s) => (s.slug === 'care-platform' ? { ...s, gallery: s.gallery.map((g) => (g.src.endsWith('/rpm-overview-cgm.webp') ? VITALS : g)) } : s)),
  ...own,
]

/** One row of the page's index of projects. */
export type Row = Pick<Project, 'slug' | 'name' | 'channel' | 'years' | 'role' | 'line' | 'links'>

/** All projects on this page: the site's list, and LeakScan under Web apps & AI (it is not in the site's list yet). */
export const work: Row[] = [...projects, { slug: 'leakscan', name: 'LeakScan', channel: 'ai', years: '2026', role: own[1].role, line: own[1].line, links: [] }]

/** An area's years over this page's list (LeakScan adds 2026 to Web apps & AI). */
export const period = (key: ChannelKey) => periodOf(key, work)
