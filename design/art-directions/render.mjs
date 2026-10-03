// Render .dc.html boards to plain HTML and screenshot them with headless Chrome.
// Usage: node render.mjs [Board.dc.html ...]   (default: all boards)
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'

const dir = new URL('.', import.meta.url).pathname
const proj = join(dir, 'project')
const out = join(dir, 'render')
mkdirSync(out, { recursive: true })
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const assets = join(dir, '..', 'ad-assets')
const blobs = {
  e4db1c62e8865c5bf469ad292fa3ad36: 'btv-store-1.webp',
  efd3efb4559b375e93df948c6424122c: 'btv-store-2.webp',
  b5de8b603eb9fc1eb6243512da056cfb: 'btv-web-1.webp',
  '47ba7ca5a8b75d1adb0707716e2e02c7': 'viva-1.webp',
  '0aa911fe9541dfae5df4cfaeb1cd6503': 'viva-2.webp',
  '461e33a21e9453a672979083bb704ea9': 'rtf-1.webp',
  '5a5111f71e28ccea7450e215ad9e5751': 'rtf-2.webp',
  a5a912f0767e7c0ff1c578911e914398: 'dukagjini-1.webp',
  e72b0dde4d866b2d7a3bf592d48f25a8: 'fjale.webp',
  a883265a486c88d8b055ec37ce097d36: 'snaxx.webp',
}
const localBlobs = (html) => html.replace(/\/_blob\/([0-9a-f]{32})/g, (m, id) => (blobs[id] ? `file://${join(assets, blobs[id])}` : m))

function get(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj)
}
function fill(tpl, scope) {
  return tpl.replace(/\{\{\s*([\w$.]+)\s*\}\}/g, (_, p) => {
    if (p === 'true') return 'true'
    const v = get(scope, p)
    return v == null ? '' : String(v)
  })
}
function expand(html, scope) {
  // sc-for (non-greedy, supports nesting by repeated passes)
  let prev
  do {
    prev = html
    html = html.replace(/<sc-for\s+list="\{\{\s*([\w$.]+)\s*\}\}"\s+as="(\w+)"[^>]*>((?:(?!<sc-for)[\s\S])*?)<\/sc-for>/g, (_, list, as, inner) => {
      const items = get(scope, list) || []
      return items.map((it, i) => expand(fill(inner, { ...scope, [as]: it, $index: i }), { ...scope, [as]: it, $index: i })).join('')
    })
    html = html.replace(/<sc-if\s+value="\{\{\s*([\w$.]+)\s*\}\}"[^>]*>((?:(?!<sc-if)[\s\S])*?)<\/sc-if>/g, (_, v, inner) => (get(scope, v) ? inner : ''))
  } while (html !== prev)
  return fill(html, scope)
}

const files = process.argv.slice(2).length ? process.argv.slice(2) : readdirSync(proj).filter((f) => f.endsWith('.dc.html'))
for (const f of files) {
  const src = readFileSync(join(proj, f), 'utf8')
  const helmet = (src.match(/<helmet>([\s\S]*?)<\/helmet>/) || [, ''])[1]
  const body = (src.match(/<x-dc>([\s\S]*?)<\/x-dc>/) || [, ''])[1].replace(/<helmet>[\s\S]*?<\/helmet>/, '')
  const script = (src.match(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/) || [, ''])[1]
  const preview = JSON.parse((src.match(/"\$preview":(\{[^}]*\})/) || [, '{"width":1440,"height":2200}'])[1])
  let vals = {}
  try {
    // eslint-disable-next-line no-new-func
    const Component = new Function('DCLogic', `${script}; return Component`)(class { constructor() { this.props = {}; this.state = {} } setState() {} forceUpdate() {} })
    const c = new Component()
    c.state = c.state || {}
    vals = c.renderVals ? c.renderVals() : {}
  } catch (e) {
    console.error(f, 'script error:', e.message)
  }
  const html = localBlobs(`<!doctype html><html lang="en"><head><meta charset="utf-8">${helmet}</head><body>${expand(body, vals)}</body></html>`)
  const page = join(out, f.replace('.dc.html', '.html'))
  writeFileSync(page, html)
  const png = join(out, f.replace('.dc.html', '.png'))
  execFileSync(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--window-size=${preview.width},${preview.height}`, '--virtual-time-budget=6000', `--screenshot=${png}`, `file://${page}`], { stdio: 'ignore' })
  const top = join(out, f.replace('.dc.html', '-top.png'))
  execFileSync(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--window-size=1440,900', '--virtual-time-budget=6000', `--screenshot=${top}`, `file://${page}`], { stdio: 'ignore' })
  console.log('rendered', f, `${preview.width}x${preview.height}`)
}
