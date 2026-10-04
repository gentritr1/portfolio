import { Mesh, Plane, Program, Renderer, Texture } from 'ogl'

const vertex = `
attribute vec3 position;
attribute vec2 uv;
uniform vec4 uRect;
uniform vec2 uViewport;
uniform float uSkew;
varying vec2 vUv;
void main(){
  vUv=uv;
  vec2 point=vec2(uRect.x+uv.x*uRect.z,uRect.y+(1.0-uv.y)*uRect.w);
  point.x+=(uv.y-.5)*uRect.w*tan(radians(uSkew));
  gl_Position=vec4(point.x/uViewport.x*2.0-1.0,1.0-point.y/uViewport.y*2.0,0.0,1.0);
}`
const fragment = `
precision highp float;
uniform sampler2D uImage;
uniform vec2 uCover;
uniform vec2 uOrigin;
uniform vec2 uPointer;
uniform float uReveal;
uniform float uAspect;
varying vec2 vUv;
float bayer2(vec2 p){vec2 c=mod(p,2.0);return 2.0*c.x+3.0*c.y-4.0*c.x*c.y;}
void main(){
  vec2 delta=vUv-uPointer;
  float distance=length(delta*vec2(uAspect,1.0));
  float lens=1.0-smoothstep(0.0,.35,distance);
  vec2 uv=clamp((vUv-delta*lens*.045)*uCover+uOrigin,.001,.999);
  vec3 colour=texture2D(uImage,uv).rgb;
  vec2 pixel=floor(gl_FragCoord.xy/3.0);
  float threshold=(4.0*bayer2(pixel)+bayer2(floor(pixel/2.0))+.5)/16.0;
  float light=dot(colour,vec3(.2126,.7152,.0722));
  vec3 dither=mix(vec3(.10,.09,.09),vec3(.96,.93,.85),step(threshold,light));
  float radius=uReveal*(length(vec2(uAspect,1.0))+.16);
  float reveal=(1.0-smoothstep(radius-.09,radius+.09,distance))*smoothstep(0.0,.09,uReveal);
  gl_FragColor=vec4(mix(dither,colour,reveal),1.0);
}`

export interface WallScene {
  activate: (slug: string, x?: number, y?: number) => void
  leave: () => void
  refresh: (duration?: number) => void
  setPaused: (value: boolean) => void
  dispose: () => void
}

interface Tile { slug: string; host: HTMLElement; image: HTMLImageElement; texture: Texture; program: Program; mesh: Mesh }

