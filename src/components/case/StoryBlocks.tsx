import type { Story } from '../../content/projects'

const blocks: { key: keyof Story; title: string }[] = [
  { key: 'product', title: 'The product' },
  { key: 'built', title: 'What was built' },
  { key: 'result', title: 'Result' },
]

/** The story in three blocks, one under the other, each with its title in a side rail from 640 px. */
export function StoryBlocks({ story }: { story: Story }) {
  return (
    <div className="flex flex-col gap-10">
      {blocks.map((block, index) => (
        <section
          key={block.key}
          aria-labelledby={`story-${block.key}`}
          className="grid gap-x-8 gap-y-4 border-t border-hairline pt-4 sm:grid-cols-[10rem_minmax(0,1fr)]"
        >
          <h2 id={`story-${block.key}`} className="flex items-baseline gap-3 label-lg text-ink sm:pt-1">
            <span className="text-tint">{String(index + 1).padStart(2, '0')}</span>
            {block.title}
          </h2>
          <p className="max-w-[64ch] text-story text-ink">{story[block.key]}</p>
        </section>
      ))}
    </div>
  )
}
