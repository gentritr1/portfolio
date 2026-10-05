interface FallingLetter {
  element: HTMLElement
  y: number
  previousY: number
  start: number
  bounces: number
  onLand?: () => void
}

/** Finite Verlet falls, two rebounds, then sleep. Two substeps per frame. No continuous idle loop. */
export function createLetterPhysics(host: HTMLElement) {
  let letters: FallingLetter[] = []
  let frame = 0
  let previousTime = 0
  let visible = true
  let disposed = false

  function settle(letter: FallingLetter) {
    letter.element.style.removeProperty('transform')
    letter.element.style.removeProperty('opacity')
    delete letter.element.dataset.falling
    if (letter.bounces === 0) letter.onLand?.()
  }

  function tick(time: number) {
    frame = 0
    if (disposed || !visible || document.hidden) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      letters.forEach(settle)
      letters = []
      return
    }
    const step = Math.min(1.5, previousTime ? (time - previousTime) / 16.667 : 1)
    previousTime = time
    const now = performance.now()
    letters = letters.filter(letter => {
      if (!letter.element.isConnected) return false
      if (now < letter.start) return true
      letter.element.style.removeProperty('opacity')
      for (let substep = 0; substep < 2; substep += 1) {
        const velocity = (letter.y - letter.previousY) * .9925
        letter.previousY = letter.y
        letter.y += velocity + .195 * step * step
        if (letter.y >= 0) {
          letter.y = 0
          letter.bounces += 1
          if (letter.bounces === 1) { letter.element.dataset.falling = 'landed'; letter.onLand?.() }
          if (letter.bounces >= 3 || Math.abs(velocity) < .25) {
            settle(letter)
            return false
          }
          letter.previousY = Math.max(.6, velocity * .38)
        }
      }
      letter.element.style.transform = `translate3d(0,${letter.y.toFixed(2)}px,0)`
      return true
    })
    if (letters.length) frame = requestAnimationFrame(tick)
  }

  function resume() {
    previousTime = 0
    if (!disposed && visible && !document.hidden && letters.length && !frame) frame = requestAnimationFrame(tick)
  }

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible) resume()
  })
  observer.observe(host)
  document.addEventListener('visibilitychange', resume)

  return {
    drop(element: HTMLElement, delay = 0, height = 27, onLand?: () => void) {
      if (disposed || document.hidden || matchMedia('(prefers-reduced-motion: reduce)').matches) { onLand?.(); return }
      const falling = letters.find(letter => letter.element === element)
      if (falling) {
        falling.start = Math.min(falling.start, performance.now() + delay)
        falling.y = Math.min(falling.y, -height)
        falling.previousY = falling.y - .6
        falling.bounces = 0
        element.dataset.falling = ''
        if (onLand) falling.onLand = onLand
        resume()
        return
      }
      const y = -height
      element.style.transform = `translate3d(0,${y}px,0)`
      if (delay > 0) element.style.opacity = '0'
      element.dataset.falling = ''
      letters.push({ element, y, previousY: y - .6, start: performance.now() + delay, bounces: 0, onLand })
      resume()
    },
    dispose() {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      document.removeEventListener('visibilitychange', resume)
      letters.forEach(letter => {
        letter.element.style.removeProperty('transform')
        letter.element.style.removeProperty('opacity')
        delete letter.element.dataset.falling
      })
      letters = []
    },
  }
}
