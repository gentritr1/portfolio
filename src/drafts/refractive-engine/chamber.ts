import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

/**
 * The focus chamber: one selected product as a thick glass screen, with its two deeper layers as engraved plates behind it.
 * It owns a small canvas inside the stage element, so it scrolls and clips with the page, and it draws only while
 * something moves: at rest it costs nothing.
 */

export interface ChamberProduct {
  /** The 1280 px texture every product has. */
  texture: string
  /** The approved full-size original of the same screen, used when the stage needs more pixels than the texture holds. */
  sharp?: string
  /** Width / height of the screen. */
  aspect: number
  /** What the two deeper layers say when the chamber opens. Products without it keep plain engraved plates. */
  plates?: PlateText[]
}

export interface PlateText {
  stack: string
  concepts: string[]
  proof?: { kind: string; value: string; label: string }
  note?: string
}

export interface Chamber {
  /** `instant` skips the cross-fade (keyboard and reduced motion). */
  select(index: number, instant?: boolean): void
  setExpanded(on: boolean, instant?: boolean): void
  setLayer(index: number | null, instant?: boolean): void
  /** A product demo is open beside the glass: the stack closes and moves into the left third of the stage. */
  setAside(on: boolean, instant?: boolean): void
  setMode(mode: 0 | 1): void
  dispose(): void
}

const T = 0.05 // front glass thickness, in screen heights
const TP = 0.012 // plate thickness
const BEZEL = 0.018
const FOV = 20
const DUR = { product: 220, layers: 290 }
const LABEL_ROOM = 70 // px above the deepest plate for its stepped title

const vertex = /* glsl */ `
varying vec3 vOP, vON, vWN, vWP, vOV;
void main() {
  vOP = position;
  vON = normal;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWP = wp.xyz;
  vWN = normalize(mat3(modelMatrix) * normal);
  vOV = (inverse(modelMatrix) * vec4(cameraPosition, 1.0)).xyz - position;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`

