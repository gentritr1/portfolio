import { Camera, Geometry, Mesh, Plane, Program, Renderer, Texture, Transform, type OGLRenderingContext } from 'ogl'
import { shots } from './shots'

const surfaceVertex = `
attribute vec3 position;
attribute vec3 normal;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
varying vec3 vNormal;
varying vec3 vView;
void main() {
  vec4 view = modelViewMatrix * vec4(position, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = -view.xyz;
  gl_Position = projectionMatrix * view;
}`

// Broad studio lights reveal the bevel without an environment-map download.
const surfaceFragment = `
precision highp float;
varying vec3 vNormal;
varying vec3 vView;
void main() {
  vec3 n = normalize(vNormal);
  vec3 v = normalize(vView);
  vec3 key = normalize(vec3(-0.8, 1.4, 1.8));
  vec3 rim = normalize(vec3(1.3, 0.2, 0.5));
  float diffuse = max(dot(n, key), 0.0);
  float spec = pow(max(dot(n, normalize(key + v)), 0.0), 35.0);
  float edge = pow(max(dot(n, normalize(rim + v)), 0.0), 50.0);
  vec3 colour = vec3(0.07, 0.085, 0.10) + diffuse * vec3(0.18, 0.20, 0.22);
  colour += spec * vec3(0.52, 0.55, 0.59) + edge * vec3(0.40, 0.46, 0.50);
  gl_FragColor = vec4(colour, 1.0);
}`

const screenVertex = `
attribute vec3 position;
attribute vec2 uv;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`
const screenFragment = `
precision highp float;
uniform sampler2D uScreen;
uniform vec4 uCrop;
uniform vec2 uSize;
uniform float uRadius;
varying vec2 vUv;
void main() {
  vec2 edge = abs((vUv - 0.5) * uSize) - (uSize * 0.5 - uRadius);
  float distance = length(max(edge, 0.0)) + min(max(edge.x, edge.y), 0.0) - uRadius;
  if (distance > 0.0) discard;
  vec2 imageUv = vec2(uCrop.x + vUv.x * uCrop.z, 1.0 - uCrop.y - (1.0 - vUv.y) * uCrop.w);
  vec3 colour = texture2D(uScreen, imageUv).rgb;
  // A faint broad reflection gives the screen a glass surface while preserving the screenshot.
  float reflection = pow(clamp((vUv.y + vUv.x * 0.3) * 0.8, 0.0, 1.0), 4.0) * 0.055;
  gl_FragColor = vec4(mix(colour, vec3(0.93, 0.96, 1.0), reflection), 1.0);
}`

/** Four low-poly rounded rings make a shallow enclosure with a real metal bevel. */
function deviceGeometry(gl: OGLRenderingContext, width: number, height: number, depth: number, radius: number) {
  const positions: number[] = []
  const normals: number[] = []
  const indices: number[] = []
  const segments = 8
  const count = (segments + 1) * 4
  const bevel = 0.027
  const rings = [
    { inset: bevel, z: -depth / 2, nz: -0.8 },
    { inset: 0, z: -depth / 2 + bevel, nz: -0.25 },
    { inset: 0, z: depth / 2 - bevel, nz: 0.25 },
    { inset: bevel, z: depth / 2, nz: 0.8 },
  ]
  for (const ring of rings) {
    for (let corner = 0; corner < 4; corner++) {
      const cx = (corner === 0 || corner === 3 ? 1 : -1) * (width / 2 - radius)
      const cy = (corner < 2 ? 1 : -1) * (height / 2 - radius)
      for (let step = 0; step <= segments; step++) {
        const angle = (corner + step / segments) * Math.PI / 2
        const x = Math.cos(angle), y = Math.sin(angle)
        positions.push(cx + x * (radius - ring.inset), cy + y * (radius - ring.inset), ring.z)
        const side = Math.sqrt(1 - ring.nz * ring.nz)
        normals.push(x * side, y * side, ring.nz)
      }
    }
  }
  for (let ring = 0; ring < rings.length - 1; ring++) {
    for (let i = 0; i < count; i++) {
      const a = ring * count + i, b = ring * count + (i + 1) % count
      indices.push(a, b, b + count, a, b + count, a + count)
    }
  }
  for (const face of [-1, 1]) {
    const center = positions.length / 3
    positions.push(0, 0, face * depth / 2)
    normals.push(0, 0, face)
    const ringStart = face < 0 ? 0 : count * 3
    for (let i = 0; i < count; i++) {
      const a = ringStart + i, b = ringStart + (i + 1) % count
      indices.push(center, face < 0 ? b : a, face < 0 ? a : b)
    }
  }
  return new Geometry(gl, {
    position: { size: 3, data: new Float32Array(positions) },
    normal: { size: 3, data: new Float32Array(normals) },
    index: { data: new Uint16Array(indices) },
  })
}

