import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import { LayoutGroup, animate, motion } from 'motion/react'
import { flushSync } from 'react-dom'
import { CareFile } from './CareFile'
import { dur, ease, spring } from './motion'
import { projects } from '../../content/projects'
import { links } from '../../content/links'
import { crosswordCells, crosswordColumns, crosswordRows, crosswordWords, type CrosswordWord } from './crossword'
import { createLetterPhysics } from './letterPhysics'
import './fjalekryq.css'

const cellSize = 44
const enterStep = 40
const enterStart = 80
const boardWidth = crosswordColumns * cellSize
const boardHeight = crosswordRows * cellSize
const allAnswers = crosswordWords.map(word => word.slug)
const wordBySlug = new Map(crosswordWords.map(word => [word.slug, word]))
const projectBySlug = new Map(projects.map(project => [project.slug, project]))
const cellKey = (row: number, col: number) => row + '-' + col
const cellAt = (word: CrosswordWord, index: number) => cellKey(word.row + (word.direction === 'down' ? index : 0), word.col + (word.direction === 'across' ? index : 0))
const cellByKey = new Map(crosswordCells.map(cell => [cellKey(cell.row, cell.col), cell]))
const columns = (['across', 'down'] as const).map(direction => ({ direction, words: crosswordWords.filter(item => item.direction === direction) }))
const flourishKey = (() => { const fjale = wordBySlug.get('fjale')!; return cellAt(fjale, fjale.answer.length - 1) })()
const specificClues: Record<string, string> = {
  fjale: 'A daily Albanian word game. A 21k-word dictionary, an archive, and play that works offline.',
  'bayyinah-tv': 'A video-learning platform rebuilt across 34 routes. English, Arabic, and live streams.',
  'read-to-feed': 'Books, a barcode scanner, and about 14 releases. React Native, from 0.63 to 0.81.',
  'care-platform': 'A Vue-to-React migration, route by route. Parity tests and 31 architecture decisions.',
  'care-api': 'A multi-tenant Laravel API. One billing report went from 16 queries to 2.',
  'morse-trainer': 'Learn the rhythm of Morse with spaced repetition and Farnsworth timing.',
  'donation-app': 'Donations and subscriptions with Stripe, badges, guided tasks and video, for iOS and Android.',
  offbeat: 'A fictional speaker brand. A 3D speaker in four finishes and a working eight-step drum machine.',
  form: 'A fictional sculpture show. Three mathematical forms in WebGL, and a typed word cast as a sculpture.',
}
const answerKey = (value: string) => value.toLocaleUpperCase().replace(/Ë/g, 'E').replace(/[^A-Z]/g, '')
const cleanAnswer = (value: string) => value.toLocaleUpperCase().replace(/[^A-ZË]/g, '')
const clueFor = (slug: string) => specificClues[slug] ?? projectBySlug.get(slug)!.line

/** The crossing words of a completed answer, each cell delayed by its distance from the crossing. */
function crossWave(slug: string) {
  const done = wordBySlug.get(slug)!
  const own = new Set(Array.from(done.answer, (_, index) => cellAt(done, index)))
  const base = done.answer.length * 35 + 200
  const delays = new Map<string, number>()
  own.forEach(key => cellByKey.get(key)!.wordIds.filter(id => id !== slug).forEach(id => {
    const other = wordBySlug.get(id)!
    const crossing = Array.from(other.answer, (_, index) => cellAt(other, index)).indexOf(key)
    Array.from(other.answer).forEach((_, index) => {
      const target = cellAt(other, index)
      if (own.has(target)) return
      const delay = base + Math.abs(index - crossing) * 35
      delays.set(target, Math.min(delays.get(target) ?? delay, delay))
    })
  }))
  return delays
}

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
  return <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" style={back ? { transform: 'rotate(180deg)' } : undefined}><path d="M4 12h15M12 5l7 7-7 7" /></svg>
}

function Tiles({ text }: { text: string }) {
  return <span className="fk-tiles" aria-hidden="true">{text.split(' ').map(part => <span key={part}>{Array.from(part).map((letter, index) => <i key={index}>{letter}</i>)}</span>)}</span>
}

