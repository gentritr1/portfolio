import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

/** One project screen floating in the field. `aspect` is width / height of the texture. */
export interface Body {
  texture: string
  aspect: number
  /** The project's own colour, used to light its halo when the camera arrives. */
  tint: string
}

/** Journey stages: 0 vortex, 1 disk, 2..2+n-1 one project each, the overview, then a far backdrop behind the page content. */
export const stageOf = { vortex: 0, disk: 1, body: (i: number) => 2 + i, overview: (n: number) => 2 + n, backdrop: (n: number) => 3 + n }

const MAX_BODIES = 8
/** Glass bezel around each screen, in world units. */
const BEZEL = 0.08

const particleVertex = /* glsl */ `
uniform float uTime, uMorph, uLens, uShockR, uShockA, uPx, uIntro, uActive, uActiveW, uFocusW;
uniform vec3 uPointer, uShockC;
uniform vec3 uCenters[${MAX_BODIES}];
uniform vec3 uTints[${MAX_BODIES}];
uniform vec3 uNormals[${MAX_BODIES}];
uniform vec2 uExtent[${MAX_BODIES}];
attribute float aRadius, aAngle, aSpeed, aHeight, aCluster, aSeed;
varying vec3 vColor;
varying float vAlpha;

void main() {
  float intro = uIntro;
  // Arrival: the field settles a short way inward as it fades up. No spin.
  float r = aRadius * (1.0 + (1.0 - intro) * 0.35);
  // The arms turn slowly as one pattern; the hot inner ring turns a little faster, at one shared speed so it never shimmers.
  float a = aAngle + uTime * 0.04 + uTime * 0.45 * exp(-(aRadius - 1.15) * 1.3);

  // Funnel around the void, then a flat spiral disk.
  vec3 vortex = vec3(cos(a) * r, -1.8 / (aRadius - 0.9) + aHeight * 0.25, sin(a) * r);
  float arm = a;
  vec3 disk = vec3(cos(arm) * r * 1.25, aHeight * 0.06, sin(arm) * r * 1.25);
  float m1 = smoothstep(0.0, 1.0, clamp(uMorph, 0.0, 1.0));
  float m2 = smoothstep(0.0, 1.0, clamp(uMorph - 1.0, 0.0, 1.0));
  // On the journey the disk draws in to a tight, bright accretion disk, leaving the outer orbit clear for the screens.
  disk.xz *= mix(1.0, 0.42, m2);
  vec3 p = mix(vortex, disk, m1);
  vec3 tangent = normalize(vec3(-sin(mix(a, arm, m1)), 0.0, cos(mix(a, arm, m1))));

  // A share of the particles leaves the disk to orbit each project screen like a halo.
  float halo = 0.0;
  vec3 tint = vec3(0.0);
  float lit = 0.0;
  if (aCluster >= 0.0) {
    int ci = int(aCluster);
    vec3 c = uCenters[0], n = uNormals[0];
    vec2 ext = uExtent[0];
    for (int i = 0; i < ${MAX_BODIES}; i++) { if (i == ci) { c = uCenters[i]; n = uNormals[i]; ext = uExtent[i]; tint = uTints[i]; } }
    vec3 u = normalize(cross(vec3(0.0, 1.0, 0.0), n));
    vec3 v = cross(n, u);
    float focus = ci == int(uActive + 0.5) ? uFocusW : 0.0;
    float a2 = aAngle * 3.0 + uTime * aSpeed * (0.9 + focus * 0.7);
    float spread = 1.05 + fract(aSeed * 7.31) * 0.5;
    vec3 ring = c + (u * cos(a2) * ext.x + v * sin(a2) * ext.y) * spread + n * (aHeight * 0.6);
    halo = smoothstep(0.0, 1.0, clamp(uMorph - 1.0, 0.0, 1.0));
    p = mix(p, ring, halo);
    tangent = mix(tangent, normalize(-u * sin(a2) + v * cos(a2)), halo);
    lit = float(ci == int(uActive + 0.5)) * uActiveW;
  }

  // Cursor lens and click ripple, on the plane the camera looks at.
  vec3 d = p - uPointer;
  float dist2 = dot(d, d);
  // The cursor pushes the field aside and swirls it, so it never piles particles onto a project screen.
  float pull = uLens * 0.7 / (dist2 + 0.8);
  vec3 away = normalize(d + 1e-4);
  p += away * pull * 0.4 + cross(away, normalize(cameraPosition - p)) * pull * 0.2;
  float ring2 = length(p - uShockC) - uShockR;
  float wave = exp(-ring2 * ring2 * 5.0) * uShockA;
  p += normalize(p - uShockC + 1e-4) * wave * 0.45;

  // Temperature: white-amber near the void, cyan through the middle, violet at the rim.
  vec3 violet = vec3(0.42, 0.22, 0.95), cyan = vec3(0.2, 0.85, 1.0), amber = vec3(1.0, 0.62, 0.25);
  float t = fract(aSeed * 13.7);
  vec3 col = mix(violet, cyan, smoothstep(0.25, 0.85, t) * smoothstep(9.0, 3.0, aRadius));
  col = mix(col, amber, clamp(step(0.93, t) + exp(-(aRadius - 1.15) * 2.4) * (1.0 - halo), 0.0, 1.0));
  // A halo is cool cyan at rest and takes on its project's colour as the camera arrives.
  vec3 haloCol = mix(mix(cyan, violet, 0.35), tint, 0.25 + lit * 0.55);
  col = mix(col, haloCol * 1.15, halo * 0.7);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vec3 toCam = normalize(cameraPosition - p);
  float doppler = 1.0 + 0.7 * dot(tangent, toCam);
  float heat = 1.0 + exp(-(aRadius - 1.15) * 1.6) * 1.4 * (1.0 - halo);
  vColor = col * doppler * heat * (1.0 + lit * 0.7) + pull * 0.35 + wave * 0.45;

  gl_Position = projectionMatrix * mv;
  float depth = -mv.z;
  gl_PointSize = min(uPx * (0.55 + fract(aSeed * 3.1) * 1.3) * (10.0 / depth), uPx * 3.2);
  float fall = mix(pow(clamp(1.25 - aRadius / 9.5, 0.0, 1.0), 1.6), 1.0, halo);
  // The drawn-in disk is about five times denser, so each of its particles gives less light.
  // Far particles fade into the dark, so the field reads in depth.
  float fog = smoothstep(62.0, 22.0, depth);
  vAlpha = 0.34 * fall * mix(1.0, 0.3, m2 * (1.0 - halo)) * smoothstep(1.2, 4.5, depth) * fog * intro;
}`

