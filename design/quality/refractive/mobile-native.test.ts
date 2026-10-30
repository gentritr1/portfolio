import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createElement, type MouseEvent, type PointerEvent } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { useScreenSwipe } from '../../../src/drafts/refractive-engine/useScreenSwipe.ts'

function setup() {
  const directions: number[] = [], captures: number[] = []
  let starts = 0
  let handlers: ReturnType<typeof useScreenSwipe>
  function Harness() {
    handlers = useScreenSwipe((direction) => directions.push(direction), () => starts++)
    return null
  }
  renderToStaticMarkup(createElement(Harness))
  const surface = { setPointerCapture: (id: number) => captures.push(id) }
  const pointer = (x: number, y: number, options: Partial<PointerEvent<HTMLElement>> = {}) => ({
    pointerId: 1, pointerType: 'touch', isPrimary: true, clientX: x, clientY: y,
    currentTarget: surface, target: surface, ...options,
  }) as PointerEvent<HTMLElement>
  const click = (detail = 1) => {
    let prevented = false, stopped = false
    handlers.onClickCapture({ detail, preventDefault: () => { prevented = true }, stopPropagation: () => { stopped = true } } as MouseEvent<HTMLElement>)
    return { prevented, stopped }
  }
  return { handlers: handlers!, pointer, click, directions, captures, starts: () => starts }
}

test('a tap reaches the image button and does not capture the pointer', () => {
  const s = setup()
  s.handlers.onPointerDown(s.pointer(100, 100))
  s.handlers.onPointerUp(s.pointer(103, 102))
  assert.deepEqual(s.directions, [])
  assert.deepEqual(s.captures, [])
  assert.deepEqual(s.click(), { prevented: false, stopped: false })
})

test('a horizontal swipe changes one screen and suppresses the image-opening click', () => {
  const s = setup()
  s.handlers.onPointerDown(s.pointer(150, 100))
  s.handlers.onPointerMove(s.pointer(130, 102))
  s.handlers.onPointerUp(s.pointer(70, 105))
  assert.deepEqual(s.captures, [1])
  assert.deepEqual(s.directions, [1])
  assert.deepEqual(s.click(), { prevented: true, stopped: true })
  // A deliberate new tap is never swallowed by an old swipe.
  s.handlers.onPointerDown(s.pointer(80, 100))
  s.handlers.onPointerUp(s.pointer(80, 100))
  assert.equal(s.click().prevented, false)
})

test('a vertical scroll cannot turn into a screen change later', () => {
  const s = setup()
  s.handlers.onPointerDown(s.pointer(100, 100))
  s.handlers.onPointerMove(s.pointer(103, 130))
  s.handlers.onPointerUp(s.pointer(200, 132))
  assert.deepEqual(s.directions, [])
  assert.deepEqual(s.captures, [])
})

test('a second finger cancels a pending swipe', () => {
  const s = setup()
  s.handlers.onPointerDown(s.pointer(100, 100))
  s.handlers.onPointerDown(s.pointer(160, 100, { pointerId: 2, isPrimary: false }))
  s.handlers.onPointerMove(s.pointer(30, 100))
  s.handlers.onPointerUp(s.pointer(20, 100))
  assert.deepEqual(s.directions, [])
})

test('pointer cancellation and lost capture cannot complete a swipe', () => {
  for (const cancel of ['onPointerCancel', 'onLostPointerCapture'] as const) {
    const s = setup()
    s.handlers.onPointerDown(s.pointer(100, 100))
    s.handlers.onPointerMove(s.pointer(70, 100))
    s.handlers[cancel](s.pointer(70, 100))
    s.handlers.onPointerUp(s.pointer(10, 100))
    assert.deepEqual(s.directions, [])
  }
})

test('an unrelated pointer release does not finish the active gesture', () => {
  const s = setup()
  s.handlers.onPointerDown(s.pointer(100, 100))
  s.handlers.onPointerMove(s.pointer(130, 100))
  s.handlers.onPointerUp(s.pointer(180, 100, { pointerId: 2 }))
  assert.deepEqual(s.directions, [])
  s.handlers.onPointerUp(s.pointer(180, 100))
  assert.deepEqual(s.directions, [-1])
})

test('taking capture from the image button does not cancel the figure swipe', () => {
  const s = setup()
  s.handlers.onPointerDown(s.pointer(100, 100))
  s.handlers.onPointerMove(s.pointer(70, 100))
  s.handlers.onLostPointerCapture(s.pointer(70, 100, { target: {} as HTMLElement }))
  s.handlers.onPointerUp(s.pointer(10, 100))
  assert.deepEqual(s.directions, [1])
})

test('mouse and keyboard interaction remain native', () => {
  const s = setup()
  s.handlers.onPointerDown(s.pointer(100, 100, { pointerType: 'mouse' }))
  s.handlers.onPointerMove(s.pointer(20, 100, { pointerType: 'mouse' }))
  s.handlers.onPointerUp(s.pointer(20, 100, { pointerType: 'mouse' }))
  assert.equal(s.starts(), 0)
  assert.deepEqual(s.directions, [])
  s.handlers.onPointerDown(s.pointer(100, 100))
  s.handlers.onPointerMove(s.pointer(50, 100))
  s.handlers.onPointerUp(s.pointer(20, 100))
  assert.equal(s.click(0).prevented, false)
})
