import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl'
import {
  CAMERA_Z,
  DESIGN_ASPECT,
  FORWARD,
  FOV,
  PANE_H,
  PANE_SCALE,
  PANE_W,
  PITCH,
  approach,
  panePose,
  type PanePose,
} from './layout'
import { fragment, vertex } from './shaders'
import type { createGlass } from './glass'

export type Rgb = [number, number, number]

export interface Tints {
  panes: Rgb[]
  signal: Rgb
  panel: Rgb
  line: Rgb
}

export interface SceneOptions {
  /** Element that sets the size and receives pointer tilt. */
  host: HTMLElement
  tints: Tints
  active: number
  /** Waveform per pane, 0 to 5, in channel order. */
  waves: number[]
  posters?: (string | undefined)[]
  still?: boolean
  lostSignal?: boolean
  onFirstFrame?: () => void
  onDegrade?: () => void
}

export interface SignalScene {
  tuneIn(): Promise<void>
  resetCamera(): void
  setActive(index: number): void
  setTints(tints: Tints): void
  dispose(): void
}

const DEG = Math.PI / 180
const TUNE_S = 0.28
const IDLE_YAW = 4 * DEG
const TILT_YAW = 5 * DEG
const TILT_PITCH = 3 * DEG
const SLOW_FRAME_MS = 25
const WINDOW = 90
const WARMUP = 20

interface Pane {
  mesh: Mesh
  tint: Float32Array
  weight: number
  phase: number
  depth: number
}

function copy(into: Float32Array, rgb: Rgb) {
  into[0] = rgb[0]
  into[1] = rgb[1]
  into[2] = rgb[2]
}

/** Unknown and privacy-masked adapters deliberately keep the base renderer. */
function strongGpu(gl: WebGL2RenderingContext) {
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
  if (navigator.hardwareConcurrency < 8 || (memory !== undefined && memory < 8)) return false
  const debug = gl.getExtension('WEBGL_debug_renderer_info')
  if (!debug || gl.getParameter(gl.MAX_TEXTURE_SIZE) < 8192) return false
  const name = String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL))
  return /Apple M\d|NVIDIA (?:GeForce )?(?:RTX|GTX 1[068])|AMD Radeon (?:RX|Pro)/i.test(name)
}

