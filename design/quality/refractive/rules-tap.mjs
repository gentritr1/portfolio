// Offday stack on a slow phone: tap "Server rules" and fail if the front plate is ever an empty white card.
// A 390 × 844 touch device, CDP-throttled to 150 ms latency, 1.6 Mbps down, 750 kbps up, cache off (the 2026-11-02 repro).
// Taps 1.5 s and 4 s after the load event, two runs each; captures the stack 100, 300, 600 and 1200 ms after the tap.
// node rules-tap.mjs <url> [out dir for captures] → one line per run; exit 1 on an empty frame or a button slower than 100 ms.
import { chromium } from 'playwright-core'
const [url, out] = process.argv.slice(2)
const FRAMES = [100, 300, 600, 1200]
let failed = 0
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
for (const delay of [1500, 4000]) for (const run of [1, 2]) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const page = await ctx.newPage()
  const cdp = await ctx.newCDPSession(page)
  await cdp.send('Network.enable')
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 })
  // Per frame after the tap: when the button shows pressed, when the rules plate comes to the front, when its screen is in.
  await page.addInitScript(() => {
    addEventListener('touchstart', (e) => { if (e.target.closest?.('.re-stk-control button[data-l="1"]')) window.__tap = performance.now() }, { capture: true })
    const tick = () => {
      const t = performance.now()
      if (window.__tap != null) {
        const plate = document.querySelector('.re-stk-plate[data-l="1"]'), img = plate?.querySelector('img')
        if (window.__pressed == null && document.querySelector('.re-stk-control button[data-l="1"]')?.getAttribute('aria-pressed') === 'true') window.__pressed = t
        if (window.__front == null && plate?.dataset.d === '0') window.__front = t
        if (window.__shown == null && plate?.dataset.d === '0' && img?.complete && img.naturalWidth) window.__shown = t
      }
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
  await page.goto(url, { waitUntil: 'load', timeout: 90000 })
  const loadAt = await page.evaluate(() => performance.now())
  await page.waitForTimeout(delay) // the condition under test: a reader tapping this long after load
  await page.locator('.re-stk-control button[data-l="1"]').tap()
  const tap = await page.evaluate(() => window.__tap)
  const empties = []
  for (const ms of FRAMES) {
    await page.waitForFunction((at) => performance.now() >= at, tap + ms, { polling: 'raf' })
    const stack = page.locator('.re-intro-art') // plates and the layer buttons
    if (out) await stack.screenshot({ path: `${out}-${delay}-r${run}-${ms}ms.png` })
    // The plate in front (data-d 0), inset 15 % past its tilted corners: under 1 % of pixels off its #f7f5f5 ground = empty.
    const box = await page.locator('.re-stk-plate[data-d="0"]').boundingBox()
    const clip = { x: box.x + box.width * 0.15, y: box.y + box.height * 0.15, width: box.width * 0.7, height: box.height * 0.7 }
    const b64 = (await page.screenshot({ clip })).toString('base64')
    const ink = await page.evaluate(async (b64) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode()
      const c = new OffscreenCanvas(img.width, img.height), x = c.getContext('2d'); x.drawImage(img, 0, 0)
      const d = x.getImageData(0, 0, img.width, img.height).data
      let n = 0
      for (let i = 0; i < d.length; i += 4) if (Math.abs(d[i] - 247) + Math.abs(d[i + 1] - 245) + Math.abs(d[i + 2] - 245) > 24) n++
      return n / (d.length / 4)
    }, b64)
    if (ink < 0.01) empties.push(`${ms}ms`)
  }
  await page.waitForFunction(() => window.__shown != null, null, { timeout: 30000, polling: 'raf' }).catch(() => {})
  const m = await page.evaluate(() => ({ pressed: window.__pressed, front: window.__front, shown: window.__shown }))
  const ms = (t) => (t == null ? 'never' : `${Math.round(t - tap)} ms`)
  const blank = m.front != null && m.shown != null ? Math.round(m.shown - m.front) : null
  const bad = empties.length > 0 || m.pressed == null || m.pressed - tap > 100
  if (bad) failed++
  console.log(`tap ${delay} ms after load (load at ${Math.round(loadAt)} ms, tap at ${Math.round(tap)} ms) run ${run}: pressed ${ms(m.pressed)}, rules in front ${ms(m.front)}, screen showing ${ms(m.shown)}, blank plate ${blank} ms, empty frames ${empties.join(' ') || 'none'}${bad ? '  FAIL' : ''}`)
  await ctx.close()
}
await browser.close()
console.log(failed ? 'FAIL' : 'PASS')
process.exit(failed ? 1 : 0)
