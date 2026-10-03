import { Geometry, type OGLRenderingContext } from "ogl";

/** Four low-poly rounded rings make a shallow enclosure with a real metal bevel. */
export function deviceGeometry(
  gl: OGLRenderingContext,
  width: number,
  height: number,
  depth: number,
  radius: number,
) {
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  const segments = 8;
  const count = (segments + 1) * 4;
  const bevel = 0.027;
  const rings = [
    { inset: bevel, z: -depth / 2, nz: -0.8 },
    { inset: 0, z: -depth / 2 + bevel, nz: -0.25 },
    { inset: 0, z: depth / 2 - bevel, nz: 0.25 },
    { inset: bevel, z: depth / 2, nz: 0.8 },
  ];
  for (const ring of rings) {
    for (let corner = 0; corner < 4; corner++) {
      const cx = (corner === 0 || corner === 3 ? 1 : -1) * (width / 2 - radius);
      const cy = (corner < 2 ? 1 : -1) * (height / 2 - radius);
      for (let step = 0; step <= segments; step++) {
        const angle = ((corner + step / segments) * Math.PI) / 2;
        const x = Math.cos(angle),
          y = Math.sin(angle);
        positions.push(
          cx + x * (radius - ring.inset),
          cy + y * (radius - ring.inset),
          ring.z,
        );
        const side = Math.sqrt(1 - ring.nz * ring.nz);
        normals.push(x * side, y * side, ring.nz);
      }
    }
  }
  for (let ring = 0; ring < rings.length - 1; ring++) {
    for (let i = 0; i < count; i++) {
      const a = ring * count + i,
        b = ring * count + ((i + 1) % count);
      indices.push(a, b, b + count, a, b + count, a + count);
    }
  }
  for (const face of [-1, 1]) {
    const center = positions.length / 3;
    positions.push(0, 0, (face * depth) / 2);
    normals.push(0, 0, face);
    const ringStart = face < 0 ? 0 : count * 3;
    for (let i = 0; i < count; i++) {
      const a = ringStart + i,
        b = ringStart + ((i + 1) % count);
      indices.push(center, face < 0 ? b : a, face < 0 ? a : b);
    }
  }
  return new Geometry(gl, {
    position: { size: 3, data: new Float32Array(positions) },
    normal: { size: 3, data: new Float32Array(normals) },
    index: { data: new Uint16Array(indices) },
  });
}
