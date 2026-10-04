import { Geometry, Mesh, Program, Renderer } from "ogl";
import { DISC_COUNT } from "./bitmap";

const vertex = `
attribute vec2 position;
attribute vec2 center;
attribute float rotation;
uniform vec2 grid;
varying vec2 disc;
varying float face;
varying float light;
void main(){
  disc=position;
  float angle=rotation*3.14159265;
  face=cos(angle);
  light=.72+.28*abs(cos(angle-.30));
  vec2 local=vec2(position.x,position.y*face)*.43;
  vec2 point=(center+local)/grid;
  gl_Position=vec4(point.x*2.-1.,1.-point.y*2.,0.,1.);
}`;
const fragment = `
precision highp float;
varying vec2 disc;
varying float face;
varying float light;
void main(){
  float r=length(disc);
  if(r>1.)discard;
  vec3 front=vec3(.961,.769,0.);
  vec3 back=vec3(.055);
  vec3 ink=mix(back,front,step(0.,face));
  float edge=1.-smoothstep(.84,1.,r);
  ink*=light*(.65+.35*edge);
  // The axle and bevel stay physical at every flip angle.
  ink*=1.-.10*(1.-smoothstep(.0,.055,abs(disc.y)));
  gl_FragColor=vec4(ink,1.);
}`;
export interface Board {
  set: (bitmap: Uint8Array, instant?: boolean, seed?: [number, number]) => void;
  pause: (paused: boolean) => void;
  dispose: () => void;
}

/** 6,912 instanced quads, with a sleeping spring per disc and one draw call. */
export function createBoard(
  host: HTMLElement,
  cols: number,
  rows: number,
  onFlips: (count: number) => void,
  reduced: boolean,
): Board {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  host.append(canvas);
  const state = new Float32Array(DISC_COUNT).fill(1),
    speed = new Float32Array(DISC_COUNT),
    target = new Float32Array(DISC_COUNT).fill(1),
    delay = new Float32Array(DISC_COUNT);
  let renderer: Renderer | undefined,
    geometry: Geometry | undefined,
    program: Program | undefined,
    mesh: Mesh | undefined;
  let ctx: CanvasRenderingContext2D | null = null,
    drawingCanvas = canvas,
    frame = 0,
    paused = false,
    visible = true,
    disposed = false,
    previous = 0;
  try {
    const context = canvas.getContext("webgl2", {
      antialias: false,
      alpha: false,
      powerPreference: "low-power",
    });
    if (context) {
      renderer = new Renderer({
        canvas,
        dpr: Math.min(devicePixelRatio, 1.5),
        alpha: false,
        antialias: false,
      });
      const gl = renderer.gl;
      gl.clearColor(18 / 255, 18 / 255, 18 / 255, 1);
      const centers = new Float32Array(DISC_COUNT * 2);
      for (let i = 0; i < DISC_COUNT; i++) {
        centers[i * 2] = (i % cols) + 0.5;
        centers[i * 2 + 1] = Math.floor(i / cols) + 0.5;
      }
      geometry = new Geometry(gl, {
        position: {
          size: 2,
          data: new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        },
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
      host.dataset.renderer = "instanced";
    }
  } catch {
    renderer = undefined;
  }
  if (!renderer) {
    canvas.remove();
    drawingCanvas = document.createElement("canvas");
    drawingCanvas.setAttribute("aria-hidden", "true");
    host.append(drawingCanvas);
    ctx = drawingCanvas.getContext("2d");
    host.dataset.renderer = "canvas";
  }
  function draw() {
    if (renderer && mesh && geometry) {
      geometry.attributes.rotation.needsUpdate = true;
      renderer.render({ scene: mesh });
    } else if (ctx) {
      const cw = drawingCanvas.width / cols,
        ch = drawingCanvas.height / rows;
      ctx.fillStyle = "#121212";
      ctx.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);
      for (let i = 0; i < DISC_COUNT; i++) {
        const face = Math.cos(state[i] * Math.PI);
        ctx.fillStyle = face >= 0 ? "#f5c400" : "#0e0e0e";
        ctx.beginPath();
        ctx.ellipse(
          ((i % cols) + 0.5) * cw,
          (Math.floor(i / cols) + 0.5) * ch,
          cw * 0.42,
          Math.max(0.1, ch * 0.42 * Math.abs(face)),
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }
  }
  function request() {
    if (!frame && !paused && visible && !document.hidden && !disposed)
      frame = requestAnimationFrame(tick);
  }
  function tick(now: number) {
    frame = 0;
    const dt = Math.min((now - previous) / 1000 || 1 / 60, 1 / 30);
    previous = now;
    let active = false,
      flips = 0;
    for (let i = 0; i < DISC_COUNT; i++) {
      if (now < delay[i]) {
        active = true;
        continue;
      }
      const distance = target[i] - state[i];
      if (Math.abs(distance) < 0.0008 && Math.abs(speed[i]) < 0.004) {
        state[i] = target[i];
        speed[i] = 0;
        continue;
      }
      const before = state[i];
      speed[i] += (distance * 210 - speed[i] * 24) * dt;
      state[i] += speed[i] * dt;
      if (before < 0.5 !== state[i] < 0.5) flips++;
      active = true;
    }
    draw();
    if (flips) onFlips(flips);
    if (active) request();
  }
  function resize() {
    const box = host.getBoundingClientRect();
    if (renderer) renderer.setSize(box.width, box.height);
    else {
      drawingCanvas.width = Math.max(
        1,
        Math.round(box.width * Math.min(devicePixelRatio, 1.5)),
      );
      drawingCanvas.height = Math.max(
        1,
        Math.round(box.height * Math.min(devicePixelRatio, 1.5)),
      );
    }
    draw();
    request();
  }
  const observer = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      if (visible) {
        previous = performance.now();
        request();
      } else {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    },
    { threshold: 0 },
  );
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
    drawingCanvas = document.createElement("canvas");
    drawingCanvas.setAttribute("aria-hidden", "true");
    canvas.replaceWith(drawingCanvas);
    ctx = drawingCanvas.getContext("2d");
    host.dataset.renderer = "canvas";
    resize();
  }
  canvas.addEventListener("webglcontextlost", lost);
  document.addEventListener("visibilitychange", visibility);
  resize();
  return {
    set(bitmap, instant = false, seed = [0, 0]) {
      const now = performance.now();
      for (let i = 0; i < DISC_COUNT; i++) {
        target[i] = bitmap[i] ? 0 : 1;
        delay[i] =
          now +
          (Math.abs((i % cols) - seed[0]) +
            Math.abs(Math.floor(i / cols) - seed[1])) *
            3.8;
        if (instant || reduced) {
          state[i] = target[i];
          speed[i] = 0;
          delay[i] = 0;
        }
      }
      if (instant || reduced) draw();
      else {
        previous = now;
        request();
      }
    },
    pause(value) {
      paused = value;
      if (value) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else {
        previous = performance.now();
        request();
      }
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
      drawingCanvas.remove();
      canvas.remove();
    },
  };
}