const particleFragment = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main() {
  float f = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5));
  gl_FragColor = vec4(vColor * f * f * vAlpha * 1.6, 1.0);
}`

const starVertex = /* glsl */ `
uniform float uTime, uPx;
attribute float aSeed;
varying float vA;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uPx * (0.6 + fract(aSeed * 9.1) * 1.2);
  vA = (0.25 + 0.75 * fract(aSeed * 5.3)) * (0.7 + 0.3 * sin(uTime * (0.6 + aSeed) + aSeed * 40.0));
}`

const starFragment = /* glsl */ `
varying float vA;
void main() {
  float f = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5));
  gl_FragColor = vec4(vec3(0.72, 0.78, 1.0) * f * vA * 0.55, 1.0);
}`

const nebulaVertex = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p.xyww;
}`

/** A faint nebula on the far sphere: two soft clouds of violet and teal, brightest along the disk plane. Kept very low; dark linear values grow a lot once they are shown as sRGB. */
const nebulaFragment = /* glsl */ `
uniform float uTime;
varying vec3 vDir;
float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float noise(vec3 p) {
  vec3 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1, 0, 0)), u.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), u.x), u.y),
             mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), u.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), u.x), u.y), u.z);
}
float fbm(vec3 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
void main() {
  vec3 d = normalize(vDir);
  float band = exp(-d.y * d.y * 9.0);
  float a = fbm(d * 2.4 + vec3(0.0, uTime * 0.004, 0.0));
  float b = fbm(d * 3.1 + vec3(4.2, 1.3, -uTime * 0.003));
  vec3 violet = vec3(0.16, 0.07, 0.34), teal = vec3(0.02, 0.14, 0.17);
  vec3 col = violet * smoothstep(0.45, 0.85, a) + teal * smoothstep(0.5, 0.9, b);
  col *= 0.035 + band * 0.05;
  col += (hash(d * 913.0) - 0.5) * 0.0015;
  gl_FragColor = vec4(max(col, 0.0), 1.0);
}`

