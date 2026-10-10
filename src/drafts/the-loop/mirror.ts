import { useEffect, type RefObject } from "react";
import "./mirror.css";

/** The left and top of `node` in the page's layout, without transforms, so a slab that moves gives the same answer as one at rest. */
function at(node: HTMLElement) {
  let x = 0;
  let y = 0;
  for (let n: HTMLElement | null = node; n; n = n.offsetParent as HTMLElement | null) {
    x += n.offsetLeft;
    y += n.offsetTop;
  }
  return { x, y };
}

/** The first box from the image up to the host that cuts its content: its bottom is the bottom of the screen we see. */
function clipOf(img: HTMLElement, host: HTMLElement) {
  for (let n = img.parentElement; n && n !== host; n = n.parentElement) if (getComputedStyle(n).overflow !== "visible") return n;
  return img.parentElement ?? host;
}

/** The colour behind the image, where the image does not reach the bottom of the screen. */
function fillOf(clip: HTMLElement, host: HTMLElement) {
  for (let n: HTMLElement | null = clip; n && n !== host; n = n.parentElement) {
    const color = getComputedStyle(n).backgroundColor;
    if (color !== "transparent" && !color.endsWith(", 0)")) return color;
  }
  return "transparent";
}

/** The radius of the screen's lower corners: the first rounded box from the image up to the host. */
function radiusOf(img: HTMLElement, host: HTMLElement) {
  for (let n = img.parentElement; n && n !== host; n = n.parentElement) {
    const r = parseFloat(getComputedStyle(n).borderBottomLeftRadius);
    if (r > 0) return r;
  }
  return 0;
}

/**
 * Gives `host` a faint copy of its screen on the floor (mirror.css): the screen's lower edge, upside down, under the host.
 * It is one gradient-masked pseudo-element with the same image file the screen already shows, so it costs no download.
 * The geometry is measured once when the image loads and again when the host changes size.
 */
export function mirror(host: HTMLElement) {
  const img = host.querySelector("img");
  if (!img) return () => undefined;
  const place = () => {
    const src = img.currentSrc || img.src;
    if (!src || !img.complete || !img.naturalWidth || !host.offsetWidth) return;
    const clip = clipOf(img, host);
    const h = at(host);
    const c = at(clip);
    const i = at(img);
    const tall = Math.round(Math.min(88, Math.max(60, host.offsetWidth * 0.08)));
    const bottom = c.y + clip.offsetHeight;
    const set = (name: string, value: string) => host.style.setProperty(name, value);
    set("--m-src", `url("${src}")`);
    set("--m-x", `${c.x - h.x}px`);
    set("--m-w", `${clip.offsetWidth}px`);
    set("--m-gap", `${h.y + host.offsetHeight - bottom}px`);
    set("--m-h", `${tall}px`);
    set("--m-bw", `${img.offsetWidth}px`);
    set("--m-bh", `${img.offsetHeight}px`);
    set("--m-bx", `${i.x - c.x}px`);
    set("--m-by", `${tall - (bottom - i.y)}px`);
    set("--m-r", `${radiusOf(img, host)}px`);
    set("--m-fill", fillOf(clip, host));
    host.dataset.mirror = "";
  };
  place();
  img.addEventListener("load", place);
  const resize = new ResizeObserver(place);
  resize.observe(host);
  return () => {
    img.removeEventListener("load", place);
    resize.disconnect();
    delete host.dataset.mirror;
  };
}

/** `mirror` for the element of `ref`. */
export function useMirror(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const host = ref.current;
    return host ? mirror(host) : undefined;
  }, [ref]);
}

/** `mirror` for each element under `root` that matches one of `selectors`. */
export function useMirrors(root: RefObject<HTMLElement | null>, selectors: string) {
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const stops = [...node.querySelectorAll<HTMLElement>(selectors)].map(mirror);
    return () => stops.forEach((stop) => stop());
  }, [root, selectors]);
}
