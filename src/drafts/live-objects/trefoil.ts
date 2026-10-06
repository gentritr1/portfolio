/*
 * The FORM trefoil, ported from the owner's FORM repository (dist/app.js, baseline renderer):
 * the same parametric knot, mesh density, shaders and material values. One shape only.
 */

export interface Material {
  id: "copper" | "chrome" | "porcelain";
  name: string;
  color: [number, number, number];
  metal: number;
  roughness: number;
}

export const materials: Material[] = [
  { id: "copper", name: "Copper", color: [0.72, 0.3, 0.13], metal: 1, roughness: 0.22 },
  { id: "chrome", name: "Chrome", color: [0.72, 0.79, 0.83], metal: 1, roughness: 0.14 },
  { id: "porcelain", name: "Porcelain", color: [0.84, 0.85, 0.79], metal: 0, roughness: 0.38 },
];

const TAU = Math.PI * 2;
const NU = 192;
const NV = 64;
const REST = { x: -0.38, y: 0.35 };

type Vec3 = [number, number, number];
const normalize = (v: Vec3): Vec3 => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

export function knotCurve(t: number): Vec3 {
  const r = 2 + Math.cos(3 * t);
  return [r * Math.cos(2 * t) * 0.47, r * Math.sin(2 * t) * 0.47, Math.sin(3 * t) * 0.47];
}

function surface(u: number, v: number): Vec3 {
  const c = knotCurve(u);
  const next = knotCurve(u + 0.001);
  const tangent = normalize([next[0] - c[0], next[1] - c[1], next[2] - c[2]]);
  const b = normalize(cross(tangent, [0, 0, 1]));
  const n = cross(b, tangent);
  const tube = 0.26 + 0.018 * Math.sin(u * 6);
  return [0, 1, 2].map((i) => c[i] + tube * (Math.cos(v) * n[i] + Math.sin(v) * b[i])) as Vec3;
}

function geometry() {
  const positions = new Float32Array((NU + 1) * (NV + 1) * 3);
  const normals = new Float32Array(positions.length);
  let k = 0;
  for (let i = 0; i <= NU; i++)
    for (let j = 0; j <= NV; j++) {
      const u = (i / NU) * TAU;
      const v = (j / NV) * TAU;
      const p = surface(u, v);
      const du = surface(u + 0.0003, v);
      const dv = surface(u, v + 0.0003);
      let n = normalize(
        cross([du[0] - p[0], du[1] - p[1], du[2] - p[2]], [dv[0] - p[0], dv[1] - p[1], dv[2] - p[2]]),
      );
      if (Math.hypot(...n) < 0.5) n = normalize(p);
      positions.set(p, k);
      normals.set(n, k);
      k += 3;
    }
  const indices = new Uint16Array(NU * NV * 6);
  k = 0;
  for (let i = 0; i < NU; i++)
    for (let j = 0; j < NV; j++) {
      const a = i * (NV + 1) + j;
      const b = a + NV + 1;
      indices.set([a, b, a + 1, a + 1, b, b + 1], k);
      k += 6;
    }
  return { positions, normals, indices };
}

const vertexSource = `
attribute vec3 aPosition, aNormal;
uniform float uX, uY, uAspect, uScale;
varying vec3 vNormal, vPosition, vLocal;
vec3 rotation(vec3 p) {
 float cx=cos(uX), sx=sin(uX), cy=cos(uY), sy=sin(uY);
 p=vec3(p.x,p.y*cx-p.z*sx,p.y*sx+p.z*cx);
 return vec3(p.x*cy+p.z*sy,p.y,-p.x*sy+p.z*cy);
}
void main(){
 vec3 p=rotation(aPosition)*uScale;
 vPosition=p;vNormal=rotation(aNormal);vLocal=aPosition;
 float z=5.9-p.z;
 gl_Position=vec4(p.x*3.05/uAspect,p.y*3.05,z*.97-.25,z);
}`;

