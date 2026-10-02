import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

interface ChipProps {
  children: ReactNode
  tone?: 'neutral' | 'accent'
  /** Mono for data and labels; sans for chips that hold a sentence. */
  font?: 'mono' | 'sans'
  className?: string
}

export function Chip({ children, tone = 'neutral', font = 'mono', className }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-chip px-2.5 py-1.5 leading-snug',
        font === 'mono' ? 'font-mono text-[0.78rem]' : 'font-sans text-[0.875rem]',
        tone === 'neutral' && 'bg-surface/70 text-ink ring-1 ring-line ring-inset',
        tone === 'accent' && 'bg-accent-soft text-accent-ink',
        className,
      )}
    >
      {children}
    </span>
  )
}
