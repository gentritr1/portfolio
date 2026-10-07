#!/usr/bin/env node
// portfolio-page checker.
// Opens a page in Chromium at two sizes and reports:
//   1. template tells (AI "slop"): pill eyebrow over the hero title, gradient text,
//      faint 1px card borders, glass, glow, stat rows, emoji, buzzwords, and more;
//   2. the craft floor: work in the first screen, overflow, targets, contrast,
//      images, headings, type count, layout shift;
//   3. motion: durations, easing, animated properties, loops, reduced motion,
//      content hidden until scrolled, frame timing.
//
// Usage:
//   node check.mjs <url> [--out dir] [--name slug] [--viewports 1440x900,390x844]
//                  [--throttle 4] [--frames 120,320,700] [--json]
//
// Exit code 1 when a hard fail is found, so loops can stop on it.
// Needs Playwright (playwright or playwright-core). Set PLAYWRIGHT_MODULE or
// CHROMIUM_PATH if they are not found.

import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const argv = process.argv.slice(2);
if (!argv.length || argv.includes("--help")) {
  console.log(
    "node check.mjs <url> [--out dir] [--name slug] [--viewports 1440x900,390x844] [--throttle 4] [--frames 120,320,700] [--json]",
  );
  process.exit(argv.length ? 0 : 2);
}
const url = argv[0];
const flag = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i > -1 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback;
};
const name =
  flag("name") ||
  url.replace(/^https?:\/\/[^/]+/, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") ||
  "home";
const outDir = resolve(flag("out", join("portfolio-check", name)));
const viewports = flag("viewports", "1440x900,390x844")
  .split(",")
  .map((v) => v.split("x").map(Number));
const throttle = Number(flag("throttle", "0"));
const frames = flag("frames", "")
  .split(",")
  .filter(Boolean)
  .map(Number);
const asJson = argv.includes("--json");

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  const candidates = [
    process.env.PLAYWRIGHT_MODULE,
    "playwright",
    "playwright-core",
    join(process.cwd(), "node_modules/playwright"),
    join(process.cwd(), "node_modules/playwright-core"),
    "/opt/node-tools/node_modules/playwright",
    "/opt/node-tools/node_modules/playwright-core",
  ].filter(Boolean);
  for (const c of candidates) {
    try {
      return require(c);
    } catch {}
  }
  throw new Error(
    "Playwright not found. Run `npm i -D playwright` or set PLAYWRIGHT_MODULE to its path.",
  );
}

const { chromium } = loadPlaywright();
const executablePath =
  process.env.CHROMIUM_PATH ||
  (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);

mkdirSync(outDir, { recursive: true });

// ---------------------------------------------------------------------------
// In-page instrumentation, installed before any page script runs.
const INIT = () => {
  const w = window;
  w.__pc = { cls: 0, shifts: [], loaf: [], lcp: null, styleMutations: {} };
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (e.hadRecentInput) continue;
        w.__pc.cls += e.value;
        if (e.value > 0.001)
          w.__pc.shifts.push({
            value: +e.value.toFixed(4),
            t: Math.round(e.startTime),
            nodes: (e.sources || [])
              .map((s) => s.node && s.node.nodeName + (s.node.className && typeof s.node.className === "string" ? "." + s.node.className.split(" ")[0] : ""))
              .filter(Boolean)
              .slice(0, 3),
          });
      }
    }).observe({ type: "layout-shift", buffered: true });
  } catch {}
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries())
        w.__pc.loaf.push({ t: Math.round(e.startTime), d: Math.round(e.duration), block: Math.round(e.blockingDuration || 0) });
    }).observe({ type: "long-animation-frame", buffered: true });
  } catch {}
  try {
    new PerformanceObserver((list) => {
      const last = list.getEntries().at(-1);
      if (last)
        w.__pc.lcp = {
          t: Math.round(last.startTime),
          node: last.element ? last.element.nodeName + (last.element.id ? "#" + last.element.id : "") : null,
          size: last.size,
        };
    }).observe({ type: "largest-contentful-paint", buffered: true });
  } catch {}
  // JS-driven animation of layout properties shows up as style attribute churn.
  const layoutProps = ["width", "height", "top", "left", "right", "bottom", "margin", "padding", "font-size", "letter-spacing", "line-height", "inset"];
  const start = () => {
    try {
      new MutationObserver((records) => {
        for (const r of records) {
          if (r.attributeName !== "style") continue;
          const now = r.target.getAttribute("style") || "";
          const before = r.oldValue || "";
          for (const p of layoutProps) {
            const re = new RegExp(`(^|;|\\s)${p}(-[a-z]+)?\\s*:\\s*([^;]+)`, "i");
            const a = before.match(re)?.[3];
            const b = now.match(re)?.[3];
            if (a !== b && b !== undefined) w.__pc.styleMutations[p] = (w.__pc.styleMutations[p] || 0) + 1;
          }
        }
      }).observe(document.documentElement, { attributes: true, attributeOldValue: true, subtree: true, attributeFilter: ["style"] });
    } catch {}
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
};

