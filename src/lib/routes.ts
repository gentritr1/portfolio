import { findProject } from '../content/projects'
import { preloadable } from './preloadable'
import { recreations } from './recreations'

export const caseStudyPage = preloadable(() => import('../pages/CaseStudyPage').then((m) => m.CaseStudyPage))

/** Loads the case page and its monitor recreation, so the route renders in one commit. */
export function preloadCase(slug: string): Promise<unknown> {
  const monitor = findProject(slug)?.featured?.monitor
  const recreation = monitor && monitor !== 'gallery' ? recreations[monitor].load() : null
  return Promise.all([caseStudyPage.load(), recreation])
}
