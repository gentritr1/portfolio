export interface Camera { x: number; y: number; scale: number }
export interface Size { width: number; height: number }
export interface Area extends Size { x: number; y: number }

export const worldSize = { width: 4400, height: 2800 }

export function zoomAt(camera: Camera, scale: number, point: { x: number; y: number }): Camera {
  const next = Math.max(0.07, Math.min(2, scale))
  const ratio = next / camera.scale
  return { x: point.x - (point.x - camera.x) * ratio, y: point.y - (point.y - camera.y) * ratio, scale: next }
}

export function fit(area: Area, view: Size, padding = 28): Camera {
  const scale = Math.min(1, Math.max(0.07, Math.min((view.width - padding * 2) / area.width, (view.height - padding * 2) / area.height)))
  return { x: (view.width - area.width * scale) / 2 - area.x * scale, y: (view.height - area.height * scale) / 2 - area.y * scale, scale }
}

export function contain(camera: Camera, view: Size): Camera {
  return { ...camera, x: Math.max(80 - worldSize.width * camera.scale, Math.min(view.width - 80, camera.x)), y: Math.max(80 - worldSize.height * camera.scale, Math.min(view.height - 80, camera.y)) }
}
