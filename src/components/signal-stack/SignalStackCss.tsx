import { useEffect, useRef, type CSSProperties } from 'react'
import type { ChannelKey } from '../../content/channels'
import { cn } from '../../lib/cn'
import { FORWARD, PANE_H, PANE_SCALE, PANE_W, VIEW_H, DESIGN_ASPECT, panePose, type PanePose } from './layout'
import { tracePoints, waveIndex } from './waves'

interface SignalStackCssProps {
  channels: ChannelKey[]
  still?: boolean
  lostSignal?: boolean
  active: ChannelKey
  className?: string
}

/*
 * One scene unit in CSS lengths. The root is a size container. Height maps to the camera's
 * view height; a box narrower than the design aspect scales the stack down, as the scene does.
 */
const UNIT = `min(${(100 / VIEW_H).toFixed(3)}cqh, ${(100 / VIEW_H / DESIGN_ASPECT).toFixed(3)}cqw)`
/* Container units resolve against an ancestor container, so perspective sits one level inside the root. */
const PERSPECTIVE = `${((6 * 100) / VIEW_H).toFixed(2)}cqh`

const traces = new Map<string, string>()
function trace(key: ChannelKey, i: number) {
  let pts = traces.get(key)
  if (!pts) {
    pts = tracePoints(waveIndex[key], i * 0.37)
    traces.set(key, pts)
  }
  return pts
}

/**
 * The Signal Stack drawn with CSS 3D transforms. It is the first paint, the reduced-motion
 * view, and the fallback when WebGL is not available or too slow.
 */
export function SignalStackCss({ channels, active, className, still = false, lostSignal = false }: SignalStackCssProps) {
  const stage = useRef<HTMLDivElement>(null)
  const centre = Math.max(0, channels.indexOf(active))
  const pose: PanePose = { x: 0, z: 0, yaw: 0 }

  useEffect(() => {
    const el = stage.current
    if (!el) return
    const fine = window.matchMedia('(pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let raf = 0
    function onMove(e: PointerEvent) {
      if (!fine.matches || reducedMotion.matches || lostSignal || !el) return
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect()
        const nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width * 0.9)))
        const ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height * 0.9)))
        el.style.setProperty('--tilt-yaw', `${(nx * (still ? 2 : 5)).toFixed(2)}deg`)
        el.style.setProperty('--tilt-pitch', `${(ny * (still ? 1 : 3)).toFixed(2)}deg`)
      })
    }
    function onLeave() {
      el?.style.setProperty('--tilt-yaw', '0deg')
      el?.style.setProperty('--tilt-pitch', '0deg')
    }
    const pointerSurface = still ? el : window
    const leaveSurface = still ? el : document.documentElement
    pointerSurface.addEventListener('pointermove', onMove as EventListener, { passive: true })
    leaveSurface.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      pointerSurface.removeEventListener('pointermove', onMove as EventListener)
      leaveSurface.removeEventListener('pointerleave', onLeave)
    }
  }, [still, lostSignal])

  return (
    <div aria-hidden className={cn('relative size-full overflow-hidden [container-type:size]', lostSignal && 'grayscale', className)}>
      <div className="absolute inset-0" style={{ perspective: PERSPECTIVE }}>
        <div
          ref={stage}
          className="absolute inset-0 [transform-style:preserve-3d] transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={{
            transform: 'rotateX(calc(-6deg - var(--tilt-pitch, 0deg))) rotateY(var(--tilt-yaw, 0deg))',
          }}
        >
          {channels.map((key, i) => {
            const on = key === active
            panePose(i, centre, channels.length, pose)
            const style = {
              width: `calc(${PANE_W * PANE_SCALE} * ${UNIT})`,
              height: `calc(${PANE_H * PANE_SCALE} * ${UNIT})`,
              marginLeft: `calc(${(-PANE_W * PANE_SCALE) / 2} * ${UNIT})`,
              marginTop: `calc(${(-PANE_H * PANE_SCALE) / 2} * ${UNIT})`,
              borderRadius: `calc(${0.045 * PANE_SCALE} * ${UNIT})`,
              transform: `translate3d(calc(${pose.x.toFixed(4)} * ${UNIT}), 0, calc(${(pose.z + (on ? FORWARD : 0)).toFixed(4)} * ${UNIT})) rotateY(${pose.yaw.toFixed(4)}rad)`,
            } as CSSProperties
            return (
              <div
                key={key}
                data-channel={key}
                style={style}
                className={cn(
                  'absolute top-1/2 left-1/2 border bg-panel-2 transition-[transform,border-color] duration-[450ms] ease-out motion-reduce:transition-none',
                  on
                    ? 'border-[color-mix(in_oklab,var(--tint)_70%,var(--hairline-strong))]'
                    : 'border-[color-mix(in_oklab,var(--tint)_32%,var(--hairline))]',
                )}
              >
                <div
                  className={cn(
                    'absolute inset-0 transition-opacity duration-[450ms] ease-out',
                    on ? 'opacity-100' : 'opacity-40',
                  )}
                >
                  <span className="absolute top-[13.8%] left-[7.5%] h-[4.4%] w-[10%] rounded-[1px] bg-tint" />
                  <span className="absolute top-[31%] left-[7.5%] h-px w-[38.75%] bg-hairline-strong" />
                  <span className="absolute top-[39%] left-[7.5%] h-px w-[23.75%] bg-hairline-strong" />
                  <svg
                    viewBox="0 0 136 30"
                    preserveAspectRatio="none"
                    className="absolute top-[52%] left-[7.5%] h-[30%] w-[85%] overflow-visible text-tint"
                  >
                    <line
                      x1="0"
                      x2="136"
                      y1="15"
                      y2="15"
                      className="stroke-hairline-strong"
                      strokeWidth="1"
                      vectorEffect="non-scaling-stroke"
                    />
                    <polyline
                      points={lostSignal ? "0,15 136,15" : trace(key, i)}
                      fill="none"
                      stroke="currentColor"
                      strokeOpacity={0.55}
                      strokeWidth="1.25"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                    />
                    <polyline
                      points={lostSignal ? "0,15 136,15" : trace(key, i)}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      pathLength={100}
                      strokeDasharray="18 82"
                      vectorEffect="non-scaling-stroke"
                      className="motion-reduce:hidden"
                      style={{
                        animationName: still || lostSignal ? 'none' : 'signal-stack-sweep',
                        animationDuration: `${on ? 3 : 9}s`,
                        animationTimingFunction: 'linear',
                        animationIterationCount: 'infinite',
                        animationDelay: `${-i * 1.3}s`,
                      }}
                    />
                  </svg>
                </div>
                {on && !lostSignal && (
                  <span className="absolute top-[13.2%] left-[89.5%] aspect-square w-[3.5%] rounded-full bg-signal" />
                )}
              </div>
            )
          })}
        </div>
      </div>
      <style>{'@keyframes signal-stack-sweep{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}'}</style>
    </div>
  )
}
