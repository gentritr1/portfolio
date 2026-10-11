import * as THREE from 'three'
import { layers, type LayerId } from './data'

/**
 * The exploded stack in 3D: five thin frosted plates with 1 px ink edges, dashed alignment lines and one
 * soft contact shadow, seen by an orthographic camera at the drawing's angle (30 degrees up, 45 round).
 * One canvas, fixed behind the page. The stack is drawn where its anchor sits: the hero figure, then the
 * sticky stage beside the sections. Each section sets a scene state; the stack eases to it, and each case
 * plays its one explanatory animation once:
 *  - rewrite: tiles on the Interface layer flip from old (outline) to new (accent), each with a check;
 *  - tokens: a swatch on Quality pulses, colour travels up an alignment line to every tile, "AA" appears;
 *  - tenants: the Data layer splits into three locked partitions under a whole API layer;
 *  - reader: the Mobile layer lifts forward, a page curls once, a wrench snaps onto a library block;
 *  - stack: every layer separates fully; hovering a layer in the list lights it;
 *  - contact: the layers settle back into a stack.
 */
export type SceneState = 'hero' | 'rewrite' | 'tokens' | 'tenants' | 'reader' | 'stack' | 'contact'

export interface StackScene {
  setState(state: SceneState, intensity?: number): void
  setAnchor(el: HTMLElement): void
  setHoverLayer(id: LayerId | null): void
  /** Pause rendering when the stack is off screen (phones, once the hero has scrolled away). */
  setActive(active: boolean): void
  dispose(): void
}

const SIZE = 4
const H = SIZE / 2
const PLATE = 0.06
const TILT_MAX = THREE.MathUtils.degToRad(3)
const ASSEMBLE_MS = 1200
const IDX: Record<LayerId, number> = { interface: 0, mobile: 1, api: 2, data: 3, quality: 4 }

const easeOutQuint = (x: number) => 1 - Math.pow(1 - x, 5)
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a))

/** Per state: the gap between plates, the layers lit, whether labels show, and how long its animation runs. */
const STATES: Record<SceneState, { gap: number; lit: LayerId[]; labels: boolean; ms: number }> = {
  // The hero gap matches the drawing (44 px between layers at 0.102 of the figure width per unit), so the handover is seamless.
  hero: { gap: 0.96, lit: [], labels: true, ms: 900 },
  rewrite: { gap: 0.96, lit: ['interface', 'quality'], labels: false, ms: 1400 },
  tokens: { gap: 0.96, lit: ['interface', 'quality'], labels: false, ms: 1400 },
  tenants: { gap: 1.18, lit: ['interface', 'api', 'data'], labels: false, ms: 1200 },
  reader: { gap: 1.0, lit: ['mobile', 'interface'], labels: false, ms: 1400 },
  stack: { gap: 1.4, lit: [], labels: true, ms: 1100 },
  contact: { gap: 0.16, lit: [], labels: false, ms: 1100 },
}

function cssColor(name: string, el: HTMLElement) {
  return new THREE.Color(getComputedStyle(el).getPropertyValue(name).trim() || '#14202b')
}

function roundedRect(w: number, d: number, r: number) {
  const s = new THREE.Shape(), x = w / 2, z = d / 2
  s.moveTo(-x + r, -z)
  s.lineTo(x - r, -z); s.quadraticCurveTo(x, -z, x, -z + r)
  s.lineTo(x, z - r); s.quadraticCurveTo(x, z, x - r, z)
  s.lineTo(-x + r, z); s.quadraticCurveTo(-x, z, -x, z - r)
  s.lineTo(-x, -z + r); s.quadraticCurveTo(-x, -z, -x + r, -z)
  return s
}

