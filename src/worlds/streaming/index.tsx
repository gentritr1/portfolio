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
      role="Frontend developer on the core team"
      story={[
        'A video-on-demand and live-streaming platform for a learning community, with courses, playlists, learning progress, a scripture reader, and a subscription business: web and in-app plans, gifting, promo codes and lifetime plans. Its second version started in September 2023 from an empty Nuxt 3 template: localization, environment configuration and the API layer came first, then the product. The new web app replaced the earlier one and also runs inside the native mobile app.',
        'The live page has low-latency video with a realtime comment stream, pinned comments, moderation (mute, report), RSVP and reminders, and study materials next to the stream. The on-demand player has HLS quality selection, autoplay, episode sync, viewing history and a paywall for premium content.',
        'The subscription flows cover dynamic pricing from the API, Stripe checkout, Apple and Google Play subscriptions with cancellation surveys, three-step gift subscriptions, promo-code activation, and an English/Arabic right-to-left interface.',
      ]}
      facts={[
        'Full rebuild on Nuxt 3, from an empty template to production',
        'Live streaming with realtime chat, pinned comments and moderation',
        'HLS player with quality selector and premium paywall',
        'Stripe + Apple + Google Play subscriptions, gifting, promo codes',
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
