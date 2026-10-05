/** Solar position subset adapted from SunCalc 1.9.0 (BSD-2-Clause, Vladimir Agafonkin).
 * Copied from src/drafts/lap/solar.ts. See THIRD-PARTY.md.
 * Angles follow SunCalc: azimuth from south, positive toward west.
 */
const rad = Math.PI / 180;
const day = 86400000;
const epoch = 2451545;
const obliquity = 23.4397 * rad;
const latitude = 42.6 * rad;
const westLongitude = -20.9 * rad;
export const ZONE = "Europe/Belgrade";
/** The sun's upper edge touches the horizon at this altitude (refraction included). */
export const RISE = -0.833;
/** The viewer looks toward this compass bearing: south-west, so the afternoon sun stands behind the screens. */
export const FACING = 225;

const julian = (ms: number) => ms / day - 0.5 + 2440588;
function coordinates(days: number) {
  const anomaly = rad * (357.5291 + 0.98560028 * days);
  const centre =
    rad *
    (1.9148 * Math.sin(anomaly) +
      0.02 * Math.sin(2 * anomaly) +
      0.0003 * Math.sin(3 * anomaly));
  const longitude = anomaly + centre + rad * 102.9372 + Math.PI;
  return {
    declination: Math.asin(Math.sin(longitude) * Math.sin(obliquity)),
    rightAscension: Math.atan2(
      Math.sin(longitude) * Math.cos(obliquity),
      Math.cos(longitude),
    ),
  };
}

export interface Sun {
  /** Degrees above the horizon. */
  altitude: number;
  /** Compass bearing in degrees, clockwise from north. */
  bearing: number;
  /** Unit vector toward the sun, for a viewer who faces FACING. x: to the viewer's right, y: up, z: toward the viewer. */
  ray: [number, number, number];
  evening: boolean;
}

export function sunAt(ms: number): Sun {
  const days = julian(ms) - epoch;
  const sun = coordinates(days);
  const hour =
    rad * (280.16 + 360.9856235 * days) - westLongitude - sun.rightAscension;
  const azimuth = Math.atan2(
    Math.sin(hour),
    Math.cos(hour) * Math.sin(latitude) -
      Math.tan(sun.declination) * Math.cos(latitude),
  );
  const altitude = Math.asin(
    Math.sin(latitude) * Math.sin(sun.declination) +
      Math.cos(latitude) * Math.cos(sun.declination) * Math.cos(hour),
  );
  const bearing = ((azimuth / rad + 180) % 360 + 360) % 360;
  const flat = Math.cos(altitude);
  return {
    altitude: altitude / rad,
    bearing,
    ray: [
      flat * Math.cos((bearing - FACING - 90) * rad),
      Math.sin(altitude),
      flat * Math.cos((bearing - FACING - 180) * rad),
    ],
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
  for (const part of parts.formatToParts(ms))
    if (part.type !== "literal") out[part.type] = Number(part.value);
  return out;
}

/** Minutes after Kosovo midnight. */
export function kosovoMinutes(ms: number) {
  const f = fields(ms);
  return f.hour * 60 + f.minute + f.second / 60;
}

/** The instant of 00:00 in Kosovo on the Kosovo date of `ms`. */
export function kosovoMidnight(ms: number) {
  const f = fields(ms);
  const wall = Date.UTC(f.year, f.month - 1, f.day, f.hour, f.minute, f.second);
  const offset = wall - Math.floor(ms / 1000) * 1000;
  return Date.UTC(f.year, f.month - 1, f.day) - offset;
}

export function clockText(ms: number) {
  const m = Math.floor(kosovoMinutes(ms));
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

export interface SunDay {
  midnight: number;
  /** Altitude in degrees every 10 minutes, 145 samples. */
  path: number[];
  rise: number | null;
  set: number | null;
  noon: number;
}

/** Today's sun path in Kosovo, with sunrise, solar noon and sunset as instants. */
export function sunDay(ms: number): SunDay {
  const midnight = kosovoMidnight(ms);
  const at = (minute: number) => sunAt(midnight + minute * 60000).altitude;
  const path = Array.from({ length: 145 }, (_, i) => at(i * 10));
  const cross = (from: number, rising: boolean) => {
    for (let i = from; i < 144; i++) {
      const a = path[i] - RISE,
        b = path[i + 1] - RISE;
      if (rising ? a < 0 && b >= 0 : a >= 0 && b < 0) {
        let lo = i * 10,
          hi = lo + 10;
        for (let k = 0; k < 20; k++) {
          const mid = (lo + hi) / 2;
          if (at(mid) - RISE < 0 === rising) lo = mid;
          else hi = mid;
        }
        return midnight + hi * 60000;
      }
    }
    return null;
  };
  let top = 0;
  for (let i = 1; i < 145; i++) if (path[i] > path[top]) top = i;
  let lo = top * 10 - 10,
    hi = top * 10 + 10;
  for (let k = 0; k < 30; k++) {
    const a = lo + (hi - lo) / 3,
      b = hi - (hi - lo) / 3;
    if (at(a) < at(b)) lo = a;
    else hi = b;
  }
  return {
    midnight,
    path,
    rise: cross(0, true),
    set: cross(0, false),
    noon: midnight + ((lo + hi) / 2) * 60000,
  };
}

const compass = [
  "north",
  "north-east",
  "east",
  "south-east",
  "south",
  "south-west",
  "west",
  "north-west",
];
export const direction = (bearing: number) =>
  compass[Math.round(bearing / 45) % 8];
