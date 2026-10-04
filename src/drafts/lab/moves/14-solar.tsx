import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Mesh, Plane, Program, Renderer } from "ogl";
import { getKosovoSun, kosovoClock } from "../../lap/solar";
import type { LabMoveProps } from "../types";
import "./14-solar.css";

// A full 360° panorama from the horizon to the zenith. The disc position and
// daylight both use the calculated solar direction, including below the horizon.
const sky = `precision highp float;
varying vec2 vUv;uniform vec3 sun;
void main(){
 float azimuth=(vUv.x-.5)*6.2831853,altitude=vUv.y*1.5707963;
 vec3 ray=vec3(-sin(azimuth)*cos(altitude),sin(altitude),cos(azimuth)*cos(altitude));
 float daylight=smoothstep(-.25,.25,sun.y),horizon=pow(1.-vUv.y,2.2);
 vec3 colour=mix(vec3(.035,.025,.085),vec3(.169,.102,.290),.7);
 colour=mix(colour,vec3(1.,.478,.102),horizon*(.30+.7*daylight));
 float angle=dot(ray,normalize(sun)),visible=smoothstep(-.035,.01,sun.y);
 colour+=vec3(1.,.43,.10)*pow(max(angle,0.),24.)*.18*visible;
 colour=mix(colour,vec3(1.,.84,.48),smoothstep(.9980,.9990,angle)*visible);
 gl_FragColor=vec4(colour,1.);
}`;

export default function SolarMove({ active, reduced }: LabMoveProps) {
  const host = useRef<HTMLDivElement>(null);
  const draw = useRef<((direction: [number, number, number]) => void) | null>(
    null,
  );
  const [now, setNow] = useState(() => new Date());
  const [noon, setNoon] = useState(false);
  const sun = useMemo(
    () => getKosovoSun(now, reduced || noon),
    [now, reduced, noon],
  );
  const latest = useRef(sun.direction);
  useEffect(() => {
    latest.current = sun.direction;
  }, [sun]);
  useEffect(() => {
    if (!active || reduced) return;
    let timer = 0;
    const sync = () => {
      clearInterval(timer);
      if (!document.hidden) {
        setNow(new Date());
        timer = window.setInterval(() => setNow(new Date()), 30000);
      }
    };
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [active, reduced]);
  useEffect(() => {
    if (!active || !host.current) return;
    const element = host.current;
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    let renderer: Renderer;
    try {
      renderer = new Renderer({
        canvas,
        alpha: false,
        antialias: false,
        dpr: Math.min(devicePixelRatio, 1.5),
        powerPreference: "low-power",
      });
    } catch {
      return;
    }
    const gl = renderer.gl;
    const geometry = new Plane(gl, { width: 2, height: 2 });
    const program = new Program(gl, {
      vertex:
        "attribute vec3 position;attribute vec2 uv;varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,1.);}",
      fragment: sky,
      depthTest: false,
      depthWrite: false,
      uniforms: { sun: { value: latest.current } },
    });
    const mesh = new Mesh(gl, { geometry, program });
    let lost = false;
    draw.current = (direction) => {
      if (lost || document.hidden) return;
      program.uniforms.sun.value = direction;
      renderer.render({ scene: mesh });
    };
    const resize = new ResizeObserver(() => {
      renderer.setSize(
        Math.max(1, element.clientWidth),
        Math.max(1, element.clientHeight),
      );
      draw.current?.(latest.current);
    });
    const visibility = () => {
      if (!document.hidden) draw.current?.(latest.current);
    };
    const contextLost = (event: Event) => {
      event.preventDefault();
      lost = true;
      element.classList.remove("lm14-live");
      canvas.style.visibility = "hidden";
    };
    canvas.addEventListener("webglcontextlost", contextLost);
    document.addEventListener("visibilitychange", visibility);
    resize.observe(element);
    element.append(canvas);
    element.classList.add("lm14-live");
    return () => {
      draw.current = null;
      resize.disconnect();
      element.classList.remove("lm14-live");
      canvas.removeEventListener("webglcontextlost", contextLost);
      document.removeEventListener("visibilitychange", visibility);
      geometry.remove();
      program.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, [active]);
  useEffect(() => {
    draw.current?.(sun.direction);
  }, [sun]);
  const altitude = (sun.altitude * 180) / Math.PI;
  const azimuth = ((sun.azimuth * 180) / Math.PI + 180 + 360) % 360;
  return (
    <div className="lm14" data-reduced={reduced}>
      <div
        className="lm14-sky"
        style={
          {
            "--solar-horizon": altitude < -6 ? "#493045" : "#ff7a1a",
            "--sun-x": `${(sun.azimuth / (2 * Math.PI) + 0.5) * 100}%`,
            "--sun-y": `${100 - (altitude / 90) * 100}%`,
            "--sun-visible": altitude > 0 ? 1 : 0,
          } as CSSProperties
        }
      >
        <div ref={host} className="lm14-canvas" />
        <i className="lm14-sun" aria-hidden="true" />
        <div className="lm14-clock">
          <strong>{kosovoClock(sun.date)}</strong>
          <span>Kosovo · 42.6° N, 20.9° E</span>
        </div>
        <div className="lm14-compass" aria-hidden="true">
          <span>N</span>
          <span>E</span>
          <span>S</span>
          <span>W</span>
          <span>N</span>
        </div>
      </div>
      <div className="lm14-controls">
        <button
          disabled={!active || reduced}
          aria-pressed={!noon && !reduced}
          onClick={() => {
            setNoon(false);
            setNow(new Date());
          }}
        >
          Visitor clock
        </button>
        <button
          disabled={!active || reduced}
          aria-pressed={noon || reduced}
          onClick={() => setNoon(true)}
        >
          Solar noon
        </button>
      </div>
      <output aria-live="polite">
        {reduced
          ? "Static calculated noon"
          : noon
            ? "Calculated noon preview"
            : "Live solar position"}{" "}
        · {altitude.toFixed(1)}° altitude
      </output>
      <p>
        {azimuth.toFixed(1)}° bearing ·{" "}
        {altitude < 0 ? "sun below the horizon" : "sun above the horizon"}
      </p>
    </div>
  );
}
