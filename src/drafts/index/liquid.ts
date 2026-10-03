import { Mesh, Program, Renderer, Texture, Triangle } from "ogl";

/** One small shader turns the actual screenshot into moving type ink. */
export async function mountLiquid(
  canvas: HTMLCanvasElement,
  label: HTMLSpanElement,
  source: string,
): Promise<() => void> {
  const image = new Image();
  image.src = source;
  await Promise.all([image.decode(), document.fonts.ready]);
  if (!canvas.isConnected) return () => {};
  let renderer: Renderer;
  try {
    renderer = new Renderer({
      canvas,
      alpha: true,
      dpr: Math.min(devicePixelRatio, 1.5),
      antialias: false,
    });
  } catch {
    return () => {};
  }
  const gl = renderer.gl;
  const maskCanvas = document.createElement("canvas");
  const ctx = maskCanvas.getContext("2d");
  if (!ctx)
    return () => {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  const mask = new Texture(gl, { image: maskCanvas, generateMipmaps: false });
  const picture = new Texture(gl, { image, generateMipmaps: false });
  const geometry = new Triangle(gl);
  const program = new Program(gl, {
    transparent: true,
    vertex: `attribute vec2 uv; attribute vec2 position; varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position,0.,1.);}`,
    fragment: `precision highp float; varying vec2 vUv; uniform sampler2D uMask; uniform sampler2D uImage; uniform float uTime; uniform float uStrength; uniform vec2 uPointer;
      void main(){float alpha=texture2D(uMask,vUv).a; vec2 delta=vUv-uPointer; float wave=sin(length(delta)*24.-uTime*6.)*exp(-length(delta)*2.)*.045*uStrength; vec2 shift=vec2(sin(vUv.y*11.+uTime*2.),cos(vUv.x*9.+uTime))*wave; vec3 colour=texture2D(uImage,clamp(vec2(vUv.x,.22+vUv.y*.18)+shift,0.,1.)).rgb; colour=max(colour,vec3(.62,.60,.54)); gl_FragColor=vec4(colour,alpha);}`,
    uniforms: {
      uMask: { value: mask },
      uImage: { value: picture },
      uTime: { value: 0 },
      uStrength: { value: 1 },
      uPointer: { value: [0.5, 0.5] },
    },
  });
  const mesh = new Mesh(gl, { geometry, program });
  let frame = 0;
  let stopped = false;
  let start = performance.now();
  let until = start + 1900;
  function draw(now: number) {
    frame = 0;
    if (stopped || document.hidden || !canvas.isConnected) return;
    program.uniforms.uTime.value = (now - start) / 1000;
    program.uniforms.uStrength.value = Math.max(
      0,
      Math.min(1, (until - now) / 900),
    );
    renderer.render({ scene: mesh });
    if (!gl.getError()) {
      canvas.style.opacity = "1";
      label.dataset.liquid = "ready";
    }
    if (now < until) frame = requestAnimationFrame(draw);
  }
  function redraw() {
    if (frame || stopped || document.hidden) return;
    frame = requestAnimationFrame(draw);
  }
  function resize() {
    const box = label.getBoundingClientRect();
    if (!box.width || !box.height) return;
    renderer.setSize(box.width, box.height);
    const dpr = Math.min(devicePixelRatio, 1.5);
    maskCanvas.width = Math.round(box.width * dpr);
    maskCanvas.height = Math.round(box.height * dpr);
    ctx!.scale(dpr, dpr);
    const style = getComputedStyle(label);
    ctx!.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    ctx!.letterSpacing = style.letterSpacing;
    ctx!.fillStyle = "#fff";
    ctx!.textBaseline = "alphabetic";
    const lineHeight = parseFloat(style.lineHeight);
    const words = (label.firstElementChild?.textContent ?? "").split(
      /(?<=-)| /,
    );
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
      const candidate = line
        ? `${line}${line.endsWith("-") ? "" : " "}${word}`
        : word;
      if (line && ctx!.measureText(candidate).width > box.width + 1) {
        lines.push(line);
        line = word;
      } else line = candidate;
    }
    if (line) lines.push(line);
    const metrics = ctx!.measureText("Hg");
    const baseline =
      (lineHeight -
        metrics.fontBoundingBoxAscent -
        metrics.fontBoundingBoxDescent) /
        2 +
      metrics.fontBoundingBoxAscent;
    lines.forEach((value, i) =>
      ctx!.fillText(value, 0, baseline + i * lineHeight),
    );
    mask.needsUpdate = true;
    redraw();
  }
  function pointer(event: PointerEvent) {
    const box = label.getBoundingClientRect();
    program.uniforms.uPointer.value = [
      (event.clientX - box.left) / box.width,
      1 - (event.clientY - box.top) / box.height,
    ];
    until = performance.now() + 1000;
    redraw();
  }
  function lost(event: Event) {
    event.preventDefault();
    stopped = true;
    cancelAnimationFrame(frame);
    canvas.style.opacity = "0";
    delete label.dataset.liquid;
  }
  function visibility() {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else redraw();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(label);
  label.addEventListener("pointermove", pointer);
  canvas.addEventListener("webglcontextlost", lost);
  document.addEventListener("visibilitychange", visibility);
  resize();
  return () => {
    stopped = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    label.removeEventListener("pointermove", pointer);
    canvas.removeEventListener("webglcontextlost", lost);
    document.removeEventListener("visibilitychange", visibility);
    canvas.style.opacity = "0";
    delete label.dataset.liquid;
    gl.deleteTexture(mask.texture);
    gl.deleteTexture(picture.texture);
    geometry.remove();
    program.remove();
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  };
}
