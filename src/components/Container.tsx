import type { HTMLAttributes } from 'react'
import { cn } from '../lib/cn'

export function Container({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mx-auto w-full max-w-[1200px] px-gutter', className)} {...rest} />
}
