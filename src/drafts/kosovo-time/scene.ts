/** A camera that looks level. Every panel stands upright on the ground in the plane z = 0 and faces the camera,
 * so it projects to an exact rectangle and its screenshot stays a sharp DOM image.
 * Units are CSS px at the panel plane. x points right, y up, z toward the camera. */
export interface Camera {
  /** Screen x of the view axis, in px from the ground box's left edge. */
  cx: number;
  /** Screen y of the horizon, in px from the ground box's top edge. */
  horizon: number;
  /** Camera height above the ground. */
  height: number;
  /** Camera distance from the panel plane. */
  distance: number;
}
export interface Panel {
  /** Centre, relative to the view axis. */
  x: number;
  half: number;
  h: number;
}
type Vec = [number, number, number];

export function project(c: Camera, [x, y, z]: Vec): [number, number] {
  const k = c.distance / (c.distance - z);
  return [c.cx + x * k, c.horizon + (c.height - y) * k];
}

/** The camera for a ground box that holds panels standing on one base line. */
export function cameraFor(box: DOMRect, panels: DOMRect[]): { camera: Camera; panels: Panel[] } {
  const top = Math.min(...panels.map((p) => p.top));
  const base = Math.max(...panels.map((p) => p.bottom));
  const tallest = Math.max(...panels.map((p) => p.height));
  const horizon = Math.max(0, top - box.top - Math.min(24, tallest * 0.08));
  const camera: Camera = {
    cx: box.width / 2,
    horizon,
    height: base - box.top - horizon,
    distance: tallest * 4.8,
  };
  return {
    camera,
    panels: panels.map((p) => ({
      x: p.left - box.left + p.width / 2 - camera.cx,
      half: p.width / 2,
      h: p.height,
    })),
  };
}

/** Clip a ground polygon to the half-space in front of the camera. */
function clipNear(points: Vec[], limit: number): Vec[] {
  const out: Vec[] = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[i],
      b = points[(i + 1) % points.length];
    const ina = a[2] <= limit,
      inb = b[2] <= limit;
    if (ina) out.push(a);
    if (ina !== inb) {
      const t = (limit - a[2]) / (b[2] - a[2]);
      out.push([a[0] + (b[0] - a[0]) * t, 0, limit]);
    }
  }
  return out;
}

/** The shadow of an upright panel on the ground: its base, and its top edge moved along the sun ray to y = 0. */
export function shadowPoints(c: Camera, p: Panel, ray: Vec): string {
  if (ray[1] < 0.0005) return "";
  const reach = Math.min(p.h / ray[1], p.h * 400);
  const dx = -ray[0] * reach,
    dz = -ray[2] * reach;
  const a: Vec = [p.x - p.half, 0, 0],
    b: Vec = [p.x + p.half, 0, 0];
  const quad = clipNear(
    [a, b, [b[0] + dx, 0, dz], [a[0] + dx, 0, dz]],
    c.distance * 0.97,
  );
  return quad
    .map((v) => project(c, v).map((n) => n.toFixed(1)).join(","))
    .join(" ");
}

/* ---------- Screen light: one CPU downsample per source (copied from lab move 01) ---------- */

export type Cells = Float32Array;
const samples = new Map<string, Promise<Cells>>();
/** The screenshot's colours as a 4 x 4 grid of linear RGB, top row first. */
export function sampleScreen(src: string): Promise<Cells> {
  if (!samples.has(src)) {
    samples.set(
      src,
      new Promise<Cells>((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          const mip = document.createElement("canvas");
          mip.width = mip.height = 4;
          const context = mip.getContext("2d", { willReadFrequently: true });
          if (!context) return reject(new Error("Sampling unavailable"));
          context.drawImage(image, 0, 0, 4, 4);
          const data = context.getImageData(0, 0, 4, 4).data;
          const cells = new Float32Array(48);
          for (let i = 0; i < 16; i++)
            for (let k = 0; k < 3; k++) {
              const v = data[i * 4 + k] / 255;
              cells[i * 3 + k] = v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
            }
          resolve(cells);
        };
        image.onerror = () => reject(new Error("Screenshot unavailable"));
        image.src = src;
      }),
    );
  }
  return samples.get(src)!;
}
/** Average linear colour of the lower half of the screen, which faces the ground. */
export function lowerAverage(cells: Cells): Vec {
  const out: Vec = [0, 0, 0];
  for (let i = 8; i < 16; i++) for (let k = 0; k < 3; k++) out[k] += cells[i * 3 + k] / 8;
  return out;
}

