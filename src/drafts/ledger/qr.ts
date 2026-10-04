// Version 1-L byte-mode encoder, retained from the existing wallet recreation.
const QR_SIZE = 21;
const QR_DATA_CODEWORDS = 19;
const QR_EC_CODEWORDS = 7;

type Put = (x: number, y: number, dark: boolean) => void;

function gfMultiply(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z;
}

function reedSolomon(data: number[], degree: number): number[] {
  const divisor = new Array<number>(degree).fill(0);
  divisor[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) {
      divisor[j] = gfMultiply(divisor[j], root);
      if (j + 1 < degree) divisor[j] ^= divisor[j + 1];
    }
    root = gfMultiply(root, 0x02);
  }
  const remainder = new Array<number>(degree).fill(0);
  for (const byte of data) {
    const factor = byte ^ (remainder.shift() ?? 0);
    remainder.push(0);
    divisor.forEach((coefficient, i) => {
      remainder[i] ^= gfMultiply(coefficient, factor);
    });
  }
  return remainder;
}

const QR_MASKS: Array<(x: number, y: number) => boolean> = [
  (x, y) => (x + y) % 2 === 0,
  (_x, y) => y % 2 === 0,
  (x) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

function drawFormatBits(put: Put, mask: number) {
  const data = (0b01 << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  const bits = ((data << 10) | rem) ^ 0x5412;
  const bit = (i: number) => ((bits >>> i) & 1) === 1;
  for (let i = 0; i <= 5; i++) put(8, i, bit(i));
  put(8, 7, bit(6));
  put(8, 8, bit(7));
  put(7, 8, bit(8));
  for (let i = 9; i < 15; i++) put(14 - i, 8, bit(i));
  for (let i = 0; i < 8; i++) put(QR_SIZE - 1 - i, 8, bit(i));
  for (let i = 8; i < 15; i++) put(8, QR_SIZE - 15 + i, bit(i));
  put(8, QR_SIZE - 8, true);
}

function qrPenalty(grid: boolean[][]): number {
  const size = grid.length;
  const columns = grid.map((_, x) => grid.map((row) => row[x]));
  let score = 0;
  for (const line of [...grid, ...columns]) {
    let run = 1;
    for (let i = 1; i <= size; i++) {
      if (i < size && line[i] === line[i - 1]) {
        run++;
      } else {
        if (run >= 5) score += run - 2;
        run = 1;
      }
    }
    const text = line.map((dark) => (dark ? "1" : "0")).join("");
    for (const pattern of ["10111010000", "00001011101"]) {
      for (
        let at = text.indexOf(pattern);
        at !== -1;
        at = text.indexOf(pattern, at + 1)
      )
        score += 40;
    }
  }
  let dark = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (grid[y][x]) dark++;
      if (x < size - 1 && y < size - 1) {
        const c = grid[y][x];
        if (
          grid[y][x + 1] === c &&
          grid[y + 1][x] === c &&
          grid[y + 1][x + 1] === c
        )
          score += 3;
      }
    }
  }
  return (
    score + Math.floor(Math.abs((dark * 100) / (size * size) - 50) / 5) * 10
  );
}

export function encodeQr(text: string, forcedMask?: number): boolean[][] {
  const bytes = Array.from(new TextEncoder().encode(text));
  if (bytes.length > QR_DATA_CODEWORDS - 2)
    throw new Error("Version 1-L holds 17 bytes");

  const bits: number[] = [];
  const push = (value: number, length: number) => {
    for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1);
  };
  push(0b0100, 4);
  push(bytes.length, 8);
  for (const byte of bytes) push(byte, 8);
  const capacity = QR_DATA_CODEWORDS * 8;
  push(0, Math.min(4, capacity - bits.length));
  push(0, (8 - (bits.length % 8)) % 8);
  for (let pad = 0xec; bits.length < capacity; pad ^= 0xec ^ 0x11) push(pad, 8);

  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8)
    data.push(bits.slice(i, i + 8).reduce((acc, b) => (acc << 1) | b, 0));
  const codewords = [...data, ...reedSolomon(data, QR_EC_CODEWORDS)];

  const modules = Array.from({ length: QR_SIZE }, () =>
    new Array<boolean>(QR_SIZE).fill(false),
  );
  const reserved = Array.from({ length: QR_SIZE }, () =>
    new Array<boolean>(QR_SIZE).fill(false),
  );
  const put: Put = (x, y, dark) => {
    modules[y][x] = dark;
    reserved[y][x] = true;
  };

  for (let i = 0; i < QR_SIZE; i++) {
    put(6, i, i % 2 === 0);
    put(i, 6, i % 2 === 0);
  }
  for (const [cx, cy] of [
    [3, 3],
    [QR_SIZE - 4, 3],
    [3, QR_SIZE - 4],
  ]) {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const x = cx + dx;
        const y = cy + dy;
        if (x < 0 || y < 0 || x >= QR_SIZE || y >= QR_SIZE) continue;
        const ring = Math.max(Math.abs(dx), Math.abs(dy));
        put(x, y, ring !== 2 && ring !== 4);
      }
    }
  }
  drawFormatBits(put, 0);

  let i = 0;
  for (let right = QR_SIZE - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    const upward = ((right + 1) & 2) === 0;
    for (let vert = 0; vert < QR_SIZE; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const y = upward ? QR_SIZE - 1 - vert : vert;
        if (reserved[y][x] || i >= codewords.length * 8) continue;
        modules[y][x] = ((codewords[i >>> 3] >>> (7 - (i & 7))) & 1) === 1;
        i++;
      }
    }
  }

  let best = modules;
  let bestScore = Infinity;
  for (let mask = 0; mask < QR_MASKS.length; mask++) {
    if (forcedMask !== undefined && mask !== forcedMask) continue;
    const candidate = modules.map((row, y) =>
      row.map((dark, x) =>
        reserved[y][x] ? dark : dark !== QR_MASKS[mask](x, y),
      ),
    );
    drawFormatBits((x, y, dark) => {
      candidate[y][x] = dark;
    }, mask);
    const score = qrPenalty(candidate);
    if (score < bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return best;
}
