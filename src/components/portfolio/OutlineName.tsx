import { useEffect, useRef, type ReactNode } from 'react'

/** Two ink outlines trail velocity; the readable name never moves. */
export function OutlineName({ children }: { children: ReactNode }) {
  const host = useRef<HTMLSpanElement>(null)
  const near = useRef<HTMLSpanElement>(null)
  const far = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const node = host.current
    if (!node) return
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    const fine = matchMedia('(hover: hover) and (pointer: fine)')
    let frame = 0, lastFrame = 0, pointerTime = 0, pointerX = 0, pointerY = 0
    let x = 0, y = 0, vx = 0, vy = 0, targetX = 0, targetY = 0
    const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value))
    function paint() {
      const progress = reduced.matches ? 0 : clamp(-node!.getBoundingClientRect().top / innerHeight, 1)
      if (near.current) near.current.style.transform = `perspective(800px) translate3d(${x}px,${y}px,0) rotateX(${progress * 6}deg)`
      if (far.current) far.current.style.transform = `perspective(800px) translate3d(${x * 1.7}px,${y * 1.7}px,0) rotateX(${progress * 9}deg)`
    }
    function tick(now: number) {
      const dt = Math.min((now - lastFrame) / 1000 || 1 / 60, 1 / 30)
      lastFrame = now
      vx += (350 * (targetX - x) - 35 * vx) * dt
      vy += (350 * (targetY - y) - 35 * vy) * dt
      x += vx * dt; y += vy * dt
      paint()
      if (Math.abs(targetX - x) + Math.abs(targetY - y) + Math.abs(vx) + Math.abs(vy) > .02) frame = requestAnimationFrame(tick)
      else { frame = 0; lastFrame = 0 }
    }
    function start() { if (!frame) frame = requestAnimationFrame(tick) }
    function move(event: PointerEvent) {
      if (reduced.matches || !fine.matches || event.pointerType !== 'mouse') return
      const dt = Math.max(8, event.timeStamp - pointerTime)
      const velocityX = pointerTime ? (event.clientX - pointerX) / dt * 1000 : 0
      const velocityY = pointerTime ? (event.clientY - pointerY) / dt * 1000 : 0
      const box = node!.getBoundingClientRect()
      targetX = clamp(velocityX * .008 + (event.clientX - box.left - box.width / 2) * .015, 10)
      targetY = clamp(velocityY * .008 + (event.clientY - box.top - box.height / 2) * .015, 7)
      pointerX = event.clientX; pointerY = event.clientY; pointerTime = event.timeStamp
      start()
    }
    function leave() { targetX = 0; targetY = 0; pointerTime = 0; start() }
    function preference() {
      if (!reduced.matches) return
      cancelAnimationFrame(frame); frame = 0
      x = y = vx = vy = targetX = targetY = 0
      paint()
    }
    node.addEventListener('pointermove', move)
    node.addEventListener('pointerleave', leave)
    window.addEventListener('scroll', paint, { passive: true })
    reduced.addEventListener('change', preference)
    return () => {
      cancelAnimationFrame(frame)
      node.removeEventListener('pointermove', move)
      node.removeEventListener('pointerleave', leave)
      window.removeEventListener('scroll', paint)
      reduced.removeEventListener('change', preference)
    }
  }, [])
  return <span className="old-outline-name" ref={host}>
    <span className="old-outline-main">{children}</span>
    <span className="old-outline-copy" aria-hidden="true" ref={near}>{children}</span>
    <span className="old-outline-copy old-outline-far" aria-hidden="true" ref={far}>{children}</span>
  </span>
}
