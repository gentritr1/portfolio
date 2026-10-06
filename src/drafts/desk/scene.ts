import {
  Box,
  Camera,
  Geometry,
  Mesh,
  Plane,
  Program,
  Raycast,
  Renderer,
  Texture,
  Transform,
} from "ogl";
import { deviceGeometry } from "./geometry";
import { objects } from "./objects";

const surfaceVertex = `attribute vec3 position;attribute vec3 normal;uniform mat4 modelViewMatrix;uniform mat4 projectionMatrix;uniform mat3 normalMatrix;varying vec3 vNormal;void main(){vNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const screenVertex = `attribute vec3 position;attribute vec2 uv;uniform mat4 modelViewMatrix;uniform mat4 projectionMatrix;varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const surface = `precision highp float;varying vec3 vNormal;uniform vec3 uColour;void main(){vec3 n=normalize(vNormal);float light=max(dot(n,normalize(vec3(-.6,1.2,1.5))),0.);float edge=pow(max(dot(n,normalize(vec3(1.2,.3,1.))),0.),12.);gl_FragColor=vec4(uColour*(.56+.44*light)+vec3(edge*.09),1.);}`;
const screen = `precision highp float;varying vec2 vUv;uniform sampler2D uImage;uniform vec4 uBox;void main(){vec2 p=uBox.xy+vUv*uBox.zw;gl_FragColor=vec4(texture2D(uImage,p).rgb,1.);}`;

export interface DeskScene {
  select: (index: number) => void;
  replay: () => void;
  dispose: () => void;
}

