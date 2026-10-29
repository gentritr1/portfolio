import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'

/** Scroll stages, one per section. */
export const STAGE = { hero: 0, lab: 1, ledger: 2, modes: 3, sim: 4, contact: 5 } as const

export interface Stats {
  /** The field's energy, 0–1: it rings down after input. */
  ring?: number
  fps: number
  frameMs: number
  worstMs: number
  calls: number
  drawn: number
  /** The last 120 frame times in ms, as a ring; `head` is the next write. */
  history: Float32Array
  head: number
  frames: number
}

export interface RefractiveScene {
  count: number
  stats: Stats
  setStage(stage: number): void
  /** Mouse only. Client pixels; `inside` is false over UI. */
  setPointer(x: number, y: number, inside: boolean): void
  /** A page-driven lens (client pixels, radius in px, weight 0–1): the production chapters snap the field around a screen as it settles. */
  setFocus(x: number, y: number, r: number, w: number): void
  /** Input energy, 0–1 (scroll or pointer speed, already normalised). The field moves while it rings down, then rests. */
  wake(energy: number): void
  /** A mouse click: a ripple across the field. */
  ripple(x: number, y: number): void
  setMode(mode: 0 | 1): void
  setDrawCount(n: number): void
  setBloom(on: boolean): void
  setAberration(on: boolean): void
  setPixelRatio(r: number): void
  /** Live cluster centroids in world units. */
  centroids(): { x: number; y: number; z: number }[]
  /** Each cluster centre on screen, in client pixels; `on` is false when it is behind the camera. */
  project(): { x: number; y: number; on: boolean }[]
  /** Light one cluster in the accent (the one being pointed at), or none with -1. */
  highlight(k: number): void
  grid: { columns: number; pitch: number; left: number }
  dispose(): void
}

export function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!c.getContext('webgl2')
  } catch {
    return false
  }
}

// ---------- The UI skeleton the lens snaps to (world units, on the z = 0 plane) ----------
// A page: outer frame, header with logo and nav, a hero with headline lines, two buttons and an image, then three cards.
const FRAME = { l: -12.5, r: 12.5, b: -7.8, t: 7.8 }
const COLUMNS = 12
const PITCH = (FRAME.r - FRAME.l) / COLUMNS
/** Built at a scale where the 150 px lens (about 5 world units across at the hero) always holds several elements. */
const RECTS: [number, number, number, number][] = (() => {
  const r: [number, number, number, number][] = []
  const add = (l: number, b: number, rt: number, t: number) => { r.push([l, b, rt, t]) }
  add(FRAME.l, FRAME.b, FRAME.r, FRAME.t)
  // Header: logo, four nav items, a button.
  add(FRAME.l, 6.8, FRAME.r, FRAME.t)
  add(-12.0, 7.1, -10.6, 7.5)
  for (let i = 0; i < 4; i++) add(3.2 + i * 1.7, 7.22, 4.4 + i * 1.7, 7.38)
  add(10.3, 7.0, 12.0, 7.6)
  // Sidebar: nine rows of icon and label, then a small card.
  add(FRAME.l, FRAME.b, -8.6, 6.8)
  for (let i = 0; i < 9; i++) {
    const y = 6.0 - i * 0.85
    add(-12.0, y - 0.13, -11.74, y + 0.13)
    add(-11.45, y - 0.07, -9.3 - (i % 3) * 0.55, y + 0.07)
  }
  add(-12.0, -7.3, -9.1, -5.2)
  // Hero: two headline lines, two body lines, two buttons, and a chart.
  add(-7.8, 4.9, 1.8, 5.9)
  add(-7.8, 4.0, -1.2, 4.6)
  add(-7.8, 3.25, 0.8, 3.4)
  add(-7.8, 2.75, -0.6, 2.9)
  add(-7.8, 1.55, -5.6, 2.15)
  add(-5.2, 1.55, -3.4, 2.15)
  add(2.6, 1.4, 11.9, 6.2)
  const heights = [1.1, 1.9, 1.5, 2.8, 2.2, 3.3, 2.6, 3.9]
  heights.forEach((h, i) => add(3.4 + i * 1.03, 1.95, 3.9 + i * 1.03, 1.95 + h))
  // Two rows of three cards: frame, thumbnail, two lines of text, a tag.
  for (let row = 0; row < 2; row++) {
    for (let c = 0; c < 3; c++) {
      const l = -7.8 + c * 6.75, rt = l + 6.2, t = 0.9 - row * 4.15, b = t - 3.75
      add(l, b, rt, t)
      add(l + 0.35, b + 1.55, rt - 0.35, t - 0.35)
      add(l + 0.35, b + 1.0, rt - 1.6, b + 1.15)
      add(l + 0.35, b + 0.6, rt - 2.6, b + 0.75)
      add(rt - 1.35, b + 0.45, rt - 0.35, b + 0.85)
    }
  }
  return r
})()
// ---------- The tensor field: clusters and the links between them ----------
// Six clusters, one per area of the owner's work (CONTENT.md channels, in channelOrder): healthcare, streaming, mobile
// apps, Web3, web apps & AI, games & personal. Spread left to right and up and down so their labels never meet, at
// different depths so no two links run parallel.
const K = 6
const CENTROIDS: [number, number, number][] = [
  [-8.6, -0.6, -4.0], [-4.2, -3.4, -3.0], [-0.2, 3.2, -5.5], [4.4, -2.8, -2.5], [8.4, 3.0, -4.5], [10.4, -2.4, -6.0],
]
const SIGMA = [1.2, 1.0, 1.5, 0.9, 1.0, 1.6]
const SHADE = [0.9, 0.8, 1, 0.75, 0.85, 0.95]
const EDGES: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [0, 2], [2, 4], [1, 3]]