const fragmentSource = `
precision highp float;
varying vec3 vNormal,vPosition,vLocal;
uniform vec3 uColor;
uniform float uMetal,uRoughness,uLight;
const float PI=3.14159265;
vec3 environment(vec3 r){
 float a=uLight; r.xz=mat2(cos(a),-sin(a),sin(a),cos(a))*r.xz;
 vec3 env=mix(vec3(.075,.085,.095),vec3(.52,.57,.62),smoothstep(-.5,1.,r.y));
 float key=pow(max(dot(r,normalize(vec3(-.8,.9,1.2))),0.),9.);
 float panel=pow(max(dot(r,normalize(vec3(1.2,.2,1.))),0.),32.);
 float rim=pow(max(dot(r,normalize(vec3(-1.,.15,-.6))),0.),23.);
 float lower=pow(max(dot(r,normalize(vec3(.25,-1.,1.2))),0.),9.);
 return env+vec3(4.5,4.2,3.8)*key+vec3(4.,4.5,5.)*panel+vec3(1.7,2.,2.3)*rim+vec3(.52,.55,.6)*lower;
}
vec3 directLight(vec3 n,vec3 v,vec3 l,vec3 radiance,vec3 f0){
 vec3 h=normalize(v+l);float nl=max(dot(n,l),0.);float nv=max(dot(n,v),.001);
 float nh=max(dot(n,h),0.);float vh=max(dot(v,h),0.);
 float a=uRoughness*uRoughness;float a2=a*a;float denom=nh*nh*(a2-1.)+1.;
 float D=a2/max(PI*denom*denom,.001);
 float k=pow(uRoughness+1.,2.)/8.;float G=(nv/(nv*(1.-k)+k))*(nl/(nl*(1.-k)+k));
 vec3 F=f0+(1.-f0)*pow(1.-vh,5.);
 vec3 spec=D*G*F/max(4.*nv*nl,.001);
 vec3 diffuse=(1.-F)*(1.-uMetal)*uColor/PI;
 return (diffuse+spec)*radiance*nl;
}
vec3 filmic(vec3 c){return clamp((c*(2.51*c+.03))/(c*(2.43*c+.59)+.14),0.,1.);}
void main(){
 vec3 n=normalize(vNormal);if(!gl_FrontFacing)n=-n;
 vec3 view=normalize(vec3(0.,0.,5.9)-vPosition);
 float grain=sin(vLocal.y*510.+vLocal.x*7.)*.004*uMetal;
 n=normalize(n+vec3(grain,0.,grain*.5));
 vec3 f0=mix(vec3(.04),uColor,uMetal);
 float nv=max(dot(n,view),0.);vec3 F=f0+(1.-f0)*pow(1.-nv,5.);
 vec3 r=reflect(-view,n);
 vec3 env=environment(r);
 vec3 color=env*F*(1.-uRoughness*.38);
 color+=uColor*(1.-uMetal)*(.18+.24*max(n.y,0.));
 vec3 key=normalize(vec3(-2.*cos(uLight),3.,3.+sin(uLight)));
 color+=directLight(n,view,key,vec3(2.1,1.95,1.8),f0);
 color+=directLight(n,view,normalize(vec3(3.,.8,2.)),vec3(.8,1.,1.3),f0);
 float occlusion=.78+.22*smoothstep(-1.2,.8,vPosition.y);color*=occlusion;
 color=max(color,vec3(0.));
 if(!(color.r<1e4&&color.g<1e4&&color.b<1e4))color=vec3(0.);
 gl_FragColor=vec4(pow(filmic(color),vec3(1./2.2)),1.);
}`;

/** cubic-bezier(.65, 0, .35, 1), the story curve, solved for x. */
function story(progress: number) {
  const x = Math.max(0, Math.min(1, progress));
  let t = x;
  for (let i = 0; i < 6; i++) {
    const bx = 3 * (1 - t) ** 2 * t * 0.65 + 3 * (1 - t) * t * t * 0.35 + t ** 3;
    const dx = 3 * (1 - t) ** 2 * 0.65 + 6 * (1 - t) * t * (0.35 - 0.65) + 3 * t * t * (1 - 0.35);
    if (dx > 1e-5) t = Math.max(0, Math.min(1, t - (bx - x) / dx));
  }
  return 3 * (1 - t) * t * t + t ** 3;
}

