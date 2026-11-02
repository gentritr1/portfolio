// Share of the 1440 × 900 first screen covered by the Offday front plate alone (no caption, no marker): node plate-area.mjs <origin>
import { chromium } from 'playwright-core'
const origin = process.argv[2] ?? 'http://localhost:4173'
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
for (const [name, path, sel] of [['current', '/', '.re-stk-plate[data-d="0"]'], ['switch', '/switch', '#sh-offday .re-stk-plate[data-d="0"]']]) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
  await p.goto(origin + path, { waitUntil: 'networkidle' })
  const r = await p.locator(sel).evaluate((el) => { const r = el.getBoundingClientRect(); return { w: r.width, h: Math.min(r.bottom, innerHeight) - Math.max(r.top, 0) } })
  console.log(`${name}: front plate ${Math.round(r.w)} × ${Math.round(r.h)} px visible = ${(100 * r.w * r.h / (1440 * 900)).toFixed(1)}% of the first screen`)
  await p.close()
}
await b.close()
