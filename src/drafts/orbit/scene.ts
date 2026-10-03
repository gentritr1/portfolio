import { Mesh, Plane, Program, Renderer, Texture } from 'ogl'
import type { OrbitProject } from './data'

const vertex = `attribute vec3 position; attribute vec2 uv; varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}`
const fragment = `
precision highp float;
uniform sampler2D uImage;
uniform vec4 uCrop;
uniform vec3 uMaterial;
uniform float uTime;
uniform float uAspect;
varying vec2 vUv;
float smoothJoin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.0,1.0);return mix(b,a,h)-k*h*(1.0-h);}
float shape(vec3 p){
  float breath=sin(uTime*1.05)*.045;
  float a=length(p-vec3(-.08,.04,0.0))-(1.05+breath);
  float b=length(p-vec3(.70+sin(uTime*.7)*.10,.36+cos(uTime*.65)*.10,.12))-.49;
  float c=length(p-vec3(-.59+cos(uTime*.6)*.09,-.64,.16+sin(uTime*.7)*.12))-.43;
  return smoothJoin(smoothJoin(a,b,.42),c,.4);
}
vec3 normalAt(vec3 p){vec2 e=vec2(.003,0.0);return normalize(vec3(shape(p+e.xyy)-shape(p-e.xyy),shape(p+e.yxy)-shape(p-e.yxy),shape(p+e.yyx)-shape(p-e.yyx)));}
void main(){
  vec2 p=(vUv-.5)*2.0; p.x*=uAspect;
  vec3 origin=vec3(0.0,0.0,3.9);
  vec3 ray=normalize(vec3(p*1.22,-2.7));
  float travel=0.0; float distance=0.0; bool hit=false;
  for(int i=0;i<48;i++){
    distance=shape(origin+ray*travel);
    if(distance<.002){hit=true;break;}
    travel+=distance*.86;
    if(travel>7.0)break;
  }
  if(!hit){gl_FragColor=vec4(0.0);return;}
  vec3 point=origin+ray*travel;
  vec3 n=normalAt(point);
  vec3 refracted=refract(ray,n,1.0/1.38);
  vec2 imageUv=clamp(.5+point.xy*.34+refracted.xy*.13,.012,.988);
  imageUv=vec2(uCrop.x+imageUv.x*uCrop.z,1.0-uCrop.y-(1.0-imageUv.y)*uCrop.w);
  vec3 photo=texture2D(uImage,imageUv).rgb;
  vec3 light=normalize(vec3(-.65,1.0,1.4));
  vec3 view=-ray;
  float diffuse=.48+.52*max(0.0,dot(n,light));
  float fresnel=pow(1.0-max(0.0,dot(n,view)),2.3);
  float spec=pow(max(0.0,dot(n,normalize(light+view))),70.0);
  float rim=pow(max(0.0,dot(n,normalize(vec3(1.0,-.2,.45)+view))),100.0);
  vec3 colour=mix(photo,uMaterial,.18)*diffuse;
  colour=mix(colour,uMaterial*.70+vec3(.16,.18,.23),fresnel*.72);
  colour+=spec*.95+rim*vec3(.30,.35,.45);
  gl_FragColor=vec4(colour,1.0);
}`

export interface OrbitScene { setImage: (image: HTMLImageElement, project: OrbitProject) => void; setPaused: (value: boolean) => void; dispose: () => void }

