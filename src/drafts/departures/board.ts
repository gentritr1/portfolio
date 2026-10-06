import { Geometry, Mesh, Program, Renderer } from "ogl";

const vertex = `
attribute vec2 position;
attribute vec2 center;
attribute float rotation;
uniform vec2 grid;
varying vec2 disc;
varying float face;
varying float tilt;
varying float wear;
void main(){
  disc=position;
  float seed=fract(sin(dot(center,vec2(12.9898,78.233)))*43758.5453);
  wear=seed;
  float angle=rotation*3.14159265+(seed-.5)*.06;
  face=cos(angle);
  tilt=sin(angle);
  vec2 local=vec2(position.x,position.y*face)*.44;
  vec2 point=(center+local)/grid;
  gl_Position=vec4(point.x*2.-1.,1.-point.y*2.,0.,1.);
}`;
const fragment = `
precision highp float;
varying vec2 disc;
varying float face;
varying float tilt;
varying float wear;
void main(){
  float r=length(disc);
  if(r>1.)discard;
  float side=face>=0.?1.:-1.;
  vec3 paint=face>=0.?vec3(.961,.769,0.)*(.94+.08*wear):vec3(.062,.060,.055);
  // Screen space: x right, y down, z toward the viewer. The disc turns about a horizontal axle.
  vec3 normal=normalize(side*vec3(0.,-tilt,face)+vec3(disc.x,disc.y*abs(face),0.)*.3);
  vec3 light=normalize(vec3(-.35,-.6,.72));
  float diffuse=max(dot(normal,light),0.);
  float gloss=pow(max(dot(normal,normalize(light+vec3(0.,0.,1.))),0.),40.);
  vec3 ink=paint*(.4+.7*diffuse)+gloss*(face>=0.?.2:.08);
  ink*=1.-.42*smoothstep(.78,1.,r);
  ink*=1.-.2*(1.-smoothstep(.0,.07,abs(disc.y)));
  gl_FragColor=vec4(ink,1.);
}`;

export interface Board {
  /** Sends a new frame. `delays` holds each disc's start offset in ms. */
  set: (bits: Uint8Array, delays?: Float32Array, instant?: boolean) => void;
  /** Turns single discs now, without restarting the others. */
  paint: (cells: number[], on: boolean) => void;
  renderer: "instanced" | "canvas";
  dispose: () => void;
}

