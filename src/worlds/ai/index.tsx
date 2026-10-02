import { World } from '../../components/World'
import { Recreation } from './Recreation'

export function AiDashboardsWorld() {
  return (
    <World
      world="ai"
      layout="stage-end"
      stageAspect="4 / 3"
      stageAspectMobile="4 / 5"
      title="A smart business dashboard with AI features"
      meta={['AI', 'Dashboards', 'Freelance']}
      role="Frontend, with help on backend features in Python (FastAPI)."
      story={[
        'For a digital-transformation client I built the frontend of a smart dashboard with AI features: professional headshot generation from uploaded photos, and an AI workplace assistant that goes from PDF upload to a chat about the document. I also helped on backend features in Python (FastAPI).',
      ]}
      facts={['Headshot generation from uploaded photos', 'PDF upload to document chat', 'Python (FastAPI) backend features']}
      recreationName="Document chat"
      recreation={<Recreation />}
    />
  )
}
