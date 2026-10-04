export const ease = {
  out: [0.215, 0.61, 0.355, 1],
  arrive: [0.16, 1, 0.3, 1],
  sheet: [0.32, 0.72, 0, 1],
  story: [0.65, 0, 0.35, 1],
  pop: [0.34, 1.35, 0.64, 1],
} as const;
export const spring = {
  ui: { type: "spring", stiffness: 350, damping: 35 },
  lift: { type: "spring", duration: 0.4, bounce: 0.15 },
  play: { type: "spring", duration: 0.5, bounce: 0.3 },
} as const;
export const dur = { tap: 0.15, ui: 0.22, panel: 0.3, story: 1.1 } as const;
