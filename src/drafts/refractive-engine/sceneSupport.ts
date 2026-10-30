/** Shared scroll landmarks and capability detection; neither needs the graphics runtime. */
export const STAGE = { hero: 0, lab: 1, ledger: 2, modes: 3, sim: 4, contact: 5 } as const

export function hasWebGL() {
  try {
    return !!document.createElement('canvas').getContext('webgl2')
  } catch {
    return false
  }
}
