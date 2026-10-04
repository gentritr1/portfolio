import {
  Geometry,
  Mesh,
  Plane,
  Program,
  Renderer,
  RenderTarget,
  Texture,
} from "ogl";

/** Genuine RGB edge distances are reconstructed with median before interpolation. */
export const msdfFragment = `
precision highp float;
varying vec2 vUv;
uniform sampler2D previousField;
uniform sampler2D targetField;
uniform float progress;
uniform float rawField;
uniform float edgeWidth;
float median(vec3 v){return max(min(v.r,v.g),min(max(v.r,v.g),v.b));}
void main(){
  float a=median(texture2D(previousField,vUv).rgb);
  float b=median(texture2D(targetField,vUv).rgb);
  float distance=mix(a,b,progress);
  float coverage=smoothstep(.5-edgeWidth,.5+edgeWidth,distance);
  gl_FragColor=rawField>.5 ? vec4(vec3(distance),1.) : vec4(vec3(1.,.934,.80),coverage);
}`;
const vertex =
  "attribute vec3 position;attribute vec2 uv;varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,1.);}";
interface FontAtlas {
  glyphs: Record<string, { advance: number }>;
  atlas: {
    width: number;
    height: number;
    cell: number;
    scale: number;
    low: number;
    high: number;
    items: Record<string, { x: number; y: number; origin: [number, number] }>;
  };
}
export interface NameMorph {
  set(index: number, instant?: boolean): void;
  dispose(): void;
}