export default function Draft() {
  const [active, setActive] = useState('fjale')
  const [preview, setPreview] = useState<string[]>([])
  const [solving, setSolving] = useState(false)
  const [solved, setSolved] = useState(() => new Set(allAnswers))
  const [answer, setAnswer] = useState('')
  const [message, setMessage] = useState('')
  const [caseOpen, setCaseOpen] = useState(false)
  const [completed, setCompleted] = useState('')
  const [intro, setIntro] = useState(true)
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, scale: .9 })
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const viewport = useRef<HTMLDivElement>(null)
  const board = useRef<HTMLDivElement>(null)
  const side = useRef<HTMLElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const eKey = useRef<HTMLSpanElement>(null)
  const physics = useRef<ReturnType<typeof createLetterPhysics> | null>(null)
  const completionTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const completionToken = useRef(0)
  const cameraRef = useRef(camera)
  const cameraTarget = useRef(camera)
  const activeRef = useRef(active)
  const fitScale = useRef(.65)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const gesture = useRef<Gesture | null>(null)
  const suppressClick = useRef(0)
  const cameraFrame = useRef(0)
  const dragSample = useRef({ x: 0, y: 0, time: 0, vx: 0, vy: 0 })
  const word = wordBySlug.get(active)!
  const project = projectBySlug.get(active)!
  const wave = useMemo(() => completed ? crossWave(completed) : null, [completed])
  const previewCells = useMemo(() => new Set(preview.flatMap(slug => { const item = wordBySlug.get(slug)!; return Array.from(item.answer, (_, index) => cellAt(item, index)) })), [preview])
  const gallery = project.media.galleries?.[0]
  const images = active === 'care-platform' ? [] : gallery ? gallery.items.slice(0, gallery.aspect === 'phone' ? 3 : 1) : project.media.shot ? [project.media.shot] : []
  const openLabel = project.featured ? 'Open the case' : 'Open the project'

  useEffect(() => { activeRef.current = active }, [active])

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => setReduced(preference.matches)
    preference.addEventListener('change', change)
    return () => preference.removeEventListener('change', change)
  }, [])

  function fitCamera(node: HTMLDivElement) {
    const width = node.clientWidth
    const height = node.clientHeight
    fitScale.current = Math.min(width / boardWidth, height / boardHeight)
    const scale = Math.max(fitScale.current, width < 600 ? .64 : .9)
    const fitted = constrainCamera({ scale, x: width / 2 - boardWidth * scale / 2, y: height / 2 - boardHeight * scale / 2 }, width, height)
    cameraRef.current = fitted
    cameraTarget.current = fitted
    setCamera(fitted)
    return fitted
  }

  useLayoutEffect(() => {
    if (!viewport.current || !board.current) return
    const node = viewport.current
    const surface = board.current
    const letters = createLetterPhysics(node)
    physics.current = letters
    const start = fitCamera(node)
    let width = node.clientWidth
    let height = node.clientHeight
    const observer = new ResizeObserver(() => {
      if (node.clientWidth === width && node.clientHeight === height) return
      width = node.clientWidth
      height = node.clientHeight
      cancelAnimationFrame(cameraFrame.current)
      fitCamera(node)
    })
    observer.observe(node)
    const cellPixels = cellSize * start.scale
    const diagonal = (row: number, col: number) => Math.max(0, Math.round((col * cellPixels + start.x) / cellPixels)) + Math.max(0, Math.round((row * cellPixels + start.y) / cellPixels))
    let last = 0
    const fjale = wordBySlug.get('fjale')!
    surface.style.setProperty('--fk-flood-delay', enterStart + diagonal(fjale.row, fjale.col + fjale.answer.length) * enterStep + 260 + 'ms')
    surface.querySelectorAll<HTMLElement>('[data-letter]').forEach(letter => {
      const key = letter.dataset.letter!
      if (key === flourishKey) return
      const [row, col] = key.split('-').map(Number)
      const delay = enterStart + diagonal(row, col) * enterStep
      last = Math.max(last, delay)
      letters.drop(letter, delay, 36)
    })
    const flourish = surface.querySelector<HTMLElement>('[data-letter="' + flourishKey + '"]')
    if (flourish) letters.drop(flourish, last + 180, 120, () => {
      const tile = flourish.parentElement
      if (tile && !matchMedia('(prefers-reduced-motion: reduce)').matches) animate(tile, { scale: [1.24, 1], rotate: [-9, 0] }, spring.play)
    })
    const introTimer = setTimeout(() => setIntro(false), last + 900)
    return () => {
      clearTimeout(introTimer)
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
    cameraTarget.current = target
    if (reduced) { moveCamera(target); return }
    let previous = 0
    let vx = velocity.x
    let vy = velocity.y
    // Release velocity carries into the spring; it converges on the predicted cell edge.
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

  function cancelCompletion() {
    completionToken.current += 1
    if (completionTimer.current) clearTimeout(completionTimer.current)
    setCompleted('')
  }

  function selectWord(slug: string) {
    cancelCompletion()
    setActive(slug)
    setAnswer('')
    setCaseOpen(false)
    centerWord(slug)
    const selected = wordBySlug.get(slug)!
    setMessage(selected.number + ' ' + selected.direction + ', ' + selected.answer.length + ' letters. ' + projectBySlug.get(slug)!.name + '. ' + clueFor(slug))
  }

  function transitionCase(slug: string, open: boolean) {
    const update = () => {
      setActive(slug)
      setCaseOpen(open)
      setPreview([])
      const stage = side.current
      if (!stage) return
      const top = stage.getBoundingClientRect().top
      const header = matchMedia('(max-width: 760px)').matches ? 0 : 64
      if (top < header || top > innerHeight * .8) scrollTo({ top: scrollY + top - header, behavior: 'instant' })
    }
    if (!reduced && typeof document.startViewTransition === 'function') {
      document.startViewTransition(() => flushSync(update))
    } else update()
  }

  function openCase(slug = active) {
    centerWord(slug)
    transitionCase(slug, true)
    setMessage(projectBySlug.get(slug)!.name + ' is open.')
  }

  function completeWord(slug: string) {
    setSolved(current => new Set([...current, slug]))
    setCompleted(slug)
    setMessage(projectBySlug.get(slug)!.name + ' solved.')
    const crossing = crossWave(slug)
    const end = Math.max(wordBySlug.get(slug)!.answer.length * 35 + 360, ...crossing.values()) + 380
    if (completionTimer.current) clearTimeout(completionTimer.current)
    const token = completionToken.current
    completionTimer.current = setTimeout(() => {
      if (token !== completionToken.current) return
      openCase(slug)
      setCompleted('')
    }, reduced ? 0 : Math.min(end, 1600))
  }

  function landingHeight(row: number) {
    const target = cameraTarget.current
    return (row * cellSize * target.scale + target.y) / target.scale + cellSize
  }

  function pressE() {
    if (!eKey.current || reduced) return
    animate(eKey.current, { scale: [.94, 1] }, { duration: dur.tap, ease: ease.out })
  }

  function changeAnswer(value: string) {
    const cleaned = cleanAnswer(value).slice(0, 24)
    cancelCompletion()
    if (!solving) {
      setSolving(true)
      setSolved(new Set())
    }
    setAnswer(cleaned)
    setCaseOpen(false)
    if (cleaned.endsWith('Ë') && cleaned.length > answer.length) pressE()
    if (!cleaned) {
      setMessage('Answer cleared.')
      return
    }
    const normalized = answerKey(cleaned)
    const matches = crosswordWords.filter(item => answerKey(item.answer).startsWith(normalized))
    const next = matches.find(item => item.slug === active) ?? matches[0]
    if (!next) {
      setMessage('No answer starts with ' + cleaned + '.')
      return
    }
    if (next.slug !== active) {
      setActive(next.slug)
      centerWord(next.slug)
    }
    const index = cleaned.length - 1
    const row = next.row + (next.direction === 'down' ? index : 0)
    const col = next.col + (next.direction === 'across' ? index : 0)
    const complete = answerKey(next.answer) === normalized && matches.length === 1
    const token = completionToken.current
    const land = complete ? () => { if (token === completionToken.current) completeWord(next.slug) } : undefined
    requestAnimationFrame(() => {
      const letter = board.current?.querySelector<HTMLElement>('[data-letter="' + row + '-' + col + '"]')
      if (letter && cleaned.length > answer.length) physics.current?.drop(letter, 0, landingHeight(row), land)
      else land?.()
    })
    setMessage(next.number + ' ' + next.direction + ', ' + cleaned.length + ' of ' + next.answer.length + ' letters.')
  }

  function submitAnswer() {
    const matching = crosswordWords.find(item => answerKey(item.answer) === answerKey(answer))
    if (matching && answer) completeWord(matching.slug)
    else if (!answer) openCase()
    else setMessage('Not complete yet. ' + word.answer.length + ' letters.')
  }

  useEffect(() => {
    function typeAnywhere(event: globalThis.KeyboardEvent) {
      const target = event.target as HTMLElement
      if (target.closest('input, textarea, select, [contenteditable="true"]') || event.metaKey || event.ctrlKey || event.altKey || event.isComposing) return
      if (/^[a-zA-ZëË]$/.test(event.key)) {
        event.preventDefault()
        changeAnswer((caseOpen ? '' : answer) + event.key)
      } else if (event.key === 'Backspace' && answer) {
        event.preventDefault()
        changeAnswer(answer.slice(0, -1))
      } else if (event.key === 'Escape' && caseOpen) {
        transitionCase(active, false)
      }
    }
    document.addEventListener('keydown', typeAnywhere)
    return () => document.removeEventListener('keydown', typeAnywhere)
  })

  function toggleSolve() {
    cancelCompletion()
    const next = !solving
    setSolving(next)
    setSolved(next ? new Set() : new Set(allAnswers))
    setAnswer('')
    setCaseOpen(false)
    setMessage(next ? 'The board is empty. Type an answer.' : `All ${allAnswers.length} answers are visible.`)
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
    const next = constrainCamera({ scale, x: node.clientWidth / 2 - (node.clientWidth / 2 - current.x) * ratio, y: node.clientHeight / 2 - (node.clientHeight / 2 - current.y) * ratio }, node.clientWidth, node.clientHeight)
    cameraTarget.current = next
    moveCamera(next)
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
    cameraTarget.current = constrained
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

  const enter = (index: number) => ({ '--i': index } as CSSProperties)

  return <LayoutGroup id="fjalekryq"><main className="draft-fjalekryq" data-intro={intro} data-case={caseOpen}>
    <title>Fjalëkryq — Gentrit Rashiti</title>
    <a className="fk-skip" href="#fk-clues">Read all {allAnswers.length} project clues</a>
    <header className="fk-header">
      <p className="fk-setter"><span className="fk-setter-label">Set by</span><Tiles text="GENTRIT RASHITI" /><span className="fk-sr">Gentrit Rashiti</span><span className="fk-setter-enum">(7, 7)</span><span className="fk-setter-clue">Web, mobile and full-stack developer, Kosovo</span></p>
      <nav aria-label="Portfolio"><a href="#fk-about">About</a><a href={links.cv}>CV</a><a href={'mailto:' + links.email}>Email</a></nav>
    </header>
    <div className="fk-stage">
      <section className="fk-board-column" aria-label="Crossword project map">
        <div className="fk-board-bar">
          <h1 lang="sq">Fjalëkryq<span>.</span></h1>
          <p>{solving ? `${solved.size} / ${allAnswers.length} solved` : `${allAnswers.length} projects, connected`}</p>
          <button className="fk-solve-toggle" type="button" aria-pressed={solving} onClick={toggleSolve}>{solving ? 'Show every answer' : 'Solve it yourself'}<span ref={eKey} aria-hidden="true">{solving ? allAnswers.length : 'Ë'}</span></button>
        </div>
        <div className="fk-board-viewport" ref={viewport} tabIndex={0} role="group" aria-label="Crossword. Arrow keys select a word, Enter opens its project, typing solves." onKeyDown={boardKeys} onPointerDown={startPointer} onPointerMove={movePointer} onPointerUp={endPointer} onPointerCancel={endPointer} onPointerLeave={() => setPreview([])}>
          <div className="fk-board" ref={board} style={{ width: boardWidth, height: boardHeight, transform: 'translate(' + camera.x + 'px,' + camera.y + 'px) scale(' + camera.scale + ')' }}>
            <motion.div className="fk-active-word" data-direction={word.direction} layout layoutId="fk-active-word" layoutDependency={active} aria-hidden="true" style={{ left: word.col * cellSize, top: word.row * cellSize, width: (word.direction === 'across' ? word.answer.length : 1) * cellSize, height: (word.direction === 'down' ? word.answer.length : 1) * cellSize }} transition={reduced ? { duration: .01 } : spring.ui}><span /></motion.div>
            {crosswordCells.map(cell => {
              const key = cellKey(cell.row, cell.col)
              const selected = cell.wordIds.includes(active)
              const index = selected ? (word.direction === 'across' ? cell.col - word.col : cell.row - word.row) : -1
              const typed = selected && index < answer.length && answerKey(word.answer).startsWith(answerKey(answer))
              const revealed = !solving || cell.wordIds.some(slug => solved.has(slug)) || typed
              const waveWord = completed && cell.wordIds.includes(completed) ? wordBySlug.get(completed)! : null
              const waveIndex = waveWord ? (waveWord.direction === 'across' ? cell.col - waveWord.col : cell.row - waveWord.row) : 0
              const crossDelay = !waveWord ? wave?.get(key) : undefined
              return <button type="button" key={key} className="fk-cell" tabIndex={-1} data-selected={selected} data-preview={!selected && previewCells.has(key)} data-complete={Boolean(waveWord)} data-cross={crossDelay !== undefined} aria-label={cell.wordIds.map(slug => { const item = wordBySlug.get(slug)!; return item.number + ' ' + item.direction + ', ' + projectBySlug.get(slug)!.name }).join('; ')} onPointerEnter={() => setPreview(cell.wordIds)} onClick={event => chooseCell(cell.wordIds, event.timeStamp)} onDoubleClick={() => openCase(cell.wordIds.includes(active) ? active : cell.wordIds[0])} style={{ left: cell.col * cellSize, top: cell.row * cellSize, '--fk-wave-delay': waveIndex * 35 + 'ms', '--fk-cross-delay': (crossDelay ?? 0) + 'ms' } as CSSProperties}>
                {cell.number && <small>{cell.number}</small>}<span data-letter={key} aria-hidden="true">{revealed ? cell.letter : ''}</span>
              </button>
            })}
          </div>
        </div>
        <div className="fk-answer-bar">
          <p className="fk-current" aria-hidden="true">{project.media.shot && <img className="fk-current-shot" src={project.media.shot.src} alt="" />}<span className="fk-current-number">{word.number}</span><span className="fk-current-position">{word.direction}<br />{word.answer.length} letters</span><span className="fk-current-clue"><b>{project.name}</b> {clueFor(active)}</span></p>
          <form className="fk-answer-form" onSubmit={event => { event.preventDefault(); submitAnswer() }}>
            <label htmlFor="fk-answer" className="fk-answer-for"><span aria-hidden="true">{word.number}{word.direction === 'across' ? 'A' : 'D'}</span><span className="fk-sr">Answer for {word.number} {word.direction}</span></label>
            <input ref={input} id="fk-answer" autoComplete="off" autoCapitalize="characters" spellCheck={false} value={answer} placeholder={'_ '.repeat(word.answer.length).trim()} onChange={event => changeAnswer(event.target.value)} onFocus={event => event.currentTarget.select()} />
            <button type="button" className="fk-e" lang="sq" aria-label="Add the Albanian letter Ë" onClick={() => { changeAnswer(answer + 'Ë'); input.current?.focus() }}>Ë</button>
            <button type="submit" className="fk-check" aria-label={answer ? 'Check answer' : 'Open ' + project.name}><Arrow /></button>
          </form>
          {!caseOpen && <button className="fk-open-project" type="button" aria-label={'Open ' + project.name} onClick={() => openCase()}>{openLabel}<Arrow /></button>}
        </div>
        <p className="fk-sr" role="status" aria-live="polite" aria-atomic="true">{message}</p>
      </section>
      <aside className="fk-side" ref={side} aria-label={caseOpen ? project.name : 'Clues'}>
        {caseOpen ? <article className="fk-case" aria-labelledby="fk-case-title">
          <div className="fk-case-head"><button type="button" onClick={() => transitionCase(active, false)} aria-label="Back to the clues"><Arrow back /></button><span>{word.number} {word.direction} · {word.answer.length} letters{project.years ? ' · ' + project.years : ''}</span></div>
          <h2 id="fk-case-title" style={{ viewTransitionName: 'fk-case-title' }}>{project.name}</h2>
          <p className="fk-case-lede" style={{ viewTransitionName: 'fk-case-clue' }}>{clueFor(active)}</p>
          <motion.div className="fk-case-body" initial={reduced ? false : { opacity: 0, y: 8, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={reduced ? { duration: .01 } : { duration: dur.panel, ease: ease.arrive, delay: .12 }}>
            <p>{project.summary}</p>
            <dl><div><dt>Year</dt><dd>{project.years ?? 'Independent work'}</dd></div><div><dt>Work</dt><dd>{project.role}</dd></div><div><dt>Made with</dt><dd>{project.stack.join(' · ')}</dd></div></dl>
            {active === 'care-platform' ? <CareFile reduced={reduced} /> : images.length > 0 && <figure className="fk-case-media" data-count={images.length}>{images.map(image => <img key={image.src} src={image.src} alt={image.alt} loading="lazy" />)}<figcaption>{gallery ? gallery.title : 'Public project image'}</figcaption></figure>}
            <div className="fk-project-links">{project.featured && <a href={'/work/' + active}>Read the full case <Arrow /></a>}{project.links.map(link => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label}<Arrow /></a>)}</div>
          </motion.div>
        </article> : <section className="fk-clues" id="fk-clues" aria-label={`Clues: the ${allAnswers.length} projects`}>
          {columns.map(column => <div key={column.direction} className="fk-clue-list"><h2>{column.direction}</h2><ol>{column.words.map((item, index) => {
            const itemProject = projectBySlug.get(item.slug)!
            const current = item.slug === active
            return <li key={item.slug} style={enter(index + (column.direction === 'down' ? 1 : 0))}><button type="button" className="fk-clue" data-active={current} data-preview={preview.includes(item.slug)} aria-current={current ? 'true' : undefined} aria-label={item.number + ' ' + item.direction + ', ' + itemProject.name + '. ' + (current ? 'Selected. Press again to open.' : 'Select on the board.')} onClick={() => current ? openCase(item.slug) : selectWord(item.slug)} onPointerEnter={() => setPreview([item.slug])} onPointerLeave={() => setPreview([])} onFocus={() => setPreview([item.slug])} onBlur={() => setPreview([])}>
              <span className="fk-clue-number">{item.number}</span>
              <span className="fk-clue-body"><b style={current ? { viewTransitionName: 'fk-case-title' } : undefined}>{itemProject.name}</b><span className="fk-clue-text" style={current ? { viewTransitionName: 'fk-case-clue' } : undefined}>{clueFor(item.slug)} <span className="fk-enum">({item.answer.length}){itemProject.featured ? ' · case' : ''}</span></span></span>
              {current && <Arrow />}
            </button></li>
          })}</ol></div>)}
        </section>}
      </aside>
    </div>
    <footer id="fk-about" className="fk-footer"><div><h2>Gentrit Rashiti</h2><p>Frontend and mobile developer, now full stack. 5+ years, from the first screen to the release. Based in Kosovo, working remotely.</p></div><p lang="sq">Fjalëkryq <span lang="en">means crossword. The Ë belongs here.</span></p><nav aria-label="Contact"><a href={'mailto:' + links.email}>Email <Arrow /></a><a href={links.github}>GitHub <Arrow /></a><a href={links.linkedin}>LinkedIn <Arrow /></a><a href={links.cv}>Download CV <Arrow /></a><a href="/drafts">All art directions <Arrow /></a></nav></footer>
  </main></LayoutGroup>
}
