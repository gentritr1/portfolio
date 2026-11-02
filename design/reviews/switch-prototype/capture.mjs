// First-screen and full-page captures of the current home (/) and the prototype (/switch) at 390 × 844 and 1440 × 900.
// node capture.mjs <origin> <out dir>   (a production build: npm run build && npx vite preview --port 4173)
// Waits on fonts and on every <img> above the fold being decoded, never on a fixed sleep.
import { chromium } from 'playwright-core'
const [origin = 'http://localhost:4173', out = 'design/reviews/switch-prototype'] = process.argv.slice(2)
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
const pages = [['current', '/'], ['switch', '/switch']]
const sizes = [[390, 844, true], [1440, 900, false]]
for (const [name, path] of pages) for (const [w, h, mobile] of sizes) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile, reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  page.on('crash', () => console.log(`${name} ${w}: RENDERER CRASHED`))
  await page.goto(origin + path, { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)
  // Every image the reader can see in the viewport is loaded (hidden or off-screen lazy ones never will be).
  const settle = () => page.waitForFunction(() => [...document.images].filter((i) => {
    const r = i.getBoundingClientRect()
    return r.width > 0 && r.bottom > 0 && r.top < innerHeight && getComputedStyle(i).visibility !== 'hidden'
  }).every((i) => i.complete), null, { timeout: 15000 })
  await settle()
  await page.screenshot({ path: `${out}/${name}-${w}.png` })
  // Full page: scroll through once so lazy screens load, then back to the top.
  const height = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < height; y += h) { await page.evaluate((y) => scrollTo(0, y), y); await settle().catch(() => {}) }
  await page.evaluate(() => scrollTo(0, 0))
  // Every mounted screen decoded, or the full-page shot catches a lazy one mid-decode as a white plate.
  await page.evaluate(async () => { for (const i of document.images) if (i.src && i.getBoundingClientRect().width > 0) await i.decode().catch(() => {}) })
  await page.screenshot({ path: `${out}/${name}-${w}-full.png`, fullPage: true })
  // The switch at rest and after each pick (keyboard: no animation), Offday's stack in view.
  const scope = name === 'switch' ? '#sh-offday ' : ''
  for (const l of [1, 2]) {
    await page.locator(`${scope}.re-stk-control button[data-l="${l}"]`).focus()
    await page.keyboard.press('Enter')
    await page.waitForFunction((s) => document.querySelector(s)?.dataset.d === '0', `${scope}.re-stk-plate[data-l="${l}"]`)
    await page.locator(`${scope}.re-intro-art`).scrollIntoViewIfNeeded()
    await page.screenshot({ path: `${out}/${name}-${w}-layer${l}.png` })
  }
  console.log(`${name} ${w}: height ${height}`)
  await ctx.close()
}
await browser.close()