// ---------------------------------------------------------------------------
// The static detector. Runs in the page; returns findings.
const DETECT = ({ phone }) => {
  const vw = innerWidth;
  const vh = innerHeight;
  const findings = [];
  const add = (id, severity, title, detail, where) =>
    findings.push({ id, severity, title, detail, where: where || null });

  // ---- colour helpers ----------------------------------------------------
  const cv = document.createElement("canvas");
  cv.width = cv.height = 1;
  const ctx = cv.getContext("2d", { willReadFrequently: true });
  const cache = new Map();
  const rgba = (c) => {
    if (!c) return [0, 0, 0, 0];
    if (cache.has(c)) return cache.get(c);
    let out = [0, 0, 0, 0];
    if (c !== "transparent" && c !== "none") {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = "rgba(0,0,0,0)";
      ctx.fillStyle = c;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      out = [d[0], d[1], d[2], d[3] / 255];
    }
    cache.set(c, out);
    return out;
  };
  const lum = ([r, g, b]) => {
    const f = (v) => {
      v /= 255;
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
    return (x + 0.05) / (y + 0.05);
  };
  const over = (top, bottom) => {
    const a = top[3];
    return [0, 1, 2].map((i) => top[i] * a + bottom[i] * (1 - a)).concat(1);
  };
  const hsl = ([r, g, b]) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return [0, 0, l];
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [h * 60, s, l];
  };
  const colorTokens = (s) =>
    (s.match(/(rgba?\([^)]*\)|oklch\([^)]*\)|oklab\([^)]*\)|lab\([^)]*\)|lch\([^)]*\)|hsla?\([^)]*\)|color\([^)]*\)|#[0-9a-f]{3,8}\b)/gi) || []).map(rgba);

  // ---- element helpers ---------------------------------------------------
  const all = [...document.body.querySelectorAll("*")].filter((el) => !["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "svg", "path", "g", "defs", "BR"].includes(el.nodeName) && !el.closest("svg") );
  const cs = new Map();
  const style = (el) => {
    if (!cs.has(el)) cs.set(el, getComputedStyle(el));
    return cs.get(el);
  };
  const opacityChain = (el) => {
    let o = 1;
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) o *= parseFloat(style(n).opacity);
    return o;
  };
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    if (r.width <= 2 && r.height <= 2) return false; // screen-reader-only text
    const s = style(el);
    if (s.visibility === "hidden" || s.display === "none") return false;
    if (/rect\(0(px)?,?\s*0(px)?,?\s*0(px)?,?\s*0(px)?\)/.test(s.clip) || /inset\(50%\)/.test(s.clipPath)) return false;
    if (el.closest("[aria-hidden='true'],[inert],dialog:not([open])")) return false;
    return opacityChain(el) > 0.05;
  };
  const docRect = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height, right: r.right + scrollX, bottom: r.bottom + scrollY };
  };
  const inFirst = (el) => {
    const r = docRect(el);
    return r.y < vh && r.bottom > 0 && r.x < vw && r.right > 0;
  };
  const label = (el) => {
    if (!el) return "";
    let s = el.nodeName.toLowerCase();
    if (el.id) s += "#" + el.id;
    const cls = typeof el.className === "string" ? el.className.trim().split(/\s+/).slice(0, 2).join(".") : "";
    if (cls) s += "." + cls;
    const t = (el.innerText || el.getAttribute("aria-label") || el.getAttribute("alt") || "").trim().replace(/\s+/g, " ").slice(0, 48);
    return t ? `${s} "${t}"` : s;
  };
  const ownText = (el) =>
    [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join("").trim();
  const px = (v) => parseFloat(v) || 0;
  const ancestors = (el) => {
    const out = [];
    for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) out.push(n);
    return out;
  };
  const radius = (el) => {
    const s = style(el);
    const r = el.getBoundingClientRect();
    const v = s.borderTopLeftRadius;
    if (v.endsWith("%")) return (parseFloat(v) / 100) * Math.min(r.width, r.height);
    return px(v);
  };
  const effectiveBg = (el) => {
    // Composite solid backgrounds upward. Returns null when an image or gradient is behind.
    const layers = [];
    for (let n = el; n; n = n.parentElement) {
      const s = style(n);
      if (s.backgroundImage && s.backgroundImage !== "none") return null;
      if (["IMG", "VIDEO", "CANVAS", "PICTURE"].includes(n.nodeName)) return null;
      const c = rgba(s.backgroundColor);
      if (c[3] > 0) {
        layers.push(c);
        if (c[3] >= 0.99) break;
      }
      if (n === document.documentElement) break;
    }
    let base = [255, 255, 255, 1];
    for (let i = layers.length - 1; i >= 0; i--) base = over(layers[i], base);
    return base;
  };
  const hasBox = (el) => {
    const s = style(el);
    const bg = rgba(s.backgroundColor);
    const bw = px(s.borderTopWidth) + px(s.borderRightWidth) + px(s.borderBottomWidth) + px(s.borderLeftWidth);
    return bg[3] > 0.02 || bw > 0 || (s.boxShadow && s.boxShadow !== "none") || (s.backgroundImage && s.backgroundImage !== "none");
  };

  const visibleEls = all.filter(visible);
  const textEls = visibleEls.filter((el) => ownText(el).length > 0);
  const firstText = textEls.filter(inFirst);

  // ---- hero heading --------------------------------------------------------
  const h1s = [...document.querySelectorAll("h1")].filter(visible);
  let hero = h1s.find(inFirst) || null;
  if (!hero) {
    hero = firstText.slice().sort((a, b) => px(style(b).fontSize) - px(style(a).fontSize))[0] || null;
  }
  const heroRect = hero ? docRect(hero) : null;
  const bodySize = px(style(document.body).fontSize) || 16;

  // ======================================================================
  // TEMPLATE TELLS
  // ======================================================================

  // T01 pill eyebrow above the hero title.
  if (hero) {
    const pills = visibleEls.filter((el) => {
      if (el === hero || el.contains(hero) || hero.contains(el)) return false;
      if (el.closest("nav") || [el, ...ancestors(el)].some((n) => ["fixed", "sticky"].includes(style(n).position))) return false;
      const r = docRect(el);
      if (r.h < 16 || r.h > 52 || r.w > 520) return false;
      if (r.bottom > heroRect.y + 6 || heroRect.y - r.bottom > 220) return false;
      const overlapX = Math.min(r.right, heroRect.right) - Math.max(r.x, heroRect.x);
      if (overlapX < -40) return false;
      const t = (el.innerText || "").trim();
      if (t.length < 2 || t.length > 70) return false;
      if (px(style(el).fontSize) > 17 && !el.querySelector("*")) return false;
      const rad = radius(el);
      if (rad < r.h / 2 - 1.5) return false;
      const s = style(el);
      const bg = rgba(s.backgroundColor);
      const bw = px(s.borderTopWidth);
      return bg[3] > 0.04 || bw >= 1 || s.backdropFilter !== "none";
    });
    // Keep the outermost pill only.
    const outer = pills.filter((p) => !pills.some((q) => q !== p && q.contains(p)));
    const notButtons = outer.filter((p) => !p.matches("a[href],button,input,select") || /new|available|open to|now|✨|beta|hiring|introducing/i.test(p.innerText));
    if (notButtons.length)
      add("T01", "fail", "Pill label above the hero title", "A rounded badge sits right above the main heading. It is the most common template opening. Put the claim in the heading itself, or move the fact into the line under it as plain text.", notButtons.slice(0, 3).map(label));
  }

  // T02 gradient-filled text.
  const gradText = visibleEls.filter((el) => {
    const s = style(el);
    return (s.webkitBackgroundClip === "text" || s.backgroundClip === "text") && /gradient\(/.test(s.backgroundImage);
  });
  if (gradText.length)
    add("T02", "fail", "Gradient-filled text", "Text clipped to a gradient reads as a template headline. Use one solid ink colour; let size, weight or the work carry emphasis.", gradText.slice(0, 4).map(label));

  // T03 faint 1px outlines on cards ("AI borders").
  const outlined = visibleEls.filter((el) => {
    if (el.matches("input,select,textarea,button,hr,img,video,iframe,dialog")) return false;
    const r = el.getBoundingClientRect();
    if (r.width * r.height < 4000 || r.width > vw * 0.98) return false;
    const s = style(el);
    const sides = [s.borderTopWidth, s.borderRightWidth, s.borderBottomWidth, s.borderLeftWidth].map(px);
    if (!sides.every((v) => v > 0 && v <= 1.5)) return false;
    if (radius(el) < 6) return false;
    const bc = rgba(s.borderTopColor);
    const bg = effectiveBg(el) || [255, 255, 255, 1];
    const shown = over(bc, bg);
    return bc[3] <= 0.3 || ratio(shown, bg) < 1.7;
  });
  const outlinedOuter = outlined.filter((el) => !outlined.some((o) => o !== el && o.contains(el)));
  if (outlinedOuter.length >= 3)
    add("T03", "fail", `Faint 1px rounded outlines on ${outlinedOuter.length} boxes`, "Low-contrast 1px borders with rounded corners on every card are the default shadcn/v0 look. Remove the box: group with space, a full-width hairline rule, or a tonal ground step.", outlinedOuter.slice(0, 5).map(label));
  else if (outlinedOuter.length)
    add("T03", "warn", `Faint 1px rounded outline on ${outlinedOuter.length} box(es)`, "Check that the outline does a job (an input, a selected state). Otherwise remove it.", outlinedOuter.map(label));

  // T04 glass panels (backdrop blur outside fixed chrome).
  const glass = visibleEls.filter((el) => {
    const s = style(el);
    if (!/blur\(/.test(s.backdropFilter || s.webkitBackdropFilter || "")) return false;
    return !["fixed", "sticky"].includes(s.position) && !el.closest("dialog,[role=dialog]");
  });
  if (glass.length >= 2)
    add("T04", "fail", `Frosted-glass panels (${glass.length})`, "Backdrop blur on content panels is the glassmorphism template. Use an opaque ground.", glass.slice(0, 4).map(label));
  else if (glass.length) add("T04", "warn", "Frosted-glass panel", "One blurred panel. Keep it only if it sits over moving content that must stay legible.", glass.map(label));

  // T05 coloured glow shadows.
  const glow = visibleEls.filter((el) => {
    const s = style(el);
    const parts = [s.boxShadow, s.textShadow, s.filter].filter((v) => v && v !== "none").join(" , ");
    if (!parts) return false;
    const re = /(rgba?\([^)]*\)|oklch\([^)]*\)|#[0-9a-f]{3,8})\s+(-?[\d.]+px)\s+(-?[\d.]+px)\s+([\d.]+px)/gi;
    let m;
    while ((m = re.exec(parts))) {
      const c = rgba(m[1]);
      const [, sat, l] = hsl(c);
      if (px(m[4]) >= 14 && sat > 0.45 && l > 0.2 && l < 0.85 && c[3] >= 0.2) return true;
    }
    return /drop-shadow\([^)]*(rgba?\(\s*(\d+)[^)]*\))/i.test(s.filter) && false;
  });
  if (glow.length)
    add("T05", glow.length >= 2 ? "fail" : "warn", `Coloured glow on ${glow.length} element(s)`, "A saturated, blurred shadow reads as neon template. Use a neutral shadow only on objects that float (a dialog, a dragged item), or none.", glow.slice(0, 4).map(label));

  // T06 purple/indigo/violet gradients and decorative multi-hue gradients.
  const gradients = visibleEls.filter((el) => /gradient\(/.test(style(el).backgroundImage));
  const purple = [];
  const decorative = [];
  for (const el of gradients) {
    const stops = colorTokens(style(el).backgroundImage).filter((c) => c[3] > 0.15);
    const hs = stops.map(hsl).filter(([, s, l]) => s > 0.3 && l > 0.15 && l < 0.85);
    const r = el.getBoundingClientRect();
    if (hs.filter(([h]) => h >= 235 && h <= 320).length >= 1 && hs.length >= 2) purple.push(el);
    else if (hs.length >= 2 && r.width * r.height > vw * vh * 0.08) {
      const hues = hs.map(([h]) => h);
      const spread = Math.max(...hues) - Math.min(...hues);
      if (spread > 40) decorative.push(el);
    }
  }
  if (purple.length)
    add("T06", "fail", "Purple/indigo gradient", "Violet-to-blue or purple-to-pink gradients are the strongest generated-site tell. Take colour from the work instead.", purple.slice(0, 4).map(label));
  if (decorative.length)
    add("T06b", "warn", "Large multi-hue gradient ground", "A big decorative gradient behind content. Check that it comes from the work or carries meaning.", decorative.slice(0, 3).map(label));

  // T07 dot or grid pattern backgrounds, usually with a radial fade.
  const patterns = visibleEls.filter((el) => {
    const s = style(el);
    if (!/gradient\(/.test(s.backgroundImage)) return false;
    const size = s.backgroundSize.split(/[ ,]+/).map(px).filter(Boolean);
    const small = size.length && Math.max(...size) <= 64;
    const r = el.getBoundingClientRect();
    return small && r.width * r.height > 60000;
  });
  if (patterns.length)
    add("T07", "warn", "Dot or grid pattern ground", "A repeating dot/grid ground with a radial fade is a template backdrop. Use a flat ground or a texture that comes from the subject.", patterns.slice(0, 3).map(label));

  // T08 blurred colour blobs.
  const blobs = visibleEls.filter((el) => {
    const s = style(el);
    const m = /blur\(([\d.]+)px\)/.exec(s.filter);
    const r = el.getBoundingClientRect();
    return m && +m[1] >= 30 && r.width * r.height > 15000 && ["absolute", "fixed"].includes(s.position);
  });
  if (blobs.length)
    add("T08", "fail", `Blurred colour blob(s) (${blobs.length})`, "Soft blurred blobs behind the hero are decoration with no meaning. Remove them.", blobs.slice(0, 3).map(label));

  // T09 emoji in headings, buttons, links and the first screen.
  const emojiRe = /\p{Emoji_Presentation}|\p{Extended_Pictographic}️/u;
  const emojiEls = textEls.filter((el) => emojiRe.test(ownText(el)) && (el.closest("h1,h2,h3,h4,button,a,li,nav,header") || inFirst(el)));
  if (emojiEls.length)
    add("T09", emojiEls.length >= 3 ? "fail" : "warn", `Emoji in headings, links or the first screen (${emojiEls.length})`, "Emoji as decoration (👋 ✨ 🚀) is a template voice. Use words or a drawn icon from one set.", emojiEls.slice(0, 5).map(label));

  // T10 template copy.
  const bodyText = (document.body.innerText || "").replace(/\s+/g, " ");
  const firstScreenText = firstText.map(ownText).join(" ");
  const phrases = [
    [/\b(hi|hey|hello)(,|!)?\s+(there[,!]?\s+)?i['’]m\b/i, "Hi, I'm …"],
    [/\bcraft(ing|ed)?\s+(digital|beautiful|delightful|seamless|meaningful|modern)\b/i, "crafting digital/beautiful …"],
    [/\bdigital experiences?\b/i, "digital experience(s)"],
    [/\bpixel[- ]perfect\b/i, "pixel-perfect"],
    [/\bpassionate\b/i, "passionate"],
    [/\bcutting[- ]edge\b/i, "cutting-edge"],
    [/\bseamless(ly)?\b/i, "seamless"],
    [/\brobust\b/i, "robust"],
    [/\bleverag(e|es|ed|ing)\b/i, "leverage"],
    [/\binnovative\b/i, "innovative"],
    [/\bworld[- ]class\b/i, "world-class"],
    [/\bbring(ing)?\s+(your\s+)?(ideas|visions?)\s+to\s+life\b/i, "bring ideas to life"],
    [/\blet['’]s\s+(build|create|make|work on)\s+something\b/i, "Let's build something …"],
    [/\bsomething\s+(amazing|great|awesome|incredible|special)\s+together\b/i, "something amazing together"],
    [/\b(elevat(e|es|ing)|supercharg(e|ing)|unlock(s|ing)?)\b/i, "elevate/supercharge/unlock"],
    [/\bgame[- ]chang/i, "game-changing"],
    [/\bnext[- ]level\b/i, "next-level"],
    [/\bblazing(ly)?[- ]fast\b/i, "blazing fast"],
    [/\b(delve|tapestry|testament to|realm of)\b/i, "delve/tapestry/testament"],
    [/\b(empower(s|ing)?|streamlin(e|es|ing)|holistic|synerg\w*)\b/i, "empower/streamline/holistic"],
    [/\bin today['’]s\s+(fast[- ]paced|digital)\b/i, "in today's fast-paced …"],
    [/\b(turning|transforming)\s+(ideas|visions?|concepts?)\s+into\b/i, "turning ideas into …"],
    [/\bfrom\s+concept\s+to\s+(code|launch|reality|completion)\b/i, "from concept to …"],
    [/\bat the intersection of\b/i, "at the intersection of"],
    [/\b(scroll (down|to explore|to discover|for more))\b/i, "scroll to explore"],
    [/\bavailable for (work|hire|freelance|new projects)\b/i, "available for work badge"],
    [/\bthat (just )?work(s)? beautifully\b/i, "works beautifully"],
    [/\bnot just\b[^.]{3,60}\bbut\b/i, "not just X but Y"],
  ];
  const hitsAll = phrases.filter(([re]) => re.test(bodyText)).map(([, n]) => n);
  const hitsFirst = phrases.filter(([re]) => re.test(firstScreenText)).map(([, n]) => n);
  if (hitsFirst.length)
    add("T10", "fail", "Template phrases in the first screen", "Replace with a plain, specific sentence: what was built, for whom, with one fact.", hitsFirst);
  const rest = hitsAll.filter((h) => !hitsFirst.includes(h));
  if (rest.length) add("T10b", rest.length >= 3 ? "fail" : "warn", "Template phrases in the page", "Rewrite each as a concrete fact.", rest);

  // T11 em-dash density and rule-of-three triplets in prose.
  const words = bodyText.split(/\s+/).filter(Boolean).length || 1;
  const dashes = (bodyText.match(/—/g) || []).length;
  if (dashes / words > 1 / 120)
    add("T11", "warn", `Em dashes: ${dashes} in ${words} words`, "Heavy em-dash use is a generated-copy tell. Use full stops.", null);

  // T12 centred hero with a primary + ghost button pair.
  if (hero) {
    const s = style(hero);
    const centred = s.textAlign === "center" && Math.abs(heroRect.x + heroRect.w / 2 - vw / 2) < vw * 0.05;
    const ctas = visibleEls.filter((el) => {
      if (!el.matches("a[href],button")) return false;
      const r = docRect(el);
      return r.y > heroRect.bottom - 4 && r.y - heroRect.bottom < 260 && r.h >= 32 && hasBox(el);
    });
    const rows = {};
    for (const c of ctas) {
      const k = Math.round(docRect(c).y / 12);
      (rows[k] = rows[k] || []).push(c);
    }
    const pair = Object.values(rows).find((r) => r.length >= 2);
    if (centred && pair)
      add("T12", "fail", "Centred hero with a button pair", "Centred headline, grey subline and a filled + outlined button pair is the default landing template. Lead with the work; one action is enough.", pair.slice(0, 3).map(label));
    else if (centred && !phone)
      add("T12b", "warn", "Centred hero headline", "A centred hero is the template default. Make sure the composition earns it.", [label(hero)]);
    else if (pair && pair.length >= 2 && !phone)
      add("T12c", "warn", "Two boxed buttons under the hero", "Check whether one plain link would do.", pair.slice(0, 3).map(label));
  }

  // T13 stat counter row.
  const statRows = [];
  for (const parent of new Set(visibleEls.map((el) => el.parentElement))) {
    if (!parent) continue;
    const kids = [...parent.children].filter(visible);
    if (kids.length < 3 || kids.length > 6) continue;
    const ok = kids.filter((k) => {
      const t = (k.innerText || "").trim();
      if (!/^[~≈]?\s*[\d.,]+\s*(\+|%|k\+?|m\+?|x|×|yrs?|years?)?(\s|\n|$)/i.test(t) || t.length > 60) return false;
      const big = [...k.querySelectorAll("*"), k].some((n) => px(style(n).fontSize) >= bodySize * 1.6 && /\d/.test(ownText(n)));
      return big;
    });
    if (ok.length >= 3) statRows.push(parent);
  }
  if (statRows.length) {
    const plus = statRows.some((p) => /\d\s*\+/.test(p.innerText));
    add("T13", plus ? "fail" : "warn", "Stat counter row", "A row of big numbers ('5+ years · 50+ projects') is the template trust bar. Put one real number inside the sentence it proves.", statRows.slice(0, 2).map(label));
  }

  // T14 icons in tinted rounded squares, repeated.
  const iconTiles = visibleEls.filter((el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 28 || r.width > 72 || Math.abs(r.width - r.height) > 4) return false;
    if (radius(el) < 6) return false;
    const bg = rgba(style(el).backgroundColor);
    if (bg[3] < 0.04) return false;
    const kids = [...el.children];
    return kids.length === 1 && (kids[0].nodeName.toLowerCase() === "svg" || kids[0].nodeName === "IMG") && !(el.innerText || "").trim();
  });
  if (iconTiles.length >= 3)
    add("T14", "fail", `Icons in tinted rounded squares (${iconTiles.length})`, "An icon in a soft square above each feature card is the SaaS template. Use the work or a sentence.", iconTiles.slice(0, 4).map(label));

  // T15 bento grid of boxed cards.
  const bento = visibleEls.filter((el) => {
    const s = style(el);
    if (!s.display.includes("grid")) return false;
    const kids = [...el.children].filter(visible);
    if (kids.length < 4) return false;
    const boxed = kids.filter((k) => hasBox(k) && radius(k) >= 10);
    if (boxed.length < 4) return false;
    const sizes = new Set(boxed.map((k) => {
      const r = k.getBoundingClientRect();
      return Math.round(r.width / 40) + "x" + Math.round(r.height / 40);
    }));
    return sizes.size >= 3;
  });
  if (bento.length)
    add("T15", "warn", "Bento grid of rounded cards", "Mixed-size rounded cards in a grid is the 2024 template. Check that the sizes come from the content.", bento.slice(0, 2).map(label));

  // T16 pulsing status dot.
  const dots = visibleEls.filter((el) => {
    const r = el.getBoundingClientRect();
    if (r.width > 16 || r.height > 16 || r.width < 4) return false;
    if (radius(el) < r.width / 2 - 1) return false;
    return el.getAnimations().some((a) => a.effect && a.effect.getTiming().iterations === Infinity);
  });
  if (dots.length) {
    const green = dots.some((d) => {
      const [h, s] = hsl(rgba(style(d).backgroundColor));
      return h > 90 && h < 170 && s > 0.3;
    });
    add("T16", green ? "fail" : "warn", "Pulsing status dot", "A blinking green 'available' dot is a template prop. Say it in words in the contact line.", dots.slice(0, 2).map(label));
  }

  // T17 logo/text marquee.
  const marquee = visibleEls.filter((el) =>
    el.getAnimations().some((a) => {
      if (!a.effect || a.effect.getTiming().iterations !== Infinity) return false;
      const kf = a.effect.getKeyframes ? a.effect.getKeyframes() : [];
      return kf.some((k) => /translateX|translate3d\(\s*-?[\d.]+(%|px)/.test(String(k.transform || k.translate || "")));
    }) && el.querySelectorAll("img,svg,span,li,a").length >= 4,
  );
  if (marquee.length) {
    const logos = marquee.some((m) => m.querySelectorAll("img,svg").length >= 4);
    add("T17", logos ? "fail" : "warn", logos ? "Logo marquee" : "Text marquee", "An endless scrolling strip is decoration that never ends. Show the names once, still.", marquee.slice(0, 2).map(label));
  }

  // T18 default type.
  const families = new Map();
  for (const el of textEls) {
    const f = style(el).fontFamily.split(",")[0].replace(/["']/g, "").trim();
    families.set(f, (families.get(f) || 0) + ownText(el).length);
  }
  const fams = [...families.entries()].sort((a, b) => b[1] - a[1]);
  const defaults = /^(inter|inter variable|geist|geist sans|system-ui|-apple-system|blinkmacsystemfont|segoe ui|roboto|arial|helvetica|helvetica neue|sans-serif|ui-sans-serif|open sans|poppins|montserrat|dm sans|plus jakarta sans|manrope|space grotesk)$/i;
  const heroFam = hero ? style(hero).fontFamily.split(",")[0].replace(/["']/g, "").trim() : "";
  if (heroFam && defaults.test(heroFam))
    add("T18", "warn", `Hero set in a default face (${heroFam})`, "Inter/Geist/system/Poppins/Space Grotesk in the hero reads as an unchosen default. Choose a face for this person; keep the default for UI text if you like.", [label(hero)]);
  if (fams.length > 3)
    add("T18b", "warn", `${fams.length} type families in use`, "More than three families rarely holds together. One family plus one mono or serif is enough.", fams.slice(0, 6).map(([f, n]) => `${f} (${n} chars)`));

  // T19 default Tailwind greys and indigo/violet.
  const tw = [
    "#64748b", "#94a3b8", "#475569", "#334155", "#0f172a", "#1e293b", "#6b7280", "#9ca3af", "#4b5563", "#374151", "#111827", "#1f2937",
    "#71717a", "#a1a1aa", "#52525b", "#3f3f46", "#18181b", "#27272a", "#09090b", "#737373", "#a3a3a3", "#525252", "#171717",
    "#6366f1", "#4f46e5", "#818cf8", "#8b5cf6", "#7c3aed", "#a78bfa", "#a855f7", "#9333ea", "#c084fc",
    "oklch(55.4% 0.046 257.417)", "oklch(70.4% 0.04 256.788)", "oklch(44.6% 0.043 257.281)", "oklch(20.8% 0.042 265.755)", "oklch(12.9% 0.042 264.695)",
    "oklch(55.1% 0.027 264.364)", "oklch(70.7% 0.022 261.325)", "oklch(44.6% 0.03 256.802)", "oklch(21% 0.034 264.665)",
    "oklch(55.2% 0.016 285.938)", "oklch(70.5% 0.015 286.067)", "oklch(44.2% 0.017 285.786)", "oklch(21% 0.006 285.885)", "oklch(14.1% 0.005 285.823)",
    "oklch(55.6% 0 0)", "oklch(70.8% 0 0)", "oklch(43.9% 0 0)", "oklch(20.5% 0 0)",
    "oklch(58.5% 0.233 277.117)", "oklch(51.1% 0.262 276.966)", "oklch(60.6% 0.25 292.717)", "oklch(54.1% 0.281 293.009)", "oklch(62.7% 0.265 303.9)",
  ].map((c) => rgba(c));
  const used = new Set();
  for (const el of visibleEls) {
    const s = style(el);
    for (const c of [s.color, s.backgroundColor, s.borderTopColor]) {
      const v = rgba(c);
      if (v[3] < 0.5) continue;
      const i = tw.findIndex((t) => Math.abs(t[0] - v[0]) + Math.abs(t[1] - v[1]) + Math.abs(t[2] - v[2]) <= 3);
      if (i > -1) used.add(i);
    }
  }
  if (used.size >= 3)
    add("T19", "warn", `${used.size} stock Tailwind greys/indigos`, "Slate/zinc/gray and indigo/violet straight from the default palette. Tint your neutrals toward the page's own hue.", null);

  // T20 one large radius on everything.
  const boxes = visibleEls.filter((el) => {
    const r = el.getBoundingClientRect();
    return r.width * r.height > 2500 && hasBox(el) && !el.matches("img,video,canvas");
  });
  if (boxes.length >= 6) {
    const counts = {};
    for (const b of boxes) {
      const r = Math.round(radius(b));
      counts[r] = (counts[r] || 0) + 1;
    }
    const [topR, n] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (+topR >= 14 && n / boxes.length >= 0.6)
      add("T20", "warn", `One ${topR}px radius on ${n} of ${boxes.length} boxes`, "Rounded-2xl on everything flattens hierarchy. Vary radius by role, or square the editorial parts.", null);
  }

  // T21 numbered mono section labels ("01 / About") and kickers on every section.
  const numbered = textEls.filter((el) => /^(\[?\(?\d{2}\)?\]?)\s*([/—–.·:|-]|\s)\s*[A-Za-z]/.test(ownText(el)) && px(style(el).fontSize) <= 14);
  if (numbered.length >= 3)
    add("T21", "warn", `Numbered section labels (${numbered.length})`, "'01 / About' mono labels on every section are a template rhythm. Use them only where order matters.", numbered.slice(0, 4).map(label));
  const kickers = [...document.querySelectorAll("h2")].filter(visible).filter((h) => {
    const prev = h.previousElementSibling;
    if (!prev || !visible(prev)) return false;
    const s = style(prev);
    return px(s.fontSize) <= 14 && (s.textTransform === "uppercase" || px(s.letterSpacing) > 0.5) && (prev.innerText || "").length < 40;
  });
  if (kickers.length >= 3)
    add("T22", "warn", `Small uppercase kicker over ${kickers.length} section headings`, "An eyebrow over every heading is a template rhythm. Let the heading stand alone.", kickers.slice(0, 3).map(label));

  // T23 hover lift / scale in stylesheets; cursor spotlight; custom cursor.
  const sheetRules = [];
  const walk = (rules) => {
    for (const r of rules) {
      if (r.cssRules && r.cssRules.length) walk(r.cssRules);
      if (r.selectorText) sheetRules.push(r);
    }
  };
  for (const sh of document.styleSheets) {
    try {
      walk(sh.cssRules);
    } catch {}
  }
  const lifts = sheetRules.filter((r) => {
    if (!/:hover/.test(r.selectorText)) return false;
    const st = r.style;
    const t = `${st.transform} ${st.translate} ${st.getPropertyValue("--tw-translate-y")} ${st.scale}`;
    return /translateY\(\s*-|translate3d\([^,]+,\s*-|translate:\s*[^ ]+\s+-|^\s*-|calc\(var\(--spacing\)\s*\*\s*-/.test(t) || /scale\(\s*1\.(0[4-9]|[1-9])/.test(t) || /^\s*1\.(0[4-9]|[1-9])/.test(st.scale || "");
  });
  if (lifts.length)
    add("T23", "warn", `Hover lift or zoom (${lifts.length} rules)`, "Cards that jump up or zoom on hover are a template reflex. Reveal information on hover instead (a fact, a preview, the year).", lifts.slice(0, 4).map((r) => r.selectorText.slice(0, 80)));
  const sheetsText = sheetRules.map((r) => r.cssText).join("\n");
  if (/--(mouse|cursor|pointer)-?(x|y)/i.test(sheetsText) && /radial-gradient/.test(sheetsText))
    add("T24", "warn", "Cursor spotlight", "A radial glow that follows the cursor is an effect library default.", null);
  if (style(document.body).cursor === "none" || style(document.documentElement).cursor === "none")
    add("T25", "warn", "Custom cursor replaces the system cursor", "Hiding the cursor costs precision and accessibility. Keep the system cursor.", null);

  // T26 sticky blurred nav with pill links.
  const navs = visibleEls.filter((el) => ["fixed", "sticky"].includes(style(el).position) && /blur\(/.test(style(el).backdropFilter || "") && el.querySelector("a"));
  const pillNav = navs.filter((n) => radius(n) >= n.getBoundingClientRect().height / 2 - 2 || [...n.querySelectorAll("a")].some((a) => radius(a) >= a.getBoundingClientRect().height / 2 - 1 && hasBox(a)));
  if (pillNav.length) add("T26", "warn", "Floating blurred pill navigation", "The floating glass pill nav is the 2024 default. A plain text row is enough.", pillNav.slice(0, 1).map(label));

  // T28 coloured side stripe on rounded boxes; T29 hairline border under a wide soft shadow.
  const stripes = visibleEls.filter((el) => {
    const s = style(el);
    const r = el.getBoundingClientRect();
    if (r.width * r.height < 3000) return false;
    const l = px(s.borderLeftWidth), rr = px(s.borderRightWidth), t = px(s.borderTopWidth), b = px(s.borderBottomWidth);
    const side = (l >= 2 && rr < 1 && t < 1.5 && b < 1.5) || (rr >= 2 && l < 1 && t < 1.5 && b < 1.5);
    if (!side) return false;
    const c = rgba(l >= 2 ? s.borderLeftColor : s.borderRightColor);
    return hsl(c)[1] > 0.3 && (radius(el) >= 4 || rgba(s.backgroundColor)[3] > 0.04);
  });
  if (stripes.length)
    add("T28", stripes.length >= 3 ? "fail" : "warn", `Coloured side stripe on ${stripes.length} box(es)`, "A thick coloured left border on cards and callouts is a template accent. Use a heading, a ground step or nothing.", stripes.slice(0, 4).map(label));
  const ghost = visibleEls.filter((el) => {
    const s = style(el);
    if (!s.boxShadow || s.boxShadow === "none") return false;
    const bw = px(s.borderTopWidth);
    if (bw < 0.5 || bw > 1.5) return false;
    const blurs = [...s.boxShadow.matchAll(/(-?[\d.]+)px\s+(-?[\d.]+)px\s+([\d.]+)px/g)].map((m) => +m[3]);
    return blurs.some((v) => v >= 16) && el.getBoundingClientRect().width * el.getBoundingClientRect().height > 4000;
  });
  if (ghost.length >= 2)
    add("T29", "warn", `Hairline border plus wide soft shadow on ${ghost.length} boxes`, "The 'ghost card' (1px border and a big blurred shadow) is a generated-UI default. Pick one, or neither.", ghost.slice(0, 3).map(label));

  // T30 middot chains; T31 aphoristic "Not X. Y." cadence; T32 en/em dash separators in short labels.
  const chains = textEls.filter((el) => (ownText(el).match(/·/g) || []).length >= 3);
  if (chains.length)
    add("T30", "warn", `Middot chains in ${chains.length} line(s)`, "Long 'A · B · C · D' strings read as generated metadata. Keep one separator per line, or set the facts as a small table.", chains.slice(0, 3).map(label));
  const cadence = bodyText.match(/\b(Not|No) (a |an |just |the )?[A-Za-z][\w’' -]{1,28}\. (A|An|The|Just|Only)? ?[A-Z]?[\w’' -]{1,28}\./g) || [];
  if (cadence.length >= 2)
    add("T31", "warn", `Aphoristic cadence (${cadence.length})`, "'Not a feature. A platform.' rebuttals are a generated-copy rhythm. Say the fact once.", cadence.slice(0, 3));

  // T27 giant name as the hero with no work beside it (checked with C01 below).
  const heroText = hero ? (hero.innerText || "").trim() : "";
  const nameOnly = hero && heroText.split(/\s+/).length <= 3 && /^[A-ZÀ-Ž][\p{L}'’.-]+(\s+[A-ZÀ-Ž][\p{L}'’.-]+){0,2}\.?$/u.test(heroText);

  // ======================================================================
  // CRAFT FLOOR
  // ======================================================================

  // C01 real work in the first screen.
  const media = visibleEls.filter((el) => el.matches("img,video,canvas,picture,iframe,[role=img]") || (style(el).backgroundImage.includes("url(") && el.getBoundingClientRect().width > 120));
  const vpArea = vw * vh;
  const firstMedia = media
    .map((el) => {
      const r = el.getBoundingClientRect();
      const w = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0));
      const h = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
      return { el, area: w * h };
    })
    .filter((m) => m.area > 0 && !(m.el.matches("img") && m.el.getAttribute("alt") === "" && m.area < vpArea * 0.05));
  const mediaShare = firstMedia.reduce((s, m) => s + m.area, 0) / vpArea;
  const need = phone ? 0.12 : 0.15;
  if (mediaShare < need)
    add("C01", "fail", `Work fills ${(mediaShare * 100).toFixed(0)}% of the first screen`, `At least ${need * 100}% of the first screen should be real work (a screen, a demo, a live piece). Words alone do not prove craft.`, firstMedia.slice(0, 3).map((m) => label(m.el)));
  if (nameOnly && mediaShare < need)
    add("T27", "fail", "Giant name with no work beside it", "A huge name and a grey line is the most common portfolio template. Put the work next to a sentence that says what was built.", [label(hero)]);
  else if (nameOnly && px(style(hero).fontSize) > (phone ? 56 : 120))
    add("T27b", "warn", "The name is the biggest thing on the page", "The name is a label, not the claim. Check that the claim or the work has more weight.", [label(hero)]);

  // C02 first-screen copy load.
  const firstWords = firstScreenText.split(/\s+/).filter(Boolean).length;
  const maxWords = phone ? 70 : 110;
  if (firstWords > maxWords)
    add("C02", "warn", `${firstWords} words in the first screen`, `Keep the first screen under ~${maxWords} words: who, what, one proof, one action.`, null);
  if (hero) {
    const hw = heroText.split(/\s+/).filter(Boolean).length;
    if (hw > 16) add("C02b", "warn", `Hero heading is ${hw} words`, "Keep the main line to 16 words or fewer.", [label(hero)]);
  }
  const sizes = new Set(firstText.map((el) => Math.round(px(style(el).fontSize))).filter((v) => v > 0));
  if (sizes.size > 6)
    add("C03", "warn", `${sizes.size} type sizes in the first screen`, "More than five or six sizes in one view reads as unplanned. Merge near sizes.", [...sizes].sort((a, b) => a - b).map(String));

  // C04 horizontal overflow.
  const overflow = document.documentElement.scrollWidth - innerWidth;
  if (overflow > 1) {
    const culprits = visibleEls.filter((el) => {
      const r = el.getBoundingClientRect();
      if (r.right <= innerWidth + 1) return false;
      for (let n = el.parentElement; n; n = n.parentElement) {
        const ox = style(n).overflowX;
        if (ox !== "visible") return n === document.documentElement || n === document.body;
      }
      return true;
    });
    add("C04", "fail", `Page scrolls sideways by ${overflow}px`, "Something is wider than the screen.", culprits.slice(0, 4).map(label));
  }

  // C05 targets.
  const interactive = visibleEls.filter((el) => el.matches("a[href],button,input:not([type=hidden]),select,textarea,summary,[role=button],[role=tab],[role=switch],[tabindex]:not([tabindex='-1'])"));
  const tiny = [];
  const small = [];
  for (const el of interactive) {
    const r = el.getBoundingClientRect();
    const inline = el.matches("a") && el.parentElement && /^(P|LI|SPAN|FIGCAPTION|DD|TD|SMALL)$/.test(el.parentElement.nodeName) && ownText(el.parentElement).length > 20;
    if (inline) continue;
    if (r.width < 24 || r.height < 24) tiny.push(el);
    else if (phone && (r.width < 44 || r.height < 44)) small.push(el);
  }
  if (tiny.length) add("C05", "fail", `${tiny.length} target(s) under 24px`, "WCAG 2.2 asks for 24×24 at least. Pad the hit area.", tiny.slice(0, 5).map(label));
  if (small.length) add("C05b", "warn", `${small.length} phone target(s) under 44px`, "Aim for 44×44 on touch. Extend the hit area with padding or a pseudo-element.", small.slice(0, 5).map(label));

  // C06 contrast.
  const lowContrast = [];
  for (const el of textEls) {
    if (el.closest("[aria-hidden=true]")) continue;
    const s = style(el);
    const fg = rgba(s.color);
    const bg = effectiveBg(el);
    if (!bg) continue;
    const shown = over([fg[0], fg[1], fg[2], fg[3] * opacityChain(el)], bg);
    const size = px(s.fontSize);
    const large = size >= 24 || (size >= 18.66 && +s.fontWeight >= 700);
    const need2 = large ? 3 : 4.5;
    const r = ratio(shown, bg);
    if (r < need2 - 0.05) lowContrast.push(`${label(el)} ${r.toFixed(2)}:1`);
  }
  if (lowContrast.length)
    add("C06", "fail", `${lowContrast.length} text element(s) below contrast`, "Body text needs 4.5:1, large text 3:1.", lowContrast.slice(0, 6));

  // C07 small text and long lines.
  const tinyText = textEls.filter((el) => px(style(el).fontSize) < 12 && ownText(el).length > 3);
  if (tinyText.length) add("C07", "warn", `${tinyText.length} text element(s) under 12px`, "Under 12px is hard to read, most of all on phones.", tinyText.slice(0, 4).map(label));
  const longLines = [...document.querySelectorAll("p")].filter(visible).filter((p) => {
    const s = style(p);
    return p.getBoundingClientRect().width / (px(s.fontSize) * 0.5) > 88 && (p.innerText || "").length > 160;
  });
  if (longLines.length) add("C07b", "warn", `${longLines.length} paragraph(s) wider than ~85 characters`, "Keep reading measure at 45–75 characters.", longLines.slice(0, 3).map(label));

  // C08 images.
  const imgs = [...document.images].filter(visible);
  const noAlt = imgs.filter((i) => !i.hasAttribute("alt"));
  if (noAlt.length) add("C08", "fail", `${noAlt.length} image(s) without alt`, "Name the screen in alt text, or alt=\"\" if decorative.", noAlt.slice(0, 4).map((i) => i.currentSrc.split("/").pop()));
  const upscaled = imgs.filter((i) => i.complete && i.naturalWidth && i.getBoundingClientRect().width > i.naturalWidth * 1.02 * (devicePixelRatio > 1 ? 1 : 1));
  if (upscaled.length) add("C08b", "fail", `${upscaled.length} image(s) shown larger than their pixels`, "Soft screenshots kill the craft claim. Export at 2× the shown size.", upscaled.slice(0, 4).map((i) => `${i.currentSrc.split("/").pop()} ${Math.round(i.getBoundingClientRect().width)}px shown, ${i.naturalWidth}px file`));
  const notRetina = imgs.filter((i) => i.complete && i.naturalWidth && i.getBoundingClientRect().width * 2 > i.naturalWidth * 1.15 && i.getBoundingClientRect().width > 160 && !upscaled.includes(i));
  if (notRetina.length) add("C08c", "warn", `${notRetina.length} image(s) below 2× density`, "Phones and Retina screens will show them soft.", notRetina.slice(0, 4).map((i) => i.currentSrc.split("/").pop()));
  const noSize = imgs.filter((i) => !i.getAttribute("width") && !i.getAttribute("height") && style(i).aspectRatio === "auto");
  if (noSize.length) add("C08d", "warn", `${noSize.length} image(s) without width/height or aspect-ratio`, "Reserve the space to avoid layout shift.", noSize.slice(0, 4).map((i) => i.currentSrc.split("/").pop()));
  const broken = [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.getAttribute("src"));
  if (broken.length) add("C08e", "fail", `${broken.length} broken image(s)`, "", broken.slice(0, 4).map((i) => i.getAttribute("src")));

  // C09 headings.
  if (h1s.length !== 1) add("C09", "warn", `${h1s.length} visible h1 elements`, "Use exactly one h1.", h1s.slice(0, 3).map(label));
  const levels = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter(visible).map((h) => +h.nodeName[1]);
  for (let i = 1; i < levels.length; i++)
    if (levels[i] > levels[i - 1] + 1) {
      add("C09b", "warn", `Heading level jumps from h${levels[i - 1]} to h${levels[i]}`, "Do not skip heading levels.", null);
      break;
    }

  // C14 typography mechanics: tight leading, justified text, wide tracking on body, long caps, extreme tracking.
  const paras = textEls.filter((el) => ownText(el).length > 120);
  const tight = paras.filter((el) => {
    const s = style(el);
    const lh = s.lineHeight === "normal" ? 1.2 : px(s.lineHeight) / px(s.fontSize);
    return lh < 1.3;
  });
  if (tight.length) add("C14", "warn", `${tight.length} paragraph(s) with line-height under 1.3`, "Body text wants 1.45–1.7.", tight.slice(0, 3).map(label));
  const justified = paras.filter((el) => style(el).textAlign === "justify");
  if (justified.length) add("C14b", "warn", "Justified body text", "Justified text makes rivers on the web. Set it ragged.", justified.slice(0, 2).map(label));
  const wide = paras.filter((el) => px(style(el).letterSpacing) / px(style(el).fontSize) > 0.05);
  if (wide.length) add("C14c", "warn", "Wide tracking on body text", "Keep body tracking near 0.", wide.slice(0, 2).map(label));
  const caps = textEls.filter((el) => style(el).textTransform === "uppercase" && ownText(el).length > 80);
  if (caps.length) add("C14d", "warn", "Long all-caps text", "All caps over ~80 characters is hard to read.", caps.slice(0, 2).map(label));
  const crushed = textEls.filter((el) => px(style(el).letterSpacing) / px(style(el).fontSize) < -0.055);
  if (crushed.length) add("C14e", "warn", "Tracking tighter than -0.05em", "Letters start to touch. Display type sits around -0.02 to -0.04em.", crushed.slice(0, 2).map(label));

  // C15 clipped text.
  const clipped = textEls.filter((el) => {
    const s = style(el);
    if (!/(hidden|clip)/.test(s.overflowX + s.overflowY)) return false;
    if (s.textOverflow === "ellipsis") return false;
    return el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 4;
  });
  if (clipped.length) add("C15", "warn", `${clipped.length} text box(es) cut off`, "Text runs past its box and is hidden.", clipped.slice(0, 4).map(label));

  // C16 document basics.
  const vpMeta = document.querySelector('meta[name="viewport"]')?.getAttribute("content") || "";
  if (/user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0)?\b/.test(vpMeta)) add("C16", "fail", "Zoom is disabled", "Remove user-scalable=no and maximum-scale.", [vpMeta]);
  if (!document.documentElement.lang) add("C16b", "warn", "No lang on <html>", "", null);
  const lazyFirst = [...document.images].filter((i) => i.loading === "lazy" && visible(i) && inFirst(i) && i.getBoundingClientRect().width > 200);
  if (lazyFirst.length) add("C16c", "warn", `${lazyFirst.length} first-screen image(s) set to lazy`, "Lazy loading the largest first-screen image delays LCP. Load it eagerly with fetchpriority=high.", lazyFirst.slice(0, 3).map((i) => i.currentSrc.split("/").pop()));
  const allRules = sheetRules.map((r) => r.style && r.style.transitionProperty).filter(Boolean);
  if (allRules.some((t) => /(^|,\s*)all(\s|,|$)/.test(t))) add("C16d", "warn", "transition: all", "Name the properties you animate (transform, opacity). 'all' animates layout by accident.", null);

  // C10 a page title and a description for sharing.
  if (!document.title || document.title.length < 3) add("C10", "warn", "No page title", "", null);
  if (!document.querySelector('meta[name="description"]')) add("C10b", "warn", "No meta description", "", null);

  // ---- hidden-until-scrolled content ------------------------------------
  const hiddenBelow = visibleEls.length
    ? all.filter((el) => {
        const r = docRect(el);
        if (r.y < vh * 1.05 || r.w < 1 || r.h < 1) return false;
        const s = style(el);
        if (s.display === "none") return false;
        return parseFloat(s.opacity) < 0.05 && (ownText(el).length > 0 || el.matches("img,video,canvas,figure,section,article,li"));
      })
    : [];
  const hiddenOuter = hiddenBelow.filter((el) => !hiddenBelow.some((o) => o !== el && o.contains(el)));

  return {
    findings,
    facts: {
      title: document.title,
      hero: hero ? { text: heroText.slice(0, 140), font: style(hero).fontFamily.split(",")[0], size: px(style(hero).fontSize) } : null,
      families: fams.slice(0, 6).map(([f]) => f),
      firstScreenWords: firstWords,
      firstScreenSizes: [...sizes].sort((a, b) => a - b),
      mediaShareFirstScreen: +mediaShare.toFixed(2),
      pageHeight: document.documentElement.scrollHeight,
      hiddenBelowFold: hiddenOuter.length,
      hiddenBelowFoldSample: hiddenOuter.slice(0, 4).map(label),
    },
  };
};

// Motion snapshot: what is animating and how.
const MOTION = () => {
  const out = [];
  const layout = /^(width|height|top|left|right|bottom|inset|margin|padding|font-size|font-weight|letter-spacing|line-height|border-width|grid-template|flex-basis|max-height|max-width)/;
  for (const a of document.getAnimations()) {
    const e = a.effect;
    if (!e) continue;
    const t = e.getTiming();
    const kf = e.getKeyframes ? e.getKeyframes() : [];
    const props = new Set();
    for (const k of kf) for (const p of Object.keys(k)) if (!["offset", "computedOffset", "easing", "composite"].includes(p)) props.add(p.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase()));
    if (a.transitionProperty) props.add(a.transitionProperty);
    const easings = new Set([t.easing, ...kf.map((k) => k.easing).filter(Boolean)]);
    const target = e.target;
    const scrollLinked = a.timeline && a.timeline.constructor && a.timeline.constructor.name !== "DocumentTimeline";
    out.push({
      kind: a.constructor.name,
      name: a.animationName || a.transitionProperty || a.id || "",
      target: target ? target.nodeName.toLowerCase() + (typeof target.className === "string" && target.className ? "." + target.className.trim().split(/\s+/)[0] : "") : "",
      duration: typeof t.duration === "number" ? Math.round(t.duration) : t.duration,
      delay: Math.round(t.delay || 0),
      iterations: t.iterations,
      easing: [...easings].filter((x) => x && x !== "linear" || easings.size === 1).join(" | ") || "linear",
      props: [...props],
      layoutProps: [...props].filter((p) => layout.test(p)),
      scrollLinked,
      fromScaleZero: kf.length > 0 && /scale\(0(\)|,\s*0\))/.test(String(kf[0].transform || "") + String(kf[0].scale === "0" ? "scale(0)" : "")),
      state: a.playState,
    });
  }
  return out;
};

const FRAMES = (ms) =>
  new Promise((done) => {
    const deltas = [];
    let last = performance.now();
    const end = last + ms;
    const tick = (now) => {
      deltas.push(now - last);
      last = now;
      if (now < end) requestAnimationFrame(tick);
      else {
        deltas.sort((a, b) => a - b);
        const q = (p) => +deltas[Math.min(deltas.length - 1, Math.floor(deltas.length * p))].toFixed(1);
        done({ frames: deltas.length, p50: q(0.5), p95: q(0.95), max: q(1), over25: deltas.filter((d) => d > 25).length });
      }
    };
    requestAnimationFrame(tick);
  });

// ---------------------------------------------------------------------------
async function run() {
  const browser = await chromium.launch({ executablePath, args: ["--disable-dev-shm-usage", "--enable-gpu-rasterization"] });
  const report = { url, name, at: new Date().toISOString(), viewports: [] };

  for (const [width, height] of viewports) {
    const phone = width < 700;
    const tag = `${width}`;
    const vp = { size: `${width}x${height}`, phone, findings: [], motion: {}, metrics: {} };
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: phone ? 2 : 1,
      isMobile: phone,
      hasTouch: phone,
      reducedMotion: "no-preference",
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e.message || e)));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await page.addInitScript(INIT);
    if (throttle > 1) {
      const cdp = await context.newCDPSession(page);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: throttle });
    }
    const t0 = Date.now();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    for (const ms of frames) {
      const wait = ms - (Date.now() - t0);
      if (wait > 0) await page.waitForTimeout(wait);
      await page.screenshot({ path: join(outDir, `${tag}-t${ms}.png`) });
    }
    const introFrames = await page.evaluate(FRAMES, 1500);
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    await page.evaluate(() => document.fonts && document.fonts.ready);
    const motionAtLoad = await page.evaluate(MOTION);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: join(outDir, `${tag}.png`) });
    const det = await page.evaluate(DETECT, { phone });
    vp.findings.push(...det.findings);
    vp.facts = det.facts;

    // Focus: tab a few times and check for a visible indicator.
    const focus = [];
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("Tab");
      const f = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const s = getComputedStyle(el);
        const ring = (s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0) || (s.boxShadow && s.boxShadow !== "none");
        return { el: el.nodeName.toLowerCase() + ((el.innerText || el.getAttribute("aria-label") || "").trim() ? ` "${(el.innerText || el.getAttribute("aria-label")).trim().slice(0, 30)}"` : ""), ring };
      });
      if (f) focus.push(f);
    }
    const noRing = focus.filter((f) => !f.ring);
    if (noRing.length)
      vp.findings.push({ id: "C11", severity: "warn", title: `${noRing.length} of ${focus.length} focused controls show no outline or ring`, detail: "Check :focus-visible styles (a border or background change may also count).", where: noRing.map((f) => f.el) });
    await page.keyboard.press("Escape").catch(() => {});
    await page.evaluate(() => (document.activeElement && document.activeElement.blur && document.activeElement.blur()));

    // Scroll the page with the wheel, sampling frames and motion.
    const smooth = await page.evaluate(() => {
      const h = document.documentElement;
      return /lenis|locomotive|has-scroll-smooth|smooth-scroll/.test(h.className + " " + document.body.className) || !!document.querySelector("[data-lenis-prevent],[data-scroll-container]");
    });
    if (smooth) vp.findings.push({ id: "M05", severity: "warn", title: "Smooth-scroll library", detail: "Scroll hijacking changes the feel of the wheel and trackpad, fights reduced motion and costs frames. Native scroll is the default.", where: null });
    const before = await page.evaluate(() => scrollY);
    const framesPromise = page.evaluate(FRAMES, 2600);
    const mouseY = Math.round(height / 2);
    await page.mouse.move(Math.round(width / 2), mouseY);
    for (let i = 0; i < 12; i++) {
      await page.mouse.wheel(0, Math.round(height * 0.45));
      await page.waitForTimeout(180);
    }
    const scrollFrames = await framesPromise;
    const after = await page.evaluate(() => scrollY);
    const expected = Math.round(height * 0.45) * 12;
    const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    if (after - before < Math.min(expected, maxScroll) * 0.6 && maxScroll > height)
      vp.findings.push({ id: "M06", severity: "warn", title: `Wheel moved the page ${after - before}px of ${Math.min(expected, maxScroll)}px`, detail: "The page resists or slows native scrolling (pinning or a scroll hijack).", where: null });
    const motionScrolled = await page.evaluate(MOTION);
    // Walk to the bottom and back to let reveals finish, then check what is still hidden.
    await page.evaluate(async () => {
      const step = innerHeight * 0.8;
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
        scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
    });
    await page.waitForTimeout(900);
    const stillHidden = await page.evaluate(() => {
      const out = [];
      for (const el of document.body.querySelectorAll("p,h1,h2,h3,li,figure,img,a,button")) {
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) continue;
        if (r.top + scrollY < scrollY - innerHeight * 3 || r.top > innerHeight) continue;
        let o = 1;
        for (let n = el; n && n !== document.documentElement; n = n.parentElement) o *= parseFloat(getComputedStyle(n).opacity);
        if (o < 0.05 && getComputedStyle(el).visibility !== "hidden" && !el.closest("[aria-hidden=true],dialog:not([open]),[inert]")) out.push(el.nodeName.toLowerCase() + " " + (el.innerText || el.getAttribute("alt") || "").trim().slice(0, 40));
      }
      return out;
    });
    if (stillHidden.length)
      vp.findings.push({ id: "M07", severity: "fail", title: `${stillHidden.length} element(s) still invisible in view after scrolling`, detail: "Content that waits for a reveal and never gets it. Content must be visible without the animation.", where: stillHidden.slice(0, 5) });
    if (det.facts.hiddenBelowFold >= 6)
      vp.findings.push({ id: "M08", severity: "warn", title: `${det.facts.hiddenBelowFold} blocks start invisible below the fold`, detail: "Fade-up on every section is a template rhythm, and blank screenshots or slow devices show empty pages. Reveal only what tells a story.", where: det.facts.hiddenBelowFoldSample });

    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(400);
    await page.screenshot({ path: join(outDir, `${tag}-full.png`), fullPage: true }).catch(() => {});

    // Motion verdicts.
    const anims = [...motionAtLoad, ...motionScrolled];
    const seen = new Map();
    for (const a of anims) seen.set(`${a.kind}|${a.name}|${a.target}|${a.props.join(",")}`, a);
    const uniq = [...seen.values()];
    const timed = uniq.filter((a) => !a.scrollLinked && typeof a.duration === "number");
    const loops = uniq.filter((a) => a.iterations === Infinity || a.iterations === "Infinity");
    const slow = timed.filter((a) => a.iterations !== Infinity && a.duration > 900);
    const layoutAnims = uniq.filter((a) => a.layoutProps.length);
    const linear = timed.filter((a) => a.iterations !== Infinity && /^linear$/.test(a.easing) && a.props.some((p) => /transform|translate|opacity|scale/.test(p)) && a.duration > 120);
    const fromZero = uniq.filter((a) => a.fromScaleZero);
    if (fromZero.length)
      vp.findings.push({ id: "M04c", severity: "warn", title: `${fromZero.length} entrance(s) from scale(0)`, detail: "Nothing in the world appears from nothing. Start at scale(0.95–0.97) with opacity.", where: fromZero.slice(0, 3).map((a) => `${a.target} ${a.name}`) });
    const easeIn = timed.filter((a) => /ease-in($|[^-])|cubic-bezier\(0\.[4-9]\d*,\s*0(\.0)?,\s*1,\s*1\)/.test(a.easing) && a.iterations !== Infinity);
    if (loops.length > 1)
      vp.findings.push({ id: "M01", severity: loops.length > 3 ? "fail" : "warn", title: `${loops.length} endless animations`, detail: "Loops that never end pull the eye from the work and drain battery. Keep at most one, and make it carry information.", where: loops.slice(0, 5).map((a) => `${a.target} ${a.name} ${a.duration}ms`) });
    if (slow.length)
      vp.findings.push({ id: "M02", severity: slow.some((a) => a.duration > 1600) ? "fail" : "warn", title: `${slow.length} animation(s) longer than 900ms`, detail: "Interface motion lives at 120–400 ms; a page entrance at most ~800 ms. Long fades read as slow, not premium.", where: slow.slice(0, 5).map((a) => `${a.target} ${a.name} ${a.duration}ms`) });
    if (layoutAnims.length)
      vp.findings.push({ id: "M03", severity: "warn", title: `${layoutAnims.length} animation(s) on layout properties`, detail: "Animating width/height/top/margin re-lays out every frame. Animate transform, opacity or clip-path.", where: layoutAnims.slice(0, 5).map((a) => `${a.target} ${a.layoutProps.join(",")}`) });
    const jsLayout = await page.evaluate(() => window.__pc.styleMutations);
    const jsHits = Object.entries(jsLayout).filter(([, n]) => n > 30);
    if (jsHits.length)
      vp.findings.push({ id: "M03b", severity: "warn", title: "Script animates layout properties", detail: "Inline style churn on layout properties (likely a JS animation). Prefer transform.", where: jsHits.map(([p, n]) => `${p}: ${n} changes`) });
    if (linear.length)
      vp.findings.push({ id: "M04", severity: "warn", title: `${linear.length} movement(s) with linear easing`, detail: "Linear motion looks mechanical. Use a strong ease-out (e.g. cubic-bezier(0.23, 1, 0.32, 1)) or a spring.", where: linear.slice(0, 4).map((a) => `${a.target} ${a.name} ${a.duration}ms`) });
    if (easeIn.length)
      vp.findings.push({ id: "M04b", severity: "warn", title: `${easeIn.length} animation(s) with ease-in`, detail: "Ease-in starts slow and feels laggy on entrances. Use ease-out for things that appear.", where: easeIn.slice(0, 4).map((a) => `${a.target} ${a.name}`) });

    vp.motion = {
      atLoad: motionAtLoad.length,
      duringScroll: motionScrolled.length,
      scrollLinked: uniq.filter((a) => a.scrollLinked).length,
      loops: loops.length,
      durations: [...new Set(timed.map((a) => a.duration))].sort((a, b) => a - b).slice(0, 12),
      easings: [...new Set(timed.map((a) => a.easing))].slice(0, 8),
      sample: uniq.slice(0, 14).map((a) => `${a.kind} ${a.target} ${a.name || a.props.join(",")} ${a.duration}ms ${a.easing}${a.iterations === Infinity ? " ∞" : ""}`),
    };

    const pc = await page.evaluate(() => window.__pc);
    vp.metrics = {
      cls: +pc.cls.toFixed(3),
      shifts: pc.shifts.slice(0, 5),
      lcp: pc.lcp,
      longFrames: pc.loaf.length,
      longFrameMax: pc.loaf.reduce((m, f) => Math.max(m, f.d), 0),
      introFrames,
      scrollFrames,
      errors: errors.slice(0, 5),
    };
    if (pc.cls > 0.1) vp.findings.push({ id: "C12", severity: "fail", title: `Layout shift ${pc.cls.toFixed(3)}`, detail: "Reserve space for images, fonts and late content.", where: pc.shifts.map((s) => `${s.value} at ${s.t}ms ${s.nodes.join(" ")}`) });
    else if (pc.cls > 0.02) vp.findings.push({ id: "C12", severity: "warn", title: `Layout shift ${pc.cls.toFixed(3)}`, detail: "Small shifts; aim for 0.", where: pc.shifts.map((s) => `${s.value} at ${s.t}ms ${s.nodes.join(" ")}`) });
    if (errors.length) vp.findings.push({ id: "C13", severity: "warn", title: `${errors.length} console error(s)`, detail: "", where: errors.slice(0, 3) });
    await context.close();

    // Reduced motion pass.
    const rctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, isMobile: phone, hasTouch: phone, reducedMotion: "reduce" });
    const rpage = await rctx.newPage();
    await rpage.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await rpage.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    await rpage.waitForTimeout(1500);
    const rMotion = await rpage.evaluate(MOTION);
    await rpage.screenshot({ path: join(outDir, `${tag}-reduced.png`) });
    const rLoops = rMotion.filter((a) => (a.iterations === Infinity || a.iterations === "Infinity") && a.state === "running" && a.props.some((p) => /transform|translate|scale|rotate|left|top/.test(p)));
    const rMoves = rMotion.filter((a) => a.state === "running" && typeof a.duration === "number" && a.duration > 250 && a.props.some((p) => /transform|translate|scale|rotate/.test(p)) && !a.scrollLinked);
    if (rLoops.length) vp.findings.push({ id: "M09", severity: "fail", title: `${rLoops.length} moving loop(s) still run with reduced motion`, detail: "prefers-reduced-motion must stop movement loops. Keep fades and colour changes if they carry meaning.", where: rLoops.slice(0, 4).map((a) => `${a.target} ${a.name}`) });
    else if (rMoves.length) vp.findings.push({ id: "M09b", severity: "warn", title: `${rMoves.length} movement(s) run with reduced motion`, detail: "Swap movement for an opacity change or an instant state.", where: rMoves.slice(0, 4).map((a) => `${a.target} ${a.name} ${a.duration}ms`) });
    vp.metrics.reducedMotionAnimations = rMotion.length;
    await rctx.close();

    report.viewports.push(vp);
  }
  // Contact sheet: every first screen side by side, for a quick look and for reviewers.
  try {
    const sheet = await browser.newPage({ viewport: { width: 1600, height: 900 } });
    const img = (file) => `data:image/png;base64,${readFileSync(join(outDir, file)).toString("base64")}`;
    const cells = viewports
      .map(([w]) => `<figure><img src="${img(`${w}.png`)}"><figcaption>${w} · first screen</figcaption></figure>`)
      .concat(viewports.map(([w]) => `<figure><img src="${img(`${w}-reduced.png`)}"><figcaption>${w} · reduced motion</figcaption></figure>`))
      .join("");
    await sheet.setContent(`<style>body{margin:0;padding:24px;background:#e9e7e1;font:13px/1.3 ui-monospace,monospace;color:#222;display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start}figure{margin:0}img{display:block;height:520px;width:auto;outline:1px solid #0002}figcaption{margin-top:6px}h1{width:100%;margin:0;font:600 18px/1.2 system-ui}</style><h1>${name} — ${url}</h1>${cells}`);
    await sheet.waitForLoadState("load");
    await sheet.screenshot({ path: join(outDir, "sheet.png"), fullPage: true });
    await sheet.close();
  } catch {}
  await browser.close();
  return report;
}

