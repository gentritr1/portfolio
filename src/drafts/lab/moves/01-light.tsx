import { useEffect, useRef, useState } from "react";
import {
  Box,
  Camera,
  Mesh,
  Plane,
  Program,
  Renderer,
  Texture,
  Transform,
} from "ogl";
import type { LabMoveProps } from "../types";
import "./01-light.css";

const screens = [
  { name: "Bayyinah", src: "/showcase/bayyinah/store-01.webp" },
  { name: "FJALË", src: "/personal/shots/fjale-phone.webp" },
];
type Sample = { image: HTMLImageElement; mip: HTMLCanvasElement };
const samples = new Map<string, Promise<Sample>>();

// Exactly one CPU downsample per source. No per-frame readback or image averaging.
function sampleImage(src: string) {
  if (!samples.has(src)) {
    samples.set(
      src,
      new Promise<Sample>((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          const mip = document.createElement("canvas");
          mip.width = mip.height = 8;
          const context = mip.getContext("2d");
          if (!context) {
            reject(new Error("Image sampling unavailable"));
            return;
          }
          context.drawImage(image, 0, 0, 8, 8);
          resolve({ image, mip });
        };
        image.onerror = () => reject(new Error("Screenshot unavailable"));
        image.src = src;
      }),
    );
  }
  return samples.get(src)!;
}

