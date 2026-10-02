import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

interface PanelProps {
  as?: 'div' | 'section' | 'article' | 'aside'
  /** Mono label in the panel's top bar. */
  label?: ReactNode
  /** Right side of the top bar, for example a time code. */
  meta?: ReactNode
  className?: string
  bodyClassName?: string
  children?: ReactNode
  'aria-labelledby'?: string
}

/** The matte panel: one hairline, no shadow, an optional labelled top bar. */
export function Panel({ as: Tag = 'div', label, meta, className, bodyClassName, children, ...rest }: PanelProps) {
  return (
    <Tag className={cn('rounded-panel border border-hairline bg-panel-1', className)} {...rest}>
      {(label || meta) && (
        <div className="flex min-h-9 items-center justify-between gap-4 border-b border-hairline px-4 py-2 label text-ink-3">
          <span>{label}</span>
          {meta && <span className="tabular">{meta}</span>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </Tag>
  )
}
