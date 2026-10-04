import { Mesh, Plane, Program, Renderer, Texture } from "ogl";

const vertex = `
attribute vec3 position;
attribute vec2 uv;
uniform float progress;
uniform float direction;
varying vec2 pageUv;
varying float lighting;
void main(){
  pageUv=uv;
  float x=direction>0. ? uv.x : 1.-uv.x;
  float radius=.14;
  float axis=1.-progress*1.55;
  float distance=max(0.,x-axis);
  float angle=min(distance/radius,3.14159265);
  float curled=axis+sin(angle)*radius-max(0.,distance-3.14159265*radius);
  float horizontal=distance>0. ? curled : x;
  float depth=radius*(1.-cos(angle));
  horizontal=direction>0. ? horizontal : 1.-horizontal;
  float y=uv.y*2.-1.;
  // A small perspective lift makes the cylinder's height visible without a camera rig.
  gl_Position=vec4(horizontal*2.-1.,y*(1.+depth*.12),-depth*.3,1.);
  lighting=.79+.21*abs(cos(angle));
}`;
const fragment = `
precision highp float;
uniform sampler2D frontPage;
uniform sampler2D backPage;
varying vec2 pageUv;
varying float lighting;
void main(){
  vec4 paper=gl_FrontFacing ? texture2D(frontPage,pageUv) : texture2D(backPage,vec2(1.-pageUv.x,pageUv.y));
  gl_FragColor=vec4(paper.rgb*lighting,paper.a);
}`;

export interface PageCurl {
  start(
    front: HTMLCanvasElement,
    back: HTMLCanvasElement,
    direction: number,
    done: (completed: boolean) => void,
    momentum?: number,
  ): void;
  reverse(): void;
  finish(): void;
  dispose(): void;
}

/** One 64-segment leaf and exactly two texture objects. Sleeps between page turns. */
export function createPageCurl(host: HTMLElement): PageCurl | null {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  const context =
    canvas.getContext("webgl2", { alpha: true }) ??
    canvas.getContext("webgl", { alpha: true });
  if (!context) return null;
  let renderer: Renderer;
  try {
    renderer = new Renderer({
      canvas,
      alpha: true,
      antialias: true,
      dpr: Math.min(devicePixelRatio, 1.5),
      powerPreference: "low-power",
    });
  } catch {
    return null;
  }
  const gl = renderer.gl;
  if (!gl) return null;
  const front = new Texture(gl, {
    generateMipmaps: false,
    minFilter: gl.LINEAR,
    magFilter: gl.LINEAR,
  });
  const back = new Texture(gl, {
    generateMipmaps: false,
    minFilter: gl.LINEAR,
    magFilter: gl.LINEAR,
  });
  const geometry = new Plane(gl, {
    width: 2,
    height: 2,
    widthSegments: 64,
    heightSegments: 1,
  });
  const program = new Program(gl, {
    vertex,
    fragment,
    transparent: true,
    cullFace: false,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      progress: { value: 0 },
      direction: { value: 1 },
      frontPage: { value: front },
      backPage: { value: back },
    },
  });
  const mesh = new Mesh(gl, { geometry, program });
  host.append(canvas);
  let frame = 0;
  let value = 0;
  let velocity = 0;
  let from = 0;
  let initialVelocity = 0;
  let destination = 1;
  let elapsed = 0;
  let previous = 0;
  let visible = true;
  let active = false;
  let disposed = false;
  let contextLost = false;
  let completion: ((completed: boolean) => void) | null = null;
  const duration = 0.5;

  function draw() {
    program.uniforms.progress.value = value;
    renderer.render({ scene: mesh });
  }
  function request() {
    if (!frame && active && visible && !document.hidden && !disposed)
      frame = requestAnimationFrame(tick);
  }
  function stop(completed: boolean) {
    active = false;
    cancelAnimationFrame(frame);
    frame = 0;
    host.style.opacity = "0";
    const callback = completion;
    completion = null;
    callback?.(completed);
  }
  function tick(time: number) {
    frame = 0;
    const dt = previous ? Math.min((time - previous) / 1000, 0.04) : 1 / 60;
    previous = time;
    elapsed += dt;
    const t = Math.min(1, elapsed / duration);
    const t2 = t * t;
    const t3 = t2 * t;
    const next =
      (2 * t3 - 3 * t2 + 1) * from +
      (t3 - 2 * t2 + t) * initialVelocity * duration +
      (-2 * t3 + 3 * t2) * destination;
    velocity = (next - value) / Math.max(0.001, dt);
    value = Math.max(0, Math.min(1, next));
    draw();
    if (t >= 1) stop(destination === 1);
    else request();
  }
  function visibility() {
    previous = 0;
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else request();
  }
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    visibility();
  });
  observer.observe(host);
  document.addEventListener("visibilitychange", visibility);
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    contextLost = true;
    stop(true);
  });
  return {
    start(first, second, direction, done, momentum = 0) {
      if (disposed) return;
      if (contextLost) throw new Error("Page renderer context lost");
      if (active) stop(true);
      renderer.setSize(
        Math.max(1, host.clientWidth),
        Math.max(1, host.clientHeight),
      );
      front.image = first;
      front.needsUpdate = true;
      back.image = second;
      back.needsUpdate = true;
      program.uniforms.direction.value = direction;
      value = 0;
      from = 0;
      velocity = momentum;
      initialVelocity = momentum;
      elapsed = 0;
      previous = 0;
      destination = 1;
      completion = done;
      active = true;
      host.style.opacity = "1";
      draw();
      request();
    },
    reverse() {
      if (!active) return;
      destination = destination === 1 ? 0 : 1;
      from = value;
      initialVelocity = velocity;
      elapsed = 0;
      previous = 0;
      request();
    },
    finish() {
      if (active) stop(true);
    },
    dispose() {
      disposed = true;
      active = false;
      completion = null;
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      gl.deleteTexture(front.texture);
      gl.deleteTexture(back.texture);
      geometry.remove();
      program.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    },
  };
}
