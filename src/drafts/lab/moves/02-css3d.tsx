import { useEffect, useRef, useState } from "react";
import { Box, Camera, Mesh, Program, Renderer, Transform } from "ogl";
import type { LabMoveProps } from "../types";
import { cssCameraMatrix, projectedCorner } from "./02-css3d-matrix";
import "./02-css3d.css";

const vertex = `attribute vec3 position,normal;uniform mat4 modelViewMatrix,projectionMatrix;uniform mat3 normalMatrix;varying vec3 n;void main(){n=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const fragment = `precision highp float;varying vec3 n;uniform vec3 colour;void main(){float light=.45+.55*max(dot(normalize(n),normalize(vec3(-.5,1.,1.))),0.);gl_FragColor=vec4(colour*light,1.);}`;
const domWidth = 240,
  domHeight = 160,
  planeWidth = 3.45,
  planeHeight = 2.3;
type Scene = { turn(value: number): void; dispose(): void };

function createMappedScene(
  host: HTMLElement,
  dom: HTMLElement,
  unavailable: () => void,
): Scene | null {
  let renderer: Renderer;
  try {
    renderer = new Renderer({
      alpha: false,
      antialias: true,
      dpr: Math.min(devicePixelRatio, 1.5),
      powerPreference: "low-power",
    });
  } catch {
    return null;
  }
  const gl = renderer.gl,
    canvas = gl.canvas as HTMLCanvasElement;
  canvas.setAttribute("aria-hidden", "true");
  host.prepend(canvas);
  gl.clearColor(0.18, 0.31, 0.37, 1);
  const scene = new Transform(),
    device = new Transform(),
    screen = new Transform();
  device.position.y = 0.12;
  device.rotation.y = -0.34;
  device.setParent(scene);
  screen.position.z = 0.116;
  screen.setParent(device);
  const camera = new Camera(gl, { fov: 40, near: 0.1, far: 30 });
  camera.position.set(0, 1.1, 4.8);
  camera.lookAt([0, 0, 0]);
  const shapes: Box[] = [],
    programs: Program[] = [];
  function box(
    width: number,
    height: number,
    depth: number,
    position: [number, number, number],
    colour: [number, number, number],
    parent: Transform,
  ) {
    const geometry = new Box(gl, { width, height, depth }),
      program = new Program(gl, {
        vertex,
        fragment,
        uniforms: { colour: { value: colour } },
      });
    const mesh = new Mesh(gl, { geometry, program });
    mesh.position.set(...position);
    mesh.setParent(parent);
    shapes.push(geometry);
    programs.push(program);
  }
  box(3.64, 2.49, 0.22, [0, 0, 0], [0.07, 0.1, 0.13], device);
  box(0.24, 0.55, 0.2, [0, -1.46, -0.04], [0.2, 0.28, 0.3], device);
  box(1.45, 0.1, 0.72, [0, -1.75, -0.02], [0.2, 0.28, 0.3], device);
  box(9, 0.1, 6, [0, -1.84, 0], [0.31, 0.47, 0.51], scene);
  for (const x of [-planeWidth / 2, planeWidth / 2])
    for (const y of [-planeHeight / 2, planeHeight / 2]) {
      box(0.035, 0.035, 0.022, [x, y, 0.116], [0.99, 0.65, 0.24], device);
    }
  let frame = 0,
    last = 0,
    velocity = 0,
    target = -0.18,
    disposed = false;
  function draw() {
    scene.updateMatrixWorld();
    camera.updateMatrixWorld();
    const width = host.clientWidth,
      height = host.clientHeight;
    const matrix = cssCameraMatrix(
      camera.projectionMatrix,
      camera.viewMatrix,
      screen.worldMatrix,
      width,
      height,
      planeWidth,
      planeHeight,
      domWidth,
      domHeight,
    );
    dom.style.transform = "matrix3d(" + matrix.join(",") + ")";
    // Root can compare these camera-derived corners with the four real DOM pins.
    dom.dataset.projectedCorners = JSON.stringify(
      [
        [0, 0],
        [domWidth, 0],
        [domWidth, domHeight],
        [0, domHeight],
      ].map(([x, y]) => projectedCorner(matrix, x, y)),
    );
    renderer.render({ scene, camera });
  }
  function request() {
    if (!frame && !disposed && !document.hidden)
      frame = requestAnimationFrame(tick);
  }
  function tick(time: number) {
    frame = 0;
    const dt = last ? Math.min((time - last) / 1000, 1 / 30) : 1 / 60;
    last = time;
    for (let i = 0; i < 2; i++) {
      velocity +=
        (((target - device.rotation.y) * 350 - velocity * 35) * dt) / 2;
      device.rotation.y += (velocity * dt) / 2;
    }
    draw();
    if (Math.abs(target - device.rotation.y) + Math.abs(velocity) > 0.001)
      request();
    else {
      device.rotation.y = target;
      velocity = 0;
      last = 0;
      draw();
    }
  }
  function resize() {
    renderer.setSize(
      Math.max(1, host.clientWidth),
      Math.max(1, host.clientHeight),
    );
    camera.perspective({
      aspect: host.clientWidth / Math.max(1, host.clientHeight),
    });
    draw();
  }
  function visibility() {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
    if (!document.hidden) request();
  }
  function lost(event: Event) {
    event.preventDefault();
    dispose();
    unavailable();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  document.addEventListener("visibilitychange", visibility);
  canvas.addEventListener("webglcontextlost", lost);
  resize();
  request();
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    document.removeEventListener("visibilitychange", visibility);
    canvas.removeEventListener("webglcontextlost", lost);
    shapes.forEach((shape) => shape.remove());
    programs.forEach((program) => program.remove());
    canvas.remove();
    dom.style.removeProperty("transform");
    delete dom.dataset.projectedCorners;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
  return {
    turn(value) {
      target = value;
      request();
    },
    dispose,
  };
}

export default function Css3dMove({ active, reduced }: LabMoveProps) {
  const host = useRef<HTMLDivElement>(null),
    dom = useRef<HTMLDivElement>(null),
    engine = useRef<Scene | null>(null);
  const [ready, setGpu] = useState(false),
    [angle, setAngle] = useState(-0.3),
    [size, setSize] = useState(14),
    [notice, setNotice] = useState("Try the reader controls.");
  const angleRef = useRef(-0.3);
  const gpu = active && !reduced && ready;
  useEffect(() => {
    let disposed = false;
    if (!active || reduced || !host.current || !dom.current) return;
    engine.current = createMappedScene(host.current, dom.current, () =>
      setGpu(false),
    );
    engine.current?.turn(angleRef.current);
    queueMicrotask(() => {
      if (!disposed) setGpu(Boolean(engine.current));
    });
    return () => {
      disposed = true;
      engine.current?.dispose();
      engine.current = null;
    };
  }, [active, reduced]);
  return (
    <div
      className="lm02"
      data-renderer={gpu ? "webgl-dom" : "flat"}
      data-reduced={reduced}
    >
      <div ref={host} className="lm02-scene">
        <div className="lm02-overlay">
          <div className="lm02-dom" ref={dom}>
            {[0, 1, 2, 3].map((index) => (
              <span
                key={index}
                className={"lm02-pin lm02-pin-" + index}
                aria-hidden="true"
              />
            ))}
            <strong>Read to Feed</strong>
            <p style={{ fontSize: size }}>A reading app for PDF and EPUB.</p>
            <div className="lm02-reader-controls">
              <button
                aria-label="Smaller reader text"
                disabled={size <= 12}
                onClick={() => {
                  setSize((value) => Math.max(12, value - 1));
                  setNotice("Reader text made smaller.");
                }}
              >
                A−
              </button>
              <output aria-label="Reader text size">{size}</output>
              <button
                aria-label="Larger reader text"
                disabled={size >= 18}
                onClick={() => {
                  setSize((value) => Math.min(18, value + 1));
                  setNotice("Reader text made larger.");
                }}
              >
                A+
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="lm02-angles" aria-label="Screen angle">
        {[
          ["Left", -0.3],
          ["Front", 0],
          ["Right", 0.3],
        ].map(([name, value]) => (
          <button
            key={name}
            disabled={!gpu}
            aria-pressed={angle === value}
            onClick={() => {
              angleRef.current = Number(value);
              setAngle(Number(value));
              engine.current?.turn(Number(value));
              setNotice(name + " view. Reader controls remain usable.");
            }}
          >
            {name}
          </button>
        ))}
      </div>
      <p className="lm02-status" role="status">
        {gpu
          ? notice
          : reduced
            ? "Flat reader · reduced motion"
            : "Flat reader · graphics unavailable"}
      </p>
    </div>
  );
}
