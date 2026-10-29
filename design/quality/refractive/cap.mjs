// Captures the refractive-engine chamber through CDP. Usage: node cap.mjs <outDir> <plan.json>
// plan: [{ name, w, h, mobile?, reduced?, nogl?, tensor?, steps: [ {click: selector} | {tap: selector} | {key: "Tab"} | {wait: ms} | {eval: js} | {shot: name} ] }]
import { spawn } from 'node:child_process'
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { setTimeout as sleep } from 'node:timers/promises'

const [out, planFile] = process.argv.slice(2)
const plan = JSON.parse(readFileSync(planFile, 'utf8'))
const base = process.env.BASE ?? 'http://localhost:5175/drafts/refractive-engine'
mkdirSync(out, { recursive: true })
const port = 9341
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${out}/profile`, '--use-angle=metal',
  '--window-size=1440,900', '--hide-scrollbars', 'about:blank',
], { stdio: 'ignore' })
const deadline = Date.now() + 30_000
const die = (m) => { console.error('FAIL', m); chrome.kill(); process.exit(1) }
let target
while (!target) {
  if (Date.now() > deadline) die('no page target')
  try { target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page') } catch { await sleep(200) }
}
const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j })
let id = 0
const pending = new Map()
const logs = []
ws.onmessage = (e) => {
  const m = JSON.parse(e.data)
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id) }
  if (m.method === 'Runtime.exceptionThrown') logs.push('EXC ' + m.params.exceptionDetails.exception?.description?.split('\n')[0])
  if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) logs.push(m.params.type + ' ' + m.params.args.map((a) => a.value ?? a.description).join(' ').slice(0, 300))
}
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })) })
const evaluate = async (expression) => {
  const m = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (m.result?.exceptionDetails) die('eval: ' + expression.slice(0, 80) + ' -> ' + m.result.exceptionDetails.exception?.description)
  return m.result?.result?.value
}
const waitFor = async (expr, ms = 15000) => {
  const t = Date.now()
  while (!(await evaluate(expr))) { if (Date.now() - t > ms) die('timeout waiting for ' + expr); await sleep(100) }
}
await send('Runtime.enable')
await send('Page.enable')
for (const run of plan) {
  await send('Emulation.setDeviceMetricsOverride', { width: run.w, height: run.h, deviceScaleFactor: run.dpr ?? (run.mobile ? 3 : 2), mobile: !!run.mobile })
  await send('Emulation.setTouchEmulationEnabled', { enabled: !!run.mobile })
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: run.reduced ? 'reduce' : 'no-preference' }] })
  const init = await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `localStorage.setItem('re:mode', ${JSON.stringify(run.tensor ? 'tensor' : 'lens')});` +
      (run.init ?? '') + (run.nogl ? `const g = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, ...a) { return /webgl/.test(t) ? null : g.call(this, t, ...a) };` : ''),
  })
  await send('Page.navigate', { url: base })
  await waitFor(`!!document.querySelector('.re-root[data-ready]') && !!document.querySelector('.re-ch')`)
  await evaluate(`(() => { const y = document.querySelector('.re-lab').getBoundingClientRect().top + scrollY; window.scrollTo({ top: y, behavior: 'instant' }) })()`)
  await sleep(300)
  if (!run.nogl) await waitFor(`!!document.querySelector('.re-ch-stage[data-ready]')`)
  await sleep(900)
  for (const s of run.steps) {
    if (s.click) await evaluate(`document.querySelector(${JSON.stringify(s.click)}).click()`)
    if (s.tap) {
      const r = await evaluate(`(() => { const b = document.querySelector(${JSON.stringify(s.tap)}).getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 } })()`)
      if (run.mobile) {
        await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r.x, y: r.y }] })
        await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
      } else {
        await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: r.x, y: r.y })
        await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: r.x, y: r.y, button: 'left', clickCount: 1 })
        await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: r.x, y: r.y, button: 'left', clickCount: 1 })
      }
    }
    if (s.key) {
      const code = { Tab: 9, Enter: 13, ' ': 32, Escape: 27, End: 35, Home: 36, ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40 }[s.key]
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: s.key, code: s.key.startsWith('Arrow') || s.key === 'Home' || s.key === 'End' ? s.key : undefined, windowsVirtualKeyCode: code, text: s.key === 'Enter' ? '\r' : s.key === ' ' ? ' ' : undefined, modifiers: s.shift ? 8 : 0 })
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key: s.key, windowsVirtualKeyCode: code, modifiers: s.shift ? 8 : 0 })
    }
    if (s.scrollTo) await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(s.scrollTo)}); window.scrollTo({ top: el.getBoundingClientRect().top + scrollY + ${s.offset ?? 0}, behavior: 'instant' }) })()`)
    if (s.media) await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: s.media }] })
    if (s.scrollBy) await evaluate(`window.scrollBy({ top: ${s.scrollBy}, behavior: 'instant' })`)
    if (s.resize) await send('Emulation.setDeviceMetricsOverride', { width: s.resize[0], height: s.resize[1], deviceScaleFactor: s.resize[2] ?? 2, mobile: s.resize[0] < 600 })
    if (s.wheel) {
      for (let i = 0; i < (s.ticks ?? 6); i++) {
        await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: s.x ?? 700, y: s.y ?? 450, deltaX: 0, deltaY: s.wheel })
        await sleep(16)
      }
    }
    if (s.hover) {
      const r = await evaluate(`(() => { const b = document.querySelector(${JSON.stringify(s.hover)}).getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 } })()`)
      await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: r.x, y: r.y })
    }
    if (s.wait) await sleep(s.wait)
    if (s.eval) console.log(run.name, JSON.stringify(await evaluate(s.eval)))
    if (s.shot) {
      const shot = await send('Page.captureScreenshot', { format: 'png', ...(s.full ? { captureBeyondViewport: true } : {}) })
      writeFileSync(`${out}/${s.shot}.png`, Buffer.from(shot.result.data, 'base64'))
      console.log('shot', s.shot)
    }
  }
  await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: init.result.identifier })
}
console.log(logs.length ? logs.join('\n') : 'no console errors')
chrome.kill()
process.exit(0)
