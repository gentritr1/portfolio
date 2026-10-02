import { World } from '../../components/World'
import { Recreation } from './Recreation'

/**
 * Copy this folder to src/worlds/<name>/, rename the export to <Name>World,
 * and import it in src/App.tsx. All copy comes from CONTENT.md. The world id
 * must be one of the ids in src/lib/worlds.ts.
 */
export function TemplateWorld() {
  return (
    <World
      world="healthcare"
      layout="stage-end"
      stageAspect="4 / 3"
      stageAspectMobile="4 / 5"
      title="Title from CONTENT.md"
      meta={['World', 'Product kind', 'Platform']}
      role="Role line from CONTENT.md."
      story={['First story paragraph.', 'Second story paragraph.']}
      facts={['First fact chip', 'Second fact chip']}
      stack={['First stack group', 'Second stack group']}
      recreationName="Recreation name"
      recreation={<Recreation />}
    />
  )
}