/** One instanced quad per disc, one sleeping spring per disc, one draw call. */
export function createBoard(
  host: HTMLElement,
  cols: number,
  rows: number,
  onFlips: (count: number, pan: number) => void,
  reduced: boolean,
  allowWebGL = true,
  lit = false,
): Board {
  const count = cols * rows;
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  host.append(canvas);
  const state = new Float32Array(count).fill(lit ? 0 : 1),
    speed = new Float32Array(count),
    target = new Float32Array(count).fill(lit ? 0 : 1),
    start = new Float32Array(count),
    jitter = new Float32Array(count).map(() => Math.random() * 12);
  let renderer: Renderer | undefined,
    geometry: Geometry | undefined,
    program: Program | undefined,
    mesh: Mesh | undefined;
  let ctx: CanvasRenderingContext2D | null = null,
    drawing = canvas,
    frame = 0,
    visible = true,
    disposed = false,
    previous = 0;
  try {
    const context = allowWebGL
      ? canvas.getContext("webgl2", { antialias: false, alpha: false, powerPreference: "low-power" })
      : null;
    if (context) {
      renderer = new Renderer({ canvas, dpr: Math.min(devicePixelRatio, 2), alpha: false, antialias: false });
      const gl = renderer.gl;
      gl.clearColor(18 / 255, 18 / 255, 18 / 255, 1);
      const centers = new Float32Array(count * 2);
      for (let i = 0; i < count; i++) {
        centers[i * 2] = (i % cols) + 0.5;
        centers[i * 2 + 1] = Math.floor(i / cols) + 0.5;
      }
      geometry = new Geometry(gl, {
        position: { size: 2, data: new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]) },
        center: { size: 2, data: centers, instanced: 1 },
        rotation: { size: 1, data: state, instanced: 1 },
      });
      program = new Program(gl, {
        vertex,
        fragment,
        uniforms: { grid: { value: [cols, rows] } },
        depthTest: false,
        depthWrite: false,
        cullFace: false,
      });
      mesh = new Mesh(gl, { geometry, program });
    }
  } catch {
    renderer = undefined;
  }
  if (!renderer) switchToCanvas();
  function switchToCanvas() {
    const next = document.createElement("canvas");
    next.setAttribute("aria-hidden", "true");
    if (drawing.isConnected) drawing.replaceWith(next);
    else host.append(next);
    drawing = next;
    ctx = drawing.getContext("2d");
    host.dataset.renderer = "canvas";
  }
  if (renderer) host.dataset.renderer = "instanced";

  function draw() {
    if (renderer && mesh && geometry) {
      geometry.attributes.rotation.needsUpdate = true;
      renderer.render({ scene: mesh });
    } else if (ctx) {
      const cw = drawing.width / cols,
        ch = drawing.height / rows;
      ctx.fillStyle = "#121212";
      ctx.fillRect(0, 0, drawing.width, drawing.height);
      for (const lit of [false, true]) {
        ctx.fillStyle = lit ? "#f5c400" : "#1c1b19";
        ctx.beginPath();
        for (let i = 0; i < count; i++) {
          const face = Math.cos(state[i] * Math.PI);
          if (face >= 0 !== lit) continue;
          const x = ((i % cols) + 0.5) * cw,
            y = (Math.floor(i / cols) + 0.5) * ch,
            ry = Math.max(0.2, ch * 0.44 * Math.abs(face));
          ctx.moveTo(x + cw * 0.44, y);
          ctx.ellipse(x, y, cw * 0.44, ry, 0, 0, Math.PI * 2);
        }
        ctx.fill();
      }
    }
  }
  function request() {
    if (!frame && visible && !document.hidden && !disposed) frame = requestAnimationFrame(tick);
  }
  function tick(now: number) {
    frame = 0;
    const elapsed = Math.min((now - previous) / 1000 || 1 / 60, 0.1),
      steps = Math.max(1, Math.ceil(elapsed / (1 / 60))),
      dt = elapsed / steps;
    previous = now;
    let active = false,
      flips = 0,
      column = 0;
    for (let i = 0; i < count; i++) {
      if (now < start[i]) {
        active = true;
        continue;
      }
      if (Math.abs(target[i] - state[i]) < 0.0008 && Math.abs(speed[i]) < 0.004) {
        state[i] = target[i];
        speed[i] = 0;
        continue;
      }
      const before = state[i];
      for (let step = 0; step < steps; step++) {
        speed[i] += ((target[i] - state[i]) * 210 - speed[i] * 24) * dt;
        state[i] += speed[i] * dt;
      }
      if (before < 0.5 !== state[i] < 0.5) {
        flips++;
        column += i % cols;
      }
      active = true;
    }
    draw();
    if (flips) onFlips(flips, (column / flips / (cols - 1)) * 2 - 1);
    if (active) request();
  }
  function resize() {
    const box = host.getBoundingClientRect();
    if (renderer) renderer.setSize(box.width, box.height);
    else {
      const scale = Math.min(devicePixelRatio, 2);
      drawing.width = Math.max(1, Math.round(box.width * scale));
      drawing.height = Math.max(1, Math.round(box.height * scale));
    }
    draw();
  }
  const observer = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible) {
      previous = performance.now();
      request();
    } else {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  });
  observer.observe(host);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  function visibility() {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else {
      previous = performance.now();
      request();
    }
  }
  function lost(event: Event) {
    event.preventDefault();
    renderer = undefined;
    geometry = undefined;
    program = undefined;
    mesh = undefined;
    switchToCanvas();
    resize();
  }
  canvas.addEventListener("webglcontextlost", lost);
  document.addEventListener("visibilitychange", visibility);
  resize();
  return {
    get renderer() {
      return renderer ? ("instanced" as const) : ("canvas" as const);
    },
    set(bits, delays, instant = false) {
      const now = performance.now();
      for (let i = 0; i < count; i++) {
        const next = bits[i] ? 0 : 1;
        if (next !== target[i]) start[i] = now + (delays ? delays[i] : 0) + jitter[i];
        target[i] = next;
        if (instant || reduced) {
          state[i] = next;
          speed[i] = 0;
          start[i] = 0;
        }
      }
      if (instant || reduced) draw();
      else {
        previous = now;
        request();
      }
    },
    paint(cells, on) {
      const now = performance.now();
      for (const i of cells) {
        if (i < 0 || i >= count) continue;
        target[i] = on ? 0 : 1;
        start[i] = now;
        if (reduced) {
          state[i] = target[i];
          speed[i] = 0;
        }
      }
      if (reduced) draw();
      else request();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      canvas.removeEventListener("webglcontextlost", lost);
      geometry?.remove();
      if (program) {
        program.remove();
        renderer?.gl.deleteShader(program.vertexShader);
        renderer?.gl.deleteShader(program.fragmentShader);
      }
      renderer?.gl.getExtension("WEBGL_lose_context")?.loseContext();
      drawing.remove();
      canvas.remove();
    },
  };
}
