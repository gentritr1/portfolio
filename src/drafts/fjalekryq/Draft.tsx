import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { CareFile } from './CareFile'
import { dur, ease, spring } from './motion'
import { flushSync } from 'react-dom'
import { projects } from '../../content/projects'
import { links } from '../../content/links'
import { crosswordCells, crosswordColumns, crosswordRows, crosswordWords } from './crossword'
import { createLetterPhysics } from './letterPhysics'
import './fjalekryq.css'

const cellSize = 34
const boardWidth = crosswordColumns * cellSize
const boardHeight = crosswordRows * cellSize
const allAnswers = crosswordWords.map(word => word.slug)
const wordBySlug = new Map(crosswordWords.map(word => [word.slug, word]))
const projectBySlug = new Map(projects.map(project => [project.slug, project]))
const featuredClues = ['bayyinah-tv', 'read-to-feed', 'morse-trainer']
const specificClues: Record<string, string> = {
  fjale: 'A daily Albanian word game. A 21k-word dictionary, an archive, and play that works offline.',
  'bayyinah-tv': 'A video-learning platform rebuilt across 34 routes. English, Arabic, and live streams.',
  'read-to-feed': 'Books, a barcode scanner, and about 14 releases. React Native, from 0.63 to 0.81.',
  'care-platform': 'A Vue-to-React migration, route by route. Parity tests and 31 architecture decisions.',
  'care-api': 'A multi-tenant Laravel API. One billing report went from 16 queries to 2.',
  'morse-trainer': 'Learn the rhythm of Morse with spaced repetition and Farnsworth timing.',
}
const answerKey = (value: string) => value.toLocaleUpperCase().replace(/Ë/g, 'E').replace(/[^A-Z]/g, '')
const cleanAnswer = (value: string) => value.toLocaleUpperCase().replace(/[^A-ZË]/g, '')
const clueFor = (slug: string) => specificClues[slug] ?? projectBySlug.get(slug)!.line

interface Camera { x: number; y: number; scale: number }
interface Gesture { x: number; y: number; distance: number; camera: Camera }

function constrainCamera(camera: Camera, width: number, height: number): Camera {
  const scaledWidth = boardWidth * camera.scale
  const scaledHeight = boardHeight * camera.scale
  return {
    ...camera,
    x: scaledWidth <= width ? (width - scaledWidth) / 2 : Math.min(0, Math.max(width - scaledWidth, camera.x)),
    y: scaledHeight <= height ? (height - scaledHeight) / 2 : Math.min(0, Math.max(height - scaledHeight, camera.y)),
  }
}

function Arrow({ back = false }: { back?: boolean }) {
  return <svg viewBox="0 0 24 24" width="23" height="23" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" style={back ? { transform: 'rotate(180deg)' } : undefined}><path d="M4 12h15M12 5l7 7-7 7" /></svg>
}

