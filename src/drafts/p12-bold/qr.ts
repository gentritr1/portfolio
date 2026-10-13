/**
 * A small QR Code encoder for this draft: byte mode, versions 1 to 10, levels L, M, Q, H.
 * It follows ISO/IEC 18004: Reed-Solomon over GF(256), eight mask patterns scored by the
 * four standard penalty rules, and the format and version words. The result is a square
 * grid of dark and light modules. No image is used anywhere.
 */

export type Level = "L" | "M" | "Q" | "H";

// Index = version (1 to 10). Index 0 is unused.
const ECC_PER_BLOCK: Record<Level, number[]> = {
  L: [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18],
  M: [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26],
  Q: [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24],
  H: [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28],
};
const BLOCKS: Record<Level, number[]> = {
  L: [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4],
  M: [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5],
  Q: [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8],
  H: [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8],
};
const FORMAT_BITS: Record<Level, number> = { L: 1, M: 0, Q: 3, H: 2 };

const rawModules = (ver: number): number => {
  let n = (16 * ver + 128) * ver + 64;
  if (ver >= 2) {
    const align = Math.floor(ver / 7) + 2;
    n -= (25 * align - 10) * align - 55;
    if (ver >= 7) n -= 36;
  }
  return n;
};

const dataCodewords = (ver: number, level: Level): number =>
  Math.floor(rawModules(ver) / 8) - ECC_PER_BLOCK[level][ver] * BLOCKS[level][ver];

/** Multiply two bytes in GF(256) with the QR polynomial 0x11D. */
const gfMul = (x: number, y: number): number => {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z;
};

const rsDivisor = (degree: number): number[] => {
  const result = new Array<number>(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) {
      result[j] = gfMul(result[j], root);
      if (j + 1 < degree) result[j] ^= result[j + 1];
    }
    root = gfMul(root, 0x02);
  }
  return result;
};

const rsRemainder = (data: number[], divisor: number[]): number[] => {
  const result = divisor.map(() => 0);
  for (const b of data) {
    const factor = b ^ (result.shift() as number);
    result.push(0);
    divisor.forEach((coef, i) => {
      result[i] ^= gfMul(coef, factor);
    });
  }
  return result;
};

const bit = (x: number, i: number): boolean => ((x >>> i) & 1) !== 0;

export interface QrCode {
  version: number;
  size: number;
  mask: number;
  level: Level;
  /** modules[y][x] is true for a dark module. */
  modules: boolean[][];
}

const cache = new Map<string, QrCode>();

/** Same as encodeText, remembered by text, so a second request costs nothing. */
export function encodeCached(text: string, level: Level = "M", minVersion = 1): QrCode {
  const key = `${level}${minVersion}:${text}`;
  let hit = cache.get(key);
  if (!hit) {
    hit = encodeText(text, level, minVersion);
    cache.set(key, hit);
  }
  return hit;
}

