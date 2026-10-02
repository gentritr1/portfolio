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
      title="A subscription video‑learning platform with live streams"
      meta={['Streaming', 'Subscriptions', 'Web']}
      role="Lead frontend developer (top contributor)."
      story={[
        'A video-on-demand and live-streaming platform for a learning community, with courses, playlists, learning progress, a scripture reader, and a subscription business: web and in-app plans, gifting, promo codes and lifetime plans.',
        'I built the live page: low-latency live video with a realtime comment stream, pinned comments, moderation (mute, report), RSVP and reminders, and study materials next to the stream. For on-demand video I built the player with HLS quality selection, autoplay, episode sync, viewing history and a paywall for premium content.',
        'I owned the subscription flows: dynamic pricing from the API, Stripe checkout, Apple and Google Play subscriptions with cancellation surveys, gift subscriptions in three steps, promo-code activation, and the English/Arabic (RTL) interface.',
      ]}
      facts={[
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
