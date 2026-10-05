/** Resolves when the projector faces are ready, so the first paint does not reflow when they arrive. */
export function fontsReady(): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return Promise.resolve();
  const faces = Promise.all([
    document.fonts.load('800 96px "Big Shoulders Display"'),
    document.fonts.load('400 17px "Public Sans"'),
    document.fonts.load('700 17px "Public Sans"'),
  ]).then(() => undefined);
  const limit = new Promise<void>((resolve) => window.setTimeout(resolve, 1500));
  return Promise.race([faces, limit]).catch(() => undefined);
}
