import { useReducedMotion, type TargetAndTransition, type Transition, type Variants } from 'motion/react'

type Bezier = [number, number, number, number]

export const ease = {
  out: [0.23, 1, 0.32, 1] as Bezier,
  inOut: [0.77, 0, 0.175, 1] as Bezier,
  drawer: [0.32, 0.72, 0, 1] as Bezier,
} as const

/** Seconds. Mirrors the --dur-* CSS tokens in globals.css. */
export const duration = {
  press: 0.14,
  hover: 0.2,
  ui: 0.24,
  world: 0.52,
  reveal: 0.6,
  enter: 0.7,
  micro: 0.2,
  tune: 0.26,
  route: 0.48,
  preview: 0.56,
} as const

export const stagger = {
  tight: 0.04,
  base: 0.05,
  loose: 0.06,
} as const

/** Pixels of vertical travel for an enter-on-scroll reveal. */
export const travel = 12

export const viewportOnce = { once: true, amount: 0.2, margin: '0px 0px -8% 0px' } as const

export const revealTransition: Transition = { duration: duration.reveal, ease: ease.out }

export interface RevealVariants extends Variants {
  hidden: TargetAndTransition
  shown: TargetAndTransition
}

const revealFull: RevealVariants = {
  hidden: { opacity: 0, transform: `translateY(${travel}px)` },
  shown: { opacity: 1, transform: 'translateY(0px)', transition: revealTransition },
}

const revealReduced: RevealVariants = {
  hidden: { opacity: 0 },
  shown: { opacity: 1, transition: { duration: duration.hover, ease: ease.out } },
}

export function staggerVariants(gap: number = stagger.base, delay = 0): Variants {
  return {
    hidden: {},
    shown: { transition: { staggerChildren: gap, delayChildren: delay } },
  }
}

/**
 * Reveal variants for the current motion preference. Reduced motion keeps a
 * short opacity fade and drops all travel.
 */
export function useRevealVariants(): RevealVariants {
  const reduce = useReducedMotion()
  return reduce ? revealReduced : revealFull
}

/** True when the visitor asked for reduced motion. */
export function usePrefersReducedMotion(): boolean {
  return useReducedMotion() ?? false
}
