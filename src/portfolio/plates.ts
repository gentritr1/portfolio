/**
 * What each layer of a product shows when the chamber opens: two or three concepts and, only where one is documented, a proof.
 * Layer titles and technologies come from `System.layers` (src/components/case/TechnicalDiagram.tsx); this file adds no
 * new facts. Every concept is a phrase from that layer's own description, and every proof is a readout from
 * src/content/projects.ts, framed as the kind of evidence it is. A product without a number stays complete without one.
 *
 * All eight products, after a first visual test on care (landscape), Read to Feed (portrait) and Incentiv (no number).
 * Qualifiers travel with their figures: 96.6% is for a Button-only consumer, the floating props were on Frostline.
 */

/** measured: an improvement with its scope. scale: the size of the work. migration: a version history. */
export type ProofKind = 'measured' | 'scale' | 'migration'

export interface Proof {
  kind: ProofKind
  /** The figure, as the readout gives it. */
  value: string
  /** What the figure counts, including its scope. */
  label: string
}

export interface Plate {
  concepts: string[]
  proof?: Proof
  /** A scope line where the layer reaches past this work (who built what). */
  note?: string
}

export const proofKind: Record<ProofKind, string> = {
  measured: 'Measured',
  scale: 'Scale of the rebuild',
  migration: 'Migration history',
}

export const plates: Record<string, [Plate, Plate, Plate]> = {
  'care-platform': [
    // The interface: React 19 · TypeScript
    { concepts: ['Patient profiles', 'Care plans', 'Labs and vitals'] },
    // The boundaries: TanStack Query · Zustand · Zod
    { concepts: ['Tenant data', 'Roles', 'Timezones'], note: 'Parity tests across both frontends.' },
    // The backend: Laravel · MySQL · Redis
    {
      concepts: ['Enrollment drafts', 'Lab catalog', 'Multi-tenant security'],
      proof: { kind: 'measured', value: '16 → 2', label: 'Queries in one billing report' },
    },
  ],
  'read-to-feed': [
    // The application: React Native · Redux Toolkit
    { concepts: ['Reading progress', 'Quizzes', 'Badges and streaks'] },
    // The reader: PDF · EPUB · epub.js
    {
      concepts: ['Two reading formats', 'Maintained reader forks'],
      proof: { kind: 'migration', value: '0.63 → 0.81', label: 'React Native, three major upgrades' },
    },
    // The device: Vision Camera · Firebase
    { concepts: ['ISBN barcode scanning', 'Push notifications', 'Deep links'] },
  ],
  'bayyinah-tv': [
    // The experience: Nuxt 3 · Vue 3 · Pinia
    {
      concepts: ['A full rebuild in English and Arabic', 'The web app inside the native apps'],
      proof: { kind: 'scale', value: '34', label: 'Routes in the Nuxt 3 rebuild' },
    },
    // The live layer: AWS IVS · HLS · Pusher
    { concepts: ['Adaptive video playback', 'Realtime chat', 'Moderation'] },
    // The membership: Stripe · Apple · Google
    { concepts: ['Subscriptions and gifting', 'Promo codes', 'A paywall for premium content'] },
  ],
  'viva-fresh': [
    // The shop: React Native
    { concepts: ['Grocery shopping', 'Loyalty', 'A wishlist'] },
    // The order: Redux Toolkit
    { concepts: ['Online grocery orders', 'Delivery slots', 'Product selection to checkout'] },
    // The delivery: Maps · Firebase
    { concepts: ['Address search on a map', 'An order linked to its delivery location'] },
  ],
  'dukagjini-bookstore': [
    // The shop: React Native · Redux
    { concepts: ['Search and top categories', 'Books on sale', 'Favourite lists'] },
    // The order: Checkout · Promo codes
    { concepts: ['A checkout on both platforms', 'Promo codes'] },
    // The return: Firebase Messaging · Deep links
    { concepts: ['Push notifications that open the right screen', 'An animated book header', 'Swipe-to-close modals'] },
  ],
  'design-system-react': [
    // Research and agents: Research corpus · Agent skills · Fresh reviewers. Owner rule: this layer stays qualitative.
    { concepts: ['One best-practices guide', 'Agents under written rules', 'Independent reviewers on each change'] },
    // Tokens and components: DTCG tokens · React 19 · CSS Modules
    {
      concepts: ['Tokens in three tiers', 'CSS, TypeScript and a Figma bundle', 'A typed, versioned package'],
      proof: { kind: 'measured', value: '96.6%', label: 'Less JavaScript for a Button-only consumer' },
    },
    // Evidence and adoption: Playwright · axe · Executable gates
    {
      concepts: ['Rendered contrast checks', 'axe tests against WCAG 2.1 AA floors', 'One adapter layer'],
      note: 'The new dashboard is not in production yet.',
    },
  ],
  futurisma: [
    // The game: Three.js · TypeScript · Vite
    { concepts: ['Nine circuits that change during the race', 'Rivals and ghosts', 'A garage and an autopilot demo'] },
    // The art: Blender · Python · Higgsfield
    {
      concepts: ['Blender build scripts', 'Painted atlases', 'Reference pictures and sound from Higgsfield'],
      proof: { kind: 'measured', value: '1,397 → 0', label: 'Floating props on Frostline, after the terrain fix' },
    },
    // The crew: Claude · Codex · Validators
    { concepts: ['A planning Claude writes briefs', 'Claude and Codex build', 'Every phase re-runs its tests'] },
  ],
  incentiv: [
    // The interface: Next.js 14 · TypeScript
    { concepts: ['Dashboard cards', 'Assets', 'Balance with a QR address'] },
    // The data: RTK Query · next-intl
    { concepts: ['A typed frontend', 'English and French'], note: 'The wallet and blockchain layer was built by teammates.' },
    // The access: Passkeys · Route middleware
    { concepts: ['Passkey sign-in', 'External-wallet sign-in', 'Protected routes'] },
  ],
}