const surfaceVertex = `
attribute vec3 position; attribute vec3 normal;
uniform mat4 modelMatrix, modelViewMatrix, projectionMatrix;
varying vec3 worldPosition, worldNormal;
void main(){
 worldPosition=(modelMatrix*vec4(position,1.)).xyz;
 worldNormal=normalize(mat3(modelMatrix)*normal);
 gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
}`;
const surfaceFragment = `
precision highp float;
uniform sampler2D environment; uniform float energy; uniform vec3 albedo;
varying vec3 worldPosition, worldNormal;
void main(){
 vec3 n=normalize(worldNormal);
 vec3 toScreen=vec3(0.,.55,.24)-worldPosition;
 float distance2=max(dot(toScreen,toScreen),.12);
 vec3 incoming=normalize(toScreen);
 // The receiving surface normal selects the screen's actual 8x8 colour field.
 vec2 sampleUv=clamp(vec2(n.x*.42+.5,n.y*.32+n.z*.20+.45),.08,.92);
 vec3 light=texture2D(environment,sampleUv).rgb;
 light+=texture2D(environment,sampleUv+vec2(.08,0.)).rgb;
 light+=texture2D(environment,sampleUv-vec2(.08,0.)).rgb;
 light/=3.;
 float diffuse=max(dot(n,incoming),0.);
 float area=1.8/(.8+distance2);
 vec3 ambient=albedo*(.15+.10*max(n.y,0.));
 gl_FragColor=vec4(ambient+albedo*light*diffuse*area*energy*2.8,1.);
}`;
const imageVertex = `attribute vec3 position;attribute vec2 uv;uniform mat4 modelViewMatrix,projectionMatrix;varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const imageFragment = `precision highp float;uniform sampler2D screenshot;varying vec2 vUv;void main(){gl_FragColor=vec4(texture2D(screenshot,vUv).rgb,1.);}`;
type LightScene = {
  choose(sample: Sample): void;
  illuminate(on: boolean): void;
  dispose(): void;
};

function createLightScene(
  host: HTMLElement,
  first: Sample,
  reduced: boolean,
  unavailable: () => void,
): LightScene | null {
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
  gl.clearColor(0.065, 0.073, 0.085, 1);
  canvas.setAttribute("aria-hidden", "true");
  host.append(canvas);
  const scene = new Transform();
  const camera = new Camera(gl, { fov: 39, near: 0.1, far: 30 });
  camera.position.set(2.1, 1.7, 4.3);
  camera.lookAt([0, 0.35, 0]);
  const environment = new Texture(gl, {
    image: first.mip,
    minFilter: gl.LINEAR,
    magFilter: gl.LINEAR,
    generateMipmaps: false,
  });
  const screenshot = new Texture(gl, {
    image: first.image,
    minFilter: gl.LINEAR,
    generateMipmaps: false,
  });
  const energy = { value: reduced ? 1 : 0.18 };
  const materials = [
    new Program(gl, {
      vertex: surfaceVertex,
      fragment: surfaceFragment,
      uniforms: {
        environment: { value: environment },
        energy,
        albedo: { value: [0.72, 0.73, 0.7] },
      },
    }),
    new Program(gl, {
      vertex: surfaceVertex,
      fragment: surfaceFragment,
      uniforms: {
        environment: { value: environment },
        energy,
        albedo: { value: [0.18, 0.2, 0.23] },
      },
    }),
    new Program(gl, {
      vertex: imageVertex,
      fragment: imageFragment,
      uniforms: { screenshot: { value: screenshot } },
    }),
  ];
  const shapes: (Box | Plane)[] = [];
  const box = (
    size: [number, number, number],
    position: [number, number, number],
    material = 0,
  ) => {
    const shape = new Box(gl, {
      width: size[0],
      height: size[1],
      depth: size[2],
    });
    shapes.push(shape);
    const mesh = new Mesh(gl, {
      geometry: shape,
      program: materials[material],
    });
    mesh.position.set(...position);
    mesh.setParent(scene);
    return mesh;
  };
  box([7, 0.12, 5], [0, -0.66, 0]);
  box([7, 4, 0.12], [0, 1.2, -0.95]);
  box([1.04, 1.9, 0.12], [0, 0.36, 0.1], 1);
  box([0.52, 0.1, 0.48], [0, -0.54, 0.11], 1);
  box([0.2, 0.4, 0.14], [0, -0.43, 0.06], 1);
  box([0.48, 0.46, 0.48], [1.18, -0.37, -0.24]);
  const phone = new Plane(gl, { width: 0.91, height: 1.72 });
  shapes.push(phone);
  const screen = new Mesh(gl, { geometry: phone, program: materials[2] });
  screen.position.set(0, 0.36, 0.166);
  screen.setParent(scene);
  let frame = 0,
    last = 0,
    velocity = 0,
    target = 1,
    disposed = false;
  function draw() {
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
    // Retarget without resetting the velocity: rapid toggles remain continuous.
    for (let i = 0; i < 2; i++) {
      velocity += (((target - energy.value) * 350 - velocity * 35) * dt) / 2;
      energy.value += (velocity * dt) / 2;
    }
    draw();
    if (Math.abs(target - energy.value) + Math.abs(velocity) > 0.001) request();
    else {
      energy.value = target;
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
  if (!reduced) request();
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    document.removeEventListener("visibilitychange", visibility);
    canvas.removeEventListener("webglcontextlost", lost);
    shapes.forEach((shape) => shape.remove());
    materials.forEach((material) => material.remove());
    gl.deleteTexture(environment.texture);
    gl.deleteTexture(screenshot.texture);
    canvas.remove();
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
  return {
    choose(sample) {
      environment.image = sample.mip;
      environment.needsUpdate = true;
      screenshot.image = sample.image;
      screenshot.needsUpdate = true;
      draw();
    },
    illuminate(on) {
      target = on ? 1 : 0;
      if (reduced) {
        energy.value = target;
        velocity = 0;
        draw();
      } else request();
    },
    dispose,
  };
}

export default function LightMove({ active, reduced }: LabMoveProps) {
  const host = useRef<HTMLDivElement>(null),
    engine = useRef<LightScene | null>(null);
  const [selected, setSelected] = useState(0),
    [lit, setLit] = useState(true);
  const [state, setState] = useState("Loading screen…");
  const [ready, setGpu] = useState(false);
  const gpu = active && ready;
  const requested = useRef({ selected, lit });
  useEffect(() => {
    requested.current = { selected, lit };
  }, [selected, lit]);
  useEffect(() => {
    if (!active || !host.current) return;
    let cancelled = false;
    setGpu(false);
    setState("Loading screen…");
    void sampleImage(screens[0].src)
      .then((first) => {
        if (cancelled || !host.current) return;
        engine.current = createLightScene(host.current, first, reduced, () => {
          if (!cancelled) {
            setGpu(false);
            setState("Static image · graphics unavailable");
          }
        });
        setGpu(Boolean(engine.current));
        setState(
          engine.current
            ? reduced
              ? "Static light · reduced motion"
              : "Screen colours light the room"
            : "Static image · graphics unavailable",
        );
        if (engine.current) {
          engine.current.illuminate(requested.current.lit);
          void sampleImage(screens[requested.current.selected].src).then(
            (sample) => {
              if (!cancelled) engine.current?.choose(sample);
            },
          );
        }
      })
      .catch(() => {
        if (!cancelled) setState("Static image · sampling unavailable");
      });
    return () => {
      cancelled = true;
      engine.current?.dispose();
      engine.current = null;
    };
    // Selection and energy are sent to the existing scene below, preserving its spring.
  }, [active, reduced]);
  useEffect(() => {
    let cancelled = false;
    void sampleImage(screens[selected].src)
      .then((sample) => {
        if (!cancelled) {
          engine.current?.choose(sample);
          if (engine.current)
            setState(screens[selected].name + " screen applied");
        }
      })
      .catch(() => {
        if (!cancelled) setState("Screenshot unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, [selected]);
  return (
    <div
      className="lm01"
      data-reduced={reduced}
      data-renderer={gpu ? "webgl" : "static"}
    >
      <div className="lm01-view">
        <div ref={host} className="lm01-scene" />
        {!gpu && (
          <div className="lm01-static">
            <img
              src={screens[selected].src}
              alt={screens[selected].name + " public screenshot"}
            />
          </div>
        )}
      </div>
      <div className="lm01-controls">
        {screens.map((screen, index) => (
          <button
            key={screen.name}
            aria-pressed={index === selected}
            onClick={() => setSelected(index)}
          >
            {screen.name}
          </button>
        ))}
        <button
          aria-pressed={lit}
          onClick={() => {
            const next = !lit;
            setLit(next);
            engine.current?.illuminate(next);
            setState(next ? "Screen light on" : "Screen light off");
          }}
        >
          Light {lit ? "on" : "off"}
        </button>
      </div>
      <p className="lm01-status" role="status">
        {state}
      </p>
    </div>
  );
}
