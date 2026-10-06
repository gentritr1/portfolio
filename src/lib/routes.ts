import { findProject } from '../content/projects'
import { preloadable } from './preloadable'
import { fontsReady } from '../pages/caseFonts'

export const caseStudyPage = preloadable(() =>
  import('../pages/CasePage').then((m) => fontsReady().then(() => m.CaseStudyPage)),
)

/** Loads the case page and its monitor recreation, so the route renders in one commit. */
export function preloadCase(slug: string): Promise<unknown> {
  const monitor = findProject(slug)?.featured?.monitor
  const recreation = monitor && monitor !== 'gallery'
    ? import('./recreations').then(({ recreations }) => recreations[monitor].load())
    : null
  return Promise.all([caseStudyPage.load(), recreation])
}

let onBack: ((event: PopStateEvent) => boolean) | null = null;

/** Lets the open page take a Back or Forward step before the router sees it. Returns the release. */
export function takeBack(take: (event: PopStateEvent) => boolean) {
  onBack = take
  return () => {
    if (onBack === take) onBack = null
  }
}

// The browser calls window listeners in the order they were added. This module loads before the router mounts, so this one runs first.
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', (event) => {
    if (onBack?.(event)) event.stopImmediatePropagation()
  })
}
