// Five columns by seven rows. The board is made from discs, not rendered font outlines.
const glyphs: Record<string, string> = {
  A: "0E11111F111111",
  B: "1E11111E11111E",
  C: "0F10101010100F",
  D: "1E11111111111E",
  E: "1F10101E10101F",
  F: "1F10101E101010",
  G: "0F10101711110F",
  H: "1111111F111111",
  I: "0E04040404040E",
  J: "0101010111110E",
  K: "11121418141211",
  L: "1010101010101F",
  M: "111B1515111111",
  N: "11191915131311",
  O: "0E11111111110E",
  P: "1E11111E101010",
  Q: "0E11111115120D",
  R: "1E11111E141211",
  S: "0F10100E01011E",
  T: "1F040404040404",
  U: "1111111111110E",
  V: "11111111110A04",
  W: "11111115151B11",
  X: "11110A040A1111",
  Y: "11110A04040404",
  Z: "1F01020408101F",
  "0": "0E11131519110E",
  "1": "040C040404040E",
  "2": "0E11010204081F",
  "3": "1E01010601011E",
  "4": "02060A121F0202",
  "5": "1F10101E01011E",
  "6": "0E10101E11110E",
  "7": "1F010204080808",
  "8": "0E11110E11110E",
  "9": "0E11110F01010E",
  " ": "00000000000000",
  "-": "0000001F000000",
  ">": "10080402040810",
  "<": "01020408040201",
  "/": "01010204081010",
  ".": "00000000000C0C",
  ":": "000C0C000C0C00",
  "?": "0E110102040004",
  "!": "04040404040004",
  "+": "0004041F040400",
  "@": "0E11171517100F",
  "&": "0C12140C15120D",
  "(": "02040808080402",
  ")": "08040202020408",
  Ë: "0A001F101E101F",
  "→": "0008041F040800",
  "·": "00000004000000",
  _: "0000000000001F",
};
export const DISC_COUNT = 144 * 48;
export function putText(
  bits: Uint8Array,
  cols: number,
  text: string,
  x: number,
  y: number,
  scale = 1,
  invert = false,
) {
  for (const char of text.toUpperCase().replace(/[–—]/g, "-")) {
    const hex = glyphs[char] ?? glyphs["?"];
    for (let row = 0; row < 7; row++)
      for (let col = 0; col < 5; col++) {
        const value =
          (parseInt(hex.slice(row * 2, row * 2 + 2), 16) >> (4 - col)) & 1;
        for (let sy = 0; sy < scale; sy++)
          for (let sx = 0; sx < scale; sx++) {
            const bx = x + col * scale + sx,
              by = y + row * scale + sy;
            if (bx >= 0 && bx < cols && by >= 0 && by * cols + bx < bits.length)
              bits[by * cols + bx] = invert ? 1 - value : value;
          }
      }
    x += 6 * scale;
  }
}
export function fillRect(
  bits: Uint8Array,
  cols: number,
  x: number,
  y: number,
  w: number,
  h: number,
  value = 1,
) {
  for (let row = y; row < y + h; row++)
    for (let col = x; col < x + w; col++)
      if (col >= 0 && col < cols && row >= 0 && row * cols + col < bits.length)
        bits[row * cols + col] = value;
}
const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
export function imageBits(
  image: HTMLImageElement,
  width: number,
  height: number,
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new Uint8Array(width * height);
  const ratio = Math.max(
    width / image.naturalWidth,
    height / image.naturalHeight,
  );
  ctx.drawImage(
    image,
    (width - image.naturalWidth * ratio) / 2,
    (height - image.naturalHeight * ratio) / 2,
    image.naturalWidth * ratio,
    image.naturalHeight * ratio,
  );
  const pixels = ctx.getImageData(0, 0, width, height).data,
    bits = new Uint8Array(width * height);
  for (let i = 0; i < bits.length; i++) {
    const luminance =
      (pixels[i * 4] * 0.2126 +
        pixels[i * 4 + 1] * 0.7152 +
        pixels[i * 4 + 2] * 0.0722) /
      255;
    bits[i] =
      luminance >
      (bayer[(Math.floor(i / width) % 4) * 4 + ((i % width) % 4)] + 0.5) / 16
        ? 1
        : 0;
  }
  return bits;
}
