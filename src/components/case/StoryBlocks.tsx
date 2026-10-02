import type { Story } from '../../content/projects'

const blocks: { key: keyof Story; title: string }[] = [
  { key: 'product', title: 'The product' },
  { key: 'built', title: 'What was built' },
  { key: 'result', title: 'Result' },
]

/** The story in three blocks, side by side from 1024 px. */
export function StoryBlocks({ story }: { story: Story }) {
  return (
    <div className="grid gap-x-10 gap-y-12 lg:grid-cols-3">
      {blocks.map((block, index) => (
        <section key={block.key} aria-labelledby={`story-${block.key}`} className="border-t border-hairline pt-4">
          <h2 id={`story-${block.key}`} className="flex items-baseline gap-3 label-lg text-ink">
            <span className="text-tint">{String(index + 1).padStart(2, '0')}</span>
            {block.title}
          </h2>
          <p className="mt-6 max-w-[64ch] text-story text-ink">{story[block.key]}</p>
        </section>
      ))}
    </div>
  )
}
