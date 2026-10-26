/**
 * What each layer of a product shows when the chamber opens: two or three concepts and, only where one is documented, a proof.
 * Layer titles and technologies come from `System.layers` (src/components/case/TechnicalDiagram.tsx); this file adds no
 * new facts. Every concept is a phrase from that layer's own description, and every proof is a readout from
 * src/content/projects.ts, framed as the kind of evidence it is. A product without a number stays complete without one.
 *
 * First visual test (owner, 2026-10-26): care (landscape), Read to Feed (portrait), Incentiv (no number).
 * The other five follow once these three hold up.
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
  incentiv: [
    // The interface: Next.js 14 · TypeScript
    { concepts: ['Dashboard cards', 'Assets', 'Balance with a QR address'] },
    // The data: RTK Query · next-intl
    { concepts: ['A typed frontend', 'English and French'], note: 'The wallet and blockchain layer was built by teammates.' },
    // The access: Passkeys · Route middleware
    { concepts: ['Passkey sign-in', 'External-wallet sign-in', 'Protected routes'] },
  ],
}
