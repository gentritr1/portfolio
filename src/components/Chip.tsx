import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

interface ChipProps {
  children: ReactNode
  tone?: 'neutral' | 'accent'
  className?: string
}

export function Chip({ children, tone = 'neutral', className }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-chip px-2.5 py-1.5 font-mono text-[0.78rem] leading-snug',
        tone === 'neutral' && 'bg-surface/70 text-ink ring-1 ring-line ring-inset',
        tone === 'accent' && 'bg-accent-soft text-accent-ink',
        className,
      )}
    >
      {children}
    </span>
  )
}
