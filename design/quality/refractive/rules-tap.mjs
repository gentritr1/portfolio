// Offday stack on a slow phone: tap "Server rules" and fail if the front plate is ever an empty white card.
// A 390 × 844 touch device, CDP-throttled to 150 ms latency, 1.6 Mbps down, 750 kbps up, cache off (the 2026-11-02 repro).
// Cases: taps 1.5 s and 4 s after the load event (two runs each); the screen's request aborted, then a retry once it is
// unblocked (by a second tap on the switch, then by Try again); the screen held back 10 s (the plate in front must stay).
// node rules-tap.mjs <url> [capture prefix] → one line per frame and per run; exit 1 on an empty frame, a button slower
// than 100 ms, a missing failure message or a retry that never shows the screen.
import { chromium } from 'playwright-core'
const [url, out] = process.argv.slice(2)
const SCREEN = '**/offday-landing-security.webp'
let failed = 0
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })

async function open(route) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const page = await ctx.newPage()
  if (route) await page.route(SCREEN, route)
  const cdp = await ctx.newCDPSession(page)
  await cdp.send('Network.enable')
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 })
  // Per frame after a tap: when the switch shows Server rules pressed, when its plate comes to the front, when its screen is in.
  await page.addInitScript(() => {
    addEventListener('touchstart', (e) => {
      if (!e.target.closest?.('.re-stk-control button[data-l="1"], .re-stk-retry')) return
      Object.assign(window, { __tap: performance.now(), __pressed: null, __front: null, __shown: null })
    }, { capture: true })
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
  return { ctx, page, loadAt: await page.evaluate(() => performance.now()) }
}

// Tap, then capture the figure at each frame time: which plate is in front, how much of it is ink (under 1 % of pixels
// off the plate's #f7f5f5 ground, inset 15 % past its tilted corners, is an empty plate), and the caption.
async function tap(page, target, frames, name) {
  await page.locator(target).tap()
  const tapAt = await page.evaluate(() => window.__tap)
  const lines = [], empty = []
  for (const ms of frames) {
    await page.waitForFunction((at) => performance.now() >= at, tapAt + ms, { polling: 'raf' })
    if (out) await page.locator('.re-intro-art').screenshot({ path: `${out}-${name}-${ms}ms.png` })
    const front = page.locator('.re-stk-plate[data-d="0"]')
    const box = await front.boundingBox()
    const b64 = (await page.screenshot({ clip: { x: box.x + box.width * 0.15, y: box.y + box.height * 0.15, width: box.width * 0.7, height: box.height * 0.7 } })).toString('base64')
    const ink = await page.evaluate(async (b64) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode()
      const c = new OffscreenCanvas(img.width, img.height), x = c.getContext('2d'); x.drawImage(img, 0, 0)
      const d = x.getImageData(0, 0, img.width, img.height).data
      let n = 0
      for (let i = 0; i < d.length; i += 4) if (Math.abs(d[i] - 247) + Math.abs(d[i + 1] - 245) + Math.abs(d[i + 2] - 245) > 24) n++
      return n / (d.length / 4)
    }, b64)
    const layer = await front.getAttribute('data-l')
    const caption = (await page.locator('.re-intro-art figcaption').textContent()).trim()
    if (ink < 0.01) empty.push(`${ms}ms`)
    lines.push(`  ${String(ms).padStart(5)} ms  front ${['Interface', 'Server rules', 'Data'][layer]}, ink ${(ink * 100).toFixed(1)} %, caption "${caption}"${ink < 0.01 ? '  EMPTY' : ''}`)
  }
  return { tapAt, lines, empty }
}

async function report(page, label, t, { needShown = true, needMessage = false } = {}) {
  if (needShown) await page.waitForFunction(() => window.__shown != null, null, { timeout: 30000, polling: 'raf' }).catch(() => {})
  const m = await page.evaluate(() => ({ pressed: window.__pressed, front: window.__front, shown: window.__shown, alert: document.querySelector('.re-intro-art [role="alert"]')?.textContent ?? null }))
  const ms = (v) => (v == null ? 'never' : `${Math.round(v - t.tapAt)} ms`)
  const bad = t.empty.length > 0 || m.pressed == null || m.pressed - t.tapAt > 100 || (needShown && m.shown == null) || (needMessage && !m.alert)
  if (bad) failed++
  console.log(`${label}: pressed ${ms(m.pressed)}, rules in front ${ms(m.front)}, screen showing ${ms(m.shown)}, empty frames ${t.empty.join(' ') || 'none'}${needMessage ? `, message ${m.alert ? `"${m.alert}"` : 'MISSING'}` : ''}${bad ? '  FAIL' : ''}`)
  console.log(t.lines.join('\n'))
}

// 1. The 2026-11-02 repro.
for (const delay of [1500, 4000]) for (const run of [1, 2]) {
  const { ctx, page, loadAt } = await open()
  await page.waitForTimeout(delay) // the condition under test: a reader tapping this long after load
  const t = await tap(page, '.re-stk-control button[data-l="1"]', [100, 300, 600, 1200], `${delay}-r${run}`)
  await report(page, `tap ${delay} ms after load (load at ${Math.round(loadAt)} ms) run ${run}`, t)
  await ctx.close()
}

// 2. The screen's request aborted: the plate in front stays, the caption says so; unblocked, a retry brings the screen.
for (const [run, retry] of [[1, '.re-stk-control button[data-l="1"]'], [2, '.re-stk-retry']]) {
  let block = true
  const { ctx, page } = await open((r) => (block ? r.abort() : r.continue()))
  await page.waitForTimeout(1500)
  const t = await tap(page, '.re-stk-control button[data-l="1"]', [100, 300, 600, 1200], `aborted-r${run}`)
  await report(page, `aborted, run ${run}`, t, { needShown: false, needMessage: true })
  block = false
  const again = await tap(page, retry, [100, 300, 600, 1200, 2400], `aborted-r${run}-retry`)
  await report(page, `  unblocked, retried with ${retry === '.re-stk-retry' ? 'Try again' : 'a second tap on the switch'}`, again)
  await ctx.close()
}

// 3. The screen held back 10 s: past the 3 s wait the selection returns and the caption says so; no frame is empty.
{
  const { ctx, page } = await open(async (r) => { await new Promise((ok) => setTimeout(ok, 10000)); await r.continue().catch(() => {}) })
  await page.waitForTimeout(1500)
  const t = await tap(page, '.re-stk-control button[data-l="1"]', [100, 300, 600, 1200, 2400, 3200, 4500, 7000, 10000], 'delayed')
  await report(page, 'delayed 10 s', t, { needShown: false, needMessage: true })
  await ctx.close()
}

await browser.close()
console.log(failed ? 'FAIL' : 'PASS')
process.exit(failed ? 1 : 0)
