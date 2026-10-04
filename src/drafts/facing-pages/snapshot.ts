const assets = new Map<string, Promise<string>>();

function inlineAsset(url: string) {
  const resolved = new URL(url, location.href);
  if (resolved.origin !== location.origin)
    return Promise.reject(
      new Error("Page textures accept only same-origin assets."),
    );
  if (!assets.has(resolved.href)) {
    assets.set(
      resolved.href,
      fetch(resolved.href)
        .then((response) => {
          if (!response.ok) throw new Error("Page asset unavailable");
          return response.blob();
        })
        .then(
          (blob) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result));
              reader.onerror = () =>
                reject(new Error("Page asset could not be read"));
              reader.readAsDataURL(blob);
            }),
        ),
    );
  }
  return assets.get(resolved.href)!;
}

const properties = [
  "display",
  "visibility",
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "width",
  "height",
  "min-width",
  "max-width",
  "min-height",
  "max-height",
  "padding",
  "margin",
  "box-sizing",
  "overflow",
  "overflow-x",
  "overflow-y",
  "background",
  "color",
  "opacity",
  "border",
  "border-top",
  "border-bottom",
  "border-left",
  "border-right",
  "border-radius",
  "box-shadow",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "font-variation-settings",
  "line-height",
  "letter-spacing",
  "text-align",
  "text-transform",
  "text-decoration",
  "text-underline-offset",
  "white-space",
  "word-break",
  "overflow-wrap",
  "direction",
  "unicode-bidi",
  "writing-mode",
  "list-style",
  "column-width",
  "column-count",
  "column-gap",
  "column-fill",
  "break-inside",
  "break-before",
  "break-after",
  "grid-template-columns",
  "grid-template-rows",
  "gap",
  "align-items",
  "justify-content",
  "flex-direction",
  "flex-wrap",
  "flex",
  "order",
  "object-fit",
  "object-position",
  "transform",
  "transform-origin",
];

/** A DOM snapshot, not a redrawn approximation. Fonts and images are embedded from this origin. */
export async function snapshotSpread(
  node: HTMLElement,
): Promise<HTMLCanvasElement> {
  await document.fonts.ready;
  const bounds = node.getBoundingClientRect();
  const clone = node.cloneNode(true) as HTMLElement;
  const source = [node, ...node.querySelectorAll<HTMLElement>("*")];
  const target = [clone, ...clone.querySelectorAll<HTMLElement>("*")];
  source.forEach((element, index) => {
    const copied = target[index];
    if (!copied) return;
    const computed = getComputedStyle(element);
    properties.forEach((property) =>
      copied.style.setProperty(property, computed.getPropertyValue(property)),
    );
    copied.removeAttribute("id");
    copied.removeAttribute("tabindex");
  });
  clone
    .querySelectorAll("[data-snapshot-exclude],canvas")
    .forEach((element) => element.remove());
  await Promise.all(
    Array.from(clone.querySelectorAll("img")).map(async (image) => {
      image.src = await inlineAsset(image.currentSrc || image.src);
      image.removeAttribute("srcset");
      image.removeAttribute("loading");
    }),
  );
  const fontFiles = [
    ["FpLiterata", "/fonts/creative/Literata-Latin.woff2", "200 900"],
    ["FpAmiri", "/fonts/creative/Amiri-Regular.woff2", "400"],
    ["FpAmiri", "/fonts/creative/Amiri-Bold.woff2", "700"],
    ["Martian Mono", "/fonts/MartianMono.woff2", "100 800"],
  ];
  const fontRules = await Promise.all(
    fontFiles.map(
      async ([family, url, weight]) =>
        `@font-face{font-family:'${family}';src:url('${await inlineAsset(url)}') format('woff2');font-weight:${weight};font-style:normal}`,
    ),
  );
  const width = Math.round(bounds.width);
  const height = Math.round(bounds.height);
  Object.assign(clone.style, {
    width: width + "px",
    height: height + "px",
    margin: "0",
    transform: "none",
    position: "relative",
    left: "0",
    top: "0",
  });
  clone.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
  const markup = new XMLSerializer().serializeToString(clone);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml"><style>${fontRules.join("")}</style>${markup}</div></foreignObject></svg>`;
  const image = new Image();
  const loaded = new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("DOM page snapshot unavailable"));
  });
  image.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  await loaded;
  const canvas = document.createElement("canvas");
  const ratio = Math.min(devicePixelRatio, 1.5);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  context.fillStyle = "#fbf6ea";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  // Test origin cleanliness before sending the image to WebGL.
  context.getImageData(0, 0, 1, 1);
  return canvas;
}
