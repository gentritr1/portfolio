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
}

export interface Chamber {
  /** `instant` skips the cross-fade (keyboard and reduced motion). */
  select(index: number, instant?: boolean): void
  setExpanded(on: boolean): void
  setLayer(index: number | null): void
  setMode(mode: 0 | 1): void
  dispose(): void
}

const T = 0.05 // front glass thickness, in screen heights
const TP = 0.012 // plate thickness
const BEZEL = 0.026
const FOV = 20
const DUR = { product: 220, layers: 290, layer: 160 }
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
uniform sampler2D uMap;
uniform vec3 uSize, uAccent;
uniform float uKind, uLoaded, uAlpha, uHi, uDim;
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
  if (uKind < 0.5) {
    // The screen sits halfway into the glass, so it shifts a touch against the bevel as the view turns.
    vec3 ov = normalize(vOV);
    vec2 inner = hs - ${BEZEL.toFixed(3)};
    vec2 p = vOP.xy - ov.xy / max(ov.z, 0.3) * uSize.z * 0.5;
    float d = sdRound(p, inner, 0.012);
    float aa = fwidth(d);
    float inside = (1.0 - smoothstep(-aa, aa, d)) * face;
    vec2 q = p / (inner * 2.0) + 0.5;
    vec3 tex = texture2D(uMap, q).rgb;
    // Dark glass; near its edges the screen's own light runs into the thickness, split by dispersion.
    vec2 qc = clamp(q, 0.002, 0.998);
    vec2 o = normalize(vOP.xy + 1e-4) * 0.012;
    vec3 bleed = vec3(texture2D(uMap, qc - o).r, texture2D(uMap, qc).g, texture2D(uMap, qc + o).b) * uLoaded;
    col = vec3(0.008, 0.009, 0.012) + bleed * (face * 0.025 + (1.0 - face) * 0.06);
    col = mix(col, mix(vec3(0.02, 0.021, 0.026), tex, uLoaded), inside);
    // The reflection stays faint over the screen and polishes the bezel and the bevel.
    col += spec * fres * mix(1.6, 0.35, inside);
    col += vec3(0.32) * (1.0 - smoothstep(0.0, aa * 1.5, abs(d))) * face * (1.0 - inside);
    // A soft diagonal of the same strip light across the upper left, bright on the bezel and barely there over the screen,
    // and the top and left bevels catching it.
    float band = dot(vOP.xy / uSize.y, vec2(0.8, -0.6)) + ov.x * 0.35;
    float sheen = exp(-pow((band + 0.62) / 0.11, 2.0));
    col += vec3(0.88, 0.9, 0.96) * sheen * mix(0.12, 0.025, inside) * face;
    col += vec3(0.85, 0.88, 0.95) * (1.0 - face) * (smoothstep(0.2, 0.9, vON.y) * 0.32 + smoothstep(0.2, 0.9, -vON.x) * 0.16);
    float rim = (1.0 - face) + face * smoothstep(-0.012, 0.0, dOut);
    col += uAccent * uHi * rim * 0.55;
    alpha = mix(0.9, 1.0, inside);
  } else {
    // A plate: a clear substrate with a fine engraving. The application layer carries a twelve-column grid,
    // the deepest layer a dot lattice; both read as structure, not as a drawing of something that was not built.
    vec2 p = vOP.xy;
    float aa = fwidth(dOut);
    float rimLine = 1.0 - smoothstep(0.0, aa * 1.5, abs(dOut + 0.003));
    vec2 inner = hs - 0.05;
    float dIn = sdRound(p, inner, 0.015);
    float frame = 1.0 - smoothstep(0.0, fwidth(dIn) * 1.2, abs(dIn));
    float within = 1.0 - step(0.0, dIn);
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
    float lit = 1.0 + uHi * 1.3;
    col = vec3(0.02, 0.022, 0.03) + ink * (pat * 0.2 + frame * 0.3 + rimLine * 0.7) * lit + spec * fres * 0.8;
    alpha = face * (0.14 + (pat * 0.22 + frame * 0.35 + rimLine * 0.7) * lit) + (1.0 - face) * 0.8;
    col = mix(col, vec3(0.5, 0.52, 0.58) + spec, 1.0 - face);
  }
  // Another layer in focus: the plates step back further than the screen, which stays the clearest thing in the chamber.
  col *= 1.0 - (uKind < 0.5 ? 0.3 : 0.5) * uDim;
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

