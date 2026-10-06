/**
 * The light of the case pages and the 404: the sun over Kosovo at the visitor's time, as on the home page.
 * Copied from src/drafts/kosovo-time (sun.ts, light.ts, scene.ts); keep the keys in step with it.
 * Solar position adapted from SunCalc 1.9.0 (BSD-2-Clause, Vladimir Agafonkin); notice in public/lap/SunCalc-LICENSE.txt.
 * Angles follow SunCalc: azimuth from south, positive toward west.
 */

import { useLayoutEffect, useState } from "react";
import { facesLoaded } from "./caseFonts";

type Vec = [number, number, number];

const rad = Math.PI / 180;
const DAY = 86400000;
const latitude = 42.6 * rad;
const westLongitude = -20.9 * rad;
const obliquity = 23.4397 * rad;
export const ZONE = "Europe/Belgrade";
/** The sun's upper edge touches the horizon at this altitude (refraction included). */
export const RISE = -0.833;
/** The viewer looks toward this compass bearing: south-west, as on the home page. */
const FACING = 225;

export interface Sun {
  altitude: number;
  /** Unit vector toward the sun. x: to the viewer's right, y: up, z: toward the viewer. */
  ray: Vec;
  evening: boolean;
}

export function sunAt(ms: number): Sun {
  const days = ms / DAY - 0.5 + 2440588 - 2451545;
  const anomaly = rad * (357.5291 + 0.98560028 * days);
  const centre = rad * (1.9148 * Math.sin(anomaly) + 0.02 * Math.sin(2 * anomaly) + 0.0003 * Math.sin(3 * anomaly));
  const longitude = anomaly + centre + rad * 102.9372 + Math.PI;
  const declination = Math.asin(Math.sin(longitude) * Math.sin(obliquity));
  const rightAscension = Math.atan2(Math.sin(longitude) * Math.cos(obliquity), Math.cos(longitude));
  const hour = rad * (280.16 + 360.9856235 * days) - westLongitude - rightAscension;
  const azimuth = Math.atan2(
    Math.sin(hour),
    Math.cos(hour) * Math.sin(latitude) - Math.tan(declination) * Math.cos(latitude),
  );
  const altitude = Math.asin(
    Math.sin(latitude) * Math.sin(declination) + Math.cos(latitude) * Math.cos(declination) * Math.cos(hour),
  );
  const bearing = (((azimuth / rad + 180) % 360) + 360) % 360;
  const flat = Math.cos(altitude);
  return {
    altitude: altitude / rad,
    ray: [flat * Math.cos((bearing - FACING - 90) * rad), Math.sin(altitude), flat * Math.cos((bearing - FACING - 180) * rad)],
    evening: azimuth > 0,
  };
}

