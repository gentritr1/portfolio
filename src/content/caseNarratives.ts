import type { Fact, Story } from './projects'

interface CaseNarrative {
  story: Story
  facts: Fact[]
}

/** Case-only text. Imported by the lazy case route, never by the home schedule. */
export const caseNarratives: Partial<Record<string, CaseNarrative>> = {
  'care-platform': {
    story: {
    product:
      "A care-management platform for remote patient monitoring. Care teams use it to follow vitals from connected devices, care plans, lab results, billing claims, calls and chat. Many client organizations share one multi-tenant system, so every screen keeps each organization's data separate and respects each user's role and timezone. The whole interface runs in four languages: English, German, Spanish and Turkish.",
    built:
      'Two eras of one product. From 2023 the team built its features on Vue (Nuxt 2): patient profile, care plans, labs and vitals, claims, calls and chat. In 2026 the frontend moves to React one route at a time, in strict TypeScript with TanStack Query and Router, Zustand and Zod. Each route gets a parity test that runs the same scenario against both apps. AI agents with written rules help build and review each step, and independent reviewers check the evidence.',
    result:
      'Most screens are already rebuilt in React, and a route moves over only after its parity tests show the same behaviour in both apps. New screens use Design System v2, a library of 36 accessible components built to WCAG 2.1 AA floors. On the API side, one billing report went from 16 queries to 2 and no longer times out.',
  },
    facts: [
    { label: 'Role', value: 'Frontend and mobile, full stack since 2026' },
    { label: 'Years', value: '2023–26' },
    { label: 'Platforms', value: 'Web app, Laravel API' },
    { label: 'Languages', value: 'English, German, Spanish, Turkish' },
    { label: 'Frontend', value: 'React 19, TypeScript, TanStack Query/Router, Zustand, Zod, Tailwind, Vitest, Playwright' },
    { label: 'Backend', value: 'Laravel 13, PHP 8.3, MySQL, Redis, Pest' },
    { label: 'Services', value: 'Twilio, Chime, Pusher, ECharts' },
    { label: 'Method', value: 'Route-by-route rewrite, parity tests, AI agents with independent review' },
  ],
  },
  'bayyinah-tv': {
    story: {
    product:
      'Bayyinah TV is a video-learning platform for an online community: courses, playlists, learning progress, a scripture reader, on-demand video and live streams. Members pay through web and in-app subscriptions, gifts and promo codes. The same web app also runs inside the native iOS and Android apps, so one codebase serves the browser and both stores, in English and in Arabic.',
    built:
      'Its second version is a full rebuild on Nuxt 3, started from an empty template. It added live streaming on AWS IVS with realtime chat and moderation, an HLS player with a quality selector and a paywall for premium content, Stripe, Apple and Google subscriptions, gifting and promo codes. The interface runs in English and Arabic, with a complete right-to-left layout.',
    result:
      'Bayyinah TV is live at bayyinahtv.com and in the App Store and on Google Play, where the native apps run the same web app. The Nuxt 3 rebuild ships 34 routes, 270+ components and 25 Pinia stores. Live streams with realtime chat and moderation, on-demand video and Stripe, Apple and Google subscriptions run in English and Arabic, with a full right-to-left layout. The institute website, bayyinah.org, is live as well.',
  },
    facts: [
    { label: 'Role', value: 'Frontend, core team' },
    { label: 'Years', value: '2023–26' },
    { label: 'Platforms', value: 'Web, inside the iOS and Android apps' },
    { label: 'Languages', value: 'English, Arabic (right-to-left)' },
    { label: 'Stack', value: 'Nuxt 3, Vue 3, TypeScript, Pinia, Tailwind' },
    { label: 'Video', value: 'video.js + HLS, AWS IVS' },
    { label: 'Payments', value: 'Stripe, Apple and Google subscriptions, gifting, promo codes' },
    { label: 'Services', value: 'Pusher, Firebase' },
    { label: 'Scale', value: '34 routes, 270+ components, 25 stores' },
  ],
  },
  'read-to-feed': {
    story: {
    product:
      "Read to Feed is a children's reading app for iOS and Android. Children read books, scan their own books by barcode, take quizzes as chat conversations, and earn badges and streaks for reading. Parents verify accounts by email. The store listings are now removed, so the store links go to archived copies of the public App Store and Google Play pages.",
    built:
      'The app has a PDF and EPUB reader with progress tracking, an ISBN barcode scanner that uses the camera, and gamification with badges, streaks, quizzes and coach marks. Push notifications with deep links feed a notification center, and the interface runs in three languages with i18next. Redux Toolkit holds the app state. Maintained forks of epubjs-react-native and react-native-pdf keep the reader working on current React Native.',
    result:
      'About 14 releases of Read to Feed went to the App Store and Google Play. Over those releases the app moved from React Native 0.63 to 0.81 through three major upgrades, and the interface ran in three languages. The store listings are now removed, so the store links open archived copies of both public pages. The maintained forks of epubjs-react-native and react-native-pdf are public on GitHub.',
  },
    facts: [
    { label: 'Role', value: 'Mobile, iOS and Android' },
    { label: 'Years', value: '2022–25' },
    { label: 'Platforms', value: 'iOS, Android' },
    { label: 'Languages', value: 'Three' },
    {
      label: 'Stack',
      value: 'React Native, React Navigation, Redux Toolkit, Firebase Messaging, Vision Camera, react-native-pdf, epub.js, Lottie, i18next',
    },
    { label: 'Releases', value: 'About 14, both stores' },
    { label: 'Upgrades', value: 'React Native 0.63 to 0.81, three major upgrades' },
  ],
  },
  'viva-fresh': {
    story: {
    product:
      'Viva Fresh is a grocery shopping and loyalty app for iOS and Android. Shoppers browse product categories, fill a cart, choose a delivery slot and check out. The app also has a loyalty programme and a wishlist for products to buy later. The interface is in Albanian, and the published store listings show the same app on iPhone and on Android.',
    built:
      'The app is built in React Native with Redux Toolkit and Firebase. It covers online grocery orders with delivery slots, the loyalty programme, a wishlist, and address search on a map for delivery. Category pages show product grids, and the cart keeps quantities, discounts and the running total in view. One codebase ships to the App Store and Google Play.',
    result:
      'Viva Fresh is live in the App Store and on Google Play, and both public listings are linked on this page. One React Native codebase ships the app to iPhone and Android. The released app takes online grocery orders with a delivery slot, runs the loyalty programme and the wishlist, and finds the delivery address with a search on a map.',
  },
    facts: [
    { label: 'Role', value: 'Mobile' },
    { label: 'Years', value: '2023' },
    { label: 'Platforms', value: 'iOS, Android' },
    { label: 'Languages', value: 'Albanian' },
    { label: 'Stack', value: 'React Native, Redux Toolkit, Maps, Firebase' },
    { label: 'Features', value: 'Delivery slots, loyalty, wishlist, address search on a map' },
  ],
  },
  'incentiv': {
    story: {
    product:
      "Incentiv's portal is a smart-wallet dashboard where people and businesses manage an on-chain wallet and incentive programs. Users sign in with a passkey or an external wallet, such as MetaMask or WalletConnect, then see balances, assets, gas saved and transactions in dashboard cards. The public website, the docs and the portal's sign-in screen are linked on this page, and the screenshots come from those public pages.",
    built:
      'The frontend is built on Next.js 14 with the App Router, TypeScript and RTK Query. It covers the passkey and wallet sign-in UI, animated onboarding with Framer Motion, dashboard cards, an asset list, a balance popup with a QR address, public and private route middleware, and English and French translations with next-intl. Styles use Tailwind. Teammates built the wallet and blockchain layer.',
    result:
      'The Incentiv portal is live at portal.incentiv.io, and its sign-in screen is public. The website at incentiv.io and the docs at docs.incentiv.io are live as well. The shipped UI layer runs in English and French, signs people in with a passkey or an external wallet, and keeps private routes behind sign-in through middleware. Teammates built the wallet and blockchain layer.',
  },
    facts: [
    { label: 'Role', value: 'Frontend, UI layer' },
    { label: 'Years', value: '2024' },
    { label: 'Platforms', value: 'Web' },
    { label: 'Languages', value: 'English, French' },
    {
      label: 'Stack',
      value: 'Next.js 14, React 18, TypeScript, Redux Toolkit + RTK Query, next-intl, Framer Motion, Tailwind, ApexCharts',
    },
    { label: 'Sign-in', value: 'Passkey, external wallet' },
  ],
  },
  'design-system-react': {
    story: {
      product:
        'Design System v2 is the shared base of controls and layout parts for the new React dashboard of a care-management platform. It is built from scratch on a framework-agnostic token spine. One source of design tokens in three tiers (core, semantic and component) generates CSS variables, TypeScript modules and a Figma bundle. Thirty-six components, from Button and Alert to Combobox, Datepicker and Toast, ship as a typed, versioned package.',
      built:
        'The work started with research: a benchmark of leading design systems, a large multi-agent audit of the old frontend, and studies on tokens, testing, governance and measurement, distilled into one best-practices guide. Decision records and an append-only lessons log keep the reasoning. AI agents work under written rules and reusable skills, fresh independent reviewers check each change, and executable gates apply the founding rule: every claim derives from one artifact, through a check that runs.',
      result:
        "Twenty releases shipped in about six weeks. Each component is built to WCAG 2.1 AA floors with automated, rendered evidence: axe tests and in-browser contrast checks, with negative controls that prove the checks can fail. Per-component builds cut a Button-only consumer's JavaScript by 96.6%. The new React dashboard uses the system across its screens through one adapter layer, and a gate keeps raw colours and native controls out. The dashboard is not in production yet.",
    },
    facts: [
      { label: 'Role', value: 'Design system' },
      { label: 'Years', value: '2026' },
      { label: 'Platforms', value: 'React component library, Storybook workshop' },
      { label: 'Tokens', value: '805 in three tiers: core, semantic, component' },
      { label: 'Components', value: '36, each with a story, unit tests and axe tests' },
      { label: 'Releases', value: '20 in about six weeks' },
      { label: 'Accessibility', value: 'Built to WCAG 2.1 AA floors with automated, rendered evidence' },
      { label: 'Method', value: 'Research corpus, decision records, lessons log, agent skills, independent reviewers' },
      { label: 'Stack', value: 'React 19, TypeScript, CSS Modules, Storybook 10, DTCG tokens, Style Dictionary, Playwright, axe, Changesets' },
    ],
  },
  'dukagjini-bookstore': {
    story: {
      product:
        'Dukagjini Bookstore is the shopping app of a book publisher, for iOS and Android. Readers search the catalogue, browse top categories and books on sale, keep favourite lists, and buy books with promo codes at checkout. The app is live in the App Store and on Google Play, and the screenshots on this page come from its public store listing.',
      built:
        'The app is built in React Native, with Redux for the app state and Firebase Messaging for push notifications. A notification opens the right screen through a deep link. The book-detail header animates as the page scrolls, and modals close with a swipe. Search, category lists, favourite lists and a checkout with promo codes complete the shopping flow on both platforms.',
      result:
        'Dukagjini Bookstore is live in the App Store and on Google Play, and both listings are linked on this page. One React Native codebase ships the app to iPhone and Android. Readers search books, browse categories and sales, keep favourites and check out with promo codes, and push notifications with deep links bring them back to a book.',
    },
    facts: [
      { label: 'Role', value: 'Mobile' },
      { label: 'Years', value: '2021–22' },
      { label: 'Platforms', value: 'iOS, Android' },
      { label: 'Stack', value: 'React Native, Redux, Firebase Messaging' },
      { label: 'Features', value: 'Search, categories, sales, favourite lists, promo-code checkout, push deep links' },
      { label: 'Motion', value: 'Animated book-detail header, swipe-to-close modals' },
    ],
  },
}
