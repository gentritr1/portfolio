import { useState } from 'react'
import { Container } from '../Container'
import { StudioImage } from './StudioHero'
import { studioShots } from './studioShots'

interface Layer { title: string; stack: string; description: string }
export const systems: Record<string, { title: string; layers: Layer[] }> = {
  'care-platform': { title: 'One platform.\nSeparate organizations.', layers: [
    { title: 'The interface', stack: 'React 19 · TypeScript', description: 'Patient profiles, care plans, labs and vitals. A route-by-route move from Vue to React.' },
    { title: 'The boundaries', stack: 'TanStack Query · Zustand · Zod', description: 'Separate tenant data, roles and timezones, with parity tests across both frontends.' },
    { title: 'The backend', stack: 'Laravel · MySQL · Redis', description: 'Enrollment drafts, a lab catalog and multi-tenant security. One billing report reduced from 16 queries to 2.' },
  ] },
  'bayyinah-tv': { title: 'A live room,\nfrom screen to stream.', layers: [
    { title: 'The experience', stack: 'Nuxt 3 · Vue 3 · Pinia', description: 'A full rebuild in English and Arabic. The same web app runs inside the native mobile apps.' },
    { title: 'The live layer', stack: 'AWS IVS · HLS · Pusher', description: 'Adaptive video playback, realtime chat and moderation connect the player to the live room.' },
    { title: 'The membership', stack: 'Stripe · Apple · Google', description: 'Subscriptions, gifting and promo codes, with a paywall for premium content.' },
  ] },
  'read-to-feed': { title: 'More than\na page turn.', layers: [
    { title: 'The application', stack: 'React Native · Redux Toolkit', description: 'Reading progress, quizzes, badges and streaks across iOS and Android, in three languages.' },
    { title: 'The reader', stack: 'PDF · EPUB · epub.js', description: 'Two reading formats, with maintained reader forks and three major React Native upgrades.' },
    { title: 'The device', stack: 'Vision Camera · Firebase', description: 'ISBN barcode scanning, push notifications and deep links connect books with the reading app.' },
  ] },
  'viva-fresh': { title: 'The everyday shop,\nconnected.', layers: [
    { title: 'The shop', stack: 'React Native', description: 'Grocery shopping, loyalty and a wishlist in one mobile application.' },
    { title: 'The order', stack: 'Redux Toolkit', description: 'Online grocery orders with delivery slots, from product selection to checkout.' },
    { title: 'The delivery', stack: 'Maps · Firebase', description: 'Address search on a map connects an order to its delivery location.' },
  ] },
  'dukagjini-bookstore': { title: 'A bookshop\nin the pocket.', layers: [
    { title: 'The shop', stack: 'React Native · Redux', description: 'Search, top categories, books on sale and favourite lists, on iOS and Android.' },
    { title: 'The order', stack: 'Checkout · Promo codes', description: 'A checkout with promo codes completes the shopping flow on both platforms.' },
    { title: 'The return', stack: 'Firebase Messaging · Deep links', description: 'Push notifications open the right screen. An animated book header and swipe-to-close modals finish the details.' },
  ] },
  incentiv: { title: 'A clear view\nof a smart wallet.', layers: [
    { title: 'The interface', stack: 'Next.js 14 · TypeScript', description: 'Dashboard cards, assets and a balance popup with a QR address.' },
    { title: 'The data', stack: 'RTK Query · next-intl', description: 'A typed frontend with English and French translations. The wallet and blockchain layer was built by teammates.' },
    { title: 'The access', stack: 'Passkeys · Route middleware', description: 'Passkey and external-wallet sign-in, animated onboarding and protected routes.' },
  ] },
}

export function TechnicalDiagram({ slug }: { slug: string }) {
  const [active, setActive] = useState(0)
  const system = systems[slug]
  const composition = studioShots[slug]
  if (!system || !composition) return null
  return (
    <section id="technical-story" aria-labelledby="technical-title" className="technical-story">
      <Container>
        <div className="technical-heading"><h2 id="technical-title">{system.title.split('\n').map((line, index) => <span key={line}>{index > 0 && <br />}{line}</span>)}</h2><p>The system behind the screen</p></div>
        <div className="technical-layout">
          <div className="technical-diagram" aria-hidden data-selected={active} data-device={composition.device}>
            <div className="technical-assembly">
              {[2, 1, 0].map(index => <div key={index} className="technical-layer" data-layer={index} data-active={active === index}>
                {index === 0 ? <div className="technical-screen"><StudioImage shot={composition.shots[0]} /></div> : <span className="technical-layer-stack">{system.layers[index].stack}</span>}
                <span className="technical-layer-number">0{index + 1}</span>
              </div>)}
            </div>
          </div>
          <ol className="technical-notes">
            {system.layers.map((layer, index) => <li key={layer.title}>
              <button type="button" aria-pressed={active === index} onClick={() => setActive(index)} className="technical-note">
                <span className="technical-note-number">0{index + 1}</span>
                <span><span className="technical-note-title">{layer.title}</span><span className="technical-note-stack">{layer.stack}</span><span className="technical-note-body">{layer.description}</span></span>
              </button>
            </li>)}
          </ol>
        </div>
      </Container>
    </section>
  )
}
