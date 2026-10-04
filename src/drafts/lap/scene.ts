import {
  Box,
  Camera,
  Geometry,
  Mesh,
  Plane,
  Program,
  Renderer,
  Transform,
  Vec3,
} from "ogl";
import { getKosovoSun, solarSkyFragment } from "./solar";
import { trackAt, trackLength } from "./track";

interface Glyph {
  position: number;
  normal: number;
  index: number;
  vertices: number;
  indices: number;
  advance: number;
}
interface GlyphAtlas {
  units: number;
  glyphs: Record<string, Glyph>;
}
export interface TrackSector {
  name: string;
  colour: string;
}
export interface LapScene {
  select(index: number): void;
  throttle(amount: number, elapsed?: number): void;
  steer(direction: number): void;
  brake(): void;
  pause(value: boolean): void;
  dispose(): void;
}
const vertex = `
attribute vec3 position;attribute vec3 normal;attribute vec2 uv;
uniform mat4 modelMatrix;uniform mat4 modelViewMatrix;uniform mat4 projectionMatrix;
varying vec3 point;varying vec3 surface;varying vec2 tex;
void main(){point=(modelMatrix*vec4(position,1.)).xyz;surface=normalize(mat3(modelMatrix)*normal);tex=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const fragment = `
precision highp float;
varying vec3 point;varying vec3 surface;varying vec2 tex;
uniform vec3 colour;uniform vec3 sun;uniform vec3 cameraPosition;uniform float road;
void main(){
 vec3 n=normalize(surface),view=normalize(cameraPosition-point);
 float light=max(dot(n,normalize(sun)),0.);
 float rim=pow(1.-max(dot(n,view),0.),3.);
 vec3 material=colour;
 if(road>.5){float edge=smoothstep(.94,.96,abs(tex.x));float stripe=(1.-smoothstep(.009,.025,abs(tex.x)))*step(.45,fract(tex.y*.045));material=mix(vec3(.118,.118,.141),vec3(.95,.74,.40),max(edge,stripe*.62));}
 vec3 lit=material*(.43+light*.65)+vec3(.45,.19,.10)*rim*.18;
 float distance=length(point-cameraPosition);
 float fog=1.-exp(-distance*.0085);
 vec3 atmosphere=mix(vec3(.19,.10,.25),vec3(.71,.32,.17),smoothstep(-.1,.2,sun.y));
 gl_FragColor=vec4(mix(lit,atmosphere,clamp(fog,0.,.96)),1.);
}`;
const hex = (value: string) =>
  [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16) / 255);

function wordGeometry(
  gl: Renderer["gl"],
  label: string,
  atlas: GlyphAtlas,
  binary: ArrayBuffer,
) {
  const position: number[] = [],
    normal: number[] = [],
    indices: number[] = [],
    uv: number[] = [];
  const width =
    [...label].reduce((n, c) => n + (atlas.glyphs[c]?.advance ?? 0), 0) /
    atlas.units;
  let cursor = -width / 2;
  for (const char of label) {
    const glyph = atlas.glyphs[char];
    if (!glyph) continue;
    const p = new Int16Array(binary, glyph.position, glyph.vertices * 3),
      n = new Int8Array(binary, glyph.normal, glyph.vertices * 3),
      idx = new Uint16Array(binary, glyph.index, glyph.indices);
    const base = position.length / 3;
    for (let i = 0; i < glyph.vertices; i++) {
      position.push(
        p[i * 3] / atlas.units + cursor,
        p[i * 3 + 1] / atlas.units,
        p[i * 3 + 2] / atlas.units,
      );
      normal.push(n[i * 3] / 127, n[i * 3 + 1] / 127, n[i * 3 + 2] / 127);
      uv.push(0, 0);
    }
    for (const index of idx) indices.push(index + base);
    cursor += glyph.advance / atlas.units;
  }
  return {
    width,
    geometry: new Geometry(gl, {
      position: { size: 3, data: new Float32Array(position) },
      normal: { size: 3, data: new Float32Array(normal) },
      uv: { size: 2, data: new Float32Array(uv) },
      index: { data: new Uint16Array(indices) },
    }),
  };
}

/** OGL spline follower. Geometry arrives already outlined, extruded and triangulated. */
export async function createLapScene(
  host: HTMLElement,
  sectors: TrackSector[],
  reduced: boolean,
  changed: (index: number) => void,
  initialIndex = 0,
): Promise<LapScene | null> {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  let renderer: Renderer;
  try {
    renderer = new Renderer({
      canvas,
      alpha: false,
      antialias: true,
      dpr: Math.min(devicePixelRatio, 1.5),
      powerPreference: "low-power",
    });
  } catch {
    return null;
  }
  const gl = renderer.gl;
  let atlas: GlyphAtlas, binary: ArrayBuffer;
  try {
    [atlas, binary] = await Promise.all([
      fetch("/lap/glyphs.json").then((r) => {
        if (!r.ok) throw new Error("Glyph metadata");
        return r.json();
      }),
      fetch("/lap/glyphs.bin").then((r) => {
        if (!r.ok) throw new Error("Glyph geometry");
        return r.arrayBuffer();
      }),
    ]);
  } catch {
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return null;
  }
  const world = new Transform(),
    camera = new Camera(gl, { fov: 52, near: 0.1, far: 1500 });
  const programs: Program[] = [],
    geometries: Geometry[] = [];
  const initialSun = getKosovoSun(new Date(), reduced);
  // The circuit's fixed geographic bearing initially faces slightly beside the real sun.
  const bearing =
    Math.atan2(initialSun.direction[0], -initialSun.direction[2]) - 0.36;
  const localSun = new Vec3(),
    cameraPosition = new Vec3();
  function material(colour: string, road = false) {
    const p = new Program(gl, {
      vertex,
      fragment,
      cullFace: false,
      uniforms: {
        colour: { value: hex(colour) },
        sun: { value: localSun },
        cameraPosition: { value: cameraPosition },
        road: { value: road ? 1 : 0 },
      },
    });
    programs.push(p);
    return p;
  }
  const skyProgram = new Program(gl, {
    vertex:
      "attribute vec3 position;attribute vec2 uv;varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,1.,1.);}",
    fragment: solarSkyFragment,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      sunDirection: { value: initialSun.direction },
      heading: { value: bearing },
      aspect: { value: 1 },
    },
  });
  programs.push(skyProgram);
  const skyGeometry = new Plane(gl, { width: 2, height: 2 });
  geometries.push(skyGeometry);
  const sky = new Mesh(gl, { geometry: skyGeometry, program: skyProgram });
  sky.renderOrder = -100;
  sky.setParent(world);
  const positions: number[] = [],
    normals: number[] = [],
    uvs: number[] = [],
    indices: number[] = [];
  for (let i = 0; i <= 640; i++) {
    const distance = (i / 640) * trackLength,
      p = trackAt(distance);
    for (const side of [-1, 1]) {
      positions.push(p.x - p.dz * side * 7, 0, p.z + p.dx * side * 7);
      normals.push(0, 1, 0);
      uvs.push(side, distance);
    }
    if (i < 640) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const roadGeometry = new Geometry(gl, {
    position: { size: 3, data: new Float32Array(positions) },
    normal: { size: 3, data: new Float32Array(normals) },
    uv: { size: 2, data: new Float32Array(uvs) },
    index: { data: new Uint16Array(indices) },
  });
  geometries.push(roadGeometry);
  new Mesh(gl, {
    geometry: roadGeometry,
    program: material("#1e1e24", true),
  }).setParent(world);
  const groundGeometry = new Plane(gl, { width: 2500, height: 2500 });
  geometries.push(groundGeometry);
  const ground = new Mesh(gl, {
    geometry: groundGeometry,
    program: material("#392231"),
  });
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.12;
  ground.setParent(world);
  const boxGeometry = new Box(gl);
  geometries.push(boxGeometry);
  const car = new Transform();
  car.setParent(world);
  const cream = material("#ffefd1"),
    dark = material("#211e29"),
    hot = material("#ff7524");
  const body = new Mesh(gl, { geometry: boxGeometry, program: cream });
  body.scale.set(1.35, 0.3, 3.1);
  body.setParent(car);
  const cockpit = new Mesh(gl, { geometry: boxGeometry, program: dark });
  cockpit.scale.set(0.78, 0.28, 1.3);
  cockpit.position.set(0, 0.26, 0.1);
  cockpit.setParent(car);
  for (const side of [-1, 1]) {
    const wing = new Mesh(gl, { geometry: boxGeometry, program: cream });
    wing.scale.set(0.45, 0.18, 1.8);
    wing.position.set(side * 1.12, -0.03, 0.28);
    wing.rotation.z = side * 0.12;
    wing.setParent(car);
    const exhaust = new Mesh(gl, { geometry: boxGeometry, program: hot });
    exhaust.scale.set(0.3, 0.12, 0.22);
    exhaust.position.set(side * 0.49, 0, 1.65);
    exhaust.setParent(car);
  }
  const shadowGeometry = new Plane(gl, { width: 3.6, height: 5 });
  geometries.push(shadowGeometry);
  const shadowProgram = new Program(gl, {
    vertex:
      "attribute vec3 position;attribute vec2 uv;uniform mat4 modelViewMatrix;uniform mat4 projectionMatrix;varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragment:
      "precision highp float;varying vec2 v;void main(){float a=(1.-smoothstep(.15,.6,length((v-.5)*vec2(1.,.8))))*.6;gl_FragColor=vec4(.025,.02,.035,a);}",
    transparent: true,
    depthWrite: false,
  });
  programs.push(shadowProgram);
  const shadow = new Mesh(gl, {
    geometry: shadowGeometry,
    program: shadowProgram,
  });
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.015;
  shadow.setParent(world);
  const words = new Map<number, { meshes: Mesh[]; width: number }>();
  function addWord(index: number) {
    if (words.has(index)) return words.get(index)!;
    const result = wordGeometry(gl, sectors[index].name, atlas, binary);
    geometries.push(result.geometry);
    const program = material(sectors[index].colour);
    const meshes = [
      new Mesh(gl, { geometry: result.geometry, program }),
      new Mesh(gl, { geometry: result.geometry, program }),
    ];
    for (const mesh of meshes) mesh.setParent(world);
    const value = { meshes, width: result.width };
    words.set(index, value);
    return value;
  }
  const sectorLength = trackLength / sectors.length;
  let distance = initialIndex * sectorLength,
    target = distance,
    velocity = 0,
    lane = 0,
    laneTarget = 0,
    laneVelocity = 0,
    frame = 0,
    previous = 0,
    visible = true,
    paused = false,
    disposed = false,
    lastSector = -1,
    lastSun = 0,
    clock = 0;
  function sectorAt(value: number) {
    return (
      ((Math.floor(value / sectorLength) % sectors.length) + sectors.length) %
      sectors.length
    );
  }
  function draw() {
    const arrival = reduced ? 1 : 1 - Math.pow(1 - Math.min(clock / 1.1, 1), 3);
    const centre = trackAt(distance),
      ahead = trackAt(distance + 32),
      rear = trackAt(distance - 9.5 - (1 - arrival) * 4),
      rightX = -centre.dz,
      rightZ = centre.dx;
    car.position.set(
      centre.x + rightX * lane,
      0.78 + (reduced || paused ? 0 : Math.sin(clock * 2.1) * 0.035),
      centre.z + rightZ * lane,
    );
    car.rotation.y = Math.atan2(-centre.dx, -centre.dz);
    car.rotation.z = -laneVelocity * 0.022;
    shadow.position.set(car.position.x, 0.018, car.position.z);
    shadow.rotation.z = car.rotation.y;
    camera.position.set(
      rear.x + rightX * lane * 0.3,
      3.8 + (1 - arrival) * 0.8,
      rear.z + rightZ * lane * 0.3,
    );
    camera.lookAt(new Vec3(ahead.x, 2.1, ahead.z));
    cameraPosition.copy(camera.position);
    const current = sectorAt(distance);
    if (current !== lastSector) {
      lastSector = current;
      changed(current);
      host.dataset.sector = String(current + 1);
    }
    for (const value of words.values())
      for (const mesh of value.meshes) mesh.visible = false;
    const currentLap = Math.floor(distance / sectorLength);
    for (let offset = 0; offset < 3; offset++) {
      const index =
        (((currentLap + offset) % sectors.length) + sectors.length) %
        sectors.length;
      const word = addWord(index),
        narrow = host.clientWidth < 600,
        scale = Math.min(7.2, (narrow ? 10 : 22) / word.width);
      const approach = trackAt((currentLap + offset) * sectorLength - 9.5);
      for (let side = 0; side < 2; side++) {
        const p = trackAt(
          (currentLap + offset) * sectorLength + (side ? (narrow ? 80 : 64) : narrow ? 60 : 36),
        );
        const mesh = word.meshes[side],
          direction = side ? 1 : -1;
        const lateral = 7.5 + (word.width * scale) / 2;
        mesh.visible = true;
        mesh.scale.set(scale, scale, scale * 1.65);
        mesh.position.set(
          p.x - p.dz * direction * lateral,
          0.35,
          p.z + p.dx * direction * lateral,
        );
        // Fixed roadside signs face the sector's approach, so both front faces
        // read correctly; this does not billboard them as the racer passes.
        mesh.rotation.y = Math.atan2(
          approach.x - mesh.position.x,
          approach.z - mesh.position.z,
        );
      }
    }
    const now = Date.now();
    if (now - lastSun > 30000 || !lastSun) {
      const sun = getKosovoSun(new Date(now), reduced),
        c = Math.cos(bearing),
        s = Math.sin(bearing);
      localSun.set(
        sun.direction[0] * c + sun.direction[2] * s,
        sun.direction[1],
        -sun.direction[0] * s + sun.direction[2] * c,
      );
      skyProgram.uniforms.sunDirection.value = sun.direction;
      host.dataset.solarAltitude = ((sun.altitude * 180) / Math.PI).toFixed(2);
      lastSun = now;
    }
    skyProgram.uniforms.heading.value =
      bearing + Math.atan2(centre.dx, -centre.dz);
    host.dataset.speed = Math.abs(velocity).toFixed(2);
    host.dataset.position = distance.toFixed(2);
    host.dataset.lane = lane.toFixed(2);
    renderer.render({ scene: world, camera });
  }
  function tick(now: number) {
    frame = 0;
    if (disposed || !visible || document.hidden || paused) {
      previous = 0;
      return;
    }
    const dt = previous ? Math.min(0.025, (now - previous) / 1000) : 1 / 60;
    previous = now;
    clock += dt;
    velocity += (350 * (target - distance) - 35 * velocity) * dt;
    distance += velocity * dt;
    laneVelocity += (350 * (laneTarget - lane) - 35 * laneVelocity) * dt;
    lane += laneVelocity * dt;
    draw();
    if (!reduced) frame = requestAnimationFrame(tick);
  }
  function resume() {
    if (
      !frame &&
      !reduced &&
      !paused &&
      visible &&
      !document.hidden &&
      !disposed
    ) {
      previous = 0;
      frame = requestAnimationFrame(tick);
    } else if (reduced && !disposed) draw();
  }
  const resize = new ResizeObserver(() => {
    const w = host.clientWidth,
      h = host.clientHeight;
    renderer.setSize(Math.max(1, w), Math.max(1, h));
    camera.perspective({ aspect: w / Math.max(1, h), fov: w < 600 ? 90 : 52 });
    skyProgram.uniforms.aspect.value = w / Math.max(1, h);
    draw();
  });
  resize.observe(host);
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    host.dataset.paused = String(!visible || document.hidden || paused);
    if (!visible) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    resume();
  });
  observer.observe(host);
  function visibility() {
    host.dataset.paused = String(!visible || document.hidden || paused);
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
    } else resume();
  }
  document.addEventListener("visibilitychange", visibility);
  function contextLost(event: Event) {
    event.preventDefault();
    cancelAnimationFrame(frame);
    frame = 0;
    host.dataset.renderer = "fallback";
    canvas.style.visibility = "hidden";
  }
  canvas.addEventListener("webglcontextlost", contextLost);
  host.append(canvas);
  host.dataset.renderer = "ogl";
  draw();
  resume();
  return {
    select(index) {
      const lap = Math.round((distance - index * sectorLength) / trackLength);
      target = lap * trackLength + index * sectorLength;
      if (reduced || paused) {
        velocity = 0;
        distance = target;
        draw();
      } else resume();
    },
    throttle(amount, elapsed = 16) {
      if (reduced || paused) return;
      const step = Math.max(-14, Math.min(22, amount));
      target += step;
      velocity = Math.max(
        -110,
        Math.min(
          150,
          velocity + (step / Math.max(0.016, elapsed / 1000)) * 0.12,
        ),
      );
      resume();
    },
    steer(direction) {
      laneTarget = Math.max(-3.8, Math.min(3.8, direction * 3.8));
      if (reduced) {
        lane = laneTarget;
        draw();
      }
    },
    brake() {
      target = distance + velocity * 0.035;
      laneTarget = 0;
      resume();
    },
    pause(value) {
      paused = value;
      host.dataset.paused = String(value);
      if (value) {
        cancelAnimationFrame(frame);
        frame = 0;
        target = distance;
        velocity = 0;
        draw();
      } else resume();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      canvas.removeEventListener("webglcontextlost", contextLost);
      for (const geometry of geometries) geometry.remove();
      for (const program of programs) program.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    },
  };
}
