import { World } from '../../components/World'
import { Recreation } from './Recreation'

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
    />
  )
}
