import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import { animate, motion } from 'motion/react'
import { flushSync } from 'react-dom'
import { dur, ease, spring } from './motion'
import { links } from '../../content/links'
import { recreations } from '../../lib/recreations'
import { crosswordCells, crosswordColumns, crosswordRows, crosswordWords, type CrosswordWord } from './crossword'
import { clues, featuredOrder, filledAtStart, nameOf, ownOrder, projectOf } from './clues'
import { createLetterPhysics } from './letterPhysics'
import { OwnWork } from './OwnWork'
import './crossword.css'

for (const face of ['LibreFranklin-Latin', 'Fraunces-Latin']) {
  const href = '/fonts/creative/' + face + '.woff2'
  if (!document.head.querySelector('link[rel="preload"][href="' + href + '"]')) {
    const link = document.createElement('link')
    Object.assign(link, { rel: 'preload', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous', href })
    document.head.append(link)
  }
}

const cellSize = 44
const boardWidth = crosswordColumns * cellSize
const boardHeight = crosswordRows * cellSize
const allAnswers = crosswordWords.map(word => word.slug)
const wordBySlug = new Map(crosswordWords.map(word => [word.slug, word]))
const cellKey = (row: number, col: number) => row + '-' + col
const cellAt = (word: CrosswordWord, index: number) => cellKey(word.row + (word.direction === 'down' ? index : 0), word.col + (word.direction === 'across' ? index : 0))
const cellByKey = new Map(crosswordCells.map(cell => [cellKey(cell.row, cell.col), cell]))
const givenKey = (() => { const fjale = wordBySlug.get('fjale')!; return cellAt(fjale, fjale.answer.length - 1) })()
const restWords = crosswordWords.filter(word => !filledAtStart.includes(word.slug))
const restColumns = (['across', 'down'] as const).map(direction => ({ direction, words: restWords.filter(word => word.direction === direction).sort((a, b) => a.number - b.number) }))
const answerKey = (value: string) => value.toLocaleUpperCase().replace(/Ë/g, 'E').replace(/[^A-Z]/g, '')
const cleanAnswer = (value: string) => value.toLocaleUpperCase().replace(/[^A-ZË]/g, '')
const label = (word: CrosswordWord) => word.number + ' ' + (word.direction === 'across' ? 'Across' : 'Down')

function revealedKeys(slugs: Iterable<string>) {
  const keys = new Set<string>([givenKey])
  for (const slug of slugs) { const item = wordBySlug.get(slug)!; Array.from(item.answer).forEach((_, index) => keys.add(cellAt(item, index))) }
  return keys
}

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

function CaseMedia({ slug }: { slug: string }) {
  const project = projectOf(slug)
  if (slug === 'care-platform') {
    const rec = recreations.care
    return <figure className="fk-case-media">
      <div className="fk-recreation @container" data-world={rec.world} role="group" aria-label={rec.name + ', recreation with invented data'}>
        <Suspense fallback={<span className="fk-wait">Loading the recreation</span>}><rec.Component /></Suspense>
      </div>
      <figcaption>Recreation · invented data</figcaption>
    </figure>
  }
  if (ownOrder.includes(slug) || slug === 'design-system-react') return null
  const gallery = project.media.galleries?.[0]
  if (!gallery) return null
  const items = gallery.items.slice(0, gallery.aspect === 'phone' ? 3 : 1)
  return <figure className="fk-case-media" data-count={items.length}>
    {items.map(image => <img key={image.src} src={image.src} alt={image.alt} width={image.width} height={image.height} loading="lazy" />)}
    <figcaption>{gallery.aspect === 'phone' ? 'Store screenshots, public.' : 'Public page.'}</figcaption>
  </figure>
}

export default function Draft() {
  const [active, setActive] = useState(featuredOrder[0])
  const [preview, setPreview] = useState<string | null>(null)
  const [solved, setSolved] = useState(() => new Set(filledAtStart))
  const [answer, setAnswer] = useState('')
  const [message, setMessage] = useState('')
  const [caseOpen, setCaseOpen] = useState(false)
  const [completed, setCompleted] = useState('')
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, scale: .6 })
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const viewport = useRef<HTMLDivElement>(null)
  const board = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const caseTitle = useRef<HTMLHeadingElement>(null)
  const focusCase = useRef(false)
  const returnFocus = useRef<HTMLElement | null>(null)
  const physics = useRef<ReturnType<typeof createLetterPhysics> | null>(null)
  const completionTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const completionToken = useRef(0)
  const cameraRef = useRef(camera)
  const cameraTarget = useRef(camera)
  const fitScale = useRef(.6)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const gesture = useRef<Gesture | null>(null)
  const suppressClick = useRef(0)
  const cameraFrame = useRef(0)
  const dragSample = useRef({ x: 0, y: 0, time: 0, vx: 0, vy: 0 })
  const word = wordBySlug.get(active)!
  const highlight = wordBySlug.get(preview ?? active)!
  const project = projectOf(active)
  const clue = clues[active]
  const wave = useMemo(() => completed ? crossWave(completed) : null, [completed])
  const typing = answer.length > 0 && !caseOpen
  const full = solved.size === allAnswers.length

  const revealed = revealedKeys([...solved].filter(slug => !(typing && slug === active)))
  if (typing && answerKey(word.answer).startsWith(answerKey(answer))) for (let index = 0; index < answer.length; index += 1) revealed.add(cellAt(word, index))

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => setReduced(preference.matches)
    preference.addEventListener('change', change)
    return () => preference.removeEventListener('change', change)
  }, [])

  useEffect(() => {
    if (caseOpen && focusCase.current) {
      focusCase.current = false
      caseTitle.current?.focus({ preventScroll: true })
    }
  }, [caseOpen, active])

  function fitCamera(node: HTMLDivElement) {
    const width = node.clientWidth
    const height = node.clientHeight
    fitScale.current = Math.min(width / boardWidth, height / boardHeight)
    const scale = Math.max(fitScale.current, width < 600 ? .62 : .46)
    const fitted = constrainCamera({ scale, x: width / 2 - boardWidth * scale / 2, y: height / 2 - boardHeight * scale / 2 }, width, height)
    cameraRef.current = fitted
    cameraTarget.current = fitted
    setCamera(fitted)
    return fitted
  }

  function landingHeight(row: number) {
    const target = cameraTarget.current
    return (row * cellSize * target.scale + target.y) / target.scale + cellSize
  }

  function rain(keys: string[], startDelay: number, span: number, fromTop: boolean) {
    const surface = board.current
    const letters = physics.current
    if (!surface || !letters) return 0
    const start = cameraRef.current
    const cell = cellSize * start.scale
    const drops = keys.map(key => {
      const [row, col] = key.split('-').map(Number)
      return { key, row, diagonal: Math.max(0, Math.round((col * cell + start.x) / cell)) + Math.max(0, Math.round((row * cell + start.y) / cell)) }
    })
    const step = Math.min(34, span / Math.max(1, ...drops.map(drop => drop.diagonal)))
    let last = 0
    drops.forEach(({ key, row, diagonal }) => {
      const letter = surface.querySelector<HTMLElement>('[data-letter="' + key + '"]')
      if (!letter) return
      const delay = startDelay + diagonal * step
      last = Math.max(last, delay)
      letters.drop(letter, delay, fromTop ? landingHeight(row) : 36)
    })
    return last
  }

  useLayoutEffect(() => {
    if (!viewport.current || !board.current) return
    const node = viewport.current
    const letters = createLetterPhysics(node)
    physics.current = letters
    fitCamera(node)
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
    const last = rain([...revealedKeys(filledAtStart)].filter(key => key !== givenKey), 80, 820, false)
    const given = board.current.querySelector<HTMLElement>('[data-letter="' + givenKey + '"]')
    if (given) letters.drop(given, last + 220, 140, () => {
      const tile = given.parentElement
      if (tile && !matchMedia('(prefers-reduced-motion: reduce)').matches) animate(tile, { scale: [1.24, 1], rotate: [-9, 0] }, spring.play)
    })
    return () => {
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

  function boardInView() {
    const box = viewport.current?.getBoundingClientRect()
    if (box && (box.bottom < 120 || box.top > innerHeight - 120)) stage.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
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
    centerWord(slug)
    const selected = wordBySlug.get(slug)!
    setMessage(label(selected) + ', ' + selected.answer.length + ' letters. ' + nameOf(slug) + '. ' + clues[slug].result)
  }

  function transitionCase(slug: string, open: boolean) {
    const update = () => {
      setActive(slug)
      setCaseOpen(open)
      setPreview(null)
      setAnswer('')
      const top = stage.current?.getBoundingClientRect().top ?? 0
      if (top < -40 || top > innerHeight * .6) scrollTo({ top: scrollY + top, behavior: 'instant' })
    }
    if (!reduced && typeof document.startViewTransition === 'function') document.startViewTransition(() => flushSync(update))
    else update()
  }

  function openCase(slug = active, moveFocus = true) {
    if (moveFocus) {
      focusCase.current = true
      returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    }
    cancelCompletion()
    centerWord(slug)
    transitionCase(slug, true)
    setMessage(nameOf(slug) + ' is open.')
  }

  function closeCase() {
    const slug = active
    transitionCase(slug, false)
    requestAnimationFrame(() => {
      const back = returnFocus.current?.isConnected ? returnFocus.current : document.querySelector<HTMLElement>('[data-clue="' + slug + '"]') ?? viewport.current
      back?.focus({ preventScroll: true })
      returnFocus.current = null
    })
  }

  function completeWord(slug: string) {
    setSolved(current => new Set([...current, slug]))
    setCompleted(slug)
    setMessage(nameOf(slug) + ' is in the grid.')
    const crossing = crossWave(slug)
    const end = Math.max(wordBySlug.get(slug)!.answer.length * 35 + 360, ...crossing.values()) + 380
    if (completionTimer.current) clearTimeout(completionTimer.current)
    const token = completionToken.current
    completionTimer.current = setTimeout(() => {
      if (token === completionToken.current) openCase(slug, false)
    }, reduced ? 0 : Math.min(end, 1600))
  }

  function changeAnswer(value: string) {
    const cleaned = cleanAnswer(value).slice(0, 24)
    cancelCompletion()
    if (caseOpen) setCaseOpen(false)
    setAnswer(cleaned)
    if (!cleaned) {
      setMessage('Answer cleared.')
      return
    }
    const normalized = answerKey(cleaned)
    const matches = crosswordWords.filter(item => answerKey(item.answer).startsWith(normalized))
    const next = matches.find(item => item.slug === active) ?? matches.find(item => filledAtStart.includes(item.slug)) ?? matches[0]
    if (!next) {
      setMessage('No answer starts with ' + cleaned + '.')
      return
    }
    const switched = next.slug !== active
    if (switched) {
      setActive(next.slug)
      centerWord(next.slug)
    }
    boardInView()
    const grew = cleaned.length > answer.length || switched
    const complete = answerKey(next.answer) === normalized
    const token = completionToken.current
    const land = complete ? () => { if (token === completionToken.current) completeWord(next.slug) } : undefined
    requestAnimationFrame(() => {
      const surface = board.current
      if (!surface || !grew) { land?.(); return }
      const first = switched ? 0 : cleaned.length - 1
      for (let index = first; index < cleaned.length; index += 1) {
        const row = next.row + (next.direction === 'down' ? index : 0)
        const letter = surface.querySelector<HTMLElement>('[data-letter="' + cellAt(next, index) + '"]')
        const last = index === cleaned.length - 1
        if (letter) physics.current?.drop(letter, (index - first) * 45, landingHeight(row), last ? land : undefined)
        else if (last) land?.()
      }
    })
    setMessage(label(next) + ', ' + cleaned.length + ' of ' + next.answer.length + ' letters.')
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
      if (target.closest('input, textarea, select, [contenteditable="true"], .fk-recreation') || event.metaKey || event.ctrlKey || event.altKey || event.isComposing) return
      if (/^[a-zA-ZëË]$/.test(event.key)) {
        event.preventDefault()
        changeAnswer((caseOpen ? '' : answer) + event.key)
      } else if (event.key === 'Backspace' && answer && !caseOpen) {
        event.preventDefault()
        changeAnswer(answer.slice(0, -1))
      } else if (event.key === 'Escape' && caseOpen) {
        closeCase()
      }
    }
    document.addEventListener('keydown', typeAnywhere)
    return () => document.removeEventListener('keydown', typeAnywhere)
  })

  function toggleSolve() {
    cancelCompletion()
    setAnswer('')
    if (full) {
      setSolved(new Set(filledAtStart))
      setMessage(filledAtStart.length + ' answers filled. The other ' + restWords.length + ' are empty again.')
      return
    }
    const before = revealedKeys(solved)
    flushSync(() => setSolved(new Set(allAnswers)))
    rain([...revealedKeys(allAnswers)].filter(key => !before.has(key)), 0, 900, true)
    setMessage('All ' + allAnswers.length + ' answers are filled.')
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
    selectWord(wordIds[currentIndex < 0 ? 0 : (currentIndex + 1) % wordIds.length])
    viewport.current?.focus({ preventScroll: true })
  }

  function findInGrid(slug: string) {
    if (caseOpen) setCaseOpen(false)
    selectWord(slug)
    stage.current?.scrollIntoView({ block: 'start', behavior: reduced ? 'instant' : 'smooth' })
    viewport.current?.focus({ preventScroll: true })
  }

  const previewOn = (slug: string) => ({ onPointerEnter: () => setPreview(slug), onPointerLeave: () => setPreview(null), onFocus: () => setPreview(slug), onBlur: () => setPreview(null) })

  return <main className="draft-crossword" data-case={caseOpen}>
    <title>Fjalëkryq: the work of Gentrit Rashiti</title>
    <a className="fk-skip" href="#fk-side">Skip the board: read the work as a list</a>
    <header className="fk-header">
      <p className="fk-setter"><Tiles text="GENTRIT RASHITI" /><span className="fk-sr">Gentrit Rashiti</span><span className="fk-setter-role">Web and mobile apps · Kosovo</span></p>
      <nav aria-label="Contact"><a href={links.cv}>CV</a><a href={'mailto:' + links.email}>Email</a></nav>
    </header>
    <div className="fk-stage" ref={stage}>
      <div className="fk-identity">
        <h1>Gentrit Rashiti builds web and mobile apps.</h1>
        <p>5+ years. Part of two platform rewrites. Based in Kosovo, working remotely.</p>
      </div>
      <section className="fk-board-column" aria-labelledby="fk-puzzle-title">
        <div className="fk-board-bar">
          <h2 id="fk-puzzle-title" lang="sq">Fjalëkryq</h2>
          <p>Albanian for crossword · {solved.size} of {allAnswers.length} filled</p>
          <button className="fk-solve" type="button" aria-pressed={full} onClick={toggleSolve}>{full ? 'Empty the other ' + restWords.length : 'Solve it'}</button>
        </div>
        <div className="fk-board-viewport" ref={viewport} tabIndex={0} role="group" aria-label="Crossword board" aria-describedby="fk-board-help" onKeyDown={boardKeys} onPointerDown={startPointer} onPointerMove={movePointer} onPointerUp={endPointer} onPointerCancel={endPointer}>
          <div className="fk-board" ref={board} aria-hidden="true" style={{ width: boardWidth, height: boardHeight, transform: 'translate(' + camera.x + 'px,' + camera.y + 'px) scale(' + camera.scale + ')' }}>
            <motion.div className="fk-highlight" initial={false} animate={{ left: highlight.col * cellSize - 1, top: highlight.row * cellSize - 1, width: (highlight.direction === 'across' ? highlight.answer.length : 1) * cellSize + 2, height: (highlight.direction === 'down' ? highlight.answer.length : 1) * cellSize + 2 }} transition={reduced ? { duration: 0 } : spring.ui} />
            {crosswordCells.map(cell => {
              const key = cellKey(cell.row, cell.col)
              const waveWord = completed && cell.wordIds.includes(completed) ? wordBySlug.get(completed)! : null
              const waveIndex = waveWord ? (waveWord.direction === 'across' ? cell.col - waveWord.col : cell.row - waveWord.row) : 0
              const crossDelay = !waveWord ? wave?.get(key) : undefined
              return <div key={key} className="fk-cell" data-selected={cell.wordIds.includes(highlight.slug)} data-given={key === givenKey} data-complete={Boolean(waveWord)} data-cross={crossDelay !== undefined} onClick={event => chooseCell(cell.wordIds, event.timeStamp)} onDoubleClick={() => openCase(cell.wordIds.includes(active) ? active : cell.wordIds[0])} style={{ left: cell.col * cellSize, top: cell.row * cellSize, '--fk-wave-delay': waveIndex * 35 + 'ms', '--fk-cross-delay': (crossDelay ?? 0) + 'ms' } as CSSProperties}>
                {cell.number && <small>{cell.number}</small>}<span data-letter={key}>{revealed.has(key) ? cell.letter : ''}</span>
              </div>
            })}
          </div>
        </div>
        <p id="fk-board-help" className="fk-sr">Arrow keys move between answers. Enter opens the selected work. Type a project name to fill it in. Tab leaves the board.</p>
        <div className="fk-answer-bar">
          <p className="fk-hint" aria-hidden="true">{typing ? <><b>{label(word)}</b> {answer.length} of {word.answer.length} letters</> : <>Type a project name. <span>Its letters fall into place.</span></>}</p>
          <form className="fk-answer-form" onSubmit={event => { event.preventDefault(); submitAnswer() }}>
            <label htmlFor="fk-answer" className="fk-sr">Type a project name, for example Viva Fresh</label>
            <input ref={input} id="fk-answer" autoComplete="off" autoCapitalize="characters" spellCheck={false} value={answer} placeholder="VIVAFRESH" onChange={event => changeAnswer(event.target.value)} />
            <button type="button" className="fk-e" lang="sq" aria-label="Add the Albanian letter Ë" onClick={() => { changeAnswer(answer + 'Ë'); input.current?.focus() }}>Ë</button>
            <button type="submit" className="fk-check" aria-label={answer ? 'Check the answer' : 'Open ' + nameOf(active)}><Arrow /></button>
          </form>
        </div>
        <p className="fk-sr" role="status" aria-live="polite" aria-atomic="true">{message}</p>
      </section>
      <aside className="fk-side" id="fk-side" aria-label={caseOpen ? nameOf(active) : 'The work'}>
        {caseOpen ? <article className="fk-case" aria-labelledby="fk-case-title">
          <div className="fk-case-head"><button type="button" onClick={closeCase} aria-label="Back to the clues"><Arrow back /></button><span><span className="fk-num">{word.number}</span> {word.direction === 'across' ? 'Across' : 'Down'} · {word.answer.length} letters</span></div>
          <h2 id="fk-case-title" ref={caseTitle} tabIndex={-1} style={{ viewTransitionName: 'fk-case-title' }}>{nameOf(active)}</h2>
          <p className="fk-case-lede" style={{ viewTransitionName: 'fk-case-clue' }}>{clue.result}</p>
          <motion.div className="fk-case-body" initial={reduced ? false : { opacity: 0, y: 8, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={reduced ? { duration: 0 } : { duration: dur.panel, ease: ease.arrive, delay: .12 }}>
            <p className="fk-case-meta">{clue.concept ?? project.kind} · {project.role} · {project.years ?? 'Freelance'}</p>
            {clue.scope && <p className="fk-case-scope">{clue.scope}</p>}
            <CaseMedia slug={active} />
            <div className="fk-project-links">
              {project.featured && <a href={'/work/' + active}>Read the full case <Arrow /></a>}
              {project.links.map(link => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label}<Arrow /></a>)}
              {ownOrder.includes(active) && <a href={'#fk-own-' + active}>See it large <Arrow /></a>}
            </div>
          </motion.div>
        </article> : <section className="fk-work" aria-labelledby="fk-work-title">
          <h2 id="fk-work-title" className="fk-list-title">The work <span>seven answers, filled in</span></h2>
          <ol className="fk-clues">
            {featuredOrder.map(slug => {
              const item = wordBySlug.get(slug)!
              const current = slug === active
              return <li key={slug}><button type="button" className="fk-clue" data-clue={slug} data-current={(preview ?? active) === slug} onClick={() => openCase(slug)} {...previewOn(slug)}>
                <span className="fk-clue-result" style={current ? { viewTransitionName: 'fk-case-clue' } : undefined}>{clues[slug].result}</span>
                <span className="fk-clue-line"><span className="fk-num">{item.number}</span><span>{item.direction === 'across' ? 'Across' : 'Down'}</span><b style={current ? { viewTransitionName: 'fk-case-title' } : undefined}>{nameOf(slug)}</b></span>
                <span className="fk-clue-open">Open<Arrow /></span>
              </button></li>
            })}
          </ol>
        </section>}
      </aside>
    </div>
    <OwnWork words={wordBySlug} onFind={findInGrid} />
    <section className="fk-rest" aria-labelledby="fk-rest-title">
      <div className="fk-rest-head">
        <h2 id="fk-rest-title">{restWords.length} more answers</h2>
        <p>Smaller work, for clients and for fun. {full ? 'All of them are filled in.' : 'Type one, or solve the grid.'}</p>
        <button className="fk-solve" type="button" aria-pressed={full} onClick={() => { boardInView(); toggleSolve() }}>{full ? 'Empty them again' : 'Solve it'}</button>
      </div>
      <div className="fk-rest-columns">
        {restColumns.map(column => <div key={column.direction}><h3>{column.direction === 'across' ? 'Across' : 'Down'}</h3><ol>
          {column.words.map(item => <li key={item.slug}><button type="button" className="fk-rest-clue" data-clue={item.slug} onClick={() => { boardInView(); openCase(item.slug) }} {...previewOn(item.slug)}>
            <span className="fk-num">{item.number}</span>
            <span><b>{nameOf(item.slug)}</b> {clues[item.slug].result} <span className="fk-enum">({item.answer.length})</span></span>
          </button></li>)}
        </ol></div>)}
      </div>
    </section>
    <footer className="fk-footer">
      <div><h2>Gentrit Rashiti</h2><p>Web and mobile apps, from the first screen to release. Also builds the server side since 2026.</p></div>
      <p lang="sq">Fjalëkryq <span lang="en">means crossword. The Ë belongs here.</span></p>
      <nav aria-label="Contact and links"><a href={'mailto:' + links.email}>Email <Arrow /></a><a href={links.github}>GitHub <Arrow /></a><a href={links.linkedin}>LinkedIn <Arrow /></a><a href={links.cv}>Download CV <Arrow /></a><a href="/drafts">All art directions <Arrow /></a></nav>
    </footer>
  </main>
}
