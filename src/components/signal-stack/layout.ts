/** Scene units. The camera sees 2 * 6 * tan(14°) ≈ 2.99 units of height at z = 0. */
export const ARC_RADIUS = 3.2
export const ARC_STEP = (9 * Math.PI) / 180
export const PANE_W = 1.6
export const PANE_H = 1
/** Panes are drawn at 1.6 × 1 and scaled; the shader layout is in unscaled units. */
export const PANE_SCALE = 1.375
export const FORWARD = 0.35
export const CAMERA_Z = 6
export const FOV = 28
export const PITCH = (-6 * Math.PI) / 180
export const VIEW_H = 2 * CAMERA_Z * Math.tan((FOV * Math.PI) / 360)
/** Box aspect the composition is drawn for (16:9.5). Narrower boxes scale the stack down. */
export const DESIGN_ASPECT = 16 / 9.5
/** Share of the arc's off-centre shift that the stack translates back, so the fan stays in frame. */
export const RECENTRE = 0.62

export interface PanePose {
  x: number
  z: number
  yaw: number
}

/** Pane i on the convex arc, with the arc rotated so pane `centre` faces the camera. */
export function panePose(i: number, centre: number, count: number, out: PanePose): PanePose {
  const a = (i - centre) * ARC_STEP
  const mid = ((count - 1) / 2 - centre) * ARC_STEP
  out.x = ARC_RADIUS * Math.sin(a) - ARC_RADIUS * Math.sin(mid) * RECENTRE
  out.z = -ARC_RADIUS * (1 - Math.cos(a))
  out.yaw = a
  return out
}

/** Exponential approach with rate k per second. Frame-rate independent and interruptible. */
export function approach(value: number, target: number, k: number, dt: number): number {
  return value + (target - value) * (1 - Math.exp(-k * dt))
}
