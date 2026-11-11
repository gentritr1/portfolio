// Motion hitches a phone meets, as long animation frames (50 ms or more) and screens left waiting.
// node design/quality/refractive/motion.mjs <base url> [--only startup,open,reveal] [--json out.json]
//   startup  390x844 at 4x CPU: no long frame from the dot field's start-up (three.js, the scene chunk, the home chunk's
//            import().then) between the scene's start and 500 ms after it is ready.
//   open     a case opened from the hero and from a chapter, 390x844 at 4x and 1440x900 at 1x, from the click to 1500 ms
//            after it. At 4x no long frame carries more than 30 ms of script or 10 ms of forced style and layout; at 1x no
//            long frame has script in it. Long frames with no script (the browser's own snapshot and paint) are printed, not
//            failed (owner's target 2026-11-11). After the open, focus must be on the case heading.
//   reveal   every case page at 1440x900 and 390x844, scrolled down in steps: no screen in view (both axes, inside every
//            clipping parent) still in [data-wait] 1500 ms after it came into view, and the pixel reveal's own state settled.
// Each line prints its sample counts (long frames observed, rAF frames against window x 60). Exit 1 on a failure, 2 on a crash.
// Needs headless Chrome (sandbox off) and playwright-core: PLAYWRIGHT_MODULE points at one if this checkout has none.
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? 'playwright-core')
const args = process.argv.slice(2)
const base = (args.find((a) => !a.startsWith('--')) ?? '').replace(/\/$/, '')
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined }
const only = (opt('--only') ?? 'startup,open,reveal').split(',')
const CASES = ['care-platform', 'bayyinah-tv', 'read-to-feed', 'design-system-react', 'viva-fresh', 'leakscan', 'dukagjini-bookstore', 'incentiv', 'offday', 'futurisma']
const LONG = 50
if (!base) { console.error('usage: node motion.mjs <base url> [--only startup,open,reveal] [--json out.json]'); process.exit(2) }

const failures = []
const result = {}
const fail = (msg) => { failures.push(msg); console.log('FAIL ' + msg) }

const init = () => {
  window.__loaf = []
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) window.__loaf.push({
        s: Math.round(e.startTime), d: Math.round(e.duration), style: Math.round(e.startTime + e.duration - e.styleAndLayoutStart),
        scripts: e.scripts.map((x) => ({ d: Math.round(x.duration), inv: x.invoker, src: (x.sourceURL || '').split('/').pop(), forced: Math.round(x.forcedStyleAndLayoutDuration) })),
      })
    }).observe({ type: 'long-animation-frame', buffered: true })
  } catch {}
  window.__frames = () => {
    const f = []; let last = performance.now(), on = true
    const tick = (t) => { if (!on) return; f.push(t - last); last = t; requestAnimationFrame(tick) }
    requestAnimationFrame(tick)
    const t0 = performance.now()
    return () => { on = false; const w = performance.now() - t0; return { frames: f.length, expected: Math.round(w / (1000 / 60)), over50: f.filter((x) => x > 50).length, max: +Math.max(0, ...f).toFixed(1) } }
  }
}
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--enable-gpu-rasterization'],
})
async function open(w, h, throttle, path, beforeLoad = false) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, colorScheme: 'dark' })
  const page = await ctx.newPage()
  await page.addInitScript(init)
  const cdp = await ctx.newCDPSession(page)
  if (beforeLoad && throttle > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle })
  page.on('pageerror', (e) => fail(`${path} ${w}: page error ${e.message}`))
  await page.goto(base + path, { waitUntil: 'load' })
  return { ctx, page, cdp }
}
const fmt = (e) => `${e.d}ms at ${e.s} [${e.scripts.filter((x) => x.d >= 5).map((x) => `${x.src || '?'} ${x.inv} ${x.d}ms`).join('; ') || 'no script'}]`
const ready = (page) => page.waitForFunction(() => document.querySelector('.re-root[data-ready]'), null, { timeout: 20000 })

