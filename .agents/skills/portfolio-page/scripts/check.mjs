#!/usr/bin/env node
// portfolio-page checker.
// Changelog (2026-10-07, from design/portfolio-skill/research/05-critique.md):
//   - T00 weighs soft tells (strong 1, weak 0.5; allowed and single-instance weak tells do not count): fail at 3, warn at 2.
//   - C01 counts canvas/video only inside [data-work], unions areas (max 100%), bar 25% / 20% (read 15% / 12%); C01b names the work.
//   - Owner name (--owner or <meta name="author">) drives C18 (the claim is the largest text) and T27; a hidden h1 fails C09, no hero guessing.
//   - Default faces are found behind @font-face aliases (--fonts-ok vouches for one); T18b ignores families under 1% of characters.
//   - Copy: lists A-F in data/phrases.json feed T10-T10f; T44 triplets, T45 numbers not in --facts, T11/T11b em dashes, C02 budgets 90/120.
//   - Fewer false positives: T12c, T13 (data-numbers), T21, T23, T31, C05 (WCAG 2.5.8 spacing), C07 (11 px), M06, M08 (per section), T06b var().
//   - Motion: transition/animation events and rAF callbacks are logged; M02 fails above 1,100 ms unless data-motion="story"; M09c, M10, M11, C17.
//   - T16/T17/T33 see pseudo-element loops; C06b samples contrast over images and gradients; T26b nav CTA; --scheme dark; --list.
//
// Opens a page in Chromium at two sizes and reports:
//   1. template tells (AI "slop"): pill eyebrow over the hero title, gradient text,
//      faint 1px card borders, glass, glow, stat rows, emoji, buzzwords, and more;
//   2. the craft floor: work in the first screen, the claim as the largest text,
//      overflow, targets, contrast, images, headings, type count, layout shift;
//   3. motion: durations, easing, animated properties, loops, reduced motion,
//      content hidden until scrolled, frame timing.
//
// Usage:
//   node check.mjs <url> [--out dir] [--name slug] [--viewports 1440x900,390x844]
//                  [--mode read] [--owner "Name"] [--facts CONTENT.md[,more.md]]
//                  [--fonts-ok "Alias=Real Face"] [--scheme dark] [--allow "T06=reason;…"]
//                  [--throttle 4] [--frames 120,320,700] [--json]
//   node check.mjs --list      # every finding id, its severity rule and meaning (Markdown)
//
// Exit code 1 when a hard fail is found, so loops can stop on it.
// Needs Playwright (playwright or playwright-core). Set PLAYWRIGHT_MODULE or
// CHROMIUM_PATH if they are not found.

import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);

// ---------------------------------------------------------------------------
// Registry: every finding id, its severity rule and what it means. `--list` prints it.
// Weight: how much a soft (△) T-tell adds to T00. Unlisted T-ids weigh 1.
const WEIGHT = {
  T03: 1, T04: 1, T05: 1, T06b: 1, T07: 1, T13: 1, T15: 1, T16: 1, T17: 1, T19: 1, T22: 1, T26: 1, T26b: 1, T28: 1, T29: 1, T36: 1, T42: 1, T10b: 1, T45: 1,
  T11: 0.5, T11b: 0.5, T12b: 0.5, T12c: 0.5, T18b: 0.5, T18c: 0.5, T20: 0.5, T21: 0.5, T23: 0.5, T27b: 0.5, T30: 0.5, T31: 0.5, T33: 0.5, T35: 0.5,
  T37: 0.5, T39: 0.5, T40: 0.5, T41: 0.5, T10d: 0.5, T10e: 0.5, T10f: 0.5, T44: 0.5,
};
const CHECKS = [
  ["T00", "✗ at 3, △ at 2", "Soft tells add up. Each △ T-tell adds its weight (1 strong, 0.5 weak); allowed tells, `info` findings and a weak tell with a single instance add nothing."],
  ["T01", "✗", "Pill or badge right above the hero title."],
  ["T02", "✗", "Gradient-filled text."],
  ["T03", "✗ at 3+, △ 1–2", "Faint 1px rounded outlines on boxes (AI borders)."],
  ["T04", "✗ at 2+, △ 1", "Frosted-glass panels outside fixed chrome and dialogs."],
  ["T05", "✗ at 2+, △ 1", "Coloured glow shadow."],
  ["T06", "✗", "Purple/indigo/violet gradient (a stop at hue 255–315° with chroma > 0.12, or two cool stops)."],
  ["T06b", "△ (info when the authored gradient uses custom properties)", "Large decorative multi-hue gradient ground. A computed colour (var()) is reported as info: declare `allow T06b: <source>`."],
  ["T07", "△", "Dot or grid pattern ground."],
  ["T08", "✗", "Blurred colour blobs."],
  ["T09", "✗ in headings/buttons or 3+, else △", "Emoji in headings, links, list items or the first screen."],
  ["T10", "✗", "Banned phrase (lists A, B and template phrases in `data/phrases.json`) in the first screen."],
  ["T10b", "✗ at 3+ banned, else △", "Banned phrases or microcopy templates (list F: Let's talk, Hire me, Selected work, Home, Services …) on the page."],
  ["T10c", "✗", "Scope dodge in project text (list D: worked on, helped with, was involved in, contributed to, responsible for …). Project text: the whole page in `--mode read`; work/project sections otherwise."],
  ["T10d", "△", "Result dodge with no number in the same sentence (list E: improved, enhanced, optimised, significantly, modern/clean/intuitive …)."],
  ["T10e", "△", "Mixed voice: \"I\" together with he/his/him or \"<owner> is\"; or he/his/him used for the owner (needs the owner name)."],
  ["T10f", "△", "Technical words on a home page (list C: component, route, API, token, tenant …) outside a \"For engineers\" section. Not run in `--mode read`."],
  ["T11", "△", "Em dashes in prose above 3 per 1,000 words."],
  ["T11b", "△", "Em dash in a heading (h1–h3), list row, button or link."],
  ["T12", "✗", "Centred hero with a filled + ghost button pair."],
  ["T12b", "△", "Centred hero headline (desktop, not in `--mode read`)."],
  ["T12c", "△", "Filled + ghost button pair under the hero: 2–3 sibling buttons of ≤ 4 words, one filled, one outlined."],
  ["T13", "✗ with +, %, counting or vanity labels; △ when most labels are ≤ 24 chars", "Stat counter row (3+ big numbers). Rows inside `[data-numbers]` are skipped."],
  ["T14", "✗", "Icons in tinted rounded squares (3+)."],
  ["T15", "△", "Bento grid of rounded cards."],
  ["T16", "✗ green, else △", "Pulsing status dot, pseudo-element loops included."],
  ["T17", "✗ logos, △ words", "Endless marquee."],
  ["T18", "✗", "Largest text in a default face (Inter, Geist, system, Roboto, Poppins, Montserrat, DM Sans …), also behind an `@font-face` alias whose `src` is a default face. `--fonts-ok \"Alias=Real\"` vouches for an alias."],
  ["T18b", "△", "More than three type families (families under 1% of the characters are ignored)."],
  ["T18c", "△", "Reflex display face (Fraunces, Space Grotesk, Instrument Serif, Playfair, Syne …). Keep it with `allow T18c: <reason>`."],
  ["T19", "△", "Three or more stock Tailwind greys/indigos."],
  ["T20", "△", "One radius ≥ 14px on 60%+ of boxes."],
  ["T21", "△", "Numbered section labels (\"01 / About\", ≤ 24 chars, a separator after the number) in 3+ places outside one list."],
  ["T22", "△", "Small uppercase kicker over 3+ section headings."],
  ["T23", "△", "Hover lift or zoom on a selector that matches 4+ elements (buttons and labelled controls skipped)."],
  ["T24", "△", "Cursor spotlight."],
  ["T25", "△", "System cursor hidden or replaced."],
  ["T26", "△", "Floating blurred pill navigation."],
  ["T26b", "△", "Sticky or fixed translucent/blurred navigation with a filled call-to-action button."],
  ["T27", "✗", "Giant name with no work beside it (the owner's name, or a name-like heading also in the nav/footer/title)."],
  ["T27b", "△", "The name is the biggest thing on the page, or is set as a sentence with a full stop (\"Name.\")."],
  ["T28", "✗ at 3+, else △", "Coloured side stripe on boxes."],
  ["T29", "△", "Hairline border plus wide soft shadow on 2+ boxes."],
  ["T30", "△", "Middot chains (3+ in one line)."],
  ["T31", "△ at 2+", "\"Not X. Y.\" cadence: both fragments ≤ 4 words, no verb in the second."],
  ["T32", "✗", "Effect-library components and spinning conic borders."],
  ["T33", "△", "Scroll cue: a \"scroll\" label or a looping arrow near the bottom of the first screen."],
  ["T34", "✗", "Dark ground with neon glow."],
  ["T35", "△", "Pure black on white, or the reverse."],
  ["T36", "✗ at 3+, else △", "Card inside a card (screen frames excluded)."],
  ["T37", "△", "Italic accent word in a second family inside a heading."],
  ["T38", "✗", "Tech-stack logo grid."],
  ["T39", "△", "Traffic-light window dots."],
  ["T40", "△", "Faded giant number watermark."],
  ["T41", "△", "Full-height hero with one centred sentence."],
  ["T42", "✗ at 5+, △ at 4", "Sections in a row with the same rhythm and centred headings."],
  ["T43", "✗", "Heading text that changes by itself (typewriter, rotating words)."],
  ["T44", "✗ at 5+, △ at 3+", "\"X, Y and Z\" triplets in the copy."],
  ["T45", "△", "Numbers (2+ digits, or with + or %) in headings, rows or the first screen that are not in the `--facts` files. Years inside a fact's year range pass."],
  ["C01", "✗", "Work fills less than 25% of the first screen at 1440 / 20% at 390 (15% / 12% in `--mode read`). Counts img, picture, iframe, [role=img], background images and `[data-work]`; canvas and video only inside `[data-work]`. Areas are unioned, so the share never passes 100%."],
  ["C01b", "✗", "The first-screen work has no name: no alt, aria-label or `data-work` value."],
  ["C02", "✗ > 120, △ > 90 (read: △ > 170)", "Words in the first screen outside the nav and `[data-work]`."],
  ["C02b", "△", "Hero heading over 20 words."],
  ["C03", "△", "More than 6 type sizes in the first screen."],
  ["C04", "✗", "The page scrolls sideways."],
  ["C05", "✗ when crowded, △ when spaced", "Target under 24px. Fails only when its 24px circle touches another target (WCAG 2.5.8 spacing exception); inline links in sentences are exempt."],
  ["C05b", "△", "Phone target under 44px."],
  ["C06", "✗", "Text below 4.5:1 (3:1 for large text) on a solid ground."],
  ["C06b", "✗ body text < 3:1, △ < 4.5:1 (large < 3:1)", "Text over an image or gradient: contrast against the average colour sampled behind the text box (approximate)."],
  ["C07", "△", "Text under 11px, or 11–12px text that is not a short caps label (tracked ≥ 0.04em) or mono label of ≤ 3 words."],
  ["C07b", "△", "Paragraphs wider than ~85 characters."],
  ["C08", "✗", "Images without alt."],
  ["C08b", "✗", "Images shown larger than their pixels."],
  ["C08c", "△", "Images below 2× density."],
  ["C08d", "△", "Images without width/height or aspect-ratio."],
  ["C08e", "✗", "Broken images."],
  ["C09", "✗ (△ in `--mode read`); △ for 2+ h1", "No visible h1 in the first screen (a screen-reader-only h1 does not count; the checker never guesses the claim from the largest text)."],
  ["C09b", "△", "Heading level jumps."],
  ["C10", "△", "No page title."],
  ["C10b", "△", "No meta description."],
  ["C11", "△", "Focused controls without a visible outline or ring."],
  ["C12", "✗ > 0.1, △ > 0.02", "Cumulative layout shift."],
  ["C13", "△", "Console errors."],
  ["C14", "△", "Paragraph line-height under 1.3."],
  ["C14b", "△", "Justified body text."],
  ["C14c", "△", "Wide tracking on body text."],
  ["C14d", "△", "Long all-caps text."],
  ["C14e", "△", "Tracking tighter than -0.05em."],
  ["C15", "△", "Text cut off by its box."],
  ["C16", "✗", "Zoom disabled."],
  ["C16b", "△", "No lang on <html>."],
  ["C16c", "△", "Lazy-loaded first-screen image."],
  ["C16d", "△", "`transition: all` in the stylesheets."],
  ["C17", "△ > 1,500ms; with --throttle: △ > 1,000ms, ✗ > 2,500ms", "Largest contentful paint."],
  ["C18", "✗ when the biggest text is the owner's name, else △", "The claim (the h1) is not the largest text in the first screen: another text is more than 1.15× its size, or the name itself is the h1 and the largest text."],
  ["M01", "✗ > 3, △ 2–3", "Endless animations."],
  ["M02", "✗ > 1,100ms (△ under `data-motion=\"story\"`), △ > 900ms", "Long animations and transitions, sampled and from transition/animation events (colour-only transitions ignored)."],
  ["M03", "△", "Animations on layout properties."],
  ["M03b", "△", "Script animates layout properties (inline style churn)."],
  ["M04", "△", "Linear easing on movement."],
  ["M04b", "△", "ease-in on an animation."],
  ["M04c", "△", "Entrance from scale(0)."],
  ["M05", "△", "Smooth-scroll library."],
  ["M06", "△", "The wheel moves the page less than expected (skipped on pages shorter than 3 screens)."],
  ["M07", "✗", "Content still invisible in view after scrolling."],
  ["M08", "✗ at 6+, △ at 4+", "Sections that start invisible below the fold (counted per top-level section)."],
  ["M08b", "△", "One figure or list hides more than 12 children until scrolled."],
  ["M09", "✗", "Moving loops still run under reduced motion."],
  ["M09b", "△", "Movement runs under reduced motion."],
  ["M09c", "✗", "requestAnimationFrame loop (> 5 callbacks/s after 2s idle) under reduced motion, unless a visible `[data-motion=\"story\"]` control exists."],
  ["M10", "✗ > 50ms, △ > 33ms (--throttle ≥ 4: ✗ > 33, △ > 20)", "Scroll frame time p95 (headless, indicative; snapped to vsync steps). Fails only when a blank page measured in the same pass holds 60fps; on a busy machine it warns."],
  ["M11", "△", "More than 2 elements animate in the first screen at load."],
];
const BY_HAND = [
  ["Hover gating", "Hover effects only under `(hover: hover) and (pointer: fine)`; nothing hover-only on touch."],
  ["Stagger totals", "A sequence ends on a still within ~1s; overlaps ≤ 30% of a duration."],
  ["Layer budget", "`will-change` only on what is about to move; no page-wide layer promotion."],
  ["Hidden loops", "Loops pause when off screen or in a background tab."],
  ["WebGL under reduced motion", "No WebGL context or shader loop when reduced motion is on; a still frame instead."],
  ["Motion purpose", "Every animation has a reason; the one story animation is marked `data-motion=\"story\"`."],
  ["Coherence and rhythm", "Coherence counts, specificity of copy, rhythm variance between sections (signals H05–H07)."],
  ["Keyboard path", "Tab reaches the work in a few steps from the top (H10)."],
  ["Screenshot text size", "Text inside first-screen screenshots stays ≥ 11px on a phone."],
  ["Costumes and props", "Retro OS, fake terminal, device fans, invented testimonials and logos (`anti-slop.md`)."],
  ["Readability", "Sentence length and grade level (`writing.md`)."],
];
const SIGNALS = "H01 display face, H02 type decision (stretch, variation, numerals, balance), H03 asymmetry, H04 work large (≥ 25% / 20%), H09 themed surfaces, H11 name small, H12 tinted ground, H15 self-hosted fonts.";