/** Most luminance the screens may add to the ground, so text on it keeps 4.5:1. */
export const GLOW_LIMIT = 0.045;

/* ---------- The lit ground, rendered per pixel ---------- */

const vertex = `attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}`;
const fragment = `#extension GL_OES_standard_derivatives : enable
precision highp float;
uniform vec2 uSize;uniform float uDpr;
uniform vec4 uCam;
uniform vec3 uPanel;
uniform vec3 uRay;
uniform float uDirect,uGlow,uGlowLimit,uFade;
uniform vec3 uLit,uShade;
uniform vec3 uCells[16];
vec3 encode(vec3 c){return mix(c*12.92,1.055*pow(c,vec3(1./2.4))-.055,step(.0031308,c));}
void main(){
 vec2 p=vec2(gl_FragCoord.x,uSize.y*uDpr-gl_FragCoord.y)/uDpr;
 float dy=p.y-uCam.y;
 vec3 col=uLit;
 float touched=0.;
 if(dy>.5){
  float d=uCam.w*uCam.z/dy;
  float z=uCam.w-d;
  float x=(p.x-uCam.x)*d/uCam.w;
  float u0=x-uPanel.x;
  float shadow=0.;
  if(uDirect>0.&&abs(uRay.z)>1e-4){
   float t=-z/uRay.z;
   if(t>0.){
    vec3 hit=vec3(x,0.,z)+t*uRay;
    float u=hit.x-uPanel.x,v=hit.y;
    // The sun is a disc 0.53 degrees wide: the penumbra grows with the distance to the panel.
    float r=t*.00465/max(abs(uRay.z),.08);
    float ru=max(r,fwidth(u)),rv=max(r,fwidth(v));
    float cu=clamp((uPanel.y-abs(u))/ru*.5+.5,0.,1.);
    float cv=clamp(v/rv*.5+.5,0.,1.)*clamp((uPanel.z-v)/rv*.5+.5,0.,1.);
    shadow=cu*cv*uDirect;
   }
  }
  // The panel hides part of the sky from the ground near its base.
  float s=max(abs(z),.5);
  float wall=.5*(1.-s/sqrt(s*s+uPanel.z*uPanel.z));
  float span=clamp((atan((uPanel.y-u0)/s)+atan((uPanel.y+u0)/s))/3.14159265,0.,1.);
  float occluded=clamp(wall*span*1.15,0.,1.);
  float shade=max(shadow,occluded*.6);
  float fade=smoothstep(uSize.y,uSize.y-uFade,p.y);
  col=mix(uLit,uShade,shade*fade);
  touched=shade*fade;
  if(uGlow>0.&&z>0.){
   vec3 e=vec3(0.);
   for(int i=0;i<16;i++){
    float column=float(i-(i/4)*4),row=float(i/4);
    vec3 l=vec3(uPanel.x-uPanel.y+(column+.5)*uPanel.y*.5-x,uPanel.z*(1.-(row+.5)*.25),-z);
    float dd=dot(l,l),il=inversesqrt(dd);
    e+=uCells[i]*(z*il)*(l.y*il)/dd;
   }
   vec3 add=e*(uPanel.y*.5*uPanel.z*.25)/3.14159265*uGlow*fade;
   float lum=dot(add,vec3(.2126,.7152,.0722));
   if(lum>uGlowLimit)add*=uGlowLimit/lum;
   col+=add;
   touched+=lum*40.;
  }
 }
 vec3 outc=encode(clamp(col,0.,1.));
 float n=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5;
 outc+=n/255.*step(.002,touched);
 gl_FragColor=vec4(outc,1.);
}`;

