import * as THREE from 'three'

export const CLUSTERS = 8

const vertex = /* glsl */ `
uniform float uTime, uMorph, uLens, uShockR, uShockA, uPx;
uniform vec3 uPointer, uShockC;
uniform vec3 uCenters[${CLUSTERS}];
attribute float aRadius, aAngle, aSpeed, aHeight, aCluster, aSeed;
varying vec3 vColor;
varying float vAlpha;
void main() {
  float a = aAngle + uTime * aSpeed / sqrt(aRadius);
  vec3 vortex = vec3(cos(a) * aRadius, -1.8 / (aRadius - 0.9) + aHeight * 0.25, sin(a) * aRadius);
  float arm = a + log(aRadius) * 2.2;
  vec3 disk = vec3(cos(arm) * aRadius * 1.25, aHeight * 0.06, sin(arm) * aRadius * 1.25);
  int ci = int(aCluster);
  vec3 c = uCenters[0];
  for (int i = 0; i < ${CLUSTERS}; i++) { if (i == ci) c = uCenters[i]; }
  float r2 = 0.15 + fract(aSeed * 7.31) * 1.1;
  float a2 = aAngle * 3.0 + uTime * aSpeed * 1.6;
  vec3 cluster = c + vec3(cos(a2) * r2, aHeight * 0.35 * r2, sin(a2) * r2);
  float m1 = smoothstep(0.0, 1.0, clamp(uMorph, 0.0, 1.0));
  float m2 = smoothstep(0.0, 1.0, clamp(uMorph - 1.0, 0.0, 1.0));
  vec3 p = mix(mix(vortex, disk, m1), cluster, m2);
  vec2 d = p.xz - uPointer.xz;
  float dist2 = dot(d, d);
  float pull = uLens * 1.4 / (dist2 + 0.6);
  p.xz -= normalize(d + 1e-4) * pull * 0.5;
  p.xz += vec2(-d.y, d.x) * pull * 0.25;
  p.y += pull * 0.2;
  float ring = length(p.xz - uShockC.xz) - uShockR;
  p.y += exp(-ring * ring * 6.0) * uShockA;
  vec3 violet = vec3(0.42, 0.22, 0.95), cyan = vec3(0.2, 0.85, 1.0), amber = vec3(1.0, 0.66, 0.22);
  float t = fract(aSeed * 13.7);
  vec3 col = mix(violet, cyan, smoothstep(0.2, 0.8, t));
  col = mix(col, amber, step(0.9, t) + exp(-(aRadius - 1.1) * 3.0) * 0.6);
  vColor = col + pull * 0.4;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uPx * (0.6 + fract(aSeed * 3.1) * 1.4) * (10.0 / -mv.z);
  vAlpha = 0.55 * clamp(1.4 - aRadius / 9.0, 0.15, 1.0);
}`