function listMarkdown() {
  const sevHasWarn = (s) => s.includes("△");
  const lines = [
    "# Checks",
    "",
    "Generated by `node scripts/check.mjs --list`. Do not edit by hand; change the registry in `scripts/check.mjs` and regenerate.",
    "",
    "Severity: ✗ hard fail (one fails the draft), △ warning, info (printed, never counted). A soft T-tell adds its weight to `T00`; three points fail the page, two warn. Allow a deliberate exception with `<meta name=\"portfolio-check\" content=\"allow T06b: reason\">` or `--allow \"T06b=reason\"`; allowed findings print as ○ and do not count.",
    "",
    "Flags: `--owner \"Name\"` (or `<meta name=\"author\">`) for C18, T27, T10e; `--facts CONTENT.md` for T45; `--mode read` for case and about pages; `--fonts-ok \"Alias=Real\"`; `--scheme dark`; `--throttle 4` for C17 and M10. Markers: `data-work=\"<product>\"`, `data-numbers`, `data-motion=\"story\"`.",
    "",
    "| Id | Severity | T00 weight | Meaning |",
    "|---|---|---|---|",
  ];
  for (const [id, sev, meaning] of CHECKS)
    lines.push(`| ${id} | ${sev} | ${id.startsWith("T") && id !== "T00" && sevHasWarn(sev) ? WEIGHT[id] ?? 1 : "—"} | ${meaning.replace(/\|/g, "\\|")} |`);
  lines.push("", "## Checked by hand", "", "Not automated, on purpose (too unreliable headless, or a judgement):", "", "| Check | What to look for |", "|---|---|");
  for (const [k, v] of BY_HAND) lines.push(`| ${k} | ${v} |`);
  lines.push("", `Human-made signals (reported, never a verdict): ${SIGNALS}`, "");
  return lines.join("\n");
}