export function createStack(
  host: HTMLElement,
  options: { anchor: HTMLElement; theme: HTMLElement; labels: (HTMLElement | null)[]; badge: HTMLElement | null; small: boolean; onReady(): void; onOpen(): void },
): StackScene {
  const { theme, labels, badge, small, onReady, onOpen } = options
  let anchor = options.anchor
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2))
  renderer.setClearColor(0x000000, 0)
  host.appendChild(renderer.domElement)
  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100)
  const elevation = THREE.MathUtils.degToRad(30)
  camera.position.set((Math.cos(elevation) * 14) / Math.SQRT2, Math.sin(elevation) * 14, (Math.cos(elevation) * 14) / Math.SQRT2)
  camera.lookAt(0, 0, 0)
  const disposables: { dispose(): void }[] = []
  const keep = <T extends { dispose(): void }>(x: T) => (disposables.push(x), x)

  scene.add(new THREE.HemisphereLight(0xffffff, 0xffffff, 1.4))
  const sun = new THREE.DirectionalLight(0xffffff, 0.8)
  sun.position.set(4, 10, 2)
  scene.add(sun)

  const stack = new THREE.Group()
  scene.add(stack)

  // ---------- Plates ----------
  const segs = small ? 4 : 8
  const plateShape = roundedRect(SIZE, SIZE, 0.32)
  const plateGeo = keep(new THREE.ExtrudeGeometry(plateShape, { depth: PLATE, bevelEnabled: false, curveSegments: segs }))
  plateGeo.rotateX(-Math.PI / 2)
  const outline = (shape: THREE.Shape, y: number) => keep(new THREE.BufferGeometry().setFromPoints(shape.getPoints(segs).map((p) => new THREE.Vector3(p.x, y, -p.y))))
  const plateEdgeGeo = outline(plateShape, PLATE + 0.002)
  const plates = layers.map((layer, i) => {
    const face = keep(new THREE.MeshStandardMaterial({ roughness: 0.95, metalness: 0, transparent: true, opacity: 0 }))
    const edge = keep(new THREE.LineBasicMaterial({ transparent: true, opacity: 0 }))
    const g = new THREE.Group()
    const mesh = new THREE.Mesh(plateGeo, face)
    mesh.renderOrder = layers.length - i
    const line = new THREE.LineLoop(plateEdgeGeo, edge)
    line.renderOrder = layers.length - i + 0.5
    g.add(mesh, line)
    stack.add(g)
    return { id: layer.id, g, mesh, line, face, edge, lit: 0, hover: 0, extra: new THREE.Vector3() }
  })

  // Dashed alignment lines through the four corners.
  const alignMat = keep(new THREE.LineDashedMaterial({ dashSize: 0.08, gapSize: 0.1, transparent: true, opacity: 0 }))
  const aligns = [[-H, -H], [H, -H], [H, H], [-H, H]].map(([x, z]) => {
    const line = new THREE.Line(keep(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, 0, z), new THREE.Vector3(x, 1, z)])), alignMat)
    stack.add(line)
    return line
  })

  // Leader lines to the HTML labels, from each plate's right-hand corner (screen right is +x, -z).
  const leaderGeo = keep(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(H, PLATE / 2, -H), new THREE.Vector3(H + 0.86, PLATE / 2, -H - 0.86)]))
  const leaderMat = keep(new THREE.LineBasicMaterial({ transparent: true, opacity: 0 }))
  plates.forEach((p) => p.g.add(new THREE.Line(leaderGeo, leaderMat)))

  // Contact shadow.
  const sc = document.createElement('canvas')
  sc.width = sc.height = 128
  const ctx = sc.getContext('2d')!
  const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 64)
  grad.addColorStop(0, 'rgba(0,0,0,0.5)')
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 128, 128)
  const shadowMat = keep(new THREE.MeshBasicMaterial({ map: keep(new THREE.CanvasTexture(sc)), transparent: true, depthWrite: false, opacity: 0 }))
  const shadow = new THREE.Mesh(keep(new THREE.PlaneGeometry(SIZE * 1.9, SIZE * 1.9)), shadowMat)
  shadow.rotation.x = -Math.PI / 2
  shadow.renderOrder = -1
  stack.add(shadow)

  // ---------- Rewrite and tokens: tiles on the Interface layer ----------
  const tileShape = roundedRect(0.66, 0.46, 0.06)
  const tileGeo = keep(new THREE.ShapeGeometry(tileShape, 2))
  tileGeo.rotateX(-Math.PI / 2)
  const tileEdgeGeo = outline(tileShape, 0.002)
  const checkGeo = keep(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.12, 0.004, 0.0), new THREE.Vector3(-0.03, 0.004, 0.09), new THREE.Vector3(0.14, 0.004, -0.1)]))
  const tileOld = keep(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide }))
  const tileNew = keep(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide }))
  const tileEdgeMat = keep(new THREE.LineBasicMaterial({ transparent: true, opacity: 0 }))
  const checkMat = keep(new THREE.LineBasicMaterial({ transparent: true, opacity: 0 }))
  const tilesGroup = new THREE.Group()
  plates[IDX.interface].g.add(tilesGroup)
  const COLS = 4, ROWS = 3
  const tiles = Array.from({ length: COLS * ROWS }, (_, k) => {
    const col = k % COLS, row = Math.floor(k / COLS)
    const g = new THREE.Group()
    g.position.set(-1.2 + col * 0.8, PLATE + 0.012, -0.62 + row * 0.62)
    const mesh = new THREE.Mesh(tileGeo, tileOld)
    mesh.renderOrder = 10
    const edge = new THREE.LineLoop(tileEdgeGeo, tileEdgeMat)
    edge.renderOrder = 11
    const check = new THREE.Line(checkGeo, checkMat)
    check.renderOrder = 12
    g.add(mesh, edge, check)
    tilesGroup.add(g)
    return { g, mesh, check, col, row }
  })

  // Token swatch on Quality, and the travelling dot.
  const swatchGeo = keep(new THREE.ShapeGeometry(roundedRect(0.5, 0.5, 0.06), 2))
  swatchGeo.rotateX(-Math.PI / 2)
  const swatchMat = keep(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }))
  const swatch = new THREE.Mesh(swatchGeo, swatchMat)
  swatch.position.set(H - 0.55, PLATE + 0.01, -H + 0.55)
  swatch.renderOrder = 10
  plates[IDX.quality].g.add(swatch)
  const dotMat = keep(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }))
  const dot = new THREE.Mesh(keep(new THREE.SphereGeometry(0.07, 12, 8)), dotMat)
  dot.renderOrder = 20
  stack.add(dot)

  // ---------- Tenants: the Data layer as three partitions with locks ----------
  const partShape = roundedRect(SIZE / 3 - 0.1, SIZE, 0.2)
  const partGeo = keep(new THREE.ExtrudeGeometry(partShape, { depth: PLATE, bevelEnabled: false, curveSegments: segs }))
  partGeo.rotateX(-Math.PI / 2)
  const partEdgeGeo = outline(partShape, PLATE + 0.002)
  const arc = Array.from({ length: 10 }, (_, i) => {
    const a0 = Math.PI * (i / 10), a1 = Math.PI * ((i + 1) / 10)
    return [new THREE.Vector3(Math.cos(a0) * 0.11, 0.26 + Math.sin(a0) * 0.14, 0), new THREE.Vector3(Math.cos(a1) * 0.11, 0.26 + Math.sin(a1) * 0.14, 0)]
  }).flat()
  const lockGeo = keep(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-0.17, 0, 0), new THREE.Vector3(0.17, 0, 0), new THREE.Vector3(0.17, 0, 0), new THREE.Vector3(0.17, 0.26, 0),
    new THREE.Vector3(0.17, 0.26, 0), new THREE.Vector3(-0.17, 0.26, 0), new THREE.Vector3(-0.17, 0.26, 0), new THREE.Vector3(-0.17, 0, 0),
    ...arc,
  ]))
  const lockMat = keep(new THREE.LineBasicMaterial({ transparent: true, opacity: 0 }))
  const dataPlate = plates[IDX.data]
  const parts = [-1, 0, 1].map((k) => {
    const g = new THREE.Group()
    const mesh = new THREE.Mesh(partGeo, dataPlate.face)
    mesh.renderOrder = dataPlate.mesh.renderOrder
    const edge = new THREE.LineLoop(partEdgeGeo, dataPlate.edge)
    edge.renderOrder = dataPlate.mesh.renderOrder + 0.5
    const lock = new THREE.LineSegments(lockGeo, lockMat)
    // At the partition's front edge, where the layer above does not cover it.
    lock.position.set(0, PLATE + 0.1, H - 0.55)
    lock.scale.setScalar(1.7)
    lock.renderOrder = 20
    g.add(mesh, edge, lock)
    g.visible = false
    dataPlate.g.add(g)
    return { g, k, lock }
  })

  // ---------- Reader: a page that curls, a library block and a wrench ----------
  const pageGeo = keep(new THREE.PlaneGeometry(1.6, 2.1, 16, 1))
  const pageBase = (pageGeo.attributes.position.array as Float32Array).slice()
  const pageMat = keep(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide }))
  const pageEdgeMat = keep(new THREE.LineBasicMaterial({ transparent: true, opacity: 0 }))
  const page = new THREE.Mesh(pageGeo, pageMat)
  page.renderOrder = 10
  const pageG = new THREE.Group()
  pageG.add(page)
  pageG.rotation.x = -Math.PI / 2
  pageG.position.set(-0.3, PLATE + 0.015, 0.35)
  plates[IDX.mobile].g.add(pageG)
  // The page's outline follows the curl: rebuilt from its border vertices each frame.
  const pageOutlineGeo = keep(new THREE.BufferGeometry())
  pageOutlineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(34 * 3), 3))
  const pageOutline = new THREE.LineLoop(pageOutlineGeo, pageEdgeMat)
  pageOutline.renderOrder = 11
  pageG.add(pageOutline)
  const blockMat = keep(new THREE.MeshStandardMaterial({ roughness: 0.9, transparent: true, opacity: 0 }))
  const blockGeo = keep(new THREE.BoxGeometry(1.1, 0.3, 0.7))
  const block = new THREE.Mesh(blockGeo, blockMat)
  block.position.set(1.15, PLATE + 0.15, -1.05)
  block.renderOrder = 10
  block.add(new THREE.LineSegments(keep(new THREE.EdgesGeometry(blockGeo)), pageEdgeMat))
  plates[IDX.mobile].g.add(block)
  const wrenchShape = new THREE.Shape()
  wrenchShape.moveTo(-0.05, -0.32); wrenchShape.lineTo(0.05, -0.32); wrenchShape.lineTo(0.05, 0.1)
  wrenchShape.absarc(0, 0.2, 0.11, -Math.PI / 2 + 0.45, Math.PI * 1.5 - 0.45, false)
  wrenchShape.lineTo(-0.05, 0.1); wrenchShape.lineTo(-0.05, -0.32)
  const wrenchMat = keep(new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide }))
  const wrenchGeo = keep(new THREE.ShapeGeometry(wrenchShape, 8))
  wrenchGeo.rotateX(-Math.PI / 2)
  const wrench = new THREE.Mesh(wrenchGeo, wrenchMat)
  wrench.renderOrder = 21
  wrench.scale.setScalar(1.7)
  plates[IDX.mobile].g.add(wrench)

  // ---------- Theme ----------
  let layer = new THREE.Color(), accent = new THREE.Color(), accentWash = new THREE.Color(), ink = new THREE.Color()
  function applyTheme() {
    const paper = cssColor('--xv-paper', theme)
    layer = cssColor('--xv-layer', theme)
    accent = cssColor('--xv-accent', theme)
    accentWash = layer.clone().lerp(accent, 0.14)
    ink = cssColor('--xv-ink', theme)
    const muted = cssColor('--xv-muted', theme)
    const signal = cssColor('--xv-signal', theme)
    leaderMat.color.copy(muted)
    alignMat.color.copy(muted)
    shadowMat.color.copy(ink)
    tileOld.color.copy(layer)
    tileNew.color.copy(accent)
    tileEdgeMat.color.copy(muted)
    checkMat.color.copy(paper)
    swatchMat.color.copy(signal)
    dotMat.color.copy(signal)
    lockMat.color.copy(ink)
    pageMat.color.copy(layer)
    pageEdgeMat.color.copy(ink)
    blockMat.color.copy(layer)
    blockMat.emissive.copy(layer).multiplyScalar(0.55)
    wrenchMat.color.copy(accent)
  }
  applyTheme()
  const scheme = matchMedia('(prefers-color-scheme: dark)')
  scheme.addEventListener('change', applyTheme)

  // ---------- Layout: glide between anchors ----------
  const box = { x: 0, y: 0, w: 0, h: 0, init: false }
  let unitPx = 60
  function layout(dt: number) {
    const w = innerWidth, hh = innerHeight
    renderer.setSize(w, hh, false)
    const r = anchor.getBoundingClientRect()
    // The anchor rect is followed with a short glide, so a change of anchor reads as one camera move.
    const k = box.init ? 1 - Math.pow(0.03, dt) : 1
    box.x += (r.left - box.x) * k; box.y += (r.top - box.y) * k
    box.w += (r.width - box.w) * k; box.h += (r.height - box.h) * k
    box.init = true
    // Width: the same scale as the drawing (its plate diagonal is 300/520 of the figure). Height: the whole stack,
    // at its current gap, always fits the box, so full separation never outgrows the stage.
    const stackHeight = SIZE * Math.SQRT2 * Math.sin(elevation) + (layers.length - 1) * gapNow * Math.cos(elevation) + 0.6
    unitPx = Math.max(16, Math.min(box.w * 0.102, (box.h * 0.9) / stackHeight))
    camera.left = -w / (2 * unitPx); camera.right = w / (2 * unitPx)
    camera.top = hh / (2 * unitPx); camera.bottom = -hh / (2 * unitPx)
    // Anchors are the drawings themselves (520 x 391 viewBox), so these are the drawing's own stack centre.
    const fx = box.x + box.w * 0.365, fy = box.y + box.h * 0.481
    // Labels scale with the drawing, as its SVG text does (15 px at 520 wide).
    host.style.setProperty('--xv-label-size', `${Math.max(10, (box.w * 15) / 520).toFixed(1)}px`)
    camera.setViewOffset(w, hh, w / 2 - fx, hh / 2 - fy, w, hh)
    camera.updateProjectionMatrix()
  }

  // ---------- State ----------
  let state: SceneState = 'hero', intensity = 1, stateStart = 0, hoverLayer: LayerId | null = null
  let gapNow = 1.25, assembleStart = -1, opened = false
  const tilt = new THREE.Vector2(), tiltTarget = new THREE.Vector2()
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    tiltTarget.set((e.clientY / innerHeight - 0.5) * 2, (e.clientX / innerWidth - 0.5) * 2)
  }
  addEventListener('pointermove', onMove, { passive: true })

  const v = new THREE.Vector3(), camDir = new THREE.Vector3()
  camera.getWorldDirection(camDir)
  let running = false, raf = 0, last = performance.now()

  function frame(now: number) {
    if (!running) return
    raf = requestAnimationFrame(frame)
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    if (assembleStart < 0) { assembleStart = now; stateStart = now }
    const damp = (rate: number) => 1 - Math.pow(rate, dt)

    // The one-time hero assembly: slide in, stack, then open to the hero gap.
    const ta = (now - assembleStart) / ASSEMBLE_MS
    const assembling = ta < 1
    const def = STATES[state]
    const gapTarget = STATES.hero.gap + (def.gap - STATES.hero.gap) * intensity
    if (assembling) {
      gapNow = ta < 0.5 ? 1.25 + (0.16 - 1.25) * easeOutQuint(ta / 0.5) : 0.16 + (STATES.hero.gap - 0.16) * easeInOut((ta - 0.5) / 0.5)
    } else {
      gapNow += (gapTarget - gapNow) * damp(0.06)
    }
    if (!opened && ta >= 0.75) { opened = true; onOpen() }
    const tp = clamp01((now - stateStart) / def.ms)
    const settled = clamp01(ta - 1)

    // Plates: position, float, lit tint, the reader lift.
    const top = ((layers.length - 1) * gapNow) / 2
    const floatAmp = (1.5 / unitPx) * settled
    const fade = clamp01(ta / 0.4)
    plates.forEach((p, i) => {
      const litTarget = def.lit.includes(p.id) ? intensity : 0
      p.lit += (litTarget - p.lit) * damp(0.02)
      p.hover += ((hoverLayer === p.id ? 1 : 0) - p.hover) * damp(0.001)
      const glow = Math.max(p.lit, p.hover)
      p.face.color.copy(layer).lerp(accentWash, glow)
      p.face.emissive.copy(p.face.color).multiplyScalar(0.55)
      p.face.opacity = 0.93 * fade
      p.edge.color.copy(ink).lerp(accent, glow)
      p.edge.opacity = fade
      // Reader: the Mobile layer lifts forward, toward the viewer.
      const lift = p.id === 'mobile' && state === 'reader' ? easeInOut(seg(tp, 0, 0.35)) * intensity : 0
      p.extra.x += (-camDir.x * 1.6 * lift - p.extra.x) * damp(0.002)
      p.extra.z += (-camDir.z * 1.6 * lift - p.extra.z) * damp(0.002)
      p.extra.y += (0.45 * lift - p.extra.y) * damp(0.002)
      p.g.position.set(p.extra.x, top - i * gapNow + Math.sin((now / 7000) * Math.PI * 2 + i * 0.7) * floatAmp + p.extra.y, p.extra.z)
    })
    const leaderTarget = assembling ? clamp01((ta - 0.75) / 0.25) * 0.9 : def.labels ? 0.9 : 0
    leaderMat.opacity += (leaderTarget - leaderMat.opacity) * damp(0.01)
    alignMat.opacity = clamp01((ta - 0.6) / 0.4) * 0.55
    shadowMat.opacity = fade * 0.18
    const span = (layers.length - 1) * gapNow
    aligns.forEach((l) => {
      l.position.y = top - span
      const pos = l.geometry.attributes.position as THREE.BufferAttribute
      pos.setY(1, span + PLATE)
      pos.needsUpdate = true
      l.computeLineDistances()
    })
    shadow.position.y = top - span - 0.5

    // Rewrite: tiles flip left to right, old to new, each with a check.
    // Tokens: the swatch pulses, a dot rides the alignment line up, then every tile fills.
    const inRewrite = state === 'rewrite', inTokens = state === 'tokens'
    const tileShow = inRewrite || inTokens ? intensity : 0
    tileOld.opacity += (tileShow * 0.95 - tileOld.opacity) * damp(0.002)
    tileNew.opacity = tileOld.opacity
    tileEdgeMat.opacity = tileOld.opacity * 0.9
    checkMat.opacity = inRewrite ? tileOld.opacity : 0
    tiles.forEach((t) => {
      const k = t.col * ROWS + t.row
      let flip = 0, filled = false
      if (inRewrite) {
        flip = easeInOut(seg(tp, 0.06 + k * 0.06, 0.06 + k * 0.06 + 0.2))
        filled = flip > 0.5
      } else if (inTokens) {
        filled = seg(tp, 0.62 + k * 0.025, 0.66 + k * 0.025) > 0.5
      }
      t.g.rotation.x = Math.PI * flip
      t.mesh.material = filled ? tileNew : tileOld
      t.check.visible = inRewrite && flip >= 1
    })
    swatchMat.opacity += ((inTokens ? intensity : 0) - swatchMat.opacity) * damp(0.002)
    swatch.scale.setScalar(1 + (inTokens ? Math.sin(Math.PI * seg(tp, 0.05, 0.3)) : 0) * 0.35)
    const travel = inTokens ? easeInOut(seg(tp, 0.28, 0.62)) : 0
    dotMat.opacity = inTokens && travel > 0 && travel < 1 ? intensity : 0
    const qY = plates[IDX.quality].g.position.y, iY = plates[IDX.interface].g.position.y
    dot.position.set(H, qY + PLATE + (iY - qY) * travel, -H)
    if (badge) {
      badge.style.opacity = String(inTokens && tp > 0.85 ? intensity : 0)
      v.set(0, PLATE, -H - 0.2).applyMatrix4(plates[IDX.interface].g.matrixWorld).project(camera)
      badge.style.transform = `translate3d(${((v.x + 1) / 2) * innerWidth}px, ${((1 - v.y) / 2) * innerHeight}px, 0) translate(-50%, -140%)`
    }

    // Tenants: Data splits into three partitions, each locked; the API layer stays whole.
    const inTenants = state === 'tenants'
    const split = inTenants ? easeInOut(seg(tp, 0, 0.55)) * intensity : 0
    dataPlate.mesh.visible = split < 0.02
    dataPlate.line.visible = split < 0.02
    lockMat.opacity = inTenants ? intensity : 0
    parts.forEach((p) => {
      p.g.visible = split >= 0.02
      p.g.position.x = p.k * (SIZE / 3 + split * 0.7)
      p.lock.visible = inTenants && seg(tp, 0.5 + (p.k + 1) * 0.1, 0.7 + (p.k + 1) * 0.1) > 0
      // Locks stand upright and face the viewer.
      p.lock.rotation.y = Math.atan2(camera.position.x, camera.position.z)
    })

    // Reader: a page curls once on the lifted Mobile layer, and a wrench snaps onto the library block.
    const inReader = state === 'reader'
    pageMat.opacity += ((inReader ? intensity : 0) * 0.95 - pageMat.opacity) * damp(0.002)
    pageEdgeMat.opacity = pageMat.opacity
    blockMat.opacity = pageMat.opacity
    const curl = inReader ? easeInOut(seg(tp, 0.3, 0.8)) : 0
    const pos = pageGeo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < pos.count; i++) {
      const bx = pageBase[i * 3] + 0.8 // distance from the spine (the left edge)
      const theta = Math.PI * curl * (0.55 + 0.45 * (bx / 1.6))
      pos.setX(i, -0.8 + Math.cos(theta) * bx)
      pos.setZ(i, Math.sin(theta) * bx * 0.85)
    }
    pos.needsUpdate = true
    // Outline: bottom row left to right, then top row right to left (rows have 17 vertices).
    const ol = pageOutlineGeo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < 17; i++) ol.setXYZ(i, pos.getX(17 + i), pos.getY(17 + i), pos.getZ(17 + i) + 0.001)
    for (let i = 0; i < 17; i++) ol.setXYZ(17 + i, pos.getX(16 - i), pos.getY(16 - i), pos.getZ(16 - i) + 0.001)
    ol.needsUpdate = true
    const snap = inReader ? seg(tp, 0.72, 0.88) : 0
    wrenchMat.opacity = inReader && snap > 0 ? intensity : 0
    wrench.position.set(1.15, PLATE + 0.31 + (1 - easeOutQuint(snap)) * 1.2, -1.05)

    // A mesh at opacity 0 still writes depth and would cut a hole in the plate above, so faded effects switch off.
    tilesGroup.visible = tileOld.opacity > 0.01
    swatch.visible = swatchMat.opacity > 0.01
    dot.visible = dotMat.opacity > 0.01
    pageG.visible = block.visible = pageMat.opacity > 0.01
    wrench.visible = wrenchMat.opacity > 0.01

    // Tilt: at most 3 degrees, mouse only, sprung.
    tilt.lerp(tiltTarget, damp(0.02))
    stack.rotation.x = tilt.x * TILT_MAX
    stack.rotation.z = -tilt.y * TILT_MAX

    layout(dt)
    renderer.render(scene, camera)

    const labelsOpacity = assembling ? clamp01((ta - 0.75) / 0.25) : def.labels ? 1 : 0
    plates.forEach((p, i) => {
      const el = labels[i]
      if (!el) return
      // Leader end and label start match the drawing's (its leader runs 64 px, its text starts 72 px past the corner).
      v.set(H + 0.96, PLATE / 2, -H - 0.96).applyMatrix4(p.g.matrixWorld).project(camera)
      el.style.transform = `translate3d(${((v.x + 1) / 2) * innerWidth}px, ${((1 - v.y) / 2) * innerHeight}px, 0) translateY(-50%)`
      el.style.opacity = String(labelsOpacity * (hoverLayer && hoverLayer !== p.id ? 0.45 : 1))
    })
  }

  // ---------- Visibility and warm-up ----------
  const onVis = () => sync()
  document.addEventListener('visibilitychange', onVis)
  let ready = false, disposed = false, active = true
  function sync() {
    const should = !document.hidden && ready && active
    if (should && !running) { running = true; last = performance.now(); raf = requestAnimationFrame(frame) }
    else if (!should && running) { running = false; cancelAnimationFrame(raf) }
  }
  layout(0)
  ;(async () => {
    // Every effect is drawn once while invisible, so its shaders compile before anyone sees it.
    const effects = [tileOld, tileNew, swatchMat, dotMat, lockMat, pageMat, wrenchMat, blockMat, checkMat, pageEdgeMat, tileEdgeMat]
    effects.forEach((m) => { m.opacity = 0.001 })
    parts.forEach((p) => { p.g.visible = true })
    try { await renderer.compileAsync(scene, camera) } catch { /* compiles on first render */ }
    if (disposed) return
    renderer.render(scene, camera)
    effects.forEach((m) => { m.opacity = 0 })
    parts.forEach((p) => { p.g.visible = false })
    ready = true
    performance.mark('eh:ready')
    onReady()
    sync()
  })()

  return {
    setState(next, i = 1) {
      if (next === state && i === intensity) return
      // A preview at half strength of the state already playing keeps its timing.
      if (next !== state) { stateStart = performance.now(); performance.mark(`xv:state:${next}`) }
      state = next
      intensity = i
    },
    setAnchor(el) { anchor = el },
    setHoverLayer(id) { hoverLayer = id },
    // A paused canvas keeps its last frame, so it hides too; otherwise a frozen stack would sit over the text.
    setActive(a) { active = a; host.style.visibility = a ? '' : 'hidden'; sync() },
    dispose() {
      disposed = true
      running = false
      cancelAnimationFrame(raf)
      removeEventListener('pointermove', onMove)
      document.removeEventListener('visibilitychange', onVis)
      scheme.removeEventListener('change', applyTheme)
      disposables.forEach((d) => d.dispose())
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
