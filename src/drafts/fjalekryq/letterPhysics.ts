interface FallingLetter {
  element: HTMLElement
  y: number
  previousY: number
  start: number
  bounces: number
}

/** Finite Verlet falls, two rebounds, then sleep. Two substeps per frame. No continuous idle loop. */
export function createLetterPhysics(host: HTMLElement) {
  let letters: FallingLetter[] = []
  let frame = 0
  let previousTime = 0
  let visible = true
  let disposed = false

  function tick(time: number) {
    frame = 0
    if (disposed || !visible || document.hidden) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      letters.forEach(letter => letter.element.style.removeProperty('transform'))
      letters = []
      return
    }
    const step = Math.min(1.5, previousTime ? (time - previousTime) / 16.667 : 1)
    previousTime = time
    letters = letters.filter(letter => {
      if (!letter.element.isConnected) return false
      if (time < letter.start) return true
      for (let substep = 0; substep < 2; substep += 1) {
        const velocity = (letter.y - letter.previousY) * .9925
        letter.previousY = letter.y
        letter.y += velocity + .195 * step * step
        if (letter.y >= 0) {
          letter.y = 0
          letter.bounces += 1
          if (letter.bounces >= 3 || Math.abs(velocity) < .25) {
            letter.element.style.removeProperty('transform')
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
    drop(element: HTMLElement, delay = 0, height = 27) {
      if (disposed || matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const falling = letters.find(letter => letter.element === element)
      if (falling) { falling.start = Math.min(falling.start, performance.now() + delay); resume(); return }
      const y = -height
      element.style.transform = `translate3d(0,${y}px,0)`
      letters.push({ element, y, previousY: y - .6, start: performance.now() + delay, bounces: 0 })
      resume()
    },
    dispose() {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      document.removeEventListener('visibilitychange', resume)
      letters.forEach(letter => letter.element.style.removeProperty('transform'))
      letters = []
    },
  }
}