if (argv.includes("--list")) {
  console.log(listMarkdown());
  process.exit(0);
}
if (!argv.length || argv.includes("--help") || argv[0].startsWith("--")) {
  console.log(
    'node check.mjs <url> [--out dir] [--name slug] [--viewports 1440x900,390x844] [--mode read] [--owner "Name"] [--facts CONTENT.md] [--fonts-ok "Alias=Real"] [--scheme dark] [--allow "T06=reason;…"] [--throttle 4] [--frames 120,320,700] [--json]\nnode check.mjs --list',
  );
  process.exit(argv.includes("--help") ? 0 : 2);
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
const mode = flag("mode", "experience"); // "read" for case studies and about pages
const owner = (flag("owner", "") || "").trim();
const scheme = flag("scheme", "light") === "dark" ? "dark" : "light";
const pairs = (s) =>
  Object.fromEntries(
    (s || "")
      .split(";")
      .map((x) => x.split("="))
      .filter(([k, v]) => k && v)
      .map(([k, v]) => [k.trim(), v.trim()]),
  );
// Deliberate exceptions, each with a written reason: --allow "T06=sky colour computed from the sun;T18c=Fraunces chosen for …"
const cliAllow = pairs(flag("allow", ""));
// Honest font aliases: --fonts-ok "KT Fraunces=Fraunces;Body=Söhne"
const fontsOk = pairs((flag("fonts-ok", "") || "").replace(/,(?=[^;=]*=)/g, ";"));
const factsFiles = (flag("facts", "") || "").split(",").map((s) => s.trim()).filter(Boolean);
let factsText = "";
for (const f of factsFiles) {
  const p = resolve(f);
  if (!existsSync(p)) {
    console.error(`--facts: ${p} not found`);
    process.exit(2);
  }
  factsText += "\n" + readFileSync(p, "utf8");
}

function loadPhrases() {
  const file = join(here, "data", "phrases.json");
  if (!existsSync(file)) {
    console.error(`warning: ${file} not found; copy checks T10–T10f run without lists`);
    return [];
  }
  const data = JSON.parse(readFileSync(file, "utf8"));
  const out = [];
  for (const [key, list] of Object.entries(data.lists || {}))
    for (const e of list.entries || []) {
      const flags = e.flags || "iu";
      try {
        new RegExp(e.re, flags);
      } catch (err) {
        throw new Error(`data/phrases.json list ${key}: bad pattern ${e.re}: ${err.message}`);
      }
      out.push({ list: key, re: e.re, flags, label: e.label, sev: e.sev || list.sev || "fail", on: e.on || "text" });
    }
  return out;
}
const phrases = loadPhrases();

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
  w.__pc = { cls: 0, shifts: [], loaf: [], lcp: null, styleMutations: {}, events: [], raf: 0 };
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
  // requestAnimationFrame callbacks, to find canvas/JS loops that ignore reduced motion.
  try {
    const raf = w.requestAnimationFrame;
    if (raf)
      w.requestAnimationFrame = function (cb) {
        return raf.call(w, function (t) {
          w.__pc.raf++;
          return cb(t);
        });
      };
  } catch {}
  // CSS transitions and animations as they start (scroll reveals included).
  const lab = (el) =>
    el.nodeName.toLowerCase() + (typeof el.className === "string" && el.className.trim() ? "." + el.className.trim().split(/\s+/)[0] : "");
  const split = (v) => String(v || "").split(/,(?![^(]*\))/).map((s) => s.trim());
  const ms = (v) => {
    v = String(v || "0").trim();
    return v.endsWith("ms") ? parseFloat(v) : parseFloat(v) * 1000;
  };
  const at = (list, i) => list[i % list.length];
  const log = (e) => {
    try {
      if (w.__pc.events.length > 800) return;
      const el = e.target;
      if (!el || el.nodeType !== 1) return;
      const pseudo = e.pseudoElement || "";
      const cs = getComputedStyle(el, pseudo || null);
      let rec;
      if (e.type === "transitionstart") {
        const props = split(cs.transitionProperty);
        let i = props.indexOf(e.propertyName);
        if (i < 0) i = props.indexOf("all");
        if (i < 0) i = 0;
        rec = {
          kind: "CSSTransition",
          name: e.propertyName,
          props: [e.propertyName],
          duration: Math.round(ms(at(split(cs.transitionDuration), i))),
          delay: Math.round(ms(at(split(cs.transitionDelay), i))),
          easing: at(split(cs.transitionTimingFunction), i),
          iterations: 1,
        };
      } else {
        const names = split(cs.animationName);
        let i = names.indexOf(e.animationName);
        if (i < 0) i = 0;
        const it = at(split(cs.animationIterationCount), i);
        const anim = el.getAnimations({ subtree: true }).find((a) => a.animationName === e.animationName && a.effect && a.effect.target === el);
        const props = new Set();
        let fromScaleZero = false;
        if (anim && anim.effect.getKeyframes) {
          const kf = anim.effect.getKeyframes();
          for (const k of kf) for (const p of Object.keys(k)) if (!["offset", "computedOffset", "easing", "composite"].includes(p)) props.add(p.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase()));
          fromScaleZero = kf.length > 0 && /scale\(0(\)|,\s*0\))/.test(String(kf[0].transform || "") + String(kf[0].scale === "0" ? "scale(0)" : ""));
        }
        rec = {
          kind: "CSSAnimation",
          name: e.animationName,
          props: [...props],
          duration: Math.round(ms(at(split(cs.animationDuration), i))),
          delay: Math.round(ms(at(split(cs.animationDelay), i))),
          easing: at(split(cs.animationTimingFunction), i),
          iterations: it === "infinite" ? Infinity : +it || 1,
          fromScaleZero,
        };
      }
      const r = el.getBoundingClientRect();
      rec.t = Math.round(performance.now());
      rec.target = lab(el) + pseudo;
      rec.story = !!el.closest('[data-motion="story"]');
      rec.inFirst = scrollY < 4 && r.top < innerHeight && r.bottom > 0 && r.width > 0;
      w.__pc.events.push(rec);
    } catch {}
  };
  try {
    w.addEventListener("transitionstart", log, true);
    w.addEventListener("animationstart", log, true);
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
const DETECT = ({ phone, mode, owner, fontsOk, phrases, factsText }) => {
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
  const oklch = ([r, g, b]) => {
    const f = (v) => {
      v /= 255;
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    const [R, G, B] = [f(r), f(g), f(b)];
    const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
    const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
    const q = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
    const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * q;
    const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * q;
    const Bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * q;
    const C = Math.hypot(A, Bb);
    const H = (Math.atan2(Bb, A) * 180) / Math.PI;
    return [L, C, H < 0 ? H + 360 : H];
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
  const sizeOf = (el) => px(style(el).fontSize);
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
  const words = (t) => (t || "").split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w));
  const norm = (s) =>
    (s || "").normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  const safeMatches = (el, sel) => {
    try {
      return el.matches(sel);
    } catch {
      return false;
    }
  };

  const visibleEls = all.filter(visible);
  // Decorative layers are often aria-hidden; visual tells look at everything painted.
  const rendered = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    const s = style(el);
    return s.visibility !== "hidden" && s.display !== "none" && opacityChain(el) > 0.05;
  };
  const renderedEls = all.filter(rendered);
  const textEls = visibleEls.filter((el) => ownText(el).length > 0);
  const firstText = textEls.filter(inFirst);

  // ---- stylesheets -----------------------------------------------------------
  const sheetRules = [];
  const fontFaces = [];
  const walk = (rules) => {
    for (const r of rules) {
      if (r.constructor && r.constructor.name === "CSSFontFaceRule") fontFaces.push(r);
      if (r.cssRules && r.cssRules.length) walk(r.cssRules);
      if (r.selectorText) sheetRules.push(r);
    }
  };
  for (const sh of document.styleSheets) {
    try {
      walk(sh.cssRules);
    } catch {}
  }
  const sheetsText = sheetRules.map((r) => r.cssText).join("\n");

  // ---- owner name --------------------------------------------------------------
  const ownerName = (owner || document.querySelector('meta[name="author"]')?.getAttribute("content") || "").trim();
  const ownerN = norm(ownerName);
  const ownerTokens = ownerN ? ownerN.split(" ").filter((t) => t.length >= 3) : [];
  const hasOwner = (t) => !!ownerN && ` ${norm(t)} `.includes(` ${ownerN} `);
  const isOwnerName = (t) => {
    const n = norm(t);
    if (!n || !ownerN) return false;
    if (n === ownerN) return true;
    const toks = n.split(" ");
    return toks.length <= 3 && toks.every((x) => ownerTokens.includes(x));
  };
  const chromeText = norm(
    [document.title, ...[...document.querySelectorAll("nav,footer,[role=contentinfo],[role=navigation]")].map((e) => e.innerText || "")].join(" "),
  );
  const nameRe = /^[A-ZÀ-Ž][\p{L}'’.-]+(\s+[A-ZÀ-Ž][\p{L}'’.-]+){0,2}\.?$/u;
  const looksLikeName = (t) => {
    const s = (t || "").trim().replace(/\s+/g, " ");
    return !!s && words(s).length <= 3 && nameRe.test(s) && chromeText.includes(norm(s));
  };
  const nameish = (t) => (ownerN ? isOwnerName(t) : looksLikeName(t));

  // ---- hero heading: the visible h1 in the first screen, never a guess -------
  const h1All = [...document.querySelectorAll("h1")];
  const h1s = h1All.filter(visible);
  const hero = h1s.find(inFirst) || null;
  const heroRect = hero ? docRect(hero) : null;
  const heroText = hero ? (hero.innerText || "").trim() : "";
  const bodySize = px(style(document.body).fontSize) || 16;
  if (!hero) {
    const hidden = h1All.length && !h1s.length;
    add(
      "C09",
      mode === "read" ? "warn" : "fail",
      hidden ? "The h1 is hidden (screen-reader only)" : h1s.length ? "The h1 is below the first screen" : "No h1",
      "The claim is the page's h1 and the largest text in the first screen. The checker does not guess the claim from the largest text, so the hero checks (T01, T12, T18, T27, C02b) did not run.",
      h1All.slice(0, 2).map((h) => `${h.nodeName.toLowerCase()} "${(h.textContent || "").trim().slice(0, 48)}"`),
    );
  } else if (h1s.length > 1) add("C09", "warn", `${h1s.length} visible h1 elements`, "Use exactly one h1.", h1s.slice(0, 3).map(label));

  // ---- the largest text in the first screen (outside the work and the nav) ----
  const bigCands = firstText.filter((el) => !el.closest("[data-work],nav,[role=navigation]") && opacityChain(el) >= 0.3 && rgba(style(el).color)[3] >= 0.3);
  const biggest = bigCands.slice().sort((a, b) => sizeOf(b) - sizeOf(a))[0] || null;
  const biggestText = biggest ? (biggest.innerText || ownText(biggest)).trim() : "";

  // ---- fonts: resolve @font-face aliases to the face they load ---------------
  const defaultFaceFile = /^(inter|geist|roboto|poppins|montserrat|dmsans|opensans|lato|nunito|raleway|worksans)/;
  const prettyDefault = { inter: "Inter", geist: "Geist", roboto: "Roboto", poppins: "Poppins", montserrat: "Montserrat", dmsans: "DM Sans", opensans: "Open Sans", lato: "Lato", nunito: "Nunito", raleway: "Raleway", worksans: "Work Sans" };
  const aliasMap = {};
  for (const r of fontFaces) {
    const fam = (r.style.getPropertyValue("font-family") || "").replace(/["']/g, "").trim();
    const src = r.style.getPropertyValue("src") || "";
    if (!fam || aliasMap[fam.toLowerCase()]) continue;
    for (const entry of src.split(/,(?![^(]*\))/)) {
      const loc = /local\(\s*["']?([^"')]+)["']?\s*\)/i.exec(entry);
      const u = /url\(\s*["']?([^"')]+)["']?\s*\)/i.exec(entry);
      if (u) {
        const base = u[1].split(/[?#]/)[0].split("/").pop().toLowerCase().replace(/\.[a-z0-9]+$/, "");
        const key = base.replace(/[^a-z]/g, "");
        const m = !/mono|slab|serif/.test(key) && defaultFaceFile.exec(key);
        if (m) aliasMap[fam.toLowerCase()] = prettyDefault[m[1]];
        break; // a file loads; it decides the face
      }
      if (loc) {
        const key = loc[1].toLowerCase().replace(/[^a-z]/g, "");
        const m = !/mono|slab|serif/.test(key) && defaultFaceFile.exec(key);
        if (m) {
          aliasMap[fam.toLowerCase()] = prettyDefault[m[1]];
          break;
        }
      }
    }
  }
  const okMap = Object.fromEntries(Object.entries(fontsOk || {}).map(([k, v]) => [k.toLowerCase(), v]));
  const famOf = (el) => style(el).fontFamily.split(",")[0].replace(/["']/g, "").trim();
  const realFam = (f) => okMap[f.toLowerCase()] || aliasMap[f.toLowerCase()] || f;
  const famLabel = (f) => (realFam(f) !== f ? `${f} → ${realFam(f)}` : f);
  const defaults = /(^|[^a-z])(inter(\s?(variable|display|tight))?|intervariable|geist( sans)?|system-ui|-apple-system|blinkmacsystemfont|segoe ui|roboto|arial|helvetica( neue)?|sans-serif|ui-sans-serif|open sans|poppins|montserrat|dm sans|work sans|lato|nunito|raleway|source sans( pro| 3)?)([^a-z]|$)/i;
  const isDefault = (f) => {
    const r = realFam(f);
    return defaults.test(r) && !/mono|slab|(?<!sans-)serif/i.test(r);
  };
  const reflex = /(space grotesk|plus jakarta|manrope|outfit|syne|playfair|merriweather|lora|instrument serif|instrument sans|fraunces|newsreader|cormorant|dm serif|recoleta|ibm plex sans|geist mono|space mono)/i;

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
  const glass = renderedEls.filter((el) => {
    const s = style(el);
    if (!/blur\(/.test(s.backdropFilter || s.webkitBackdropFilter || "")) return false;
    return !["fixed", "sticky"].includes(s.position) && !el.closest("dialog,[role=dialog]");
  });
  if (glass.length >= 2)
    add("T04", "fail", `Frosted-glass panels (${glass.length})`, "Backdrop blur on content panels is the glassmorphism template. Use an opaque ground.", glass.slice(0, 4).map(label));
  else if (glass.length) add("T04", "warn", "Frosted-glass panel", "One blurred panel. Keep it only if it sits over moving content that must stay legible.", glass.map(label));

  // T05 coloured glow shadows.
  const glow = renderedEls.filter((el) => {
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
    return false;
  });
  if (glow.length)
    add("T05", glow.length >= 2 ? "fail" : "warn", `Coloured glow on ${glow.length} element(s)`, "A saturated, blurred shadow reads as neon template. Use a neutral shadow only on objects that float (a dialog, a dragged item), or none.", glow.slice(0, 4).map(label));

  // T06 purple/indigo/violet gradients and decorative multi-hue gradients.
  const gradients = renderedEls.filter((el) => /gradient\(/.test(style(el).backgroundImage));
  const purple = [];
  const decorative = [];
  for (const el of gradients) {
    const stops = colorTokens(style(el).backgroundImage).filter((c) => c[3] > 0.15);
    const hs = stops.map(hsl).filter(([, s, l]) => s > 0.3 && l > 0.15 && l < 0.85);
    const ok = stops.map(oklch);
    const r = el.getBoundingClientRect();
    const band = ok.filter(([, c, h]) => h >= 255 && h <= 315 && c > 0.12).length;
    const cool = ok.filter(([, c, h]) => h >= 200 && h <= 330 && c > 0.1).length;
    if (stops.length >= 2 && (band >= 1 || cool >= 2)) purple.push(el);
    else if (hs.length >= 2 && r.width * r.height > vw * vh * 0.08) {
      const hues = hs.map(([h]) => h);
      const spread = Math.max(...hues) - Math.min(...hues);
      if (spread > 40) decorative.push(el);
    }
  }
  if (purple.length)
    add("T06", "fail", "Purple/indigo gradient", "Violet-to-blue or purple-to-pink gradients are the strongest generated-site tell. Take colour from the work instead.", purple.slice(0, 4).map(label));
  // A gradient authored with custom properties is usually computed (a sky from the sun); report it as info.
  const authoredVar = (el) => {
    const bgDecl = /background(-image)?\s*:[^;]*var\(/i;
    if (bgDecl.test(el.getAttribute("style") || "")) return true;
    return sheetRules.some((r) => bgDecl.test(r.cssText) && safeMatches(el, r.selectorText));
  };
  const decoVar = decorative.filter(authoredVar);
  const decoPlain = decorative.filter((el) => !decoVar.includes(el));
  if (decoPlain.length)
    add("T06b", "warn", "Large multi-hue gradient ground", "A big decorative gradient behind content. Check that it comes from the work or carries meaning; if the colour is computed, declare `allow T06b: <source>`.", decoPlain.slice(0, 3).map(label));
  else if (decoVar.length)
    add("T06b", "info", "Large multi-hue gradient from custom properties", "The gradient's stops come from var(). If the colour is computed from something real, declare `allow T06b: <source>` so the next reviewer can judge it.", decoVar.slice(0, 3).map(label));

  // T07 dot or grid pattern backgrounds, usually with a radial fade.
  const patterns = renderedEls.filter((el) => {
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
  const blobs = renderedEls.filter((el) => {
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
    add("T09", emojiEls.length >= 3 || emojiEls.some((el) => el.closest("h1,h2,h3,button")) ? "fail" : "warn", `Emoji in headings, links or the first screen (${emojiEls.length})`, "Emoji as decoration (👋 ✨ 🚀) is a template voice. Use words or a drawn icon from one set.", emojiEls.slice(0, 5).map(label));

  // ---- copy ----------------------------------------------------------------
  const bodyRaw = document.body.innerText || "";
  const bodyText = bodyRaw.replace(/\s+/g, " ");
  const bodyLines = bodyRaw.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  const sentencesOf = (lines) => lines.flatMap((l) => l.split(/(?<=[.!?])\s+(?=[\p{Lu}\d"“‘(])/u)).map((s) => s.trim()).filter(Boolean);
  const bodySentences = sentencesOf(bodyLines);
  const firstScreenText = firstText.map(ownText).join(" ");
  const P = (phrases || []).map((p) => ({ ...p, rx: new RegExp(p.re, p.flags) }));
  const labelsOf = (els) => {
    const out = [];
    for (const el of els) {
      const t = (el.innerText || "").trim();
      if (!t || t.length > 160) continue;
      for (const frag of t.split(/\s*[·•|]\s*|(?<=[.!?])\s+|\n+/)) {
        const f = frag.trim().replace(/[.!?:;,]+$/, "").trim();
        if (f && f.length <= 40) out.push(f);
      }
    }
    return out;
  };
  const labelEls = visibleEls.filter((el) => el.matches("a,button,h1,h2,h3,h4,h5,h6,summary,li,dt,th,figcaption,small") || (el.closest("footer,nav,[role=contentinfo]") && ownText(el).length > 0));
  const allLabels = labelsOf(labelEls);
  const firstLabels = labelsOf(labelEls.filter(inFirst));
  const hitIn = (e, text, labels) => (e.on === "label" ? labels.some((l) => e.rx.test(l)) : e.rx.test(text));

  // T10 / T10b template phrases (lists A, B, F, T).
  const tplPhrases = P.filter((p) => ["A", "B", "F", "T"].includes(p.list));
  const firstFail = tplPhrases.filter((e) => e.sev === "fail" && hitIn(e, firstScreenText, firstLabels));
  if (firstFail.length)
    add("T10", "fail", "Template phrases in the first screen", "Replace with a plain, specific sentence: what was built, for whom, with one fact.", [...new Set(firstFail.map((e) => e.label))]);
  const rest = tplPhrases.filter((e) => !firstFail.includes(e) && hitIn(e, bodyText, allLabels));
  if (rest.length) {
    const banned = rest.filter((e) => e.sev === "fail");
    add("T10b", banned.length >= 3 ? "fail" : "warn", `Template phrases or microcopy in the page (${rest.length})`, "Rewrite each as a concrete fact. Microcopy: name the destination (\"Work\", \"Email hi@…\", \"CV\").", [...new Set(rest.map((e) => `${e.label}${e.sev === "fail" ? "" : " (flag)"}`))]);
  }

  // T10c scope dodges in project text.
  const projectRoots = (() => {
    if (mode === "read") return [document.querySelector("main") || document.body];
    const sel = "article,[data-project],[data-work],#work,#projects,[id*=project i],[class*=project i],[class*=case-study i],[id*=work i]";
    const els = [...document.querySelectorAll(sel)].filter(visible);
    for (const sec of document.querySelectorAll("section")) {
      const h = sec.querySelector("h2,h3");
      if (h && /^(work|projects?|selected work|case stud)/i.test((h.innerText || "").trim())) els.push(sec);
    }
    return els.filter((el, i, arr) => arr.indexOf(el) === i && !arr.some((o) => o !== el && o.contains(el)));
  })();
  const projectSentences = sentencesOf(projectRoots.flatMap((el) => (el.innerText || "").split(/\n+/)));
  const dodgeHits = [];
  for (const e of P.filter((p) => p.list === "D"))
    for (const s of projectSentences) if (e.rx.test(s)) dodgeHits.push(`${e.label}: "${s.slice(0, 70)}"`);
  if (dodgeHits.length)
    add("T10c", "fail", `Scope dodges in project text (${dodgeHits.length})`, "Say what you built and what others built: \"Built the sign-in and dashboard screens. Teammates built the wallet.\"", [...new Set(dodgeHits)].slice(0, 6));

  // T10d result dodges with no number in the sentence.
  const resultHits = [];
  for (const s of bodySentences) {
    if (/\d/.test(s)) continue;
    for (const e of P.filter((p) => p.list === "E")) if (e.rx.test(s)) resultHits.push(`${e.label}: "${s.slice(0, 70)}"`);
  }
  if (resultHits.length)
    add("T10d", "warn", `Result words without a number (${resultHits.length})`, "\"Improved\", \"enhanced\", \"significantly\" say nothing on their own. State what changed with a number, or what shipped and where it is live.", [...new Set(resultHits)].slice(0, 5));

  // T10e mixed voice.
  {
    const copy = bodySentences.filter((s) => !/^[“"]/.test(s));
    const hasI = copy.some((s) => /(^|[^\p{L}'’])I(?![\p{L}'’])/u.test(s) || /\bI['’](m|ve|d|ll)\b/.test(s));
    const thirdRe = /\b(he|his|him|himself)\b/i;
    const hasHe = copy.some((s) => thirdRe.test(s));
    const first = ownerTokens[0];
    const ownerIsRe = ownerN ? new RegExp(`\\b(${[ownerName, ...ownerName.split(/\s+/)].filter((x) => x.length >= 3).map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")}) is\\b`, "iu") : null;
    const ownerIs = ownerIsRe ? copy.some((s) => ownerIsRe.test(s)) : false;
    const ownerPronoun = ownerN
      ? copy.filter((s, i) => thirdRe.test(s) && ownerTokens.some((t) => ` ${norm(s)} ${norm(copy[i - 1] || "")} `.includes(` ${t} `)))
      : [];
    if (hasI && (hasHe || ownerIs))
      add("T10e", "warn", "Mixed voice: \"I\" and the third person", "Pick one voice. With no-person copy, the owner's name may be a subject (\"Gentrit wrote the rules\"); pronouns (he, his, him) and \"I\" may not mix.", copy.filter((s) => thirdRe.test(s) || (ownerIsRe && ownerIsRe.test(s))).slice(0, 3).map((s) => s.slice(0, 80)));
    else if (ownerPronoun.length)
      add("T10e", "warn", "He/his/him for the owner", `Write the owner's name (${first ? first[0].toUpperCase() + first.slice(1) : "the name"}) or no person; pronouns read as a third-party bio.`, ownerPronoun.slice(0, 3).map((s) => s.slice(0, 80)));
  }

  // T10f technical words on a home page (list C), outside "For engineers".
  if (mode !== "read") {
    let text = bodyText;
    for (const h of document.querySelectorAll("h2,h3,h4,summary")) {
      if (!/for engineers|engineering notes|technical notes|under the hood/i.test(h.innerText || "")) continue;
      const sec = h.closest("section,article,aside,details") || h.parentElement;
      const t = (sec.innerText || "").replace(/\s+/g, " ").trim();
      if (t) text = text.split(t).join(" ");
    }
    for (const c of document.querySelectorAll("code,pre,kbd,samp,[data-work]")) {
      const t = (c.innerText || "").replace(/\s+/g, " ").trim();
      if (t) text = text.split(t).join(" ");
    }
    const tech = P.filter((p) => p.list === "C" && p.rx.test(text)).map((p) => p.label);
    if (tech.length)
      add("T10f", "warn", `Technical words on the home page (${tech.length})`, "Translate for a stranger: component → building block, route → page, query → database request, tenant → client organization. Keep the terms under \"For engineers\".", tech.slice(0, 8));
  }

  // T11 em dashes: none in headings, rows, buttons and links; at most 3 per 1,000 words of prose.
  const dashEls = textEls.filter((el) => ownText(el).includes("—") && ownText(el) !== "—" && el.closest("h1,h2,h3,li,button,a"));
  if (dashEls.length)
    add("T11b", "warn", `Em dash in ${dashEls.length} heading(s), row(s) or link(s)`, "Em dashes in headings and rows are a generated-copy tell. Use a full stop, a colon or two lines.", dashEls.slice(0, 4).map(label));
  const proseEls = textEls.filter((el) => el.closest("p,blockquote,dd,figcaption,td") && !el.closest("h1,h2,h3,li,button,a,nav,[data-work]"));
  const proseText = proseEls.map(ownText).join(" ");
  const proseWords = words(proseText).length;
  const proseDashes = (proseText.match(/—/g) || []).length;
  if (proseDashes && proseWords && (proseDashes / proseWords) * 1000 > 3)
    add("T11", "warn", `Em dashes: ${proseDashes} in ${proseWords} words of prose (${((proseDashes / proseWords) * 1000).toFixed(1)} per 1,000)`, "Keep prose at 3 or fewer per 1,000 words. Use full stops.", null);

  // T44 triplets ("fast, reliable, and scalable"): three single words where at least two read as
  // adjectives or abstract nouns. Lists of real things (languages, platforms, materials) and proper nouns pass.
  {
    const trip = /(^|[^\p{L}])([\p{L}][\p{L}'’-]*), ([\p{L}][\p{L}'’-]*),? (and|&) ([\p{L}][\p{L}'’-]*)(?![\p{L}])/gu;
    const stop = /^(and|or|but|the|a|an|one|two|three|more|less|most|before|after|then|now|here|there|in|out|on|off|up|down|over|under|so|yes|no|it|this|that|all|some|any|each|other)$/i;
    const slopWord = /^(fast|quick|clean|modern|simple|bold|smart|sleek|minimal|beautiful|elegant|reliable|robust|scalable|secure|accessible|responsive|intuitive|performant|delightful|functional|thoughtful|playful|human|creative|strategic|easy|safe|lean|solid|honest|clear|calm|warm|timeless|polished|seamless|engaging|meaningful|memorable|innovative|efficient|effective|maintainable|design|development|strategy|code|craft|creativity|innovation|passion|quality|performance|scalability|accessibility|usability|simplicity|clarity|purpose|function|form|ideas|people|products|experiences|solutions|technology|art|science|empathy|curiosity|precision|detail|details|care|vision|impact|growth|trust)$/i;
    const adjShape = /(ive|ful|less|able|ible|ous|ical|ent|ant)$/i;
    const hits = new Set();
    for (const line of bodyLines)
      for (const m of line.matchAll(trip)) {
        const items = [m[2], m[3], m[5]];
        const atStart = m.index === 0 && m[1] === "";
        const proper = (w, k) => /\p{Lu}/u.test(k === 0 && atStart ? w.slice(1) : w);
        if (items.some(proper)) continue;
        if (items.some((w) => stop.test(w))) continue;
        if (items.filter((w) => slopWord.test(w) || adjShape.test(w)).length < 2) continue;
        hits.add(`${m[2]}, ${m[3]} ${m[4]} ${m[5]}`);
      }
    if (hits.size >= 3)
      add("T44", hits.size >= 5 ? "fail" : "warn", `${hits.size} "X, Y and Z" triplets`, "Adjectives and abstract nouns in threes are a generated-copy rhythm. Say the one thing that matters, with a fact.", [...hits].slice(0, 5));
  }

  // T12 centred hero with a primary + ghost button pair (strict: one filled, one outlined, siblings).
  if (hero) {
    const s = style(hero);
    const centred = s.textAlign === "center" && Math.abs(heroRect.x + heroRect.w / 2 - vw / 2) < vw * 0.05;
    const filled = (el) => rgba(style(el).backgroundColor)[3] > 0.5;
    const ghost = (el) => rgba(style(el).backgroundColor)[3] < 0.1 && px(style(el).borderTopWidth) + px(style(el).borderBottomWidth) > 0;
    const parents = new Set(
      visibleEls
        .filter((el) => {
          if (!el.matches("a[href],button")) return false;
          const r = docRect(el);
          return r.y > heroRect.bottom - 4 && r.y - heroRect.bottom < 260 && r.h >= 28;
        })
        .map((el) => el.parentElement),
    );
    let pair = null;
    for (const p of parents) {
      if (!p) continue;
      const kids = [...p.children].filter(visible);
      const btns = kids.filter((k) => k.matches("a[href],button"));
      if (btns.length < 2 || btns.length > 3 || kids.length > 3) continue;
      if (btns.some((b) => words(b.innerText).length > 4 || words(b.innerText).length === 0)) continue;
      if (btns.some(filled) && btns.some(ghost)) {
        pair = btns;
        break;
      }
    }
    if (centred && pair)
      add("T12", "fail", "Centred hero with a button pair", "Centred headline, grey subline and a filled + outlined button pair is the default landing template. Lead with the work; one action is enough.", pair.map(label));
    else if (centred && !phone && mode !== "read")
      add("T12b", "warn", "Centred hero headline", "A centred hero is the template default. Make sure the composition earns it.", [label(hero)]);
    else if (pair && !phone)
      add("T12c", "warn", "Filled + outlined button pair under the hero", "Check whether one plain link would do.", pair.map(label));
  }

  // T13 stat counter row.
  const numLead = /^[~≈]?\s*[\d.,]+(\s*[–→-]\s*[\d.,]+)?\s*(\+|%|×|x(?![a-z])|[km]\+?(?![a-z]))?/i;
  const statRows = [];
  for (const parent of new Set(visibleEls.map((el) => el.parentElement))) {
    if (!parent || parent.closest("[data-numbers]")) continue;
    const kids = [...parent.children].filter(visible);
    if (kids.length < 3 || kids.length > 6) continue;
    const ok = kids.filter((k) => {
      const t = (k.innerText || "").trim();
      if (!/^[~≈]?\s*[\d.,]+\s*(\+|%|k\+?|m\+?|x|×|yrs?|years?)?(\s|\n|$)/i.test(t) || t.length > 60) return false;
      return [...k.querySelectorAll("*"), k].some((n) => px(style(n).fontSize) >= bodySize * 1.6 && /\d/.test(ownText(n)));
    });
    if (ok.length >= 3) statRows.push({ parent, kids: ok });
  }
  if (statRows.length) {
    const verdicts = statRows.map(({ parent, kids }) => {
      const text = parent.innerText || "";
      const plus = /\d\s*[+%]/.test(text);
      const counting = kids.some((k) => [k, ...k.querySelectorAll("*")].some((n) => n.__pcCounting || n.matches("[data-count],[data-countup],[data-count-to],[data-target]") || /count(er|up)/i.test(typeof n.className === "string" ? n.className : "")));
      const labels = kids.map((k) => (k.innerText || "").trim().replace(numLead, "").replace(/\s+/g, " ").trim());
      const vanity = labels.some((l) => words(l).length <= 3 && /\b(years?|yrs|projects?|clients?|customers?|countries|awards?|happy)\b/i.test(l));
      const short = labels.filter((l) => l.length <= 24).length >= labels.length / 2;
      return { parent, sev: plus || counting || vanity ? "fail" : short ? "warn" : null, why: [plus && "+ or %", counting && "counting", vanity && "vanity labels"].filter(Boolean) };
    });
    const worst = verdicts.find((v) => v.sev === "fail") || verdicts.find((v) => v.sev === "warn");
    if (worst)
      add("T13", worst.sev, `Stat counter row${worst.why.length ? ` (${worst.why.join(", ")})` : ""}`, "A row of big numbers ('5+ years · 50+ projects') is the template trust bar. Put one real number inside the sentence it proves. A sourced row with full-sentence labels and no '+' is fine: mark it data-numbers.", verdicts.filter((v) => v.sev).slice(0, 2).map((v) => label(v.parent)));
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

  // T16 pulsing status dot (its own or its pseudo-elements' loops).
  const loopsOf = (el, own) =>
    el.getAnimations({ subtree: true }).filter((a) => a.effect && a.effect.getTiming().iterations === Infinity && (!own || a.effect.target === el));
  const dots = renderedEls.filter((el) => {
    const r = el.getBoundingClientRect();
    if (r.width > 16 || r.height > 16 || r.width < 4) return false;
    if (radius(el) < r.width / 2 - 1) return false;
    return loopsOf(el, false).length > 0;
  });
  if (dots.length) {
    const green = dots.some((d) => {
      const [h, s] = hsl(rgba(style(d).backgroundColor));
      return h > 90 && h < 170 && s > 0.3;
    });
    add("T16", green ? "fail" : "warn", "Pulsing status dot", "A blinking green 'available' dot is a template prop. Say it in words in the contact line.", dots.slice(0, 2).map(label));
  }

  // T17 logo/text marquee (the animated track itself, or its pseudo-element).
  const marquee = renderedEls.filter((el) =>
    loopsOf(el, true).some((a) => {
      const kf = a.effect.getKeyframes ? a.effect.getKeyframes() : [];
      return kf.some((k) => /translateX|translate3d\(\s*-?[\d.]+(%|px)/.test(String(k.transform || k.translate || "")));
    }) && el.querySelectorAll("img,svg,span,li,a").length >= 4,
  );
  if (marquee.length) {
    const logos = marquee.some((m) => m.querySelectorAll("img,svg").length >= 4);
    add("T17", logos ? "fail" : "warn", logos ? "Logo marquee" : "Text marquee", "An endless scrolling strip is decoration that never ends. Show the names once, still.", marquee.slice(0, 2).map(label));
  }

  // T18 default type (aliases resolved).
  const families = new Map();
  let totalChars = 0;
  for (const el of textEls) {
    const f = realFam(famOf(el));
    const n = ownText(el).length;
    totalChars += n;
    families.set(f, (families.get(f) || 0) + n);
  }
  const fams = [...families.entries()].sort((a, b) => b[1] - a[1]);
  const famsMain = fams.filter(([, n]) => n >= totalChars * 0.01);
  const heroFam = hero ? famOf(hero) : "";
  const bigFam = biggest ? famOf(biggest) : "";
  const displayEl = hero && (!biggest || sizeOf(biggest) <= sizeOf(hero) * 1.15) ? hero : biggest;
  const displayFam = displayEl === hero ? heroFam : bigFam;
  if (displayFam && isDefault(displayFam))
    add("T18", "fail", `The largest text is set in a default face (${famLabel(displayFam)})`, "Inter/Geist/system/Roboto/Poppins as the display voice reads as an unchosen default, also behind a renamed @font-face. Choose a display face for this person; the default may stay for small UI text. If the alias is honest, pass --fonts-ok \"Alias=Real\".", [label(displayEl)]);
  else if (displayFam && reflex.test(realFam(displayFam)))
    add("T18c", "warn", `Reflex display face (${famLabel(displayFam)})`, "A face generated sites reach for often. Keep it only with a written reason tied to the person or the work (allow T18c: <reason>).", [label(displayEl)]);
  if (famsMain.length > 3)
    add("T18b", "warn", `${famsMain.length} type families in use`, "More than three families rarely holds together. One family plus one mono or serif is enough.", famsMain.slice(0, 6).map(([f, n]) => `${f} (${n} chars)`));

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

  // T21 numbered section labels ("01 / About"): a separator after the number, short, in 3+ places outside one list.
  const numbered = textEls.filter((el) => {
    const t = ownText(el);
    return t.length <= 24 && /^[([]?\d{2}[)\]]?\s*[/—–·|]\s*\p{L}/u.test(t) && px(style(el).fontSize) <= 16;
  });
  const numberedGroups = new Set(numbered.map((el) => el.closest("ol,ul,nav,table,menu") || el));
  if (numbered.length >= 3 && numberedGroups.size >= 3)
    add("T21", "warn", `Numbered section labels (${numbered.length})`, "'01 / About' mono labels on every section are a template rhythm. Use them only where order matters.", numbered.slice(0, 4).map(label));
  const kickers = [...document.querySelectorAll("h2")].filter(visible).filter((h) => {
    const prev = h.previousElementSibling;
    if (!prev || !visible(prev)) return false;
    const s = style(prev);
    return px(s.fontSize) <= 14 && (s.textTransform === "uppercase" || px(s.letterSpacing) > 0.5) && (prev.innerText || "").length < 40;
  });
  if (kickers.length >= 3)
    add("T22", "warn", `Small uppercase kicker over ${kickers.length} section headings`, "An eyebrow over every heading is a template rhythm. Let the heading stand alone.", kickers.slice(0, 3).map(label));

  // T23 hover lift / scale, only on selectors that match 4+ elements (not buttons or labelled controls).
  const lifts = sheetRules.filter((r) => {
    if (!/:hover/.test(r.selectorText)) return false;
    const st = r.style;
    const t = `${st.transform} ${st.translate} ${st.getPropertyValue("--tw-translate-y")} ${st.scale}`;
    const moves = /translateY\(\s*-|translate3d\([^,]+,\s*-|translate:\s*[^ ]+\s+-|^\s*-|calc\(var\(--spacing\)\s*\*\s*-/.test(t) || /scale\(\s*1\.(0[4-9]|[1-9])/.test(t) || /^\s*1\.(0[4-9]|[1-9])/.test(st.scale || "");
    if (!moves) return false;
    return r.selectorText.split(/,(?![^(]*\))/).filter((s) => /:hover/.test(s)).some((s) => {
      const base = s.replace(/:(hover|active|focus-visible|focus-within|focus)\b/g, "").trim() || "*";
      if (/\bbutton\b|\[aria-label/i.test(base)) return false;
      let els = [];
      try {
        els = [...document.querySelectorAll(base)];
      } catch {
        return false;
      }
      return els.filter((e) => !e.matches("button,[aria-label]")).length >= 4;
    });
  });
  if (lifts.length)
    add("T23", "warn", `Hover lift or zoom (${lifts.length} rules)`, "Cards that jump up or zoom on hover are a template reflex. Reveal information on hover instead (a fact, a preview, the year).", lifts.slice(0, 4).map((r) => r.selectorText.slice(0, 80)));
  if (/--(mouse|cursor|pointer)-?(x|y)/i.test(sheetsText) && /radial-gradient/.test(sheetsText))
    add("T24", "warn", "Cursor spotlight", "A radial glow that follows the cursor is an effect library default.", null);
  if (style(document.body).cursor === "none" || style(document.documentElement).cursor === "none")
    add("T25", "warn", "Custom cursor replaces the system cursor", "Hiding the cursor costs precision and accessibility. Keep the system cursor.", null);

  // T26 sticky blurred nav with pill links; T26b sticky translucent nav with a filled CTA.
  const fixedChrome = visibleEls.filter((el) => ["fixed", "sticky"].includes(style(el).position) && el.querySelector("a,button") && el.getBoundingClientRect().top < 160);
  const navs = fixedChrome.filter((el) => /blur\(/.test(style(el).backdropFilter || "") && el.querySelector("a"));
  const pillNav = navs.filter((n) => radius(n) >= n.getBoundingClientRect().height / 2 - 2 || [...n.querySelectorAll("a")].some((a) => radius(a) >= a.getBoundingClientRect().height / 2 - 1 && hasBox(a)));
  if (pillNav.length) add("T26", "warn", "Floating blurred pill navigation", "The floating glass pill nav is the 2024 default. A plain text row is enough.", pillNav.slice(0, 1).map(label));
  const ctaNav = fixedChrome
    .filter((n) => !fixedChrome.some((o) => o !== n && o.contains(n)))
    .filter((n) => {
      const s = style(n);
      const bg = rgba(s.backgroundColor);
      const translucent = /blur\(/.test(s.backdropFilter || s.webkitBackdropFilter || "") || (bg[3] > 0.02 && bg[3] < 0.97);
      if (!translucent || n.querySelectorAll("a").length < 2) return false;
      const navBg = over(bg, effectiveBg(n.parentElement || document.body) || [255, 255, 255, 1]);
      return [...n.querySelectorAll("a,button")].some((a) => {
        if (!visible(a)) return false;
        const ab = rgba(style(a).backgroundColor);
        return ab[3] > 0.5 && ratio(over(ab, navBg), navBg) > 1.3 && words(a.innerText).length <= 4 && (radius(a) >= 4 || px(style(a).paddingLeft) >= 10);
      });
    });
  if (ctaNav.length)
    add("T26b", "warn", "Sticky see-through nav with a filled button", "A sticky blurred bar with a filled call-to-action (\"Download CV\", \"Hire me\") is the cookie-cutter navbar. Put the masthead in normal flow and the links as text.", ctaNav.slice(0, 1).map(label));

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
  const ghostCards = visibleEls.filter((el) => {
    const s = style(el);
    if (!s.boxShadow || s.boxShadow === "none") return false;
    const bw = px(s.borderTopWidth);
    if (bw < 0.5 || bw > 1.5) return false;
    const blurs = [...s.boxShadow.matchAll(/(-?[\d.]+)px\s+(-?[\d.]+)px\s+([\d.]+)px/g)].map((m) => +m[3]);
    return blurs.some((v) => v >= 16) && el.getBoundingClientRect().width * el.getBoundingClientRect().height > 4000;
  });
  if (ghostCards.length >= 2)
    add("T29", "warn", `Hairline border plus wide soft shadow on ${ghostCards.length} boxes`, "The 'ghost card' (1px border and a big blurred shadow) is a generated-UI default. Pick one, or neither.", ghostCards.slice(0, 3).map(label));

  // T30 middot chains; T31 aphoristic "Not X. Y." cadence.
  const chains = textEls.filter((el) => (ownText(el).match(/·/g) || []).length >= 3);
  if (chains.length)
    add("T30", "warn", `Middot chains in ${chains.length} line(s)`, "Long 'A · B · C · D' strings read as generated metadata. Keep one separator per line, or set the facts as a small table.", chains.slice(0, 3).map(label));
  const cadence = [...bodyText.matchAll(/\bNot ([^.!?]{1,40})\.\s+([^.!?]{1,40})\./g)]
    .filter((m) => words("Not " + m[1]).length <= 4 && words(m[2]).length <= 4 && !/\b(is|are|was|were|opens|works|runs|goes)\b/i.test(m[2]))
    .map((m) => m[0]);
  if (cadence.length >= 2)
    add("T31", "warn", `Aphoristic cadence (${cadence.length})`, "'Not a feature. A platform.' rebuttals are a generated-copy rhythm. Say the fact once.", cadence.slice(0, 3));

  // T32 effect-library components and animated conic borders.
  const libRe = /(border-beam|shine-border|moving-border|glowing-effect|background-beams|meteors|sparkles|aurora|animated-gradient-text|animated-shiny-text|hyper-text|text-generate|flickering-grid|warp-background|neon-gradient|magic-card|orbiting-circles|retro-grid|dot-pattern|grid-pattern|spotlight-card|lamp-effect)/i;
  const lib = renderedEls.filter((el) => typeof el.className === "string" && libRe.test(el.className));
  const conic = renderedEls.filter((el) => /conic-gradient/.test(style(el).backgroundImage) && el.getAnimations().length > 0);
  if (lib.length || conic.length)
    add("T32", "fail", "Effect-library decoration", "Beams, meteors, sparkles, aurora, spinning conic borders: library costumes seen on every launch page. Replace with one authored moment that reveals information.", [...lib, ...conic].slice(0, 4).map(label));

  // T33 scroll cue (text, or a small looping icon near the bottom of the first screen; pseudo-elements and svg included).
  const cueCands = [...renderedEls, ...[...document.querySelectorAll("svg")].filter((s) => !s.parentElement?.closest("svg"))];
  const cue = cueCands.filter((el) => {
    const r = el.getBoundingClientRect();
    if (r.top < vh * 0.7 || r.top > vh || r.width < 1) return false;
    if (/^\s*(scroll|scroll down|scroll to explore|scroll for more)\s*[↓⌄]?\s*$/i.test(el.innerText || el.textContent || "")) return true;
    if (r.width > 64 || r.height > 64 || r.width < 8) return false;
    const isIcon = el.nodeName.toLowerCase() === "svg" || el.querySelector("svg") || /^[↓⌄∨⬇︎v]$/i.test((el.innerText || "").trim());
    return !!isIcon && el.getAnimations({ subtree: true }).some((a) => a.effect && a.effect.getTiming().iterations === Infinity);
  });
  if (cue.length) add("T33", "warn", "Scroll cue", "A 'scroll' label or bouncing chevron tells the visitor nothing. Let the first screen end on content cut by the fold.", cue.slice(0, 2).map((el) => (el.nodeName.toLowerCase() === "svg" ? "svg" : label(el))));

  // T34 dark ground + one neon accent + glow; T35 pure black/white.
  const bodyBg = rgba(style(document.body).backgroundColor)[3] > 0.5 ? rgba(style(document.body).backgroundColor) : rgba(style(document.documentElement).backgroundColor);
  const groundL = oklch(bodyBg)[0];
  if (groundL < 0.2 && glow.length) add("T34", "fail", "Dark ground with neon glow", "Near-black, one neon accent and coloured glow is the 2024 'AI dark' recipe. Keep the dark ground if it has a reason; drop the glow and desaturate the accent.", glow.slice(0, 2).map(label));
  const bodyInk = rgba(style(document.body).color);
  const pure = (c, v) => c[0] === v && c[1] === v && c[2] === v;
  if ((pure(bodyBg, 0) && pure(bodyInk, 255)) || (pure(bodyBg, 255) && pure(bodyInk, 0)))
    add("T35", "warn", "Pure black and white", "#000 on #fff (or the reverse) looks synthetic. Tint paper and ink toward one hue (chroma 0.005–0.02).", null);

  // T36 card inside a card.
  const boxedBig = visibleEls.filter((el) => {
    const r = el.getBoundingClientRect();
    if (r.width * r.height < 10000 || el.matches("img,video,canvas,picture,figure img")) return false;
    const st = style(el);
    const bw = px(st.borderTopWidth);
    const shadow = st.boxShadow && st.boxShadow !== "none";
    const bg = rgba(st.backgroundColor);
    const parentBg = el.parentElement ? effectiveBg(el.parentElement) : null;
    const distinct = bg[3] > 0.04 && parentBg && ratio(over(bg, parentBg), parentBg) > 1.04;
    return radius(el) >= 8 && (bw > 0 || shadow || distinct);
  });
  const holdsScreen = (el) => {
    const r = el.getBoundingClientRect();
    return [...el.querySelectorAll("img,picture,video,canvas")].some((m) => {
      const q = m.getBoundingClientRect();
      return q.width * q.height >= r.width * r.height * 0.6;
    });
  };
  const nested = boxedBig.filter((el) => !holdsScreen(el) && boxedBig.some((o) => o !== el && o.contains(el)));
  if (nested.length)
    add("T36", nested.length >= 3 ? "fail" : "warn", `Card inside a card (${nested.length})`, "Boxes in boxes compensate for weak grouping. Keep one containment layer; group with space.", nested.slice(0, 3).map(label));

  // T37 italic accent word in another family inside a heading.
  const accentWords = [...document.querySelectorAll("h1 em, h1 i, h1 span, h2 em, h2 i, h2 span")].filter((e) => {
    if (!visible(e)) return false;
    const h = e.closest("h1,h2");
    return style(e).fontStyle === "italic" && style(e).fontFamily !== style(h).fontFamily && (e.innerText || "").split(/\s+/).length <= 3;
  });
  if (accentWords.length) add("T37", "warn", "Italic accent word in a second family", "One italic serif word inside a sans headline is the 2025 'cyber serif' tic. Use the same family's weight or italic, or none.", accentWords.slice(0, 2).map(label));

  // T38 tech-stack logo grid.
  const techRe = /^(react|next(\.js)?|vue|nuxt|angular|svelte|typescript|javascript|node(\.js)?|tailwind|css3?|html5?|docker|aws|figma|git(hub)?|python|laravel|php|mongodb|postgres(ql)?|mysql|redis|firebase|graphql|vite|webpack|sass|kubernetes|vercel)$/i;
  const techGrids = [...new Set(visibleEls.map((el) => el.parentElement))].filter((p) => {
    if (!p) return false;
    const icons = [...p.querySelectorAll("img,svg")].filter((i) => {
      const r = i.getBoundingClientRect();
      const nm = (i.getAttribute("alt") || i.getAttribute("aria-label") || i.getAttribute("title") || i.closest("[title]")?.getAttribute("title") || "").trim();
      return r.width <= 72 && r.width > 8 && techRe.test(nm);
    });
    return icons.length >= 6;
  });
  if (techGrids.length) add("T38", "fail", "Tech-stack logo grid", "A wall of framework logos says 'I followed tutorials'. Name the stack inside each project's facts.", techGrids.slice(0, 1).map(label));

  // T39 fake browser chrome (red/yellow/green dots).
  const dotsRows = [...new Set(renderedEls.map((el) => el.parentElement))].filter((p) => {
    if (!p) return false;
    const kids = [...p.children].filter((k) => {
      const r = k.getBoundingClientRect();
      return r.width >= 6 && r.width <= 16 && Math.abs(r.width - r.height) < 2 && radius(k) >= r.width / 2 - 1;
    });
    if (kids.length !== 3) return false;
    const hues = kids.map((k) => hsl(rgba(style(k).backgroundColor)));
    return hues.every(([, sat]) => sat > 0.4) && hues.some(([h]) => h < 20 || h > 340) && hues.some(([h]) => h > 35 && h < 65) && hues.some(([h]) => h > 90 && h < 160);
  });
  if (dotsRows.length) add("T39", "warn", "Traffic-light window dots", "Red/yellow/green dots are mockup chrome. If a frame is needed, draw it plain; the screen is the content.", dotsRows.slice(0, 2).map(label));

  // T40 big faded number watermark.
  const watermark = renderedEls.filter((el) => ownText(el).length > 0).filter((el) => /^0?\d{1,2}$/.test(ownText(el)) && px(style(el).fontSize) >= 96 && (opacityChain(el) <= 0.25 || rgba(style(el).color)[3] <= 0.2));
  if (watermark.length) add("T40", "warn", "Faded number watermark", "Giant pale section numbers are decoration.", watermark.slice(0, 2).map(label));

  // T41 empty full-height centred hero.
  if (hero) {
    const sec = hero.closest("section,header,main > div,#root > div") || hero.parentElement;
    const r = sec.getBoundingClientRect();
    const hasMedia = sec.querySelector("img,video,canvas,picture,svg[width]");
    if (r.height >= vh * 0.95 && style(hero).textAlign === "center" && !hasMedia && (sec.innerText || "").length < 220)
      add("T41", "warn", "Full-height hero with one centred sentence", "A screen of emptiness around one line. Let the content set the height and put work in it.", [label(sec)]);
  }

  // T42 same-rhythm sections.
  const sections = [...document.querySelectorAll("main > section, body > section, #root section")].filter(visible).filter((sct) => !sct.parentElement.closest("section"));
  let run = 1, worst = 1;
  for (let i = 1; i < sections.length; i++) {
    const a = style(sections[i - 1]), b = style(sections[i]);
    const same = Math.abs(px(a.paddingTop) - px(b.paddingTop)) <= 8 && Math.abs(px(a.paddingBottom) - px(b.paddingBottom)) <= 8 && Math.abs(sections[i - 1].getBoundingClientRect().width - sections[i].getBoundingClientRect().width) < 4;
    const h = sections[i].querySelector("h2,h3");
    const centred = h && style(h).textAlign === "center";
    run = same && centred ? run + 1 : 1;
    worst = Math.max(worst, run);
  }
  if (worst >= 4) add("T42", worst >= 5 ? "fail" : "warn", `${worst} sections in a row with the same rhythm`, "Same padding, same width, centred headings: the generated-page skeleton. Vary ground, width, rule or padding.", null);

  // ======================================================================
  // CRAFT FLOOR
  // ======================================================================

  // C01 real work in the first screen: images, iframes, background images and [data-work]; canvas/video only inside [data-work].
  const shown = (el) => {
    const r = el.getBoundingClientRect();
    const st = style(el);
    return r.width > 1 && r.height > 1 && st.visibility !== "hidden" && st.display !== "none" && opacityChain(el) > 0.05;
  };
  const vpArea = vw * vh;
  const firstArea = (el) => {
    const r = el.getBoundingClientRect();
    const w = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0));
    const h = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
    return w * h;
  };
  const workMarked = [...document.querySelectorAll("[data-work]")].filter(shown);
  const workOuter = workMarked.filter((w) => !workMarked.some((o) => o !== w && o.contains(w)));
  const mediaEls = visibleEls.filter((el) => !el.closest("[data-work]") && (el.matches("img,picture,iframe,[role=img]") || (style(el).backgroundImage.includes("url(") && el.getBoundingClientRect().width > 120)));
  const counted = [...mediaEls, ...workOuter].filter((el, i, arr) => arr.indexOf(el) === i);
  const countedOuter = counted.filter((el) => !counted.some((o) => o !== el && o.contains(el)));
  const firstMedia = countedOuter
    .map((el) => ({ el, area: firstArea(el) }))
    .filter((m) => m.area > 0 && !(m.el.matches("img") && m.el.getAttribute("alt") === "" && m.area < vpArea * 0.05));
  const canvasLike = [...document.querySelectorAll("canvas,video")].filter(shown).filter((el) => !el.closest("[data-work]") && firstArea(el) > 0);
  const cell = 8;
  const cols = Math.ceil(vw / cell), rows = Math.ceil(vh / cell);
  const unionShare = (els) => {
    const grid = new Uint8Array(cols * rows);
    let n = 0;
    for (const el of els) {
      const r = el.getBoundingClientRect();
      const x0 = Math.max(0, Math.floor(r.left / cell)), x1 = Math.min(cols, Math.ceil(r.right / cell));
      const y0 = Math.max(0, Math.floor(r.top / cell)), y1 = Math.min(rows, Math.ceil(r.bottom / cell));
      for (let y = y0; y < y1; y++)
        for (let x = x0; x < x1; x++) {
          const i = y * cols + x;
          if (!grid[i]) {
            grid[i] = 1;
            n++;
          }
        }
    }
    return n / (cols * rows);
  };
  const mediaShare = unionShare(firstMedia.map((m) => m.el));
  const mediaShareWithCanvas = unionShare([...firstMedia.map((m) => m.el), ...canvasLike]);
  const need = mode === "read" ? (phone ? 0.12 : 0.15) : phone ? 0.2 : 0.25;
  if (mediaShare < need)
    add("C01", "fail", `Work fills ${Math.floor(mediaShare * 100)}% of the first screen`, `At least ${need * 100}% of the first screen should be real work (a product screen, a live demo, a playable piece).${mediaShareWithCanvas > mediaShare + 0.02 ? ` A canvas or video outside [data-work] would add ${((mediaShareWithCanvas - mediaShare) * 100).toFixed(0)}% but does not count: mark it data-work="<product>" only if it shows the work, not the name or decoration.` : ""}`, [...firstMedia.slice(0, 3).map((m) => label(m.el)), ...canvasLike.slice(0, 2).map((el) => `${label(el)} (not counted)`)]);
  const workName = (el) => {
    const pick = (n) => n && ((n.getAttribute("alt") || "").trim() || (n.getAttribute("aria-label") || "").trim() || (n.getAttribute("data-work") || "").trim() || (n.getAttribute("title") || "").trim() || (n.getAttribute("aria-labelledby") && (document.getElementById(n.getAttribute("aria-labelledby"))?.innerText || "").trim()));
    return pick(el) || (el.matches("picture,[data-work]") && pick(el.querySelector("img[alt]:not([alt=''])"))) || "";
  };
  if (firstMedia.length && !firstMedia.some((m) => workName(m.el)))
    add("C01b", "fail", "First-screen work has no name", "Give the screen alt text that names the product and the view, or data-work=\"<product>\" on a live piece.", firstMedia.slice(0, 3).map((m) => label(m.el)));

  // C18 the claim is the largest text; T27 giant name.
  let c18El = null;
  if (biggest) {
    const bS = sizeOf(biggest), hS = hero ? sizeOf(hero) : 0;
    const inHero = hero && (biggest === hero || biggest.contains(hero) || (hero.contains(biggest) && bS <= hS * 1.15));
    if (hero && !inHero && bS > hS * 1.15 && (!hero.contains(biggest) || nameish(biggestText))) {
      const isName = hasOwner(biggestText) || (ownerN && isOwnerName(biggestText));
      add("C18", isName ? "fail" : "warn", isName ? "The name is the largest text, not the claim" : "The claim is not the largest text", `"${biggestText.replace(/\s+/g, " ").slice(0, 40)}" is set at ${Math.round(bS)}px, the h1 at ${Math.round(hS)}px. ${isName ? "The name is a label; the claim (what was built, for whom) is the biggest text." : "Make the claim (the h1) the largest text, or make this the h1 if it is the claim."}`, [label(biggest), label(hero)]);
      c18El = biggest;
    } else if ((inHero && nameish(heroText)) || (!hero && nameish(biggestText))) {
      const el = inHero ? hero : biggest;
      const nextBiggest = bigCands.filter((t) => t !== el && !el.contains(t) && !t.contains(el)).sort((a, b) => sizeOf(b) - sizeOf(a))[0];
      const ratioToNext = nextBiggest ? sizeOf(el) / sizeOf(nextBiggest) : Infinity;
      if (ratioToNext > 1.15) {
        add("C18", ownerN ? "fail" : "warn", "The name is the largest text, not the claim", `The ${inHero ? "h1" : "largest text"} is the name ("${(inHero ? heroText : biggestText).replace(/\s+/g, " ").slice(0, 40)}", ${Math.round(sizeOf(el))}px)${nextBiggest ? `; the next text is ${Math.round(sizeOf(nextBiggest))}px` : ""}. The name is a label; make the claim (what was built, for whom) the h1 and the largest text.`, [label(el)]);
        c18El = el;
      }
    }
  }
  const nameEl = hero && nameish(heroText) ? hero : biggest && nameish(biggestText) && (!hero || sizeOf(biggest) > sizeOf(hero)) ? biggest : null;
  if (nameEl) {
    const nameText = (nameEl.innerText || "").trim();
    const stop = /[^.]\.\s*$/.test(nameText) && sizeOf(nameEl) >= bodySize * 2;
    if (mediaShare < need)
      add("T27", "fail", "Giant name with no work beside it", `A huge name and a grey line is the most common portfolio template. Put the work next to a sentence that says what was built.${stop ? " The full stop after the name is part of the same skeleton." : ""}`, [label(nameEl)]);
    else if (stop || (nameEl !== c18El && sizeOf(nameEl) > (phone ? 56 : 120)))
      add("T27b", "warn", stop ? "The name is set as a sentence (\"Name.\")" : "The name is the biggest thing on the page", stop ? "A name with a full stop is the loop's giant-name skeleton. The name is a label; drop the stop and let the claim carry the weight." : "The name is a label, not the claim. Check that the claim or the work has more weight.", [label(nameEl)]);
  }

  // C02 first-screen copy load (outside the nav and the work).
  const firstCopy = firstText.filter((el) => !el.closest("nav,[role=navigation],[data-work]"));
  const firstWords = words(firstCopy.map(ownText).join(" ")).length;
  if (mode === "read") {
    if (firstWords > 170) add("C02", "warn", `${firstWords} words in the first screen`, "A case or about page's first screen holds the title, a summary under 60 words, the facts row and the screen.", null);
  } else if (firstWords > 90)
    add("C02", firstWords > 120 ? "fail" : "warn", `${firstWords} words in the first screen`, "Aim for about 60 words outside the nav (warn above 90, fail above 120): who, what, one proof, one action.", null);
  if (hero) {
    const hw = words(heroText).length;
    if (hw > 20) add("C02b", "warn", `Hero heading is ${hw} words`, "Keep the main line to 20 words or fewer (15 is the target).", [label(hero)]);
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

  // C05 targets, with the WCAG 2.5.8 spacing exception.
  const interactive = visibleEls.filter((el) => el.matches("a[href],button,input:not([type=hidden]),select,textarea,summary,[role=button],[role=tab],[role=switch],[tabindex]:not([tabindex='-1'])"));
  const targets = interactive.filter((el) => !(el.matches("a") && el.parentElement && /^(P|LI|SPAN|FIGCAPTION|DD|TD|SMALL)$/.test(el.parentElement.nodeName) && ownText(el.parentElement).length > 20));
  const tRects = targets.map((el) => el.getBoundingClientRect());
  const under = targets.map((el, i) => i).filter((i) => tRects[i].width < 24 || tRects[i].height < 24);
  const centre = (r) => [r.left + r.width / 2, r.top + r.height / 2];
  const crowded = [];
  const spaced = [];
  for (const i of under) {
    const [cx, cy] = centre(tRects[i]);
    const hits = targets.some((o, j) => {
      if (j === i || o.contains(targets[i]) || targets[i].contains(o)) return false;
      const r = tRects[j];
      const dx = Math.max(r.left - cx, 0, cx - r.right), dy = Math.max(r.top - cy, 0, cy - r.bottom);
      if (dx * dx + dy * dy < 144) return true;
      if (under.includes(j)) {
        const [ox, oy] = centre(r);
        return Math.hypot(ox - cx, oy - cy) < 24;
      }
      return false;
    });
    (hits ? crowded : spaced).push(targets[i]);
  }
  if (crowded.length) add("C05", "fail", `${crowded.length} target(s) under 24px and crowded`, "WCAG 2.2 asks for 24×24, or 24px of space around a smaller target. Pad the hit area or space the targets.", crowded.slice(0, 5).map(label));
  else if (spaced.length) add("C05", "warn", `${spaced.length} target(s) under 24px (spaced)`, "They pass WCAG 2.5.8's spacing exception, but a 24px hit area is kinder. Pad them.", spaced.slice(0, 5).map(label));
  const small = phone ? targets.filter((el, i) => !under.includes(i) && (tRects[i].width < 44 || tRects[i].height < 44)) : [];
  if (small.length) add("C05b", "warn", `${small.length} phone target(s) under 44px`, "Aim for 44×44 on touch. Extend the hit area with padding or a pseudo-element.", small.slice(0, 5).map(label));

  // C06 contrast on solid grounds; text over images and gradients is sampled later (C06b).
  const lowContrast = [];
  const sampleTargets = [];
  const textBox = (el) => {
    let box = null;
    for (const n of el.childNodes) {
      if (n.nodeType !== 3 || !n.textContent.trim()) continue;
      const rg = document.createRange();
      rg.selectNodeContents(n);
      const r = rg.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      box = box ? { l: Math.min(box.l, r.left), t: Math.min(box.t, r.top), r: Math.max(box.r, r.right), b: Math.max(box.b, r.bottom) } : { l: r.left, t: r.top, r: r.right, b: r.bottom };
    }
    return box;
  };
  for (const el of textEls) {
    if (el.closest("[aria-hidden=true]")) continue;
    const dr = docRect(el);
    if (dr.bottom <= 0 || dr.right <= 0 || dr.x >= document.documentElement.scrollWidth) continue;
    const s = style(el);
    const fg = rgba(s.color);
    const size = px(s.fontSize);
    const large = size >= 24 || (size >= 18.66 && +s.fontWeight >= 700);
    const bg = effectiveBg(el);
    if (!bg) {
      if (sampleTargets.length < 40 && ownText(el).length >= 2 && rgba(s.color)[3] > 0) {
        const b = textBox(el);
        if (b) {
          el.setAttribute("data-pc-sample", String(sampleTargets.length));
          const fixed = [el, ...ancestors(el)].some((n) => ["fixed", "sticky"].includes(style(n).position));
          sampleTargets.push({ i: sampleTargets.length, x: b.l + scrollX, y: b.t + scrollY, w: b.r - b.l, h: b.b - b.t, fixed, fg: [fg[0], fg[1], fg[2], fg[3] * opacityChain(el)], large, label: label(el) });
        }
      }
      continue;
    }
    const shownFg = over([fg[0], fg[1], fg[2], fg[3] * opacityChain(el)], bg);
    const need2 = large ? 3 : 4.5;
    const r = ratio(shownFg, bg);
    if (r < need2 - 0.05) lowContrast.push(`${label(el)} ${r.toFixed(2)}:1`);
  }
  if (lowContrast.length)
    add("C06", "fail", `${lowContrast.length} text element(s) below contrast`, "Body text needs 4.5:1, large text 3:1.", lowContrast.slice(0, 6));

  // C07 small text (labels exempt at 11–12px) and long lines.
  const monoRe = /mono|courier|menlo|consolas|monaco|jetbrains|fira code|sf mono|ui-monospace|monospace/i;
  const tinyText = textEls.filter((el) => {
    const s = style(el);
    const size = px(s.fontSize);
    const t = ownText(el);
    if (t.length <= 3 || size >= 12) return false;
    if (size < 11) return true;
    const caps = s.textTransform === "uppercase" || (t === t.toUpperCase() && /\p{Lu}/u.test(t));
    const tracked = px(s.letterSpacing) / size >= 0.039;
    return !(words(t).length <= 3 && ((caps && tracked) || monoRe.test(s.fontFamily)));
  });
  if (tinyText.length) add("C07", "warn", `${tinyText.length} text element(s) too small`, "Under 11px is hard to read, most of all on phones; 11–12px is for short caps or mono labels only.", tinyText.slice(0, 4).map((el) => `${label(el)} ${px(style(el).fontSize)}px`));
  const longLines = [...document.querySelectorAll("p")].filter(visible).filter((p) => {
    const s = style(p);
    return p.getBoundingClientRect().width / (px(s.fontSize) * 0.5) > 88 && (p.innerText || "").length > 160;
  });
  if (longLines.length) add("C07b", "warn", `${longLines.length} paragraph(s) wider than ~85 characters`, "Keep reading measure at 45–75 characters.", longLines.slice(0, 3).map(label));

  // C08 images.
  const imgs = [...document.images].filter(visible);
  const noAlt = imgs.filter((i) => !i.hasAttribute("alt"));
  if (noAlt.length) add("C08", "fail", `${noAlt.length} image(s) without alt`, "Name the screen in alt text, or alt=\"\" if decorative.", noAlt.slice(0, 4).map((i) => i.currentSrc.split("/").pop()));
  const upscaled = imgs.filter((i) => i.complete && i.naturalWidth && i.getBoundingClientRect().width > i.naturalWidth * 1.02);
  if (upscaled.length) add("C08b", "fail", `${upscaled.length} image(s) shown larger than their pixels`, "Soft screenshots kill the craft claim. Export at 2× the shown size.", upscaled.slice(0, 4).map((i) => `${i.currentSrc.split("/").pop()} ${Math.round(i.getBoundingClientRect().width)}px shown, ${i.naturalWidth}px file`));
  const notRetina = imgs.filter((i) => i.complete && i.naturalWidth && i.getBoundingClientRect().width * 2 > i.naturalWidth * 1.15 && i.getBoundingClientRect().width > 160 && !upscaled.includes(i));
  if (notRetina.length) add("C08c", "warn", `${notRetina.length} image(s) below 2× density`, "Phones and Retina screens will show them soft.", notRetina.slice(0, 4).map((i) => i.currentSrc.split("/").pop()));
  const noSize = imgs.filter((i) => !i.getAttribute("width") && !i.getAttribute("height") && style(i).aspectRatio === "auto");
  if (noSize.length) add("C08d", "warn", `${noSize.length} image(s) without width/height or aspect-ratio`, "Reserve the space to avoid layout shift.", noSize.slice(0, 4).map((i) => i.currentSrc.split("/").pop()));
  const broken = [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.getAttribute("src"));
  if (broken.length) add("C08e", "fail", `${broken.length} broken image(s)`, "", broken.slice(0, 4).map((i) => i.getAttribute("src")));

  // C09b heading levels (C09 is reported with the hero above).
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

  // T45 numbers that are not in the facts files.
  const unknownNumbers = [];
  if (factsText) {
    const numWords = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100, dozen: 12 };
    const extract = (text) => {
      const out = [];
      let t = ` ${text} `;
      t = t.replace(/\b((?:19|20)\d{2})-\d{2}-\d{2}\b/g, "$1");
      t = t.replace(/\b\d{1,2}:\d{2}(:\d{2})?\b/g, " ");
      t = t.replace(/(\d)[,  '’](?=\d{3}(\D|$))/g, "$1");
      t = t.replace(/\b((?:19|20)\d{2})\s*[–—-]\s*((?:19|20)\d{2}|\d{2})\b/g, (m, a, b) => {
        const A = +a;
        const B = b.length === 2 ? Math.floor(A / 100) * 100 + +b : +b;
        out.push({ v: String(A), raw: a, suffix: "" });
        if (B >= A && B - A < 60) out.push({ v: String(B), raw: String(B), suffix: "", range: [A, B], short: b.length === 2 ? String(+b) : null });
        return " ";
      });
      for (const m of t.matchAll(/(?<![\p{L}\p{N}.,])(\d+(?:\.\d+)?)(\s?(\+|%))?/gu)) out.push({ v: String(+m[1]), raw: m[1], suffix: m[3] || "" });
      return out;
    };
    const known = new Set();
    const ranges = [];
    for (const n of extract(factsText)) {
      known.add(n.v);
      if (n.range) ranges.push(n.range);
      if (n.short) known.add(n.short);
    }
    for (const m of factsText.toLowerCase().matchAll(/\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|dozen)\b/g)) known.add(String(numWords[m[1]]));
    const where = textEls.filter((el) => !el.closest("[data-work],code,pre,kbd,samp,script") && (el.closest("h1,h2,h3,h4,h5,h6,li,dt,dd,td,th,figcaption,[data-numbers]") || inFirst(el) || statRows.some((r) => r.parent.contains(el))));
    const seen = new Set();
    for (const el of where) {
      const own = ownText(el);
      // A small standalone number is a row index or a line number, not a claim.
      if (/^\d{1,2}$/.test(own) && sizeOf(el) <= bodySize * 1.25) continue;
      for (const n of extract(own)) {
        if (/^0\d/.test(n.raw)) continue;
        const digits = n.raw.replace(/\D/g, "").length;
        if (digits < 2 && !n.suffix) continue;
        const v = +n.v;
        if (Number.isInteger(v) && v >= 1990 && v <= 2030 && (known.has(n.v) || ranges.some(([a, b]) => v >= a && v <= b))) continue;
        if (known.has(n.v)) continue;
        const key = n.v + n.suffix;
        if (seen.has(key)) continue;
        seen.add(key);
        unknownNumbers.push(`${n.raw}${n.suffix} in ${label(el)}`);
      }
    }
    if (unknownNumbers.length)
      add("T45", "warn", `${unknownNumbers.length} number(s) not found in the facts`, "Every number traces to a source file. Check each one against the facts, or remove it.", unknownNumbers.slice(0, 8));
  }

  // ---- hidden-until-scrolled content ------------------------------------
  const hiddenBelow = visibleEls.length
    ? all.filter((el) => {
        const r = docRect(el);
        if (r.y < vh * 1.05 || r.w < 1 || r.h < 1) return false;
        const s = style(el);
        if (s.display === "none") return false;
        if (el.closest('[data-motion="story"]')) return false;
        return parseFloat(s.opacity) < 0.05 && (ownText(el).length > 0 || el.matches("img,video,canvas,figure,section,article,li"));
      })
    : [];
  const hiddenOuter = hiddenBelow.filter((el) => !hiddenBelow.some((o) => o !== el && o.contains(el)));
  const sectionOf = (el) => el.closest("section,article,main > *,[role=region]") || el.parentElement || el;
  const hiddenSections = [...new Set(hiddenOuter.map(sectionOf))];
  const figureCounts = new Map();
  for (const el of hiddenBelow) {
    const f = el.closest("figure,[data-work],ul,ol");
    if (f) figureCounts.set(f, (figureCounts.get(f) || 0) + 1);
  }
  const busyFigures = [...figureCounts.entries()].filter(([, n]) => n > 12);

  // ---- human-made signals (positive) ------------------------------------
  const signals = {};
  const largest = biggest || firstText.slice().sort((a, b) => sizeOf(b) - sizeOf(a))[0];
  const largestFam = largest ? famOf(largest) : "";
  signals.H01_displayFace = !!largest && sizeOf(largest) >= (phone ? 32 : 48) && !isDefault(largestFam);
  signals.H02_typeDecision = visibleEls.some((el) => {
    const st = style(el);
    return (st.fontStretch && st.fontStretch !== "100%" && st.fontStretch !== "normal") || (st.fontVariationSettings && st.fontVariationSettings !== "normal") || /tabular-nums|oldstyle-nums/.test(st.fontVariantNumeric) || /balance|pretty/.test(st.textWrap || st.textWrapStyle || "");
  });
  if (largest) {
    const r = largest.getBoundingClientRect();
    signals.H03_asymmetry = style(largest).textAlign !== "center" && Math.abs(r.left + r.width / 2 - vw / 2) >= vw * 0.1 * (phone ? 0.3 : 1);
  }
  signals.H04_workLarge = mediaShare >= (phone ? 0.2 : 0.25);
  signals.H09_themedSurfaces = /::selection/.test(sheetsText) && (/accent-color|scrollbar-color|caret-color/.test(sheetsText) || /:focus-visible/.test(sheetsText));
  signals.H11_nameSmall = !(nameEl && nameEl.getBoundingClientRect().height > vh * 0.12);
  const [, gC] = oklch(bodyBg);
  signals.H12_tintedGround = gC >= 0.004 && !pure(bodyBg, 0) && !pure(bodyBg, 255);
  const fontSrcs = fontFaces.map((r) => r.style.getPropertyValue("src"));
  signals.H15_selfHostedFonts = fontSrcs.length > 0 && fontSrcs.every((src) => !/https?:\/\/(?!127\.0\.0\.1|localhost)/.test(src) || src.includes(location.host));

  const pageAllow = {};
  for (const m of document.querySelectorAll('meta[name="portfolio-check"]')) {
    for (const part of (m.getAttribute("content") || "").split(";")) {
      const mm = /^\s*allow\s+([A-Z]\d+[a-z]?)\s*:\s*(.+)$/.exec(part);
      if (mm) pageAllow[mm[1]] = mm[2].trim();
    }
  }

  return {
    findings,
    signals,
    pageAllow,
    sampleTargets,
    facts: {
      title: document.title,
      owner: ownerName || null,
      hero: hero ? { text: heroText.replace(/\s+/g, " ").slice(0, 140), font: famLabel(heroFam), size: sizeOf(hero) } : null,
      largest: biggest ? { text: biggestText.replace(/\s+/g, " ").slice(0, 80), font: famLabel(bigFam), size: sizeOf(biggest) } : null,
      families: famsMain.slice(0, 6).map(([f]) => f),
      fontAliases: aliasMap,
      firstScreenWords: firstWords,
      firstScreenSizes: [...sizes].sort((a, b) => a - b),
      mediaShareFirstScreen: +mediaShare.toFixed(3),
      mediaShareWithCanvas: +mediaShareWithCanvas.toFixed(3),
      workItems: firstMedia.slice(0, 4).map((m) => `${label(m.el)} ${((m.area / vpArea) * 100).toFixed(0)}%`),
      pageHeight: document.documentElement.scrollHeight,
      hiddenBelowFold: hiddenOuter.length,
      hiddenSections: hiddenSections.length,
      hiddenSectionSample: hiddenSections.slice(0, 4).map(label),
      busyFigures: busyFigures.map(([f, n]) => `${label(f)} (${n})`),
      unknownNumbers,
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
    const r = target && target.getBoundingClientRect ? target.getBoundingClientRect() : null;
    out.push({
      kind: a.constructor.name,
      name: a.animationName || a.transitionProperty || a.id || "",
      target: target ? target.nodeName.toLowerCase() + (typeof target.className === "string" && target.className ? "." + target.className.trim().split(/\s+/)[0] : "") + (e.pseudoElement || "") : "",
      duration: typeof t.duration === "number" ? Math.round(t.duration) : t.duration,
      delay: Math.round(t.delay || 0),
      iterations: t.iterations,
      easing: [...easings].filter((x) => x && x !== "linear" || easings.size === 1).join(" | ") || "linear",
      props: [...props],
      layoutProps: [...props].filter((p) => layout.test(p)),
      scrollLinked,
      fromScaleZero: kf.length > 0 && /scale\(0(\)|,\s*0\))/.test(String(kf[0].transform || "") + String(kf[0].scale === "0" ? "scale(0)" : "")),
      state: a.playState,
      story: !!(target && target.closest && target.closest('[data-motion="story"]')),
      inFirst: !!r && scrollY < 4 && r.top < innerHeight && r.bottom > 0 && r.width > 0,
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

// Contrast helpers in Node, for the sampled pass.
const lumN = ([r, g, b]) => {
  const f = (v) => {
    v /= 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratioN = (a, b) => {
  const [x, y] = [lumN(a), lumN(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

// Text over an image or gradient: hide the glyphs, screenshot, and average what is behind the text box.
async function sampleContrast(page, decoder, targets, vh) {
  if (!targets.length) return [];
  const out = [];
  try {
    await page.evaluate(() => {
      window.__pcRestore = [];
      for (const el of document.querySelectorAll("[data-pc-sample]"))
        for (const n of [el, ...el.querySelectorAll("*")]) {
          window.__pcRestore.push([n, n.getAttribute("style")]);
          for (const p of ["color", "-webkit-text-fill-color", "text-decoration-color", "caret-color"]) n.style.setProperty(p, "transparent", "important");
          n.style.setProperty("text-shadow", "none", "important");
          n.style.setProperty("-webkit-text-stroke", "0", "important");
          n.style.setProperty("transition", "none", "important");
        }
    });
    const screens = [...new Set(targets.map((t) => (t.fixed ? 0 : Math.floor(t.y / vh))))].filter((s) => s <= 2).sort();
    for (const s of screens) {
      const y = await page.evaluate((top) => {
        scrollTo({ top, behavior: "instant" });
        return scrollY;
      }, s * vh);
      await page.waitForTimeout(160);
      const shot = await page.screenshot({ type: "png" });
      const group = targets.filter((t) => (t.fixed ? 0 : Math.floor(t.y / vh)) === s);
      const boxes = group.map((t) => ({ x: t.x, y: t.fixed ? t.y : t.y - y, w: t.w, h: t.h }));
      const avgs = await decoder.evaluate(
        async ({ b64, boxes, vw }) => {
          const img = new Image();
          img.src = "data:image/png;base64," + b64;
          await img.decode();
          const scale = img.naturalWidth / vw;
          const c = document.createElement("canvas");
          c.width = img.naturalWidth;
          c.height = img.naturalHeight;
          const g = c.getContext("2d", { willReadFrequently: true });
          g.drawImage(img, 0, 0);
          return boxes.map((b) => {
            const x = Math.max(0, Math.floor(b.x * scale)), y = Math.max(0, Math.floor(b.y * scale));
            const w = Math.min(c.width - x, Math.ceil(b.w * scale)), h = Math.min(c.height - y, Math.ceil(b.h * scale));
            if (w < 2 || h < 2) return null;
            const d = g.getImageData(x, y, w, h).data;
            const step = Math.max(1, Math.floor(Math.sqrt((w * h) / 4000))) * 4;
            let r = 0, gg = 0, bb = 0, n = 0;
            for (let i = 0; i < d.length; i += step) {
              r += d[i];
              gg += d[i + 1];
              bb += d[i + 2];
              n++;
            }
            return n ? [r / n, gg / n, bb / n] : null;
          });
        },
        { b64: shot.toString("base64"), boxes, vw: page.viewportSize().width },
      );
      group.forEach((t, k) => {
        const avg = avgs[k];
        if (!avg) return;
        const a = t.fg[3];
        const fg = [0, 1, 2].map((i) => t.fg[i] * a + avg[i] * (1 - a));
        out.push({ ...t, ratio: ratioN(fg, avg) });
      });
    }
  } catch (e) {
    out.push({ error: String(e.message || e) });
  } finally {
    await page
      .evaluate(() => {
        for (const [n, s] of window.__pcRestore || []) s === null ? n.removeAttribute("style") : n.setAttribute("style", s);
        for (const el of document.querySelectorAll("[data-pc-sample]")) el.removeAttribute("data-pc-sample");
        scrollTo({ top: 0, behavior: "instant" });
      })
      .catch(() => {});
  }
  return out;
}

// ---------------------------------------------------------------------------
async function run() {
  const browser = await chromium.launch({ executablePath, args: ["--disable-dev-shm-usage", "--enable-gpu-rasterization"] });
  const decoder = await browser.newPage();
  const report = { url, name, at: new Date().toISOString(), mode, scheme, owner: owner || null, facts: factsFiles, viewports: [] };

  for (const [width, height] of viewports) {
    const phone = width < 700;
    const tag = `${width}`;
    const vp = { size: `${width}x${height}`, phone, findings: [], motion: {}, metrics: {} };
    let allow = { ...cliAllow };
    const push = (f) => {
      if (allow[f.id] && f.severity !== "allowed") {
        f.severity = "allowed";
        f.detail = `Allowed: ${allow[f.id]}`;
      }
      vp.findings.push(f);
    };
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: phone ? 2 : 1,
      isMobile: phone,
      hasTouch: phone,
      reducedMotion: "no-preference",
      colorScheme: scheme,
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
    const motionEarly = await page.evaluate(MOTION).catch(() => []);
    const introFrames = await page.evaluate(FRAMES, 1500);
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    await page.evaluate(() => document.fonts && document.fonts.ready);
    const motionAtLoad = await page.evaluate(MOTION);
    // Headings that change by themselves (T43) and numbers that count up (T13).
    const sampleA = await page.evaluate(() => {
      const nums = [...document.body.querySelectorAll("*")].filter((el) => el.childElementCount <= 3 && /\d/.test(el.textContent || "") && (el.textContent || "").trim().length <= 30);
      window.__pcNums = nums;
      return { heads: [...document.querySelectorAll("h1,h2,h3")].slice(0, 12).map((h) => h.textContent.trim()), nums: nums.map((n) => n.textContent) };
    });
    await page.waitForTimeout(1200);
    const sampleB = await page.evaluate((prev) => {
      (window.__pcNums || []).forEach((n, i) => {
        if (n.textContent !== prev[i]) n.__pcCounting = true;
      });
      return { heads: [...document.querySelectorAll("h1,h2,h3")].slice(0, 12).map((h) => h.textContent.trim()) };
    }, sampleA.nums);
    const changed = sampleA.heads.filter((t, i) => sampleB.heads[i] !== undefined && sampleB.heads[i] !== t);
    await page.screenshot({ path: join(outDir, `${tag}.png`) });
    const det = await page.evaluate(DETECT, { phone, mode, owner, fontsOk, phrases, factsText });
    allow = { ...det.pageAllow, ...cliAllow };
    vp.allow = allow;
    if (changed.length) push({ id: "T43", severity: "fail", title: "Heading text changes by itself", detail: "A typewriter or rotating-words headline ('I'm a developer | designer | …'). Write one static sentence.", where: changed.slice(0, 2) });
    for (const f of det.findings) push(f);
    vp.facts = det.facts;
    vp.signals = det.signals;

    // C06b: contrast over images and gradients, sampled from the screenshot.
    const sampled = await sampleContrast(page, decoder, det.sampleTargets, height);
    const sampledOk = sampled.filter((s) => s.ratio);
    const sFail = sampledOk.filter((s) => !s.large && s.ratio < 3);
    const sWarn = sampledOk.filter((s) => !sFail.includes(s) && ((!s.large && s.ratio < 4.5) || (s.large && s.ratio < 3)));
    if (sFail.length || sWarn.length)
      push({ id: "C06b", severity: sFail.length ? "fail" : "warn", title: `${sFail.length + sWarn.length} text element(s) over an image or gradient below contrast (sampled)`, detail: "Measured against the average colour behind the text box, so approximate. Body text needs 4.5:1, large text 3:1. Add a solid or scrim ground behind the text, or move it.", where: [...sFail, ...sWarn].slice(0, 6).map((s) => `${s.label} ${s.ratio.toFixed(2)}:1 sampled${s.large ? " (large)" : ""}`) });
    vp.facts.sampledContrast = sampledOk.slice(0, 12).map((s) => `${s.label.slice(0, 50)} ${s.ratio.toFixed(2)}:1`);

    // T00: soft tells add up by weight. Allowed tells, info findings and single-instance weak tells do not count.
    const soft = new Map();
    for (const f of vp.findings) if (/^T\d/.test(f.id) && f.severity === "warn" && !soft.has(f.id)) soft.set(f.id, f);
    const parts = [];
    let score = 0;
    for (const [id, f] of soft) {
      let w = WEIGHT[id] ?? 1;
      // A weak tell seen once does not count (T23 lists rules, each already matching 4+ elements).
      if (w === 0.5 && id !== "T23" && Array.isArray(f.where) && f.where.length === 1) w = 0;
      if (w > 0) {
        score += w;
        parts.push(`${id} (${w})`);
      }
    }
    if (score >= 3)
      push({ id: "T00", severity: "fail", title: `Template warnings add up to ${score}`, detail: "Soft tells weigh 1 (strong) or 0.5 (weak); 3 fails the page. Clear them, or declare a deliberate one with allow <id>: <reason>.", where: parts });
    else if (score >= 2)
      push({ id: "T00", severity: "warn", title: `Template warnings add up to ${score}`, detail: "Soft tells weigh 1 (strong) or 0.5 (weak); 2 warns, 3 fails. Clear one more.", where: parts });

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
      push({ id: "C11", severity: "warn", title: `${noRing.length} of ${focus.length} focused controls show no outline or ring`, detail: "Check :focus-visible styles (a border or background change may also count).", where: noRing.map((f) => f.el) });
    await page.keyboard.press("Escape").catch(() => {});
    await page.evaluate(() => (document.activeElement && document.activeElement.blur && document.activeElement.blur()));

    // Scroll the page with the wheel, sampling frames and motion.
    const smooth = await page.evaluate(() => {
      const h = document.documentElement;
      return /lenis|locomotive|has-scroll-smooth|smooth-scroll/.test(h.className + " " + document.body.className) || !!document.querySelector("[data-lenis-prevent],[data-scroll-container]");
    });
    if (smooth) push({ id: "M05", severity: "warn", title: "Smooth-scroll library", detail: "Scroll hijacking changes the feel of the wheel and trackpad, fights reduced motion and costs frames. Native scroll is the default.", where: null });
    // A blank page in the same browser is measured during the same pass: when it cannot hold 60fps either,
    // the machine is busy and M10 does not fail.
    const wheelPass = async () => {
      const framesPromise = page.evaluate(FRAMES, 2600);
      const controlPromise = decoder.evaluate(FRAMES, 2600).catch(() => null);
      await page.mouse.move(Math.round(width / 2), Math.round(height / 2));
      for (let i = 0; i < 12; i++) {
        await page.mouse.wheel(0, Math.round(height * 0.45));
        await page.waitForTimeout(180);
      }
      const f = await framesPromise;
      const c = await controlPromise;
      return { ...f, controlP95: c ? c.p95 : null };
    };
    const before = await page.evaluate(() => scrollY);
    let scrollFrames = await wheelPass();
    const after = await page.evaluate(() => scrollY);
    const expected = Math.round(height * 0.45) * 12;
    const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    if (maxScroll >= height * 3 && after - before < Math.min(expected, maxScroll) * 0.6)
      push({ id: "M06", severity: "warn", title: `Wheel moved the page ${after - before}px of ${Math.min(expected, maxScroll)}px`, detail: "The page resists or slows native scrolling (pinning or a scroll hijack).", where: null });
    // rAF deltas come in vsync steps (16.7, 33.3, 50.0 …); snap near-steps so 50.1 reads as 3 frames, not "over 50".
    const vsync = 1000 / 60;
    const snap = (v) => (Math.abs(v - Math.round(v / vsync) * vsync) < 1.5 ? Math.round(v / vsync) * vsync : v);
    const [m10w, m10f] = throttle >= 4 ? [20, 33] : [33, 50];
    if (snap(scrollFrames.p95) > m10f) {
      // Confirm a fail with a second pass from the top (headless frame timing is noisy under load).
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      await page.waitForTimeout(300);
      const again = await wheelPass();
      if (again.p95 < scrollFrames.p95) scrollFrames = { ...again, firstPassP95: scrollFrames.p95 };
    }
    const busy = scrollFrames.controlP95 != null && scrollFrames.controlP95 > 20;
    if (snap(scrollFrames.p95) > m10w)
      push({ id: "M10", severity: snap(scrollFrames.p95) > m10f && !busy ? "fail" : "warn", title: `Scroll frames p95 ${scrollFrames.p95}ms`, detail: `Scrolling should hold 60fps: p95 under ${m10w}ms (fail above ${m10f}ms${throttle >= 4 ? " at 4× CPU" : ""}). Headless numbers are indicative; check on a real mid phone. Pause canvas work off screen, avoid layout in scroll handlers.${busy ? ` The machine was busy (a blank page ran at p95 ${scrollFrames.controlP95}ms), so this is not a fail; re-run alone to judge.` : ""}`, where: [`${scrollFrames.over25} of ${scrollFrames.frames} frames over 25ms, max ${scrollFrames.max}ms; blank-page control p95 ${scrollFrames.controlP95 ?? "n/a"}ms`] });
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
      push({ id: "M07", severity: "fail", title: `${stillHidden.length} element(s) still invisible in view after scrolling`, detail: "Content that waits for a reveal and never gets it. Content must be visible without the animation.", where: stillHidden.slice(0, 5) });
    const hs = det.facts.hiddenSections;
    if (hs >= 4)
      push({ id: "M08", severity: hs >= 6 ? "fail" : "warn", title: `${hs} sections start invisible below the fold`, detail: "Fade-up on every section is a template rhythm, and blank screenshots or slow devices show empty pages. One authored figure may build once; sections stay put.", where: det.facts.hiddenSectionSample });
    if (det.facts.busyFigures.length)
      push({ id: "M08b", severity: "warn", title: "One figure hides more than 12 parts until scrolled", detail: "A figure that builds from many hidden parts is slow to read and blank in screenshots. Build it in fewer steps, or show it whole.", where: det.facts.busyFigures.slice(0, 3) });

    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(400);
    await page.screenshot({ path: join(outDir, `${tag}-full.png`), fullPage: true }).catch(() => {});

    const pc = await page.evaluate(() => window.__pc);

    // Motion verdicts: sampled animations plus transition/animation events.
    const layoutRe = /^(width|height|top|left|right|bottom|inset|margin|padding|font-size|font-weight|letter-spacing|line-height|border-width|grid-template|flex-basis|max-height|max-width|min-height|min-width)/;
    const movingRe = /^(transform|translate|scale|rotate|opacity|clip-path|filter|offset)/;
    const events = (pc.events || []).map((e) => ({
      ...e,
      layoutProps: e.props.filter((p) => layoutRe.test(p)),
      scrollLinked: false,
      fromScaleZero: !!e.fromScaleZero,
      state: "finished",
      moving: e.kind === "CSSAnimation" || e.props.some((p) => movingRe.test(p) || layoutRe.test(p)),
    }));
    const anims = [...motionEarly, ...motionAtLoad, ...motionScrolled, ...events.filter((e) => e.moving)];
    const seen = new Map();
    for (const a of anims) seen.set(`${a.kind}|${a.name}|${a.target}|${a.props.join(",")}`, a);
    const uniq = [...seen.values()];
    const isLoop = (a) => a.iterations === Infinity || a.iterations === "Infinity" || a.iterations === null;
    const timed = uniq.filter((a) => !a.scrollLinked && typeof a.duration === "number");
    const loops = uniq.filter(isLoop);
    const slow = timed.filter((a) => !isLoop(a) && a.duration > 900);
    const layoutAnims = uniq.filter((a) => a.layoutProps.length);
    const linear = timed.filter((a) => !isLoop(a) && /^linear$/.test(a.easing) && a.props.some((p) => /transform|translate|opacity|scale/.test(p)) && a.duration > 120);
    const fromZero = uniq.filter((a) => a.fromScaleZero);
    const desc = (a) => `${a.target} ${a.name} ${a.duration}ms${a.story ? " (story)" : ""}`;
    if (fromZero.length)
      push({ id: "M04c", severity: "warn", title: `${fromZero.length} entrance(s) from scale(0)`, detail: "Nothing in the world appears from nothing. Start at scale(0.95–0.97) with opacity.", where: fromZero.slice(0, 3).map((a) => `${a.target} ${a.name}`) });
    const easeIn = timed.filter((a) => /ease-in($|[^-])|cubic-bezier\(0\.[4-9]\d*,\s*0(\.0)?,\s*1,\s*1\)/.test(a.easing) && !isLoop(a));
    if (loops.length > 1)
      push({ id: "M01", severity: loops.length > 3 ? "fail" : "warn", title: `${loops.length} endless animations`, detail: "Loops that never end pull the eye from the work and drain battery. Keep at most one, and make it carry information.", where: loops.slice(0, 5).map((a) => `${a.target} ${a.name} ${a.duration}ms`) });
    if (slow.length)
      push({ id: "M02", severity: slow.some((a) => a.duration > 1100 && !a.story) ? "fail" : "warn", title: `${slow.length} animation(s) longer than 900ms`, detail: "Interface motion lives at 120–400 ms; a page entrance at most ~800 ms; the one story animation (data-motion=\"story\") at most 1,100 ms. Long fades read as slow, not premium.", where: slow.slice(0, 5).map(desc) });
    if (layoutAnims.length)
      push({ id: "M03", severity: "warn", title: `${layoutAnims.length} animation(s) on layout properties`, detail: "Animating width/height/top/margin re-lays out every frame. Animate transform, opacity or clip-path.", where: layoutAnims.slice(0, 5).map((a) => `${a.target} ${a.layoutProps.join(",")}`) });
    const jsHits = Object.entries(pc.styleMutations || {}).filter(([, n]) => n > 30);
    if (jsHits.length)
      push({ id: "M03b", severity: "warn", title: "Script animates layout properties", detail: "Inline style churn on layout properties (likely a JS animation). Prefer transform.", where: jsHits.map(([p, n]) => `${p}: ${n} changes`) });
    if (linear.length)
      push({ id: "M04", severity: "warn", title: `${linear.length} movement(s) with linear easing`, detail: "Linear motion looks mechanical. Use a strong ease-out (e.g. cubic-bezier(0.23, 1, 0.32, 1)) or a spring.", where: linear.slice(0, 4).map((a) => `${a.target} ${a.name} ${a.duration}ms`) });
    if (easeIn.length)
      push({ id: "M04b", severity: "warn", title: `${easeIn.length} animation(s) with ease-in`, detail: "Ease-in starts slow and feels laggy on entrances. Use ease-out for things that appear.", where: easeIn.slice(0, 4).map((a) => `${a.target} ${a.name}`) });
    // M11: how many things move in the first screen at load.
    const loadMovers = new Set([
      ...[...motionEarly, ...motionAtLoad].filter((a) => a.inFirst && !a.scrollLinked).map((a) => a.target),
      ...events.filter((e) => e.moving && e.inFirst && e.t < 3500).map((e) => e.target),
    ]);
    if (loadMovers.size > 2)
      push({ id: "M11", severity: "warn", title: `${loadMovers.size} elements animate in the first screen at load`, detail: "At most two things move at once in the first screen; the eye follows one path, and the sequence ends on a still within a second.", where: [...loadMovers].slice(0, 5) });

    vp.motion = {
      atLoad: motionAtLoad.length,
      duringScroll: motionScrolled.length,
      events: (pc.events || []).length,
      scrollLinked: uniq.filter((a) => a.scrollLinked).length,
      loops: loops.length,
      firstScreenAtLoad: loadMovers.size,
      durations: [...new Set(timed.map((a) => a.duration))].sort((a, b) => a - b).slice(0, 12),
      easings: [...new Set(timed.map((a) => a.easing))].slice(0, 8),
      sample: uniq.slice(0, 14).map((a) => `${a.kind} ${a.target} ${a.name || a.props.join(",")} ${a.duration}ms ${a.easing}${isLoop(a) ? " ∞" : ""}`),
    };

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
    if (pc.cls > 0.1) push({ id: "C12", severity: "fail", title: `Layout shift ${pc.cls.toFixed(3)}`, detail: "Reserve space for images, fonts and late content.", where: pc.shifts.map((s) => `${s.value} at ${s.t}ms ${s.nodes.join(" ")}`) });
    else if (pc.cls > 0.02) push({ id: "C12", severity: "warn", title: `Layout shift ${pc.cls.toFixed(3)}`, detail: "Small shifts; aim for 0.", where: pc.shifts.map((s) => `${s.value} at ${s.t}ms ${s.nodes.join(" ")}`) });
    if (errors.length) push({ id: "C13", severity: "warn", title: `${errors.length} console error(s)`, detail: "", where: errors.slice(0, 3) });
    if (pc.lcp) {
      const t = pc.lcp.t;
      const sev = throttle > 1 ? (t > 2500 ? "fail" : t > 1000 ? "warn" : null) : t > 1500 ? "warn" : null;
      if (sev)
        push({ id: "C17", severity: sev, title: `Largest paint at ${t}ms${throttle > 1 ? ` (${throttle}× CPU)` : ""}`, detail: "The first readable frame should land within about a second on a mid phone. Preload the display face, load the first screen's image eagerly, and defer the hook.", where: [`${pc.lcp.node || "?"}`] });
    }
    await context.close();

    // Reduced motion pass.
    const rctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, isMobile: phone, hasTouch: phone, reducedMotion: "reduce", colorScheme: scheme });
    const rpage = await rctx.newPage();
    await rpage.addInitScript(INIT);
    await rpage.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await rpage.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    await rpage.waitForTimeout(2000);
    const rMotion = await rpage.evaluate(MOTION);
    const raf0 = await rpage.evaluate(() => (window.__pc ? window.__pc.raf : 0));
    await rpage.waitForTimeout(1000);
    const raf1 = await rpage.evaluate(() => (window.__pc ? window.__pc.raf : 0));
    const storyControl = await rpage.evaluate(() =>
      [...document.querySelectorAll('[data-motion="story"]')].some((el) => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        const ctl = "button,a[href],input,select,[role=button],[role=slider],[role=switch],[tabindex]";
        return r.width > 1 && r.height > 1 && s.visibility !== "hidden" && s.display !== "none" && (el.matches(ctl) || !!el.querySelector(ctl));
      }),
    );
    await rpage.screenshot({ path: join(outDir, `${tag}-reduced.png`) });
    const rLoops = rMotion.filter((a) => (a.iterations === Infinity || a.iterations === "Infinity") && a.state === "running" && a.props.some((p) => /transform|translate|scale|rotate|left|top/.test(p)));
    const rMoves = rMotion.filter((a) => a.state === "running" && typeof a.duration === "number" && a.duration > 250 && a.props.some((p) => /transform|translate|scale|rotate/.test(p)) && !a.scrollLinked);
    if (rLoops.length) push({ id: "M09", severity: "fail", title: `${rLoops.length} moving loop(s) still run with reduced motion`, detail: "prefers-reduced-motion must stop movement loops. Keep fades and colour changes if they carry meaning.", where: rLoops.slice(0, 4).map((a) => `${a.target} ${a.name}`) });
    else if (rMoves.length) push({ id: "M09b", severity: "warn", title: `${rMoves.length} movement(s) run with reduced motion`, detail: "Swap movement for an opacity change or an instant state.", where: rMoves.slice(0, 4).map((a) => `${a.target} ${a.name} ${a.duration}ms`) });
    const rafRate = raf1 - raf0;
    if (rafRate > 5 && !storyControl)
      push({ id: "M09c", severity: "fail", title: `A requestAnimationFrame loop runs with reduced motion (${rafRate} callbacks/s)`, detail: "A canvas or script loop keeps drawing after 2s of idle under prefers-reduced-motion. Draw one still frame and stop, or give the visitor a play control marked data-motion=\"story\".", where: null });
    vp.metrics.reducedMotionAnimations = rMotion.length;
    vp.metrics.reducedMotionRafPerSecond = rafRate;
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
    await sheet.setContent(`<style>body{margin:0;padding:24px;background:#e9e7e1;font:13px/1.3 ui-monospace,monospace;color:#222;display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start}figure{margin:0}img{display:block;height:520px;width:auto;outline:1px solid #0002}figcaption{margin-top:6px}h1{width:100%;margin:0;font:600 18px/1.2 system-ui}</style><h1>${name} — ${url}${scheme === "dark" ? " (dark)" : ""}</h1>${cells}`);
    await sheet.waitForLoadState("load");
    await sheet.screenshot({ path: join(outDir, "sheet.png"), fullPage: true });
    await sheet.close();
  } catch {}
  await browser.close();
  return report;
}

function toMarkdown(r) {
  const lines = [`# Portfolio check: ${r.name}`, "", `URL: ${r.url}  `, `Run: ${r.at} · mode ${r.mode} · scheme ${r.scheme}${r.owner ? ` · owner "${r.owner}"` : ""}${r.facts.length ? ` · facts ${r.facts.join(", ")}` : ""}`, ""];
  const allF = r.viewports.flatMap((v) => v.findings.map((f) => ({ ...f, vp: v.size })));
  const fails = allF.filter((f) => f.severity === "fail");
  const warns = allF.filter((f) => f.severity === "warn");
  const tells = allF.filter((f) => f.id.startsWith("T"));
  lines.push(`**Verdict:** ${fails.length ? "FAIL" : "PASS"} · ${fails.length} hard fail(s), ${warns.length} warning(s) · template tells: ${new Set(tells.filter((f) => f.severity === "fail").map((f) => f.id)).size} hard, ${new Set(tells.filter((f) => f.severity === "warn").map((f) => f.id)).size} soft`, "");
  for (const v of r.viewports) {
    lines.push(`## ${v.size}${v.phone ? " (phone)" : ""}`, "");
    const f = v.facts || {};
    lines.push(`- Hero (h1): ${f.hero ? `"${f.hero.text}" · ${f.hero.font} ${f.hero.size}px` : "none visible"} · largest text: ${f.largest ? `"${f.largest.text.slice(0, 50)}" ${f.largest.size}px` : "none"}`);
    lines.push(`- Work in first screen: ${Math.floor((f.mediaShareFirstScreen || 0) * 100)}% (with canvas/video outside data-work: ${Math.floor((f.mediaShareWithCanvas || 0) * 100)}%) · words: ${f.firstScreenWords} · sizes: ${(f.firstScreenSizes || []).join(", ")}`);
    if (f.workItems && f.workItems.length) lines.push(`- Work counted: ${f.workItems.join(" · ")}`);
    lines.push(`- Families: ${(f.families || []).join(", ")}${f.fontAliases && Object.keys(f.fontAliases).length ? ` · aliases ${Object.entries(f.fontAliases).map(([a, b]) => `${a}→${b}`).join(", ")}` : ""} · page height ${f.pageHeight}px`);
    lines.push(`- CLS ${v.metrics.cls} · LCP ${v.metrics.lcp ? v.metrics.lcp.t + "ms " + (v.metrics.lcp.node || "") : "n/a"} · long frames ${v.metrics.longFrames} (max ${v.metrics.longFrameMax}ms)`);
    lines.push(`- Frames (headless, indicative): intro p95 ${v.metrics.introFrames.p95}ms · scroll p95 ${v.metrics.scrollFrames.p95}ms, ${v.metrics.scrollFrames.over25} over 25ms (blank-page control ${v.metrics.scrollFrames.controlP95 ?? "n/a"}ms) · reduced-motion rAF ${v.metrics.reducedMotionRafPerSecond}/s`);
    if (f.sampledContrast && f.sampledContrast.length) lines.push(`- Sampled contrast (text over images/gradients): ${f.sampledContrast.slice(0, 4).join(" · ")}`);
    if (v.signals) {
      const sg = Object.entries(v.signals);
      lines.push(`- Human-made signals ${sg.filter(([, x]) => x).length}/${sg.length}: ${sg.map(([k, x]) => `${x ? "✓" : "·"} ${k.replace(/^H\d+_/, "")}`).join("  ")}`);
    }
    lines.push(`- Motion: ${v.motion.atLoad} at load (${v.motion.firstScreenAtLoad} in the first screen), ${v.motion.duringScroll} during scroll, ${v.motion.events} transition/animation events, ${v.motion.scrollLinked} scroll-linked, ${v.motion.loops} loops · durations ${v.motion.durations.join("/")}ms · easings ${v.motion.easings.join(" ; ")}`);
    lines.push("");
    const order = { fail: 0, warn: 1, info: 2, allowed: 3 };
    const sorted = v.findings.slice().sort((a, b) => order[a.severity] - order[b.severity] || a.id.localeCompare(b.id));
    if (!sorted.length) lines.push("No findings.", "");
    else {
      lines.push("| | Id | Finding | Fix | Where |", "|---|---|---|---|---|");
      for (const x of sorted)
        lines.push(`| ${x.severity === "fail" ? "✗" : x.severity === "allowed" ? "○" : x.severity === "info" ? "·" : "△"} | ${x.id} | ${x.title} | ${(x.detail || "").replace(/\|/g, "/")} | ${(x.where || []).join("<br>").replace(/\|/g, "/").slice(0, 400)} |`);
      lines.push("");
    }
  }
  lines.push("Screenshots: `<width>.png` (first screen), `<width>-full.png`, `<width>-reduced.png`, and `<width>-t<ms>.png` when --frames is set. Ids: `reference/checks.md` (`node scripts/check.mjs --list`).", "");
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