const fragment = /* glsl */ `
uniform sampler2D uMap, uInfo;
uniform vec3 uSize, uAccent;
uniform float uKind, uLoaded, uAlpha, uHi, uDim, uHasInfo, uFwd;
varying vec3 vOP, vON, vWN, vWP, vOV;
float sdRound(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
// A neutral studio: one tall strip light up to the left and one long strip overhead. Nothing in it is coloured.
float strip(vec3 d) {
  float a = exp(-pow((d.x + 0.42) / 0.07, 2.0)) * smoothstep(-0.1, 0.5, d.y);
  float b = exp(-pow((d.y - 0.62) / 0.05, 2.0)) * smoothstep(0.85, 0.3, abs(d.x + 0.1));
  return a + 0.7 * b;
}
void main() {
  vec3 n = normalize(vWN);
  vec3 v = normalize(cameraPosition - vWP);
  float ndv = clamp(dot(n, v), 0.0, 1.0);
  vec3 r = reflect(-v, n);
  float fres = 0.04 + 0.96 * pow(1.0 - ndv, 5.0);
  // Dispersion: each channel sees the strip at a slightly different angle, which only shows where the glass turns away.
  float glance = 1.0 - ndv;
  vec3 spec = vec3(strip(normalize(r + n * 0.05 * glance)), strip(r), strip(normalize(r - n * 0.05 * glance)));
  float face = smoothstep(0.9, 0.99, vON.z);
  vec2 hs = uSize.xy * 0.5;
  float dOut = sdRound(vOP.xy, hs, 0.025);
  vec3 col;
  float alpha;
  // One key light, up and to the left of the viewer; every highlight on the glass and the plates comes from it.
  vec3 L = normalize(vec3(-0.45, 0.75, 0.5));
  float glint = pow(max(dot(r, L), 0.0), 48.0);
  if (uKind < 0.5) {
    // The screen sits halfway into the glass, so it shifts a touch against the bevel as the view turns.
    vec3 ov = normalize(vOV);
    vec2 inner = hs - ${BEZEL.toFixed(3)};
    vec2 p = vOP.xy - ov.xy / max(ov.z, 0.3) * uSize.z * 0.5;
    float d = sdRound(p, inner, 0.01);
    float aa = fwidth(d);
    float inside = (1.0 - smoothstep(-aa, aa, d)) * face;
    vec2 q = p / (inner * 2.0) + 0.5;
    vec3 tex = texture2D(uMap, q).rgb;
    // Near-black glass. Only the screen's own light reaches into its edge, split by dispersion.
    vec2 qc = clamp(q, 0.002, 0.998);
    vec2 o = normalize(vOP.xy + 1e-4) * 0.012;
    vec3 bleed = vec3(texture2D(uMap, qc - o).r, texture2D(uMap, qc).g, texture2D(uMap, qc + o).b) * uLoaded;
    col = vec3(0.004, 0.0045, 0.006) + bleed * (face * 0.012 + (1.0 - face) * 0.035);
    col = mix(col, mix(vec3(0.02, 0.021, 0.026), tex, uLoaded), inside);
    // The polished bevel: the narrow rounded band between face and side. It carries the bright edge and the strip light;
    // the flat bezel and the thickness stay dark, with only a trace of reflection.
    float arc = smoothstep(0.08, 0.4, vON.z) * (1.0 - smoothstep(0.86, 0.97, vON.z));
    float side = (1.0 - face) * (1.0 - arc);
    col += vec3(1.0, 0.985, 0.96) * glint * arc * 1.8;
    col += spec * fres * (arc * 1.3 + side * 0.3 + face * mix(0.35, 0.12, inside));
    col += vec3(0.75, 0.78, 0.84) * smoothstep(0.3, 0.95, dot(n, L)) * arc * 0.22;
    // Where the glass meets the screen: a hairline, barely there.
    col += vec3(0.12) * (1.0 - smoothstep(0.0, aa * 1.5, abs(d))) * face * (1.0 - inside);
    float band = dot(vOP.xy / uSize.y, vec2(0.8, -0.6)) + ov.x * 0.35;
    col += vec3(0.88, 0.9, 0.96) * exp(-pow((band + 0.62) / 0.09, 2.0)) * mix(0.05, 0.015, inside) * face;
    float rim = arc + face * smoothstep(-0.01, 0.0, dOut);
    col += uAccent * uHi * rim * 0.6;
    alpha = mix(mix(0.92, 0.82, side), 1.0, inside);
  } else {
    // A plate: smoky glass with its own silhouette and a fine engraving. The application layer carries a twelve-column grid,
    // the deepest layer a dot lattice; both read as structure, not as a drawing of something that was not built.
    vec2 p = vOP.xy;
    float aa = fwidth(dOut);
    // The edge is lit from the key light: bright along the top and left, fading to almost nothing at the bottom right.
    vec2 od = normalize(sign(p) * max(abs(p) - (hs - 0.04), 0.0) + 1e-5);
    float lit = pow(clamp(dot(od, normalize(vec2(-0.55, 0.85))) * 0.5 + 0.5, 0.0, 1.0), 2.0);
    float rimLine = (1.0 - smoothstep(0.0, aa * 1.5, abs(dOut + 0.003))) * (0.12 + 0.88 * lit);
    vec2 inner = hs - 0.05;
    float within = 1.0 - smoothstep(-0.01, 0.0, sdRound(p, inner, 0.015));
    vec2 w = fwidth(p);
    float pat;
    if (uKind < 1.5) {
      vec2 cell = vec2(inner.x / 6.0, 0.08);
      vec2 g = abs(fract((p + inner) / cell + 0.5) - 0.5) * cell;
      pat = max(1.0 - smoothstep(0.0, w.x, g.x), 0.45 * (1.0 - smoothstep(0.0, w.y, g.y)));
    } else {
      vec2 g = (fract((p + inner) / 0.05) - 0.5) * 0.05;
      float rd = length(g);
      pat = 1.0 - smoothstep(0.0035, 0.0035 + max(w.x, w.y), rd);
    }
    pat *= within;
    vec3 ink = mix(vec3(0.72, 0.75, 0.82), uAccent, 0.2 + 0.8 * uHi);
    float boost = 1.0 + uHi * 1.3;
    // The substrate: a faint fill, a little lighter toward the lit corner, so each plate reads as a surface, not an outline.
    float fill = 0.05 + 0.05 * clamp(dot(p / hs, vec2(-0.5, 0.5)) + 0.5, 0.0, 1.0);
    col = vec3(0.55, 0.58, 0.66) * fill + ink * (pat * 0.16 + rimLine * 0.75) * boost + spec * fres * 0.6 + glint * 0.6;
    alpha = face * (0.32 + (pat * 0.18 + rimLine * 0.7) * boost) + (1.0 - face) * 0.7;
    col = mix(col, vec3(0.2, 0.21, 0.24) + spec * 0.6 + glint, 1.0 - face);
    // The layer's own words. Behind them, and whenever the plate comes forward over the screen, the glass darkens so they read.
    vec4 info = texture2D(uInfo, vOP.xy / uSize.xy + 0.5) * uHasInfo * face;
    float solid = max(info.a * 0.55, uFwd * uHasInfo * 0.97) * face;
    col = mix(col, vec3(0.016, 0.018, 0.024) + rimLine * ink * 0.6 * boost, solid * 0.8);
    alpha = max(alpha, solid);
    col = mix(col, info.rgb, info.a);
    alpha = max(alpha, info.a);
  }
  // Another layer in focus: the plates step back further than the screen, which stays the clearest thing in the chamber.
  // A plate brought forward over the screen dims it further, so the screen never reads through the words.
  col *= 1.0 - (uKind < 0.5 ? 0.3 + 0.5 * uFwd : 0.5) * uDim;
  gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0) * uAlpha);
  #include <colorspace_fragment>
}`