/** A single transparent canvas paints only decoded, visible image tiles. */
export function createWallScene(root: HTMLElement): WallScene | null {
  const canvas = document.createElement('canvas')
  canvas.className = 'draft-wall-gl'
  canvas.setAttribute('aria-hidden', 'true')
  canvas.style.visibility = 'hidden'
  const context = canvas.getContext('webgl2', { alpha: true, antialias: false, powerPreference: 'low-power' })
  if (!context) return null
  let disposed = false, visible = true, paused = false, verified = false
  let frame = 0, last = 0, velocity = 0, previousScroll = window.scrollY
  let movingUntil = performance.now() + 2100, activeSince = 0
  let active = '', pointerX = .5, pointerY = .5, pointerVelocity = 0
  let fence: WebGLSync | null = null
  let observer: IntersectionObserver | undefined
  let resizeObserver: ResizeObserver | undefined
  let geometry: Plane | undefined
  const tiles = new Map<string, Tile>()
  const pending = new Set<HTMLImageElement>()
  const imageListeners: Array<() => void> = []
  let request = () => {}
  const began = performance.now()

  function dispose() {
    if (disposed) return
    disposed = true
    cancelAnimationFrame(frame)
    observer?.disconnect()
    resizeObserver?.disconnect()
    imageListeners.forEach(clean => clean())
    window.removeEventListener('scroll', scroll)
    window.removeEventListener('resize', resize)
    document.removeEventListener('visibilitychange', visibility)
    canvas.removeEventListener('webglcontextlost', lost)
    if (!context!.isContextLost()) {
      if (fence) context!.deleteSync(fence)
      tiles.forEach(tile => {
        context!.deleteTexture(tile.texture.texture)
        tile.program.remove()
        context!.deleteShader(tile.program.vertexShader)
        context!.deleteShader(tile.program.fragmentShader)
      })
      geometry?.remove()
      context!.getExtension('WEBGL_lose_context')?.loseContext()
    }
    canvas.remove()
  }
  function lost(event: Event) { event.preventDefault(); dispose() }
  function scroll() {
    const next = window.scrollY
    velocity = Math.max(-1.5, Math.min(1.5, (next - previousScroll) / 80))
    previousScroll = next
    movingUntil = performance.now() + 260
    request()
  }
  function visibility() { if (document.hidden) { cancelAnimationFrame(frame); frame = 0 } else { last = 0; request() } }
  let resize = () => {}
  canvas.addEventListener('webglcontextlost', lost)
  try {
    const renderer = new Renderer({ canvas, alpha: true, antialias: false, depth: false, dpr: Math.min(devicePixelRatio || 1, 1.5), powerPreference: 'low-power' })
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)
    geometry = new Plane(gl, { width: 2, height: 2, widthSegments: 8, heightSegments: 8 })

    async function add(host: HTMLElement, image: HTMLImageElement) {
      const slug = host.dataset.wallImage!
      if (tiles.has(slug) || pending.has(image) || !image.complete || !image.naturalWidth) return
      pending.add(image)
      try {
        await image.decode()
        if (disposed) return
        const texture = new Texture(gl, { image, generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR })
        const program = new Program(gl, { vertex, fragment, depthTest: false, depthWrite: false, uniforms: {
          uImage: { value: texture }, uRect: { value: [0, 0, 1, 1] }, uViewport: { value: [innerWidth, innerHeight] },
          uCover: { value: [1, 1] }, uOrigin: { value: [0, 0] }, uPointer: { value: [.5, .5] },
          uReveal: { value: 1 }, uAspect: { value: 1 }, uSkew: { value: 0 },
        } })
        const mesh = new Mesh(gl, { geometry: geometry!, program })
        const tile = { slug, host, image, texture, program, mesh }
        tiles.set(slug, tile)
        if (!gl.getProgramParameter(program.program, gl.LINK_STATUS)) throw new Error('Wall shader link failed')
        texture.update(0)
        if (context!.getError() !== context!.NO_ERROR || context!.isContextLost()) throw new Error('Wall texture unavailable')
        request()
      } catch { if (!disposed) dispose() }
      finally { pending.delete(image) }
    }
    root.querySelectorAll<HTMLElement>('[data-wall-image]').forEach(host => {
      const image = host.querySelector<HTMLImageElement>('[data-wall-full]')
      if (!image) return
      const loaded = () => { void add(host, image) }
      image.addEventListener('load', loaded)
      imageListeners.push(() => image.removeEventListener('load', loaded))
      void add(host, image)
    })

    const render = (now: number) => {
      frame = 0
      if (disposed || !visible || document.hidden) return
      const dt = last ? Math.min((now - last) / 1000, .05) : 1 / 60
      last = now
      velocity *= Math.pow(.95, dt * 60)
      pointerVelocity *= Math.pow(.95, dt * 60)
      gl.clear(gl.COLOR_BUFFER_BIT)
      let count = 0
      try {
        tiles.forEach(tile => {
          const box = tile.host.getBoundingClientRect()
          if (box.bottom < 0 || box.top > innerHeight || !box.width || !box.height) return
          const aspect = box.width / box.height
          const photoAspect = tile.image.naturalWidth / tile.image.naturalHeight
          const zoom = Number(tile.host.dataset.zoom || 1)
          const cover = [Math.min(1, aspect / photoAspect) / zoom, Math.min(1, photoAspect / aspect) / zoom]
          const origin = [Number(tile.host.dataset.originX ?? .5), 1 - Number(tile.host.dataset.originY ?? .5)]
          const uniforms = tile.program.uniforms
          uniforms.uRect.value = [box.left, box.top, box.width, box.height]
          uniforms.uViewport.value = [innerWidth, innerHeight]
          uniforms.uCover.value = cover
          uniforms.uOrigin.value = [(1 - cover[0]) * origin[0], (1 - cover[1]) * origin[1]]
          uniforms.uAspect.value = aspect
          const hovering = active === tile.slug
          uniforms.uPointer.value = hovering ? [pointerX, pointerY] : [.35, .5]
          uniforms.uReveal.value = paused ? 1 : Math.max(0, Math.min(1, hovering ? (now - activeSince) / 700 : (now - began - 100) / 1400))
          uniforms.uSkew.value = paused ? 0 : Math.max(-3, Math.min(3, (velocity + (hovering ? pointerVelocity : 0)) * 2))
          renderer.render({ scene: tile.mesh, clear: false })
          count++
        })
        if (count && !verified) {
          if (!fence) { fence = context.fenceSync(context.SYNC_GPU_COMMANDS_COMPLETE, 0); if (!fence) throw new Error('Wall first frame unavailable'); context.flush(); request(); return }
          const result = context.clientWaitSync(fence, 0, 0)
          if (result === context.TIMEOUT_EXPIRED) { request(); return }
          if (result === context.WAIT_FAILED || context.isContextLost()) throw new Error('Wall first frame failed')
          context.deleteSync(fence); fence = null; verified = true; canvas.style.visibility = 'visible'
        }
      } catch { dispose(); return }
      if (!paused && (now < movingUntil || Math.abs(velocity) + Math.abs(pointerVelocity) > .002 || (active && now - activeSince < 750))) request()
    }
    request = () => { if (!disposed && visible && !document.hidden && !frame) frame = requestAnimationFrame(render) }
    resize = () => { if (disposed) return; canvas.style.visibility = 'hidden'; verified = false; renderer.setSize(innerWidth, innerHeight); movingUntil = performance.now() + 120; request() }
    root.appendChild(canvas)
    observer = new IntersectionObserver(entries => {
      visible = entries[0]?.isIntersecting ?? false
      canvas.style.display = visible ? '' : 'none'
      if (visible) request(); else { cancelAnimationFrame(frame); frame = 0 }
    })
    observer.observe(root)
    resizeObserver = new ResizeObserver(() => { movingUntil = performance.now() + 120; request() })
    resizeObserver.observe(root)
    window.addEventListener('scroll', scroll, { passive: true })
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', visibility)
    resize()
    return {
      activate(slug, x = .5, y = .5) { if (slug !== active) { activeSince = performance.now(); pointerVelocity = 0 } else pointerVelocity = Math.max(-1.5, Math.min(1.5, (x - pointerX) * 12)); active = slug; pointerX = x; pointerY = 1 - y; request() },
      leave() { active = ''; request() },
      refresh(duration = 600) { movingUntil = performance.now() + duration; request() },
      setPaused(value) { paused = value; request() },
      dispose,
    }
  } catch { dispose(); return null }
}
