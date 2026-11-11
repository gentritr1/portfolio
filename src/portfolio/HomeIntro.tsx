import { ArrowRightIcon } from '@phosphor-icons/react'
import { channels, type ChannelKey } from '../content/channels'
import { ARROW } from "./data"
import { cases } from "./products"
import { STAGE } from "./sceneSupport"
import { FocusHero, type FocusItem } from "./FocusHero"

/**
 * The four screens the hero pulls into focus, one at a time (owner chose the focus pull over the exploded Offday stack,
 * 2026-11-03). Three areas from the audience line, then Offday, the own product the stack used to show.
 * Each is an art-directed crop of a real 2x capture in public/, cut at these rects (the capture's CSS px, 2 image px each) into public/hero/:
 * wide crops are shown at 0.6+ of their CSS size at 1440, narrow ones at 0.8+ at 390, never above their own pixels at 2x.
 * The script that cuts them (and builds Read to Feed's three-screen strip) is design/reviews/senior-polish/hero/crops.py.
 */
const SCREENS: { slug: string; key?: ChannelKey; area?: string; years?: string; source: string; wide: FocusItem['wide']['rect']; narrow: FocusItem['narrow']['rect']; wideAlt?: string; narrowAlt?: string }[] = [
  // Narrow: Mon–Tue between gridlines, 11:00 AM to 1:30 PM: five whole events and the current-time line, no day headers
  // (coordinator call: legibility over the header). Two columns at 4:3 fill the phone window at scale 1.10, density 1.82,
  // the one crop under 2x (named in focus-hero.json): gridline edges allow only this or side bands or scale 0.73.
  { slug: 'care-platform', key: 'healthcare', source: '/showcase/care-dashboard/appointments-week.webp', wide: [236, 40, 1196, 748], narrow: [471, 539, 320, 240] },
  // The cards row scrolls sideways in the product, so a card cut by the right edge is the product's own overflow.
  { slug: 'bayyinah-tv', key: 'streaming', source: '/showcase/bayyinah/web-02.webp', wide: [70, 230, 1040, 650], narrow: [100, 520, 420, 315] },
  // Inside the phone's display only: no store banner, no bezel. Wide is a strip of three displays (reader, My Books,
  // achievements) cut from reading-3, -1 and -2 and set on the figure's ground; its rect is the strip's own size. Narrow is
  // My Books at full height, the ground at its sides.
  { slug: 'read-to-feed', key: 'reading', source: '/mobile/reading-1.webp', wide: [0, 0, 1046, 654], narrow: [42, 265, 306, 264],
    wideAlt: 'Read to Feed: the reader page with its keep-reading prompt, My Books with reading progress, and achievements with eggs, badges and quizzes',
    narrowAlt: 'Read to Feed My Books: reading progress for The Tale of Peter the Rabbit' },
  // Narrow: Tue–Thu between gridlines, four leave bars.
  { slug: 'offday', area: 'Own product', years: '2026', source: '/showcase/offday/offday-desktop-calendar.webp', wide: [0, 0, 1120, 700], narrow: [388, 384, 364, 273] },
]
const ITEMS: FocusItem[] = SCREENS.map((s) => {
  const name = cases.find((c) => c.slug === s.slug)?.name ?? s.slug
  return {
    slug: s.slug, name, alt: `${name}, a real screen`, source: s.source,
    wide: { src: `/hero/${s.slug}-wide.webp`, rect: s.wide, alt: s.wideAlt }, narrow: { src: `/hero/${s.slug}-narrow.webp`, rect: s.narrow, alt: s.narrowAlt },
    area: s.area ?? (s.key ? channels[s.key].label : ''),
    years: s.years ?? (s.key ? channels[s.key].period : null),
  }
})

// The four proof links. The last word and its arrow never part (a wrapped "Tondo + LeakScan" left the arrow on its own).
const EVIDENCE: [href: string, label: string, line: string][] = [
  ['#work-care', 'Care platform', 'Web + backend · care workflows, permissions'],
  ['#work-bayyinah', 'Bayyinah TV', 'Frontend · streaming, English + Arabic'],
  ['#re-backend', 'Tondo + LeakScan', 'Backend · realtime servers, scan jobs'],
  ['#work-reading', 'Read to Feed', 'Mobile · about 14 store releases'],
]
function EvidenceIndex({ inCopy }: { inCopy?: boolean }) {
  return (
    <nav className="re-evidence re-solid" data-in={inCopy ? 'copy' : undefined} aria-label="Across the stack">
      <ul>
        {EVIDENCE.map(([href, label, line]) => {
          const cut = label.lastIndexOf(' ')
          return <li key={href}><a className="re-link-secondary" href={href}>{label.slice(0, cut + 1)}<span className="re-nowrap">{label.slice(cut + 1)} <ArrowRightIcon {...ARROW} /></span></a><p>{line}</p></li>
        })}
      </ul>
    </nav>
  )
}

/** The claim and who it is for on the left, the focus pull on the right. The words are readable before the field loads. */
export function HomeIntro({ onOpen, reduced, onPulse }: {
  reduced: boolean; onPulse?(x: number, y: number): void
  onOpen(slug: string, trigger: HTMLAnchorElement, keyboard: boolean): void
}) {
  // Default: the proof sits in the left column under the links, so who, what and the linked work share one block beside the
  // screen. `?hero=split` keeps it as a full-width row under the hero, with the links on the screen's bottom edge.
  const split = new URLSearchParams(location.search).get('hero') === 'split'
  return (
    <>
    <header id="re-top" className="re-intro" data-stage={STAGE.hero} data-layout={split ? 'split' : undefined}>
      {/* The headline runs across the whole hero, one sentence per line; the role, lines and screen share the row below. */}
      <h1 className="re-intro-title re-solid" tabIndex={-1}><span>Web and mobile products.</span>{' '}<span>From the first screen to release.</span></h1>
      {/* The screen comes before the words in the DOM, so focus follows the phone's visual order (headline, screen, tabs, words). */}
      <FocusHero items={ITEMS} reduced={reduced} onPulse={onPulse} onOpen={(slug, a) => onOpen(slug, a, false)} note="Real product screens, invented data." />
      <div className="re-intro-copy re-solid">
        <div className="re-intro-who">
          <p className="re-intro-role">Software engineer: frontend, backend and mobile</p>
          <p className="re-intro-bio">5+ years shipping web and mobile products.<br />Mostly for healthcare teams, learning platforms and consumer apps.<br />Based in Kosovo, open to hybrid or remote work.</p>
          <div className="re-intro-links">
            <a className="re-text-link" href="#re-results">Results <ArrowRightIcon {...ARROW} /></a>
            <a className="re-text-link" href="#re-about">How I work <ArrowRightIcon {...ARROW} /></a>
          </div>
        </div>
        {!split && <EvidenceIndex inCopy />}
      </div>
    </header>
    {split && <EvidenceIndex />}
    </>
  )
}
