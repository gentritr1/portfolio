export const ease = {
  out: [.215, .61, .355, 1], arrive: [.16, 1, .3, 1],
  sheet: [.32, .72, 0, 1], story: [.65, 0, .35, 1], pop: [.34, 1.35, .64, 1],
} as const
export const spring = {
  ui: { type: 'spring', stiffness: 350, damping: 35 },
  lift: { type: 'spring', duration: .4, bounce: .15 },
  play: { type: 'spring', duration: .5, bounce: .3 },
} as const
export const dur = { tap: .15, ui: .22, panel: .3, story: 1.1 } as const
