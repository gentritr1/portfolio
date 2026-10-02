import { Camera, Mesh, Plane, Program, Renderer, Transform } from 'ogl'
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
  onFirstFrame?: () => void
  onDegrade?: () => void
}

export interface SignalScene {
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
      uOnAir: { value: 0 },
      uTime: { value: 0 },
    },
  })
  const u = program.uniforms
  const geometry = new Plane(gl, {
    width: PANE_W + 0.04,
    height: PANE_H + 0.04,
  })

  const stack = new Transform()
  const count = opts.tints.panes.length
  let active = opts.active
  let centre = active
  let tuneAt = -1
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
      u.uTint.value = pane.tint
      u.uDim.value = 0.4 + 0.6 * pane.weight
      u.uTune.value = tune
      u.uAmp.value = 0.12 * (1 + 1.4 * tune)
      u.uPhase.value = pane.phase
      u.uWave.value = wave
      u.uOnAir.value = i === active ? Math.max(0, pane.weight * 2 - 1) * (1 - tune) : 0
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
  if (fine) {
    window.addEventListener('pointermove', onPointer, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
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
    stack.rotation.y = Math.sin((time / 24) * Math.PI * 2) * IDLE_YAW + tiltX * TILT_YAW
    stack.rotation.x = tiltY * TILT_PITCH

    for (let i = 0; i < count; i++) {
      const pane = panes[i]
      pane.weight = approach(pane.weight, i === active ? 1 : 0, 8, dt)
      pane.phase += dt * (0.25 + 0.75 * pane.weight)
      panePose(i, centre, count, pose)
      const m = pane.mesh
      m.position.x = pose.x
      m.position.z = pose.z + FORWARD * pane.weight
      m.position.y = Math.sin(((time - i * 0.6) / 8) * Math.PI * 2) * PANE_H * PANE_SCALE * 0.02
      m.rotation.y = pose.yaw
      pane.depth = m.position.z
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

    u.uTime.value = time
    stack.updateMatrixWorld()
    camera.updateMatrixWorld()
    renderer.setViewport(width * dpr, height * dpr)
    gl.clear(gl.COLOR_BUFFER_BIT)
    for (let i = 0; i < count; i++) order[i].mesh.draw({ camera })

    if (firstFrame) {
      firstFrame = false
      opts.onFirstFrame?.()
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

  return {
    setActive(index) {
      if (index === active || index < 0 || index >= count) return
      active = index
      tuneAt = time
    },
    setTints,
    dispose() {
      disposed = true
      stop()
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pointermove', onPointer)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      program.remove()
      geometry.remove()
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    },
  }
}
