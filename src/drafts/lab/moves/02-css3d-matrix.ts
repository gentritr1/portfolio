function multiply(a: readonly number[], b: readonly number[]) {
  const result = new Array<number>(16).fill(0);
  for (let column = 0; column < 4; column++)
    for (let row = 0; row < 4; row++) {
      for (let k = 0; k < 4; k++)
        result[column * 4 + row] += a[k * 4 + row] * b[column * 4 + k];
    }
  return result;
}

/** Camera clip coordinates -> CSS viewport pixels, retaining homogeneous w. */
export function cssCameraMatrix(
  projection: readonly number[],
  view: readonly number[],
  model: readonly number[],
  viewportWidth: number,
  viewportHeight: number,
  planeWidth: number,
  planeHeight: number,
  domWidth: number,
  domHeight: number,
) {
  const pixelsToPlane = [
    planeWidth / domWidth,
    0,
    0,
    0,
    0,
    -planeHeight / domHeight,
    0,
    0,
    0,
    0,
    1,
    0,
    -planeWidth / 2,
    planeHeight / 2,
    0,
    1,
  ];
  const clip = multiply(
    multiply(multiply(projection, view), model),
    pixelsToPlane,
  );
  const matrix = new Array<number>(16);
  for (let column = 0; column < 4; column++) {
    const i = column * 4;
    matrix[i] = (viewportWidth / 2) * (clip[i] + clip[i + 3]);
    matrix[i + 1] = (viewportHeight / 2) * (-clip[i + 1] + clip[i + 3]);
    matrix[i + 2] = clip[i + 2];
    matrix[i + 3] = clip[i + 3];
  }
  // A common homogeneous scale changes no projected point. Keeping m44=1
  // makes CSS hit testing and matrix inspection less surprising.
  const scale = matrix[15];
  return matrix.map((value) => value / scale);
}

export function projectedCorner(
  matrix: readonly number[],
  x: number,
  y: number,
) {
  const w = matrix[3] * x + matrix[7] * y + matrix[15];
  return [
    (matrix[0] * x + matrix[4] * y + matrix[12]) / w,
    (matrix[1] * x + matrix[5] * y + matrix[13]) / w,
  ];
}