export function createDesk(
  host: HTMLElement,
  images: HTMLImageElement[],
  onReady: () => void,
  onSelect: (index: number) => void,
  onUnavailable: () => void,
): DeskScene | null {
  host.dataset.deskState = "initializing";
  delete host.dataset.deskError;
  let renderer: Renderer;
  try {
    renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(devicePixelRatio, 1.5),
      powerPreference: "low-power",
    });
  } catch {
    return null;
  }
  const gl = renderer.gl;
  const canvas = gl.canvas as HTMLCanvasElement;
  gl.clearColor(0, 0, 0, 0);
  let disposed = false,
    frame = 0,
    visible = true,
    started = performance.now(),
    active = 0,
    hover = -1,
    ready = false;
  let resizeObserver: ResizeObserver | undefined,
    intersectionObserver: IntersectionObserver | undefined;
  const geometry: Geometry[] = [],
    programs: Program[] = [],
    textures: Texture[] = [];
  const scene = new Transform();
  const camera = new Camera(gl, { fov: 36, near: 0.1, far: 80 });
  const pickable: Mesh[] = [],
    owners = new Map<Mesh, number>(),
    groups: Transform[] = [],
    heights: number[] = [];
  const ray = new Raycast();
  let request = () => {};

  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    document.removeEventListener("visibilitychange", visibility);
    canvas.removeEventListener("pointermove", pointerMove);
    canvas.removeEventListener("pointerleave", pointerLeave);
    canvas.removeEventListener("click", click);
    canvas.removeEventListener("webglcontextlost", lost);
    if (!gl.isContextLost()) {
      geometry.forEach((item) => item.remove());
      programs.forEach((item) => {
        item.remove();
        gl.deleteShader(item.vertexShader);
        gl.deleteShader(item.fragmentShader);
      });
      textures.forEach((item) => gl.deleteTexture(item.texture));
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
    canvas.remove();
  }
  function unavailable(error?: unknown) {
    host.dataset.deskState = error ? "failed" : "unavailable";
    if (error) {
      host.dataset.deskError =
        error instanceof Error ? error.message : String(error);
      console.error("[Desk scene] Rendering failed:", error);
    }
    dispose();
    onUnavailable();
  }
  function lost(event: Event) {
    event.preventDefault();
    unavailable();
  }
  function visibility() {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else request();
  }
  function hit(event: PointerEvent | MouseEvent) {
    const box = canvas.getBoundingClientRect();
    ray.castMouse(camera, [
      ((event.clientX - box.left) / box.width) * 2 - 1,
      1 - ((event.clientY - box.top) / box.height) * 2,
    ]);
    const mesh = ray.intersectMeshes(pickable, { cullFace: false })[0];
    return mesh ? (owners.get(mesh) ?? -1) : -1;
  }
  function pointerMove(event: PointerEvent) {
    const next = hit(event);
    if (hover !== next) {
      hover = next;
      canvas.style.cursor = next < 0 ? "default" : "pointer";
      request();
    }
  }
  function pointerLeave() {
    hover = -1;
    request();
  }
  function click(event: MouseEvent) {
    const index = hit(event);
    if (index >= 0) {
      active = index;
      request();
      onSelect(index);
    }
  }

  try {
    function material(colour: number[]) {
      const program = new Program(gl, {
        vertex: surfaceVertex,
        fragment: surface,
        uniforms: { uColour: { value: colour } },
      });
      programs.push(program);
      return program;
    }
    const cyan = material([0.27, 0.7, 0.69]),
      dark = material([0.12, 0.16, 0.15]),
      cream = material([0.96, 0.91, 0.73]),
      orange = material([0.92, 0.29, 0.11]),
      blue = material([0.08, 0.35, 0.63]);
    function box(
      width: number,
      height: number,
      depth: number,
      program: Program,
      parent: Transform,
      position: [number, number, number],
      owner = -1,
    ) {
      const shape = new Box(gl, { width, height, depth });
      geometry.push(shape);
      const mesh = new Mesh(gl, { geometry: shape, program });
      mesh.position.set(...position);
      mesh.setParent(parent);
      if (owner >= 0) {
        pickable.push(mesh);
        owners.set(mesh, owner);
      }
      return mesh;
    }
    // A solid tabletop, real legs, and a recessed front edge establish the workbench.
    box(7.7, 0.24, 4.25, cyan, scene, [0, -0.14, 0.15]);
    for (const x of [-3.05, 3.05])
      for (const z of [-1.28, 1.57])
        box(0.24, 1.65, 0.24, dark, scene, [x, -1.05, z]);
    box(6.6, 0.18, 0.12, cyan, scene, [0, -0.45, 1.75]);

    function group(
      index: number,
      position: [number, number, number],
      rotation: [number, number, number],
    ) {
      const node = new Transform();
      node.position.set(...position);
      node.rotation.set(...rotation);
      node.setParent(scene);
      groups[index] = node;
      heights[index] = position[1];
      return node;
    }
    function enclosure(
      width: number,
      height: number,
      depth: number,
      radius: number,
      parent: Transform,
      owner: number,
      program = dark,
    ) {
      const shape = deviceGeometry(gl, width, height, depth, radius);
      geometry.push(shape);
      const mesh = new Mesh(gl, { geometry: shape, program });
      mesh.setParent(parent);
      pickable.push(mesh);
      owners.set(mesh, owner);
    }
    function imagePlane(
      index: number,
      width: number,
      height: number,
      z: number,
      parent: Transform,
    ) {
      const image = images[index];
      const texture = new Texture(gl, {
        image,
        generateMipmaps: false,
        minFilter: gl.LINEAR,
        magFilter: gl.LINEAR,
      });
      textures.push(texture);
      const area = objects[index].screen ?? { x: 0, y: 0, w: 1, h: 1 };
      const areaAspect =
          (area.w * image.naturalWidth) / (area.h * image.naturalHeight),
        aspect = width / height;
      const w = areaAspect > aspect ? (area.w * aspect) / areaAspect : area.w;
      const h = areaAspect > aspect ? area.h : (area.h * areaAspect) / aspect;
      const top = area.y + (area.h - h) / 2;
      const box = [area.x + (area.w - w) / 2, 1 - top - h, w, h];
      const program = new Program(gl, {
        vertex: screenVertex,
        fragment: screen,
        uniforms: { uImage: { value: texture }, uBox: { value: box } },
      });
      programs.push(program);
      const shape = new Plane(gl, { width, height });
      geometry.push(shape);
      const mesh = new Mesh(gl, { geometry: shape, program });
      mesh.position.z = z;
      mesh.setParent(parent);
      pickable.push(mesh);
      owners.set(mesh, index);
    }
    const monitor = group(0, [-0.8, 1.65, -0.9], [0, 0.08, 0]);
    enclosure(3.7, 2.26, 0.17, 0.13, monitor, 0, cream);
    imagePlane(0, 3.45, 1.98, 0.089, monitor);
    box(0.22, 0.7, 0.2, cream, scene, [-0.8, 0.39, -0.92]);
    box(1.4, 0.1, 0.68, cream, scene, [-0.8, 0.02, -0.82]);
    const phone = group(1, [2.31, 0.64, 0.32], [-0.3, -0.32, 0.1]);
    enclosure(0.78, 1.57, 0.14, 0.1, phone, 1);
    imagePlane(1, 0.68, 1.43, 0.074, phone);
    const book = group(2, [-2.24, 0.15, 1.12], [-Math.PI / 2, 0, -0.2]);
    enclosure(1.08, 1.65, 0.18, 0.06, book, 2, blue);
    imagePlane(2, 0.97, 1.5, 0.094, book);
    const card = group(3, [0.02, 0.065, 1.19], [-Math.PI / 2, 0, 0.19]);
    enclosure(1.4, 1.16, 0.06, 0.05, card, 3, orange);
    imagePlane(3, 1.26, 1.02, 0.034, card);
    const calendar = group(4, [2.44, 0.065, -1.1], [-Math.PI / 2, 0, -0.12]);
    enclosure(1.29, 0.99, 0.08, 0.05, calendar, 4, cream);
    imagePlane(4, 1.15, 0.85, 0.044, calendar);
    // The keyboard is part of the monitor object, so it opens the same project.
    const keyboard = new Transform();
    keyboard.position.set(-0.66, 0.02, 0.56);
    keyboard.rotation.y = 0.08;
    keyboard.setParent(scene);
    box(2.12, 0.08, 0.64, cream, keyboard, [0, 0, 0], 0);
    for (let y = 0; y < 3; y++)
      for (let x = 0; x < 11; x++)
        box(
          0.135,
          0.04,
          0.105,
          dark,
          keyboard,
          [-0.9 + x * 0.18, 0.06, -0.19 + y * 0.18],
          0,
        );
    if (
      programs.some(
        (program) => !gl.getProgramParameter(program.program, gl.LINK_STATUS),
      )
    )
      throw new Error("Desk shader failed");
    scene.traverse((node) => {
      if (!(node instanceof Mesh)) return;
      node.program.attributeLocations.forEach(
        (_location: number, attribute: WebGLActiveInfo) => {
          if (!node.geometry.attributes[attribute.name])
            throw new Error(
              `Desk mesh ${node.id} is missing the ${attribute.name} shader attribute`,
            );
        },
      );
    });
    textures.forEach((texture) => texture.update(0));
    if (gl.getError() !== gl.NO_ERROR)
      throw new Error("Desk texture upload failed");

    let aspect = 1.5;
    function render(now: number) {
      frame = 0;
      if (disposed || !visible || document.hidden) return;
      const t = Math.min(1, (now - started) / 1500),
        eased = 1 - Math.pow(1 - t, 4);
      const distance = Math.max(9.8, 8.4 / aspect);
      camera.position.set(
        2.2 + (1 - eased) * 2,
        5.5 + (1 - eased) * 1.8,
        distance + (1 - eased) * 1.8,
      );
      camera.lookAt([0, 0.3, 0.1]);
      let moving = t < 1;
      groups.forEach((node, index) => {
        const target =
          heights[index] +
          (hover === index ? 0.18 : active === index ? 0.055 : 0);
        node.position.y += (target - node.position.y) * 0.18;
        if (Math.abs(target - node.position.y) > 0.001) moving = true;
      });
      try {
        renderer.render({ scene, camera });
        if (!ready) {
          gl.finish();
          const error = gl.getError();
          if (error !== gl.NO_ERROR || gl.isContextLost())
            throw new Error(`Desk first frame failed (WebGL ${error})`);
          ready = true;
          host.dataset.deskState = "ready";
          onReady();
        }
      } catch (error) {
        unavailable(error);
        return;
      }
      if (moving) request();
    }
    request = () => {
      if (!disposed && visible && !document.hidden && !frame)
        frame = requestAnimationFrame(render);
    };
    function resize() {
      const box = host.getBoundingClientRect();
      if (!box.width || !box.height) return;
      aspect = box.width / box.height;
      renderer.setSize(box.width, box.height);
      camera.perspective({ aspect });
      request();
    }
    host.appendChild(canvas);
    canvas.addEventListener("pointermove", pointerMove);
    canvas.addEventListener("pointerleave", pointerLeave);
    canvas.addEventListener("click", click);
    canvas.addEventListener("webglcontextlost", lost);
    document.addEventListener("visibilitychange", visibility);
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) request();
      else {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    });
    intersectionObserver.observe(host);
    resize();
    return {
      select(index) {
        active = index;
        request();
      },
      replay() {
        started = performance.now();
        request();
      },
      dispose,
    };
  } catch (error) {
    unavailable(error);
    return null;
  }
}
