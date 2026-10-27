import * as THREE from 'three'
import { layers, type LayerId } from './data'

/**
 * A case's explanation as the exploded stack in 3D: five thin frosted plates with 1 px ink edges, dashed
 * alignment lines and one soft contact shadow, seen by an orthographic camera at the drawing's angle (30 degrees
 * up, 45 round). The canvas sits inside a bounded figure, over the static drawing it replaces, and its first frame
 * is that drawing. When the figure comes into view the case plays its one animation once, then rests on a still
 * frame and stops rendering:
 *  - rewrite: tiles on the Interface layer flip from old (outline) to new (accent), each with a check;
 *  - tokens: a swatch on Quality pulses, colour travels up an alignment line to every tile, "AA" appears;
 *  - tenants: the Data layer splits into three locked partitions under a whole API layer;
 *  - reader: the Mobile layer lifts forward, a page curls once, a wrench snaps onto a library block.
 * Every value is a function of the animation's progress, so the last frame is exact and reduced motion is that frame.
 */
export type CaseState = 'rewrite' | 'tokens' | 'tenants' | 'reader'

export interface CaseScene {
  /** Play the animation once, from the drawing's pose. */
  play(): void
  /** Jump to the rested last frame (reduced motion). */
  finish(): void
  dispose(): void
}

const SIZE = 4
const H = SIZE / 2
const PLATE = 0.06
const IDX: Record<LayerId, number> = { interface: 0, mobile: 1, api: 2, data: 3, quality: 4 }
/** The drawing's gap (44 px between layers at 0.102 of the figure width per unit), so the handover is seamless. */
const BASE_GAP = 0.96

const easeOutQuint = (x: number) => 1 - Math.pow(1 - x, 5)
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a))

/** Per state: the gap it opens to, the layers lit (as in the drawing), and how long its animation runs. */
export const CASE_STATES: Record<CaseState, { gap: number; lit: LayerId[]; ms: number }> = {
  rewrite: { gap: 0.96, lit: ['interface', 'quality'], ms: 900 },
  tokens: { gap: 0.96, lit: ['interface', 'quality'], ms: 900 },
  tenants: { gap: 1.18, lit: ['interface', 'api', 'data'], ms: 800 },
  reader: { gap: 1.0, lit: ['mobile', 'interface'], ms: 900 },
}

function cssColor(name: string, el: HTMLElement) {
  return new THREE.Color(getComputedStyle(el).getPropertyValue(name).trim() || '#14202b')
}

export function roundedRect(w: number, d: number, r: number) {
  const s = new THREE.Shape(), x = w / 2, z = d / 2
  s.moveTo(-x + r, -z)
  s.lineTo(x - r, -z); s.quadraticCurveTo(x, -z, x, -z + r)
  s.lineTo(x, z - r); s.quadraticCurveTo(x, z, x - r, z)
  s.lineTo(-x + r, z); s.quadraticCurveTo(-x, z, -x, z - r)
  s.lineTo(-x, -z + r); s.quadraticCurveTo(-x, -z, -x + r, -z)
  return s
}

