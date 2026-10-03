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
      'The frontend moves from Vue (Nuxt 2) to React one route at a time: patient profile, care plans, labs and vitals, claims and calls. Parity tests run each scenario against both apps, and 31 architecture decision records and CI quality gates keep the rewrite consistent. The React app uses TanStack Query and Router, Zustand and Zod. The Laravel API gained enrollment drafts, a lab catalog and multi-tenant security fixes.',
    result:
      'The rewrite replaces the Vue app one route at a time, and a route moves over after its parity tests show the same behaviour in both apps. On the API side, one billing report went from 16 queries to 2 and no longer times out. New screens use a React design system of 34 accessible components that meet WCAG 2.1 AA, published as a typed package on GitHub Packages.',
  },
    facts: [
    { label: 'Role', value: 'Frontend and mobile, full stack since 2026' },
    { label: 'Years', value: '2023–26' },
    { label: 'Platforms', value: 'Web app, Laravel API' },
    { label: 'Languages', value: 'English, German, Spanish, Turkish' },
    { label: 'Frontend', value: 'React 19, TypeScript, TanStack Query/Router, Zustand, Zod, Tailwind, Vitest, Playwright' },
    { label: 'Backend', value: 'Laravel 13, PHP 8.3, MySQL, Redis, Pest' },
    { label: 'Services', value: 'Twilio, Chime, Pusher, ECharts' },
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
}