export interface StudioScene {
  setProgress: (value: number) => void
  setPaused: (value: boolean) => void
  replay: () => void
  dispose: () => void
}

// Each chapter brings its own screen to the front. Positions interpolate with
// scroll; the camera also travels, so this is a changing 3D composition.
const poses = [
  [[0, -.04, .8, -.08, -.16, -.12, 1], [-1.28, .18, -.45, .04, -.28, .28, .91], [1.32, -.03, -.3, -.05, .32, -.21, .94]],
  [[1.4, -.28, -.5, .02, .34, -.25, .86], [-.06, .03, .95, -.025, .1, .06, 1.08], [-1.42, .22, -.45, .04, -.3, .27, .88]],
  [[-1.3, .2, -.5, .04, -.26, .22, .88], [1.4, -.25, -.55, .025, .35, -.28, .86], [.02, -.03, 1, -.04, -.12, .07, 1.08]],
] as const

export function createScene(host: HTMLElement, images: HTMLImageElement[], openingStarted: number, onReady: () => void, onUnavailable: () => void): StudioScene | null {
  if (images.length !== 3 || images.some(image => !image.complete || !image.naturalWidth)) return null
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('webgl2', { alpha: true, antialias: true, powerPreference: 'low-power' })
  if (!context) return null

  let disposed = false
  let frame = 0
  let visible = true
  let paused = false
  let pauseStarted = 0
  let opening = openingStarted
  let targetProgress = 0
  let progress = 0
  let lastTime = 0
  let firstFrame = true
  let firstFence: WebGLSync | null = null
  let fadeUntil = 0
  let resizeObserver: ResizeObserver | undefined
  let intersectionObserver: IntersectionObserver | undefined
  const geometries: Geometry[] = []
  const programs: Program[] = []
  const textures: Texture[] = []
  let request = () => {}
  let hiddenAt = 0

  function dispose() {
    if (disposed) return
    disposed = true
    cancelAnimationFrame(frame)
    resizeObserver?.disconnect()
    intersectionObserver?.disconnect()
    document.removeEventListener('visibilitychange', visibility)
    canvas.removeEventListener('webglcontextlost', lost)
    if (!context!.isContextLost()) {
      if (firstFence) context!.deleteSync(firstFence)
      geometries.forEach(geometry => geometry.remove())
      programs.forEach(program => {
        program.remove()
        context!.deleteShader(program.vertexShader)
        context!.deleteShader(program.fragmentShader)
      })
      textures.forEach(texture => context!.deleteTexture(texture.texture))
      context!.getExtension('WEBGL_lose_context')?.loseContext()
    }
    canvas.remove()
  }
  function unavailable() { dispose(); onUnavailable() }
  function lost(event: Event) { event.preventDefault(); unavailable() }
  function visibility() {
    if (document.hidden) {
      hiddenAt = performance.now()
      cancelAnimationFrame(frame)
      frame = 0
    } else {
      if (hiddenAt && !paused) opening += performance.now() - hiddenAt
      hiddenAt = 0
      lastTime = 0
      request()
    }
  }
  canvas.addEventListener('webglcontextlost', lost)

  try {
    const renderer = new Renderer({ canvas, alpha: true, antialias: true, depth: true, dpr: Math.min(window.devicePixelRatio || 1, 1.5), powerPreference: 'low-power' })
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)
    const camera = new Camera(gl, { fov: 30, near: .1, far: 40 })
    const scene = new Transform()
    const assembly = new Transform()
    assembly.setParent(scene)
    const width = 1.52, height = 3.12, depth = .18, inset = .065
    const geometry = deviceGeometry(gl, width, height, depth, .18)
    const screen = new Plane(gl, { width: width - inset * 2, height: height - inset * 2 })
    geometries.push(geometry, screen)
    const metal = new Program(gl, { vertex: surfaceVertex, fragment: surfaceFragment })
    programs.push(metal)
    const devices = images.map((image, index) => {
      const device = new Transform()
      device.setParent(assembly)
      new Mesh(gl, { geometry, program: metal }).setParent(device)
      const texture = new Texture(gl, { image, generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR })
      textures.push(texture)
      const program = new Program(gl, {
        vertex: screenVertex, fragment: screenFragment,
        uniforms: {
          uScreen: { value: texture }, uCrop: { value: [...shots[index].crop] },
          uSize: { value: [width - inset * 2, height - inset * 2] }, uRadius: { value: .115 },
        },
      })
      programs.push(program)
      const display = new Mesh(gl, { geometry: screen, program })
      display.position.z = depth / 2 + .002
      display.setParent(device)
      return device
    })
    if (programs.some(program => !gl.getProgramParameter(program.program, gl.LINK_STATUS))) throw new Error('Studio shader link failed')
    textures.forEach(texture => texture.update(0))
    if (context.getError() !== context.NO_ERROR || context.isContextLost()) throw new Error('Studio texture upload failed')

    let distance = 8
    const render = (now: number) => {
      frame = 0
      if (disposed || !visible || document.hidden) return
      const dt = lastTime ? Math.min((now - lastTime) / 1000, .05) : 1 / 60
      lastTime = now
      progress = paused ? targetProgress : progress + (targetProgress - progress) * (1 - Math.exp(-10 * dt))
      const current = Math.min(1, Math.floor(progress))
      const fraction = Math.max(0, Math.min(1, progress - current))
      const blend = fraction * fraction * (3 - 2 * fraction)
      const elapsed = (paused ? pauseStarted : now) - opening
      const intro = Math.max(0, Math.min(1, elapsed / 1600))
      const fan = 1 - Math.pow(1 - intro, 4)
      for (let index = 0; index < devices.length; index++) {
        const a = poses[current][index], b = poses[current + 1][index]
        const value = (axis: number) => a[axis] + (b[axis] - a[axis]) * blend
        devices[index].position.set(value(0) * fan, value(1) + (1 - fan) * -.3, value(2) + (1 - fan) * (index === 0 ? 0 : -.5))
        devices[index].rotation.set(value(3), value(4) - (1 - fan) * .5, value(5) * fan)
        devices[index].scale.set(value(6) * (.82 + fan * .18))
      }
      camera.position.set(Math.sin(progress * Math.PI) * .36, .1 + Math.sin(progress * Math.PI / 2) * .2, distance - Math.sin(progress * Math.PI / 2) * .18)
      camera.lookAt([0, .02, 0])
      assembly.rotation.y = Math.sin(progress * Math.PI) * .07
      try {
        renderer.render({ scene, camera })
        if (firstFrame) {
          if (!firstFence) {
            firstFence = context.fenceSync(context.SYNC_GPU_COMMANDS_COMPLETE, 0)
            if (!firstFence) throw new Error('Studio frame could not be confirmed')
            context.flush()
            request()
            return
          }
          const result = context.clientWaitSync(firstFence, 0, 0)
          if (result === context.TIMEOUT_EXPIRED) { request(); return }
          if (result === context.WAIT_FAILED || context.isContextLost()) throw new Error('Studio frame failed')
          context.deleteSync(firstFence)
          firstFence = null
          firstFrame = false
          fadeUntil = now + 500
          onReady()
        }
      } catch { unavailable(); return }
      if (now < fadeUntil || (!paused && (intro < 1 || Math.abs(progress - targetProgress) > .0002))) request()
    }
    request = () => { if (!disposed && visible && !document.hidden && !frame) frame = requestAnimationFrame(render) }
    const resize = () => {
      if (disposed) return
      const { width: w, height: h } = host.getBoundingClientRect()
      if (!w || !h) return
      renderer.setSize(w, h)
      const aspect = w / h
      distance = Math.max(7.7, 4.45 / (2 * Math.tan(Math.PI / 12) * aspect))
      camera.perspective({ aspect })
      request()
    }
    host.appendChild(canvas)
    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)
    intersectionObserver = new IntersectionObserver(entries => {
      visible = entries[0]?.isIntersecting ?? false
      if (visible) { lastTime = 0; request() } else { cancelAnimationFrame(frame); frame = 0 }
    }, { rootMargin: '80px' })
    intersectionObserver.observe(host)
    document.addEventListener('visibilitychange', visibility)
    resize()
    return {
      setProgress(value) { targetProgress = Math.max(0, Math.min(2, value)); request() },
      setPaused(value) {
        if (paused === value) return
        const now = performance.now()
        if (value) pauseStarted = now
        else opening += now - pauseStarted
        paused = value
        request()
      },
      replay() { opening = performance.now(); if (paused) pauseStarted = opening; request() },
      dispose,
    }
  } catch {
    unavailable()
    return null
  }
}
