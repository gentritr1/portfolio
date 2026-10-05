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
