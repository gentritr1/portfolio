import { useEffect, useState, type RefObject } from 'react'

/** Thumbnail strips should not fetch every full-size source while still far below the fold. */
export function useNearViewport(ref: RefObject<HTMLElement | null>, margin = '200px') {
  const [near, setNear] = useState(() => typeof IntersectionObserver === 'undefined')
  useEffect(() => {
    const element = ref.current
    if (!element || near) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setNear(true)
      observer.disconnect()
    }, { rootMargin: margin })
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, near, margin])
  return near
}
