import { useEffect, useState } from 'react'
import type { PageWorld } from './worlds'

const SECTION_SELECTOR = '[data-world-section]'

/**
 * Watches every element marked with data-world-section and reports the world
 * of the one that crosses the middle of the viewport. It also writes that
 * world to <html data-world>, which cross-fades the page accent and ground.
 */
export function useActiveWorld(): PageWorld {
  const [world, setWorld] = useState<PageWorld>('base')

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>(SECTION_SELECTOR))
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const next = (entry.target as HTMLElement).dataset.world as PageWorld | undefined
          if (next) setWorld(next)
        }
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    document.documentElement.dataset.world = world
  }, [world])

  return world
}
