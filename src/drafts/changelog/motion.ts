type Bezier = [number, number, number, number];

export const ease = {
  out: [0.23, 1, 0.32, 1] as Bezier,
  inOut: [0.77, 0, 0.175, 1] as Bezier,
};

export const fold = { type: "spring", duration: 0.46, bounce: 0 } as const;
export const still = { duration: 0 } as const;
