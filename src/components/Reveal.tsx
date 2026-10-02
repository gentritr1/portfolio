import { motion } from 'motion/react'
import { createElement, type CSSProperties, type ReactNode } from 'react'
import { staggerVariants, stagger as staggerScale, useRevealVariants, viewportOnce, type RevealVariants } from '../lib/motion'

const tags = {
  div: motion.div,
  section: motion.section,
  header: motion.header,
  article: motion.article,
  ul: motion.ul,
  ol: motion.ol,
  li: motion.li,
  p: motion.p,
  span: motion.span,
  figure: motion.figure,
  dl: motion.dl,
}

type Tag = keyof typeof tags

interface BaseProps {
  as?: Tag
  className?: string
  style?: CSSProperties
  children?: ReactNode
  id?: string
  [data: `data-${string}`]: string | boolean | undefined
}

function pick(as: Tag) {
  return tags[as] as typeof motion.div
}

function withDelay(variants: RevealVariants, delay: number): RevealVariants {
  if (!delay) return variants
  const shownTransition = (variants.shown.transition ?? {}) as object
  return { ...variants, shown: { ...variants.shown, transition: { ...shownTransition, delay } } }
}

/** One element that fades and rises once when it enters the viewport. */
export function Reveal({ as = 'div', delay = 0, immediate = false, ...rest }: BaseProps & { delay?: number; immediate?: boolean }) {
  const variants = withDelay(useRevealVariants(), delay)
  return createElement(pick(as), {
    variants,
    initial: 'hidden',
    ...(immediate ? { animate: 'shown' } : { whileInView: 'shown', viewport: viewportOnce }),
    ...rest,
  })
}

/**
 * Parent that staggers its RevealItem children. Children must be RevealItem
 * (or motion elements that use the "hidden" and "shown" variant names).
 */
export function RevealGroup({
  as = 'div',
  gap = staggerScale.base,
  delay = 0,
  immediate = false,
  ...rest
}: BaseProps & { gap?: number; delay?: number; immediate?: boolean }) {
  return createElement(pick(as), {
    variants: staggerVariants(gap, delay),
    initial: 'hidden',
    ...(immediate ? { animate: 'shown' } : { whileInView: 'shown', viewport: viewportOnce }),
    ...rest,
  })
}

export function RevealItem({ as = 'div', ...rest }: BaseProps) {
  return createElement(pick(as), { variants: useRevealVariants(), ...rest })
}
