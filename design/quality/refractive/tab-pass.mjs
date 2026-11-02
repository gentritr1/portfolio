// Tab-only pass through the home page: every stop's name, box and focus ring, from the first Tab to the contact links.
// node tab-pass.mjs <url> [width] → one line per stop; exit 1 if focus is lost (body), lands off screen or shows no ring.
import { chromium } from 'playwright-core'

const url = process.argv[2]
const width = +(process.argv[3] ?? 1440)
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
const page = await browser.newPage({ viewport: { width, height: width < 600 ? 844 : 900 } })
await page.goto(url, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
const bad = []
let lastSection = ''
for (let i = 1; i <= 160; i++) {
  await page.keyboard.press('Tab')
  const s = await page.evaluate(() => {
    const el = document.activeElement
    if (!el || el === document.body) return { lost: true }
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el)
    // A ring is the element's outline or one drawn by an ancestor rule on :has(:focus-visible) (the layer rail does that).
    const ring = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) ||
      [...document.querySelectorAll(':has(> :focus-visible), :has(:focus-visible)')].some((a) => a !== document.documentElement && a !== document.body && getComputedStyle(a).outlineStyle !== 'none' && parseFloat(getComputedStyle(a).outlineWidth) > 0)
    const section = el.closest('section, header, nav, footer, details')
    return {
      name: (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60),
      tag: el.tagName.toLowerCase(), section: section ? (section.id || section.className.split(' ')[0]) : '',
      top: Math.round(r.top), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height),
      onScreen: r.bottom > 0 && r.top < innerHeight && r.width > 0 && r.height > 0, ring, contact: !!el.closest('#re-contact'),
    }
  })
  if (s.lost) { bad.push(`${i}: focus lost to <body>`); console.log(i, 'LOST'); continue }
  const flags = [!s.onScreen && 'OFF-SCREEN', !s.ring && 'NO-RING'].filter(Boolean)
  if (flags.length) bad.push(`${i}: ${s.tag} "${s.name}" ${flags.join(' ')}`)
  if (s.section !== lastSection) { console.log(`-- ${s.section}`); lastSection = s.section }
  console.log(String(i).padStart(3), s.tag, JSON.stringify(s.name), `${s.w}×${s.h} @${s.left},${s.top}`, flags.join(' '))
  if (s.contact) break
}
await browser.close()
console.log(bad.length ? `FAIL\n${bad.join('\n')}` : 'PASS')
process.exit(bad.length ? 1 : 0)
