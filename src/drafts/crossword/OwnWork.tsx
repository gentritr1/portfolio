import type { CrosswordWord } from './crossword'
import { clues, nameOf, ownOrder, projectOf } from './clues'

interface Box { x: number; y: number; w: number; h: number }
interface Shot { src: string; alt: string; width: number; height: number; crop: Box; caption: string }

const shots: Record<string, { wide: Shot; narrow?: Shot }> = {
  offday: {
    wide: { src: '/personal/shots/offday-light-calendar-desktop.webp', alt: 'Offday team calendar for October 2026: who is out today, three requests waiting, leave bars and the approval queue', width: 2880, height: 1800, crop: { x: 0, y: 0, w: 2880, h: 1240 }, caption: 'Team calendar, light theme.' },
    narrow: { src: '/personal/shots/offday-light-calendar-phone.webp', alt: 'Offday team calendar on a phone, with the request button and October leave bars', width: 780, height: 1688, crop: { x: 0, y: 0, w: 780, h: 1120 }, caption: 'Team calendar on a phone.' },
  },
  offbeat: {
    wide: { src: '/personal/shots/offbeat-studio-desktop.webp', alt: 'OFFBEAT sound studio while it plays: kick, snare, hi-hat and bass rows over eight steps, step five lit, tempo, volume and a swing dial', width: 2880, height: 1800, crop: { x: 1230, y: 110, w: 1480, h: 1400 }, caption: 'Sound studio. The drum machine plays.' },
  },
  form: {
    wide: { src: '/personal/shots/form-home-desktop.webp', alt: 'FORM: a copper trefoil knot rendered live, with copper, chrome and porcelain swatches and the note Drag to turn', width: 2880, height: 1800, crop: { x: 1460, y: 300, w: 1400, h: 1460 }, caption: 'The copper trefoil. Drag to turn it.' },
  },
}

function Crop({ shot, className }: { shot: Shot; className?: string }) {
  const { crop } = shot
  return <figure className={'fk-crop ' + (className ?? '')}>
    <div style={{ aspectRatio: crop.w + ' / ' + crop.h, maxWidth: crop.w / 2 }}>
      <img src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} loading="lazy" decoding="async" style={{ width: shot.width / crop.w * 100 + '%', left: -crop.x / crop.w * 100 + '%', top: -crop.y / crop.h * 100 + '%' }} />
    </div>
    <figcaption>{shot.caption}</figcaption>
  </figure>
}

function Arrow() {
  return <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 12h15M12 5l7 7-7 7" /></svg>
}

export function OwnWork({ words, onFind }: { words: Map<string, CrosswordWord>; onFind: (slug: string) => void }) {
  return <section className="fk-own" aria-labelledby="fk-own-title">
    <div className="fk-own-head">
      <h2 id="fk-own-title">Own projects</h2>
      <p>Three answers in the grid, built on his own time.</p>
    </div>
    <div className="fk-own-grid">
      {ownOrder.map(slug => {
        const word = words.get(slug)!
        const clue = clues[slug]
        const project = projectOf(slug)
        const shot = shots[slug]
        return <article key={slug} id={'fk-own-' + slug} className="fk-own-item" data-slug={slug} aria-labelledby={'fk-own-title-' + slug}>
          <header>
            <p className="fk-own-word" aria-hidden="true"><span className="fk-num">{word.number}</span>{Array.from(word.answer).map((letter, index) => <i key={index}>{letter}</i>)}</p>
            <h3 id={'fk-own-title-' + slug} className="fk-sr">{nameOf(slug)}</h3>
            <p className="fk-own-result">{clue.result}</p>
            <p className="fk-own-meta">{clue.concept ?? 'Own product'} · {project.years}</p>
            <p className="fk-own-scope">{clue.scope}</p>
            <div className="fk-own-links">
              <button type="button" onClick={() => onFind(slug)}>Find it in the grid<span className="fk-sr">: {word.number} {word.direction}</span></button>
              {project.links.map(link => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label}<span className="fk-sr"> for {project.name}</span><Arrow /></a>)}
            </div>
          </header>
          <Crop shot={shot.wide} className={shot.narrow ? 'fk-crop-wide' : undefined} />
          {shot.narrow && <Crop shot={shot.narrow} className="fk-crop-narrow" />}
        </article>
      })}
    </div>
  </section>
}