export function createChamber(
  host: HTMLElement,
  options: { products: ChamberProduct[]; selected: number; expanded: boolean; mode: 0 | 1; reduced: boolean; labels: (HTMLElement | null)[]; onReady(): void; onLost(): void },
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
  let layer: number | null = null
  const explode = tween(options.expanded ? 1 : 0)

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
      }
      const mat = new THREE.ShaderMaterial({ uniforms: u, vertexShader: vertex, fragmentShader: fragment, transparent: true, depthWrite: k === 0 })
      const mesh = new THREE.Mesh(k ? plate : front, mat)
      // Deepest plate first, the front glass last.
      mesh.renderOrder = 2 - k
      group.add(mesh)
      return { mesh, u, hi: tween(0) }
    })
    group.visible = false
    scene.add(group)
    return { group, slabs, w, h, front, plate, presence: tween(i === selected ? 1 : 0), small: null as THREE.Texture | null, sharp: null as THREE.Texture | null }
  })

  // ---------- Layout: one camera, and each product scaled and placed so its opened stack fills the stage ----------
  let cssW = 1, cssH = 1, narrow = false
  const offsets = (k: number, e: number, out: THREE.Vector3) => {
    if (k === 0) return out.set(0, 0, 0)
    const shut = -(T / 2 + TP / 2 + 0.004) - (k - 1) * (TP + 0.004)
    // Phones keep the plates shallow so they stay inside a small stage.
    const open = narrow ? new THREE.Vector3(0.05 * k, 0.12 * k, -0.34 * k) : new THREE.Vector3(0.1 * k, 0.015 * k, -0.42 * k)
    return out.set(open.x * e, open.y * e, shut + (open.z - shut) * e)
  }
  const corner = new THREE.Vector3(), off = new THREE.Vector3(), box = new THREE.Box2()
  function fit(it: (typeof items)[number]) {
    it.group.rotation.set(narrow ? 0.02 : 0.04, narrow ? -0.16 : -0.3, narrow ? 0 : -0.03)
    it.group.position.set(0, 0, 0)
    it.group.scale.setScalar(1)
    const dist = camera.position.length()
    const hh = Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * dist, hw = hh * camera.aspect
    const room = narrow ? 0 : (2 * LABEL_ROOM) / cssH
    const pad = narrow ? 0.03 : 0.02
    const top = 1 - pad - room, bottom = -1 + pad, left = -1 + pad, right = 1 - pad
    for (let pass = 0; pass < 4; pass++) {
      it.group.updateMatrixWorld()
      box.makeEmpty()
      for (let k = 0; k < 3; k++) {
        offsets(k, 1, off)
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
    it.group.userData.base = it.group.position.clone()
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
    items.forEach(fit)
    loadSharp(selected)
    invalidate()
  }

  // ---------- Textures: every 1280 px screen up front; the full-size original only for the shown product on a big stage ----------
  const smallLoader = new THREE.ImageBitmapLoader().setOptions({ imageOrientation: 'flipY' })
  const sharpLoader = new THREE.ImageBitmapLoader().setOptions({ imageOrientation: 'flipY', resizeWidth: 2048, resizeQuality: 'high' })
  let disposed = false, ready = false
  const sharpOrder: number[] = []
  const toTexture = (bitmap: ImageBitmap) => {
    const tex = new THREE.Texture(bitmap)
    tex.flipY = false
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
    tex.needsUpdate = true
    return tex
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
    }),
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
        items[old].sharp?.dispose()
        items[old].sharp = null
        show(items[old])
      }
      invalidate()
    }, undefined, () => { it.group.userData.sharpLoading = false })
  }

  // ---------- Drawing: only while a tween runs, and only while the stage is on screen ----------
  let raf = 0, visible = true
  function invalidate() {
    if (!raf && !disposed) raf = requestAnimationFrame(frame)
  }
  function frame() {
    raf = 0
    if (!visible || !cssW || !cssH || document.hidden) return
    const now = performance.now()
    const e = valueOf(explode, now)
    let moving = busy(explode, now)
    const it0 = items[selected]
    items.forEach((it) => {
      // The leaving screen fades out in the first half, the arriving one fades in over the second, with a short move back and forward.
      const pr = valueOf(it.presence, now, (x) => x)
      moving ||= busy(it.presence, now)
      const a = clamp01((pr - 0.45) / 0.55)
      it.group.visible = a > 0.001
      if (!it.group.visible) return
      const base = it.group.userData.base as THREE.Vector3
      it.group.position.copy(base)
      it.group.position.z -= (1 - easeOut(clamp01(pr))) * 0.18
      let any = 0
      it.slabs.forEach((s) => { any = Math.max(any, valueOf(s.hi, now)) })
      it.slabs.forEach((s, k) => {
        offsets(k, e, s.mesh.position)
        const hi = valueOf(s.hi, now)
        moving ||= busy(s.hi, now)
        s.u.uAlpha.value = a
        s.u.uHi.value = hi
        s.u.uDim.value = Math.max(0, any - hi)
        // A fading screen must not write depth, or it cuts a hole in the one arriving behind it.
        s.mesh.material.depthWrite = k === 0 && a > 0.99
      })
    })
    renderer.render(scene, camera)
    placeLabels(it0, e, clamp01((valueOf(it0.presence, now, (x) => x) - 0.45) / 0.55))
    if (!ready && it0.slabs[0].u.uLoaded.value) { ready = true; options.onReady() }
    if (moving) invalidate()
  }
  const proj = new THREE.Vector3()
  const lastLabel: string[] = []
  function placeLabels(it: (typeof items)[number], e: number, a: number) {
    labels.forEach((el, k) => {
      if (!el) return
      const op = narrow ? 0 : clamp01(e * 2 - 1) * a
      it.group.updateMatrixWorld()
      proj.set(-it.w / 2 + 0.03, it.h / 2, 0).applyMatrix4(it.slabs[k].mesh.matrixWorld).project(camera)
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
      invalidate()
    },
    setExpanded(on) {
      aim(explode, on ? 1 : 0, reduced ? 0 : DUR.layers, performance.now())
      invalidate()
    },
    setLayer(i) {
      if (i === layer) return
      layer = i
      const now = performance.now()
      items[selected].slabs.forEach((s, k) => aim(s.hi, k === i ? 1 : 0, reduced ? 0 : DUR.layer, now))
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
        it.small?.dispose()
        it.sharp?.dispose()
        it.slabs.forEach((s) => s.mesh.material.dispose())
      })
      blank.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    },
  }
}
