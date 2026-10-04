export const ease = {
  out: 'cubic-bezier(.215,.61,.355,1)',
  arrive: 'cubic-bezier(.16,1,.3,1)',
  sheet: 'cubic-bezier(.32,.72,0,1)',
  story: 'cubic-bezier(.65,0,.35,1)',
  pop: 'cubic-bezier(.34,1.35,.64,1)',
} as const

export const dur = { tap: 150, ui: 220, panel: 300, story: 1100 } as const

/** A damped spring sampled into a CSS `linear()` easing, so WAAPI and CSS can play it. */
function springEasing(zeta: number, omega: number, ms: number, steps = 48) {
  const damped = omega * Math.sqrt(1 - zeta * zeta)
  const points: string[] = []
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * (ms / 1000)
    const x = i === steps ? 1 : 1 - Math.exp(-zeta * omega * t) * (Math.cos(damped * t) + (zeta * omega / damped) * Math.sin(damped * t))
    points.push(x.toFixed(4))
  }
  return `linear(${points.join(', ')})`
}

export const spring = {
  /** stiffness 350, damping 35, mass 1. */
  ui: { easing: springEasing(35 / (2 * Math.sqrt(350)), Math.sqrt(350), 400), duration: 400 },
  /** duration .5, bounce .3: the one playful moment, the pink plate settling. */
  play: { easing: springEasing(.7, 12.6, 650), duration: 650 },
} as const