const voidVertex = /* glsl */ `
varying vec3 vN, vV;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vV = normalize(cameraPosition - wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`

const voidFragment = /* glsl */ `
varying vec3 vN, vV;
void main() {
  float rim = pow(1.0 - max(dot(vN, vV), 0.0), 7.0);
  gl_FragColor = vec4(vec3(1.0, 0.74, 0.42) * rim * 2.6, 1.0);
}`

const screenVertex = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`

const screenFragment = /* glsl */ `
uniform sampler2D uMap;
uniform float uReveal, uTime, uAspect, uRadius, uHover, uLoaded, uFrame, uSheen;
uniform vec2 uSize, uOuter;
varying vec2 vUv;
float sdRound(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
void main() {
  // The plane is the screen plus a thin glass bezel; p is in plane units from its centre.
  vec2 p = (vUv - 0.5) * uOuter;
  float outer = sdRound(p, uOuter * 0.5 - 0.004, uRadius + 0.05);
  if (outer > 0.0) discard;
  float d = sdRound(p, uSize * 0.5, uRadius);
  vec2 uv = p / uSize + 0.5;
  float rim = smoothstep(0.03, 0.0, abs(outer)) * uFrame;
  if (d > 0.0) {
    // Bezel: dark glass that arrives with the screen. A distant screen shows only its faint outline.
    vec3 edge = vec3(0.55, 0.42, 1.0) * rim * (0.55 + uHover * 0.6);
    if (uReveal < 0.3) {
      if (rim < 0.35) discard;
      gl_FragColor = vec4(edge * 0.6, 1.0);
      return;
    }
    gl_FragColor = vec4(vec3(0.018, 0.016, 0.034) + edge, 1.0);
    return;
  }

  // The screen assembles out of the field: a noise front sweeps it in, lit cyan at the edge.
  float n = noise(uv * vec2(uAspect, 1.0) * 16.0) * 0.72 + noise(uv * 110.0) * 0.28;
  float front = uReveal * 1.3 - 0.15;
  bool shown = n < front && uLoaded > 0.5;
  if (!shown) discard;

  vec3 col = vec3(0.0);
  if (shown) {
    vec3 tex = texture2D(uMap, uv).rgb;
    float band = smoothstep(0.09, 0.0, front - n) * (1.0 - smoothstep(0.92, 1.0, uReveal));
    col = tex * 0.8 * (0.35 + 0.65 * smoothstep(0.2, 1.0, uReveal));
    // A soft reflection that slides across the glass as the camera moves past.
    float sheen = exp(-pow((uv.x + uv.y * 0.35) - uSheen, 2.0) * 40.0);
    col += vec3(0.75, 0.8, 1.0) * sheen * 0.06;
    col = mix(col, vec3(0.37, 0.9, 1.0) * 1.1, band * 0.85);
    col *= 1.0 + uHover * 0.1;
  }
  if (!gl_FrontFacing) col = vec3(0.02, 0.02, 0.05) + vec3(0.55, 0.42, 1.0) * rim;
  gl_FragColor = vec4(col, 1.0);
}`

export interface EventHorizonScene {
  setStage(stage: number): void
  /** Moves straight to a far stage instead of walking the path through every stop in between. */
  jumpTo(stage: number): void
  setPointer(nx: number, ny: number, active: boolean): void
  /** Returns the body index under the pointer; otherwise ripples the field when `ripple` is set and returns null. */
  press(nx: number, ny: number, ripple: boolean): number | null
  focus(index: number | null): void
  /** Overview labels: the scene moves and fades them each frame. */
  bindLabels(els: (HTMLElement | null)[]): void
  dispose(): void
  count: number
}

export function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

const ease = (x: number) => x * x * (3 - 2 * x)
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

export function createScene(
  host: HTMLElement,
  options: { count: number; reduced: boolean; bodies: Body[]; onStats(fps: number, calls: number): void; onHover(index: number | null): void; onReady(): void },
): EventHorizonScene {
  const { count, reduced, bodies, onStats, onHover, onReady } = options
  performance.mark('eh:scene-start')
  const small = innerWidth < 768
  const dpr = Math.min(devicePixelRatio, 2)
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' })
  renderer.setPixelRatio(dpr)
  renderer.setClearColor(0x000000, 1)
  renderer.toneMapping = THREE.NoToneMapping
  // The composer renders several passes a frame; count them all for the telemetry.
  renderer.info.autoReset = false
  host.appendChild(renderer.domElement)
  const scene = new THREE.Scene()
  // Set as a colour-managed background: a raw clear colour here was encoded to sRGB twice and read as grey.
  scene.background = new THREE.Color(0x050508)
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 400)
  const disposables: { dispose(): void }[] = []
  const track = <T extends { dispose(): void }>(x: T) => (disposables.push(x), x)

  // Body layout: a ring around the void at alternating heights, each screen facing outward.
  const UP = new THREE.Vector3(0, 1, 0)
  const layout = bodies.map((b, i) => {
    const a = (i / bodies.length) * Math.PI * 2 + 0.35
    const r = 6.6
    const center = new THREE.Vector3(Math.cos(a) * r, (i % 2 ? 0.7 : -0.5), Math.sin(a) * r)
    const normal = new THREE.Vector3(center.x, 0, center.z).normalize()
    const h = b.aspect < 1 ? 2.7 : 2.05
    const w = h * b.aspect
    return { center, normal, w, h }
  })

  // Particles.
  const g = track(new THREE.BufferGeometry())
  const attrs = {
    aRadius: new Float32Array(count),
    aAngle: new Float32Array(count),
    aSpeed: new Float32Array(count),
    aHeight: new Float32Array(count),
    aCluster: new Float32Array(count),
    aSeed: new Float32Array(count),
  }
  for (let i = 0; i < count; i++) {
    const radius = 1.15 + Math.pow(Math.random(), 1.9) * 8.5
    attrs.aRadius[i] = radius
    // Three trailing spiral arms with a gaussian spread, plus a thin share of loose dust between them.
    const gauss = (Math.random() + Math.random() + Math.random() - 1.5) * 0.9
    attrs.aAngle[i] = Math.random() < 0.1 ? Math.random() * Math.PI * 2 : (Math.floor(Math.random() * 3) * Math.PI * 2) / 3 - Math.log(radius) * 2.1 + gauss * (0.25 + radius * 0.04)
    attrs.aSpeed[i] = 0.25 + Math.random() * 0.35
    attrs.aHeight[i] = (Math.random() - 0.5) * 2 * (Math.random() * Math.random())
    attrs.aCluster[i] = bodies.length && Math.random() < 0.42 ? Math.floor(Math.random() * bodies.length) : -1
    attrs.aSeed[i] = Math.random()
  }
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
  for (const [k, v] of Object.entries(attrs)) g.setAttribute(k, new THREE.BufferAttribute(v, 1))
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 40)
  const pad = <T,>(n: number, make: () => T) => Array.from({ length: MAX_BODIES }, (_, i) => (i < n ? null : make()))
  const centers = pad(layout.length, () => new THREE.Vector3(0, -99, 0)).map((v, i) => v ?? layout[i].center)
  const normals = pad(layout.length, () => new THREE.Vector3(0, 0, 1)).map((v, i) => v ?? layout[i].normal.clone())
  const extents = pad(layout.length, () => new THREE.Vector2(1, 1)).map((v, i) => v ?? new THREE.Vector2(layout[i].w * 0.5 + 0.55, layout[i].h * 0.5 + 0.5))
  const tints = Array.from({ length: MAX_BODIES }, (_, i) => {
    const c = new THREE.Color(bodies[i]?.tint ?? '#5fe3ff')
    const hsl = { h: 0, s: 0, l: 0 }
    c.getHSL(hsl)
    return new THREE.Color().setHSL(hsl.h, Math.min(hsl.s, 0.62), 0.62)
  })
  const uniforms = {
    uTints: { value: tints },
    uTime: { value: 0 }, uMorph: { value: 0 }, uLens: { value: 0 }, uShockR: { value: 0 }, uShockA: { value: 0 },
    uPx: { value: 2.1 * dpr }, uIntro: { value: reduced ? 1 : 0 }, uActive: { value: -1 }, uActiveW: { value: 0 }, uFocusW: { value: 0 },
    uPointer: { value: new THREE.Vector3(0, -99, 0) }, uShockC: { value: new THREE.Vector3() },
    uCenters: { value: centers }, uNormals: { value: normals }, uExtent: { value: extents },
  }
  const mat = track(new THREE.ShaderMaterial({ uniforms, vertexShader: particleVertex, fragmentShader: particleFragment, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }))
  const points = new THREE.Points(g, mat)
  points.renderOrder = 2
  scene.add(points)

  // Stars far behind everything, for parallax as the camera travels.
  const starCount = small ? 1200 : 2600
  const sg = track(new THREE.BufferGeometry())
  const sp = new Float32Array(starCount * 3), ss = new Float32Array(starCount)
  for (let i = 0; i < starCount; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(60 + Math.random() * 40)
    sp.set([v.x, v.y, v.z], i * 3)
    ss[i] = Math.random()
  }
  sg.setAttribute('position', new THREE.BufferAttribute(sp, 3))
  sg.setAttribute('aSeed', new THREE.BufferAttribute(ss, 1))
  const starUniforms = { uTime: uniforms.uTime, uPx: { value: 1.4 * dpr } }
  const stars = new THREE.Points(sg, track(new THREE.ShaderMaterial({ uniforms: starUniforms, vertexShader: starVertex, fragmentShader: starFragment, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })))
  stars.renderOrder = 0
  scene.add(stars)

  const nebula = new THREE.Mesh(track(new THREE.SphereGeometry(150, 48, 24)), track(new THREE.ShaderMaterial({ uniforms: { uTime: uniforms.uTime }, vertexShader: nebulaVertex, fragmentShader: nebulaFragment, side: THREE.BackSide, depthWrite: false })))
  nebula.renderOrder = -1
  scene.add(nebula)

  // The event horizon: a black sphere that hides what is behind it, with a hot photon rim.
  const voidMesh = new THREE.Mesh(track(new THREE.SphereGeometry(1.0, 64, 32)), track(new THREE.ShaderMaterial({ vertexShader: voidVertex, fragmentShader: voidFragment })))
  voidMesh.renderOrder = 1
  scene.add(voidMesh)

  // Project screens.
  // ImageBitmapLoader decodes off the main thread; the flip happens in the decode, so the texture itself is not flipped.
  const loader = new THREE.ImageBitmapLoader().setOptions({ imageOrientation: 'flipY' })
  const blank = track(new THREE.DataTexture(new Uint8Array([8, 8, 14, 255]), 1, 1))
  blank.needsUpdate = true
  const screens = layout.map((l, i) => {
    const u = {
      uMap: { value: blank as THREE.Texture }, uReveal: { value: 0 }, uTime: uniforms.uTime, uAspect: { value: bodies[i].aspect },
      uRadius: { value: bodies[i].aspect < 1 ? 0.16 : 0.06 }, uHover: { value: 0 }, uLoaded: { value: 0 }, uFrame: { value: 0 },
      uSheen: { value: 0.5 }, uSize: { value: new THREE.Vector2(l.w, l.h) }, uOuter: { value: new THREE.Vector2(l.w + BEZEL * 2, l.h + BEZEL * 2) },
    }
    const m = track(new THREE.ShaderMaterial({ uniforms: u, vertexShader: screenVertex, fragmentShader: screenFragment, side: THREE.DoubleSide }))
    const mesh = new THREE.Mesh(track(new THREE.PlaneGeometry(l.w + BEZEL * 2, l.h + BEZEL * 2)), m)
    mesh.position.copy(l.center)
    mesh.lookAt(l.center.clone().add(l.normal))
    mesh.renderOrder = 1
    mesh.userData.index = i
    scene.add(mesh)
    return { mesh, u, reveal: 0, hover: 0, base: mesh.quaternion.clone() }
  })
  // Textures load after the field is showing and upload one per frame, so no frame carries all eight.
  const uploads: (() => void)[] = []
  let disposed = false
  function loadTextures() {
    screens.forEach((s, i) =>
      loader.load(bodies[i].texture, (bitmap) => {
        if (disposed) { bitmap.close?.(); return }
        const tex = track(new THREE.Texture(bitmap))
        tex.flipY = false
        tex.colorSpace = THREE.SRGBColorSpace
        tex.anisotropy = 4
        tex.needsUpdate = true
        uploads.push(() => {
          renderer.initTexture(tex)
          s.u.uMap.value = tex
          s.u.uLoaded.value = 1
        })
      }),
    )
  }

  // Post: bloom on what is brighter than white (dense particles, rims, the photon ring).
  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), small ? 0.55 : 0.7, 0.5, 0.98)
  composer.addPass(bloom)
  composer.addPass(new OutputPass())

  // Camera keyframes: vortex, disk, each screen, overview. Rebuilt on resize (the look offset depends on the aspect).
  let path: { pos: THREE.CatmullRomCurve3; look: THREE.CatmullRomCurve3 } | null = null
  const focusPose = layout.map(() => ({ pos: new THREE.Vector3(), look: new THREE.Vector3() }))
  function buildPath() {
    const wide = camera.aspect > 1
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    const pos: THREE.Vector3[] = [new THREE.Vector3(0, 15, 0.01), new THREE.Vector3(0, 4.6, 13)]
    const look: THREE.Vector3[] = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -0.6, 0)]
    layout.forEach((l, i) => {
      const right = new THREE.Vector3().crossVectors(l.normal.clone().negate(), UP).normalize()
      // Distance so the screen fills about half the view height (less on a phone, where it must also fit the width).
      const fill = wide ? 0.5 : 0.36
      const byHeight = l.h / fill / (2 * tanHalf)
      const byWidth = l.w / (wide ? 0.4 : 0.86) / (2 * tanHalf * camera.aspect)
      const dist = Math.max(byHeight, byWidth)
      pos.push(l.center.clone().addScaledVector(l.normal, dist).addScaledVector(UP, 0.45))
      // Offset the look target by a share of the view, so every screen lands in the space the text panel leaves:
      // right of the panel on a wide view, above it on a tall one.
      const halfW = dist * tanHalf * camera.aspect, halfH = dist * tanHalf
      look.push(wide ? l.center.clone().addScaledVector(right, -halfW * 0.26) : l.center.clone().addScaledVector(UP, -halfH * 0.34))
      const near = dist * (l.w < l.h ? 0.86 : 0.72)
      const nearW = near * tanHalf * camera.aspect, nearH = near * tanHalf
      focusPose[i].pos.copy(l.center).addScaledVector(l.normal, near).addScaledVector(UP, 0.2)
      // With the drawer open the screen moves into the space the drawer leaves: left of it, or above the bottom sheet.
      focusPose[i].look.copy(wide ? l.center.clone().addScaledVector(right, nearW * 0.36) : l.center.clone().addScaledVector(UP, -nearH * 0.62))
    })
    pos.push(new THREE.Vector3(0, 13.5, wide ? 23 : 30))
    look.push(new THREE.Vector3(0, -0.4, 0))
    // Behind the page content the field drifts far back and low, a quiet backdrop.
    pos.push(new THREE.Vector3(wide ? -14 : -8, 4, wide ? 36 : 44))
    look.push(new THREE.Vector3(wide ? 4 : 0, 1.5, 0))
    path = { pos: new THREE.CatmullRomCurve3(pos, false, 'centripetal'), look: new THREE.CatmullRomCurve3(look, false, 'centripetal') }
  }
  const lastStage = () => stageOf.overview(layout.length)

  function resize() {
    const w = host.clientWidth || innerWidth, h = host.clientHeight || innerHeight
    renderer.setSize(w, h, false)
    composer.setSize(w, h)
    bloom.resolution.set(w * (small ? 0.35 : 0.5), h * (small ? 0.35 : 0.5))
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    buildPath()
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(host)

  const ndc = new THREE.Vector2(), ray = new THREE.Raycaster(), viewPlane = new THREE.Plane(), hit = new THREE.Vector3()
  const camPos = new THREE.Vector3(0, 15, 0.01), lookCur = new THREE.Vector3(), want = new THREE.Vector3(), wantLook = new THREE.Vector3()
  const parallax = new THREE.Vector2(), drift = new THREE.Vector2(), dir = new THREE.Vector3(), camRight = new THREE.Vector3(), camUp = new THREE.Vector3()
  let stage = 0, stageTarget = 0, lens = 0, lensTarget = 0, focusIdx: number | null = null, focusW = 0
  let hovered: number | null = null, shockT = -1, introT = 0
  let labels: (HTMLElement | null)[] = []

  function pick(nx: number, ny: number) {
    ndc.set(nx, ny)
    ray.setFromCamera(ndc, camera)
    const hits = ray.intersectObjects(screens.filter((s) => s.reveal > 0.35).map((s) => s.mesh), false)
    return hits.length ? (hits[0].object.userData.index as number) : null
  }
  function projectToView(nx: number, ny: number) {
    ndc.set(nx, ny)
    ray.setFromCamera(ndc, camera)
    camera.getWorldDirection(dir)
    viewPlane.setFromNormalAndCoplanarPoint(dir, lookCur)
    return ray.ray.intersectPlane(viewPlane, hit)
  }

  let last = performance.now()
  let raf = 0, frames = 0, fpsT = 0, running = true
  const proj = new THREE.Vector3(), tmpObj = new THREE.Object3D()
  function frame() {
    if (!running) return
    raf = requestAnimationFrame(frame)
    const now = performance.now()
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    const damp = (rate: number) => (reduced ? 1 : 1 - Math.pow(rate, dt))

    if (!reduced && introT < 1) { introT = Math.min(1, introT + dt / 2.2); uniforms.uIntro.value = 1 - Math.pow(1 - introT, 3) }
    uploads.shift()?.()
    // Scroll drives the journey through two soft stages of smoothing (about 0.7 s together), so wheel steps glide.
    stage += (stageTarget - stage) * damp(0.03)
    focusW += ((focusIdx === null ? 0 : 1) - focusW) * damp(0.02)
    lens += (lensTarget - lens) * damp(0.01)
    if (!reduced) uniforms.uTime.value += dt * (1 + Math.min(stage, 2) * 0.25)
    uniforms.uMorph.value = Math.min(stage, 2)
    uniforms.uLens.value = lens
    const nearest = Math.round(stage - 2)
    const activeIdx = focusIdx ?? (nearest >= 0 && nearest < layout.length ? nearest : -1)
    uniforms.uActive.value = activeIdx
    uniforms.uActiveW.value = activeIdx >= 0 ? clamp01(1 - Math.abs(stage - 2 - activeIdx) * 1.6) : 0
    if (focusIdx !== null) uniforms.uActiveW.value = 1
    uniforms.uFocusW.value = focusW
    if (shockT >= 0) {
      shockT += dt
      // The ripple slows as it spreads and fades, like a wave on still water.
      const k = Math.min(shockT / 1.8, 1)
      uniforms.uShockR.value = 10 * (1 - (1 - k) * (1 - k))
      uniforms.uShockA.value = 0.55 * (1 - k) * (1 - k)
      if (shockT > 1.8) { shockT = -1; uniforms.uShockA.value = 0 }
    }

    // Screens: reveal by closeness on the journey, fully in the overview, and always when focused.
    const overview = clamp01((stage - (lastStage() - 0.85)) / 0.55)
    screens.forEach((s, i) => {
      const near = clamp01(1.25 - Math.abs(stage - stageOf.body(i)) * 1.1)
      const target = focusIdx === i ? 1 : Math.max(near, overview, focusIdx === null ? 0 : near * 0.4)
      s.reveal += (target - s.reveal) * damp(overview > 0.5 ? 0.01 : 0.06)
      s.hover += ((hovered === i ? 1 : 0) - s.hover) * damp(0.0005)
      s.u.uReveal.value = s.reveal
      s.u.uHover.value = s.hover
      s.u.uFrame.value = clamp01((stage - 1.3) * 2) * (0.35 + 0.65 * Math.max(s.reveal, overview)) * (1 - 0.6 * clamp01(stage - lastStage()))
      s.u.uSheen.value = 0.65 + camera.position.clone().sub(s.mesh.position).normalize().dot(camRight.set(1, 0, 0).applyQuaternion(s.mesh.quaternion)) * 0.9
      s.mesh.position.y = layout[i].center.y + (reduced ? 0 : Math.sin(uniforms.uTime.value * 0.45 + i * 1.7) * 0.06)
      // In the overview each screen turns to face the camera, and its halo turns with it.
      tmpObj.position.copy(s.mesh.position)
      tmpObj.lookAt(camera.position)
      s.mesh.quaternion.slerpQuaternions(s.base, tmpObj.quaternion, ease(overview))
      normals[i].set(0, 0, 1).applyQuaternion(s.mesh.quaternion)
      normals[i].y = 0
      normals[i].normalize()
    })

    // Camera along the path, easing to rest at each keyframe; a focused screen pulls it closer.
    if (path) {
      const n = path.pos.points.length - 1
      const s = Math.min(Math.max(stage, 0), n)
      const seg = Math.min(Math.floor(s), n - 1)
      const u = (seg + ease(s - seg)) / n
      path.pos.getPoint(u, want)
      path.look.getPoint(u, wantLook)
      if (focusIdx !== null) {
        want.lerp(focusPose[focusIdx].pos, ease(focusW))
        wantLook.lerp(focusPose[focusIdx].look, ease(focusW))
      }
    }
    // Hover only leans the view a touch, through a slow spring, and the camera breathes on its own.
    // (A direct offset of half a unit read as the camera lunging toward the cursor.)
    if (!reduced) {
      const calm = focusIdx === null ? 1 : 0.3
      drift.x += (parallax.x * calm - drift.x) * (1 - Math.pow(0.25, dt))
      drift.y += (parallax.y * calm - drift.y) * (1 - Math.pow(0.25, dt))
      camera.matrixWorld.extractBasis(camRight, camUp, dir)
      const t = now / 1000
      want.addScaledVector(camRight, drift.x * 0.12 + Math.sin(t * 0.13) * 0.05)
      want.addScaledVector(camUp, drift.y * 0.08 + Math.sin(t * 0.11 + 1.3) * 0.03)
    }
    camPos.lerp(want, damp(0.06))
    lookCur.lerp(wantLook, damp(0.06))
    camera.position.copy(camPos)
    camera.lookAt(lookCur)

    // Overview labels follow their screens.
    const labelW = overview * clamp01(1 - (stage - lastStage()) * 3)
    labels.forEach((el, i) => {
      if (!el) return
      const l = layout[i]
      proj.copy(l.center).addScaledVector(UP, -l.h * 0.5 - 0.35).project(camera)
      const visible = labelW > 0.02 && proj.z < 1
      el.style.opacity = String(visible ? labelW : 0)
      el.style.visibility = visible ? 'visible' : 'hidden'
      el.style.transform = `translate3d(${((proj.x + 1) / 2) * innerWidth}px, ${((1 - proj.y) / 2) * innerHeight}px, 0) translate(-50%, 0)`
    })

    renderer.info.reset()
    composer.render()
    frames++
    fpsT += dt
    if (fpsT >= 0.5) { onStats(Math.round(frames / fpsT), renderer.info.render.calls); frames = 0; fpsT = 0 }
  }
  performance.mark('eh:scene-built')

  // Warm up while the canvas is still invisible: compile every shader, render one frame so the bloom and output
  // passes compile too, then reveal and start the clock. Measured before this: a 100-150 ms stall (production) and
  // 240 ms (dev) landed in the first frames of the intro.
  let ready = false
  async function warm() {
    try { await renderer.compileAsync(scene, camera) } catch { /* compile on first render instead */ }
    if (disposed) return
    composer.render()
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    if (disposed) return
    ready = true
    performance.mark('eh:ready')
    onReady()
    last = performance.now()
    frame()
    // Give the field a moment on screen before any image decodes or uploads.
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
    setStage(v) { stageTarget = v },
    jumpTo(v) {
      // Skip the path: the stage lands at once and the camera glides straight there from where it is.
      stage = stageTarget = v
      performance.mark('eh:jump')
    },
    setPointer(nx, ny, active) {
      parallax.set(nx, ny)
      const over = active ? pick(nx, ny) : null
      if (over !== hovered) { hovered = over; onHover(over) }
      if (active && over === null && projectToView(nx, ny)) { uniforms.uPointer.value.copy(hit); lensTarget = reduced ? 0.3 : 0.8 } else lensTarget = 0
    },
    press(nx, ny, ripple) {
      const over = pick(nx, ny)
      if (over !== null) return over
      if (ripple && !reduced && projectToView(nx, ny)) { uniforms.uShockC.value.copy(hit); shockT = 0; performance.mark('eh:ripple') }
      return null
    },
    focus(i) { focusIdx = i },
    bindLabels(els) { labels = els },
    dispose() {
      running = false
      disposed = true
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVis)
      ro.disconnect()
      disposables.forEach((d) => d.dispose())
      bloom.dispose()
      composer.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
