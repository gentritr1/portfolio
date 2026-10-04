/** Closed Catmull–Rom circuit, resampled by arc length for a stable throttle. */
const control = [
  [0, 0],
  [0, -150],
  [85, -290],
  [235, -260],
  [285, -110],
  [205, 55],
  [60, 95],
  [-65, 50],
];
export interface TrackPoint {
  x: number;
  z: number;
  dx: number;
  dz: number;
}
function spline(t: number) {
  const n = control.length,
    i = Math.floor(t),
    f = t - i;
  const a = control[(i - 1 + n) % n],
    b = control[i % n],
    c = control[(i + 1) % n],
    d = control[(i + 2) % n];
  return [0, 1].map(
    (k) =>
      0.5 *
      (2 * b[k] +
        (-a[k] + c[k]) * f +
        (2 * a[k] - 5 * b[k] + 4 * c[k] - d[k]) * f * f +
        (-a[k] + 3 * b[k] - 3 * c[k] + d[k]) * f * f * f),
  );
}
const samples = Array.from({ length: 1281 }, (_, i) =>
  spline((i / 1280) * control.length),
);
const lengths = [0];
for (let i = 1; i < samples.length; i++)
  lengths.push(
    lengths[i - 1] +
      Math.hypot(
        samples[i][0] - samples[i - 1][0],
        samples[i][1] - samples[i - 1][1],
      ),
  );
export const trackLength = lengths[lengths.length - 1];
export function trackAt(distance: number): TrackPoint {
  const d = ((distance % trackLength) + trackLength) % trackLength;
  let low = 0,
    high = lengths.length - 1;
  while (high - low > 1) {
    const mid = (low + high) >> 1;
    if (lengths[mid] <= d) low = mid;
    else high = mid;
  }
  const a = samples[low],
    b = samples[high],
    fraction = (d - lengths[low]) / (lengths[high] - lengths[low]);
  const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return {
    x: a[0] + (b[0] - a[0]) * fraction,
    z: a[1] + (b[1] - a[1]) * fraction,
    dx: (b[0] - a[0]) / length,
    dz: (b[1] - a[1]) / length,
  };
}