export default function Draft() {
  const [active, setActive] = useState('fjale')
  const [solving, setSolving] = useState(false)
  const [solved, setSolved] = useState(() => new Set(allAnswers))
  const [answer, setAnswer] = useState('')
  const [message, setMessage] = useState('Select a word or read a clue. Every answer opens a project.')
  const [caseOpen, setCaseOpen] = useState(false)
  const [completed, setCompleted] = useState('')
  const [query, setQuery] = useState('')
  const [cvRequested, setCvRequested] = useState(false)
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, scale: .65 })
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const viewport = useRef<HTMLDivElement>(null)
  const board = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const physics = useRef<ReturnType<typeof createLetterPhysics> | null>(null)
  const completionTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cameraRef = useRef(camera)
  const activeRef = useRef(active)
  const fitScale = useRef(.65)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const gesture = useRef<Gesture | null>(null)
  const suppressClick = useRef(0)
  const cameraFrame = useRef(0)
  const dragSample = useRef({ x: 0, y: 0, time: 0, vx: 0, vy: 0 })
  const word = wordBySlug.get(active)!
  const project = projectBySlug.get(active)!
  const galleryImage = active === 'care-platform'
    ? { src: '/signal-posters/healthcare.avif', alt: 'Care-management interface recreation with invented data' }
    : project.media.galleries?.[0]?.items[0] ?? project.media.shot
  const visibleWords = crosswordWords.filter(item => {
    const itemProject = projectBySlug.get(item.slug)!
    return (itemProject.name + ' ' + clueFor(item.slug) + ' ' + item.answer).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
  })

  useEffect(() => { activeRef.current = active }, [active])

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => setReduced(preference.matches)
    preference.addEventListener('change', change)
    return () => preference.removeEventListener('change', change)
  }, [])

  useEffect(() => {
    if (!viewport.current || !board.current) return
    const node = viewport.current
    const letters = createLetterPhysics(node)
    physics.current = letters
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(cameraFrame.current)
      const width = node.clientWidth
      const height = node.clientHeight
      fitScale.current = Math.min(width / boardWidth, height / boardHeight)
      const scale = width < 600 ? Math.max(fitScale.current, .7) : fitScale.current
      const selected = wordBySlug.get(activeRef.current)!
      const cx = (selected.col + (selected.direction === 'across' ? selected.answer.length / 2 : .5)) * cellSize
      const cy = (selected.row + (selected.direction === 'down' ? selected.answer.length / 2 : .5)) * cellSize
      const fitted = constrainCamera({ scale, x: width / 2 - cx * scale, y: height / 2 - cy * scale }, width, height)
      cameraRef.current = fitted
      setCamera(fitted)
    })
    observer.observe(node)
    const arrival = requestAnimationFrame(() => {
      board.current?.querySelectorAll<HTMLElement>('[data-letter]').forEach((letter, index) => {
        letters.drop(letter, (index % 17) * 13, 15 + (index % 4) * 4)
      })
    })
    return () => {
      cancelAnimationFrame(arrival)
      cancelAnimationFrame(cameraFrame.current)
      observer.disconnect()
      letters.dispose()
      physics.current = null
      if (completionTimer.current) clearTimeout(completionTimer.current)
    }
  }, [])

  function moveCamera(next: Camera) {
    cameraRef.current = next
    setCamera(next)
  }

  function settleCamera(target: Camera, velocity = { x: 0, y: 0 }) {
    cancelAnimationFrame(cameraFrame.current)
    if (reduced) { moveCamera(target); return }
    let previous = 0
    let vx = velocity.x
    let vy = velocity.y
    // Preserve release velocity; the spring converges on the predicted cell edge.
    function step(time: number) {
      const dt = previous ? Math.min((time - previous) / 1000, .024) : 1 / 60
      previous = time
      const current = cameraRef.current
      vx += (spring.ui.stiffness * (target.x - current.x) - spring.ui.damping * vx) * dt
      vy += (spring.ui.stiffness * (target.y - current.y) - spring.ui.damping * vy) * dt
      const node = viewport.current
      if (!node) return
      moveCamera(constrainCamera({ scale: target.scale, x: current.x + vx * dt, y: current.y + vy * dt }, node.clientWidth, node.clientHeight))
      if (Math.abs(target.x - cameraRef.current.x) + Math.abs(target.y - cameraRef.current.y) < .2 && Math.abs(vx) + Math.abs(vy) < 2) moveCamera(target)
      else cameraFrame.current = requestAnimationFrame(step)
    }
    cameraFrame.current = requestAnimationFrame(step)
  }

  function centerWord(slug: string) {
    const node = viewport.current
    if (!node) return
    const selected = wordBySlug.get(slug)!
    const current = cameraRef.current
    const cx = (selected.col + (selected.direction === 'across' ? selected.answer.length / 2 : .5)) * cellSize
    const cy = (selected.row + (selected.direction === 'down' ? selected.answer.length / 2 : .5)) * cellSize
    settleCamera(constrainCamera({ ...current, x: node.clientWidth / 2 - cx * current.scale, y: node.clientHeight / 2 - cy * current.scale }, node.clientWidth, node.clientHeight))
  }

  function selectWord(slug: string) {
    if (completionTimer.current) clearTimeout(completionTimer.current)
    setActive(slug)
    setAnswer('')
    setCompleted('')
    setCaseOpen(false)
    centerWord(slug)
    const selected = wordBySlug.get(slug)!
    setMessage('Clue ' + selected.number + ' ' + selected.direction + '. ' + clueFor(slug))
  }

  function transitionCase(slug: string, open: boolean) {
    const update = () => {
      setActive(slug)
      setCaseOpen(open)
    }
    if (!reduced && typeof document.startViewTransition === 'function') {
      document.startViewTransition(() => flushSync(update))
    } else update()
  }

  function openCase(slug = active, scroll = false) {
    centerWord(slug)
    transitionCase(slug, true)
    if (scroll || matchMedia('(max-width: 760px)').matches) requestAnimationFrame(() => panel.current?.scrollIntoView({ block: 'start', behavior: reduced ? 'instant' : 'smooth' }))
  }

  function completeWord(slug: string) {
    setSolved(current => new Set([...current, slug]))
    setCompleted(slug)
    setMessage(projectBySlug.get(slug)!.name + ' solved. Opening the project.')
    if (completionTimer.current) clearTimeout(completionTimer.current)
    completionTimer.current = setTimeout(() => {
      openCase(slug)
      setCompleted('')
    }, reduced ? 0 : 620)
  }

  function changeAnswer(value: string) {
    const cleaned = cleanAnswer(value).slice(0, 24)
    if (!solving) {
      setSolving(true)
      setSolved(new Set())
    }
    setAnswer(cleaned)
    setCaseOpen(false)
    if (!cleaned) {
      setMessage('Read a clue, then type its answer. Spaces and accents are optional.')
      return
    }
    const normalized = answerKey(cleaned)
    const matches = crosswordWords.filter(item => answerKey(item.answer).startsWith(normalized))
    const next = matches.find(item => item.slug === active) ?? matches[0]
    if (!next) {
      setMessage('No answer starts with “' + cleaned + '”. Try another spelling, or reveal the selected answer.')
      return
    }
    if (next.slug !== active) {
      setActive(next.slug)
      centerWord(next.slug)
    }
    const index = cleaned.length - 1
    const row = next.row + (next.direction === 'down' ? index : 0)
    const col = next.col + (next.direction === 'across' ? index : 0)
    requestAnimationFrame(() => {
      const letter = board.current?.querySelector<HTMLElement>('[data-letter="' + row + '-' + col + '"]')
      if (letter) physics.current?.drop(letter, 0, 38)
    })
    setMessage('Clue ' + next.number + ' ' + next.direction + '. ' + cleaned.length + ' of ' + next.answer.length + ' letters.')
    if (answerKey(next.answer) === normalized && matches.length === 1) completeWord(next.slug)
  }

  function submitAnswer() {
    const matching = crosswordWords.find(item => answerKey(item.answer) === answerKey(answer))
    if (matching && answer) completeWord(matching.slug)
    else if (!answer) openCase()
    else setMessage('That answer is not complete. Use the clue, or reveal its answer.')
  }

  useEffect(() => {
    function typeAnywhere(event: globalThis.KeyboardEvent) {
      const target = event.target as HTMLElement
      if (target.closest('input, textarea, select, [contenteditable="true"]') || event.metaKey || event.ctrlKey || event.altKey || event.isComposing) return
      if (/^[a-zA-ZëË]$/.test(event.key)) {
        event.preventDefault()
        const start = caseOpen ? '' : answer
        changeAnswer(start + event.key)
      } else if (event.key === 'Backspace' && answer) {
        event.preventDefault()
        changeAnswer(answer.slice(0, -1))
      }
    }
    document.addEventListener('keydown', typeAnywhere)
    return () => document.removeEventListener('keydown', typeAnywhere)
  })

  function toggleSolve() {
    if (completionTimer.current) clearTimeout(completionTimer.current)
    const next = !solving
    setSolving(next)
    setSolved(next ? new Set() : new Set(allAnswers))
    setAnswer('')
    setCompleted('')
    setCaseOpen(false)
    setMessage(next ? 'The board is yours. Choose a clue and type an answer. Spaces and accents are optional.' : 'All 28 answers are visible. Select a word to explore its project.')
    if (next) requestAnimationFrame(() => input.current?.focus({ preventScroll: true }))
  }

  function boardKeys(event: KeyboardEvent<HTMLDivElement>) {
    const index = crosswordWords.findIndex(item => item.slug === active)
    if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(event.key)) {
      event.preventDefault()
      const delta = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1
      selectWord(crosswordWords[(index + delta + crosswordWords.length) % crosswordWords.length].slug)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      submitAnswer()
    } else if (event.key === 'Escape') {
      setAnswer('')
      transitionCase(active, false)
    } else if (event.key === '+' || event.key === '=') {
      event.preventDefault()
      zoomBy(1.25)
    } else if (event.key === '-') {
      event.preventDefault()
      zoomBy(.8)
    }
  }

  function zoomBy(multiplier: number) {
    const node = viewport.current
    if (!node) return
    cancelAnimationFrame(cameraFrame.current)
    const current = cameraRef.current
    const scale = Math.max(fitScale.current, Math.min(1.5, current.scale * multiplier))
    const ratio = scale / current.scale
    moveCamera(constrainCamera({ scale, x: node.clientWidth / 2 - (node.clientWidth / 2 - current.x) * ratio, y: node.clientHeight / 2 - (node.clientHeight / 2 - current.y) * ratio }, node.clientWidth, node.clientHeight))
  }

  function fitBoard() {
    const node = viewport.current
    if (!node) return
    cancelAnimationFrame(cameraFrame.current)
    moveCamera(constrainCamera({ scale: fitScale.current, x: 0, y: 0 }, node.clientWidth, node.clientHeight))
  }

  function resetGesture() {
    const points = Array.from(pointers.current.values())
    if (!points.length) {
      gesture.current = null
      return
    }
    gesture.current = {
      x: points.length > 1 ? (points[0].x + points[1].x) / 2 : points[0].x,
      y: points.length > 1 ? (points[0].y + points[1].y) / 2 : points[0].y,
      distance: points.length > 1 ? Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y) : 0,
      camera: cameraRef.current,
    }
  }

  function startPointer(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return
    cancelAnimationFrame(cameraFrame.current)
    dragSample.current = { x: cameraRef.current.x, y: cameraRef.current.y, time: performance.now(), vx: 0, vy: 0 }
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    const target = (event.target as HTMLElement).closest<HTMLElement>('.fk-cell') ?? event.currentTarget
    target.setPointerCapture(event.pointerId)
    resetGesture()
  }

  function movePointer(event: PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId) || !gesture.current || !viewport.current) return
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    const points = Array.from(pointers.current.values())
    const start = gesture.current
    const node = viewport.current
    let next: Camera
    if (points.length >= 2 && start.distance > 0) {
      const bounds = node.getBoundingClientRect()
      const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y)
      const scale = Math.max(fitScale.current, Math.min(1.5, start.camera.scale * distance / start.distance))
      const ratio = scale / start.camera.scale
      const x = (points[0].x + points[1].x) / 2 - bounds.left
      const y = (points[0].y + points[1].y) / 2 - bounds.top
      next = { scale, x: x - (start.x - bounds.left - start.camera.x) * ratio, y: y - (start.y - bounds.top - start.camera.y) * ratio }
      suppressClick.current = performance.now() + 180
    } else {
      const dx = points[0].x - start.x
      const dy = points[0].y - start.y
      if (Math.abs(dx) + Math.abs(dy) > 5) suppressClick.current = performance.now() + 180
      next = { ...start.camera, x: start.camera.x + dx, y: start.camera.y + dy }
    }
    const constrained = constrainCamera(next, node.clientWidth, node.clientHeight)
    const time = performance.now()
    const sample = dragSample.current
    const elapsed = Math.max(8, time - sample.time) / 1000
    dragSample.current = { x: constrained.x, y: constrained.y, time, vx: (constrained.x - sample.x) / elapsed, vy: (constrained.y - sample.y) / elapsed }
    moveCamera(constrained)
  }

  function endPointer(event: PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    resetGesture()
    if (!pointers.current.size && viewport.current && performance.now() < suppressClick.current) {
      const current = cameraRef.current
      const node = viewport.current
      const sample = dragSample.current
      const recent = performance.now() - sample.time < 90 && event.type !== 'pointercancel'
      const velocity = { x: recent ? sample.vx : 0, y: recent ? sample.vy : 0 }
      const step = cellSize * current.scale
      const target = constrainCamera({ ...current, x: Math.round((current.x + velocity.x * .2) / step) * step, y: Math.round((current.y + velocity.y * .2) / step) * step }, node.clientWidth, node.clientHeight)
      settleCamera(target, velocity)
    }
  }

  function chooseCell(wordIds: string[], time: number) {
    if (time < suppressClick.current) return
    const currentIndex = wordIds.indexOf(active)
    const slug = wordIds[currentIndex < 0 ? 0 : (currentIndex + 1) % wordIds.length]
    selectWord(slug)
    viewport.current?.focus({ preventScroll: true })
  }

  return <LayoutGroup id="fjalekryq"><main className="draft-fjalekryq">
    <title>Fjalëkryq — Gentrit Rashiti</title>
    <a className="fk-skip" href="#fk-clues">Read all 28 project clues</a>
    <header className="fk-header"><a href="/drafts" className="fk-owner">Gentrit Rashiti</a><p>Kosovo · Web, mobile & full stack</p><nav aria-label="Portfolio"><a href="#fk-about">About</a><a href={links.cv} onClick={() => { setCvRequested(true); setMessage('CV requested. Your crossword stays here.') }}>{cvRequested ? 'CV requested' : 'CV'}</a><a href={'mailto:' + links.email}>Email <Arrow /></a></nav></header>
    <div className="fk-title-row"><h1 lang="sq">Fjalëkryq<span>.</span></h1><p>Different work.<br />A few things in common.</p><button className="fk-solve-toggle" type="button" aria-pressed={solving} onClick={toggleSolve}>{solving ? 'Show every answer' : 'Solve it yourself'}<span aria-hidden="true">{solving ? '28' : 'Ë'}</span></button></div>
    <div className="fk-layout" data-case={caseOpen}>
      <section className="fk-puzzle" aria-label="Crossword project map">
        <div className="fk-board-bar"><p>{solving ? solved.size + ' / 28 solved' : '28 projects, connected'}</p><a href="#fk-clues">Read the clues <Arrow /></a></div>
        <p className="fk-mobile-clue"><strong>{project.name}</strong> {clueFor(active)}</p>
        <button className="fk-mobile-open" type="button" onClick={() => openCase()}>Open {project.name}<Arrow /></button>
        <div className="fk-board-viewport" ref={viewport} tabIndex={0} role="group" aria-label="Crossword. Arrow keys select a word; Enter opens its project. Type an answer to solve." onKeyDown={boardKeys} onPointerDown={startPointer} onPointerMove={movePointer} onPointerUp={endPointer} onPointerCancel={endPointer}>
          <div className="fk-board" ref={board} style={{ width: boardWidth, height: boardHeight, transform: 'translate(' + camera.x + 'px,' + camera.y + 'px) scale(' + camera.scale + ')' }}>
            <motion.div className="fk-active-word" layout layoutId="fk-active-word" layoutDependency={active} aria-hidden="true" style={{ left: word.col * cellSize, top: word.row * cellSize, width: (word.direction === 'across' ? word.answer.length : 1) * cellSize, height: (word.direction === 'down' ? word.answer.length : 1) * cellSize }} transition={reduced ? { duration: .01 } : spring.ui} />
            {crosswordCells.map(cell => {
              const selected = cell.wordIds.includes(active)
              const index = selected ? (word.direction === 'across' ? cell.col - word.col : cell.row - word.row) : -1
              const typed = selected && index < answer.length && answerKey(word.answer).startsWith(answerKey(answer))
              const revealed = !solving || cell.wordIds.some(slug => solved.has(slug)) || typed
              const waveWord = completed && cell.wordIds.includes(completed) ? wordBySlug.get(completed)! : null
              const waveIndex = waveWord ? (waveWord.direction === 'across' ? cell.col - waveWord.col : cell.row - waveWord.row) : 0
              return <button type="button" key={cell.row + '-' + cell.col} className="fk-cell" title={cell.wordIds.map(clueFor).join(' / ')} tabIndex={-1} data-selected={selected} data-typed={typed} data-complete={Boolean(waveWord)} aria-label={cell.wordIds.map(slug => { const item = wordBySlug.get(slug)!; return item.number + ' ' + item.direction + ', ' + projectBySlug.get(slug)!.name }).join('; ')} onClick={event => chooseCell(cell.wordIds, event.timeStamp)} onDoubleClick={() => openCase(cell.wordIds.includes(active) ? active : cell.wordIds[0])} style={{ left: cell.col * cellSize, top: cell.row * cellSize, '--fk-wave-delay': waveIndex * 35 + 'ms' } as CSSProperties}>
                {cell.number && <small>{cell.number}</small>}<span data-letter={cell.row + '-' + cell.col} aria-hidden="true">{revealed ? cell.letter : ''}</span>
              </button>
            })}
          </div>
        </div>
        <div className="fk-board-controls"><span>Drag to explore. Pinch to zoom.</span><div><button type="button" aria-label="Zoom out" onClick={() => zoomBy(.8)}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12" /></svg></button><button type="button" onClick={fitBoard}>Fit all</button><button type="button" aria-label="Zoom in" onClick={() => zoomBy(1.25)}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12M10 4v12" /></svg></button></div></div>
        <form className="fk-answer-form" onSubmit={event => { event.preventDefault(); submitAnswer() }}><label htmlFor="fk-answer">Try an answer</label><div><input ref={input} id="fk-answer" autoComplete="off" autoCapitalize="characters" spellCheck={false} value={answer} placeholder={solving ? word.answer.length + ' letters' : 'Type FJALË, or any project'} onChange={event => changeAnswer(event.target.value)} onFocus={event => event.currentTarget.select()} /><button type="button" lang="sq" aria-label="Add the Albanian letter Ë" onClick={() => { changeAnswer(answer + 'Ë'); input.current?.focus() }}>Ë</button><button type="submit" aria-label={answer ? 'Check answer' : 'Open selected project'}><Arrow /></button></div></form>
        <p className="fk-status" role="status" aria-live="polite" aria-atomic="true">{message}</p>
      </section>
      <aside className="fk-clue-panel" ref={panel} aria-labelledby="fk-current-title">
        <div className="fk-clue-position"><span>{word.number}</span><p>{word.direction}<br />{word.answer.length} letters</p>{caseOpen && <button type="button" onClick={() => transitionCase(active, false)} aria-label="Back to the clue"><Arrow back /></button>}</div>
        <motion.h2 layout="position" layoutId={'fk-project-' + active} id="fk-current-title" style={{ viewTransitionName: 'fk-project-title' }} transition={reduced ? { duration: .01 } : spring.ui}>{project.name}</motion.h2>
        <p className="fk-feature-clue">{clueFor(active)}</p>
        <AnimatePresence mode="popLayout" initial={false}>{caseOpen ? <motion.div key={'case-' + active} className="fk-case-content" initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }} transition={reduced ? { duration: .01 } : { duration: dur.panel, ease: ease.arrive }}>
          <p>{project.summary}</p>
          <dl><div><dt>Year</dt><dd>{project.years ?? 'Independent work'}</dd></div><div><dt>Work</dt><dd>{project.role}</dd></div><div><dt>Made with</dt><dd>{project.stack.join(' · ')}</dd></div></dl>
          {active === 'care-platform' ? <CareFile reduced={reduced} /> : galleryImage && <figure><img src={galleryImage.src} alt={galleryImage.alt} loading="lazy" /><figcaption>{active === 'care-platform' ? 'Recreation · invented data' : 'Public project image'}</figcaption></figure>}
          <div className="fk-project-links">{project.featured && <a href={'/work/' + active}>Read the full case <Arrow /></a>}{project.links.map(link => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label}<Arrow /></a>)}</div>
        </motion.div> : <motion.div key="clues" initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }} transition={reduced ? { duration: .01 } : { duration: dur.ui, ease: ease.out }}>
          <button className="fk-open-project" type="button" onClick={() => openCase()}>Open {project.name}<Arrow /></button>
          {solving && !solved.has(active) && <button className="fk-reveal" type="button" onClick={() => { setSolved(current => new Set([...current, active])); setAnswer(''); setMessage(project.name + ' revealed. ' + word.answer.length + ' letters.') }}>Reveal this answer</button>}
          <div className="fk-neighbour-clues"><h3>A few more connections</h3>{featuredClues.filter(slug => slug !== active).map(slug => { const item = wordBySlug.get(slug)!; return <button key={slug} type="button" onClick={() => selectWord(slug)}><span>{item.number}<small>{item.direction}</small></span><p>{clueFor(slug)}</p><Arrow /></button> })}</div>
        </motion.div>}</AnimatePresence>
      </aside>
    </div>
    <section className="fk-clues" id="fk-clues" aria-labelledby="fk-clues-heading">
      <div className="fk-clues-heading"><h2 id="fk-clues-heading">Across & down.</h2><p>The clues are the work.<br />Every one opens a project.</p><label><span>Find a clue</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="A project, a tool, a detail…" /></label></div>
      <div className="fk-clue-columns">{(['across', 'down'] as const).map(direction => <div key={direction}><h3>{direction}</h3><ol>{visibleWords.filter(item => item.direction === direction).map(item => <li key={item.slug} value={item.number}><button type="button" className={item.slug === active ? 'fk-clue-active' : ''} onClick={() => openCase(item.slug, true)} aria-label={'Open ' + projectBySlug.get(item.slug)!.name + ', clue ' + item.number + ' ' + direction}><span className="fk-clue-number">{item.number}</span><div><p>{clueFor(item.slug)}</p><span>{projectBySlug.get(item.slug)!.name} <span aria-hidden="true">/</span> {item.answer.length} letters</span></div><Arrow /></button></li>)}</ol></div>)}</div>
      {!visibleWords.length && <p className="fk-empty">No clue matches “{query}”. <button type="button" onClick={() => setQuery('')}>Show all 28</button></p>}
    </section>
    <footer id="fk-about" className="fk-footer"><div><h2>Gentrit Rashiti</h2><p>Frontend & mobile developer, now full stack.<br />5+ years, from the first screen to release.<br />Based in Kosovo. Working remotely.</p></div><p lang="sq">Fjalëkryq <span lang="en">means crossword.<br />The Ë belongs here.</span></p><nav aria-label="Contact"><a href={'mailto:' + links.email}>Email <Arrow /></a><a href={links.github}>GitHub <Arrow /></a><a href={links.linkedin}>LinkedIn <Arrow /></a><a href={links.cv} onClick={() => { setCvRequested(true); setMessage('CV requested. Your crossword stays here.') }}>{cvRequested ? 'CV requested' : 'Download CV'} <Arrow /></a><a href="/drafts">All art directions <Arrow /></a></nav></footer>
  </main></LayoutGroup>
}
