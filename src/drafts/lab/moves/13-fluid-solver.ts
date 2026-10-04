export type Dye = readonly [number, number, number];
type Splat = { x: number; y: number; vx: number; vy: number; colour: Dye };
type Target = { texture: WebGLTexture; framebuffer: WebGLFramebuffer };
type Pair = { read: Target; write: Target };
type Pass = {
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation | null>;
};
export interface FluidSolver {
  inject(x: number, y: number, vx: number, vy: number, colour: Dye): void;
  clear(): void;
  dispose(): void;
}
const size = 128;
const vertex = `#version 300 es
out vec2 uv;
void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);uv=p;gl_Position=vec4(p*2.-1.,0.,1.);}`;
const head = `#version 300 es
precision highp float;
in vec2 uv;out vec4 result;
const float h=1./128.;
`;
const fragments = {
  advect:
    head +
    `uniform sampler2D source,velocity;uniform float dt,decay;
vec4 bilinear(sampler2D field,vec2 p){vec2 s=clamp(p,vec2(.5*h),vec2(1.-.5*h))/h-.5;vec2 i=floor(s);vec2 f=fract(s);vec2 a=(i+.5)*h;return mix(mix(texture(field,a),texture(field,a+vec2(h,0.)),f.x),mix(texture(field,a+vec2(0.,h)),texture(field,a+vec2(h)),f.x),f.y);}
void main(){vec2 back=uv-dt*texture(velocity,uv).xy;result=bilinear(source,back)*decay;}`,
  splat:
    head +
    `uniform sampler2D source;uniform vec2 point;uniform vec4 amount;uniform float aspect;
void main(){vec2 d=uv-point;d.x*=aspect;float ink=exp(-dot(d,d)/.0032);result=texture(source,uv)+amount*ink;}`,
  divergence:
    head +
    `uniform sampler2D velocity;
void main(){vec2 c=texture(velocity,uv).xy;float l=texture(velocity,uv-vec2(h,0.)).x;float r=texture(velocity,uv+vec2(h,0.)).x;float b=texture(velocity,uv-vec2(0.,h)).y;float t=texture(velocity,uv+vec2(0.,h)).y;if(uv.x<h)l=-c.x;if(uv.x>1.-h)r=-c.x;if(uv.y<h)b=-c.y;if(uv.y>1.-h)t=-c.y;result=vec4((r-l+t-b)*.5/h,0.,0.,1.);}`,
  pressure:
    head +
    `uniform sampler2D pressure,divergence;
void main(){float l=texture(pressure,uv-vec2(h,0.)).r;float r=texture(pressure,uv+vec2(h,0.)).r;float b=texture(pressure,uv-vec2(0.,h)).r;float t=texture(pressure,uv+vec2(0.,h)).r;float d=texture(divergence,uv).r;result=vec4((l+r+b+t-d*h*h)*.25,0.,0.,1.);}`,
  project:
    head +
    `uniform sampler2D pressure,velocity;
void main(){float l=texture(pressure,uv-vec2(h,0.)).r;float r=texture(pressure,uv+vec2(h,0.)).r;float b=texture(pressure,uv-vec2(0.,h)).r;float t=texture(pressure,uv+vec2(0.,h)).r;vec2 v=texture(velocity,uv).xy-vec2(r-l,t-b)*.5/h;if(uv.x<h||uv.x>1.-h)v.x=0.;if(uv.y<h||uv.y>1.-h)v.y=0.;result=vec4(v,0.,1.);}`,
  display:
    head +
    `uniform sampler2D dye;uniform vec2 rows[3];uniform vec2 inset;
void main(){float mask=0.;for(int i=0;i<3;i++)mask=max(mask,step(rows[i].x,uv.y)*step(uv.y,rows[i].y));mask*=step(inset.x,uv.x)*step(uv.x,inset.y);if(mask<.5){result=vec4(0.);return;}vec4 ink=texture(dye,uv);vec3 colour=ink.rgb/max(ink.a,.0001);vec3 paper=vec3(.975,.961,.914);result=vec4(mix(paper,colour,clamp(ink.a,0.,.76)),1.);}`,
};

