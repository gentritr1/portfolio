import { StagePlaceholder } from '../../components/World'

/**
 * The live recreation for one world. It renders inside the stage core, which
 * is `position: relative`, clips overflow, and is a size container, so
 * `@container` variants and `cqi` units measure the stage, not the page.
 * Replace the placeholder with the recreation. Keep data invented and unbranded.
 */
export function Recreation() {
  return <StagePlaceholder label="Template" />
}
