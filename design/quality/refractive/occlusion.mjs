// Selected work on the wide frame: text in a placed block (.re-sw-at) that something else paints over. overlap.mjs compares
// text boxes and cannot see a scrim; this hides each element that overlaps a block, one at a time, and fails when a text
// word's 99th-percentile brightness rises by 15 or more (2026-11-02: the care link block's scrim dimmed two step labels).
// node occlusion.mjs <url> [widths…] → one line per width; exit 1 on any hit. Default: 1024–1200 by 20, 1280, 1440.
import { chromium } from 'playwright-core'
const url = process.argv[2]
const widths = process.argv.length > 3 ? process.argv.slice(3).map(Number) : [1024, 1044, 1064, 1084, 1104, 1124, 1144, 1164, 1184, 1200, 1280, 1440]
const RISE = 15
let failed = 0
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
await page.emulateMedia({ reducedMotion: 'reduce' })
await page.goto(url, { waitUntil: 'networkidle' })

// p99 luminance of each text line, from one screenshot of the chapter.
const lines = async (clip) => {
  const b64 = (await page.screenshot({ clip })).toString('base64')
  return page.evaluate(async ([b64, clip]) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode()
    const c = new OffscreenCanvas(img.width, img.height), x = c.getContext('2d'); x.drawImage(img, 0, 0)
    const k = img.width / clip.width, d = x.getImageData(0, 0, img.width, img.height).data
    return [...document.querySelectorAll('[data-occ-line]')].map((el) => {
      const r = JSON.parse(el.dataset.occLine), v = []
      for (let y = Math.max(0, Math.floor((r.top - clip.y) * k)); y < Math.min(img.height, (r.bottom - clip.y) * k); y++)
        for (let xx = Math.max(0, Math.floor((r.left - clip.x) * k)); xx < Math.min(img.width, (r.right - clip.x) * k); xx++) {
          const i = (y * img.width + xx) * 4; v.push(0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2])
        }
      v.sort((a, b) => a - b)
      return v.length ? v[Math.floor(v.length * 0.99)] : 0
    })
  }, [b64, clip])
}

for (const w of widths) {
  await page.setViewportSize({ width: w, height: 1000 })
  const hits = []
  let noise = 0
  for (const id of await page.$$eval('.re-sw[id]', (els) => els.map((e) => e.id))) {
    await page.evaluate((id) => document.getElementById(id).scrollIntoView({ block: 'start' }), id)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(150)
    // Mark text lines (one Range per text node) and the topmost elements that overlap a block without containing it.
    const info = await page.evaluate((id) => {
      document.querySelectorAll('[data-occ-line]').forEach((e) => e.remove())
      document.querySelectorAll('[data-occ]').forEach((e) => delete e.dataset.occ)
      const ch = document.getElementById(id), cr = ch.getBoundingClientRect()
      const blocks = [...ch.querySelectorAll('.re-sw-at')].filter((b) => b.checkVisibility() && getComputedStyle(b).position === 'absolute')
      const hit = (a, b) => a.right > b.left && a.left < b.right && a.bottom > b.top && a.top < b.bottom
      let n = 0
      const lineText = []
      for (const b of blocks) {
        const walk = document.createTreeWalker(b, NodeFilter.SHOW_TEXT)
        for (let t; (t = walk.nextNode());) {
          const pr = t.parentElement.getBoundingClientRect()
          // Skip screen-reader-only text: it lives in a clipped 1 px box and paints nothing.
          if (!t.data.trim() || !t.parentElement.checkVisibility() || pr.width < 2 || pr.height < 2) continue
          // One box per word: a scrim over half a label leaves the other half bright, and a whole-line p99 reads that.
          for (const m of t.data.matchAll(/\S+/g)) {
            const range = document.createRange(); range.setStart(t, m.index); range.setEnd(t, m.index + m[0].length)
            const r = range.getBoundingClientRect()
            if (!r.width || !r.height) continue
            const holder = document.createElement('span'); holder.hidden = true
            holder.dataset.occLine = JSON.stringify({ top: r.top, bottom: r.bottom, left: r.left, right: r.right })
            b.append(holder); lineText.push(`${b.className.split(' ').at(-1)} "${m[0]}" in "${t.data.trim().slice(0, 28)}"`)
          }
        }
      }
      const candidates = new Set()
      for (const b of blocks) {
        const br = b.getBoundingClientRect()
        for (const e of document.querySelectorAll('body *')) {
          if (e.contains(b) || b.contains(e) || e.hasAttribute('data-occ-line') || !e.checkVisibility()) continue
          const r = e.getBoundingClientRect()
          if (!r.width || !r.height || !hit(r, br)) continue
          // Topmost only: hiding the parent already hides it (unless the parent contains the block).
          const p = e.parentElement
          if (p && !p.contains(b) && hit(p.getBoundingClientRect(), br)) continue
          candidates.add(e)
        }
      }
      const names = []
      for (const e of candidates) { e.dataset.occ = String(n++); names.push(`${e.tagName.toLowerCase()}.${String(e.className.baseVal ?? e.className).split(' ').filter(Boolean).join('.')}`) }
      return { clip: { x: 0, y: Math.max(0, cr.top - 40), width: innerWidth, height: Math.min(innerHeight, cr.bottom + 40) - Math.max(0, cr.top - 40) }, names, lineText }
    }, id)
    const base = await lines(info.clip), again = await lines(info.clip)
    noise = Math.max(noise, ...base.map((v, i) => Math.abs(v - again[i])))
    for (const [i, name] of info.names.entries()) {
      await page.evaluate((i) => document.querySelector(`[data-occ="${i}"]`).style.setProperty('visibility', 'hidden', 'important'), i)
      const shot = await lines(info.clip)
      await page.evaluate((i) => document.querySelector(`[data-occ="${i}"]`).style.removeProperty('visibility'), i)
      shot.forEach((v, j) => { if (v - base[j] >= RISE) hits.push(`${id}: ${info.lineText[j]} ${Math.round(base[j])}→${Math.round(v)} without ${name}`) })
    }
  }
  if (hits.length) failed++
  console.log(w, `null ±${Math.round(noise)}`, hits.length ? hits.join(' | ') : 'clear')
}
await browser.close()
console.log(failed ? 'FAIL' : 'PASS')
process.exit(failed ? 1 : 0)
