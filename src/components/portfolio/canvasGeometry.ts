export interface Camera {
  x: number
  y: number
  scale: number
}
export interface Area {
  x: number
  y: number
  width: number
  height: number
}
export interface Size {
  width: number
  height: number
}

export const canvasSize = { width: 3584, height: 2720 }
export const minScale = 0.08
export const maxScale = 2

export function zoomCamera(camera: Camera, scale: number, point: { x: number; y: number }): Camera {
  const next = Math.min(maxScale, Math.max(minScale, scale))
  const ratio = next / camera.scale
  return { x: point.x - (point.x - camera.x) * ratio, y: point.y - (point.y - camera.y) * ratio, scale: next }
}

export function fitCamera(area: Area, viewport: Size, padding = 48): Camera {
  const availableWidth = Math.max(1, viewport.width - padding * 2)
  const availableHeight = Math.max(1, viewport.height - padding * 2)
  const scale = Math.min(1, Math.max(minScale, Math.min(availableWidth / area.width, availableHeight / area.height)))
  return {
    x: (viewport.width - area.width * scale) / 2 - area.x * scale,
    y: (viewport.height - area.height * scale) / 2 - area.y * scale,
    scale,
  }
}

/** Always leave a reachable piece of the work in the viewport. */
export function containCamera(camera: Camera, viewport: Size): Camera {
  return {
    ...camera,
    x: Math.max(64 - canvasSize.width * camera.scale, Math.min(viewport.width - 64, camera.x)),
    y: Math.max(64 - canvasSize.height * camera.scale, Math.min(viewport.height - 64, camera.y)),
  }
}
