import { Mesh, Plane, Program, Renderer, Texture } from 'ogl'
import type { WallAsset } from './wallAssets'

export interface WallHoverScene {
  show(host: HTMLElement, image: HTMLImageElement, asset: WallAsset, x: number, y: number): void
  move(x: number, y: number): void
  hide(): void
  dispose(): void
}

const vertex = `
attribute vec3 position;
attribute vec2 uv;
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`
const fragment = `
precision highp float;
uniform sampler2D uImage;
uniform vec2 uCover;
uniform vec2 uOrigin;
uniform vec2 uPointer;
uniform float uAspect;
uniform float uReveal;
varying vec2 vUv;
void main() {
  vec2 delta = vUv - uPointer;
  float distance = length(delta * vec2(uAspect, 1.0));
  float lens = 1.0 - smoothstep(0.0, 0.28, distance);
  vec2 bent = vUv - delta * lens * 0.09;
  vec2 uv = clamp(bent * uCover + uOrigin, 0.002, 0.998);
  vec3 colour = texture2D(uImage, uv).rgb;
  vec2 pixel = floor(gl_FragCoord.xy / 2.0);
  float threshold = fract(dot(pixel, vec2(0.75487766, 0.56984029)));
  vec3 dither = floor(colour * 5.0 + threshold) / 5.0;
  gl_FragColor = vec4(mix(dither, colour, smoothstep(0.0, 1.0, uReveal)), 1.0);
}
`

/** One canvas, one plane and one texture for the hovered image only. No idle render loop. */
export function createWallHover(): WallHoverScene {
  const canvas = document.createElement('canvas')
  canvas.setAttribute('aria-hidden', 'true')
  const context = canvas.getContext('webgl2', { alpha: false, antialias: false, powerPreference: 'low-power' })
  if (!context) throw new Error('WebGL2 unavailable')
  const renderer = new Renderer({ canvas, dpr: Math.min(devicePixelRatio || 1, 1.5), alpha: false, antialias: false, depth: false })
  const gl = renderer.gl
  const geometry = new Plane(gl, { width: 2, height: 2 })
  const texture = new Texture(gl, { generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR })
  const program = new Program(gl, {
    vertex, fragment, depthTest: false, depthWrite: false,
    uniforms: {
      uImage: { value: texture }, uCover: { value: [1, 1] }, uOrigin: { value: [0, 0] },
      uPointer: { value: [0.5, 0.5] }, uAspect: { value: 1 }, uReveal: { value: 0 },
    },
  })
  const mesh = new Mesh(gl, { geometry, program })
  let host: HTMLElement | null = null
  let image: HTMLImageElement | null = null
  let asset: WallAsset | null = null
  let visible = false
  let inView = true
  let disposed = false
  let raf = 0
  let began = 0
  let lastFrame = 0
  let slow = 0
  let degraded = false
  const target = [0.5, 0.5]
  const pointer = [0.5, 0.5]

  function resize() {
    if (!host || !image || !asset) return
    const width = host.clientWidth
    const height = host.clientHeight
    if (!width || !height) return
    renderer.setSize(width, height)
    const aspect = width / height
    const photoAspect = image.naturalWidth / image.naturalHeight
    const zoom = asset.zoom ?? 1
    const cover = [Math.min(1, aspect / photoAspect) / zoom, Math.min(1, photoAspect / aspect) / zoom]
    const origin = [asset.position?.[0] ?? 0.5, 1 - (asset.position?.[1] ?? 0.5)]
    program.uniforms.uCover.value = cover
    program.uniforms.uOrigin.value = [(1 - cover[0]) * origin[0], (1 - cover[1]) * origin[1]]
    program.uniforms.uAspect.value = aspect
    start()
  }

  function frame(now: number) {
    raf = 0
    if (disposed || degraded || !visible || !inView || document.hidden || !host) return
    if (lastFrame && now - lastFrame > 34) slow++
    lastFrame = now
    if (slow > 12) { degraded = true; hide(); return }
    const reveal = Math.min(1, (now - began) / 280)
    const dx = target[0] - pointer[0]
    const dy = target[1] - pointer[1]
    pointer[0] += dx * 0.22
    pointer[1] += dy * 0.22
    program.uniforms.uPointer.value = pointer
    program.uniforms.uReveal.value = reveal
    renderer.render({ scene: mesh })
    canvas.style.visibility = 'visible'
    if (reveal < 1 || Math.abs(dx) + Math.abs(dy) > 0.0008) raf = requestAnimationFrame(frame)
    else lastFrame = 0
  }

  function start() {
    if (!raf && visible && inView && !document.hidden && !disposed && !degraded) raf = requestAnimationFrame(frame)
  }
  function stop() { cancelAnimationFrame(raf); raf = 0; lastFrame = 0 }
  function hide() {
    visible = false
    stop()
    canvas.style.visibility = 'hidden'
    observer.disconnect()
    resizeObserver.disconnect()
  }
  function move(x: number, y: number) {
    if (!host || !visible) return
    const box = host.getBoundingClientRect()
    target[0] = Math.max(0, Math.min(1, (x - box.left) / box.width))
    target[1] = Math.max(0, Math.min(1, 1 - (y - box.top) / box.height))
    start()
  }
  const observer = new IntersectionObserver((entries) => {
    inView = entries.at(-1)?.isIntersecting ?? false
    if (inView) start()
    else stop()
  })
  const resizeObserver = new ResizeObserver(resize)
  function visibility() { if (document.hidden) stop(); else start() }
  function contextLost(event: Event) { event.preventDefault(); degraded = true; hide() }
  document.addEventListener('visibilitychange', visibility)
  canvas.addEventListener('webglcontextlost', contextLost)

  return {
    show(nextHost, nextImage, nextAsset, x, y) {
      if (disposed || degraded) return
      hide()
      host = nextHost
      image = nextImage
      asset = nextAsset
      host.appendChild(canvas)
      texture.image = image
      texture.needsUpdate = true
      visible = true
      inView = true
      began = performance.now()
      slow = 0
      move(x, y)
      pointer[0] = target[0]
      pointer[1] = target[1]
      resize()
      observer.observe(host)
      resizeObserver.observe(host)
      start()
    },
    move,
    hide,
    dispose() {
      if (disposed) return
      hide()
      disposed = true
      document.removeEventListener('visibilitychange', visibility)
      canvas.removeEventListener('webglcontextlost', contextLost)
      gl.deleteTexture(texture.texture)
      program.remove()
      geometry.remove()
      canvas.remove()
      if (!gl.isContextLost()) gl.getExtension('WEBGL_lose_context')?.loseContext()
    },
  }
}