try {
  if (only.includes('startup')) {
    const { ctx, page } = await open(390, 844, 4, '/', true)
    await ready(page)
    await page.waitForTimeout(1000)
    const { loaf, start, done } = await page.evaluate(() => ({
      loaf: window.__loaf,
      start: performance.getEntriesByName('re:scene-start')[0]?.startTime,
      done: performance.getEntriesByName('eh:ready')[0]?.startTime,
    }))
    if (start === undefined || done === undefined) fail('startup 390x4: the scene never started or never became ready')
    else {
      // Frames that begin during start-up: the scene's import resolves just before its start mark, so from 100 ms earlier.
      const win = loaf.filter((e) => e.s >= start - 100 && e.s <= done + 500)
      // Everything long in the window counts as the field's, unless React (the page's own render) is its largest script.
      // The scene's slices resume from timers and show no source URL, so attribution by file alone would miss them.
      const top = (e) => [...e.scripts].sort((a, b) => b.d - a.d)[0]
      const field = win.filter((e) => e.d >= LONG && !/^react-vendor/.test(top(e)?.src ?? ''))
      const other = win.filter((e) => e.d >= LONG && !field.includes(e))
      result.startup = { start: Math.round(start), ready: Math.round(done), buildMs: Math.round(done - start), framesInWindow: win.length, field, other }
      console.log(`startup 390x4: scene ${Math.round(start)} -> ready ${Math.round(done)} ms; long frames in window: ${field.length} field, ${other.length} other (of ${win.length} observed over 50 ms whole-page)`)
      for (const e of field) fail(`startup 390x4: field long frame ${fmt(e)}`)
      for (const e of other) console.log(`  other long frame (not the field's): ${fmt(e)}`)
    }
    await ctx.close()
  }

  if (only.includes('open')) {
    result.open = []
    for (const [w, h, thr] of [[390, 844, 4], [1440, 900, 1]]) {
      for (const from of ['hero', 'chapter']) {
        const { ctx, page, cdp } = await open(w, h, thr, '/')
        await ready(page)
        let target = page.locator('.re-fh-screen').first()
        if (from === 'chapter') {
          target = page.locator('.re-sw .re-prod-case').first()
          await target.scrollIntoViewIfNeeded()
        }
        await page.waitForTimeout(2500) // the field rings down and the hero settles
        if (thr > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: thr })
        const t0 = await page.evaluate(() => { window.__stop = window.__frames(); return performance.now() })
        await target.click()
        await page.waitForTimeout(1500)
        const frames = await page.evaluate(() => window.__stop())
        const loaf = (await page.evaluate(() => window.__loaf)).filter((e) => e.s + e.d >= t0 - 20 && e.d >= LONG)
        const url = new URL(page.url()).pathname
        const vt = await page.evaluate(() => document.querySelector('.re-casepage') !== null)
        result.open.push({ w, thr, from, url, frames, loaf })
        console.log(`open ${from} ${w}x${thr}: ${url} ${vt ? 'case shown' : 'NO CASE'}; rAF ${frames.frames}/${frames.expected} frames, ${frames.over50} over 50 ms, max ${frames.max} ms; long frames ${loaf.length}`)
        if (!vt) fail(`open ${from} ${w}x${thr}: the case did not open`)
        for (const e of loaf) {
          const script = e.scripts.reduce((a, x) => a + x.d, 0), forced = e.scripts.reduce((a, x) => a + x.forced, 0)
          const line = `open ${from} ${w}x${thr}: long frame ${fmt(e)} (script ${script} ms, forced ${forced} ms, ${e.style} ms style and layout)`
          if (thr > 1 ? script > 30 || forced > 10 : e.scripts.length > 0) fail(line)
          else console.log('  reported, not gated: ' + line)
        }
        const focused = await page.evaluate(() => document.activeElement?.id)
        if (focused !== 're-case-h') fail(`open ${from} ${w}x${thr}: focus on #${focused}, not the case heading`)
        await ctx.close()
      }
    }
  }

  if (only.includes('reveal')) {
    result.reveal = []
    for (const [w, h] of [[1440, 900], [390, 844]]) {
      for (const slug of CASES) {
        const { ctx, page } = await open(w, h, 1, `/${slug}`)
        await page.evaluate(() => document.fonts.ready)
        // Poll every 100 ms: when each waiting box is first visible (inside the viewport and every clipping parent), and how long it waited.
        await page.evaluate(() => {
          window.__wait = new Map()
          // A screen in a sideways row counts as in view when its row is: the visitor can swipe to it at any moment, and
          // a screen still waiting there is what check.mjs M07 reports. Clipping parents inside the screen still clip.
          const seen = (el) => {
            const r = el.getBoundingClientRect()
            let x0 = r.left, y0 = Math.max(r.top, 0), x1 = r.right, y1 = Math.min(r.bottom, innerHeight), row = false
            for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
              const s = getComputedStyle(n)
              if (s.overflowX === 'visible' && s.overflowY === 'visible') continue
              const c = n.getBoundingClientRect()
              if (/auto|scroll/.test(s.overflowX)) row = true
              if (!row) { x0 = Math.max(x0, c.left); x1 = Math.min(x1, c.right) }
              y0 = Math.max(y0, c.top); y1 = Math.min(y1, c.bottom)
            }
            if (!row) { x0 = Math.max(x0, 0); x1 = Math.min(x1, innerWidth) }
            // At least a quarter of the box, or 100 px both ways, is on screen.
            const vw = x1 - x0, vh = y1 - y0
            return vw > 0 && vh > 0 && (vw * vh >= 0.25 * r.width * r.height || (vw >= 100 && vh >= 100))
          }
          const poll = () => {
            const now = performance.now()
            for (const el of document.querySelectorAll('[data-wait]')) {
              const k = window.__wait.get(el) ?? { first: null, last: null, name: (el.querySelector('img')?.alt || el.className).slice(0, 50) }
              if (seen(el)) { k.first ??= now; k.last = now }
              window.__wait.set(el, k)
            }
            for (const [el, k] of window.__wait) if (!el.hasAttribute('data-wait') && !k.end) k.end = now
          }
          window.__poll = setInterval(poll, 100)
          poll()
        })
        // Step down like a reader, a screen at a time, then rest at the bottom.
        const H = await page.evaluate(() => document.documentElement.scrollHeight)
        for (let y = 0; y < H; y += Math.round(h * 0.8)) {
          await page.evaluate((y) => scrollTo(0, y), y)
          await page.waitForTimeout(400)
        }
        await page.waitForTimeout(1700)
        const stuck = await page.evaluate(() => {
          const now = performance.now()
          clearInterval(window.__poll)
          return [...window.__wait.entries()].filter(([el, k]) => k.first !== null && el.isConnected && el.hasAttribute('data-wait') && now - k.first > 1500)
            .map(([, k]) => `${k.name} (waiting ${Math.round(now - k.first)} ms since it came into view)`)
        })
        // Heading levels as a screen reader meets them: rendered headings, visually hidden ones included, no skipped level.
        const levels = await page.evaluate(() => [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter((h) => h.checkVisibility()).map((h) => +h.nodeName[1]))
        const skip = levels.findIndex((l, i) => i > 0 && l > levels[i - 1] + 1)
        if (skip > 0) fail(`reveal ${w} /${slug}: heading level jumps from h${levels[skip - 1]} to h${levels[skip]} (${levels.join(' ')})`)
        const counts = await page.evaluate(() => ({ boxes: window.__wait.size, seen: [...window.__wait.values()].filter((k) => k.first !== null).length, waits: [...window.__wait.values()].filter((k) => k.first !== null && k.end).map((k) => Math.max(0, Math.round(k.end - k.first))) }))
        result.reveal.push({ w, slug, stuck, ...counts })
        const p = (a, q) => (a.length ? [...a].sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor(a.length * q))] : '-')
        console.log(`reveal ${w} /${slug}: ${counts.boxes} waiting boxes, ${counts.seen} came into view, settled in view after p50 ${p(counts.waits, 0.5)} / max ${p(counts.waits, 1)} ms (100 ms polls); stuck ${stuck.length}`)
        for (const s of stuck) fail(`reveal ${w} /${slug}: ${s}`)
        await ctx.close()
      }
    }
  }
} catch (e) {
  console.error('CRASH', e)
  await browser.close().catch(() => {})
  process.exit(2)
}
await browser.close()
if (opt('--json')) (await import('node:fs')).writeFileSync(opt('--json'), JSON.stringify({ base, result, failures }, null, 1))
console.log(failures.length ? `${failures.length} failure(s)` : 'pass')
process.exit(failures.length ? 1 : 0)
