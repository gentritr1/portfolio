import * as THREE from 'three'
import { layers } from './data'

/**
 * The exploded stack in 3D: five thin frosted plates with 1 px ink edges, dashed alignment lines,
 * and one soft contact shadow, seen by an orthographic camera at the poster's angle (30 degrees up,
 * 45 degrees round), so the drawing and the model match. One canvas, fixed behind the page; the
 * stack is drawn where its anchor element (the hero figure) sits on screen.
 */
export interface StackScene {
  dispose(): void
}

const SIZE = 4
const PLATE = 0.06
const GAP_START = 1.25
const GAP_STACKED = 0.16
const GAP_OPEN = 0.72
const ASSEMBLE_MS = 1200
const TILT_MAX = THREE.MathUtils.degToRad(3)
const easeOutQuint = (x: number) => 1 - Math.pow(1 - x, 5)
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

function cssColor(name: string, el: HTMLElement) {
  return new THREE.Color(getComputedStyle(el).getPropertyValue(name).trim() || '#14202b')
}

export function createStack(
  host: HTMLElement,
  options: { anchor: HTMLElement; theme: HTMLElement; labels: (HTMLElement | null)[]; small: boolean; onReady(): void; onOpen(): void },
): StackScene {
  const { anchor, theme, labels, small, onReady, onOpen } = options
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2))
  renderer.setClearColor(0x000000, 0)
  host.appendChild(renderer.domElement)
  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100)
  const elevation = THREE.MathUtils.degToRad(30)
  camera.position.set(Math.cos(elevation) * 14 / Math.SQRT2, Math.sin(elevation) * 14, Math.cos(elevation) * 14 / Math.SQRT2)
  camera.lookAt(0, 0, 0)
  const disposables: { dispose(): void }[] = []
  const keep = <T extends { dispose(): void }>(x: T) => (disposables.push(x), x)

  // Soft, even light: the plates read as paper, not plastic.
  const hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.4)
  const sun = new THREE.DirectionalLight(0xffffff, 0.8)
  sun.position.set(4, 10, 2)
  scene.add(hemi, sun)

  const stack = new THREE.Group()
  scene.add(stack)

  // One rounded plate shape shared by every layer.
  const r = 0.32, h = SIZE / 2
  const shape = new THREE.Shape()
  shape.moveTo(-h + r, -h)
  shape.lineTo(h - r, -h); shape.quadraticCurveTo(h, -h, h, -h + r)
  shape.lineTo(h, h - r); shape.quadraticCurveTo(h, h, h - r, h)
  shape.lineTo(-h + r, h); shape.quadraticCurveTo(-h, h, -h, h - r)
  shape.lineTo(-h, -h + r); shape.quadraticCurveTo(-h, -h, -h + r, -h)
  const plateGeo = keep(new THREE.ExtrudeGeometry(shape, { depth: PLATE, bevelEnabled: false, curveSegments: small ? 4 : 8 }))
  plateGeo.rotateX(-Math.PI / 2)
  const edgeGeo = keep(new THREE.BufferGeometry().setFromPoints(shape.getPoints(small ? 4 : 8).map((p) => new THREE.Vector3(p.x, PLATE + 0.002, -p.y))))

  const faceMat = keep(new THREE.MeshStandardMaterial({ roughness: 0.95, metalness: 0, transparent: true, opacity: 0 }))
  const edgeMat = keep(new THREE.LineBasicMaterial({ transparent: true, opacity: 0 }))
  const plates = layers.map((layer, i) => {
    const g = new THREE.Group()
    const face = new THREE.Mesh(plateGeo, faceMat)
    face.renderOrder = layers.length - i
    const edge = new THREE.LineLoop(edgeGeo, edgeMat)
    edge.renderOrder = layers.length - i + 0.5
    g.add(face, edge)
    stack.add(g)
    return { g, id: layer.id }
  })

  // Dashed alignment lines through the four corners, like an exploded-view drawing.
  const alignMat = keep(new THREE.LineDashedMaterial({ dashSize: 0.08, gapSize: 0.1, transparent: true, opacity: 0 }))
  const corners = [[-h, -h], [h, -h], [h, h], [-h, h]]
  const aligns = corners.map(([x, z]) => {
    const geo = keep(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, 0, z), new THREE.Vector3(x, 1, z)]))
    const line = new THREE.Line(geo, alignMat)
    stack.add(line)
    return line
  })

  // Leader lines from each plate's right-hand corner (screen right is world +x, -z here).
  const leaderGeo = keep(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(h, PLATE / 2, -h), new THREE.Vector3(h + 0.62, PLATE / 2, -h - 0.62)]))
  const leaderMat = keep(new THREE.LineBasicMaterial({ transparent: true, opacity: 0 }))
  plates.forEach((p) => p.g.add(new THREE.Line(leaderGeo, leaderMat)))

  // One soft contact shadow under the stack.
  const shadowCanvas = document.createElement('canvas')
  shadowCanvas.width = shadowCanvas.height = 128
  const ctx = shadowCanvas.getContext('2d')!
  const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 64)
  grad.addColorStop(0, 'rgba(0,0,0,0.5)')
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 128, 128)
  const shadowTex = keep(new THREE.CanvasTexture(shadowCanvas))
  const shadowMat = keep(new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0 }))
  const shadow = new THREE.Mesh(keep(new THREE.PlaneGeometry(SIZE * 1.9, SIZE * 1.9)), shadowMat)
  shadow.rotation.x = -Math.PI / 2
  shadow.renderOrder = -1
  stack.add(shadow)

  function applyTheme() {
    // A little self-light keeps the faces at paper value; lighting alone turned them a heavy grey.
    faceMat.color.copy(cssColor('--xv-layer', theme))
    faceMat.emissive.copy(cssColor('--xv-layer', theme)).multiplyScalar(0.55)
    const ink = cssColor('--xv-ink', theme)
    edgeMat.color.copy(ink)
    leaderMat.color.copy(cssColor('--xv-muted', theme))
    alignMat.color.copy(cssColor('--xv-muted', theme))
    shadowMat.color.copy(ink)
  }
  applyTheme()
  const scheme = matchMedia('(prefers-color-scheme: dark)')
  scheme.addEventListener('change', applyTheme)

  // Layout: the stack centres on its anchor (a little left, to leave room for the labels).
  let unitPx = 60
  function layout() {
    const w = innerWidth, hh = innerHeight
    renderer.setSize(w, hh, false)
    const rect = anchor.getBoundingClientRect()
    // Narrow figures leave more room on the right for the labels.
    const narrow = rect.width < 520
    unitPx = Math.max(18, Math.min((rect.width * (narrow ? 0.5 : 0.56)) / (SIZE * Math.SQRT2), (rect.height * 0.86) / 6))
    camera.left = -w / (2 * unitPx); camera.right = w / (2 * unitPx)
    camera.top = hh / (2 * unitPx); camera.bottom = -hh / (2 * unitPx)
    const fx = rect.left + rect.width * (narrow ? 0.27 : 0.4), fy = rect.top + rect.height * 0.5
    camera.setViewOffset(w, hh, w / 2 - fx, hh / 2 - fy, w, hh)
    camera.updateProjectionMatrix()
  }

  // State: the one-time assembly, then near-still floating, then a mouse-only tilt of at most 3 degrees.
  let start = -1, opened = false
  const tilt = new THREE.Vector2(), tiltTarget = new THREE.Vector2()
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    tiltTarget.set((e.clientY / innerHeight - 0.5) * 2, (e.clientX / innerWidth - 0.5) * 2)
  }
  addEventListener('pointermove', onMove, { passive: true })

  const v = new THREE.Vector3()
  let visible = true, running = false, raf = 0, last = performance.now()
  function frame(now: number) {
    if (!running) return
    raf = requestAnimationFrame(frame)
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    if (start < 0) start = now
    const t = (now - start) / ASSEMBLE_MS
    const a = easeOutQuint(clamp01(t / 0.5))
    const b = easeInOut(clamp01((t - 0.5) / 0.5))
    const gap = t < 0.5 ? GAP_START + (GAP_STACKED - GAP_START) * a : GAP_STACKED + (GAP_OPEN - GAP_STACKED) * b
    if (!opened && t >= 0.75) { opened = true; onOpen() }
    // Idle float: about 1.5 px of travel on a 7 s breath, each plate a little out of step.
    const floatAmp = (1.5 / unitPx) * clamp01(t - 1)
    const top = ((layers.length - 1) * gap) / 2
    plates.forEach((p, i) => { p.g.position.y = top - i * gap + Math.sin((now / 7000) * Math.PI * 2 + i * 0.7) * floatAmp })
    const fade = clamp01(t / 0.4)
    faceMat.opacity = 0.93 * fade
    edgeMat.opacity = fade
    leaderMat.opacity = clamp01((t - 0.75) / 0.25) * 0.9
    alignMat.opacity = clamp01((t - 0.6) / 0.4) * 0.55
    shadowMat.opacity = fade * 0.18
    const span = (layers.length - 1) * gap
    // Set the line length directly (scaling would stretch the dashes as the gap changes).
    aligns.forEach((l) => {
      l.position.y = top - span
      const pos = l.geometry.attributes.position as THREE.BufferAttribute
      pos.setY(1, span + PLATE)
      pos.needsUpdate = true
      l.computeLineDistances()
    })
    shadow.position.y = top - span - 0.5

    tilt.lerp(tiltTarget, 1 - Math.pow(0.02, dt))
    stack.rotation.x = tilt.x * TILT_MAX
    stack.rotation.z = -tilt.y * TILT_MAX

    layout()
    renderer.render(scene, camera)

    // Labels follow each plate's leader end.
    plates.forEach((p, i) => {
      const el = labels[i]
      if (!el) return
      v.set(h + 0.7, PLATE / 2, -h - 0.7).applyMatrix4(p.g.matrixWorld).project(camera)
      el.style.transform = `translate3d(${((v.x + 1) / 2) * innerWidth}px, ${((1 - v.y) / 2) * innerHeight}px, 0) translateY(-50%)`
    })
  }

  // Render only while the hero is on screen and the tab is visible.
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync() }, { rootMargin: '80px' })
  io.observe(anchor)
  const onVis = () => sync()
  document.addEventListener('visibilitychange', onVis)
  function sync() {
    const should = visible && !document.hidden && ready
    if (should && !running) { running = true; last = performance.now(); raf = requestAnimationFrame(frame) }
    else if (!should && running) { running = false; cancelAnimationFrame(raf) }
    host.style.opacity = ready && visible ? '' : '0'
  }

  // Warm up while invisible, then reveal and start the assembly.
  let ready = false, disposed = false
  layout()
  ;(async () => {
    try { await renderer.compileAsync(scene, camera) } catch { /* compiles on first render */ }
    if (disposed) return
    renderer.render(scene, camera)
    ready = true
    performance.mark('eh:ready')
    onReady()
    sync()
  })()

  return {
    dispose() {
      disposed = true
      running = false
      cancelAnimationFrame(raf)
      io.disconnect()
      removeEventListener('pointermove', onMove)
      document.removeEventListener('visibilitychange', onVis)
      scheme.removeEventListener('change', applyTheme)
      disposables.forEach((d) => d.dispose())
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