interface Tween { from: number; to: number; t0: number; dur: number }
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3)
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const tween = (v: number): Tween => ({ from: v, to: v, t0: 0, dur: 0 })
const valueOf = (t: Tween, now: number, curve = easeOut) => (t.dur <= 0 ? t.to : t.from + (t.to - t.from) * curve(clamp01((now - t.t0) / t.dur)))
const busy = (t: Tween, now: number) => t.dur > 0 && now < t.t0 + t.dur
function aim(t: Tween, to: number, dur: number, now: number, curve?: (x: number) => number) {
  if (t.to === to) return
  t.from = valueOf(t, now, curve)
  t.to = to
  t.t0 = now
  t.dur = dur
}

/**
 * One plate's words, drawn into its right half: the technologies, two or three concepts under hairlines, and at the foot
 * the proof (what kind of evidence it is, the figure, what it counts) or a scope note. Sizes follow the plate, so a phone
 * plate and a desktop plate read alike.
 */
function plateCanvas(t: PlateText, aspect: number) {
  const H = 1024, W = Math.round(H * aspect)
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')
  if (!g) return c
  const x0 = Math.round(W * 0.5), x1 = W - Math.round(W * 0.06), wide = x1 - x0
  const u = Math.min(H * 0.056, W * 0.075)
  const face = (size: number, weight = 400) => `${weight} ${Math.round(size)}px Archivo, ui-sans-serif, system-ui, sans-serif`
  const lines = (text: string, size: number, weight = 400) => {
    g.font = face(size, weight)
    const out: string[] = []
    for (const word of text.split(' ')) {
      const last = out[out.length - 1]
      if (last !== undefined && g.measureText(`${last} ${word}`).width <= wide) out[out.length - 1] = `${last} ${word}`
      else out.push(word)
    }
    return out
  }
  const fit = (text: string, size: number, weight: number) => {
    g.font = face(size, weight)
    return Math.min(size, (size * wide) / g.measureText(text).width)
  }
  const write = (text: string, y: number, size: number, color: string, weight = 400, lead = 1.25) => {
    const ls = lines(text, size, weight)
    g.fillStyle = color
    ls.forEach((l, i) => g.fillText(l, x0, y + i * size * lead))
    return y + ls.length * size * lead
  }
  g.textBaseline = 'top'
  let y = H * 0.08
  y = write(t.stack, y, u * 0.62, 'rgba(214, 218, 230, 0.62)', 500)
  y += u * 0.7
  for (const concept of t.concepts) {
    g.fillStyle = 'rgba(255, 255, 255, 0.16)'
    g.fillRect(x0, y, wide, Math.max(2, H * 0.002))
    y = write(concept, y + u * 0.42, u, 'rgba(240, 241, 245, 0.95)') + u * 0.36
  }
  const foot = t.proof
    ? [
        { text: t.proof.kind, size: u * 0.56, color: 'rgba(214, 218, 230, 0.62)', weight: 500 },
        // The figure stays on one line, smaller if the plate is narrow.
        { text: t.proof.value, size: fit(t.proof.value, u * 1.6, 400), color: 'rgba(250, 250, 252, 1)', weight: 400 },
        { text: t.proof.label, size: u * 0.62, color: 'rgba(214, 218, 230, 0.8)', weight: 400 },
      ]
    : t.note ? [{ text: t.note, size: u * 0.62, color: 'rgba(214, 218, 230, 0.8)', weight: 400 }] : []
  const height = foot.reduce((sum, f) => sum + lines(f.text, f.size, f.weight).length * f.size * 1.25 + u * 0.15, 0)
  let fy = Math.max(y + u * 0.6, H * 0.92 - height)
  for (const f of foot) fy = write(f.text, fy, f.size, f.color, f.weight) + u * 0.15
  return c
}

