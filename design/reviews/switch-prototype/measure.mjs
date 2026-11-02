// The comparison's measurements for the current home (/) and the prototype (/switch), on a production build.
// node measure.mjs <origin> [reps]   (npm run build && npx vite preview --port 4173)
// 1. JS per route: every script the page fetches by network idle plus 3 s (the current home loads three.js at idle),
//    gzip -9 of the built file; also the subset fetched before the load event.
// 2. LCP and CLS at 4× CPU, cache off, 390 × 844 (touch) and 1440 × 900; reps interleaved A B A B. CLS twice: at network
//    idle, and after a scroll to the bottom and back.
// 3. Targets under 44 px at 390 (visible links, buttons, summaries, inputs).
// 4. Tab only, 390 and 1440: every stop, stops without a visible focus ring, focus lost to <body>, and Enter on the
//    Offday Server rules control (does the plate in front change without a pointer).
import { chromium } from 'playwright-core'
import { readFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
const [origin = 'http://localhost:4173', repsArg = '5'] = process.argv.slice(2)
const REPS = Number(repsArg)
const PAGES = [['current', '/'], ['switch', '/switch']]
const SIZES = [[390, 844, true], [1440, 900, false]]
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
const ctxFor = (w, h, mobile) => browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile })
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2 }

// 1. JS per route
console.log('## JS per route (gzip -9 of each built file, KB)')
for (const [name, path] of PAGES) {
  const ctx = await ctxFor(390, 844, true), page = await ctx.newPage()
  const early = new Set(), all = new Set()
  let loaded = false
  page.on('response', (r) => { const u = new URL(r.url()); if (u.pathname.endsWith('.js')) { all.add(u.pathname); if (!loaded) early.add(u.pathname) } })
  page.on('load', () => { loaded = true })
  await page.goto(origin + path, { waitUntil: 'networkidle' })
  await page.waitForTimeout(3000) // idle-time imports (requestIdleCallback, 1.5 s timeout) are part of the route's cost
  const kb = (set) => [...set].reduce((s, p) => s + gzipSync(readFileSync('dist' + p), { level: 9 }).length, 0) / 1024
  console.log(`${name}: before load ${kb(early).toFixed(1)} KB (${early.size} files), by idle ${kb(all).toFixed(1)} KB (${all.size} files): ${[...all].map((p) => p.split('/').pop().replace(/-[\w-]{8}\.js$/, '')).join(', ')}`)
  await ctx.close()
}

// 2. LCP and CLS
console.log(`\n## LCP and CLS at 4x CPU, cache off, ${REPS} reps each, interleaved`)
const vitals = {}
for (const [w, h, mobile] of SIZES) for (let rep = 0; rep < REPS; rep++) for (const [name, path] of PAGES) {
  const ctx = await ctxFor(w, h, mobile), page = await ctx.newPage()
  const cdp = await ctx.newCDPSession(page)
  await cdp.send('Network.enable'); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  await page.addInitScript(() => {
    window.__v = { lcp: 0, lcpEl: '', cls: 0 }
    new PerformanceObserver((l) => { for (const e of l.getEntries()) { window.__v.lcp = e.startTime; window.__v.lcpEl = `${e.element?.tagName ?? ''}.${e.element?.className ?? ''} ${(e.url || '').split('/').pop()}` } }).observe({ type: 'largest-contentful-paint', buffered: true })
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__v.cls += e.value }).observe({ type: 'layout-shift', buffered: true })
  })
  await page.goto(origin + path, { waitUntil: 'networkidle', timeout: 90000 })
  const atIdle = await page.evaluate(() => ({ ...window.__v }))
  await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)) } scrollTo(0, 0); await new Promise((r) => setTimeout(r, 300)) })
  const after = await page.evaluate(() => window.__v.cls)
  const k = `${name} ${w}`
  ;(vitals[k] ??= []).push({ lcp: atIdle.lcp, cls: atIdle.cls, clsScroll: after, el: atIdle.lcpEl })
  await ctx.close()
}
for (const [k, v] of Object.entries(vitals)) {
  const l = v.map((x) => x.lcp), c = v.map((x) => x.cls), s = v.map((x) => x.clsScroll)
  console.log(`${k}: LCP median ${Math.round(med(l))} ms [${Math.round(Math.min(...l))}–${Math.round(Math.max(...l))}], n=${v.length}; CLS at idle median ${med(c).toFixed(3)} [${Math.min(...c).toFixed(3)}–${Math.max(...c).toFixed(3)}]; CLS after scroll median ${med(s).toFixed(3)} [max ${Math.max(...s).toFixed(3)}]; LCP element ${[...new Set(v.map((x) => x.el))].join(' | ')}`)
}

