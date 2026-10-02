import { Fragment } from 'react'
import { cn } from '../lib/cn'

interface EyebrowProps {
  items: string[]
  className?: string
}

/**
 * A metadata line in the active accent. It sits below a heading, never above
 * it: the craft floor bans a kicker over a heading.
 */
export function Eyebrow({ items, className }: EyebrowProps) {
  return (
    <p className={cn('flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-meta text-muted', className)}>
      <span aria-hidden className="h-2 w-5 shrink-0 rounded-[2px] bg-accent" />
      {items.map((item, index) => (
        <Fragment key={item}>
          {index > 0 && <span aria-hidden className="h-3 w-px bg-line-strong" />}
          <span className={index === 0 ? 'text-accent-ink' : undefined}>{item}</span>
        </Fragment>
      ))}
    </p>
  )
}