export function createChamber(
  host: HTMLElement,
  options: { products: ChamberProduct[]; selected: number; expanded: boolean; layer: number | null; mode: 0 | 1; reduced: boolean; labels: (HTMLElement | null)[]; onReady(ready: boolean): void; onLost(): void },
): Chamber {
  const { products, reduced, labels } = options
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setClearColor(0x000000, 0)
  const canvas = renderer.domElement
  canvas.className = 're-ch-canvas'
  host.appendChild(canvas)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 50)
  camera.position.set(0, 0.4, 6)
  camera.lookAt(0, 0, 0)
  camera.updateMatrixWorld()
  const accent = new THREE.Color(options.mode ? '#5be7ff' : '#3ee6a4')
  const blank = new THREE.DataTexture(new Uint8Array([6, 6, 10, 255]), 1, 1)
  blank.needsUpdate = true

  let selected = options.selected
  let layer: number | null = options.layer
  const explode = tween(options.expanded ? 1 : 0)
  const aside = tween(0)

  const items = products.map((p, i) => {
    const h = 1
    const w = (h - 2 * BEZEL) * p.aspect + 2 * BEZEL
    const group = new THREE.Group()
    const front = new RoundedBoxGeometry(w, h, T, 4, 0.025)
    const plate = new RoundedBoxGeometry(w, h, TP, 2, 0.006)
    const slabs = [0, 1, 2].map((k) => {
      const u = {
        uMap: { value: blank as THREE.Texture }, uSize: { value: new THREE.Vector3(w, h, k ? TP : T) }, uAccent: { value: accent },
        uKind: { value: k }, uLoaded: { value: 0 }, uAlpha: { value: 0 }, uHi: { value: 0 }, uDim: { value: 0 },
        uInfo: { value: blank as THREE.Texture }, uHasInfo: { value: 0 }, uFwd: { value: 0 },
      }
      const mat = new THREE.ShaderMaterial({ uniforms: u, vertexShader: vertex, fragmentShader: fragment, transparent: true, depthWrite: k === 0 })
      const mesh = new THREE.Mesh(k ? plate : front, mat)
      // Deepest plate first, the front glass last.
      mesh.renderOrder = 2 - k
      group.add(mesh)
      return { mesh, u, hi: tween(0), fwd: 0 }
    })
    group.visible = false
    scene.add(group)
    return { group, slabs, w, h, front, plate, info: !!p.plates, presence: tween(i === selected ? 1 : 0), small: null as THREE.Texture | null, sharp: null as THREE.Texture | null }
  })
  if (layer !== null) items[selected].slabs[layer].hi = tween(1)

  // ---------- Layout: one camera, and each product scaled and placed so its opened stack fills the stage ----------
  let cssW = 1, cssH = 1, narrow = false
  const offsets = (it: (typeof items)[number], k: number, e: number, out: THREE.Vector3) => {
    if (k === 0) return out.set(0, 0, 0)
    // Closed, each plate sits a hair up and to the right of the one in front: a seam that hints at the layers inside.
    const shut = new THREE.Vector3(0.01 * k, 0.008 * k, -(T / 2 + TP / 2 + 0.004) - (k - 1) * (TP + 0.004))
    // Phones keep the plates shallow so they stay inside a small stage. A product whose layers carry words fans them out
    // half a width apart, so the right half of each plate, where its words sit, is in view.
    const open = narrow
      ? new THREE.Vector3(0.05 * k, 0.12 * k, -0.34 * k)
      : it.info ? new THREE.Vector3(0.5 * it.w * k, 0.035 * k, -0.36 * k) : new THREE.Vector3(0.15 * k, 0.05 * k, -0.5 * k)
    return out.lerpVectors(shut, open, e)
  }
  /** Where a plate stands when its layer is chosen: in front of the screen, centred on the opened fan, a little larger. */
  const forward = (it: (typeof items)[number], out: THREE.Vector3) => out.set(narrow ? 0 : 0.5 * it.w, 0, T / 2 + TP / 2 + 0.14)
  const fwdAt = new THREE.Vector3()
  const corner = new THREE.Vector3(), off = new THREE.Vector3(), box = new THREE.Box2()
  /** Places a product's stack in a region of the stage: the whole stage opened (with room for the titles), or the left third closed. */
  function fit(it: (typeof items)[number], side: boolean) {
    it.group.rotation.set(narrow ? 0.02 : 0.04, narrow ? -0.16 : -0.3, narrow ? 0 : -0.03)
    it.group.position.set(0, 0, 0)
    it.group.scale.setScalar(1)
    const dist = camera.position.length()
    const hh = Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * dist, hw = hh * camera.aspect
    const room = narrow || side ? 0 : (2 * LABEL_ROOM) / cssH
    const pad = narrow ? 0.03 : side ? 0.08 : 0.02
    const top = 1 - pad - room, bottom = -1 + pad, left = -1 + pad, right = side ? -0.36 : 1 - pad
    for (let pass = 0; pass < 4; pass++) {
      it.group.updateMatrixWorld()
      box.makeEmpty()
      for (let k = 0; k < 3; k++) {
        offsets(it, k, side ? 0 : 1, off)
        for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
          corner.set((sx * it.w) / 2, (sy * it.h) / 2, 0).add(off).applyMatrix4(it.group.matrixWorld).project(camera)
          box.expandByPoint(new THREE.Vector2(corner.x, corner.y))
        }
      }
      const k = Math.min((right - left) / (box.max.x - box.min.x), (top - bottom) / (box.max.y - box.min.y))
      it.group.scale.multiplyScalar(k)
      it.group.position.x += ((left + right) / 2 - ((box.min.x + box.max.x) / 2) * k) * hw
      it.group.position.y += ((top + bottom) / 2 - ((box.min.y + box.max.y) / 2) * k) * hh
    }
    return { pos: it.group.position.clone(), scale: it.group.scale.x }
  }
  function resize() {
    cssW = host.clientWidth
    cssH = host.clientHeight
    if (!cssW || !cssH) return
    narrow = cssW < 600
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2))
    renderer.setSize(cssW, cssH, false)
    camera.aspect = cssW / cssH
    camera.updateProjectionMatrix()
    items.forEach((it) => { it.group.userData.full = fit(it, false); it.group.userData.side = fit(it, true) })
    loadSharp(selected)
    invalidate()
  }

  // ---------- Textures: every 1280 px screen up front; the full-size original only for the shown product on a big stage ----------
  const smallLoader = new THREE.ImageBitmapLoader().setOptions({ imageOrientation: 'flipY' })
  const sharpLoader = new THREE.ImageBitmapLoader().setOptions({ imageOrientation: 'flipY', resizeWidth: 2048, resizeQuality: 'high' })
  let disposed = false, shownReady: boolean | null = null
  const sharpOrder: number[] = []
  const toTexture = (bitmap: ImageBitmap) => {
    const tex = new THREE.Texture(bitmap)
    tex.flipY = false
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
    tex.needsUpdate = true
    return tex
  }
  // A texture owns its decoded bitmap: free both, once nothing shows it any more.
  const drop = (tex: THREE.Texture | null) => {
    tex?.dispose()
    ;(tex?.image as ImageBitmap | undefined)?.close?.()
  }
  // Tells the page whether the shown product's own screen is on the glass. Until it is (still loading, or its decode failed),
  // the page keeps the plain image of that screen in view instead of empty glass.
  function report() {
    const ok = items[selected].slabs[0].u.uLoaded.value === 1
    if (ok !== shownReady) { shownReady = ok; options.onReady(ok) }
  }
  function show(it: (typeof items)[number]) {
    const u = it.slabs[0].u
    u.uMap.value = it.sharp ?? it.small ?? blank
    u.uLoaded.value = u.uMap.value === blank ? 0 : 1
  }
  const order = [selected, ...products.map((_, i) => i).filter((i) => i !== selected)]
  order.forEach((i) =>
    smallLoader.load(products[i].texture, (bitmap) => {
      if (disposed) { (bitmap as ImageBitmap).close?.(); return }
      items[i].small = toTexture(bitmap as ImageBitmap)
      show(items[i])
      if (i === selected) invalidate()
    }, undefined, () => { if (i === selected) report() }),
  )
  function loadSharp(i: number) {
    const src = products[i].sharp
    const it = items[i]
    if (!src || it.sharp || it.group.userData.sharpLoading || cssW * renderer.getPixelRatio() < 1400) return
    it.group.userData.sharpLoading = true
    sharpLoader.load(src, (bitmap) => {
      it.group.userData.sharpLoading = false
      if (disposed) { (bitmap as ImageBitmap).close?.(); return }
      it.sharp = toTexture(bitmap as ImageBitmap)
      show(it)
      sharpOrder.push(i)
      // Two full-size screens at most stay on the GPU (the shown one and the one fading out).
      while (sharpOrder.length > 2) {
        const j = sharpOrder.findIndex((x) => x !== selected)
        const [old] = sharpOrder.splice(j, 1)
        const tex = items[old].sharp
        items[old].sharp = null
        show(items[old])
        drop(tex)
      }
      invalidate()
    }, undefined, () => { it.group.userData.sharpLoading = false })
  }

  // ---------- The layers' words, drawn once the page font is ready ----------
  const words: THREE.Texture[] = []
  document.fonts.load('400 48px Archivo').catch(() => {}).finally(() => {
    if (disposed) return
    products.forEach((p, i) => p.plates?.forEach((t, j) => {
      const tex = new THREE.CanvasTexture(plateCanvas(t, items[i].w / items[i].h))
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
      words.push(tex)
      const u = items[i].slabs[j + 1].u
      u.uInfo.value = tex
      u.uHasInfo.value = 1
    }))
    invalidate()
  })

  // ---------- Drawing: only while a tween runs, and only while the stage is on screen ----------
  let raf = 0, visible = true
  function invalidate() {
    if (!raf && !disposed) raf = requestAnimationFrame(frame)
  }
  function frame() {
    raf = 0
    if (!visible || !cssW || !cssH || document.hidden) return
    const now = performance.now()
    // Beside a demo the stack reads closed, whatever the reader chose; the choice returns when the demo closes.
    const sd = valueOf(aside, now)
    const e = valueOf(explode, now) * (1 - sd)
    let moving = busy(explode, now) || busy(aside, now)
    const it0 = items[selected]
    items.forEach((it) => {
      // The leaving screen fades out in the first half, the arriving one fades in over the second, with a short move back and forward.
      const pr = valueOf(it.presence, now, (x) => x)
      moving ||= busy(it.presence, now)
      const a = clamp01((pr - 0.45) / 0.55)
      it.group.visible = a > 0.001
      if (!it.group.visible) return
      const { full, side } = it.group.userData as Record<'full' | 'side', { pos: THREE.Vector3; scale: number }>
      it.group.position.lerpVectors(full.pos, side.pos, sd)
      it.group.scale.setScalar(full.scale + (side.scale - full.scale) * sd)
      it.group.position.z -= (1 - easeOut(clamp01(pr))) * 0.18
      let any = 0, fwdAny = 0
      it.slabs.forEach((s, k) => {
        const hi = valueOf(s.hi, now)
        any = Math.max(any, hi)
        if (k && it.info) fwdAny = Math.max(fwdAny, hi * e)
      })
      it.slabs.forEach((s, k) => {
        const hi = valueOf(s.hi, now)
        moving ||= busy(s.hi, now)
        // Open, a chosen layer with words comes forward over the screen; the rest step back.
        const fwd = k && it.info ? hi * e : 0
        offsets(it, k, e, s.mesh.position).lerp(forward(it, fwdAt), fwd)
        s.mesh.position.z -= (fwdAny - fwd) * 0.22
        // A wide plate grows a little; a tall one is already as high as the stage allows.
        s.mesh.scale.setScalar(1 + (narrow || it.w < it.h ? 0 : 0.14) * fwd)
        s.mesh.renderOrder = fwd > 0.5 ? 3 : 2 - k
        // The screen hears how far another layer has come forward; a plate, its own step.
        s.fwd = fwd
        s.u.uFwd.value = k ? fwd : fwdAny
        // On a phone the plates sit close behind the screen, so their words show only on the one brought forward.
        if (k && it.info) s.u.uHasInfo.value = s.u.uInfo.value === blank ? 0 : narrow ? fwd : 1
        s.u.uAlpha.value = a
        s.u.uHi.value = hi
        s.u.uDim.value = Math.max(0, any - hi)
        // A fading screen must not write depth, or it cuts a hole in the one arriving behind it.
        s.mesh.material.depthWrite = k === 0 && a > 0.99
      })
    })
    renderer.render(scene, camera)
    placeLabels(it0, e, clamp01((valueOf(it0.presence, now, (x) => x) - 0.45) / 0.55))
    report()
    if (moving) invalidate()
  }
  const proj = new THREE.Vector3()
  const lastLabel: string[] = []
  function placeLabels(it: (typeof items)[number], e: number, a: number) {
    labels.forEach((el, k) => {
      if (!el) return
      // While a plate stands forward, the titles of the plates behind it step out of its way.
      const behind = k ? Math.max(0, Math.max(...it.slabs.map((s) => s.fwd)) - it.slabs[k].fwd) : 0
      const op = narrow ? 0 : clamp01(e * 2 - 1) * a * (1 - behind)
      it.group.updateMatrixWorld()
      // Fanned plates show their right half, so their titles start there.
      const x0 = k && it.info && !narrow ? 0.03 : -it.w / 2 + 0.03
      proj.set(x0, it.h / 2, 0).applyMatrix4(it.slabs[k].mesh.matrixWorld).project(camera)
      const x = ((proj.x + 1) / 2) * cssW, y = ((1 - proj.y) / 2) * cssH
      const key = op < 0.02 ? 'off' : `${op.toFixed(2)}|${x.toFixed(1)}|${y.toFixed(1)}`
      if (lastLabel[k] === key) return
      lastLabel[k] = key
      el.style.visibility = key === 'off' ? 'hidden' : 'visible'
      el.style.opacity = key === 'off' ? '0' : op.toFixed(2)
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
    })
  }

  const ro = new ResizeObserver(resize)
  ro.observe(host)
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) invalidate() })
  io.observe(host)
  const onVis = () => { if (!document.hidden) invalidate() }
  document.addEventListener('visibilitychange', onVis)
  const onLost = (ev: Event) => { ev.preventDefault(); options.onLost() }
  canvas.addEventListener('webglcontextlost', onLost)
  resize()
  // Compile both programs before the first frame shows, so the first selection never stalls.
  renderer.compileAsync(scene, camera).catch(() => {}).finally(invalidate)

  return {
    select(i, instant) {
      if (i === selected) return
      const now = performance.now()
      const dur = reduced || instant ? 0 : DUR.product
      items.forEach((it, j) => aim(it.presence, j === i ? 1 : 0, dur, now, (x) => x))
      items[selected].slabs.forEach((s) => aim(s.hi, 0, 0, now))
      selected = i
      layer = null
      loadSharp(i)
      report()
      invalidate()
    },
    setExpanded(on, instant) {
      aim(explode, on ? 1 : 0, reduced || instant ? 0 : DUR.layers, performance.now())
      invalidate()
    },
    setLayer(i, instant) {
      if (i === layer) return
      layer = i
      const now = performance.now()
      items[selected].slabs.forEach((s, k) => aim(s.hi, k === i ? 1 : 0, reduced || instant ? 0 : DUR.layers, now))
      invalidate()
    },
    setAside(on, instant) {
      aim(aside, on ? 1 : 0, reduced || instant ? 0 : DUR.layers, performance.now())
      invalidate()
    },
    setMode(m) {
      accent.set(m ? '#5be7ff' : '#3ee6a4')
      invalidate()
    },
    dispose() {
      disposed = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      canvas.removeEventListener('webglcontextlost', onLost)
      items.forEach((it) => {
        it.front.dispose()
        it.plate.dispose()
        drop(it.small)
        drop(it.sharp)
        it.slabs.forEach((s) => s.mesh.material.dispose())
      })
      words.forEach((t) => t.dispose())
      blank.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    },
  }
}
