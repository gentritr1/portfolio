// Type, spacing and repetition census of a page's own text (product screens excluded: anything inside <figure>).
// node census.mjs <url> [--assert]   → JSON per width; with --assert, exit 1 when a target in TARGETS is missed.
import { chromium } from 'playwright-core';

const url = process.argv[2];
const assert = process.argv.includes('--assert');
const WIDTHS = [[1440, 900], [1024, 768], [390, 844]];
const TARGETS = { sizes: 5, closeSteps: 0, negTracking: 0, under16: 0, swHeadSizes: 1, offScaleSections: 0, repeatedLinks: 3, repeatedLines: 2, h1NotLargest: 0 };
const SCALE = [0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128];

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const out = {}; let failed = [];
for (const [w, h] of WIDTHS) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  out[w] = await page.evaluate((SCALE) => {
    const own = el => !el.closest('figure, [aria-hidden="true"]');
    // 2 px floor drops visually hidden screen-reader text (1×1 clip boxes).
    const visible = el => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 2 && r.height > 2 && s.visibility !== 'hidden'; };
    const hasText = el => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    const allText = [...document.querySelectorAll('body *')].filter(el => !el.closest('[aria-hidden="true"]') && visible(el) && hasText(el));
    const textEls = allText.filter(own);
    const px = el => parseFloat(getComputedStyle(el).fontSize);
    const sizes = [...new Set(textEls.map(el => Math.round(px(el) * 10) / 10))].sort((a, b) => a - b);
    const negTracking = textEls.filter(el => parseFloat(getComputedStyle(el).letterSpacing) < 0).map(el => `${el.tagName.toLowerCase()}.${el.className}`.slice(0, 60));
    const under16 = textEls.filter(el => px(el) < 16);
    const swHeadSizes = [...new Set([...document.querySelectorAll('.re-sw h3')].map(el => Math.round(px(el) * 10) / 10))];
    const h1 = document.querySelector('h1'); const largest = Math.max(...[...document.querySelectorAll('h2, h3')].filter(own).map(px));
    const sections = [...document.querySelectorAll('main > section, main > nav, main > header, main > footer, footer, .re-intro')].filter(own).map(el => {
      const s = getComputedStyle(el); return { el: el.className.split(' ')[0] || el.tagName, top: Math.round(parseFloat(s.paddingTop)), bottom: Math.round(parseFloat(s.paddingBottom)) };
    });
    const offScaleSections = sections.filter(s => !SCALE.includes(s.top) || !SCALE.includes(s.bottom));
    const count = arr => arr.reduce((m, t) => (m[t] = (m[t] || 0) + 1, m), {});
    const label = el => [...el.childNodes].filter(n => n.nodeType === 3 || visible(n)).map(n => n.textContent).join('').trim();
    const links = count([...document.querySelectorAll('a, button')].filter(el => own(el) && visible(el)).map(label).filter(Boolean));
    // Captions inside figures count here: a repeated caption is repeated copy.
    const lines = count(allText.map(el => [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim()).filter(t => t.length > 24));
    const rep = (m, n) => Object.fromEntries(Object.entries(m).filter(([, c]) => c >= n));
    return {
      sizes, negTracking, under16: under16.length,
      under16Classes: Object.keys(count(under16.map(el => el.className.split(' ')[0] || el.tagName))).slice(0, 30),
      swHeadSizes, h1: px(h1), largestBelow: largest, h1NotLargest: px(h1) < largest ? 1 : 0,
      sections, offScaleSections: offScaleSections.length,
      repeatedLinks: rep(links, 3), repeatedLines: rep(lines, 2), pageHeight: document.documentElement.scrollHeight,
    };
  }, SCALE);
  const r = out[w];
  // Adjacent sizes at least 1.25× apart; 0.01 absorbs sub-pixel rounding.
  const closeSteps = r.sizes.slice(1).filter((s, i) => s / r.sizes[i] < 1.24).length;
  const got = { sizes: r.sizes.length, closeSteps, negTracking: r.negTracking.length, under16: r.under16, swHeadSizes: r.swHeadSizes.length, offScaleSections: r.offScaleSections, repeatedLinks: Math.max(0, ...Object.values(r.repeatedLinks)), repeatedLines: Math.max(0, ...Object.values(r.repeatedLines)), h1NotLargest: r.h1NotLargest };
  for (const [k, max] of Object.entries(TARGETS)) if (got[k] > max) failed.push(`${w}: ${k} ${got[k]} > ${max}`);
  await page.close();
}
await browser.close();
console.log(JSON.stringify(out, null, 1));
if (assert) { console.log(failed.length ? `FAIL\n${failed.join('\n')}` : 'PASS'); process.exit(failed.length ? 1 : 0); }