/** 128² stable fluids: seven RGBA16F targets; no GPU -> CPU readback. */
export function createFluidSolver(
  host: HTMLElement,
  rowElements: readonly HTMLElement[],
  unavailable: () => void,
): FluidSolver | null {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  const context = canvas.getContext("webgl2", {
    alpha: true,
    antialias: false,
    premultipliedAlpha: false,
    powerPreference: "low-power",
  });
  if (!context) return null;
  const gl = context;
  if (!gl.getExtension("EXT_color_buffer_float")) {
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return null;
  }
  const targets: Target[] = [],
    programs: Pass[] = [];
  let frame = 0,
    last = 0,
    deadline = 0,
    disposed = false,
    pausedAt = 0;
  let observer: ResizeObserver | undefined;
  let pending: Splat[] = [];
  let masks = new Float32Array(6),
    inset = new Float32Array([0, 1]);
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  function compile(kind: number, source: string) {
    const shader = gl.createShader(kind);
    if (!shader) throw new Error("Shader allocation failed");
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(error || "Shader compilation failed");
    }
    return shader;
  }
  function pass(fragment: string): Pass {
    const vs = compile(gl.VERTEX_SHADER, vertex);
    let fs: WebGLShader;
    try {
      fs = compile(gl.FRAGMENT_SHADER, fragment);
    } catch (error) {
      gl.deleteShader(vs);
      throw error;
    }
    const program = gl.createProgram();
    if (!program) {
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      throw new Error("Program allocation failed");
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const error = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(error || "Program link failed");
    }
    const uniforms: Pass["uniforms"] = {};
    for (
      let i = 0;
      i < gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
      i++
    ) {
      const info = gl.getActiveUniform(program, i);
      if (info)
        uniforms[info.name.replace("[0]", "")] = gl.getUniformLocation(
          program,
          info.name,
        );
    }
    const result = { program, uniforms };
    programs.push(result);
    return result;
  }
  function target(): Target {
    const texture = gl.createTexture(),
      framebuffer = gl.createFramebuffer();
    if (!texture || !framebuffer) {
      if (texture) gl.deleteTexture(texture);
      if (framebuffer) gl.deleteFramebuffer(framebuffer);
      throw new Error("Target allocation failed");
    }
    const result = { texture, framebuffer };
    targets.push(result);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA16F,
      size,
      size,
      0,
      gl.RGBA,
      gl.HALF_FLOAT,
      null,
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture,
      0,
    );
    // Extension presence alone is not enough: verify the actual float attachment.
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
      throw new Error("Renderable float target unavailable");
    gl.viewport(0, 0, size, size);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return result;
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    observer?.disconnect();
    document.removeEventListener("visibilitychange", visibility);
    canvas.removeEventListener("webglcontextlost", lost);
    programs.forEach(({ program }) => gl.deleteProgram(program));
    targets.forEach(({ texture, framebuffer }) => {
      gl.deleteTexture(texture);
      gl.deleteFramebuffer(framebuffer);
    });
    gl.deleteVertexArray(vao);
    canvas.remove();
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
  function lost(event: Event) {
    event.preventDefault();
    dispose();
    unavailable();
  }
  function visibility() {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
      pausedAt = performance.now();
    } else if (pausedAt) {
      deadline += performance.now() - pausedAt;
      pausedAt = 0;
      last = 0;
      request();
    }
  }
  function request() {
    if (!disposed && !document.hidden && !frame)
      frame = requestAnimationFrame(tick);
  }
  let advect: Pass,
    splat: Pass,
    diverge: Pass,
    jacobi: Pass,
    project: Pass,
    display: Pass;
  let velocity: Pair, dye: Pair, pressure: Pair, divergence: Target;
  try {
    advect = pass(fragments.advect);
    splat = pass(fragments.splat);
    diverge = pass(fragments.divergence);
    jacobi = pass(fragments.pressure);
    project = pass(fragments.project);
    display = pass(fragments.display);
    velocity = { read: target(), write: target() };
    dye = { read: target(), write: target() };
    pressure = { read: target(), write: target() };
    divergence = target();
  } catch {
    dispose();
    return null;
  }
  gl.disable(gl.BLEND);
  gl.disable(gl.DEPTH_TEST);
  host.prepend(canvas);
  function bindPass(p: Pass, destination: Target | null) {
    gl.useProgram(p.program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, destination?.framebuffer ?? null);
    gl.viewport(
      0,
      0,
      destination ? size : canvas.width,
      destination ? size : canvas.height,
    );
  }
  function texture(p: Pass, name: string, value: WebGLTexture, unit: number) {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, value);
    gl.uniform1i(p.uniforms[name], unit);
  }
  function draw() {
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function swap(pair: Pair) {
    const previous = pair.read;
    pair.read = pair.write;
    pair.write = previous;
  }
  function show() {
    bindPass(display, null);
    texture(display, "dye", dye.read.texture, 0);
    gl.uniform2fv(display.uniforms.rows, masks);
    gl.uniform2fv(display.uniforms.inset, inset);
    draw();
  }
  function resize() {
    const bounds = host.getBoundingClientRect(),
      dpr = Math.min(devicePixelRatio, 1.5);
    canvas.width = Math.max(1, Math.round(bounds.width * dpr));
    canvas.height = Math.max(1, Math.round(bounds.height * dpr));
    masks = new Float32Array(
      rowElements.flatMap((row) => {
        const rect = row.getBoundingClientRect();
        return [
          1 - (rect.bottom - bounds.top) / Math.max(1, bounds.height),
          1 - (rect.top - bounds.top) / Math.max(1, bounds.height),
        ];
      }),
    );
    const first = rowElements[0]?.getBoundingClientRect();
    inset = new Float32Array(
      first
        ? [
            (first.left - bounds.left) / Math.max(1, bounds.width),
            (first.right - bounds.left) / Math.max(1, bounds.width),
          ]
        : [0, 1],
    );
    show();
  }
  function addSplat(pair: Pair, point: Splat, amount: readonly number[]) {
    bindPass(splat, pair.write);
    texture(splat, "source", pair.read.texture, 0);
    gl.uniform2f(splat.uniforms.point, point.x, point.y);
    gl.uniform4f(
      splat.uniforms.amount,
      amount[0],
      amount[1],
      amount[2],
      amount[3],
    );
    gl.uniform1f(
      splat.uniforms.aspect,
      host.clientWidth / Math.max(1, host.clientHeight),
    );
    draw();
    swap(pair);
  }
  function advance(dt: number) {
    bindPass(advect, velocity.write);
    texture(advect, "source", velocity.read.texture, 0);
    texture(advect, "velocity", velocity.read.texture, 1);
    gl.uniform1f(advect.uniforms.dt, dt);
    gl.uniform1f(advect.uniforms.decay, Math.exp(-0.7 * dt));
    draw();
    swap(velocity);
    for (const point of pending) {
      addSplat(velocity, point, [point.vx, point.vy, 0, 0]);
      addSplat(dye, point, [
        point.colour[0] * 0.75,
        point.colour[1] * 0.75,
        point.colour[2] * 0.75,
        0.75,
      ]);
    }
    pending = [];
    bindPass(diverge, divergence);
    texture(diverge, "velocity", velocity.read.texture, 0);
    draw();
    for (let i = 0; i < 20; i++) {
      bindPass(jacobi, pressure.write);
      texture(jacobi, "pressure", pressure.read.texture, 0);
      texture(jacobi, "divergence", divergence.texture, 1);
      draw();
      swap(pressure);
    }
    bindPass(project, velocity.write);
    texture(project, "pressure", pressure.read.texture, 0);
    texture(project, "velocity", velocity.read.texture, 1);
    draw();
    swap(velocity);
    bindPass(advect, dye.write);
    texture(advect, "source", dye.read.texture, 0);
    texture(advect, "velocity", velocity.read.texture, 1);
    gl.uniform1f(advect.uniforms.dt, dt);
    gl.uniform1f(advect.uniforms.decay, Math.exp(-0.12 * dt));
    draw();
    swap(dye);
    show();
  }
  function tick(time: number) {
    frame = 0;
    const dt = last ? Math.min((time - last) / 1000, 1 / 30) : 1 / 60;
    last = time;
    advance(dt);
    if (time < deadline) request();
    else last = 0;
  }
  observer = new ResizeObserver(resize);
  observer.observe(host);
  rowElements.forEach((row) => observer!.observe(row));
  canvas.addEventListener("webglcontextlost", lost);
  document.addEventListener("visibilitychange", visibility);
  resize();
  return {
    inject(x, y, vx, vy, colour) {
      if (disposed) return;
      pending.push({
        x: Math.max(0.01, Math.min(0.99, x)),
        y: Math.max(0.01, Math.min(0.99, y)),
        vx: Math.max(-1.5, Math.min(1.5, vx)),
        vy: Math.max(-1.5, Math.min(1.5, vy)),
        colour,
      });
      // Bound event bursts without allocating another simulation or accumulating a backlog.
      if (pending.length > 3) pending.shift();
      deadline = performance.now() + 5000;
      request();
    },
    clear() {
      pending = [];
      targets.forEach((t) => {
        gl.bindFramebuffer(gl.FRAMEBUFFER, t.framebuffer);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
      });
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
      deadline = 0;
      show();
    },
    dispose,
  };
}
