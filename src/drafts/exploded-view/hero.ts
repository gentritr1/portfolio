import * as THREE from 'three'
import { ease } from './motion'
import { roundedRect } from './scene'

/**
 * The hero object: five layers of the work in exploded view, front to back. The front layer is a real product
 * screen (Interface); behind it, four shallow solid plates. An orthographic camera at 1 unit per CSS pixel, so
 * the first frame is exactly the static HTML drawing it replaces (both read the same CSS custom properties).
 * Then the stack settles once into a slight tilt, follows a fine pointer by up to 2.5 degrees on a critically
 * damped spring, and stops rendering whenever it is at rest. The canvas lives inside the figure, so scrolling
 * moves it natively and never needs a frame.
 */
export interface HeroScene {
  dispose(): void
}

const ASPECT = 1.6
const SETTLE_MS = 700
/** The settled tilt, in radians: the back plates slide a little further down and right. */
const REST = { x: -0.07, y: -0.1 }
const TILT = THREE.MathUtils.degToRad(2.5)
const SPRING = 14

/** Where each layer's leader starts, as a fraction of the plate's height. The CSS uses the same numbers. */
const anchorAt = (i: number) => 0.1 + 0.2 * i

export function createHero(box: HTMLElement, screen: HTMLImageElement, labels: (HTMLElement | null)[], onReady: () => void): HeroScene {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)
  renderer.domElement.className = 'xv-obj-canvas'
  box.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(0, 1, 0, -1, -5000, 5000)
  const pivot = new THREE.Group()
  scene.add(pivot)

  const texture = new THREE.Texture(screen)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
  texture.needsUpdate = true
  const screenMat = new THREE.MeshBasicMaterial({ map: texture })
  const faceMat = new THREE.MeshBasicMaterial()
  const edgeMat = new THREE.LineBasicMaterial()
  const plates = Array.from({ length: 5 }, (_, i) => {
    const g = new THREE.Group()
    const mesh = new THREE.Mesh(new THREE.BufferGeometry(), i === 0 ? screenMat : faceMat)
    const edge = new THREE.LineLoop(new THREE.BufferGeometry(), edgeMat)
    g.add(mesh, edge)
    pivot.add(g)
    return { g, mesh, edge }
  })

  function applyTheme() {
    const css = getComputedStyle(box)
    faceMat.color.set(css.getPropertyValue('--xv-layer').trim() || '#fdfcf9')
    edgeMat.color.set(css.getPropertyValue('--xv-ink').trim() || '#14202b')
  }
  applyTheme()

  // ---------- Layout: the static drawing's numbers, in pixels ----------
  let w = 0, h = 0, sw = 0, sh = 0
  function build() {
    w = box.clientWidth
    h = box.clientHeight
    const css = getComputedStyle(box)
    const num = (name: string) => parseFloat(css.getPropertyValue(name)) || 0
    const x0 = num('--o-x0') * w, y0 = num('--o-y0') * w, ox = num('--o-ox') * w, oy = num('--o-oy') * w
    const dz = num('--o-dz') * w, r = num('--o-r') * w
    sw = num('--o-sw') * w
    sh = sw / ASPECT
    renderer.setSize(w, h, false)
    camera.left = 0; camera.right = w; camera.top = 0; camera.bottom = -h
    camera.updateProjectionMatrix()

    const shape = roundedRect(sw, sh, r)
    const face = new THREE.ShapeGeometry(shape, 6)
    // ShapeGeometry's UVs are its coordinates; the screen needs them over 0..1.
    const pos = face.attributes.position, uv = face.attributes.uv
    for (let k = 0; k < pos.count; k++) uv.setXY(k, pos.getX(k) / sw + 0.5, pos.getY(k) / sh + 0.5)
    const outline = new THREE.BufferGeometry().setFromPoints(shape.getPoints(6).map((p) => new THREE.Vector3(p.x, p.y, 0.5)))

    // The pivot sits at the middle of the whole stack, so a tilt turns it about its own centre.
    const cx = x0 + (sw + 4 * ox) / 2, cy = y0 + (sh + 4 * oy) / 2, cz = -2 * dz
    pivot.position.set(cx, -cy, cz)
    plates.forEach((p, i) => {
      p.mesh.geometry.dispose()
      p.edge.geometry.dispose()
      // Each plate gets its own copy, so disposing one never pulls the geometry from under another.
      p.mesh.geometry = i === 0 ? face : face.clone()
      p.edge.geometry = i === 0 ? outline : outline.clone()
      p.g.position.set(x0 + i * ox + sw / 2 - cx, -(y0 + i * oy + sh / 2) + cy, -i * dz - cz)
    })
  }

  // ---------- Motion: one settle, then a sprung pointer tilt ----------
  let settleStart = -1, settling = false
  const tilt = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 }
  const v = new THREE.Vector3()

  function placeLabels() {
    plates.forEach((p, i) => {
      const el = labels[i]
      if (!el) return
      v.set(sw / 2, sh / 2 - anchorAt(i) * sh, 0).applyMatrix4(p.g.matrixWorld).project(camera)
      el.style.setProperty('--ax', `${(((v.x + 1) / 2) * w).toFixed(2)}px`)
      el.style.setProperty('--ay', `${(((1 - v.y) / 2) * h).toFixed(2)}px`)
    })
  }

  function draw() {
    pivot.updateMatrixWorld()
    renderer.render(scene, camera)
    placeLabels()
  }

  let raf = 0, last = 0, visible = true
  function frame(now: number) {
    raf = 0
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    if (settling && settleStart < 0) settleStart = now
    const s = settling ? ease((now - settleStart) / SETTLE_MS) : 0
    // Critically damped: no overshoot, and a new target simply takes over from wherever it is.
    for (const k of ['x', 'y'] as const) {
      const vk = k === 'x' ? 'vx' : 'vy', tk = k === 'x' ? 'tx' : 'ty'
      tilt[vk] += (-SPRING * SPRING * (tilt[k] - tilt[tk]) - 2 * SPRING * tilt[vk]) * dt
      tilt[k] += tilt[vk] * dt
    }
    pivot.rotation.set(REST.x * s + tilt.x, REST.y * s + tilt.y, 0)
    draw()
    const resting = s >= 1 && Math.abs(tilt.x - tilt.tx) + Math.abs(tilt.y - tilt.ty) < 1e-4 && Math.abs(tilt.vx) + Math.abs(tilt.vy) < 1e-4
    if (!resting) kick()
    else performance.mark('xv:hero:idle')
  }
  function kick() {
    if (raf || !visible || document.hidden) return
    if (!last) last = performance.now()
    raf = requestAnimationFrame(frame)
  }

  // A fine pointer over the figure turns the object toward it; leaving lets it spring back.
  const area = box.parentElement ?? box
  const fine = matchMedia('(pointer: fine)')
  const onMove = (e: PointerEvent) => {
    if (!fine.matches || e.pointerType === 'touch') return
    const r = box.getBoundingClientRect()
    const nx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1))
    const ny = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1))
    tilt.tx = ny * TILT
    tilt.ty = nx * TILT
    kick()
  }
  const onLeave = () => { tilt.tx = 0; tilt.ty = 0; kick() }
  area.addEventListener('pointermove', onMove, { passive: true })
  area.addEventListener('pointerleave', onLeave)

  const resize = new ResizeObserver(() => { build(); last = performance.now(); draw() })
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick() })
  const scheme = matchMedia('(prefers-color-scheme: dark)')
  const onScheme = () => { applyTheme(); draw() }
  const onVis = () => { last = performance.now(); kick() }
  scheme.addEventListener('change', onScheme)
  document.addEventListener('visibilitychange', onVis)

  // The first frame is the static drawing exactly; only once it is on the canvas does the canvas take over.
  build()
  pivot.rotation.set(0, 0, 0)
  draw()
  resize.observe(box)
  io.observe(box)
  performance.mark('xv:hero:ready')
  onReady()
  // The settle waits for the page's first busy moment to pass, so its few frames are not the ones that drop.
  const idle = requestIdleCallback(() => { settling = true; last = performance.now(); kick() }, { timeout: 500 })

  return {
    dispose() {
      cancelIdleCallback(idle)
      cancelAnimationFrame(raf)
      raf = 0
      resize.disconnect()
      io.disconnect()
      area.removeEventListener('pointermove', onMove)
      area.removeEventListener('pointerleave', onLeave)
      scheme.removeEventListener('change', onScheme)
      document.removeEventListener('visibilitychange', onVis)
      plates.forEach((p) => { p.mesh.geometry.dispose(); p.edge.geometry.dispose() })
      ;[screenMat, faceMat, edgeMat, texture].forEach((x) => x.dispose())
      renderer.dispose()
      renderer.domElement.remove()
      labels.forEach((el) => { el?.style.removeProperty('--ax'); el?.style.removeProperty('--ay') })
    },
  }
}