function toMarkdown(r) {
  const lines = [`# Portfolio check: ${r.name}`, "", `URL: ${r.url}  `, `Run: ${r.at}`, ""];
  const allF = r.viewports.flatMap((v) => v.findings.map((f) => ({ ...f, vp: v.size })));
  const fails = allF.filter((f) => f.severity === "fail");
  const warns = allF.filter((f) => f.severity === "warn");
  const tells = allF.filter((f) => f.id.startsWith("T"));
  lines.push(`**Verdict:** ${fails.length ? "FAIL" : "PASS"} · ${fails.length} hard fail(s), ${warns.length} warning(s) · template tells: ${new Set(tells.filter((f) => f.severity === "fail").map((f) => f.id)).size} hard, ${new Set(tells.filter((f) => f.severity === "warn").map((f) => f.id)).size} soft`, "");
  for (const v of r.viewports) {
    lines.push(`## ${v.size}${v.phone ? " (phone)" : ""}`, "");
    const f = v.facts || {};
    lines.push(`- Hero: ${f.hero ? `"${f.hero.text}" · ${f.hero.font} ${f.hero.size}px` : "none"}`);
    lines.push(`- Work in first screen: ${Math.round((f.mediaShareFirstScreen || 0) * 100)}% · words: ${f.firstScreenWords} · sizes: ${(f.firstScreenSizes || []).join(", ")}`);
    lines.push(`- Families: ${(f.families || []).join(", ")} · page height ${f.pageHeight}px`);
    lines.push(`- CLS ${v.metrics.cls} · LCP ${v.metrics.lcp ? v.metrics.lcp.t + "ms " + (v.metrics.lcp.node || "") : "n/a"} · long frames ${v.metrics.longFrames} (max ${v.metrics.longFrameMax}ms)`);
    lines.push(`- Frames (headless, indicative): intro p95 ${v.metrics.introFrames.p95}ms · scroll p95 ${v.metrics.scrollFrames.p95}ms, ${v.metrics.scrollFrames.over25} over 25ms`);
    lines.push(`- Motion: ${v.motion.atLoad} at load, ${v.motion.duringScroll} during scroll, ${v.motion.scrollLinked} scroll-linked, ${v.motion.loops} loops · durations ${v.motion.durations.join("/")}ms · easings ${v.motion.easings.join(" ; ")}`);
    lines.push("");
    const order = { fail: 0, warn: 1, info: 2 };
    const sorted = v.findings.slice().sort((a, b) => order[a.severity] - order[b.severity] || a.id.localeCompare(b.id));
    if (!sorted.length) lines.push("No findings.", "");
    else {
      lines.push("| | Id | Finding | Fix | Where |", "|---|---|---|---|---|");
      for (const x of sorted)
        lines.push(`| ${x.severity === "fail" ? "✗" : "△"} | ${x.id} | ${x.title} | ${x.detail.replace(/\|/g, "/")} | ${(x.where || []).join("<br>").replace(/\|/g, "/").slice(0, 400)} |`);
      lines.push("");
    }
  }
  lines.push("Screenshots: `<width>.png` (first screen), `<width>-full.png`, `<width>-reduced.png`, and `<width>-t<ms>.png` when --frames is set.", "");
  return lines.join("\n");
}

run()
  .then((r) => {
    writeFileSync(join(outDir, "report.json"), JSON.stringify(r, null, 2));
    const md = toMarkdown(r);
    writeFileSync(join(outDir, "report.md"), md);
    if (asJson) console.log(JSON.stringify(r, null, 2));
    else console.log(md);
    const hard = r.viewports.some((v) => v.findings.some((f) => f.severity === "fail"));
    process.exit(hard ? 1 : 0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(2);
  });
