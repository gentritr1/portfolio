import { decisionStories } from './decisionStoryData'

export function DecisionStories({ slug }: { slug: string }) {
  const story = decisionStories[slug]
  if (!story) return null
  return (
    <section className="re-decision-story" aria-labelledby="re-decision-story-h">
      <h2 id="re-decision-story-h" className="re-cs-h2">{story.heading}</h2>
      <p className="re-cs-text">{story.context}</p>
      <dl>
        <div><dt>The decision</dt><dd>{story.decision}</dd></div>
        <div><dt>The evidence</dt><dd>{story.evidence}</dd></div>
        <div><dt>The limits</dt><dd>{story.tradeoff}</dd></div>
      </dl>
    </section>
  )
}
