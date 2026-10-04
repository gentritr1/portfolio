import { OldDraftMotion } from '../../components/portfolio/OldDraftMotion'
import { transitionOldDraft } from '../../components/portfolio/oldDraftTransition'
import { lazy, Suspense, useState } from 'react'
import { links } from '../../content/links'
import CanvasStage from './CanvasStage'
import './canvas.css'

const loadReadPage = () => import('./ReadPage')
const ReadPage = lazy(loadReadPage)

export default function Draft() {
  const [reading, setReading] = useState(false)
  const [destination, setDestination] = useState<string | null>(null)

  async function read(section = 'dc-read') {
    const target = reading ? document.getElementById(section) : null
    if (target) {
      target.tabIndex = -1
      target.focus({ preventScroll: true })
      target.scrollIntoView({ behavior: 'instant', block: 'start' })
      return
    }
    await loadReadPage()
    transitionOldDraft(() => { setDestination(section); setReading(true) })
  }
  function canvas() {
    transitionOldDraft(() => {
      setReading(false); setDestination(null)
      window.scrollTo(0, 0)
      requestAnimationFrame(() => document.querySelector<HTMLElement>('.draft-canvas .dc-viewport')?.focus({ preventScroll: true }))
    })
  }

  return (
    <div className="draft-canvas" data-mode={reading ? 'read' : 'canvas'}>
      <OldDraftMotion />
      <header className="dc-header">
        <a className="dc-brand" href="/drafts">Gentrit Rashiti<span>Canvas</span></a>
        <nav aria-label="Portfolio navigation">
          {reading ? <button type="button" onClick={canvas}>Return to canvas</button> : <button type="button" className="dc-read-button" onClick={() => read()}>Read as a page</button>}
          <button type="button" className="dc-header-about" onClick={() => read('dc-about')}>About & contact</button>
          <a href={links.cv} download>CV<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" /></svg></a>
        </nav>
      </header>
      {reading ? <Suspense fallback={<div className="dc-reading-loading"><h1>Read the work.</h1><p>The complete project index is opening.</p></div>}>
        <ReadPage destination={destination} onCanvas={canvas} />
      </Suspense> : <CanvasStage onRead={read} />}
    </div>
  )
}
