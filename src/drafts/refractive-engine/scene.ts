import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

/** Scroll stages, one per section. */
export const STAGE = { hero: 0, modes: 1, lab: 2, sim: 3, ledger: 4, contact: 5 } as const

export interface Prism {
  texture: string
  /** Width / height of the texture. */
  aspect: number
  tint: string
}

export interface Stats {
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
  /** Returns the prism under the point, if any; otherwise ripples the field when `ripple` is set. */
  press(x: number, y: number, ripple: boolean): number | null
  setMode(mode: 0 | 1): void
  open(index: number | null): void
  highlightLayer(index: number | null): void
  setDrawCount(n: number): void
  setBloom(on: boolean): void
  setAberration(on: boolean): void
  setPixelRatio(r: number): void
  /** Live cluster centroids in world units. */
  centroids(): { x: number; y: number; z: number }[]
  grid: { columns: number; pitch: number; left: number }
  bindLabels(prisms: (HTMLElement | null)[], layers: (HTMLElement | null)[]): void
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
const K = 7
// A hub and its neighbours at different depths, so no two links run parallel and the graph never reads as a flat frame.
const CENTROIDS: [number, number, number][] = [
  [-9.5, 4.0, -4.0], [-3.0, 5.2, -7.5], [2.0, 2.2, -2.0], [7.6, 4.6, -5.0], [9.8, -1.8, -2.5], [4.0, -3.6, -6.5], [-4.5, -1.0, -3.5],
]
const SIGMA = [1.1, 1.5, 0.95, 1.3, 1.0, 1.4, 1.2]
const HUE = [0.1, 0.85, 0.3, 1, 0.55, 0.7, 0]
const EDGES: [number, number][] = [[0, 1], [1, 2], [0, 6], [6, 2], [2, 3], [3, 4], [4, 5], [5, 2], [1, 3], [6, 5]]

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

const copyFragment = /* glsl */ `
uniform sampler2D tDiffuse;
varying vec2 vUv;
void main() { gl_FragColor = texture2D(tDiffuse, vUv); }`
const quadVertex = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`

const prismVertex = /* glsl */ `
varying vec3 vN, vVP, vOP, vON, vOV;
void main() {
  vOP = position;
  vON = normal;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vVP = mv.xyz;
  vN = normalize(normalMatrix * normal);
  vec3 camObj = (inverse(modelMatrix) * vec4(cameraPosition, 1.0)).xyz;
  vOV = camObj - position;
  gl_Position = projectionMatrix * mv;
}`

/** Glass: the scene behind is sampled with a per-channel offset along the surface normal, so edges split into colour. */
const prismFragment = /* glsl */ `
uniform sampler2D uBg, uMap;
uniform vec2 uRes;
uniform vec3 uSize, uTint, uAccent;
uniform float uLayer, uLoaded, uTexAspect, uDim, uHover, uHi, uAppear, uOpen;
varying vec3 vN, vVP, vOP, vON, vOV;
float sdRound(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
void main() {
  vec3 n = normalize(vN);
  vec3 v = normalize(-vVP);
  float ndv = clamp(dot(n, v), 0.0, 1.0);
  vec2 suv = gl_FragCoord.xy / uRes;
  vec2 off = n.xy * (0.006 + 0.05 * (1.0 - ndv));
  vec3 straight = texture2D(uBg, suv).rgb;
  vec3 refr = vec3(texture2D(uBg, suv - off * 0.82).r, texture2D(uBg, suv - off).g, texture2D(uBg, suv - off * 1.22).b);
  vec3 col = refr * 0.8 + vec3(0.010, 0.012, 0.018);
  float fres = pow(1.0 - ndv, 3.0);
  vec3 rim = mix(uAccent, vec3(1.0), 0.35);
  col += rim * fres * (0.22 + uHover * 0.3 + uHi * 0.6);

  if (vON.z > 0.6) {
    vec2 bezel = vec2(0.07);
    vec2 inner = uSize.xy - bezel * 2.0;
    // The screen sits a little inside the glass: shift it against the view for a touch of parallax.
    vec3 ov = normalize(vOV);
    vec2 p = vOP.xy - ov.xy / max(ov.z, 0.25) * 0.05;
    float d = sdRound(p, inner * 0.5, 0.06);
    vec2 q = p / inner + 0.5;
    float ia = inner.x / inner.y;
    if (ia > uTexAspect) q.y = (q.y - 0.5) * (uTexAspect / ia) + 0.5; else q.x = (q.x - 0.5) * (ia / uTexAspect) + 0.5;
    float inside = smoothstep(0.012, -0.004, d);
    if (uLayer < 0.5) {
      vec3 tex = texture2D(uMap, q).rgb;
      vec3 screen = mix(vec3(0.02, 0.022, 0.03), tex * 0.92, uLoaded);
      col = mix(col, screen, inside * 0.94);
      // A soft diagonal reflection on top of the screen.
      float sheen = exp(-pow((q.x + q.y * 0.4) - (0.35 + 0.5 * ov.x), 2.0) * 30.0);
      col += vec3(0.8, 0.85, 1.0) * sheen * 0.05 * inside;
    } else {
      // The layers beneath: an outline of the screen and a fine pattern, in the project's colour.
      vec2 cell = uLayer < 1.5 ? vec2(0.22) : vec2(0.14);
      vec2 gp = abs(fract(p / cell) - 0.5);
      float pat = uLayer < 1.5 ? smoothstep(0.47, 0.5, max(gp.x, gp.y)) : smoothstep(0.2, 0.05, length(gp));
      float edge = smoothstep(0.02, 0.0, abs(d));
      col += uTint * (pat * 0.16 + edge * 0.7) * inside * (0.5 + 0.5 * uOpen) + uTint * edge * 0.3;
    }
  }
  col += uTint * uHi * 0.05;
  col *= 1.0 - uDim * 0.72;
  gl_FragColor = vec4(mix(straight, col, uAppear), 1.0);
}`

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

/** Draws the glass prisms over the rendered field, sampling that field as the scene behind them. */
class PrismPass extends Pass {
  private quad: FullScreenQuad
  private copyMat: THREE.ShaderMaterial
  private pscene: THREE.Scene
  private camera: THREE.Camera
  private bg: { value: THREE.Texture | null }
  constructor(pscene: THREE.Scene, camera: THREE.Camera, bg: { value: THREE.Texture | null }) {
    super()
    this.pscene = pscene
    this.camera = camera
    this.bg = bg
    this.copyMat = new THREE.ShaderMaterial({ uniforms: { tDiffuse: { value: null } }, vertexShader: quadVertex, fragmentShader: copyFragment, depthTest: false, depthWrite: false })
    this.quad = new FullScreenQuad(this.copyMat)
  }
  render(renderer: THREE.WebGLRenderer, writeBuffer: THREE.WebGLRenderTarget, readBuffer: THREE.WebGLRenderTarget) {
    this.bg.value = readBuffer.texture
    this.copyMat.uniforms.tDiffuse.value = readBuffer.texture
    renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer)
    renderer.clear()
    this.quad.render(renderer)
    const auto = renderer.autoClear
    renderer.autoClear = false
    renderer.render(this.pscene, this.camera)
    renderer.autoClear = auto
  }
  dispose() {
    this.copyMat.dispose()
    this.quad.dispose()
  }
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
  options: { count: number; reduced: boolean; mode: 0 | 1; prisms: Prism[]; onHover(index: number | null): void; onReady(): void },
): RefractiveScene {
  const { count, reduced, prisms, onHover, onReady } = options
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
  const weights = SIGMA.map((s) => s * s)
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
      aT[o * 3] = gauss() * SIGMA[k]
      aT[o * 3 + 1] = gauss() * SIGMA[k] * 0.8
      aT[o * 3 + 2] = gauss() * SIGMA[k] * 1.1
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
  const cyan = new THREE.Color('#5be7ff'), violet = new THREE.Color('#9d7bff'), emerald = new THREE.Color('#3ee6a4')
  const ccol = HUE.map((h) => cyan.clone().lerp(violet, h).multiplyScalar(0.9))
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
  const lineU = { uC: uniforms.uC, uColor: { value: violet.clone() }, uAlpha: { value: 0 } }
  const lines = new THREE.LineSegments(lg, track(new THREE.ShaderMaterial({ uniforms: lineU, vertexShader: lineVertex, fragmentShader: lineFragment, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })))
  lines.frustumCulled = false
  scene.add(lines)

  // ---------- Prisms, drawn in their own scene by the prism pass ----------
  const pscene = new THREE.Scene()
  const bg = { value: null as THREE.Texture | null }
  const blank = track(new THREE.DataTexture(new Uint8Array([6, 6, 10, 255]), 1, 1))
  blank.needsUpdate = true
  const SLAB = 0.15
  const LAB = new THREE.Vector3(0, -5.5, 2.5)
  const res = new THREE.Vector2(1, 1)
  const items = prisms.map((p, i) => {
    const h = p.aspect < 1 ? 2.55 : 1.95
    const w = h * p.aspect
    const group = new THREE.Group()
    const tint = new THREE.Color(p.tint)
    const hsl = { h: 0, s: 0, l: 0 }
    tint.getHSL(hsl)
    tint.setHSL(hsl.h, Math.min(hsl.s, 0.7), 0.6)
    const geo = track(new RoundedBoxGeometry(w, h, SLAB, 3, 0.06))
    const slabs = [0, 1, 2].map((layer) => {
      const u = {
        uBg: bg, uMap: { value: blank as THREE.Texture }, uRes: { value: res }, uSize: { value: new THREE.Vector3(w, h, SLAB) },
        uTint: { value: tint }, uAccent: { value: accent }, uLayer: { value: layer }, uLoaded: { value: 0 }, uTexAspect: { value: p.aspect },
        uDim: { value: 0 }, uHover: { value: 0 }, uHi: { value: 0 }, uAppear: { value: 0 }, uOpen: { value: 0 },
      }
      const mesh = new THREE.Mesh(geo, track(new THREE.ShaderMaterial({ uniforms: u, vertexShader: prismVertex, fragmentShader: prismFragment })))
      mesh.userData.index = i
      mesh.position.z = (1 - layer) * SLAB
      group.add(mesh)
      return { mesh, u }
    })
    pscene.add(group)
    return { group, slabs, w, h, base: new THREE.Vector3(), baseRot: 0, hover: 0, dim: 0, explode: 0, hi: [0, 0, 0] }
  })
  const meshes = items.flatMap((it) => it.slabs.map((s) => s.mesh))
  let labBounds = { w: 1, h: 1 }
  let layoutCols = 0
  function layoutPrisms(cols: number) {
    if (cols === layoutCols) return
    layoutCols = cols
    const rowsOf: (typeof items)[] = []
    items.forEach((it, i) => { (rowsOf[Math.floor(i / cols)] ??= []).push(it) })
    const gapX = 0.75, gapY = cols > 2 ? 1.25 : 1.05
    // On two columns every slot is as wide as the widest prism, so a narrow phone screenshot still leaves room for its label.
    const cell = cols > 2 ? 0 : Math.max(...items.map((it) => it.w))
    const slotW = (it: (typeof items)[number]) => Math.max(it.w, cell)
    const rowH = rowsOf.map((r) => Math.max(...r.map((it) => it.h)))
    const totalH = rowH.reduce((a, b) => a + b, 0) + gapY * (rowsOf.length - 1)
    let top = totalH / 2, maxW = 0
    rowsOf.forEach((row, ri) => {
      const rowW = row.reduce((a, it) => a + slotW(it), 0) + gapX * (row.length - 1)
      maxW = Math.max(maxW, rowW)
      let x = -rowW / 2
      const baseline = top - rowH[ri]
      row.forEach((it) => {
        it.base.set(LAB.x + x + slotW(it) / 2, LAB.y + baseline + it.h / 2, LAB.z)
        x += slotW(it) + gapX
      })
      top = baseline - gapY
    })
    // Each prism turns a little toward the middle, so its sides catch the field behind.
    items.forEach((it) => { it.baseRot = -((it.base.x - LAB.x) / Math.max(maxW, 1)) * 0.5 })
    labBounds = { w: maxW, h: totalH + 0.6 }
  }

  // Textures load once the field is on screen, and upload one per frame.
  const loader = new THREE.ImageBitmapLoader().setOptions({ imageOrientation: 'flipY' })
  const uploads: (() => void)[] = []
  let disposed = false
  function loadTextures() {
    items.forEach((it, i) =>
      loader.load(prisms[i].texture, (bitmap) => {
        if (disposed) { (bitmap as ImageBitmap).close?.(); return }
        const tex = track(new THREE.Texture(bitmap as ImageBitmap))
        tex.flipY = false
        tex.colorSpace = THREE.SRGBColorSpace
        tex.anisotropy = 4
        tex.needsUpdate = true
        uploads.push(() => {
          renderer.initTexture(tex)
          it.slabs[0].u.uMap.value = tex
          it.slabs[0].u.uLoaded.value = 1
        })
      }),
    )
  }

  // ---------- Post ----------
  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  // Bloom lights the field only; the prisms are drawn after it, so a light screenshot never glows.
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.5, 0.45, 0.78)
  composer.addPass(bloom)
  const prismPass = new PrismPass(pscene, camera, bg)
  composer.addPass(prismPass)
  const aberration = new ShaderPass(aberrationShader)
  composer.addPass(aberration)
  composer.addPass(new OutputPass())

  // ---------- Camera path: one pose per stage, rebuilt on resize ----------
  let path: { pos: THREE.CatmullRomCurve3; look: THREE.CatmullRomCurve3 } | null = null
  const focusPose = items.map(() => ({ pos: new THREE.Vector3(), look: new THREE.Vector3() }))
  const UP = new THREE.Vector3(0, 1, 0)
  const OPEN_ROT = new THREE.Euler(0.12, -0.74, 0)
  const GAP = 1.1
  function buildPath() {
    const wide = camera.aspect > 1
    const tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    layoutPrisms(wide ? 4 : 2)
    const P: THREE.Vector3[] = [], L: THREE.Vector3[] = []
    // Hero: nearly straight on. No pose ever looks straight down, so the roll is always defined.
    P.push(new THREE.Vector3(0, 0.5, wide ? 18.5 : 19.5)); L.push(new THREE.Vector3(0, 0, 0))
    P.push(wide ? new THREE.Vector3(8.5, 2.8, 14.5) : new THREE.Vector3(5, 3, 21)); L.push(wide ? new THREE.Vector3(1.8, 0, -2.5) : new THREE.Vector3(0.5, 0.4, -2.5))
    // Lab: fit the prism grid below the heading.
    {
      const center = LAB.clone()
      const ndcY = wide ? -0.17 : -0.24, availH = wide ? 0.72 : 0.72, availW = wide ? 0.9 : 0.96
      const dist = Math.max(labBounds.h / 2 / (availH * tanH), labBounds.w / 2 / (availW * tanH * camera.aspect))
      const look = center.clone().addScaledVector(UP, -ndcY * dist * tanH)
      L.push(look)
      P.push(look.clone().add(new THREE.Vector3(0, 0.9, dist)))
    }
    P.push(wide ? new THREE.Vector3(3, 1.5, 19) : new THREE.Vector3(0, -0.5, 25)); L.push(wide ? new THREE.Vector3(5.5, 0.4, 0) : new THREE.Vector3(0, -0.5, 0))
    // Close enough that the dots stay about 5 px apart: further back, the grid beats against the pixels into moire.
    P.push(new THREE.Vector3(wide ? -5 : -3, -2.5, wide ? 25 : 30)); L.push(new THREE.Vector3(1, -1, -2))
    P.push(new THREE.Vector3(0, 1.5, wide ? 24 : 30)); L.push(new THREE.Vector3(0, 0.5, 0))
    path = { pos: new THREE.CatmullRomCurve3(P, false, 'centripetal'), look: new THREE.CatmullRomCurve3(L, false, 'centripetal') }

    // Focus poses: the opened prism turns three-quarters and its layers spread toward the camera.
    items.forEach((it, i) => {
      const c = it.base.clone().add(new THREE.Vector3(0, 0, 1.2))
      // Half extents of the turned, spread stack as the camera sees it, with room above for the layer titles.
      const rw = 0.5 * (it.w * Math.cos(-OPEN_ROT.y) + 2 * (SLAB + GAP) * Math.sin(-OPEN_ROT.y))
      const rh = 0.5 * it.h + 0.45
      const right = new THREE.Vector3(1, 0, 0)
      if (wide) {
        const dist = Math.max(rh / (0.5 * tanH), rw / (0.5 * tanH * camera.aspect))
        focusPose[i].look.copy(c).addScaledVector(right, 0.3 * dist * tanH * camera.aspect)
        focusPose[i].pos.copy(focusPose[i].look).add(new THREE.Vector3(0, 0.5, dist))
      } else {
        // Above the bottom sheet, below the bar.
        const dist = Math.max(rh / (0.27 * tanH), rw / (0.86 * tanH * camera.aspect))
        focusPose[i].look.copy(c).addScaledVector(UP, -0.4 * dist * tanH)
        focusPose[i].pos.copy(focusPose[i].look).add(new THREE.Vector3(0, 0.5, dist))
      }
    })
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
    res.set(bw, bh)
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
  const ro = new ResizeObserver(resize)
  ro.observe(host)

  // ---------- State ----------
  const camPos = new THREE.Vector3(0, 0.5, 18.5), lookCur = new THREE.Vector3(), want = new THREE.Vector3(), wantLook = new THREE.Vector3()
  const lean = new THREE.Vector2(), leanTarget = new THREE.Vector2(), camRight = new THREE.Vector3(), camUp = new THREE.Vector3(), camDir = new THREE.Vector3()
  const lensPos = new THREE.Vector2(-9999, -9999), lensTarget = new THREE.Vector2(-9999, -9999)
  let stage = 0, stageTarget = 0, lens = 0, lensWanted = false, lensFresh = true
  let modeFrom = options.mode as number, modeTo = options.mode as number, modeT = 1
  let openIdx: number | null = null, focusW = 0, hovered: number | null = null, hiLayer: number | null = null
  let shockT = -1, introT = 0, prismsOn = false, appearNow = 0
  let labels: (HTMLElement | null)[] = [], layerLabels: (HTMLElement | null)[] = []
  const stats: Stats = { fps: 0, frameMs: 0, worstMs: 0, calls: 0, drawn: count, history: new Float32Array(120), head: 0, frames: 0 }
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hitP = new THREE.Vector3()

  function toNdc(x: number, y: number) { return ndc.set((x / cssW) * 2 - 1, -(y / cssH) * 2 + 1) }
  function pick(x: number, y: number) {
    if (!prismsOn || appearNow < 0.5) return null
    ray.setFromCamera(toNdc(x, y), camera)
    const hits = ray.intersectObjects(meshes, false)
    return hits.length ? (hits[0].object.userData.index as number) : null
  }
  // The lens rests while the prisms are on screen, so it never sits between the cursor and a module.
  const lensStageW = () => clamp01((Math.abs(stage - STAGE.lab) - 0.35) * 4)
  const lensAllowed = () => openIdx === null && lensStageW() > 0.5

  let last = performance.now(), raf = 0, running = true, fpsFrames = 0, fpsT = 0
  const proj = new THREE.Vector3(), tmp = new THREE.Vector3(), qOpen = new THREE.Quaternion().setFromEuler(OPEN_ROT), qBase = new THREE.Quaternion()
  const label = { last: [] as string[] }

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
    uploads.shift()?.()
    stage += (stageTarget - stage) * damp(0.02)
    if (!reduced) uniforms.uTime.value += dt
    const t = uniforms.uTime.value

    // Mode: a 600 ms ease-out between the two arrangements.
    if (modeT < 1) {
      modeT = reduced ? 1 : Math.min(1, modeT + dt / 0.6)
      uniforms.uMode.value = modeFrom + (modeTo - modeFrom) * easeOut(modeT)
    }
    const mode = uniforms.uMode.value
    accent.copy(emerald).lerp(cyan, mode)
    lineU.uAlpha.value = mode * uniforms.uIntro.value * 0.16 * uniforms.uDim.value
    lines.visible = mode > 0.01

    // Cluster centres drift very slowly; the HUD reads these same values.
    centroids.forEach((c, k) => {
      const [x, y, z] = CENTROIDS[k]
      c.set(x + Math.sin(t * 0.07 + k) * 0.6, y + Math.cos(t * 0.05 + k * 2) * 0.4, z + Math.sin(t * 0.06 + k * 3) * 0.5)
    })

    // Lens: the circle follows the cursor through a short ease, and fades in and out.
    lens += ((lensWanted && openIdx === null ? 1 : 0) - lens) * damp(0.004)
    if (lensFresh) { lensPos.copy(lensTarget); lensFresh = false }
    lensPos.lerp(lensTarget, damp(0.00005))
    const lensW = lens * lensStageW()
    uniforms.uLens.value = lensW
    uniforms.uPointer.value.set(lensPos.x * pixelRatio, (cssH - lensPos.y) * pixelRatio)
    aberration.uniforms.uPointer.value.copy(uniforms.uPointer.value)
    aberration.uniforms.uAmt.value = lensW
    uniforms.uDim.value = 1 - 0.45 * clamp01(stage - 3.3)

    if (shockT >= 0) {
      shockT += dt
      const k = Math.min(shockT / 1.6, 1)
      uniforms.uShockR.value = 9 * (1 - (1 - k) * (1 - k))
      uniforms.uShockA.value = 0.5 * (1 - k) * (1 - k)
      if (shockT > 1.6) { shockT = -1; uniforms.uShockA.value = 0 }
    }

    // Prisms: drawn only while the lab is near or a module is open.
    focusW += ((openIdx === null ? 0 : 1) - focusW) * damp(0.03)
    const appear = clamp01(1.6 - Math.abs(stage - STAGE.lab) * 1.6)
    appearNow = appear
    prismsOn = appear > 0.001 || focusW > 0.001
    prismPass.enabled = prismsOn
    if (prismsOn) {
      items.forEach((it, i) => {
        const isOpen = openIdx === i
        it.explode += ((isOpen ? 1 : 0) - it.explode) * damp(0.02)
        it.dim += ((openIdx !== null && !isOpen ? 1 : 0) - it.dim) * damp(0.02)
        it.hover += ((hovered === i && openIdx === null ? 1 : 0) - it.hover) * damp(0.001)
        const e = ease(it.explode)
        const bob = reduced ? 0 : Math.sin(t * 0.4 + i * 1.3) * 0.03
        it.group.position.copy(it.base)
        it.group.position.y += bob
        it.group.position.z += e * 1.2 + it.hover * 0.12 - it.dim * 0.8
        qBase.setFromEuler(tmpEuler.set(0, it.baseRot + (reduced ? 0 : Math.sin(t * 0.3 + i) * 0.03), 0))
        it.group.quaternion.slerpQuaternions(qBase, qOpen, e)
        it.slabs.forEach((s, layer) => {
          s.mesh.position.z = (1 - layer) * (SLAB + e * GAP)
          it.hi[layer] += ((isOpen && hiLayer === layer ? 1 : 0) - it.hi[layer]) * damp(0.002)
          s.u.uAppear.value = Math.max(appear, isOpen ? focusW : appear)
          s.u.uDim.value = it.dim
          s.u.uHover.value = it.hover
          s.u.uHi.value = it.hi[layer]
          s.u.uOpen.value = e
        })
      })
      pscene.updateMatrixWorld()
    }

    // Camera along the path; an open prism pulls it in.
    if (path) {
      const n = path.pos.points.length - 1
      const s = Math.min(Math.max(stage, 0), n)
      const seg = Math.min(Math.floor(s), n - 1)
      const u = (seg + ease(s - seg)) / n
      path.pos.getPoint(u, want)
      path.look.getPoint(u, wantLook)
      if (openIdx !== null || focusW > 0.001) {
        const f = focusPose[openIdx ?? lastOpen]
        want.lerp(f.pos, ease(focusW))
        wantLook.lerp(f.look, ease(focusW))
      }
    }
    // A mouse leans the view a touch through a slow spring; the camera also breathes on its own.
    if (!reduced) {
      lean.x += (leanTarget.x * (openIdx === null ? 1 : 0.3) - lean.x) * (1 - Math.pow(0.3, dt))
      lean.y += (leanTarget.y * (openIdx === null ? 1 : 0.3) - lean.y) * (1 - Math.pow(0.3, dt))
      camera.matrixWorld.extractBasis(camRight, camUp, camDir)
      const s = now / 1000
      want.addScaledVector(camRight, lean.x * 0.3 + Math.sin(s * 0.13) * 0.05)
      want.addScaledVector(camUp, lean.y * 0.18 + Math.sin(s * 0.11 + 1.3) * 0.03)
    }
    camPos.lerp(want, damp(0.05))
    lookCur.lerp(wantLook, damp(0.05))
    camera.position.copy(camPos)
    camera.lookAt(lookCur)
    camera.updateMatrixWorld()

    placeLabels(appear)

    renderer.info.reset()
    composer.render()
    stats.calls = renderer.info.render.calls
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
  const tmpEuler = new THREE.Euler()
  let lastOpen = 0

  function setLabel(el: HTMLElement, i: number, opacity: number, x: number, y: number) {
    const key = opacity < 0.02 ? 'off' : `${opacity.toFixed(2)}|${x.toFixed(1)}|${y.toFixed(1)}`
    if (label.last[i] === key) return
    label.last[i] = key
    if (key === 'off') { el.style.visibility = 'hidden'; el.style.opacity = '0'; return }
    el.style.visibility = 'visible'
    el.style.opacity = opacity.toFixed(2)
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
  }
  function screenOf(v: THREE.Vector3) {
    proj.copy(v).project(camera)
    return { x: ((proj.x + 1) / 2) * cssW, y: ((1 - proj.y) / 2) * cssH, ok: proj.z < 1 }
  }
  function placeLabels(appear: number) {
    const labW = clamp01(appear * 1.4 - 0.4) * (1 - focusW)
    labels.forEach((el, i) => {
      if (!el) return
      const it = items[i]
      const s = screenOf(tmp.copy(it.group.position).addScaledVector(UP, -it.h / 2 - 0.22))
      setLabel(el, i, s.ok ? labW : 0, s.x, s.y)
    })
    const it = items[openIdx ?? lastOpen]
    const e = ease(it.explode)
    layerLabels.forEach((el, layer) => {
      if (!el) return
      const mesh = it.slabs[layer].mesh
      const s = screenOf(mesh.localToWorld(tmp.set(-it.w / 2, it.h / 2 + 0.08, 0)))
      setLabel(el, 100 + layer, s.ok && openIdx !== null ? clamp01(e * 2 - 1) : 0, s.x, s.y)
    })
  }

  // ---------- Warm-up while the canvas is still invisible ----------
  let ready = false
  async function warm() {
    // Compile every program first (prisms and the link lines included), then render one frame so the post passes compile too.
    lines.visible = true
    prismPass.enabled = true
    try {
      await renderer.compileAsync(scene, camera)
      await renderer.compileAsync(pscene, camera)
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
    setTimeout(() => { if (!disposed) loadTextures() }, reduced ? 0 : 1200)
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
    setStage(v) { stageTarget = v },
    setPointer(x, y, inside) {
      leanTarget.set((x / cssW) * 2 - 1, -(y / cssH) * 2 + 1)
      const over = inside ? pick(x, y) : null
      if (over !== hovered) { hovered = over; onHover(over) }
      const want = inside && over === null
      if (want && !lensWanted && lensAllowed()) performance.mark('re:lens')
      if (lens < 0.01) lensFresh = true
      lensWanted = want
      lensTarget.set(x, y)
    },
    press(x, y, ripple) {
      const over = pick(x, y)
      if (over !== null) return over
      if (ripple && !reduced && lensAllowed()) {
        ray.setFromCamera(toNdc(x, y), camera)
        if (ray.ray.intersectPlane(plane, hitP)) {
          uniforms.uShockC.value.copy(hitP)
          shockT = 0
          performance.mark('re:ripple')
        }
      }
      return null
    },
    setMode(m) {
      if (m === modeTo) return
      modeFrom = uniforms.uMode.value
      modeTo = m
      modeT = 0
      performance.mark('re:mode')
    },
    open(i) {
      if (i !== null) lastOpen = i
      openIdx = i
      if (i !== null) { lensWanted = false; if (hovered !== null) { hovered = null; onHover(null) } }
    },
    highlightLayer(i) { hiLayer = i },
    setDrawCount(n) {
      const c = Math.max(0, Math.min(count, Math.round(n)))
      g.setDrawRange(0, c)
      stats.drawn = c
    },
    setBloom(on) { bloom.enabled = on },
    setAberration(on) { aberration.enabled = on },
    setPixelRatio(r) {
      pixelRatio = Math.min(Math.max(r, 0.5), 2)
      applySize()
    },
    centroids: () => centroids.map((c) => ({ x: c.x, y: c.y, z: c.z })),
    bindLabels(a, b) { labels = a; layerLabels = b; label.last = [] },
    dispose() {
      running = false
      disposed = true
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVis)
      ro.disconnect()
      disposables.forEach((d) => d.dispose())
      prismPass.dispose()
      bloom.dispose()
      aberration.dispose()
      composer.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