export interface Knot {
  setMaterial(index: number): void;
  spinOnce(): void;
  destroy(): void;
}

/**
 * Draws on demand: a frame is requested only while something moves, and never while the
 * canvas is off screen or the tab is hidden. Returns null when WebGL cannot start.
 */
export function createKnot(
  canvas: HTMLCanvasElement,
  options: { reduced: () => boolean; onLost: () => void; onSettle?: () => void },
): Knot | null {
  const gl = canvas.getContext("webgl", { alpha: true, antialias: true, powerPreference: "low-power" });
  if (!gl) return null;
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) throw Error("shader");
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(shader) ?? "shader");
    return shader;
  };
  let program: WebGLProgram;
  const mesh = geometry();
  try {
    const p = gl.createProgram();
    if (!p) return null;
    const vs = compile(gl.VERTEX_SHADER, vertexSource);
    const fs = compile(gl.FRAGMENT_SHADER, fragmentSource);
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
    program = p;
  } catch {
    return null;
  }
  const uniform = (name: string) => gl.getUniformLocation(program, name);
  const u = {
    x: uniform("uX"),
    y: uniform("uY"),
    aspect: uniform("uAspect"),
    scale: uniform("uScale"),
    color: uniform("uColor"),
    metal: uniform("uMetal"),
    roughness: uniform("uRoughness"),
    light: uniform("uLight"),
  };
  for (const [name, data] of [
    ["aPosition", mesh.positions],
    ["aNormal", mesh.normals],
  ] as const) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    const location = gl.getAttribLocation(program, name);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 0, 0);
  }
  const index = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);
  gl.useProgram(program);
  gl.enable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);
  gl.clearColor(0, 0, 0, 0);

  const s = {
    x: REST.x,
    y: REST.y,
    tx: REST.x,
    ty: REST.y,
    velocity: 0,
    dragging: false,
    spin: null as null | { from: number; start: number },
    color: [...materials[0].color] as number[],
    metal: materials[0].metal,
    roughness: materials[0].roughness,
    from: null as null | { color: number[]; metal: number; roughness: number; start: number; to: Material },
    width: 0,
    height: 0,
    visible: false,
    frame: 0,
    last: 0,
    lost: false,
  };

  const request = () => {
    if (!s.frame && s.visible && !s.lost && !document.hidden) s.frame = requestAnimationFrame(render);
  };

  function render(time: number) {
    s.frame = 0;
    if (!s.visible || s.lost || document.hidden || !gl) return;
    const reduced = options.reduced();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(s.width * dpr);
    const h = Math.round(s.height * dpr);
    if (!w || !h) return;
    const dt = s.last ? Math.max(0, Math.min((time - s.last) / 1000, 0.05)) : 0.016;
    s.last = time;

    if (s.spin) {
      const t = (time - s.spin.start) / 2400;
      s.ty = s.spin.from + TAU * story(t);
      if (t >= 1) s.spin = null;
    }
    if (!s.dragging && !reduced && Math.abs(s.velocity) > 0.005) {
      s.ty += s.velocity * dt;
      s.velocity *= Math.exp(-3 * dt);
    } else if (!s.dragging) s.velocity = 0;
    const smooth = reduced ? 1 : 1 - Math.exp(-15 * dt);
    s.x += (s.tx - s.x) * smooth;
    s.y += (s.ty - s.y) * smooth;
    if (s.from) {
      const t = reduced ? 1 : Math.max(0, Math.min(1, (time - s.from.start) / 280));
      const e = 1 - (1 - t) ** 3;
      const { color, metal, roughness, to } = s.from;
      s.color = color.map((c, i) => Math.max(0, Math.min(1, c + (to.color[i] - c) * e)));
      s.metal = Math.max(0, Math.min(1, metal + (to.metal - metal) * e));
      s.roughness = Math.max(0.06, Math.min(1, roughness + (to.roughness - roughness) * e));
      if (t >= 1) s.from = null;
    }

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniform1f(u.x, s.x);
    gl.uniform1f(u.y, s.y);
    gl.uniform1f(u.aspect, w / h);
    gl.uniform1f(u.scale, 1.1 * Math.min(1, w / h));
    gl.uniform3fv(u.color, s.color);
    gl.uniform1f(u.metal, s.metal);
    gl.uniform1f(u.roughness, s.roughness);
    gl.uniform1f(u.light, 0.15);
    gl.drawElements(gl.TRIANGLES, mesh.indices.length, gl.UNSIGNED_SHORT, 0);

    const moving =
      !!s.spin || !!s.from || Math.abs(s.velocity) > 0.005 || Math.abs(s.x - s.tx) + Math.abs(s.y - s.ty) > 0.0005;
    if (moving) request();
    else {
      s.last = 0;
      options.onSettle?.();
    }
  }

  let px = 0;
  let py = 0;
  let pt = 0;
  const down = (e: PointerEvent) => {
    if (e.button !== 0) return;
    s.dragging = true;
    s.spin = null;
    s.velocity = 0;
    px = e.clientX;
    py = e.clientY;
    pt = performance.now();
    canvas.setPointerCapture(e.pointerId);
    canvas.dataset.dragging = "";
  };
  const move = (e: PointerEvent) => {
    if (!s.dragging) return;
    const now = performance.now();
    const dx = e.clientX - px;
    const dt = Math.max((now - pt) / 1000, 0.01);
    s.ty += dx * 0.008;
    s.tx = Math.max(-1.4, Math.min(1.4, s.tx + (e.clientY - py) * 0.008));
    s.velocity = Math.max(-6, Math.min(6, (dx * 0.008) / dt));
    px = e.clientX;
    py = e.clientY;
    pt = now;
    request();
  };
  const end = () => {
    if (!s.dragging) return;
    s.dragging = false;
    if (performance.now() - pt > 80) s.velocity = 0;
    delete canvas.dataset.dragging;
    request();
  };
  const cancel = () => {
    s.velocity = 0;
    end();
  };
  const key = (e: KeyboardEvent) => {
    const d = ({ ArrowLeft: [0, -0.3], ArrowRight: [0, 0.3], ArrowUp: [-0.2, 0], ArrowDown: [0.2, 0] } as const)[
      e.key as "ArrowLeft"
    ];
    if (e.key === "Home") {
      e.preventDefault();
      s.spin = null;
      s.velocity = 0;
      s.tx = REST.x;
      s.ty = REST.y + Math.round((s.ty - REST.y) / TAU) * TAU;
      request();
      return;
    }
    if (!d) return;
    e.preventDefault();
    s.spin = null;
    s.velocity = 0;
    s.tx = Math.max(-1.4, Math.min(1.4, s.tx + d[0]));
    s.ty += d[1];
    request();
  };
  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", cancel);
  canvas.addEventListener("lostpointercapture", end);
  canvas.addEventListener("keydown", key);

  const lost = (e: Event) => {
    e.preventDefault();
    s.lost = true;
    cancelAnimationFrame(s.frame);
    s.frame = 0;
    options.onLost();
  };
  canvas.addEventListener("webglcontextlost", lost);

  const resize = new ResizeObserver(([entry]) => {
    s.width = entry.contentRect.width;
    s.height = entry.contentRect.height;
    request();
  });
  resize.observe(canvas);
  const io = new IntersectionObserver(
    ([entry]) => {
      s.visible = entry.isIntersecting;
      if (!s.visible) {
        cancelAnimationFrame(s.frame);
        s.frame = 0;
        s.last = 0;
      } else request();
    },
    { rootMargin: "40px" },
  );
  io.observe(canvas);
  const onVisibility = () => {
    s.last = 0;
    request();
  };
  document.addEventListener("visibilitychange", onVisibility);

  return {
    setMaterial(i) {
      s.from = { color: [...s.color], metal: s.metal, roughness: s.roughness, start: performance.now(), to: materials[i] };
      request();
    },
    spinOnce() {
      if (options.reduced()) return;
      s.spin = { from: s.ty, start: performance.now() };
      request();
    },
    destroy() {
      cancelAnimationFrame(s.frame);
      resize.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", end);
      canvas.removeEventListener("pointercancel", cancel);
      canvas.removeEventListener("lostpointercapture", end);
      canvas.removeEventListener("keydown", key);
      canvas.removeEventListener("webglcontextlost", lost);
    },
  };
}