/** Shared glyph atlas → union of glyph distances → interruptible whole-name field morph. */
export async function createNameMorph(
  host: HTMLElement,
  names: string[],
  reduced: boolean,
): Promise<NameMorph | null> {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  let renderer: Renderer;
  try {
    renderer = new Renderer({
      canvas,
      alpha: true,
      antialias: false,
      dpr: Math.min(devicePixelRatio, 1.5),
      powerPreference: "low-power",
    });
  } catch {
    return null;
  }
  const gl = renderer.gl;
  if (!renderer.isWebgl2 && !gl.getExtension("EXT_blend_minmax")) {
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return null;
  }
  let font: FontAtlas;
  const picture = new Image();
  picture.src = "/lap/names-msdf.png";
  try {
    [font] = await Promise.all([
      fetch("/lap/glyphs.json").then((r) => r.json()),
      picture.decode(),
    ]);
  } catch {
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return null;
  }
  const atlas = new Texture(gl, {
    image: picture,
    generateMipmaps: false,
    minFilter: gl.LINEAR,
    magFilter: gl.LINEAR,
    flipY: false,
  });
  const targets = [
    new RenderTarget(gl, { width: 512, height: 64, depth: false }),
    new RenderTarget(gl, { width: 512, height: 64, depth: false }),
  ];
  const destination = new RenderTarget(gl, {
    width: 512,
    height: 64,
    depth: false,
  });
  const glyphProgram = new Program(gl, {
    vertex,
    fragment:
      "precision highp float;varying vec2 vUv;uniform sampler2D atlas;float median(vec3 v){return max(min(v.r,v.g),min(max(v.r,v.g),v.b));}void main(){float d=median(texture2D(atlas,vUv).rgb);gl_FragColor=vec4(vec3(d),1.);}",
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: { atlas: { value: atlas } },
  });
  glyphProgram.setBlendFunc(gl.ONE, gl.ONE);
  glyphProgram.setBlendEquation(0x8008, 0x8008);
  function compose(name: string) {
    const data = font.atlas,
      width = [...name].reduce((v, c) => v + (font.glyphs[c]?.advance ?? 0), 0),
      scale = Math.min(484 / width, 44 / (data.high - data.low));
    let cursor = (512 - width * scale) / 2;
    const baseline =
      (64 - (data.high - data.low) * scale) / 2 - data.low * scale;
    const p: number[] = [],
      uv: number[] = [],
      idx: number[] = [];
    for (const char of name) {
      const cell = data.items[char];
      if (cell) {
        const size = (data.cell / data.scale) * scale,
          x = cursor + cell.origin[0] * scale,
          y = baseline + cell.origin[1] * scale,
          base = p.length / 3;
        for (const [a, b] of [
          [0, 0],
          [1, 0],
          [0, 1],
          [1, 1],
        ]) {
          p.push((x + a * size) / 256 - 1, (y + b * size) / 32 - 1, 0);
          uv.push(
            (cell.x + a * data.cell) / data.width,
            (cell.y + (1 - b) * data.cell) / data.height,
          );
        }
        idx.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
      }
      cursor += (font.glyphs[char]?.advance ?? 0) * scale;
    }
    const geometry = new Geometry(gl, {
      position: { size: 3, data: new Float32Array(p) },
      uv: { size: 2, data: new Float32Array(uv) },
      index: { data: new Uint16Array(idx) },
    });
    const mesh = new Mesh(gl, { geometry, program: glyphProgram });
    gl.clearColor(0, 0, 0, 0);
    renderer.render({ scene: mesh, target: destination });
    geometry.remove();
  }
  compose(names[0]);
  const geometry = new Plane(gl, { width: 2, height: 2 });
  const program = new Program(gl, {
    vertex,
    fragment: msdfFragment,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      previousField: { value: destination.texture },
      targetField: { value: destination.texture },
      progress: { value: 1 },
      rawField: { value: 0 },
      edgeWidth: { value: 0.04 },
    },
  });
  const mesh = new Mesh(gl, { geometry, program });
  host.append(canvas);
  host.dataset.renderer = "msdf";
  let frame = 0,
    progress = 1,
    velocity = 0,
    previous = 0,
    visible = true,
    disposed = false,
    buffer = 0;
  function draw() {
    program.uniforms.progress.value = progress;
    renderer.render({ scene: mesh });
    host.dataset.morph = progress.toFixed(3);
  }
  function tick(now: number) {
    frame = 0;
    if (disposed || !visible || document.hidden) {
      previous = 0;
      return;
    }
    const dt = previous ? Math.min(0.025, (now - previous) / 1000) : 1 / 60;
    previous = now;
    velocity += (350 * (1 - progress) - 35 * velocity) * dt;
    progress += velocity * dt;
    if (Math.abs(1 - progress) < 0.001 && Math.abs(velocity) < 0.01) {
      progress = 1;
      velocity = 0;
    }
    draw();
    if (progress !== 1) frame = requestAnimationFrame(tick);
  }
  function resume() {
    if (!frame && progress !== 1 && visible && !document.hidden && !disposed)
      frame = requestAnimationFrame(tick);
  }
  const resize = new ResizeObserver(() => {
    renderer.setSize(
      Math.max(1, host.clientWidth),
      Math.max(1, host.clientHeight),
    );
    program.uniforms.edgeWidth.value =
      64 / (12 * Math.max(32, host.clientHeight));
    draw();
  });
  resize.observe(host);
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    resume();
  });
  observer.observe(host);
  document.addEventListener("visibilitychange", resume);
  return {
    set(index, instant = reduced) {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
      // Capture the displayed distance, not alpha coverage, so a third-name interruption stays continuous.
      program.uniforms.progress.value = progress;
      program.uniforms.rawField.value = 1;
      renderer.render({ scene: mesh, target: targets[buffer] });
      program.uniforms.rawField.value = 0;
      program.uniforms.previousField.value = targets[buffer].texture;
      buffer = 1 - buffer;
      compose(names[Math.max(0, Math.min(names.length - 1, index))]);
      program.uniforms.targetField.value = destination.texture;
      progress = instant ? 1 : 0;
      velocity = 0;
      draw();
      resume();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      observer.disconnect();
      document.removeEventListener("visibilitychange", resume);
      geometry.remove();
      program.remove();
      glyphProgram.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    },
  };
}
