import { World } from '../../components/World'
import { Recreation } from './Recreation'

export function AiDashboardsWorld() {
  return (
    <World
      world="ai"
      layout="stage-end"
      stageAspect="4 / 3"
      stageAspectTablet="4 / 3"
      stageAspectMobile="4 / 5"
      title="A smart business dashboard with AI features"
      meta={['AI', 'Dashboards', 'Freelance']}
      role="Frontend, freelance"
      story={[
        'A smart business dashboard for a digital-transformation client. Its AI features help staff with daily work: a headshot generator for professional profile photos, and a workplace assistant that answers questions about uploaded PDF documents.',
        'The React frontend covers the dashboard and both AI flows: photo upload to generated headshots, and PDF upload to a chat about the document. Some backend features were added in Python with FastAPI.',
      ]}
      facts={[
        'Headshot generation from uploaded photos',
        'PDF upload to document chat',
        'AI workplace assistant',
        'React dashboard frontend',
        'Python (FastAPI) backend features',
      ]}
      recreationName="Document chat"
      recreation={<Recreation />}
    />
  )
}
