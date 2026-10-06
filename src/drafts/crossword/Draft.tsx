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
const playOrder = [...restWords].sort((a, b) => a.number - b.number || (a.direction === 'across' ? -1 : 1))
const answerKey = (value: string) => value.toLocaleUpperCase().replace(/Ë/g, 'E').replace(/[^A-Z]/g, '')
const cleanAnswer = (value: string) => value.toLocaleUpperCase().replace(/[^A-ZË]/g, '')
const label = (word: CrosswordWord) => word.number + ' ' + (word.direction === 'across' ? 'Across' : 'Down')
const isPhone = () => matchMedia('(max-width: 760px)').matches
const tryWord = 'VIVAFRESH'

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

function Arrow({ turn = 0, className }: { turn?: number; className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" style={turn ? { transform: 'rotate(' + turn + 'deg)' } : undefined}><path d="M4 12h15M12 5l7 7-7 7" /></svg>
}

function Tiles({ text }: { text: string }) {
  return <span className="fk-tiles" aria-hidden="true">{text.split(' ').map(part => <span key={part}>{Array.from(part).map((letter, index) => <i key={index}>{letter}</i>)}</span>)}</span>
}

const leadShot: Record<string, number> = { incentiv: 2 }

function LeadMedia({ slug }: { slug: string }) {
  const project = projectOf(slug)
  const rec = slug === 'care-platform' ? recreations.care : slug === 'design-system-react' ? recreations['design-system'] : null
  if (rec) return <figure className="fk-lead-media" data-kind="recreation">
    <div className="fk-recreation @container" data-world={rec.world} role="group" aria-label={rec.name + ', recreation with invented data'}>
      <Suspense fallback={<span className="fk-wait">Loading the recreation</span>}><rec.Component /></Suspense>
    </div>
    <figcaption>Recreation · invented data</figcaption>
  </figure>
  if (ownOrder.includes(slug)) return null
  const gallery = project.media.galleries?.[0]
  if (!gallery) return null
  const phone = gallery.aspect === 'phone'
  const items = phone ? gallery.items.slice(0, 3) : [gallery.items[leadShot[slug] ?? 0]]
  return <figure className="fk-lead-media" data-kind={gallery.aspect}>
    <div>{items.map(image => <img key={image.src} src={image.src} alt={image.alt} width={image.width} height={image.height} decoding="async" />)}</div>
    <figcaption>{phone ? 'Store screenshots, public.' : 'Public page: ' + items[0].caption.toLowerCase() + '.'}</figcaption>
  </figure>
}

export default function Draft() {
  const [active, setActive] = useState(featuredOrder[0])
  const [lead, setLead] = useState(featuredOrder[0])
  const [preview, setPreview] = useState<string | null>(null)
  const [solved, setSolved] = useState(() => new Set(filledAtStart))
  const [answer, setAnswer] = useState('')
  const [wrong, setWrong] = useState(false)
  const [message, setMessage] = useState('')
  const [completed, setCompleted] = useState('')
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, scale: .6 })
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const viewport = useRef<HTMLDivElement>(null)
  const board = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const identity = useRef<HTMLDivElement>(null)
  const boardColumn = useRef<HTMLElement>(null)
  const side = useRef<HTMLElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const leadTitle = useRef<HTMLHeadingElement>(null)
  const leadLede = useRef<HTMLParagraphElement>(null)
  const physics = useRef<ReturnType<typeof createLetterPhysics> | null>(null)
  const completionTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
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
  const leadWord = wordBySlug.get(lead)!
  const leadProject = projectOf(lead)
  const leadClue = clues[lead]
  const wave = useMemo(() => completed ? crossWave(completed) : null, [completed])
  const puzzle = !solved.has(active)
  const typing = answer.length > 0
  const full = solved.size === allAnswers.length
  const restLeft = restWords.filter(item => !solved.has(item.slug)).length
  const listed = featuredOrder.filter(slug => slug !== lead)

  const revealed = revealedKeys([...solved].filter(slug => !(typing && !puzzle && slug === active)))
  const typed = new Map<string, string>()
  if (typing && puzzle) Array.from(answer).forEach((letter, index) => typed.set(cellAt(word, index), letter))
  else if (typing && answerKey(word.answer).startsWith(answerKey(answer))) for (let index = 0; index < answer.length; index += 1) typed.set(cellAt(word, index), word.answer[index])

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
    const scale = fitScale.current
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
    if (!viewport.current || !board.current || !stage.current || !identity.current) return
    const node = viewport.current
    const room = stage.current
    const head = identity.current
    const letters = createLetterPhysics(node)
    physics.current = letters
    room.style.setProperty('--fk-ident', head.offsetHeight + 'px')
    fitCamera(node)
    let width = node.clientWidth
    let height = node.clientHeight
    const observer = new ResizeObserver(() => {
      room.style.setProperty('--fk-ident', head.offsetHeight + 'px')
      if (node.clientWidth === width && node.clientHeight === height) return
      width = node.clientWidth
      height = node.clientHeight
      cancelAnimationFrame(cameraFrame.current)
      fitCamera(node)
    })
    observer.observe(node)
    observer.observe(head)
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
      if (typingTimer.current) clearTimeout(typingTimer.current)
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

  function boardInView(smooth = false) {
    const box = viewport.current?.getBoundingClientRect()
    if (!box || (box.top >= 0 && box.bottom <= innerHeight + 40)) return
    const target = isPhone() ? boardColumn.current : stage.current
    target?.scrollIntoView({ block: 'start', behavior: smooth && !reduced ? 'smooth' : 'instant' })
  }

  function cancelCompletion() {
    completionToken.current += 1
    if (completionTimer.current) clearTimeout(completionTimer.current)
    if (typingTimer.current) clearTimeout(typingTimer.current)
    setCompleted('')
  }

  function selectWord(slug: string) {
    cancelCompletion()
    setActive(slug)
    setAnswer('')
    setWrong(false)
    centerWord(slug)
    const selected = wordBySlug.get(slug)!
    setMessage(label(selected) + ', ' + selected.answer.length + ' letters. ' + (solved.has(slug) ? nameOf(slug) + '. ' : '') + clues[slug].result)
  }

  /** The clicked clue and the old lead swap places in one view transition. */
  function openLead(slug: string, { focus = true, scroll = true } = {}) {
    cancelCompletion()
    centerWord(slug)
    const old = lead
    const keep = scroll ? null : boardColumn.current
    const keepTop = keep?.getBoundingClientRect().top ?? 0
    const update = () => {
      setLead(slug)
      setActive(slug)
      setPreview(null)
      setAnswer('')
      setWrong(false)
    }
    const after = () => {
      if (keep) scrollBy({ top: keep.getBoundingClientRect().top - keepTop, behavior: 'instant' })
      const panel = side.current?.getBoundingClientRect()
      if (scroll && panel && (panel.top < -40 || panel.top > innerHeight * .6)) side.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
      if (focus) leadTitle.current?.focus({ preventScroll: true })
    }
    if (!reduced && slug !== old && typeof document.startViewTransition === 'function') {
      const row = document.querySelector<HTMLElement>('[data-clue="' + slug + '"] .fk-clue-result')
      const lede = leadLede.current
      if (row) row.style.viewTransitionName = 'fk-lead-clue'
      if (lede) lede.style.viewTransitionName = row ? 'fk-lead-back' : 'fk-lead-clue'
      const transition = document.startViewTransition(() => {
        flushSync(update)
        if (leadLede.current) leadLede.current.style.viewTransitionName = 'fk-lead-clue'
        const back = document.querySelector<HTMLElement>('[data-clue="' + old + '"] .fk-clue-result')
        if (back && row) back.style.viewTransitionName = 'fk-lead-back'
        after()
      })
      transition.finished.finally(() => {
        document.querySelectorAll<HTMLElement>('.fk-clue-result').forEach(element => element.style.removeProperty('view-transition-name'))
      })
    } else {
      flushSync(update)
      after()
    }
    setMessage(nameOf(slug) + ' is open.')
  }

  function completeWord(slug: string) {
    setSolved(current => new Set([...current, slug]))
    setActive(slug)
    setCompleted(slug)
    setWrong(false)
    setMessage(nameOf(slug) + ' is in the grid.')
    const crossing = crossWave(slug)
    const end = Math.max(wordBySlug.get(slug)!.answer.length * 35 + 360, ...crossing.values()) + 380
    if (completionTimer.current) clearTimeout(completionTimer.current)
    const token = completionToken.current
    completionTimer.current = setTimeout(() => {
      if (token === completionToken.current) openLead(slug, { focus: false, scroll: !isPhone() })
    }, reduced ? 0 : Math.min(end, 1600))
  }

  function missWord() {
    setWrong(true)
    setMessage('That is not ' + label(word) + '. Delete a letter and try again, or show the answer.')
  }

  function dropTyped(target: CrosswordWord, first: number, length: number, land?: () => void) {
    requestAnimationFrame(() => {
      const surface = board.current
      if (!surface) { land?.(); return }
      for (let index = first; index < length; index += 1) {
        const row = target.row + (target.direction === 'down' ? index : 0)
        const letter = surface.querySelector<HTMLElement>('[data-letter="' + cellAt(target, index) + '"]')
        const last = index === length - 1
        if (letter) physics.current?.drop(letter, (index - first) * 45, landingHeight(row), last ? land : undefined)
        else if (last) land?.()
      }
    })
  }

  function changeAnswer(value: string) {
    const cleaned = cleanAnswer(value).slice(0, 24)
    cancelCompletion()
    setWrong(false)
    const token = completionToken.current
    if (puzzle) {
      const limited = cleaned.slice(0, word.answer.length)
      setAnswer(limited)
      if (!limited) { setMessage('Answer cleared.'); return }
      boardInView()
      const target = word
      const complete = limited.length === target.answer.length
      const right = answerKey(limited) === answerKey(target.answer)
      const land = complete ? () => { if (token === completionToken.current) { if (right) completeWord(target.slug); else missWord() } } : undefined
      if (limited.length > answer.length) dropTyped(target, limited.length - 1, limited.length, land)
      else land?.()
      setMessage(label(target) + ', ' + limited.length + ' of ' + target.answer.length + ' letters.')
      return
    }
    setAnswer(cleaned)
    if (!cleaned) { setMessage('Answer cleared.'); return }
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
    const land = complete ? () => { if (token === completionToken.current) completeWord(next.slug) } : undefined
    if (grew) dropTyped(next, switched ? 0 : cleaned.length - 1, cleaned.length, land)
    else land?.()
    setMessage(label(next) + ', ' + cleaned.length + ' of ' + next.answer.length + ' letters.')
  }

  const changeRef = useRef(changeAnswer)
  useEffect(() => { changeRef.current = changeAnswer })

  function typeExample() {
    selectWord('viva-fresh')
    boardInView(true)
    let count = reduced ? tryWord.length - 1 : 0
    const next = () => {
      count += 1
      changeRef.current(tryWord.slice(0, count))
      if (count < tryWord.length) typingTimer.current = setTimeout(next, 90)
    }
    typingTimer.current = setTimeout(next, reduced ? 40 : 280)
  }

  function revealWord() {
    const slug = active
    const target = wordBySlug.get(slug)!
    cancelCompletion()
    setAnswer('')
    setWrong(false)
    const before = revealedKeys(solved)
    flushSync(() => setSolved(current => new Set([...current, slug])))
    const last = rain(Array.from(target.answer, (_, index) => cellAt(target, index)).filter(key => !before.has(key)), 0, 300, true)
    const token = completionToken.current
    completionTimer.current = setTimeout(() => { if (token === completionToken.current) completeWord(slug) }, reduced ? 0 : last + 520)
  }

  function play(slug?: string) {
    const next = slug ? wordBySlug.get(slug) : playOrder.find(item => !solved.has(item.slug))
    if (!next) {
      setMessage('All ' + allAnswers.length + ' answers are filled.')
      return
    }
    selectWord(next.slug)
    if (isPhone()) boardColumn.current?.scrollIntoView({ block: 'start', behavior: reduced ? 'instant' : 'smooth' })
    else boardInView(true)
    input.current?.focus({ preventScroll: true })
  }

  function submitAnswer() {
    if (puzzle) {
      if (answer.length === word.answer.length) {
        if (answerKey(answer) === answerKey(word.answer)) completeWord(active)
        else missWord()
      } else setMessage(label(word) + ' has ' + word.answer.length + ' letters. You typed ' + answer.length + '.')
      return
    }
    const matching = crosswordWords.find(item => answerKey(item.answer) === answerKey(answer))
    if (matching && answer) completeWord(matching.slug)
    else if (!answer) openLead(active)
    else setMessage('Not complete yet. ' + word.answer.length + ' letters.')
  }

  useEffect(() => {
    function typeAnywhere(event: globalThis.KeyboardEvent) {
      const target = event.target as HTMLElement
      if (target.closest('input, textarea, select, [contenteditable="true"], .fk-recreation') || event.metaKey || event.ctrlKey || event.altKey || event.isComposing) return
      if (/^[a-zA-ZëË]$/.test(event.key)) {
        event.preventDefault()
        changeAnswer(answer + event.key)
      } else if (event.key === 'Backspace' && answer) {
        event.preventDefault()
        changeAnswer(answer.slice(0, -1))
      } else if (event.key === 'Escape') {
        if (answer) changeAnswer('')
        else if (puzzle) selectWord(lead)
      }
    }
    document.addEventListener('keydown', typeAnywhere)
    return () => document.removeEventListener('keydown', typeAnywhere)
  })

  function toggleSolve() {
    cancelCompletion()
    setAnswer('')
    setWrong(false)
    if (full) {
      setSolved(new Set(filledAtStart))
      if (!filledAtStart.includes(lead)) setLead(featuredOrder[0])
      if (!filledAtStart.includes(active)) setActive(featuredOrder[0])
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
      if (puzzle) input.current?.focus()
      else openLead(active)
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
    if (!node || isPhone()) return
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
    if (event.button !== 0 || event.pointerType === 'touch' || isPhone()) return
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
    if (!pointers.current.has(event.pointerId)) return
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
    if (time < suppressClick.current || isPhone()) return
    const currentIndex = wordIds.indexOf(active)
    const slug = wordIds[currentIndex < 0 ? 0 : (currentIndex + 1) % wordIds.length]
    if (solved.has(slug)) openLead(slug, { focus: false })
    else selectWord(slug)
    viewport.current?.focus({ preventScroll: true })
  }

  function findInGrid(slug: string) {
    selectWord(slug)
    const target = isPhone() ? boardColumn.current : stage.current
    target?.scrollIntoView({ block: 'start', behavior: reduced ? 'instant' : 'smooth' })
    viewport.current?.focus({ preventScroll: true })
  }

  const previewOn = (slug: string) => ({ onPointerEnter: () => setPreview(slug), onPointerLeave: () => setPreview(null), onFocus: () => setPreview(slug), onBlur: () => setPreview(null) })
  const leadFeatured = featuredOrder.includes(lead)
  const leadKind = leadFeatured ? 'client work' : ownOrder.includes(lead) ? (leadClue.concept ? 'concept' : 'own project') : 'smaller work'

  return <main className="draft-crossword">
    <title>Fjalëkryq: the work of Gentrit Rashiti</title>
    <header className="fk-header">
      <p className="fk-setter"><Tiles text="GENTRIT RASHITI" /><span className="fk-sr">Gentrit Rashiti</span><span className="fk-setter-role">Web and mobile apps · Kosovo</span></p>
      <nav aria-label="Contact"><a href={links.cv}>CV</a><a href={'mailto:' + links.email}>Email</a></nav>
    </header>
    <div className="fk-stage" ref={stage}>
      <div className="fk-identity" ref={identity}>
        <h1>Gentrit Rashiti builds web and mobile apps.</h1>
        <p>5+ years. Part of two platform rewrites. Based in Kosovo, working remotely.</p>
      </div>
      <aside className="fk-side" id="fk-side" ref={side} aria-label="The work">
        <article className="fk-lead" aria-labelledby="fk-lead-title">
          <h2 id="fk-lead-title" className="fk-lead-label" ref={leadTitle} tabIndex={-1}><span className="fk-num">{leadWord.number}</span> {leadWord.direction === 'across' ? 'Across' : 'Down'} · <b>{nameOf(lead)}</b>{leadProject.years ? ' · ' + leadProject.years : ''}<span className="fk-sr">, {leadKind}</span></h2>
          <p className="fk-lead-lede" ref={leadLede} style={{ viewTransitionName: 'fk-lead-clue' }}>{leadClue.result}</p>
          <motion.div key={lead} className="fk-lead-body" initial={reduced ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={reduced ? { duration: 0 } : { duration: dur.panel, ease: ease.arrive, delay: .1 }}>
            {(leadClue.concept || leadClue.scope) && <p className="fk-lead-scope">{leadClue.concept && <b>{leadClue.concept}. </b>}{leadClue.scope}</p>}
            <LeadMedia slug={lead} />
            <div className="fk-lead-links">
              {leadProject.featured && <a href={'/work/' + lead}>Read the case <Arrow /></a>}
              {leadProject.links.map(link => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label}<span className="fk-sr"> for {leadProject.name}</span><Arrow turn={-45} /></a>)}
              {ownOrder.includes(lead) && <a href={'#fk-own-' + lead}>See it large <Arrow turn={90} /></a>}
            </div>
          </motion.div>
        </article>
        <section className="fk-work" aria-labelledby="fk-work-title">
          <h2 id="fk-work-title" className="fk-list-title">{leadFeatured ? 'More client work' : 'Client work'} <span>{listed.length} answers</span></h2>
          <ol className="fk-clues">
            {listed.map(slug => {
              const item = wordBySlug.get(slug)!
              return <li key={slug}><button type="button" className="fk-clue" data-clue={slug} data-current={preview === slug} onClick={() => openLead(slug)} {...previewOn(slug)}>
                <span className="fk-clue-result">{clues[slug].result}</span>
                <span className="fk-clue-line"><span className="fk-num">{item.number}</span><span>{item.direction === 'across' ? 'Across' : 'Down'}</span><b>{nameOf(slug)}</b></span>
                <span className="fk-clue-open">Open<Arrow /></span>
              </button></li>
            })}
          </ol>
          <button type="button" className="fk-door" onClick={() => play()}>
            <b>Play the site</b>
            <span>{restLeft ? restLeft + ' answers hidden' : 'All answers are filled'}</span>
            <Arrow className="fk-door-arrow" />
          </button>
        </section>
      </aside>
      <section className="fk-board-column" ref={boardColumn} id="fk-board" aria-labelledby="fk-puzzle-title">
        <div className="fk-board-bar">
          <h2 id="fk-puzzle-title" lang="sq">Fjalëkryq</h2>
          <p>Albanian for crossword · {solved.size} of {allAnswers.length} filled</p>
          {restLeft > 0 && <button className="fk-play" type="button" onClick={() => play()}>Play the site</button>}
          <button className="fk-solve" type="button" aria-pressed={full} onClick={toggleSolve}>{full ? 'Empty the other ' + restWords.length : 'Solve it'}</button>
        </div>
        <div className="fk-board-viewport" ref={viewport} tabIndex={0} role="group" aria-label="Crossword board" aria-describedby="fk-board-help" onKeyDown={boardKeys} onPointerDown={startPointer} onPointerMove={movePointer} onPointerUp={endPointer} onPointerCancel={endPointer}>
          <div className="fk-board" ref={board} aria-hidden="true" style={{ width: boardWidth, height: boardHeight, transform: 'translate(' + camera.x + 'px,' + camera.y + 'px) scale(' + camera.scale + ')' }}>
            <motion.div className="fk-highlight" data-open={!solved.has(highlight.slug)} initial={false} animate={{ left: highlight.col * cellSize - 1, top: highlight.row * cellSize - 1, width: (highlight.direction === 'across' ? highlight.answer.length : 1) * cellSize + 2, height: (highlight.direction === 'down' ? highlight.answer.length : 1) * cellSize + 2 }} transition={reduced ? { duration: 0 } : spring.ui} />
            {crosswordCells.map(cell => {
              const key = cellKey(cell.row, cell.col)
              const waveWord = completed && cell.wordIds.includes(completed) ? wordBySlug.get(completed)! : null
              const waveIndex = waveWord ? (waveWord.direction === 'across' ? cell.col - waveWord.col : cell.row - waveWord.row) : 0
              const crossDelay = !waveWord ? wave?.get(key) : undefined
              const selected = cell.wordIds.includes(highlight.slug)
              return <div key={key} className="fk-cell" data-selected={selected && solved.has(highlight.slug)} data-wrong={wrong && cell.wordIds.includes(active)} data-complete={Boolean(waveWord)} data-cross={crossDelay !== undefined} onClick={event => chooseCell(cell.wordIds, event.timeStamp)} style={{ left: cell.col * cellSize, top: cell.row * cellSize, '--fk-wave-delay': waveIndex * 35 + 'ms', '--fk-cross-delay': (crossDelay ?? 0) + 'ms' } as CSSProperties}>
                {cell.number && <small>{cell.number}</small>}<span data-letter={key}>{typed.get(key) ?? (revealed.has(key) ? cell.letter : '')}</span>
              </div>
            })}
          </div>
        </div>
        <p id="fk-board-help" className="fk-sr">Arrow keys move between answers. Enter opens a filled answer, or moves to the answer field for an empty one. Type a name to fill it in. Tab leaves the board.</p>
        <div className="fk-answer-bar">
          <p className="fk-hint" aria-hidden="true">{wrong ? <><b>{label(word)}</b> Not this one. Delete a letter and try again.</>
            : typing ? <><b>{label(word)}</b> {answer.length} of {word.answer.length} letters</>
              : puzzle ? <><b>{label(word)} · {word.answer.length} letters</b> {clues[active].result}</>
                : <>Type a project name. <span>Its letters fall into place.</span></>}</p>
          <div className="fk-answer-tools">
            {puzzle
              ? <button type="button" className="fk-chip" onClick={revealWord}>Show the answer</button>
              : <button type="button" className="fk-chip" onClick={typeExample}>Try <b>{tryWord}</b></button>}
            <form className="fk-answer-form" onSubmit={event => { event.preventDefault(); submitAnswer() }}>
              <label htmlFor="fk-answer" className="fk-sr">{puzzle ? 'Answer for ' + label(word) + ', ' + word.answer.length + ' letters' : 'Type a project name, for example Viva Fresh'}</label>
              <input ref={input} id="fk-answer" autoComplete="off" autoCapitalize="characters" spellCheck={false} value={answer} placeholder={puzzle ? word.answer.length + ' letters' : tryWord} onChange={event => changeAnswer(event.target.value)} />
              <button type="button" className="fk-e" lang="sq" aria-label="Add the Albanian letter Ë" onClick={() => { changeAnswer(answer + 'Ë'); input.current?.focus() }}>Ë</button>
              <button type="submit" className="fk-check" aria-label={answer ? 'Check the answer' : 'Open ' + nameOf(active)}><Arrow /></button>
            </form>
          </div>
        </div>
        <p className="fk-sr" role="status" aria-live="polite" aria-atomic="true">{message}</p>
      </section>
    </div>
    <OwnWork words={wordBySlug} onFind={findInGrid} />
    <section className="fk-rest" aria-labelledby="fk-rest-title">
      <div className="fk-rest-head">
        <h2 id="fk-rest-title">{restLeft ? restLeft + ' answers to play' : 'All ' + restWords.length + ' answers filled'}</h2>
        <p>Smaller work, for clients and for fun. A name stays hidden until you fill it in.</p>
        <button className="fk-solve" type="button" aria-pressed={full} onClick={() => { boardInView(); toggleSolve() }}>{full ? 'Empty them again' : 'Solve it'}</button>
      </div>
      <div className="fk-rest-columns">
        {restColumns.map(column => <div key={column.direction}><h3>{column.direction === 'across' ? 'Across' : 'Down'}</h3><ol>
          {column.words.map(item => {
            const known = solved.has(item.slug)
            return <li key={item.slug}><button type="button" className="fk-rest-clue" data-clue={item.slug} data-known={known} onClick={() => known ? openLead(item.slug) : play(item.slug)} {...previewOn(item.slug)}>
              <span className="fk-num">{item.number}</span>
              <span>{known && <b>{nameOf(item.slug)}</b>} {clues[item.slug].result} <span className="fk-enum">({item.answer.length}{item.slug === 'fjale' ? ', the Ë is given' : ''})</span></span>
            </button></li>
          })}
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
