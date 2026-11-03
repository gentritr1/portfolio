import { ArrowRightIcon } from '@phosphor-icons/react'
import { channels, type ChannelKey } from '../content/channels'
import { ARROW } from "./data"
import { cases } from "./products"
import { STAGE } from "./sceneSupport"
import { FocusHero, type FocusItem } from "./FocusHero"

/**
 * The four screens the hero pulls into focus, one at a time (owner chose the focus pull over the exploded Offday stack,
 * 2026-11-03). Three areas from the audience line, then Offday, the own product the stack used to show.
 */
const SCREENS: { slug: string; key?: ChannelKey; area?: string; years?: string; img: FocusItem['img']; pos?: string }[] = [
  { slug: 'care-platform', key: 'healthcare', img: ['/eh/care-platform.webp', 1280, 800] },
  { slug: 'bayyinah-tv', key: 'streaming', img: ['/eh/bayyinah-tv.webp', 1280, 800] },
  // The store image opens on a banner; 42% down is the app itself (logo, My Books, the reading cards).
  { slug: 'read-to-feed', key: 'reading', img: ['/mobile/reading-1.webp', 780, 1689], pos: '50% 42%' },
  { slug: 'offday', area: 'Own product', years: '2026', img: ['/showcase/offday/offday-desktop-calendar.webp', 2880, 1800] },
]
const ITEMS: FocusItem[] = SCREENS.map((s) => {
  const name = cases.find((c) => c.slug === s.slug)?.name ?? s.slug
  return {
    slug: s.slug, name, img: s.img, pos: s.pos, alt: `${name}, a real screen`,
    area: s.area ?? (s.key ? channels[s.key].label : ''),
    years: s.years ?? (s.key ? channels[s.key].period : null),
  }
})

/** The claim and who it is for on the left, the focus pull on the right. The words are readable before the field loads. */
export function HomeIntro({ onOpen, reduced, onPulse }: {
  reduced: boolean; onPulse?(x: number, y: number): void
  onOpen(slug: string, trigger: HTMLAnchorElement, keyboard: boolean): void
}) {
  return (
    <>
    <header id="re-top" className="re-intro" data-stage={STAGE.hero}>
      {/* The headline runs across the whole hero, one sentence per line; the role, lines and screen share the row below. */}
      <h1 className="re-intro-title re-solid" tabIndex={-1}><span>Web and mobile products.</span>{' '}<span>From the first screen to release.</span></h1>
      <div className="re-intro-copy re-solid">
        <p className="re-intro-role">Software engineer: frontend, backend and mobile</p>
        <p className="re-intro-bio">5+ years shipping web and mobile products.<br />Mostly for healthcare teams, learning platforms and consumer apps.<br />Based in Kosovo, working remotely.</p>
        <div className="re-intro-links">
          <a className="re-text-link" href="#re-results">Results <ArrowRightIcon {...ARROW} /></a>
          <a className="re-text-link" href="#re-about">How I work <ArrowRightIcon {...ARROW} /></a>
        </div>
      </div>
      <FocusHero items={ITEMS} reduced={reduced} onPulse={onPulse} onOpen={(slug, a) => onOpen(slug, a, false)} note="Real product screens, invented data." />
    </header>

    <nav className="re-evidence re-solid" aria-label="Across the stack">
      <ul>
        <li><a href="#work-care">Care platform <ArrowRightIcon {...ARROW} /></a><p>Web + backend · care workflows, permissions</p></li>
        <li><a href="#work-bayyinah">Bayyinah TV <ArrowRightIcon {...ARROW} /></a><p>Frontend · streaming, English + Arabic</p></li>
        <li><a href="#re-backend">Tondo + LeakScan <ArrowRightIcon {...ARROW} /></a><p>Backend · realtime servers, scan jobs</p></li>
        <li><a href="#work-reading">Read to Feed <ArrowRightIcon {...ARROW} /></a><p>Mobile · about 14 store releases</p></li>
      </ul>
    </nav>
    </>
  )
}