export interface GroundFrame {
  camera: Camera;
  panel: Panel;
  ray: Vec;
  direct: number;
  glow: number;
  lit: Vec;
  shade: Vec;
  cells: Cells;
  fade: number;
}
export interface GroundRenderer {
  draw(frame: GroundFrame): void;
  resize(width: number, height: number): void;
  dispose(): void;
}

export function createGround(canvas: HTMLCanvasElement, lost: () => void): GroundRenderer | null {
  let gl: WebGLRenderingContext | null = null;
  try {
    gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
  } catch {
    gl = null;
  }
  if (!gl || !gl.getExtension("OES_standard_derivatives")) return null;
  const g = gl;
  const compile = (type: number, source: string) => {
    const shader = g.createShader(type)!;
    g.shaderSource(shader, source);
    g.compileShader(shader);
    return g.getShaderParameter(shader, g.COMPILE_STATUS) ? shader : null;
  };
  const vs = compile(g.VERTEX_SHADER, vertex),
    fs = compile(g.FRAGMENT_SHADER, fragment);
  if (!vs || !fs) return null;
  const program = g.createProgram()!;
  g.attachShader(program, vs);
  g.attachShader(program, fs);
  g.linkProgram(program);
  if (!g.getProgramParameter(program, g.LINK_STATUS)) return null;
  g.useProgram(program);
  const buffer = g.createBuffer();
  g.bindBuffer(g.ARRAY_BUFFER, buffer);
  g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW);
  const position = g.getAttribLocation(program, "position");
  g.enableVertexAttribArray(position);
  g.vertexAttribPointer(position, 2, g.FLOAT, false, 0, 0);
  const u = (name: string) => g.getUniformLocation(program, name);
  const at = {
    size: u("uSize"), dpr: u("uDpr"), cam: u("uCam"), panel: u("uPanel"), ray: u("uRay"),
    direct: u("uDirect"), glow: u("uGlow"), limit: u("uGlowLimit"), fade: u("uFade"),
    lit: u("uLit"), shade: u("uShade"), cells: u("uCells"),
  };
  let width = 1,
    height = 1,
    dpr = 1,
    dead = false;
  const onLost = (event: Event) => {
    event.preventDefault();
    dead = true;
    lost();
  };
  canvas.addEventListener("webglcontextlost", onLost);
  return {
    resize(w, h) {
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      width = Math.max(1, w);
      height = Math.max(1, h);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      g.viewport(0, 0, canvas.width, canvas.height);
    },
    draw(f) {
      if (dead) return;
      g.uniform2f(at.size, width, height);
      g.uniform1f(at.dpr, canvas.width / width);
      g.uniform4f(at.cam, f.camera.cx, f.camera.horizon, f.camera.height, f.camera.distance);
      g.uniform3f(at.panel, f.panel.x, f.panel.half, f.panel.h);
      g.uniform3f(at.ray, f.ray[0], f.ray[1], f.ray[2]);
      g.uniform1f(at.direct, f.direct);
      g.uniform1f(at.glow, f.glow);
      g.uniform1f(at.limit, GLOW_LIMIT);
      g.uniform1f(at.fade, f.fade);
      g.uniform3fv(at.lit, f.lit);
      g.uniform3fv(at.shade, f.shade);
      g.uniform3fv(at.cells, f.cells);
      g.drawArrays(g.TRIANGLES, 0, 3);
    },
    dispose() {
      canvas.removeEventListener("webglcontextlost", onLost);
      g.deleteBuffer(buffer);
      g.deleteProgram(program);
      g.deleteShader(vs);
      g.deleteShader(fs);
      g.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
