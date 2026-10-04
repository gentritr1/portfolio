interface Milestone {
  title: string
  detail: string
}

/** Build milestones from CONTENT.md. No dates are inferred for individual stages. */
export const milestones: Record<string, Milestone[]> = {
  'care-platform': [
    { title: 'Vue to React, route by route', detail: 'A gradual frontend rewrite covers patient profiles, care plans, labs, vitals, claims and calls.' },
    { title: 'Parity tests and quality gates', detail: 'The same scenarios run against both apps. Architecture decisions and CI quality gates support the migration.' },
    { title: 'Laravel API improvements', detail: 'Enrollment drafts, a lab catalog and tenant security fixes. One billing report went from 16 queries to 2.' },
  ],
  'bayyinah-tv': [
    { title: 'A fresh Nuxt 3 foundation', detail: 'The second version began from an empty template, with Vue 3, TypeScript and Pinia.' },
    { title: 'Live streams and subscriptions', detail: 'AWS IVS, realtime chat, HLS playback, a premium paywall, subscriptions and gifting.' },
    { title: 'English and Arabic delivery', detail: 'A right-to-left interface across 34 routes. The same web app also runs inside the native mobile apps.' },
  ],
  'read-to-feed': [
    { title: 'The EPUB prototype', detail: 'A 2022 React Native prototype downloaded, rendered and resized EPUB files, forming the start of the reader.' },
    { title: 'Reading, scanning and rewards', detail: 'PDF and EPUB progress, ISBN barcode scanning, quizzes, badges, streaks and notifications in three languages.' },
    { title: 'Store releases and upgrades', detail: 'About 14 releases for iOS and Android, with three major upgrades from React Native 0.63 to 0.81.' },
  ],
  'viva-fresh': [
    { title: 'React Native foundation', detail: 'A mobile app built with React Native, Redux Toolkit and Firebase.' },
    { title: 'Grocery orders and delivery', detail: 'Online ordering with delivery slots and address search on a map.' },
    { title: 'Loyalty and saved products', detail: 'A loyalty programme and wishlist complete the shopping experience.' },
  ],
  'dukagjini-bookstore': [
    { title: 'React Native shop', detail: 'A book shop for a publisher on iOS and Android, with Redux for the app state.' },
    { title: 'Search, categories and favourites', detail: 'Book search, top categories, books on sale and favourite lists.' },
    { title: 'Checkout and notifications', detail: 'Checkout with promo codes, and Firebase push notifications with deep links.' },
  ],
  'design-system-react': [
    { title: 'Research before components', detail: 'A benchmark of leading systems, a multi-agent audit of the old frontend and studies on tokens, testing and governance set the rules.' },
    { title: 'One token source, 36 components', detail: '805 tokens in three tiers and 36 components, shipped in 20 releases in about six weeks.' },
    { title: 'Adopted by the new dashboard', detail: 'The React dashboard uses the system through one adapter layer, and a gate keeps raw colours and native controls out.' },
  ],
  incentiv: [
    { title: 'Next.js application foundation', detail: 'App Router, TypeScript and RTK Query support the dashboard, with public and private route middleware.' },
    { title: 'Sign-in and onboarding', detail: 'Passkey and external-wallet sign-in interfaces, with animated onboarding.' },
    { title: 'Wallet views in two languages', detail: 'Dashboard cards, assets and a balance popup with a QR address, translated into English and French.' },
  ],
}

export function BuildTimeline({ slug }: { slug: string }) {
  const entries = milestones[slug]
  if (!entries) return null

  return (
    <section aria-labelledby="build-title" className="mt-12 border-t border-hairline pt-5">
      <h2 id="build-title" className="text-h3 text-ink">How it was built</h2>
      <ol className="mt-6">
        {entries.map((entry, index) => (
          <li key={entry.title} className="relative pb-7 pl-7 last:pb-0">
            {index < entries.length - 1 && <span aria-hidden className="absolute top-2 bottom-0 left-[3px] w-px bg-hairline" />}
            <span aria-hidden className="absolute top-2 left-0 size-[7px] rounded-full bg-tint" />
            <h3 className="font-medium text-ink">{entry.title}</h3>
            <p className="mt-1 max-w-[64ch] text-story text-ink-2">{entry.detail}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
