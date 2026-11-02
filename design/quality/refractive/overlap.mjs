// Selected work on the wide frame: placed word blocks (.re-sw-at) of one chapter that overlap each other.
// node overlap.mjs <url> [widths…] → one line per width; exit 1 on any overlap. Default widths cover the scaled frame.
import { chromium } from 'playwright-core'
const url = process.argv[2]
const widths = process.argv.length > 3 ? process.argv.slice(3).map(Number) : [1024, 1060, 1101, 1140, 1180, 1220, 1260, 1280, 1320, 1360, 1440, 1600, 1920]
let failed = 0
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(url, { waitUntil: 'networkidle' })
for (const w of widths) {
  await page.setViewportSize({ width: w, height: 900 })
  await page.waitForTimeout(150)
  const hits = await page.evaluate(() => {
    const out = []
    for (const ch of document.querySelectorAll('.re-sw')) {
      // Text boxes: each child line of a placed block (its own box, not the scrim).
      const blocks = [...ch.querySelectorAll('.re-sw-at')].filter((b) => getComputedStyle(b).display !== 'none')
      const rects = blocks.map((b) => { const kids = [...b.querySelectorAll('h3, p, li, a, button')]; const rs = kids.map((k) => k.getBoundingClientRect()).filter((r) => r.width && r.height); return { b, top: Math.min(...rs.map((r) => r.top)), bottom: Math.max(...rs.map((r) => r.bottom)), left: Math.min(...rs.map((r) => r.left)), right: Math.max(...rs.map((r) => r.right)) } })
      for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
        const a = rects[i], b = rects[j]
        const ov = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top), oh = Math.min(a.right, b.right) - Math.max(a.left, b.left)
        if (ov > 0 && oh > 0) out.push(`${ch.id}: ${a.b.className.split(' ').at(-1)} × ${b.b.className.split(' ').at(-1)} ${Math.round(ov)}px`)
      }
    }
    return out
  })
  if (hits.length) failed++
  console.log(w, hits.length ? hits.join(' | ') : 'clear')
}
await browser.close()
console.log(failed ? 'FAIL' : 'PASS')
process.exit(failed ? 1 : 0)
