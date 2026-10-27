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
  /** Slide one layer out of the stack (null: none). `instant` skips the spring, for keyboard focus. */
  setLayer(i: number | null, instant?: boolean): void
  dispose(): void
}

const ASPECT = 1.6
const SETTLE_MS = 700
/** The settled tilt, in radians: the back plates slide a little further down and right. */
const REST = { x: -0.07, y: -0.1 }
const TILT = THREE.MathUtils.degToRad(2.5)
const SPRING = 14
/** A chosen layer slides out of the stack along its own offset, down and right, by these fractions of the width. */
const LIFT_X = 0.015, LIFT_Y = 0.028

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
  // The back plates step in tone toward the back, as the drawing's color-mix does (in sRGB, 20% a step).
  const faceMats = [1, 2, 3, 4].map(() => new THREE.MeshBasicMaterial())
  const plates = Array.from({ length: 5 }, (_, i) => {
    const g = new THREE.Group()
    const mesh = new THREE.Mesh(new THREE.BufferGeometry(), i === 0 ? screenMat : faceMats[i - 1])
    const edgeMat = new THREE.LineBasicMaterial()
    const edge = new THREE.LineLoop(new THREE.BufferGeometry(), edgeMat)
    g.add(mesh, edge)
    pivot.add(g)
    // lift: 0 at rest, 1 when chosen, sprung like the tilt; base: its resting place.
    return { g, mesh, edge, edgeMat, lift: 0, v: 0, target: 0, base: new THREE.Vector3() }
  })
  let ink = new THREE.Color(), accent = new THREE.Color()

  // One soft contact shadow behind the stack: the drawing's radial gradient, painted once.
  const sc = document.createElement('canvas')
  sc.width = sc.height = 128
  const ctx = sc.getContext('2d')!
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, 'rgba(255,255,255,0.2)')
  grad.addColorStop(0.55, 'rgba(255,255,255,0.2)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 128, 128)
  const shadowTex = new THREE.CanvasTexture(sc)
  const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), shadowMat) // taste-skill-ignore: a three.js contact-shadow mesh behind the plates, not a CSS box-shadow
  shadow.renderOrder = -1
  pivot.add(shadow)

  const hex = (css: CSSStyleDeclaration, name: string, fallback: string) => {
    const v = css.getPropertyValue(name).trim()
    return /^#[0-9a-f]{6}$/i.test(v) ? v : fallback
  }
  function applyTheme() {
    const css = getComputedStyle(box)
    const a = new THREE.Color(hex(css, '--xv-layer', '#fdfcf9')).convertLinearToSRGB()
    const b = new THREE.Color(hex(css, '--xv-recede', '#e6e3da')).convertLinearToSRGB()
    faceMats.forEach((m, k) => {
      const t = (k + 1) * 0.2
      m.color.setRGB(a.r + (b.r - a.r) * t, a.g + (b.g - a.g) * t, a.b + (b.b - a.b) * t, THREE.SRGBColorSpace)
    })
    ink = new THREE.Color(hex(css, '--xv-ink', '#14202b'))
    accent = new THREE.Color(hex(css, '--xv-accent', '#0f6b66'))
    shadowMat.color.set(hex(css, '--xv-shadow', '#14202b'))
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
    // The shadow's box, as in the CSS: behind the back plate, a little larger, offset down and right.
    const shw = sw + 0.05 * w, shh = sh + 0.04 * w
    const shx = x0 + 4 * ox - 0.01 * w, shy = y0 + 4 * oy + 0.012 * w
    shadow.scale.set(shw, shh, 1)
    shadow.position.set(shx + shw / 2 - cx, -(shy + shh / 2) + cy, -4 * dz - 1 - cz)
    plates.forEach((p, i) => {
      p.mesh.geometry.dispose()
      p.edge.geometry.dispose()
      // Each plate gets its own copy, so disposing one never pulls the geometry from under another.
      p.mesh.geometry = i === 0 ? face : face.clone()
      p.edge.geometry = i === 0 ? outline : outline.clone()
      p.base.set(x0 + i * ox + sw / 2 - cx, -(y0 + i * oy + sh / 2) + cy, -i * dz - cz)
    })
    placePlates()
  }

  // ---------- Motion: one settle, then a sprung pointer tilt ----------
  let settleStart = -1, settling = false
  const tilt = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 }
  const v = new THREE.Vector3()

  function placeLabels() {
    plates.forEach((p, i) => {
      const el = labels[i]
      if (!el) return
      // A label keeps its resting height while its layer slides out, so it never moves out from under the pointer.
      v.set(sw / 2, sh / 2 - anchorAt(i) * sh + p.lift * LIFT_Y * w, 0).applyMatrix4(p.g.matrixWorld).project(camera)
      el.style.setProperty('--ax', `${(((v.x + 1) / 2) * w).toFixed(2)}px`)
      el.style.setProperty('--ay', `${(((1 - v.y) / 2) * h).toFixed(2)}px`)
    })
  }

  /** Each plate at its resting place, slid out by its lift; a chosen plate's edge turns accent. */
  function placePlates() {
    plates.forEach((p) => {
      p.g.position.set(p.base.x + p.lift * LIFT_X * w, p.base.y - p.lift * LIFT_Y * w, p.base.z)
      p.edgeMat.color.copy(ink).lerp(accent, Math.min(1, Math.max(0, p.lift)))
    })
  }

  function draw() {
    placePlates()
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
    let lifting = false
    plates.forEach((p) => {
      p.v += (-SPRING * SPRING * (p.lift - p.target) - 2 * SPRING * p.v) * dt
      p.lift += p.v * dt
      if (Math.abs(p.lift - p.target) + Math.abs(p.v) < 1e-4) { p.lift = p.target; p.v = 0 } else lifting = true
    })
    draw()
    const resting = !lifting && s >= 1 && Math.abs(tilt.x - tilt.tx) + Math.abs(tilt.y - tilt.ty) < 1e-4 && Math.abs(tilt.vx) + Math.abs(tilt.vy) < 1e-4
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
    // Over a label the tilt holds still, so the label stays under the pointer.
    if (!fine.matches || e.pointerType === 'touch' || (e.target as Element).closest?.('.xv-obj-label')) return
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
    setLayer(i, instant = false) {
      plates.forEach((p, k) => {
        p.target = k === i ? 1 : 0
        if (instant) { p.lift = p.target; p.v = 0 }
      })
      if (instant) draw()
      kick()
    },
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
      ;[screenMat, ...faceMats, ...plates.map((p) => p.edgeMat), texture, shadowMat, shadowTex, shadow.geometry].forEach((x) => x.dispose())
      renderer.dispose()
      renderer.domElement.remove()
      labels.forEach((el) => { el?.style.removeProperty('--ax'); el?.style.removeProperty('--ay') })
    },
  }
}