const parts = new Intl.DateTimeFormat("en-GB", {
  timeZone: ZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function fields(ms: number) {
  const out: Record<string, number> = {};
  for (const part of parts.formatToParts(ms)) if (part.type !== "literal") out[part.type] = Number(part.value);
  return out;
}

function kosovoMidnight(ms: number) {
  const f = fields(ms);
  const wall = Date.UTC(f.year, f.month - 1, f.day, f.hour, f.minute, f.second);
  return Date.UTC(f.year, f.month - 1, f.day) - (wall - Math.floor(ms / 1000) * 1000);
}

export function clockText(ms: number) {
  const f = fields(ms);
  return `${String(f.hour).padStart(2, "0")}:${String(f.minute).padStart(2, "0")}`;
}

/* ---------- Colour ---------- */

interface Key {
  at: number;
  sky: string;
  haze: string;
  lit: string;
  shade: string;
  ink: string;
  soft: string;
  accent: string;
}

export interface Light extends Omit<Key, "at"> {
  /** The colour of the sun's disc: orange low, near white high. */
  sun: string;
  /** 0 to 1: how much of the light is direct sun. */
  direct: number;
  name: "Night" | "Dawn" | "Day" | "Dusk";
  dark: boolean;
}

const night: Key = { at: -12, sky: "#07060f", haze: "#1a1636", lit: "#0f0d14", shade: "#0b0a10", ink: "#e8e2d6", soft: "#b9b1c4", accent: "#f2c27e" };
const deep: Key = { at: -6, sky: "#110d2a", haze: "#32265a", lit: "#1d1532", shade: "#160f27", ink: "#f3ecdf", soft: "#c6b8dc", accent: "#f6c587" };
const noon: Key = { at: 32, sky: "#a9c8e6", haze: "#e6eef2", lit: "#f7f4ec", shade: "#aeb3c3", ink: "#141414", soft: "#3a3a40", accent: "#1f2e7a" };

/* Each list runs from the horizon up. The two lists meet at the noon key. */
const morningDark: Key[] = [night, deep, { at: RISE, sky: "#1f1b4c", haze: "#6b4673", lit: "#272052", shade: "#1e1842", ink: "#fff3e6", soft: "#d3c9ec", accent: "#ffc98f" }];
const eveningDark: Key[] = [night, deep, { at: RISE, sky: "#21164a", haze: "#7a3f62", lit: "#2b1a4a", shade: "#20133a", ink: "#fff3e6", soft: "#d8c8ec", accent: "#ffc58f" }];
const morningLit: Key[] = [
  { at: RISE, sky: "#b4acd8", haze: "#f8bf9c", lit: "#f4bf98", shade: "#b6a1c1", ink: "#2a1a12", soft: "#4a3226", accent: "#003b73" },
  { at: 6, sky: "#b6bce0", haze: "#f8d0b2", lit: "#f6c7a1", shade: "#b9a5c2", ink: "#2a1a12", soft: "#4a3226", accent: "#003b73" },
  { at: 18, sky: "#afc6e6", haze: "#f2e6dc", lit: "#f8e5d0", shade: "#b4b0c4", ink: "#1d1712", soft: "#41352d", accent: "#0f3377" },
  noon,
];
const eveningLit: Key[] = [
  { at: RISE, sky: "#b29fd6", haze: "#ffaa74", lit: "#ff9a55", shade: "#a388c4", ink: "#1e1233", soft: "#2e1c49", accent: "#002a55" },
  { at: 7, sky: "#b3abdc", haze: "#ffc898", lit: "#ffbb85", shade: "#a993c6", ink: "#1e1233", soft: "#2f2040", accent: "#002a5c" },
  { at: 18, sky: "#b2c5e6", haze: "#f8e6d6", lit: "#fae7d2", shade: "#b2adc5", ink: "#18141a", soft: "#3b333f", accent: "#152d78" },
  noon,
];

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const linear = (hex: string) => [1, 3, 5].map((i) => toLinear(parseInt(hex.slice(i, i + 2), 16) / 255));

function toOklab([r, g, b]: number[]) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}
function fromOklab([L, a, b]: number[]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}
const hexOf = (rgb: number[]) =>
  "#" + rgb.map((c) => Math.round(Math.min(1, Math.max(0, toGamma(c))) * 255).toString(16).padStart(2, "0")).join("");
function mixHex(a: string, b: string, t: number) {
  if (t <= 0) return a;
  if (t >= 1) return b;
  const p = toOklab(linear(a));
  const q = toOklab(linear(b));
  return hexOf(fromOklab(p.map((v, i) => v + (q[i] - v) * t)));
}

export function luminance(hex: string) {
  const [r, g, b] = linear(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a: string, b: string) {
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

const tokens = ["sky", "haze", "lit", "shade", "ink", "soft", "accent"] as const;
const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

export function lightAt(altitude: number, evening: boolean): Light {
  const up = altitude >= RISE;
  const keys = up ? (evening ? eveningLit : morningLit) : evening ? eveningDark : morningDark;
  const a = Math.min(altitude, noon.at);
  let i = 0;
  while (i < keys.length - 2 && a > keys[i + 1].at) i++;
  const t = Math.min(1, Math.max(0, (a - keys[i].at) / (keys[i + 1].at - keys[i].at)));
  const c = {} as Record<(typeof tokens)[number], string>;
  for (const f of tokens) c[f] = mixHex(keys[i][f], keys[i + 1][f], t);
  return {
    ...c,
    sun: mixHex("#ff7a2e", "#fff2c2", smooth(0, 28, altitude)),
    direct: up ? smooth(RISE, 3, altitude) : 0,
    name: !up && altitude < -6 ? "Night" : altitude > 12 ? "Day" : evening ? "Dusk" : "Dawn",
    dark: luminance(c.lit) < 0.2,
  };
}

/** The instant the page is lit for: now, or `?at=HH:MM` Kosovo time today, as on the home page. */
export function litInstant(search = typeof location === "undefined" ? "" : location.search) {
  const now = Date.now();
  const match = /^(\d{1,2}):(\d{2})$/.exec(new URLSearchParams(search).get("at") ?? "");
  if (!match) return now;
  return kosovoMidnight(now) + Math.min(1439, Number(match[1]) * 60 + Number(match[2])) * 60000;
}

/** The ground colour now, for a route that paints before its page code arrives. */
export function groundNow() {
  const sun = sunAt(litInstant());
  return lightAt(sun.altitude, sun.evening).lit;
}

export interface PageLight {
  ms: number;
  sun: Sun;
  light: Light;
  /** The faces missed the wait, so the fallback faces stay for the visit. */
  fallback: boolean;
}

const NAMES = ["sky", "haze", "lit", "shade", "ink", "soft", "accent", "sun"] as const;

/** The page takes the light of the Kosovo sun once, when it opens, and writes it to the root as tokens. */
export function usePageLight(): PageLight {
  const [page] = useState<PageLight>(() => {
    const ms = litInstant();
    const sun = sunAt(ms);
    return { ms, sun, light: lightAt(sun.altitude, sun.evening), fallback: !facesLoaded() };
  });
  useLayoutEffect(() => {
    const html = document.documentElement;
    for (const name of NAMES) html.style.setProperty(`--cs-${name}`, page.light[name]);
    html.dataset.csDark = String(page.light.dark);
    return () => {
      for (const name of NAMES) html.style.removeProperty(`--cs-${name}`);
      delete html.dataset.csDark;
    };
  }, [page]);
  return page;
}

/* ---------- Shadows: a level camera, screens upright on the ground plane z = 0 ---------- */

interface Camera {
  cx: number;
  horizon: number;
  height: number;
  distance: number;
}
interface Panel {
  x: number;
  half: number;
  h: number;
}

function project(c: Camera, [x, y, z]: Vec): [number, number] {
  const k = c.distance / (c.distance - z);
  return [c.cx + x * k, c.horizon + (c.height - y) * k];
}

function clipNear(points: Vec[], limit: number): Vec[] {
  const out: Vec[] = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const ina = a[2] <= limit;
    const inb = b[2] <= limit;
    if (ina) out.push(a);
    if (ina !== inb) {
      const t = (limit - a[2]) / (b[2] - a[2]);
      out.push([a[0] + (b[0] - a[0]) * t, 0, limit]);
    }
  }
  return out;
}

/** The shadow of one upright screen in its ground box, as SVG polygon points; empty when the sun is down. */
export function shadowOf(box: DOMRect, screen: DOMRect, ray: Vec): string {
  if (ray[1] < 0.0005) return "";
  const horizon = Math.max(0, screen.top - box.top - Math.min(24, screen.height * 0.08));
  const camera: Camera = { cx: box.width / 2, horizon, height: screen.bottom - box.top - horizon, distance: screen.height * 4.8 };
  const panel: Panel = { x: screen.left - box.left + screen.width / 2 - camera.cx, half: screen.width / 2, h: screen.height };
  const reach = Math.min(panel.h / ray[1], panel.h * 400);
  const dx = -ray[0] * reach;
  const dz = -ray[2] * reach;
  const a: Vec = [panel.x - panel.half, 0, 0];
  const b: Vec = [panel.x + panel.half, 0, 0];
  const quad = clipNear([a, b, [b[0] + dx, 0, dz], [a[0] + dx, 0, dz]], camera.distance * 0.97);
  return quad.map((v) => project(camera, v).map((n) => n.toFixed(1)).join(",")).join(" ");
}