/**
 * The flat drawing shown when WebGL is off: the same curve in the resting pose. The whole
 * strand is drawn once. At each place where the drawing crosses itself, a short piece of the
 * nearer strand is drawn again on top, so each crossing reads over or under.
 */
export function flatKnot(size: number) {
  const cx = Math.cos(REST.x);
  const sx = Math.sin(REST.x);
  const cy = Math.cos(REST.y);
  const sy = Math.sin(REST.y);
  const n = 360;
  const points = Array.from({ length: n }, (_, i) => {
    const [x, y0, z0] = knotCurve((i / n) * TAU);
    const y = y0 * cx - z0 * sx;
    const z1 = y0 * sx + z0 * cx;
    const X = x * cy + z1 * sy;
    const Z = -x * sy + z1 * cy;
    const k = (size * 0.27) / (1 - Z / 5.9);
    return { X: size / 2 + X * k, Y: size / 2 - y * k, Z };
  });
  const at = (i: number) => points[((i % n) + n) % n];
  const xy = (i: number) => `${at(i).X.toFixed(1)} ${at(i).Y.toFixed(1)}`;
  const whole = `M${xy(0)}${points.map((_, i) => `L${xy(i + 1)}`).join("")}Z`;

  const over: { i: number; reach: number }[] = [];
  for (let i = 0; i < n; i++) {
    const a = at(i);
    const b = at(i + 1);
    for (let j = i + 2; j < n; j++) {
      if ((j + 1) % n === i) continue;
      const c = at(j);
      const d = at(j + 1);
      const den = (b.X - a.X) * (d.Y - c.Y) - (b.Y - a.Y) * (d.X - c.X);
      if (Math.abs(den) < 1e-9) continue;
      const t = ((c.X - a.X) * (d.Y - c.Y) - (c.Y - a.Y) * (d.X - c.X)) / den;
      const u = ((c.X - a.X) * (b.Y - a.Y) - (c.Y - a.Y) * (b.X - a.X)) / den;
      if (t < 0 || t > 1 || u < 0 || u > 1) continue;
      const za = a.Z + (b.Z - a.Z) * t;
      const zc = c.Z + (d.Z - c.Z) * u;
      const sin = Math.abs(den) / (Math.hypot(b.X - a.X, b.Y - a.Y) * Math.hypot(d.X - c.X, d.Y - c.Y));
      over.push({ i: za > zc ? i : j, reach: Math.min(size * 0.4, Math.max(size * 0.075, (size * 0.071) / sin)) });
    }
  }

  const front = over.map(({ i, reach }) => {
    const centre = at(i);
    let lo = i;
    let hi = i + 1;
    while (i - lo < n / 6 && Math.hypot(at(lo).X - centre.X, at(lo).Y - centre.Y) < reach) lo--;
    while (hi - i < n / 6 && Math.hypot(at(hi).X - centre.X, at(hi).Y - centre.Y) < reach) hi++;
    let d = `M${xy(lo)}`;
    for (let k = lo + 1; k <= hi; k++) d += `L${xy(k)}`;
    return d;
  });
  return { whole, front };
}