export function createScene(context: WebGL2RenderingContext, opts: SceneOptions): SignalScene {
  const { host } = opts
  const canvas = context.canvas as HTMLCanvasElement
  let dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  const renderer = new Renderer({
    canvas,
    dpr,
    alpha: true,
    premultipliedAlpha: true,
    antialias: true,
    depth: false,
    powerPreference: 'low-power',
  })
  const gl = renderer.gl
  gl.clearColor(0, 0, 0, 0)

  const camera = new Camera(gl, { fov: FOV, near: 0.1, far: 30 })
  camera.position.set(0, -Math.sin(PITCH) * CAMERA_Z, Math.cos(PITCH) * CAMERA_Z)
  camera.lookAt([0, 0, 0])

  const blank = new Texture(gl, { generateMipmaps: false })
  const textures = new Map<number, Texture>()
  const pendingImages = new Map<number, HTMLImageElement>()
  function loadPoster(index: number) {
    const url = opts.posters?.[index]
    if (!url || textures.has(index) || pendingImages.has(index)) return
    const image = new Image()
    pendingImages.set(index, image)
    image.onload = () => {
      if (disposed) return
      const texture = new Texture(gl, { image, generateMipmaps: false, minFilter: gl.LINEAR })
      textures.set(index, texture)
      pendingImages.delete(index)
    }
    image.onerror = () => pendingImages.delete(index)
    image.src = url
  }

  const signal = new Float32Array(3)
  const panel = new Float32Array(3)
  const line = new Float32Array(3)
  const program = new Program(gl, {
    vertex,
    fragment,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    cullFace: false,
    uniforms: {
      uPoster: { value: blank },
      uHasPoster: { value: 0 },
      uTint: { value: new Float32Array(3) },
      uSignal: { value: signal },
      uPanel: { value: panel },
      uLine: { value: line },
      uQuad: { value: [PANE_W + 0.04, PANE_H + 0.04] },
      uHalf: { value: [PANE_W / 2, PANE_H / 2] },
      uDim: { value: 1 },
      uTune: { value: 0 },
      uAmp: { value: 0.12 },
      uPhase: { value: 0 },
      uWave: { value: 0 },
      uFromWave: { value: 0 },
      uMorph: { value: 1 },
      uOnAir: { value: 0 },
      uTime: { value: 0 },
      uLoss: { value: 0 },
    },
  })
  if (!gl.getProgramParameter(program.program, gl.LINK_STATUS)) {
    program.remove()
    throw new Error('Signal pane shader could not be linked')
  }
  let glass: ReturnType<typeof createGlass> | undefined
  let glassRequested = false
  const eligibleForGlass = !opts.still && !opts.lostSignal && (
    strongGpu(context) || (import.meta.env.DEV && host.closest('[data-lab-glass="force"]') !== null)
  )
  host.dataset.glass = eligibleForGlass ? 'qualified' : 'base'
  const u = program.uniforms
  const geometry = new Plane(gl, {
    width: PANE_W + 0.04,
    height: PANE_H + 0.04,
  })

  const stack = new Transform()
  const count = opts.tints.panes.length
  let active = opts.active
  let fromWave = opts.waves[active] ?? active
  let centre = active
  let tuneAt = -1
  let dollyAt = -1
  let finishDolly: (() => void) | undefined
  let dollyTimeout = 0
  const panes: Pane[] = []
  const order: Pane[] = []
  for (let i = 0; i < count; i++) {
    const mesh = new Mesh(gl, { geometry, program })
    mesh.scale.set(PANE_SCALE)
    const pane: Pane = {
      mesh,
      tint: new Float32Array(3),
      weight: i === active ? 1 : 0,
      phase: i * 0.37,
      depth: 0,
    }
    const wave = opts.waves[i] ?? i
    mesh.onBeforeRender(() => {
      const tune = pane.weight > 0 && i === active ? tuneEnvelope() : 0
      u.uPoster.value = textures.get(i) ?? blank
      u.uHasPoster.value = textures.has(i) ? pane.weight : 0
      u.uTint.value = pane.tint
      u.uDim.value = 0.4 + 0.6 * pane.weight
      u.uTune.value = tune
      u.uAmp.value = 0.12 * (1 + 1.4 * tune) * (1 - u.uLoss.value)
      u.uPhase.value = pane.phase
      u.uWave.value = wave
      u.uFromWave.value = i === active ? fromWave : wave
      const progress = tuneAt < 0 ? 1 : Math.min(1, (time - tuneAt) / TUNE_S)
      u.uMorph.value = i === active ? progress * progress * (3 - 2 * progress) : 1
      u.uOnAir.value = !opts.lostSignal && i === active ? Math.max(0, pane.weight * 2 - 1) * (1 - tune) : 0
    })
    mesh.setParent(stack)
    panes.push(pane)
    order.push(pane)
  }

  function setTints(t: Tints) {
    copy(signal, t.signal)
    copy(panel, t.panel)
    copy(line, t.line)
    for (let i = 0; i < count; i++) copy(panes[i].tint, t.panes[i] ?? t.line)
  }
  setTints(opts.tints)

  let time = 0
  function tuneEnvelope() {
    if (tuneAt < 0) return 0
    const p = (time - tuneAt) / TUNE_S
    if (p >= 1) return 0
    return p < 0.25 ? p / 0.25 : 1 - (p - 0.25) / 0.75
  }

  let width = 0
  let height = 0
  function resize() {
    const r = host.getBoundingClientRect()
    width = Math.max(1, Math.round(r.width))
    height = Math.max(1, Math.round(r.height))
    renderer.dpr = dpr
    renderer.setSize(width, height)
    const aspect = width / height
    camera.perspective({ aspect })
    stack.scale.set(Math.min(1, aspect / DESIGN_ASPECT))
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(host)

  const fine = window.matchMedia('(pointer: fine)').matches
  let aimX = 0
  let aimY = 0
  let tiltX = 0
  let tiltY = 0
  function onPointer(e: PointerEvent) {
    const r = host.getBoundingClientRect()
    const nx = (e.clientX - (r.left + r.width / 2)) / (r.width * 0.9)
    const ny = (e.clientY - (r.top + r.height / 2)) / (r.height * 0.9)
    aimX = Math.max(-1, Math.min(1, nx))
    aimY = Math.max(-1, Math.min(1, ny))
  }
  function onLeave() {
    aimX = 0
    aimY = 0
  }
  const pointerSurface = opts.still ? host : window
  const leaveSurface = opts.still ? host : document.documentElement
  if (fine && !opts.lostSignal) {
    pointerSurface.addEventListener('pointermove', onPointer as EventListener, { passive: true })
    leaveSurface.addEventListener('pointerleave', onLeave)
  }

  const pose: PanePose = { x: 0, z: 0, yaw: 0 }
  let raf = 0
  let last = 0
  let frames = 0
  let slowSum = 0
  let slowCount = 0
  let degraded = 0
  let firstFrame = true
  let onScreen = true
  let disposed = false

  function frame(now: number) {
    raf = requestAnimationFrame(frame)
    const ms = last ? now - last : 16.7
    last = now
    const dt = Math.min(ms / 1000, 0.05)
    time += dt

    centre = approach(centre, active, 8, dt)
    tiltX = approach(tiltX, aimX, 6, dt)
    tiltY = approach(tiltY, aimY, 6, dt)
    stack.rotation.y = (opts.still ? 0 : Math.sin((time / 24) * Math.PI * 2) * IDLE_YAW) + tiltX * (opts.still ? 2 * DEG : TILT_YAW)
    stack.rotation.x = tiltY * (opts.still ? DEG : TILT_PITCH)
    const progress = dollyAt < 0 ? 0 : Math.min(1, (now - dollyAt) / 450)
    const dolly = 1 - (1 - progress) ** 3
    stack.rotation.y *= 1 - dolly
    stack.rotation.x *= 1 - dolly

    for (let i = 0; i < count; i++) {
      const pane = panes[i]
      pane.weight = approach(pane.weight, i === active ? 1 : 0, 8, dt)
      if (!opts.still) pane.phase += dt * (0.25 + 0.75 * pane.weight)
      panePose(i, centre, count, pose)
      const m = pane.mesh
      m.position.x = pose.x
      m.position.z = pose.z + FORWARD * pane.weight
      m.position.y = opts.still ? 0 : Math.sin(((time - i * 0.6) / 8) * Math.PI * 2) * PANE_H * PANE_SCALE * 0.02
      m.rotation.y = pose.yaw
    }

    panePose(active, centre, count, pose)
    const targetX = pose.x * stack.scale.x
    const targetZ = (pose.z + FORWARD) * stack.scale.x
    const distance = PANE_H * PANE_SCALE * stack.scale.x / (2 * Math.tan(FOV * Math.PI / 360))
    camera.position.set(targetX * dolly, -Math.sin(PITCH) * CAMERA_Z * (1 - dolly), Math.cos(PITCH) * CAMERA_Z * (1 - dolly) + (targetZ + distance) * dolly)
    camera.lookAt([targetX * dolly, 0, targetZ * dolly])
    u.uTime.value = time
    u.uLoss.value = opts.lostSignal ? Math.min(1, time / 1.2) : 0
    stack.updateMatrixWorld()
    camera.updateMatrixWorld()

    // Camera-space Z includes stack tilt and the dolly. More negative is farther away.
    const view = camera.viewMatrix
    for (const pane of panes) {
      const world = pane.mesh.worldMatrix
      pane.depth = view[2] * world[12] + view[6] * world[13] + view[10] * world[14] + view[14]
    }
    for (let i = 1; i < count; i++) {
      const p = order[i]
      let j = i - 1
      while (j >= 0 && order[j].depth > p.depth) {
        order[j + 1] = order[j]
        j--
      }
      order[j + 1] = p
    }

    renderer.setViewport(width * dpr, height * dpr)
    gl.clear(gl.COLOR_BUFFER_BIT)
    for (let i = 0; i < count; i++) {
      glass?.snapshot()
      order[i].mesh.draw({ camera })
    }

    if (firstFrame) {
      firstFrame = false
      opts.onFirstFrame?.()
    }
    if (progress === 1 && finishDolly) {
      window.clearTimeout(dollyTimeout)
      finishDolly()
      finishDolly = undefined
    }
    watch(ms)
  }

  function watch(ms: number) {
    frames++
    if (frames <= WARMUP) return
    slowSum += ms
    slowCount++
    if (slowCount < WINDOW) return
    const mean = slowSum / slowCount
    slowSum = 0
    slowCount = 0
    if (glass && mean > 16.7) {
      for (const pane of panes) pane.mesh.program = program
      glass.dispose()
      glass = undefined
      host.dataset.glass = 'degraded'
      return
    }
    if (eligibleForGlass && !glassRequested && degraded === 0 && mean <= 16.7) {
      glassRequested = true
      import('./glass').then(({ createGlass }) => {
        if (disposed || degraded > 0) return
        glass = createGlass(gl, program)
        for (const pane of panes) pane.mesh.program = glass.program
        host.dataset.glass = 'active'
      }).catch(() => { host.dataset.glass = 'unavailable' })
    }
    if (mean <= SLOW_FRAME_MS) return
    if (degraded === 0 && dpr > 1) {
      degraded = 1
      dpr = 1
      resize()
      return
    }
    degraded = 2
    opts.onDegrade?.()
  }

  function start() {
    if (raf || disposed || !onScreen || document.hidden) return
    last = 0
    raf = requestAnimationFrame(frame)
  }
  function stop() {
    cancelAnimationFrame(raf)
    raf = 0
  }

  const io = new IntersectionObserver((entries) => {
    onScreen = entries[entries.length - 1].isIntersecting
    if (onScreen) start()
    else stop()
  })
  io.observe(host)
  function onVisibility() {
    if (document.hidden) stop()
    else start()
  }
  document.addEventListener('visibilitychange', onVisibility)
  start()
  loadPoster(active)

  return {
    tuneIn() {
      dollyAt = performance.now()
      return new Promise<void>((resolve) => {
        finishDolly?.()
        finishDolly = resolve
        // Navigation must finish even if the tab becomes hidden during the move.
        dollyTimeout = window.setTimeout(() => { finishDolly?.(); finishDolly = undefined }, 550)
      })
    },
    resetCamera() { dollyAt = -1 },
    setActive(index) {
      if (index === active || index < 0 || index >= count) return
      fromWave = opts.waves[active] ?? active
      panes[index].phase = panes[active].phase
      active = index
      loadPoster(index)
      tuneAt = time
    },
    setTints,
    dispose() {
      if (disposed) return
      disposed = true
      window.clearTimeout(dollyTimeout)
      finishDolly?.()
      stop()
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      pointerSurface.removeEventListener('pointermove', onPointer as EventListener)
      leaveSurface.removeEventListener('pointerleave', onLeave)
      for (const image of pendingImages.values()) { image.onload = null; image.onerror = null }
      for (const texture of textures.values()) gl.deleteTexture(texture.texture)
      gl.deleteTexture(blank.texture)
      glass?.dispose()
      program.remove()
      geometry.remove()
      if (!gl.isContextLost()) gl.getExtension('WEBGL_lose_context')?.loseContext()
    },
  }
}