// The sheet reaches a little past the hero view, so most of its particles are where the lens can use them.
const FIELD_W = 40
const FIELD_H = 26
const LENS_R = 150

const particleVertex = /* glsl */ `
#define NR ${RECTS.length}
#define K ${K}
uniform float uTime, uMode, uIntro, uLens, uLensR, uPx, uShockR, uShockA, uDim, uJit;
uniform vec2 uPointer, uViewport;
uniform vec3 uC[K];
uniform vec3 uCCol[K];
uniform vec3 uShockC, uAccent;
uniform vec4 uRects[NR];
uniform vec3 uGrid; // left edge, pitch, unused
attribute vec3 aT;
attribute float aC, aMeta;
varying vec3 vColor;
varying float vAlpha;

vec2 onRect(vec2 q, vec4 r) {
  vec2 c = clamp(q, r.xy, r.zw);
  if (any(notEqual(c, q))) return c;
  float l = q.x - r.x, rr = r.z - q.x, b = q.y - r.y, t = r.w - q.y;
  float m = min(min(l, rr), min(b, t));
  if (m == l) return vec2(r.x, q.y);
  if (m == rr) return vec2(r.z, q.y);
  if (m == b) return vec2(q.x, r.y);
  return vec2(q.x, r.w);
}

void main() {
  float kind = floor(aMeta);
  float seed = fract(aMeta);
  float t = uTime;

  // Frontend Lens: a dot-grid sheet that breathes in slow, broad waves; the loose points hold a coarse lattice.
  vec3 g = position;
  float wave = sin(g.x * 0.21 + t * 0.32) * cos(g.y * 0.26 - t * 0.23);
  float wave2 = sin((g.x + g.y) * 0.11 - t * 0.18);
  float sheet = 1.0 - step(0.5, kind);
  g.z += (wave * 0.55 + wave2 * 0.35) * sheet;
  vec3 mono = vec3(0.74, 0.76, 0.80);
  vec3 gcol = mono * mix(0.6, 0.75 + 0.3 * wave, sheet);
  float galpha = mix(0.42, 0.62, sheet) * smoothstep(20.5, 15.5, abs(g.x)) * smoothstep(13.5, 10.0, abs(g.y));

  // AI Tensor Field: gaussian clusters, the links between them, and a thin haze.
  vec3 tp;
  vec3 tcol;
  float talpha = 0.3;
  if (aC < -0.5) {
    tp = aT;
    tcol = vec3(0.32, 0.32, 0.5);
    talpha = 0.34;
  } else if (aC > 99.5) {
    float k = aC - 100.0;
    int a = int(floor(k / 10.0 + 0.01));
    int b = int(k - float(a) * 10.0 + 0.5);
    vec3 ca = uC[a], cb = uC[b];
    vec3 dir = normalize(cb - ca);
    vec3 side = normalize(cross(dir, vec3(0.3, 0.9, 0.2)));
    vec3 up2 = cross(dir, side);
    float s = aT.x;
    tp = mix(ca, cb, s) + (side * aT.y + up2 * aT.z) * (0.5 + 0.5 * sin(s * 3.14159));
    tcol = mix(uCCol[a], uCCol[b], s) * 0.85;
    talpha = 0.4;
  } else {
    int k = int(aC + 0.5);
    tp = uC[k] + aT * (1.0 + 0.04 * sin(t * 0.5 + aC));
    tcol = uCCol[k];
  }

  // The switch: each particle leaves a little after the one before it, so the field rearranges as one motion.
  float m = smoothstep(seed * 0.3, seed * 0.3 + 0.7, uMode);
  vec3 p = mix(g, tp, m);
  vec3 col = mix(gcol, tcol, m);
  float alpha = mix(galpha, talpha, m);

  // Arrival: the field settles forward a short way as it fades up.
  p.z -= (1.0 - uIntro) * 2.4;

  // Mouse-click ripple across the plane.
  vec3 sd = p - uShockC;
  float ring = length(sd.xy) - uShockR;
  float rip = exp(-ring * ring * 3.0) * uShockA;
  p.xy += normalize(sd.xy + 1e-4) * rip * 0.3;
  p.z += rip * 0.6;

  // The lens: inside a screen-space circle around the cursor, particles snap onto the page skeleton.
  vec4 clip = projectionMatrix * viewMatrix * vec4(p, 1.0);
  float wire = 0.0, onGrid = 0.0, raw = 0.0;
  if (uLens > 0.001 && clip.w > 0.0) {
    vec2 scr = (clip.xy / clip.w * 0.5 + 0.5) * uViewport;
    float lw = uLens * (1.0 - smoothstep(uLensR * 0.7, uLensR, distance(scr, uPointer)));
    if (lw > 0.001) {
      // Project along the view ray onto the skeleton plane, so deep particles land where they already appear.
      vec3 ray = p - cameraPosition;
      vec2 q = (cameraPosition + ray * (-cameraPosition.z / min(ray.z, -1e-3))).xy;
      q += (vec2(fract(seed * 37.1), fract(seed * 91.7)) - 0.5) * uJit;
      float best = 1e9;
      vec2 bp = q;
      for (int i = 0; i < NR; i++) {
        vec2 n = onRect(q, uRects[i]);
        float d = distance(n, q);
        if (d < best) { best = d; bp = n; }
      }
      float gx = floor((q.x - uGrid.x) / uGrid.y + 0.5) * uGrid.y + uGrid.x;
      float dg = abs(q.x - gx);
      onGrid = step(dg + 0.3, best);
      vec2 s = mix(bp, vec2(gx, q.y), onGrid);
      // A share of the field stays raw inside the lens, dimmed, so the layout reads against it.
      float keep = step(0.3, fract(seed * 5.31));
      raw = lw * (1.0 - keep);
      wire = lw * lw * (3.0 - 2.0 * lw) * keep;
      p = mix(p, vec3(s, 0.0), wire);
      clip = projectionMatrix * viewMatrix * vec4(p, 1.0);
    }
  }
  col = mix(col, uAccent * mix(1.3, 0.6, onGrid), wire);
  alpha = mix(alpha, mix(0.5, 0.2, onGrid) * (1.0 - 0.6 * uMode), wire);
  alpha *= 1.0 - raw * 0.3;
  col += rip * 0.5;

  gl_Position = clip;
  float depth = clip.w;
  gl_PointSize = clamp(uPx * (0.7 + 0.6 * fract(seed * 3.7)) * (18.0 / depth) * (1.0 + wire * 0.7), 0.5, uPx * 3.0);
  vAlpha = alpha * uIntro * uDim * smoothstep(72.0, 30.0, depth) * smoothstep(0.8, 3.0, depth);
  vColor = col;
}`

