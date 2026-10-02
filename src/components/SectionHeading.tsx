import type { ReactNode } from 'react'
import { cn } from '../lib/cn'
import { Eyebrow } from './Eyebrow'
import { RevealGroup, RevealItem } from './Reveal'

interface SectionHeadingProps {
  id?: string
  title: ReactNode
  eyebrow?: string[]
  lede?: ReactNode
  className?: string
}

export function SectionHeading({ id, title, eyebrow, lede, className }: SectionHeadingProps) {
  return (
    <RevealGroup as="header" className={cn('max-w-[46rem]', className)}>
      <RevealItem as="div">
        <h2 id={id} className="text-h2 text-ink">
          {title}
        </h2>
      </RevealItem>
      {eyebrow && eyebrow.length > 0 && (
        <RevealItem as="div" className="mt-5">
          <Eyebrow items={eyebrow} />
        </RevealItem>
      )}
      {lede && (
        <RevealItem as="p" className="mt-6 max-w-[58ch] text-lede text-muted">
          {lede}
        </RevealItem>
      )}
    </RevealGroup>
  )
}