export function createCaseScene(
  host: HTMLElement,
  options: { anchor: HTMLElement; state: CaseState; labels: (HTMLElement | null)[]; badge: HTMLElement | null; onReady(): void },
): CaseScene {
  const { anchor, state, labels, badge, onReady } = options
  const def = CASE_STATES[state]
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)
  renderer.domElement.className = 'xv-motion-canvas'
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
  const plateShape = roundedRect(SIZE, SIZE, 0.32)
  const plateGeo = keep(new THREE.ExtrudeGeometry(plateShape, { depth: PLATE, bevelEnabled: false, curveSegments: 8 }))
  plateGeo.rotateX(-Math.PI / 2)
  const outline = (shape: THREE.Shape, y: number) => keep(new THREE.BufferGeometry().setFromPoints(shape.getPoints(8).map((p) => new THREE.Vector3(p.x, y, -p.y))))
  const plateEdgeGeo = outline(plateShape, PLATE + 0.002)
  const plates = layers.map((layer, i) => {
    const face = keep(new THREE.MeshStandardMaterial({ roughness: 0.95, metalness: 0, transparent: true, opacity: 0.93 }))
    const edge = keep(new THREE.LineBasicMaterial())
    const g = new THREE.Group()
    const mesh = new THREE.Mesh(plateGeo, face)
    mesh.renderOrder = layers.length - i
    const line = new THREE.LineLoop(plateEdgeGeo, edge)
    line.renderOrder = layers.length - i + 0.5
    g.add(mesh, line)
    stack.add(g)
    return { id: layer.id, g, mesh, line, face, edge }
  })

  // Dashed alignment lines through the four corners.
  const alignMat = keep(new THREE.LineDashedMaterial({ dashSize: 0.08, gapSize: 0.1, transparent: true, opacity: 0.55 }))
  const aligns = [[-H, -H], [H, -H], [H, H], [-H, H]].map(([x, z]) => {
    const line = new THREE.Line(keep(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, 0, z), new THREE.Vector3(x, 1, z)])), alignMat)
    stack.add(line)
    return line
  })

  // Leader lines to the HTML labels, from each plate's right-hand corner (screen right is +x, -z).
  const leaderGeo = keep(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(H, PLATE / 2, -H), new THREE.Vector3(H + 0.86, PLATE / 2, -H - 0.86)]))
  const leaderMat = keep(new THREE.LineBasicMaterial({ transparent: true, opacity: 0.9 }))
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
  const shadowMat = keep(new THREE.MeshBasicMaterial({ map: keep(new THREE.CanvasTexture(sc)), transparent: true, depthWrite: false, opacity: 0.18 }))
  const shadow = new THREE.Mesh(keep(new THREE.PlaneGeometry(SIZE * 1.9, SIZE * 1.9)), shadowMat) // taste-skill-ignore: a three.js contact-shadow mesh under the 3D plates, not a CSS box-shadow
  shadow.rotation.x = -Math.PI / 2
  shadow.renderOrder = -1
  stack.add(shadow)

  // ---------- Rewrite and tokens: tiles on the Interface layer ----------
  const tileShape = roundedRect(0.66, 0.46, 0.06)
  const tileGeo = keep(new THREE.ShapeGeometry(tileShape, 2))
  tileGeo.rotateX(-Math.PI / 2)
  const tileEdgeGeo = outline(tileShape, 0.002)
  const checkGeo = keep(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.12, 0.004, 0.0), new THREE.Vector3(-0.03, 0.004, 0.09), new THREE.Vector3(0.14, 0.004, -0.1)]))
  const tileOld = keep(new THREE.MeshBasicMaterial({ transparent: true, side: THREE.DoubleSide }))
  const tileNew = keep(new THREE.MeshBasicMaterial({ transparent: true, side: THREE.DoubleSide }))
  const tileEdgeMat = keep(new THREE.LineBasicMaterial({ transparent: true }))
  const checkMat = keep(new THREE.LineBasicMaterial({ transparent: true }))
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
  const swatchMat = keep(new THREE.MeshBasicMaterial({ transparent: true }))
  const swatch = new THREE.Mesh(swatchGeo, swatchMat)
  swatch.position.set(H - 0.55, PLATE + 0.01, -H + 0.55)
  swatch.renderOrder = 10
  plates[IDX.quality].g.add(swatch)
  const dotMat = keep(new THREE.MeshBasicMaterial({ transparent: true }))
  const dot = new THREE.Mesh(keep(new THREE.SphereGeometry(0.07, 12, 8)), dotMat)
  dot.renderOrder = 20
  stack.add(dot)

  // ---------- Tenants: the Data layer as three partitions with locks ----------
  const partShape = roundedRect(SIZE / 3 - 0.1, SIZE, 0.2)
  const partGeo = keep(new THREE.ExtrudeGeometry(partShape, { depth: PLATE, bevelEnabled: false, curveSegments: 8 }))
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
  const lockMat = keep(new THREE.LineBasicMaterial())
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
  const pageMat = keep(new THREE.MeshBasicMaterial({ transparent: true, side: THREE.DoubleSide }))
  const pageEdgeMat = keep(new THREE.LineBasicMaterial({ transparent: true }))
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
  const blockMat = keep(new THREE.MeshStandardMaterial({ roughness: 0.9, transparent: true }))
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
  const wrenchMat = keep(new THREE.MeshBasicMaterial({ transparent: true, side: THREE.DoubleSide }))
  const wrenchGeo = keep(new THREE.ShapeGeometry(wrenchShape, 8))
  wrenchGeo.rotateX(-Math.PI / 2)
  const wrench = new THREE.Mesh(wrenchGeo, wrenchMat)
  wrench.renderOrder = 21
  wrench.scale.setScalar(1.7)
  plates[IDX.mobile].g.add(wrench)

  // ---------- Theme ----------
  let layer = new THREE.Color(), accent = new THREE.Color(), accentWash = new THREE.Color(), ink = new THREE.Color()
  function applyTheme() {
    const paper = cssColor('--xv-paper', host)
    layer = cssColor('--xv-layer', host)
    accent = cssColor('--xv-accent', host)
    accentWash = layer.clone().lerp(accent, 0.14)
    ink = cssColor('--xv-ink', host)
    const muted = cssColor('--xv-muted', host)
    const signal = cssColor('--xv-signal', host)
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
    // The lit layers are lit from the first frame, as in the drawing.
    plates.forEach((p) => {
      const glow = def.lit.includes(p.id) ? 1 : 0
      p.face.color.copy(layer).lerp(accentWash, glow)
      p.face.emissive.copy(p.face.color).multiplyScalar(0.55)
      p.edge.color.copy(ink).lerp(accent, glow)
    })
  }
  applyTheme()

  // ---------- Layout: the stack sits where the drawing does ----------
  const box = { x: 0, y: 0, w: 0, h: 0 }
  let w = 0, hh = 0
  function resize() {
    w = host.clientWidth
    hh = host.clientHeight
    renderer.setSize(w, hh, false)
    const hr = host.getBoundingClientRect(), r = anchor.getBoundingClientRect()
    box.x = r.left - hr.left; box.y = r.top - hr.top; box.w = r.width; box.h = r.height
    // Labels scale with the drawing, as its SVG text does (15 px at 520 wide).
    host.style.setProperty('--xv-label-size', `${Math.max(10, (box.w * 15) / 520).toFixed(1)}px`)
  }
  function frameCamera(gap: number) {
    // Width: the same scale as the drawing (its plate diagonal is 300/520 of the figure). Height: the whole stack,
    // at its current gap, always fits the box.
    const stackHeight = SIZE * Math.SQRT2 * Math.sin(elevation) + (layers.length - 1) * gap * Math.cos(elevation) + 0.6
    const unitPx = Math.max(16, Math.min(box.w * 0.102, (box.h * 0.9) / stackHeight))
    camera.left = -w / (2 * unitPx); camera.right = w / (2 * unitPx)
    camera.top = hh / (2 * unitPx); camera.bottom = -hh / (2 * unitPx)
    // The drawing's own stack centre (520 x 391 viewBox).
    const fx = box.x + box.w * 0.365, fy = box.y + box.h * 0.481
    camera.setViewOffset(w, hh, w / 2 - fx, hh / 2 - fy, w, hh)
    camera.updateProjectionMatrix()
  }

  // ---------- One frame, as a function of progress ----------
  const v = new THREE.Vector3(), camDir = new THREE.Vector3()
  camera.getWorldDirection(camDir)
  function draw(tp: number) {
    const gap = BASE_GAP + (def.gap - BASE_GAP) * easeInOut(seg(tp, 0, 0.4))
    const show = seg(tp, 0, 0.15)
    const top = ((layers.length - 1) * gap) / 2

    plates.forEach((p, i) => {
      // Reader: the Mobile layer lifts forward, toward the viewer.
      const lift = p.id === 'mobile' && state === 'reader' ? easeInOut(seg(tp, 0, 0.35)) : 0
      p.g.position.set(-camDir.x * 1.6 * lift, top - i * gap + 0.45 * lift, -camDir.z * 1.6 * lift)
    })
    const span = (layers.length - 1) * gap
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
    tileOld.opacity = inRewrite || inTokens ? show * 0.95 : 0
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
    swatchMat.opacity = inTokens ? show : 0
    swatch.scale.setScalar(1 + (inTokens ? Math.sin(Math.PI * seg(tp, 0.05, 0.3)) : 0) * 0.35)
    const travel = inTokens ? easeInOut(seg(tp, 0.28, 0.62)) : 0
    dotMat.opacity = inTokens && travel > 0 && travel < 1 ? 1 : 0
    stack.updateMatrixWorld()
    const qY = plates[IDX.quality].g.position.y, iY = plates[IDX.interface].g.position.y
    dot.position.set(H, qY + PLATE + (iY - qY) * travel, -H)

    // Tenants: Data splits into three partitions, each locked; the API layer stays whole.
    const inTenants = state === 'tenants'
    const split = inTenants ? easeInOut(seg(tp, 0, 0.55)) : 0
    dataPlate.mesh.visible = split < 0.02
    dataPlate.line.visible = split < 0.02
    parts.forEach((p) => {
      p.g.visible = split >= 0.02
      p.g.position.x = p.k * (SIZE / 3 + split * 0.7)
      p.lock.visible = inTenants && seg(tp, 0.5 + (p.k + 1) * 0.1, 0.7 + (p.k + 1) * 0.1) > 0
      // Locks stand upright and face the viewer.
      p.lock.rotation.y = Math.atan2(camera.position.x, camera.position.z)
    })

    // Reader: a page curls once on the lifted Mobile layer, and a wrench snaps onto the library block.
    const inReader = state === 'reader'
    pageMat.opacity = inReader ? show * 0.95 : 0
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
    wrenchMat.opacity = snap > 0 ? 1 : 0
    wrench.position.set(1.15, PLATE + 0.31 + (1 - easeOutQuint(snap)) * 1.2, -1.05)

    // A mesh at opacity 0 still writes depth and would cut a hole in the plate above, so faded effects switch off.
    tilesGroup.visible = tileOld.opacity > 0.01
    swatch.visible = swatchMat.opacity > 0.01
    dot.visible = dotMat.opacity > 0.01
    pageG.visible = block.visible = pageMat.opacity > 0.01
    wrench.visible = wrenchMat.opacity > 0.01

    frameCamera(gap)
    stack.updateMatrixWorld()
    renderer.render(scene, camera)

    if (badge) {
      badge.style.opacity = inTokens && tp > 0.85 ? '1' : '0'
      v.set(0, PLATE, -H - 0.2).applyMatrix4(plates[IDX.interface].g.matrixWorld).project(camera)
      badge.style.transform = `translate3d(${((v.x + 1) / 2) * w}px, ${((1 - v.y) / 2) * hh}px, 0) translate(-50%, -140%)`
    }
    plates.forEach((p, i) => {
      const el = labels[i]
      if (!el) return
      // Leader end and label start match the drawing's (its leader runs 64 px, its text starts 72 px past the corner).
      v.set(H + 0.96, PLATE / 2, -H - 0.96).applyMatrix4(p.g.matrixWorld).project(camera)
      el.style.transform = `translate3d(${((v.x + 1) / 2) * w}px, ${((1 - v.y) / 2) * hh}px, 0) translateY(-50%)`
    })
  }

  // ---------- Playback: render only while the animation runs ----------
  let tp = 0, start = -1, raf = 0, idle = 0
  function frame(now: number) {
    raf = 0
    if (start < 0) start = now
    tp = clamp01((now - start) / def.ms)
    draw(tp)
    if (tp < 1) raf = requestAnimationFrame(frame)
    else performance.mark('xv:case:idle')
  }
  // A hidden tab stops rAF on its own; on return the clock has run on, so the animation lands on its last frame.

  const ro = new ResizeObserver(() => { resize(); draw(tp) })
  const scheme = matchMedia('(prefers-color-scheme: dark)')
  const onScheme = () => { applyTheme(); draw(tp) }
  scheme.addEventListener('change', onScheme)

  // Warm every effect's shader with one hidden frame, then draw the drawing's pose before the canvas shows.
  resize()
  parts.forEach((p) => { p.g.visible = true })
  renderer.compile(scene, camera)
  draw(0)
  ro.observe(host)
  onReady()

  return {
    play() {
      if (raf || idle || tp >= 1) return
      // Arriving by scroll decodes the screens around the figure; the animation starts once that work is done.
      idle = requestIdleCallback(() => {
        idle = 0
        performance.mark(`xv:case:${state}:play`)
        start = -1
        raf = requestAnimationFrame(frame)
      }, { timeout: 500 })
    },
    finish() {
      cancelIdleCallback(idle)
      idle = 0
      cancelAnimationFrame(raf)
      raf = 0
      tp = 1
      draw(1)
      performance.mark('xv:case:idle')
    },
    dispose() {
      cancelIdleCallback(idle)
      cancelAnimationFrame(raf)
      ro.disconnect()
      scheme.removeEventListener('change', onScheme)
      disposables.forEach((d) => d.dispose())
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
