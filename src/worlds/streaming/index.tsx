import { Reveal, RevealGroup, RevealItem } from '../../components/Reveal'
import { World } from '../../components/World'
import { Recreation } from './Recreation'

const publicPages = [
  {
    src: '/streaming/public-01.webp',
    width: 1440,
    height: 900,
    alt: 'Landing page of the video-learning platform, brand covered',
    caption: 'Landing page',
  },
  {
    src: '/streaming/public-02.webp',
    width: 1272,
    height: 795,
    alt: 'Arabic library page of the video-learning platform, brand covered',
    caption: 'Library',
  },
  {
    src: '/streaming/public-03.webp',
    width: 1272,
    height: 795,
    alt: 'Stories page of the video-learning platform: category tabs, a search field and a row of story courses',
    caption: 'Stories',
  },
]

function PublicPages() {
  return (
    <div className="border-t border-line pt-5">
      <Reveal as="p" className="font-mono text-meta text-muted">
        Public pages of the live site, brand covered
      </Reveal>
      <RevealGroup
        as="ul"
        className="-mx-gutter mt-4 flex snap-x snap-mandatory scroll-px-gutter gap-3 overflow-x-auto px-gutter pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0 md:pb-0"
      >
        {publicPages.map((page) => (
          <RevealItem as="li" key={page.src} className="w-[82%] shrink-0 snap-start md:w-auto">
            <figure>
              <div className="overflow-hidden rounded-chip border border-line bg-surface">
                <img
                  src={page.src}
                  width={page.width}
                  height={page.height}
                  alt={page.alt}
                  loading="lazy"
                  decoding="async"
                  className="block h-auto w-full"
                />
              </div>
              <figcaption className="mt-2 px-0.5 font-mono text-meta text-muted">{page.caption}</figcaption>
            </figure>
          </RevealItem>
        ))}
      </RevealGroup>
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
      after={<PublicPages />}
    />
  )
}
