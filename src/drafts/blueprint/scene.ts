import { Camera, Vec3, Geometry, Mesh, Plane, Program, Renderer, Texture, Transform, type OGLRenderingContext } from 'ogl'

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
  vec3 colour = vec3(0.10, 0.18, 0.42) + diffuse * vec3(0.12, 0.17, 0.32);
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

const colourFragment = `precision highp float; uniform vec3 uColour; void main(){gl_FragColor=vec4(uColour,1.0);}`
const glassFragment = `
precision highp float;
varying vec2 vUv;
void main(){
  vec2 p=abs(vUv-.5);
  float edge=smoothstep(.482,.492,max(p.x,p.y));
  float reflection=pow(max(0.0,1.0-abs(vUv.x-vUv.y-.15)*2.0),8.0);
  gl_FragColor=vec4(.13,.28,.85,.07+edge*.58+reflection*.09);
}`

export type PartPoints = [number, number][]
export interface BlueprintScene {
  setSeparation: (value: number) => void
  setPaused: (value: boolean) => void
  replay: () => void
  dispose: () => void
}

export function createBlueprintScene(host: HTMLElement, image: HTMLImageElement, started: number, onPoints: (points: PartPoints) => void, onReady: () => void, onUnavailable: () => void): BlueprintScene | null {
  if (!image.complete || !image.naturalWidth) return null
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('webgl2', { alpha: true, antialias: true, powerPreference: 'low-power' })
  if (!context) return null
  let disposed = false, visible = true, paused = false
  let frame = 0, lastTime = 0, pauseStarted = 0, opening = started, hiddenAt = 0
  let target = 1, separation = 1, fadeUntil = 0
  let firstFrame = true
  let fence: WebGLSync | null = null
  let resizeObserver: ResizeObserver | undefined
  let intersectionObserver: IntersectionObserver | undefined
  const geometries: Geometry[] = [], programs: Program[] = [], textures: Texture[] = []
  let request = () => {}
  function dispose() {
    if (disposed) return
    disposed = true
    cancelAnimationFrame(frame)
    resizeObserver?.disconnect()
    intersectionObserver?.disconnect()
    canvas.removeEventListener('webglcontextlost', lost)
    document.removeEventListener('visibilitychange', visibility)
    if (!context!.isContextLost()) {
      if (fence) context!.deleteSync(fence)
      geometries.forEach(item => item.remove())
      programs.forEach(item => { item.remove(); context!.deleteShader(item.vertexShader); context!.deleteShader(item.fragmentShader) })
      textures.forEach(item => context!.deleteTexture(item.texture))
      context!.getExtension('WEBGL_lose_context')?.loseContext()
    }
    canvas.remove()
  }
  function unavailable() { dispose(); onUnavailable() }
  function lost(event: Event) { event.preventDefault(); unavailable() }
  function visibility() {
    if (document.hidden) { hiddenAt = performance.now(); cancelAnimationFrame(frame); frame = 0 }
    else { if (hiddenAt && !paused) opening += performance.now() - hiddenAt; hiddenAt = 0; lastTime = 0; request() }
  }
  canvas.addEventListener('webglcontextlost', lost)
  try {
    const renderer = new Renderer({ canvas, alpha: true, antialias: true, depth: true, dpr: Math.min(devicePixelRatio || 1, 1.5), powerPreference: 'low-power' })
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)
    const camera = new Camera(gl, { fov: 35, near: .1, far: 50 })
    const scene = new Transform()
    const assembly = new Transform()
    assembly.setParent(scene)
    assembly.rotation.set(-.02, -.32, -.06)

    const shellGeometry = deviceGeometry(gl, 4.5, 2.83, .12, .13)
    const baseGeometry = deviceGeometry(gl, 4.85, 3.1, .13, .14)
    const screenGeometry = new Plane(gl, { width: 4.32, height: 2.65 })
    const glassGeometry = new Plane(gl, { width: 4.45, height: 2.8 })
    geometries.push(shellGeometry, baseGeometry, screenGeometry, glassGeometry)
    const metal = new Program(gl, { vertex: surfaceVertex, fragment: surfaceFragment })
    programs.push(metal)
    const lid = new Transform()
    lid.setParent(assembly)
    lid.rotation.x = -.12
    const shell = new Mesh(gl, { geometry: shellGeometry, program: metal })
    shell.setParent(lid)
    const texture = new Texture(gl, { image, generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR })
    textures.push(texture)
    const displayProgram = new Program(gl, { vertex: screenVertex, fragment: screenFragment, uniforms: {
      uScreen: { value: texture }, uCrop: { value: [0, 0, 1, 1] }, uSize: { value: [4.32, 2.65] }, uRadius: { value: .045 },
    } })
    const glassProgram = new Program(gl, { vertex: screenVertex, fragment: glassFragment, transparent: true, depthWrite: false })
    const detailProgram = new Program(gl, { vertex: screenVertex, fragment: colourFragment, uniforms: { uColour: { value: [.07, .14, .35] } } })
    programs.push(displayProgram, glassProgram, detailProgram)
    const display = new Mesh(gl, { geometry: screenGeometry, program: displayProgram })
    display.setParent(lid)
    const glass = new Mesh(gl, { geometry: glassGeometry, program: glassProgram })
    glass.renderOrder = 10
    glass.setParent(lid)
    const base = new Transform()
    base.rotation.x = -Math.PI / 2
    base.setParent(assembly)
    new Mesh(gl, { geometry: baseGeometry, program: metal }).setParent(base)
    const trackpadGeometry = new Plane(gl, { width: 1.6, height: .72 })
    geometries.push(trackpadGeometry)
    const trackpad = new Mesh(gl, { geometry: trackpadGeometry, program: detailProgram })
    trackpad.position.set(0, -.87, .068)
    trackpad.setParent(base)
    const keyGeometry = new Plane(gl, { width: .24, height: .2 })
    geometries.push(keyGeometry)
    for (let row = 0; row < 4; row++) {
      for (let column = 0; column < 13; column++) {
        const key = new Mesh(gl, { geometry: keyGeometry, program: detailProgram })
        key.position.set((column - 6) * .295, .95 - row * .27, .068)
        key.setParent(base)
      }
    }
    if (programs.some(item => !gl.getProgramParameter(item.program, gl.LINK_STATUS))) throw new Error('Blueprint shader link failed')
    texture.update(0)
    if (context.getError() !== context.NO_ERROR || context.isContextLost()) throw new Error('Blueprint texture upload failed')

    let distance = 8, mobile = false
    const anchor = new Vec3()
    const projectPoint = (object: Transform, point: [number, number, number]): [number, number] => {
      anchor.set(...point).applyMatrix4(object.worldMatrix)
      camera.project(anchor)
      return [(anchor.x + 1) / 2, (1 - anchor.y) / 2]
    }
    const render = (now: number) => {
      frame = 0
      if (disposed || !visible || document.hidden) return
      const dt = lastTime ? Math.min((now - lastTime) / 1000, .05) : 1 / 60
      lastTime = now
      separation = paused ? target : separation + (target - separation) * (1 - Math.exp(-8 * dt))
      const elapsed = (paused ? pauseStarted : now) - opening
      const intro = Math.max(0, Math.min(1, elapsed / 1900))
      const explosion = separation * (1 - Math.pow(1 - intro, 4))
      lid.position.set(0, .3 + explosion * .15, -.75)
      shell.position.z = -.2 * explosion
      display.position.z = .065 + explosion * .62
      glass.position.set(0, explosion * .17, .085 + explosion * 1.3)
      base.position.set(0, -1.11 - explosion * .58, .68 + explosion * .32)
      assembly.position.x = mobile ? 0 : -.6
      assembly.rotation.y = -.32 - explosion * .07
      camera.position.set(1.15, 2.2, distance)
      camera.lookAt([-.2, -.3, .2])
      try {
        renderer.render({ scene, camera })
        onPoints([projectPoint(glass, [2.1, .7, 0]), projectPoint(display, [2.05, -.15, 0]), projectPoint(base, [2.15, -.6, .075])])
        if (firstFrame) {
          if (!fence) { fence = context.fenceSync(context.SYNC_GPU_COMMANDS_COMPLETE, 0); if (!fence) throw new Error('Blueprint frame unavailable'); context.flush(); request(); return }
          const result = context.clientWaitSync(fence, 0, 0)
          if (result === context.TIMEOUT_EXPIRED) { request(); return }
          if (result === context.WAIT_FAILED || context.isContextLost()) throw new Error('Blueprint frame failed')
          context.deleteSync(fence); fence = null; firstFrame = false; fadeUntil = now + 500; onReady()
        }
      } catch { unavailable(); return }
      if (now < fadeUntil || (!paused && (intro < 1 || Math.abs(target - separation) > .0002))) request()
    }
    request = () => { if (!disposed && visible && !document.hidden && !frame) frame = requestAnimationFrame(render) }
    const resize = () => {
      if (disposed) return
      const { width, height } = host.getBoundingClientRect()
      if (!width || !height) return
      const aspect = width / height
      mobile = width < 650
      // Include the near edge of the separated base in both width and height.
      distance = Math.max(9.4, 6.7 / (2 * Math.tan(35 * Math.PI / 360) * aspect))
      renderer.setSize(width, height)
      camera.perspective({ aspect })
      request()
    }
    host.appendChild(canvas)
    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)
    intersectionObserver = new IntersectionObserver(entries => {
      visible = entries[0]?.isIntersecting ?? false
      if (visible) { lastTime = 0; request() } else { cancelAnimationFrame(frame); frame = 0 }
    }, { rootMargin: '60px' })
    intersectionObserver.observe(host)
    document.addEventListener('visibilitychange', visibility)
    resize()
    return {
      setSeparation(value) { target = Math.max(0, Math.min(1, value)); request() },
      setPaused(value) { if (paused === value) return; const now = performance.now(); if (value) pauseStarted = now; else opening += now - pauseStarted; paused = value; request() },
      replay() { opening = performance.now(); if (paused) pauseStarted = opening; request() },
      dispose,
    }
  } catch { unavailable(); return null }
}
