import { RISE } from "./sun";

/** One lighting key. `lit` is the ground in sun, `shade` the ground in shadow (sky light only),
 * `sky` the sky at the top of the page and `haze` the sky at the horizon. */
export interface Key {
  at: number;
  sky: string;
  haze: string;
  lit: string;
  shade: string;
  ink: string;
  soft: string;
  accent: string;
}
export interface Light {
  sky: string;
  /** The sky at the middle of the gradient. */
  mid: string;
  haze: string;
  lit: string;
  shade: string;
  ink: string;
  soft: string;
  accent: string;
  /** Linear RGB for the renderer. */
  litLinear: [number, number, number];
  shadeLinear: [number, number, number];
  /** The colour of the sun's disc: orange low, near white high. */
  sun: string;
  /** 0 to 1: how much of the light is direct sun. */
  direct: number;
  /** 0 to 1: how far the screens' own light shows on the ground. */
  glow: number;
  name: "Night" | "Dawn" | "Day" | "Dusk";
}

const night: Key = { at: -12, sky: "#07060f", haze: "#1a1636", lit: "#0f0d14", shade: "#0b0a10", ink: "#e8e2d6", soft: "#b9b1c4", accent: "#f2c27e" };
const deep: Key = { at: -6, sky: "#110d2a", haze: "#32265a", lit: "#1d1532", shade: "#160f27", ink: "#f3ecdf", soft: "#c6b8dc", accent: "#f6c587" };
const noon: Key = { at: 32, sky: "#4f9ee0", haze: "#f6d7a4", lit: "#f7eedb", shade: "#8f84d6", ink: "#141414", soft: "#2a2a31", accent: "#17236c" };

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

const toLinear = (c: number) =>
  c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
const toGamma = (c: number) =>
  c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
export function linear(hex: string): [number, number, number] {
  return [1, 3, 5].map((i) => toLinear(parseInt(hex.slice(i, i + 2), 16) / 255)) as [number, number, number];
}
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
const hex = (rgb: number[]) =>
  "#" +
  rgb
    .map((c) => Math.round(Math.min(1, Math.max(0, toGamma(c))) * 255).toString(16).padStart(2, "0"))
    .join("");
function mixHex(a: string, b: string, t: number) {
  if (t <= 0) return a;
  if (t >= 1) return b;
  const p = toOklab(linear(a)),
    q = toOklab(linear(b));
  return hex(fromOklab(p.map((v, i) => v + (q[i] - v) * t)));
}

export function luminance(hexColour: string) {
  const [r, g, b] = linear(hexColour);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a: string, b: string) {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/** The middle of the sky gradient: the plain sRGB middle, lifted toward a bright haze as the sun climbs past 12°,
 * so the high sun reads as blue over a sunlit horizon, not as grey between them. */
const middle = (sky: string, haze: string, altitude: number) => {
  const avg = "#" + [1, 3, 5].map((i) => Math.round((parseInt(sky.slice(i, i + 2), 16) + parseInt(haze.slice(i, i + 2), 16)) / 2).toString(16).padStart(2, "0")).join("");
  return mixHex(avg, "#fbf6ec", 0.72 * smoothstep(12, 32, altitude));
};
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

const fields = ["sky", "haze", "lit", "shade", "ink", "soft", "accent"] as const;
function along(keys: Key[], altitude: number) {
  let i = 0;
  while (i < keys.length - 2 && altitude > keys[i + 1].at) i++;
  const a = keys[i],
    b = keys[i + 1];
  const t = Math.min(1, Math.max(0, (altitude - a.at) / (b.at - a.at)));
  const out = {} as Record<(typeof fields)[number], string>;
  for (const f of fields) out[f] = mixHex(a[f], b[f], t);
  return out;
}

/** The page light for a sun altitude. The ground switches from sky light to sunlight when the sun's edge crosses the horizon. */
export function lightAt(altitude: number, evening: boolean): Light {
  const up = altitude >= RISE;
  const keys = up ? (evening ? eveningLit : morningLit) : evening ? eveningDark : morningDark;
  const c = along(keys, Math.min(altitude, noon.at));
  const smooth = (e0: number, e1: number, x: number) => {
    const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
    return t * t * (3 - 2 * t);
  };
  const glow = (1 - smooth(0.02, 0.2, luminance(c.lit))) * 0.2;
  const name = !up ? "Night" : altitude > 12 ? "Day" : evening ? "Dusk" : "Dawn";
  return {
    ...c,
    mid: middle(c.sky, c.haze, up ? altitude : 0),
    sun: mixHex("#ff7a2e", "#fff2c2", smooth(0, 28, altitude)),
    litLinear: linear(c.lit),
    shadeLinear: linear(c.shade),
    direct: up ? smooth(RISE, 3, altitude) : 0,
    glow,
    name,
  };
}

/** The four lights the footer states, at fixed altitudes. */
export const anchors = [
  { label: "Dawn", altitude: 4, evening: false },
  { label: "Day", altitude: 40, evening: false },
  { label: "Dusk", altitude: 2, evening: true },
  { label: "Night", altitude: -30, evening: true },
] as const;
