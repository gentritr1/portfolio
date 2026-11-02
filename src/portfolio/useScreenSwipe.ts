import { useRef, type MouseEvent, type PointerEvent } from 'react'

type Gesture = { id: number; x: number; y: number; horizontal: boolean }

/** Screens own a deliberate sideways swipe; the browser keeps vertical scrolling and pinch zoom. */
export function useScreenSwipe(onSwipe: (direction: 1 | -1) => void, onStart?: () => void) {
  const gesture = useRef<Gesture | null>(null)
  const suppressClick = useRef(false)

  const cancel = (e: PointerEvent<HTMLElement>) => {
    if (gesture.current?.id === e.pointerId) gesture.current = null
  }

  return {
    onPointerDown(e: PointerEvent<HTMLElement>) {
      // A fresh press clears an old compatibility-click guard. Another finger cancels the gesture.
      if (!gesture.current) suppressClick.current = false
      if (e.pointerType !== 'touch') return
      if (!e.isPrimary) { gesture.current = null; return }
      if (gesture.current) return
      gesture.current = { id: e.pointerId, x: e.clientX, y: e.clientY, horizontal: false }
      onStart?.()
    },
    onPointerMove(e: PointerEvent<HTMLElement>) {
      const start = gesture.current
      if (!start || start.id !== e.pointerId || start.horizontal) return
      const dx = Math.abs(e.clientX - start.x), dy = Math.abs(e.clientY - start.y)
      if (dy > 12 && dy >= dx) { gesture.current = null; return }
      if (dx > 12 && dx > dy * 1.5) {
        start.horizontal = true
        suppressClick.current = true
        // Capture only once the visitor chooses a swipe, so ordinary taps still reach the image button.
        e.currentTarget.setPointerCapture(e.pointerId)
      }
    },
    onPointerUp(e: PointerEvent<HTMLElement>) {
      const start = gesture.current
      if (!start || start.id !== e.pointerId) return
      gesture.current = null
      const dx = e.clientX - start.x, dy = e.clientY - start.y
      if (start.horizontal && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) onSwipe(dx < 0 ? 1 : -1)
    },
    onPointerCancel: cancel,
    onLostPointerCapture(e: PointerEvent<HTMLElement>) {
      // Touch initially captures the image button. Its loss bubbles here when the figure takes over.
      if (e.target === e.currentTarget) cancel(e)
    },
    onClickCapture(e: MouseEvent<HTMLElement>) {
      if (!suppressClick.current || e.detail === 0) return
      suppressClick.current = false
      e.preventDefault()
      e.stopPropagation()
    },
  }
}