export function encodeText(text: string, level: Level = "M", minVersion = 1): QrCode {
  const bytes = Array.from(new TextEncoder().encode(text));

  // Smallest version that holds the bytes (mode 4 bits, count 8 or 16 bits, data).
  let version = Math.max(1, minVersion);
  for (;; version++) {
    if (version > 10) throw new RangeError("Text too long for this encoder");
    const countBits = version < 10 ? 8 : 16;
    if (4 + countBits + bytes.length * 8 <= dataCodewords(version, level) * 8) break;
  }

  // Data bits.
  const bits: number[] = [];
  const push = (value: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) bits.push((value >>> i) & 1);
  };
  push(0b0100, 4);
  push(bytes.length, version < 10 ? 8 : 16);
  for (const b of bytes) push(b, 8);
  const capacityBits = dataCodewords(version, level) * 8;
  push(0, Math.min(4, capacityBits - bits.length));
  push(0, (8 - (bits.length % 8)) % 8);
  for (let pad = 0xec; bits.length < capacityBits; pad ^= 0xec ^ 0x11) push(pad, 8);
  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let v = 0;
    for (let j = 0; j < 8; j++) v = (v << 1) | bits[i + j];
    data.push(v);
  }

  // Error correction and interleaving.
  const numBlocks = BLOCKS[level][version];
  const eccLen = ECC_PER_BLOCK[level][version];
  const rawCodewords = Math.floor(rawModules(version) / 8);
  const numShort = numBlocks - (rawCodewords % numBlocks);
  const shortLen = Math.floor(rawCodewords / numBlocks);
  const divisor = rsDivisor(eccLen);
  const blocks: number[][] = [];
  for (let i = 0, k = 0; i < numBlocks; i++) {
    const dat = data.slice(k, k + shortLen - eccLen + (i < numShort ? 0 : 1));
    k += dat.length;
    const ecc = rsRemainder(dat, divisor);
    if (i < numShort) dat.push(0);
    blocks.push(dat.concat(ecc));
  }
  const codewords: number[] = [];
  for (let i = 0; i < blocks[0].length; i++) {
    blocks.forEach((block, j) => {
      if (i !== shortLen - eccLen || j >= numShort) codewords.push(block[i]);
    });
  }

  // Grid with function patterns.
  const size = version * 4 + 17;
  const modules: boolean[][] = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  const isFunction: boolean[][] = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  const setFn = (x: number, y: number, dark: boolean) => {
    modules[y][x] = dark;
    isFunction[y][x] = true;
  };

  for (let i = 0; i < size; i++) {
    setFn(6, i, i % 2 === 0);
    setFn(i, 6, i % 2 === 0);
  }
  const finder = (cx: number, cy: number) => {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        const x = cx + dx;
        const y = cy + dy;
        if (x >= 0 && x < size && y >= 0 && y < size) setFn(x, y, dist !== 2 && dist !== 4);
      }
    }
  };
  finder(3, 3);
  finder(size - 4, 3);
  finder(3, size - 4);

  const alignPositions: number[] = [];
  if (version > 1) {
    const n = Math.floor(version / 7) + 2;
    const step = version === 32 ? 26 : Math.ceil((version * 4 + 4) / (n * 2 - 2)) * 2;
    alignPositions.push(6);
    for (let pos = size - 7; alignPositions.length < n; pos -= step) alignPositions.splice(1, 0, pos);
  }
  alignPositions.forEach((ax, i) => {
    alignPositions.forEach((ay, j) => {
      const corner = (i === 0 && j === 0) || (i === 0 && j === alignPositions.length - 1) || (i === alignPositions.length - 1 && j === 0);
      if (corner) return;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) setFn(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }
    });
  });

  const drawFormat = (mask: number) => {
    const d = (FORMAT_BITS[level] << 3) | mask;
    let rem = d;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const fmt = ((d << 10) | rem) ^ 0x5412;
    for (let i = 0; i <= 5; i++) setFn(8, i, bit(fmt, i));
    setFn(8, 7, bit(fmt, 6));
    setFn(8, 8, bit(fmt, 7));
    setFn(7, 8, bit(fmt, 8));
    for (let i = 9; i < 15; i++) setFn(14 - i, 8, bit(fmt, i));
    for (let i = 0; i < 8; i++) setFn(size - 1 - i, 8, bit(fmt, i));
    for (let i = 8; i < 15; i++) setFn(8, size - 15 + i, bit(fmt, i));
    setFn(8, size - 8, true);
  };
  drawFormat(0); // reserve the format area

  if (version >= 7) {
    let rem = version;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const v = (version << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      setFn(a, b, bit(v, i));
      setFn(b, a, bit(v, i));
    }
  }

  // Data in a zigzag.
  let n = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vert : vert;
        if (!isFunction[y][x] && n < codewords.length * 8) {
          modules[y][x] = bit(codewords[n >>> 3], 7 - (n & 7));
          n++;
        }
      }
    }
  }

  const applyMask = (mask: number) => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        let invert: boolean;
        switch (mask) {
          case 0: invert = (x + y) % 2 === 0; break;
          case 1: invert = y % 2 === 0; break;
          case 2: invert = x % 3 === 0; break;
          case 3: invert = (x + y) % 3 === 0; break;
          case 4: invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
          case 5: invert = ((x * y) % 2) + ((x * y) % 3) === 0; break;
          case 6: invert = (((x * y) % 2) + ((x * y) % 3)) % 2 === 0; break;
          default: invert = (((x + y) % 2) + ((x * y) % 3)) % 2 === 0; break;
        }
        if (!isFunction[y][x] && invert) modules[y][x] = !modules[y][x];
      }
    }
  };

  const FINDER_A = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
  const FINDER_B = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
  const lineScore = (get: (i: number) => boolean): number => {
    let total = 0;
    // Runs of five or more.
    let run = 1;
    for (let i = 1; i <= size; i++) {
      if (i < size && get(i) === get(i - 1)) run++;
      else {
        if (run >= 5) total += 3 + (run - 5);
        run = 1;
      }
    }
    // Finder-like 1:1:3:1:1 with four light modules on a side.
    for (let i = 0; i + 11 <= size; i++) {
      let a = true;
      let b = true;
      for (let j = 0; j < 11 && (a || b); j++) {
        const v = get(i + j) ? 1 : 0;
        if (v !== FINDER_A[j]) a = false;
        if (v !== FINDER_B[j]) b = false;
      }
      if (a || b) total += 40;
    }
    return total;
  };

  const penalty = (): number => {
    let total = 0;
    for (let k = 0; k < size; k++) {
      total += lineScore((i) => modules[k][i]);
      total += lineScore((i) => modules[i][k]);
    }
    // 2x2 blocks.
    for (let y = 0; y < size - 1; y++) {
      for (let x = 0; x < size - 1; x++) {
        const c = modules[y][x];
        if (c === modules[y][x + 1] && c === modules[y + 1][x] && c === modules[y + 1][x + 1]) total += 3;
      }
    }
    // Balance.
    let dark = 0;
    for (const row of modules) for (const m of row) if (m) dark++;
    const k = Math.ceil(Math.abs(dark * 20 - size * size * 10) / (size * size)) - 1;
    total += Math.max(0, k) * 10;
    return total;
  };

  let bestMask = 0;
  let bestScore = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    applyMask(mask);
    drawFormat(mask);
    const score = penalty();
    if (score < bestScore) {
      bestScore = score;
      bestMask = mask;
    }
    applyMask(mask); // undo
  }
  applyMask(bestMask);
  drawFormat(bestMask);

  return { version, size, mask: bestMask, level, modules };
}
