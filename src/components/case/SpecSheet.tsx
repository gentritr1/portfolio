import type { Fact } from '../../content/projects'

/** Facts as label and value rows. */
export function SpecSheet({ facts }: { facts: Fact[] }) {
  return (
    <div className="grid gap-x-12 gap-y-6 lg:grid-cols-12">
      <h2 id="spec-title" className="label-lg text-ink lg:col-span-4 lg:pt-4">
        Spec sheet
      </h2>
      <dl className="divide-y divide-hairline border-y border-hairline lg:col-span-8">
        {facts.map((fact) => (
          <div key={fact.label} className="grid gap-x-6 gap-y-1.5 py-4 sm:grid-cols-[8.5rem_minmax(0,1fr)]">
            <dt className="label leading-relaxed text-ink-3 sm:pt-1">{fact.label}</dt>
            <dd className="min-w-0 max-w-[64ch] break-words text-ink">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