// 3. Targets under 44 px at 390
console.log('\n## Targets under 44 px at 390 x 844')
for (const [name, path] of PAGES) {
  const ctx = await ctxFor(390, 844, true), page = await ctx.newPage()
  await page.goto(origin + path, { waitUntil: 'networkidle' })
  const small = await page.evaluate(() => [...document.querySelectorAll('a[href], button, summary, input, select, [role="button"]')].filter((el) => {
    const r = el.getBoundingClientRect(), s = getComputedStyle(el)
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && !el.closest('[aria-hidden="true"], [hidden], dialog:not([open])') && (r.width < 44 || r.height < 44)
  }).map((el) => { const r = el.getBoundingClientRect(); return `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 40)}" ${Math.round(r.width)}×${Math.round(r.height)}` }))
  const total = await page.evaluate(() => document.querySelectorAll('a[href], button, summary, input, select, [role="button"]').length)
  console.log(`${name}: ${small.length} of ${total} under 44 px${small.length ? ':\n  ' + small.join('\n  ') : ''}`)
  await ctx.close()
}

// 4. Tab only
console.log('\n## Tab-only pass')
for (const [w, h, mobile] of SIZES) for (const [name, path] of PAGES) {
  const ctx = await ctxFor(w, h, mobile), page = await ctx.newPage()
  await page.goto(origin + path, { waitUntil: 'networkidle' })
  const stops = [], noRing = [], lost = []
  for (let i = 0; i < 400; i++) {
    await page.keyboard.press('Tab')
    const s = await page.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body) return { body: true }
      const cs = getComputedStyle(el), r = el.getBoundingClientRect()
      const ring = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none'
      return { id: `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 36)}"`, ring, inView: r.bottom > 0 && r.top < innerHeight && r.width > 0, y: Math.round(r.top + scrollY) }
    })
    if (s.body) { lost.push(i); if (stops.length) break; else continue }
    if (stops.length && s.id === stops[0].id && s.y === stops[0].y) break // wrapped
    stops.push(s)
    if (!s.ring || !s.inView) noRing.push(`${s.id}${s.inView ? '' : ' (off screen)'}`)
  }
  // Enter on the Offday Server rules control, from the keyboard.
  const sel = name === 'switch' ? '#sh-offday .re-stk-control button[data-l="1"]' : '.re-stk-control button[data-l="1"]'
  await page.locator(sel).focus()
  await page.keyboard.press('Enter')
  const front = await page.waitForFunction((s) => document.querySelector(s.replace('.re-stk-control button', '.re-stk-plate'))?.dataset.d === '0', sel, { timeout: 10000 }).then(() => 'yes', () => 'NO')
  console.log(`${name} ${w}: ${stops.length} stops; without a visible ring or off screen: ${noRing.length}${noRing.length ? ' (' + noRing.slice(0, 8).join('; ') + ')' : ''}; then focus leaves the page (the end of the tab order); focus lost to <body> mid-page: ${Math.max(0, lost.filter((i) => i > 0).length - 1)}; Enter on Server rules brings its plate to the front: ${front}`)
  await ctx.close()
}
await browser.close()