const particleFragment = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main() {
  float f = smoothstep(0.5, 0.12, length(gl_PointCoord - 0.5));
  gl_FragColor = vec4(vColor * f * vAlpha, 1.0);
}`

const lineVertex = /* glsl */ `
#define K ${K}
uniform vec3 uC[K];
attribute float aIdx;
void main() {
  gl_Position = projectionMatrix * viewMatrix * vec4(uC[int(aIdx + 0.5)], 1.0);
}`

const lineFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uAlpha;
void main() { gl_FragColor = vec4(uColor * uAlpha, 1.0); }`

const quadVertex = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`

const aberrationShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uPointer: { value: new THREE.Vector2(-9999, -9999) },
    uR: { value: LENS_R },
    uAmt: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) },
    uScale: { value: 1 },
  },
  vertexShader: quadVertex,
  /** Only near the lens rim are R and B pulled apart along the radius; everywhere else this is a plain copy. */
  fragmentShader: /* glsl */ `
uniform sampler2D tDiffuse;
uniform vec2 uPointer, uRes;
uniform float uR, uAmt, uScale;
varying vec2 vUv;
void main() {
  vec2 px = vUv * uRes;
  vec2 d = px - uPointer;
  float dist = length(d);
  float ring = exp(-pow((dist - uR) / (uR * 0.17), 2.0)) * uAmt;
  vec4 base = texture2D(tDiffuse, vUv);
  if (ring < 0.003) { gl_FragColor = base; return; }
  vec2 o = d / max(dist, 1.0) * ring * 4.5 * uScale / uRes;
  vec3 col = vec3(texture2D(tDiffuse, vUv + o).r, base.g, texture2D(tDiffuse, vUv - o).b);
  gl_FragColor = vec4(col, 1.0);
}`,
}

const ease = (x: number) => x * x * (3 - 2 * x)
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3)
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const gauss = () => {
  const u = 1 - Math.random(), v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export function createScene(
  host: HTMLElement,
  options: { count: number; reduced: boolean; mode: 0 | 1; onReady(): void; weights?: number[] },
): RefractiveScene {
  const { count, reduced, onReady } = options
  performance.mark('re:scene-start')
  let pixelRatio = Math.min(devicePixelRatio || 1, 2)
  // Phone dots are a little larger, or the grid disappears at arm's length.
  const dot = innerWidth < 768 ? 2.2 : 1.7
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' })
  renderer.setPixelRatio(pixelRatio)
  renderer.toneMapping = THREE.NoToneMapping
  // The composer renders several passes a frame; count every one of them for the readout.
  renderer.info.autoReset = false
  host.appendChild(renderer.domElement)
  const scene = new THREE.Scene()
  // A colour-managed background: a raw dark clear colour is encoded to sRGB twice through OutputPass and reads grey.
  scene.background = new THREE.Color(0x050508)
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 300)
  const disposables: { dispose(): void }[] = []
  const track = <T extends { dispose(): void }>(x: T) => (disposables.push(x), x)

  // ---------- Particles: every attribute is written once here; positions are computed in the vertex shader ----------
  const g = track(new THREE.BufferGeometry())
  const pos = new Float32Array(count * 3)
  const aT = new Float32Array(count * 3)
  const aC = new Float32Array(count)
  const aMeta = new Float32Array(count)
  const nSheet = Math.round(count * 0.72)
  const spacing = Math.sqrt((FIELD_W * FIELD_H) / nSheet)
  const cols = Math.floor(FIELD_W / spacing), rows = Math.floor(FIELD_H / spacing)
  const lattice = cols * rows
  // Shuffled slots, so any draw range (the particle slider) is an even sample of the whole field.
  const slot = new Uint32Array(count)
  for (let i = 0; i < count; i++) slot[i] = i
  for (let i = count - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const s = slot[i]; slot[i] = slot[j]; slot[j] = s }
  // With weights (the number of projects in each area), a cloud's share of particles and its spread follow that count.
  const sigma = options.weights ? options.weights.map((w) => 0.75 + 0.32 * Math.sqrt(w)) : SIGMA
  const weights = options.weights ?? SIGMA.map((s) => s * s)
  const wsum = weights.reduce((a, b) => a + b, 0)
  for (let i = 0; i < count; i++) {
    const o = slot[i]
    const seed = Math.min(Math.random(), 0.9999)
    if (i < lattice) {
      pos[o * 3] = -FIELD_W / 2 + ((i % cols) + 0.5) * spacing
      pos[o * 3 + 1] = -FIELD_H / 2 + (Math.floor(i / cols) + 0.5) * spacing
      pos[o * 3 + 2] = 0
      aMeta[o] = seed
    } else {
      // Loose points on a coarse 3D lattice, in front of and behind the sheet.
      pos[o * 3] = (Math.round(((Math.random() - 0.5) * FIELD_W) / 1.6) * 1.6) + (Math.random() - 0.5) * 0.05
      pos[o * 3 + 1] = (Math.round(((Math.random() - 0.5) * FIELD_H) / 1.6) * 1.6) + (Math.random() - 0.5) * 0.05
      pos[o * 3 + 2] = -14 + Math.floor(Math.random() * 12) * 1.45
      aMeta[o] = 1 + seed
    }
    const r = Math.random()
    if (r < 0.7) {
      let pick = Math.random() * wsum, k = 0
      while (k < K - 1 && pick > weights[k]) { pick -= weights[k]; k++ }
      aC[o] = k
      aT[o * 3] = gauss() * sigma[k]
      aT[o * 3 + 1] = gauss() * sigma[k] * 0.8
      aT[o * 3 + 2] = gauss() * sigma[k] * 1.1
    } else if (r < 0.8) {
      const [a, b] = EDGES[Math.floor(Math.random() * EDGES.length)]
      aC[o] = 100 + a * 10 + b
      aT[o * 3] = Math.random()
      aT[o * 3 + 1] = gauss() * 0.22
      aT[o * 3 + 2] = gauss() * 0.22
    } else {
      aC[o] = -1
      aT[o * 3] = (Math.random() - 0.5) * 42
      aT[o * 3 + 1] = (Math.random() - 0.5) * 26
      aT[o * 3 + 2] = -13 + Math.random() * 15
    }
  }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('aT', new THREE.BufferAttribute(aT, 3))
  g.setAttribute('aC', new THREE.BufferAttribute(aC, 1))
  g.setAttribute('aMeta', new THREE.BufferAttribute(aMeta, 1))
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 60)

  const centroids = CENTROIDS.map(([x, y, z]) => new THREE.Vector3(x, y, z))
  const emerald = new THREE.Color('#3ee6a4')
  // Clouds are neutral; the accent belongs to the one being pointed at (highlight()), its only job here.
  const neutral = new THREE.Color('#c9ced8')
  const cbase = SHADE.map((v) => neutral.clone().multiplyScalar(v))
  const ccol = cbase.map((c) => c.clone())
  const accent = emerald.clone()
  const uniforms = {
    uTime: { value: 0 }, uMode: { value: options.mode as number }, uIntro: { value: reduced ? 1 : 0 }, uLens: { value: 0 }, uLensR: { value: LENS_R * pixelRatio },
    uPx: { value: dot * pixelRatio }, uShockR: { value: 0 }, uShockA: { value: 0 }, uDim: { value: 1 }, uJit: { value: spacing },
    uPointer: { value: new THREE.Vector2(-9999, -9999) }, uViewport: { value: new THREE.Vector2(1, 1) },
    uC: { value: centroids }, uCCol: { value: ccol }, uShockC: { value: new THREE.Vector3() }, uAccent: { value: accent },
    uRects: { value: RECTS.map(([a, b, c, d]) => new THREE.Vector4(a, b, c, d)) },
    uGrid: { value: new THREE.Vector3(FRAME.l, PITCH, 0) },
  }
  const mat = track(new THREE.ShaderMaterial({ uniforms, vertexShader: particleVertex, fragmentShader: particleFragment, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending }))
  const points = new THREE.Points(g, mat)
  points.frustumCulled = false
  scene.add(points)

  // One LineSegments draw links the cluster centres in the tensor field.
  const lg = track(new THREE.BufferGeometry())
  const idx = new Float32Array(EDGES.flat())
  lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(idx.length * 3), 3))
  lg.setAttribute('aIdx', new THREE.BufferAttribute(idx, 1))
  const lineU = { uC: uniforms.uC, uColor: { value: neutral.clone() }, uAlpha: { value: 0 } }
  const lines = new THREE.LineSegments(lg, track(new THREE.ShaderMaterial({ uniforms: lineU, vertexShader: lineVertex, fragmentShader: lineFragment, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })))
  lines.frustumCulled = false
  scene.add(lines)

  // ---------- Post ----------
  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.5, 0.45, 0.78)
  composer.addPass(bloom)
  const aberration = new ShaderPass(aberrationShader)
  composer.addPass(aberration)
  composer.addPass(new OutputPass())

  // ---------- Camera path: one pose per stage, rebuilt on resize ----------
  let path: { pos: THREE.CatmullRomCurve3; look: THREE.CatmullRomCurve3 } | null = null
  function buildPath() {
    const wide = camera.aspect > 1
    const P: THREE.Vector3[] = [], L: THREE.Vector3[] = []
    // Hero: nearly straight on. No pose ever looks straight down, so the roll is always defined.
    // One pose per stage, in page order: hero, lab, ledger, modes, sim, contact.
    P.push(new THREE.Vector3(0, 0.5, wide ? 18.5 : 19.5)); L.push(new THREE.Vector3(0, 0, 0))
    // Lab: the pose that used to frame the prism grid, so the field around the chamber moves as before.
    P.push(wide ? new THREE.Vector3(0, -3.8, 14.2) : new THREE.Vector3(0, -2.9, 22)); L.push(wide ? new THREE.Vector3(0, -4.7, 2.5) : new THREE.Vector3(0, -3.8, 2.5))
    // Ledger. Close enough that the dots stay about 5 px apart: further back, the grid beats against the pixels into moire.
    P.push(new THREE.Vector3(wide ? -5 : -3, -2.5, wide ? 25 : 30)); L.push(new THREE.Vector3(1, -1, -2))
    // Modes: the field turned to show its depth, where the two lenses are explained.
    P.push(wide ? new THREE.Vector3(8.5, 2.8, 14.5) : new THREE.Vector3(5, 3, 21)); L.push(wide ? new THREE.Vector3(1.8, 0, -2.5) : new THREE.Vector3(0.5, 0.4, -2.5))
    P.push(wide ? new THREE.Vector3(3, 1.5, 19) : new THREE.Vector3(0, -0.5, 25)); L.push(wide ? new THREE.Vector3(5.5, 0.4, 0) : new THREE.Vector3(0, -0.5, 0))
    P.push(new THREE.Vector3(0, 1.5, wide ? 24 : 30)); L.push(new THREE.Vector3(0, 0.5, 0))
    path = { pos: new THREE.CatmullRomCurve3(P, false, 'centripetal'), look: new THREE.CatmullRomCurve3(L, false, 'centripetal') }
  }

  let cssW = 1, cssH = 1
  function applySize() {
    renderer.setPixelRatio(pixelRatio)
    renderer.setSize(cssW, cssH, false)
    composer.setPixelRatio(pixelRatio)
    composer.setSize(cssW, cssH)
    // Bloom works from a quarter-size chain: soft light needs no more.
    bloom.setSize(Math.round(cssW * pixelRatio * 0.5), Math.round(cssH * pixelRatio * 0.5))
    const bw = Math.round(cssW * pixelRatio), bh = Math.round(cssH * pixelRatio)
    uniforms.uViewport.value.set(bw, bh)
    uniforms.uLensR.value = LENS_R * pixelRatio
    uniforms.uPx.value = dot * pixelRatio
    aberration.uniforms.uRes.value.set(bw, bh)
    aberration.uniforms.uR.value = LENS_R * pixelRatio
    aberration.uniforms.uScale.value = pixelRatio
  }
  function resize() {
    cssW = host.clientWidth || innerWidth
    cssH = host.clientHeight || innerHeight
    applySize()
    camera.aspect = cssW / cssH
    camera.updateProjectionMatrix()
    buildPath()
  }
  resize()
  const ro = new ResizeObserver(() => { resize(); kick() })
  ro.observe(host)

  // ---------- State ----------
  const camPos = new THREE.Vector3(0, 0.5, 18.5), lookCur = new THREE.Vector3(), want = new THREE.Vector3(), wantLook = new THREE.Vector3()
  const lean = new THREE.Vector2(), leanTarget = new THREE.Vector2(), camRight = new THREE.Vector3(), camUp = new THREE.Vector3(), camDir = new THREE.Vector3()
  const lensPos = new THREE.Vector2(-9999, -9999), lensTarget = new THREE.Vector2(-9999, -9999)
  let stage = 0, stageTarget = 0, lens = 0, lensWanted = false, lensFresh = true
  const focusPos = new THREE.Vector2(), focus = { r: LENS_R, w: 0 }
  // The field rings down like a room built for speech: RT60 = 0.8 s, a 60 dB fall (x 0.001). Input raises it.
  const RT60 = 0.8
  let ring = 1, stillFrames = 0
  let modeFrom = options.mode as number, modeTo = options.mode as number, modeT = 1
  // Under reduced motion the field starts settled: the intro never plays, so it must not count as movement.
  let shockT = -1, introT = reduced ? 1 : 0, disposed = false
  const stats: Stats = { fps: 0, frameMs: 0, worstMs: 0, calls: 0, drawn: count, history: new Float32Array(120), head: 0, frames: 0 }
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hitP = new THREE.Vector3()

  function toNdc(x: number, y: number) { return ndc.set((x / cssW) * 2 - 1, -(y / cssH) * 2 + 1) }
  // The lens rests while the chamber is on screen.
  const lensStageW = () => clamp01((Math.abs(stage - STAGE.lab) - 0.35) * 4)
  const lensAllowed = () => lensStageW() > 0.5

  let last = performance.now(), raf = 0, running = true, fpsFrames = 0, fpsT = 0
  // Idle: once the field is still, no frame is requested at all (not only none drawn); any input wakes it.
  let idle = false
  function kick() {
    if (!idle || !running || !ready || disposed) return
    idle = false
    stillFrames = 0
    last = performance.now()
    raf = requestAnimationFrame(frame)
  }

  function frame() {
    if (!running) return
    raf = requestAnimationFrame(frame)
    const now = performance.now()
    const rawDt = now - last
    last = now
    const dt = Math.min(rawDt / 1000, 0.05)
    const damp = (rate: number) => (reduced ? 1 : 1 - Math.pow(rate, dt))
    stats.history[stats.head] = rawDt
    stats.head = (stats.head + 1) % stats.history.length
    stats.frames++

    if (!reduced && introT < 1) { introT = Math.min(1, introT + dt / 2); uniforms.uIntro.value = easeOut(introT) }
    stage += (stageTarget - stage) * damp(0.02)
    ring *= Math.pow(10, (-3 * dt) / RT60)
    stats.ring = ring
    if (!reduced) uniforms.uTime.value += dt * ring
    const t = uniforms.uTime.value

    // Mode: a 600 ms ease-out between the two arrangements.
    if (modeT < 1) {
      modeT = reduced ? 1 : Math.min(1, modeT + dt / 0.6)
      uniforms.uMode.value = modeFrom + (modeTo - modeFrom) * easeOut(modeT)
    }
    const mode = uniforms.uMode.value
    // The accent stays the owner's mint in both arrangements: in the map it marks the area being pointed at.
    accent.copy(emerald)
    lineU.uAlpha.value = mode * uniforms.uIntro.value * 0.16 * uniforms.uDim.value
    lines.visible = mode > 0.01

    // Cluster centres drift very slowly; the HUD reads these same values.
    centroids.forEach((c, k) => {
      const [x, y, z] = CENTROIDS[k]
      c.set(x + Math.sin(t * 0.07 + k) * 0.6, y + Math.cos(t * 0.05 + k * 2) * 0.4, z + Math.sin(t * 0.06 + k * 3) * 0.5)
    })

    // Lens: the circle follows the cursor through a short ease, and fades in and out.
    lens += ((lensWanted ? 1 : 0) - lens) * damp(0.004)
    if (lensFresh) { lensPos.copy(lensTarget); lensFresh = false }
    lensPos.lerp(lensTarget, damp(0.00005))
    const lensW = lens * lensStageW()
    // A chapter's focus takes the lens while it is the stronger of the two; it has no colour ring, which belongs to the cursor.
    const onFocus = focus.w > lensW
    const at = onFocus ? focusPos : lensPos
    uniforms.uLens.value = onFocus ? focus.w : lensW
    uniforms.uLensR.value = (onFocus ? focus.r : LENS_R) * pixelRatio
    uniforms.uPointer.value.set(at.x * pixelRatio, (cssH - at.y) * pixelRatio)
    aberration.uniforms.uPointer.value.copy(uniforms.uPointer.value)
    aberration.uniforms.uAmt.value = onFocus ? 0 : lensW
    // The field steps back behind the ledger's rows and the contact card; the two cards about the field keep it bright.
    uniforms.uDim.value = 1 - 0.45 * Math.max(clamp01(1.5 - Math.abs(stage - STAGE.ledger) * 1.5), clamp01(stage - STAGE.sim - 0.3))

    if (shockT >= 0) {
      shockT += dt
      const k = Math.min(shockT / 1.6, 1)
      uniforms.uShockR.value = 9 * (1 - (1 - k) * (1 - k))
      uniforms.uShockA.value = 0.5 * (1 - k) * (1 - k)
      if (shockT > 1.6) { shockT = -1; uniforms.uShockA.value = 0 }
    }

    // Camera along the path.
    if (path) {
      const n = path.pos.points.length - 1
      const s = Math.min(Math.max(stage, 0), n)
      const seg = Math.min(Math.floor(s), n - 1)
      const u = (seg + ease(s - seg)) / n
      path.pos.getPoint(u, want)
      path.look.getPoint(u, wantLook)
    }
    // A mouse leans the view a touch through a slow spring; the camera also breathes on its own.
    if (!reduced) {
      lean.x += (leanTarget.x - lean.x) * (1 - Math.pow(0.3, dt))
      lean.y += (leanTarget.y - lean.y) * (1 - Math.pow(0.3, dt))
      camera.matrixWorld.extractBasis(camRight, camUp, camDir)
      const s = t
      want.addScaledVector(camRight, lean.x * 0.3 + Math.sin(s * 0.13) * 0.05)
      want.addScaledVector(camUp, lean.y * 0.18 + Math.sin(s * 0.11 + 1.3) * 0.03)
    }
    camPos.lerp(want, damp(0.05))
    lookCur.lerp(wantLook, damp(0.05))
    camera.position.copy(camPos)
    camera.lookAt(lookCur)
    camera.updateMatrixWorld()

    // Render on demand: once nothing is moving (rung down, camera arrived, no lens, no tween), the last frame stays up.
    // A lens or a chapter focus that has arrived is a still state, not movement: only one still easing counts (a focus
    // change wakes the field through setFocus). Counting their presence kept the loop at 60 frames a second at rest.
    const moving = ring > 0.001 || introT < 1 || modeT < 1 || shockT >= 0 ||
      Math.abs((lensWanted ? 1 : 0) - lens) > 0.002 || (lens > 0.002 && lensPos.distanceToSquared(lensTarget) > 0.25) ||
      Math.abs(stageTarget - stage) > 1e-4 || camPos.distanceToSquared(want) > 1e-8 || Math.abs(leanTarget.x - lean.x) + Math.abs(leanTarget.y - lean.y) > 1e-4
    stillFrames = moving ? 0 : stillFrames + 1
    if (stillFrames < 3) {
      renderer.info.reset()
      composer.render()
      stats.calls = renderer.info.render.calls
    } else {
      cancelAnimationFrame(raf)
      idle = true
    }
    fpsFrames++
    fpsT += rawDt
    if (fpsT >= 500) {
      stats.fps = Math.round((fpsFrames * 1000) / fpsT)
      stats.frameMs = fpsT / fpsFrames
      let worst = 0
      for (let i = 0; i < stats.history.length; i++) worst = Math.max(worst, stats.history[i])
      stats.worstMs = worst
      fpsFrames = 0
      fpsT = 0
    }
  }
  // ---------- Warm-up while the canvas is still invisible ----------
  let ready = false
  async function warm() {
    // Compile every program first (the link lines included), then render one frame so the post passes compile too.
    lines.visible = true
    try {
      await renderer.compileAsync(scene, camera)
    } catch { /* compile on first render instead */ }
    if (disposed) return
    camera.position.copy(camPos)
    camera.lookAt(lookCur)
    // Run the lens and its colour ring once while hidden too: the first lens frame otherwise cost 83 ms on first hover.
    uniforms.uLens.value = 1
    uniforms.uPointer.value.set(uniforms.uViewport.value.x / 2, uniforms.uViewport.value.y / 2)
    aberration.uniforms.uPointer.value.copy(uniforms.uPointer.value)
    aberration.uniforms.uAmt.value = 1
    composer.render()
    uniforms.uLens.value = 0
    aberration.uniforms.uAmt.value = 0
    composer.render()
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    if (disposed) return
    ready = true
    performance.mark('eh:ready')
    onReady()
    last = performance.now()
    frame()
  }
  void warm()
  function onVis() {
    if (document.hidden) { running = false; cancelAnimationFrame(raf) }
    else if (!running && ready) { running = true; last = performance.now(); frame() }
  }
  document.addEventListener('visibilitychange', onVis)

  return {
    count,
    stats,
    grid: { columns: COLUMNS, pitch: PITCH, left: FRAME.l },
    setStage(v) { stageTarget = v; kick() },
    wake(energy) { if (!reduced) ring = Math.max(ring, Math.min(1, energy)); kick() },
    setPointer(x, y, inside) {
      leanTarget.set((x / cssW) * 2 - 1, -(y / cssH) * 2 + 1)
      const want = inside
      if (want && !lensWanted && lensAllowed()) performance.mark('re:lens')
      if (lens < 0.01) lensFresh = true
      lensWanted = want
      lensTarget.set(x, y)
      kick()
    },
    setFocus(x, y, r, w) {
      focusPos.set(x, y)
      focus.r = r
      focus.w = reduced ? 0 : Math.min(1, Math.max(0, w))
      kick()
    },
    ripple(x, y) {
      if (reduced || !lensAllowed()) return
      ray.setFromCamera(toNdc(x, y), camera)
      if (ray.ray.intersectPlane(plane, hitP)) {
        uniforms.uShockC.value.copy(hitP)
        shockT = 0
        performance.mark('re:ripple')
        kick()
      }
    },
    setMode(m) {
      if (m === modeTo) return
      modeFrom = uniforms.uMode.value
      modeTo = m
      modeT = 0
      performance.mark('re:mode')
      kick()
    },
    setDrawCount(n) {
      const c = Math.max(0, Math.min(count, Math.round(n)))
      g.setDrawRange(0, c)
      stats.drawn = c
      kick()
    },
    setBloom(on) { bloom.enabled = on; kick() },
    setAberration(on) { aberration.enabled = on; kick() },
    setPixelRatio(r) {
      pixelRatio = Math.min(Math.max(r, 0.5), 2)
      applySize()
      kick()
    },
    centroids: () => centroids.map((c) => ({ x: c.x, y: c.y, z: c.z })),
    project: () => centroids.map((c) => {
      const v = c.clone().project(camera)
      return { x: ((v.x + 1) / 2) * cssW, y: ((1 - v.y) / 2) * cssH, on: v.z < 1 }
    }),
    highlight(k) {
      ccol.forEach((c, i) => c.copy(i === k ? accent : cbase[i]))
      kick()
    },
    dispose() {
      running = false
      disposed = true
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVis)
      ro.disconnect()
      disposables.forEach((d) => d.dispose())
      bloom.dispose()
      aberration.dispose()
      composer.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