export function createOrbit(host: HTMLElement, image: HTMLImageElement, project: OrbitProject, onOrbit: (time: number) => void, onReady: () => void, onUnavailable: () => void): OrbitScene | null {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('webgl2', { alpha: true, antialias: false, powerPreference: 'low-power' })
  if (!context) { onUnavailable(); return null }
  let disposed = false, paused = false, visible = true, verified = false
  let frame = 0, last = 0, elapsed = 0, slow = 0, fadeUntil = 0
  let fence: WebGLSync | null = null
  let geometry: Plane | undefined, program: Program | undefined, texture: Texture | undefined
  let resizeObserver: ResizeObserver | undefined, intersectionObserver: IntersectionObserver | undefined
  let request = () => {}
  function dispose() {
    if (disposed) return
    disposed = true
    cancelAnimationFrame(frame)
    resizeObserver?.disconnect(); intersectionObserver?.disconnect()
    document.removeEventListener('visibilitychange', visibility)
    canvas.removeEventListener('webglcontextlost', lost)
    if (!context!.isContextLost()) {
      if (fence) context!.deleteSync(fence)
      geometry?.remove()
      if (program) { program.remove(); context!.deleteShader(program.vertexShader); context!.deleteShader(program.fragmentShader) }
      if (texture) context!.deleteTexture(texture.texture)
      context!.getExtension('WEBGL_lose_context')?.loseContext()
    }
    canvas.remove()
  }
  function unavailable() { dispose(); onUnavailable() }
  function lost(event: Event) { event.preventDefault(); unavailable() }
  function visibility() { if (document.hidden) { cancelAnimationFrame(frame); frame = 0 } else { last = 0; request() } }
  canvas.addEventListener('webglcontextlost', lost)
  try {
    const renderer = new Renderer({ canvas, alpha: true, antialias: false, depth: false, dpr: 1, powerPreference: 'low-power' })
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)
    geometry = new Plane(gl, { width: 2, height: 2 })
    texture = new Texture(gl, { image, generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR })
    program = new Program(gl, { vertex, fragment, depthTest: false, depthWrite: false, uniforms: {
      uImage: { value: texture }, uCrop: { value: [...project.crop] }, uMaterial: { value: [...project.material] }, uTime: { value: 0 }, uAspect: { value: 1 },
    } })
    const mesh = new Mesh(gl, { geometry, program })
    if (!gl.getProgramParameter(program.program, gl.LINK_STATUS)) throw new Error('Orbit shader unavailable')
    texture.update(0)
    if (context.getError() !== context.NO_ERROR || context.isContextLost()) throw new Error('Orbit texture unavailable')
    const render = (now: number) => {
      frame = 0
      if (disposed || !visible || document.hidden) return
      const interval = last ? now - last : 16
      const dt = Math.min(interval / 1000, .05)
      if (last && interval > 45 && !paused) slow++
      else slow = Math.max(0, slow - 1)
      if (slow > 24) { unavailable(); return }
      last = now
      if (!paused) elapsed += dt
      program!.uniforms.uTime.value = elapsed
      try {
        renderer.render({ scene: mesh })
        if (!paused) onOrbit(elapsed)
        if (!verified) {
          if (!fence) { fence = context.fenceSync(context.SYNC_GPU_COMMANDS_COMPLETE, 0); if (!fence) throw new Error('Orbit frame unavailable'); context.flush(); request(); return }
          const result = context.clientWaitSync(fence, 0, 0)
          if (result === context.TIMEOUT_EXPIRED) { request(); return }
          if (result === context.WAIT_FAILED || context.isContextLost()) throw new Error('Orbit frame failed')
          context.deleteSync(fence); fence = null; verified = true; fadeUntil = now + 500; onReady()
        }
      } catch { unavailable(); return }
      // A focused project control freezes movement, but its newly selected
      // texture must keep repainting through the presentation cross-fade.
      if (!paused || now < fadeUntil) request()
    }
    request = () => { if (!disposed && visible && !document.hidden && !frame) frame = requestAnimationFrame(render) }
    const resize = () => {
      if (disposed) return
      const rect = host.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      renderer.setSize(rect.width, rect.height)
      program!.uniforms.uAspect.value = rect.width / rect.height
      last = 0
      request()
    }
    host.appendChild(canvas)
    resizeObserver = new ResizeObserver(resize); resizeObserver.observe(host)
    intersectionObserver = new IntersectionObserver(entries => {
      visible = entries[0]?.isIntersecting ?? false
      if (visible) { last = 0; request() } else { cancelAnimationFrame(frame); frame = 0 }
    }); intersectionObserver.observe(host)
    document.addEventListener('visibilitychange', visibility)
    resize()
    return {
      setImage(nextImage, nextProject) {
        if (disposed || !nextImage.complete || !nextImage.naturalWidth) return
        try {
          if (fence) { context.deleteSync(fence); fence = null }
          verified = false
          texture!.image = nextImage
          texture!.needsUpdate = true
          texture!.update(0)
          if (context.getError() !== context.NO_ERROR || context.isContextLost()) throw new Error('Orbit replacement texture unavailable')
          program!.uniforms.uCrop.value = [...nextProject.crop]
          program!.uniforms.uMaterial.value = [...nextProject.material]
          request()
        } catch { unavailable() }
      },
      setPaused(value) { paused = value; last = 0; request() },
      dispose,
    }
  } catch { unavailable(); return null }
}
