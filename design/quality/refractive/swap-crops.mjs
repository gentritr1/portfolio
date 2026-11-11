// Swapping slabs (Bayyinah TV, Read to Feed): every screen, picked with a real pointer click on its thumbnail, must show
// the app, not the store listing around it. For each screen at 1440, 770 and 390 it samples the top 8% of the slab's
// rendered screen and fails when the dominant colour is one of the store banners' (reading-1 blue, reading-3 yellow,
// reading-4 purple, read from the files' corners). It also fails when the slab's box moves or resizes between screens.
// node swap-crops.mjs <url> [--shots <dir>]   → one line per screen; exit 1 on any hit.
// Tolerance: dominant = the most common colour after quantising to 16 levels per channel; a hit is a dominant colour
// within 24 (RGB distance) of a banner. Set between the two controls, 2026-11-11: the live site (positive control) puts
// reading-4 at distance 6 from the purple at 1440, 770 and 390 (its reading-1 blue edge is a thin strip, under the mode);
// the fixed build, run twice (null), never comes nearer than 63 to any banner (the orange badge card vs the yellow).
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const url = process.argv[2]
const shots = process.argv.includes('--shots') ? process.argv[process.argv.indexOf('--shots') + 1] : null
if (shots) mkdirSync(shots, { recursive: true })
const BANNERS = { 'reading-1 blue': [80, 175, 220], 'reading-3 yellow': [249, 205, 69], 'reading-4 purple': [194, 137, 249] }
const TOL = 24
const failed = []
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
const ctx = await browser.newContext({ reducedMotion: 'reduce' })
for (const [w, h] of [[1440, 900], [770, 900], [390, 844]]) {
  const page = await ctx.newPage()
  await page.setViewportSize({ width: w, height: h })
  await page.goto(url, { waitUntil: 'networkidle' })
  for (const id of ['work-bayyinah', 'work-reading']) {
    const n = await page.locator(`#${id} .re-sw-thumbs button`).count()
    const rects = []
    for (let i = 0; i < n; i++) {
      const btn = page.locator(`#${id} .re-sw-thumbs button`).nth(i)
      await btn.scrollIntoViewIfNeeded()
      await page.evaluate(() => scrollBy(0, 0))
      const box = await btn.boundingBox()
      const cx = box.x + box.width / 2, cy = box.y + box.height / 2
      // A real click lands where a visitor's would: check what is under the point first.
      const hit = await page.evaluate(([id, i, x, y]) => document.querySelectorAll(`#${id} .re-sw-thumbs button`)[i].contains(document.elementFromPoint(x, y)), [id, i, cx, cy])
      if (!hit) { failed.push(`${w} ${id} ${i + 1}: thumbnail covered at its centre`); continue }
      await page.mouse.click(cx, cy)
      await page.mouse.move(2, 2)
      const lead = page.locator(`#${id} .re-sw-lead`)
      await lead.evaluate((el) => el.scrollIntoView({ block: 'center' }))
      await page.waitForFunction((id) => { const im = document.querySelector(`#${id} .re-sw-lead .re-sw-screen img[data-on]`); return im && im.complete && im.naturalWidth > 0 && getComputedStyle(im).opacity === '1' }, id, { timeout: 8000 }).catch(() => {})
      await page.waitForTimeout(250)
      const src = await page.evaluate((id) => document.querySelector(`#${id} .re-sw-lead .re-sw-screen img[data-on]`)?.getAttribute('src'), id)
      const r = await lead.evaluate((el) => { const r = el.getBoundingClientRect(), s = el.querySelector('.re-sw-screen').getBoundingClientRect(); return { slab: [r.left, r.top + scrollY, r.width, r.height].map(Math.round), screen: { x: s.left, y: s.top, width: s.width, height: s.height } } })
      rects.push(r.slab.join(','))
      const clip = { ...r.screen, height: Math.max(2, r.screen.height * 0.08) }
      const png = await page.screenshot({ clip })
      const dom = await page.evaluate(async (b64) => {
        const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode()
        const c = new OffscreenCanvas(img.width, img.height), x = c.getContext('2d'); x.drawImage(img, 0, 0)
        const d = x.getImageData(0, 0, img.width, img.height).data, m = new Map()
        for (let k = 0; k < d.length; k += 4) { const key = [d[k], d[k + 1], d[k + 2]].map((v) => (v >> 4) * 16 + 8).join(','); m.set(key, (m.get(key) || 0) + 1) }
        return [...m.entries()].sort((a, b) => b[1] - a[1])[0][0].split(',').map(Number)
      }, png.toString('base64'))
      const near = Object.entries(BANNERS).map(([k, c]) => [k, Math.round(Math.hypot(...c.map((v, j) => v - dom[j])))]).sort((a, b) => a[1] - b[1])[0]
      const bad = near[1] <= TOL
      if (bad) failed.push(`${w} ${id} ${i + 1} (${src}): top of the screen is the ${near[0]} store banner (distance ${near[1]})`)
      console.log(`${w} ${id} ${i + 1} ${src} dominant rgb(${dom}) nearest ${near[0]} ${near[1]} slab [${r.slab}]${bad ? ' BANNER' : ''}`)
      if (shots) await page.screenshot({ path: `${shots}/${id}-${w}-${i + 1}.png` })
    }
    if (new Set(rects).size > 1) failed.push(`${w} ${id}: the slab moved or resized between screens (${[...new Set(rects)].join(' | ')})`)
  }
  await page.close()
}
await browser.close()
console.log(failed.length ? `FAIL\n${failed.join('\n')}` : 'PASS')
process.exit(failed.length ? 1 : 0)
