import { Showcase, type ShowcaseItem } from '../../components/Showcase'
import { World } from '../../components/World'
import { Recreation } from './Recreation'

const web = (n: number, alt: string, caption: string): ShowcaseItem => ({
  src: `/showcase/bayyinah/web-0${n}.webp`,
  width: 1440,
  height: 900,
  alt,
  caption,
})

const store = (n: number, alt: string, caption: string): ShowcaseItem => ({
  src: `/showcase/bayyinah/store-0${n}.webp`,
  width: 778,
  height: 1690,
  alt,
  caption,
})

const org = (n: number, alt: string, caption: string): ShowcaseItem => ({
  src: `/showcase/bayyinah/org-0${n}.webp`,
  width: 1440,
  height: 900,
  alt,
  caption,
})

const websitePages = [
  web(1, 'Bayyinah TV landing page: "Quran Studies Made Simple" hero with the app on a laptop, a monitor and phones', 'Landing page'),
  web(2, 'Bayyinah TV library, Subject tab: library tabs, search, filters and a row of course cards', 'Library: Subject'),
  web(3, 'Bayyinah TV library, Arabic tab: beginner courses and the flagship Arabic program', 'Library: Arabic'),
  web(4, 'Bayyinah TV library, Stories tab: filters by prophet and a row of story courses', 'Library: Stories'),
  web(5, 'Bayyinah TV series page: episode list in a side column, series summary and video cards', 'Series page'),
  web(6, 'Bayyinah TV pricing: "Choose Your Plan" with a monthly and annual switch and the Premium plan at $11 a month', 'Pricing'),
]

const appFrames = [
  store(1, 'App Store frame: "Quran Studies Made Simple" with the Bayyinah TV home screen on an iPhone', 'Home'),
  store(2, 'App Store frame: "Study the Quran Surah by Surah" with the surah list and the video player', 'Surah by surah'),
  store(3, 'App Store frame: "Study the Quran Subject by Subject" with subject course cards', 'Subject by subject'),
  store(4, 'App Store frame: "Study Quranic Arabic Step by Step" with the Arabic courses', 'Arabic'),
  store(5, 'App Store frame: "Pick Up Anytime" with the My Learning progress dashboard', 'My Learning'),
  store(6, 'App Store frame: "Learn Your Way" with the audio and video player on two iPhones', 'Audio and video'),
]

const institutePages: ShowcaseItem[] = [
  org(1, 'Bayyinah Foundation home: "Help Us Spread Quranic Knowledge" hero with a Join the Mission button and store badges', 'Home'),
  org(2, 'Bayyinah Foundation "Why Support" section: three reasons with line icons', 'Why support'),
  org(3, 'Bayyinah Foundation "Research Funding Opportunities" section with three photos', 'Research funding'),
  org(4, 'Bayyinah Foundation impact banner: "Together, we can empower individuals" over a city photo', 'Your impact'),
  org(5, 'Bayyinah Foundation frequently asked questions: six collapsed questions about donations', 'FAQ'),
  {
    src: '/showcase/bayyinah/org-phone.webp',
    width: 780,
    height: 1688,
    alt: 'Bayyinah Foundation home on a phone: the hero, the Join the Mission button and the store badges',
    caption: 'Home on a phone',
  },
]

function Showcases() {
  return (
    <div className="flex flex-col gap-12 lg:gap-14">
      <Showcase
        title="Website"
        aspect="web"
        links={[{ label: 'Website', href: 'https://bayyinahtv.com/' }]}
        items={websitePages}
      />
      <Showcase
        title="Mobile app"
        aspect="phone"
        links={[
          { label: 'App Store', href: 'https://apps.apple.com/us/app/bayyinah-tv/id1530635769' },
          { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.zombiesoup.bayyinah' },
        ]}
        items={appFrames}
      />
      <Showcase
        title="Institute website"
        aspect="web"
        links={[{ label: 'Website', href: 'https://bayyinah.org/' }]}
        items={institutePages}
      />
    </div>
  )
}

export function StreamingWorld() {
  return (
    <World
      world="streaming"
      layout="stage-wide"
      stageAspect="43 / 20"
      stageAspectTablet="1 / 1"
      stageAspectMobile="3 / 4"
      title="A video‑learning platform, rebuilt from scratch with live streams"
      meta={['Streaming', 'Subscriptions', 'Web']}
      role="Frontend, core team"
      story={[
        'A video-learning platform for an online community: courses, playlists, learning progress, a scripture reader, on-demand video and live streams. Members pay through web and in-app subscriptions, gifts and promo codes. The same web app also runs inside the native mobile app.',
        'Its second version was a full rebuild on Nuxt 3, from an empty template. It added live streaming with realtime chat and moderation, an HLS player with a paywall for premium content, Stripe, Apple and Google subscriptions, gifting, and an English/Arabic interface with right-to-left layout. The rebuild covers 34 routes and 270+ components.',
      ]}
      facts={[
        'Full rebuild on Nuxt 3',
        'Live streaming with realtime chat and moderation',
        'HLS player with quality selector and premium paywall',
        'Stripe, Apple and Google subscriptions, gifting, promo codes',
        '34 routes, 270+ components, 25 stores',
        'English and Arabic, right-to-left layout',
        'Same web app runs inside the native mobile app',
      ]}
      stack={['Nuxt 3, Vue 3, TypeScript, Pinia, video.js + HLS, AWS IVS, Pusher, Stripe, Firebase, Tailwind']}
      recreationName="Live room"
      recreation={<Recreation />}
      after={<Showcases />}
    />
  )
}
