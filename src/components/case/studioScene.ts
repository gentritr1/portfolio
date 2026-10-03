import { Camera, Geometry, Mesh, Plane, Program, Renderer, Texture, Transform, type OGLRenderingContext } from 'ogl'
import type { StudioComposition } from './studioShots'

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

/** Static render at rest; only pointer movement or a resize requests animation frames. */
export function createStudioScene(host: HTMLElement, composition: StudioComposition, images: readonly HTMLImageElement[], onReady: () => void, onUnavailable: () => void): () => void {
  if (images.length !== composition.shots.length || images.some(image => !image.complete || !image.naturalWidth)) {
    onUnavailable()
    return () => {}
  }
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('webgl2', { alpha: true, antialias: true, powerPreference: 'low-power' })
  if (!context) { onUnavailable(); return () => {} }

  const geometries: Geometry[] = []
  const programs: Program[] = []
  const textures: Texture[] = []
  let disposed = false
  let frame = 0
  let visible = true
  let ready = false
  let firstFrame = true
  let readyFence: WebGLSync | null = null
  let fadeUntil = 0
  let resizeObserver: ResizeObserver | undefined
  let intersectionObserver: IntersectionObserver | undefined
  let resize = () => {}
  let pointer = (_event: PointerEvent) => {}
  let leave = () => {}
  let visibility = () => {}

  function dispose() {
    if (disposed) return
    disposed = true
    cancelAnimationFrame(frame)
    resizeObserver?.disconnect()
    intersectionObserver?.disconnect()
    host.removeEventListener('pointermove', pointer)
    host.removeEventListener('pointerleave', leave)
    document.removeEventListener('visibilitychange', visibility)
    canvas.removeEventListener('webglcontextlost', lost)
    if (!context!.isContextLost()) {
      if (readyFence) context!.deleteSync(readyFence)
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
  canvas.addEventListener('webglcontextlost', lost)

  try {
    const renderer = new Renderer({ canvas, alpha: true, antialias: true, depth: true, dpr: Math.min(window.devicePixelRatio || 1, 1.5), powerPreference: 'low-power' })
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)
    const camera = new Camera(gl, { fov: 30, near: 0.1, far: 40 })
    const scene = new Transform()
    const assembly = new Transform()
    assembly.setParent(scene)
    const phone = composition.device === 'phone'
    const width = phone ? 1.52 : 5.25
    const height = phone ? 3.12 : 3.34
    const depth = phone ? 0.18 : 0.13
    const inset = phone ? 0.065 : 0.055
    const geometry = deviceGeometry(gl, width, height, depth, phone ? 0.18 : 0.11)
    const screen = new Plane(gl, { width: width - inset * 2, height: height - inset * 2 })
    geometries.push(geometry, screen)
    const metal = new Program(gl, { vertex: surfaceVertex, fragment: surfaceFragment })
    programs.push(metal)

    composition.shots.forEach((shot, index) => {
      const device = new Transform()
      device.setParent(assembly)
      if (phone) {
        if (index === 0) { device.position.set(0, -0.015, 0.6); device.rotation.set(-0.02, -0.13, -0.05) }
        if (index === 1) { device.position.set(-1.47, 0.03, -0.2); device.rotation.set(0.025, -0.30, 0.15); device.scale.set(0.93) }
        if (index === 2) { device.position.set(1.47, 0.03, -0.2); device.rotation.set(0.025, 0.30, -0.15); device.scale.set(0.93) }
      } else if (index === 0) {
        device.position.set(composition.shots.length > 1 ? 0.36 : 0, -0.13, 0.6)
        device.rotation.set(0.035, -0.18, 0.055)
      } else {
        device.position.set(-0.8, 0.46, -0.62)
        device.rotation.set(0.01, 0.20, -0.085)
        device.scale.set(0.83)
      }
      new Mesh(gl, { geometry, program: metal }).setParent(device)
      const texture = new Texture(gl, { image: images[index], generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR })
      textures.push(texture)
      const program = new Program(gl, {
        vertex: screenVertex, fragment: screenFragment,
        uniforms: {
          uScreen: { value: texture },
          uCrop: { value: shot.crop ?? [0, 0, 1, 1] },
          uSize: { value: [width - inset * 2, height - inset * 2] },
          uRadius: { value: phone ? 0.115 : 0.055 },
        },
      })
      programs.push(program)
      const display = new Mesh(gl, { geometry: screen, program })
      display.position.z = depth / 2 + 0.002
      display.setParent(device)
    })
    if (programs.some(program => !gl.getProgramParameter(program.program, gl.LINK_STATUS))) throw new Error('Studio shader did not link')
    // These are the already-decoded DOM images behind the canvas. Upload them before
    // rendering; loading a second set would let the two presentations race.
    textures.forEach(texture => texture.update(0))
    if (context.getError() !== context.NO_ERROR || context.isContextLost()) throw new Error('Studio texture upload failed')
    ready = true

    let targetX = 0, targetY = 0
    let last = 0
    const render = (now: number) => {
      frame = 0
      if (disposed || !ready || !visible || document.hidden) return
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60
      last = now
      const blend = 1 - Math.exp(-9 * dt)
      assembly.rotation.x += (targetX - assembly.rotation.x) * blend
      assembly.rotation.y += (targetY - assembly.rotation.y) * blend
      try {
        renderer.render({ scene, camera })
        if (firstFrame) {
          if (!readyFence) {
            readyFence = context.fenceSync(context.SYNC_GPU_COMMANDS_COMPLETE, 0)
            if (!readyFence) throw new Error('Studio frame could not be confirmed')
            context.flush()
            request()
            return
          }
          const status = context.clientWaitSync(readyFence, 0, 0)
          if (status === context.TIMEOUT_EXPIRED) { request(); return }
          if (status === context.WAIT_FAILED || context.isContextLost()) throw new Error('Studio frame failed')
          context.deleteSync(readyFence)
          readyFence = null
          firstFrame = false
          // Keep repainting through the canvas fade and the delayed still removal.
          fadeUntil = now + 500
          onReady()
        }
      } catch { unavailable(); return }
      if (now < fadeUntil || Math.abs(targetX - assembly.rotation.x) + Math.abs(targetY - assembly.rotation.y) > 0.0002) request()
    }
    function request() {
      if (!disposed && ready && visible && !document.hidden && !frame) frame = requestAnimationFrame(render)
    }
    resize = () => {
      if (disposed) return
      const rect = host.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      renderer.setSize(rect.width, rect.height)
      const aspect = rect.width / rect.height
      const distance = Math.max(phone ? 7.3 : 8.3, (phone ? 3.9 : 5.7) / (2 * Math.tan(Math.PI / 12) * aspect))
      camera.position.set(0, 0.13, distance)
      camera.lookAt([0, 0, 0])
      camera.perspective({ aspect })
      request()
    }
    pointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      const rect = host.getBoundingClientRect()
      targetY = ((event.clientX - rect.left) / rect.width - 0.5) * 0.14
      targetX = ((event.clientY - rect.top) / rect.height - 0.5) * 0.08
      request()
    }
    leave = () => { targetX = 0; targetY = 0; request() }
    visibility = () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; last = 0 }
      else request()
    }
    host.append(canvas)
    host.addEventListener('pointermove', pointer, { passive: true })
    host.addEventListener('pointerleave', leave, { passive: true })
    document.addEventListener('visibilitychange', visibility)
    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)
    intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) request()
      else { cancelAnimationFrame(frame); frame = 0; last = 0 }
    })
    intersectionObserver.observe(host)
    resize()
  } catch { unavailable() }
  return dispose
}
