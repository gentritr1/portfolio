/** Solar position subset adapted from SunCalc 1.9.0 (BSD-2-Clause, Vladimir Agafonkin).
 * Coordinates are Kosovo, not a claim about the visitor's location.
 * See THIRD-PARTY.md. Angles follow SunCalc: azimuth from south, positive west.
 */
const rad = Math.PI / 180;
const day = 86400000;
const epoch = 2451545;
const obliquity = 23.4397 * rad;
const latitude = 42.6 * rad;
const westLongitude = -20.9 * rad;
const julian = (date: Date) => date.valueOf() / day - 0.5 + 2440588;
function coordinates(days: number) {
  const anomaly = rad * (357.5291 + 0.98560028 * days);
  const centre =
    rad *
    (1.9148 * Math.sin(anomaly) +
      0.02 * Math.sin(2 * anomaly) +
      0.0003 * Math.sin(3 * anomaly));
  const longitude = anomaly + centre + rad * 102.9372 + Math.PI;
  return {
    anomaly,
    longitude,
    declination: Math.asin(Math.sin(longitude) * Math.sin(obliquity)),
    rightAscension: Math.atan2(
      Math.sin(longitude) * Math.cos(obliquity),
      Math.cos(longitude),
    ),
  };
}
export function kosovoSolarNoon(date: Date): Date {
  const days = julian(date) - epoch;
  const cycle = Math.round(days - 0.0009 - westLongitude / (2 * Math.PI));
  const estimate = 0.0009 + westLongitude / (2 * Math.PI) + cycle;
  const sun = coordinates(estimate);
  const noon =
    epoch +
    estimate +
    0.0053 * Math.sin(sun.anomaly) -
    0.0069 * Math.sin(2 * sun.longitude);
  return new Date((noon + 0.5 - 2440588) * day);
}
export function getKosovoSun(date = new Date(), staticNoon = false) {
  const instant = staticNoon ? kosovoSolarNoon(date) : date;
  const days = julian(instant) - epoch;
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
  return {
    azimuth,
    altitude,
    direction: [
      -Math.sin(azimuth) * Math.cos(altitude),
      Math.sin(altitude),
      Math.cos(azimuth) * Math.cos(altitude),
    ] as [number, number, number],
    date: instant,
  };
}
export function kosovoClock(date = new Date()) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Belgrade",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/** Shared verbatim by the scene and the motion-lab solar tile. */
export const solarSkyFragment = `
precision highp float;
varying vec2 vUv;
uniform vec3 sunDirection;
uniform float heading;
uniform float aspect;
void main(){
  vec2 p=(vUv-.5)*vec2(aspect,1.);
  vec3 ray=normalize(vec3(p.x,p.y+.10,-.76));
  float c=cos(heading),s=sin(heading);
  ray=vec3(ray.x*c-ray.z*s,ray.y,ray.x*s+ray.z*c);
  float daylight=smoothstep(-.25,.25,sunDirection.y);
  vec3 dusk=vec3(1.,.478,.102), zenith=vec3(.169,.102,.290);
  vec3 night=vec3(.035,.025,.085);
  float horizon=pow(1.-clamp(ray.y*.85+.28,0.,1.),2.2);
  vec3 sky=mix(mix(night,zenith,.7),dusk,horizon*(.30+.7*daylight));
  float angle=dot(ray,normalize(sunDirection));
  float visible=smoothstep(-.035,.01,sunDirection.y);
  float disc=smoothstep(.9986,.9992,angle)*visible;
  float atmosphere=pow(max(angle,0.),14.)*.19*visible;
  sky+=vec3(1.,.43,.10)*atmosphere;
  sky=mix(sky,vec3(1.,.84,.48),disc);
  gl_FragColor=vec4(sky,1.);
}`;