const fragment = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec2 q = gl_PointCoord - 0.5;
  float f = smoothstep(0.5, 0.0, length(q));
  gl_FragColor = vec4(vColor * f * vAlpha, 1.0);
}`

export interface EventHorizonScene {
  setMorph(v: number): void
  setPointer(nx: number, ny: number, active: boolean): void
  shock(nx: number, ny: number): void
  focus(cluster: number | null): void
  dispose(): void
  count: number
}

export function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch { return false }
}

export function createScene(host: HTMLElement, count: number, reduced: boolean, onFps: (fps: number) => void): EventHorizonScene {
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setClearColor(0x050508, 1)
  host.appendChild(renderer.domElement)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100)

  const g = new THREE.BufferGeometry()
  const attrs = { aRadius: new Float32Array(count), aAngle: new Float32Array(count), aSpeed: new Float32Array(count), aHeight: new Float32Array(count), aCluster: new Float32Array(count), aSeed: new Float32Array(count) }
  for (let i = 0; i < count; i++) {
    const u = Math.random()
    attrs.aRadius[i] = 1.15 + Math.pow(u, 1.8) * 8.5
    attrs.aAngle[i] = Math.random() * Math.PI * 2
    attrs.aSpeed[i] = 0.25 + Math.random() * 0.35
    attrs.aHeight[i] = (Math.random() - 0.5) * 2 * (Math.random() * Math.random())
    attrs.aCluster[i] = Math.floor(Math.random() * CLUSTERS)
    attrs.aSeed[i] = Math.random()
  }
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
  for (const [k, v] of Object.entries(attrs)) g.setAttribute(k, new THREE.BufferAttribute(v, 1))
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 30)

  const centers = Array.from({ length: CLUSTERS }, (_, i) => {
    const a = (i / CLUSTERS) * Math.PI * 2 + 0.4
    const r = 4 + (i % 3) * 1.6
    return new THREE.Vector3(Math.cos(a) * r, ((i % 2) - 0.5) * 1.5, Math.sin(a) * r)
  })
  const uniforms = {
    uTime: { value: 0 }, uMorph: { value: 0 }, uLens: { value: 0 }, uShockR: { value: 0 }, uShockA: { value: 0 },
    uPx: { value: 2.2 * Math.min(devicePixelRatio, 2) }, uPointer: { value: new THREE.Vector3(99, 0, 99) }, uShockC: { value: new THREE.Vector3() },
    uCenters: { value: centers },
  }
  const mat = new THREE.ShaderMaterial({ uniforms, vertexShader: vertex, fragmentShader: fragment, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
  scene.add(new THREE.Points(g, mat))

  let morph = 0, target = 0, lens = 0, lensTarget = 0, focusIdx: number | null = null
  const ptr = new THREE.Vector2(), parallax = new THREE.Vector2(), ray = new THREE.Raycaster()
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3()
  const camPos = new THREE.Vector3(0, 14, 0.01), look = new THREE.Vector3(), lookCur = new THREE.Vector3()
  const pointerWorld = uniforms.uPointer.value
  let shockT = -1

  function resize() {
    const w = host.clientWidth || innerWidth, h = host.clientHeight || innerHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(host)

  function project(nx: number, ny: number) {
    ray.setFromCamera(new THREE.Vector2(nx, ny), camera)
    return ray.ray.intersectPlane(plane, hit)
  }

  let last = performance.now()
  const delta = () => { const n = performance.now(); const d = (n - last) / 1000; last = n; return d }
  let raf = 0, frames = 0, fpsT = 0, running = true
  function desired(out: THREE.Vector3) {
    if (focusIdx !== null) { const c = centers[focusIdx]; look.copy(c); return out.set(c.x * 1.35, c.y + 2.2, c.z * 1.35 + 0.01) }
    look.set(0, 0, 0)
    const m1 = Math.min(morph, 1), m2 = Math.max(morph - 1, 0)
    return out.set(0, 14 - m1 * 8 - m2 * 1, 0.01 + m1 * 9 + m2 * 5)
  }
  const want = new THREE.Vector3()
  function frame() {
    if (!running) return
    raf = requestAnimationFrame(frame)
    const dt = Math.min(delta(), 0.05)
    const k = reduced ? 1 : 1 - Math.pow(0.002, dt)
    morph += (target - morph) * k
    lens += (lensTarget - lens) * (1 - Math.pow(0.01, dt))
    if (!reduced) uniforms.uTime.value += dt * (1 + morph * 0.4)
    uniforms.uMorph.value = morph
    uniforms.uLens.value = lens
    if (shockT >= 0) {
      shockT += dt
      uniforms.uShockR.value = shockT * 9
      uniforms.uShockA.value = Math.max(0, 0.9 * (1 - shockT / 1.2))
      if (shockT > 1.2) shockT = -1
    }
    desired(want)
    if (!reduced && focusIdx === null) { want.x += parallax.x * 1.2; want.y += parallax.y * 0.8 }
    camPos.lerp(want, reduced ? 1 : 1 - Math.pow(0.05, dt))
    lookCur.lerp(look, reduced ? 1 : 1 - Math.pow(0.05, dt))
    camera.position.copy(camPos)
    camera.lookAt(lookCur)
    renderer.render(scene, camera)
    frames++
    fpsT += dt
    if (fpsT >= 0.5) { onFps(Math.round(frames / fpsT)); frames = 0; fpsT = 0 }
  }
  frame()
  function onVis() {
    if (document.hidden) { running = false; cancelAnimationFrame(raf) }
    else if (!running) { running = true; delta(); frame() }
  }
  document.addEventListener('visibilitychange', onVis)

  return {
    count,
    setMorph(v) { target = v },
    setPointer(nx, ny, active) {
      ptr.set(nx, ny)
      parallax.set(nx, ny)
      if (active && project(nx, ny)) { pointerWorld.copy(hit); lensTarget = reduced ? 0.4 : 1 } else lensTarget = 0
    },
    shock(nx, ny) {
      if (reduced) return
      if (project(nx, ny)) { uniforms.uShockC.value.copy(hit); shockT = 0 }
    },
    focus(c) { focusIdx = c },
    dispose() {
      running = false
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVis)
      ro.disconnect()
      g.dispose(); mat.dispose(); renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
