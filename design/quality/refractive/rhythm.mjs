// Rhythm and vocabulary of the home page below the hero (selected work to contact).
// node rhythm.mjs <url> [--assert] [--json <file>]
//   Rhythm (1440, 1024, 390): the gap from one selected-work chapter's last painted box to the next one's first, and the
//     same between the page's sections. Each set must be one value within 8 px, within 8 px of the census spacing scale.
//   Thumbnails: size, 44 px hit area, edge contrast against the ground (3:1), the current one marked by aria-current and
//     a 2 px accent edge, and its caption (name · n of m) on one line directly under the row, left-aligned with it.
//   Process steps at 390: a 2 × 2 grid with equal columns wherever they appear.
//   Vocabulary (1440): every link and button on the home, hero included, its colour, underline, arrow, hover change and
//     timing, press and focus ring. Exactly two text-link treatments and one button treatment; accent only on interactive
//     elements and on the ledger's "after" values; one focus ring (2 px accent, 4 px offset). The hero's area tabs
//     (aria-pressed) are their own kind: a hover change, a 150 ms transition, press to 0.97 and the current one's accent top
//     line. Icon-only buttons have no fill, with one named exception (MEDIA_CONTROL below), measured with motion on because
//     it only exists then.
// Reduced motion is emulated so the chapters' scroll settle cannot move what is measured.
import { chromium } from 'playwright-core'
import { writeFileSync } from 'node:fs'

const url = process.argv[2]
const assert = process.argv.includes('--assert')
const jsonOut = process.argv.includes('--json') ? process.argv[process.argv.indexOf('--json') + 1] : null
const SCALE = [0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128]
const WIDTHS = [[1440, 900], [1024, 768], [390, 844]]
// Sections below the hero, in page order, for the rhythm. The vocabulary covers the hero too (.re-intro, its proof links
// in .re-evidence): one hand across the whole home (owner review 2026-11-11).
const SECTIONS = ['.re-prod', '#re-backend', '#re-workflow', '#re-about', '#re-explore', '#re-results', '#re-all', '.re-field-notes', '#re-contact']
const SCOPE = ['.re-intro', '.re-evidence', ...SECTIONS].join(', ')
// The one icon-only control that keeps a round fill: the hero's play/pause. A media control reads as one by its round
// filled button (the shape every player uses); as a bare text-style icon it read as a stray glyph beside the tabs. Owner review
// 2026-11-11: allowed by name, nowhere else.
const MEDIA_CONTROL = 're-fh-pause'
const failed = []
const out = {}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
const ctx = await browser.newContext({ reducedMotion: 'reduce' })

// Shared in-page helpers, installed on every page.
const HELPERS = () => {
  const vis = (el) => {
    const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return false
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const s = getComputedStyle(e); if (s.visibility === 'hidden' || s.display === 'none' || +s.opacity < 0.05) return false }
    return true
  }
  const ownText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
  // Painted boxes: words, standalone images, the slabs and their table, the thumbnails, the ledger's rows and bars.
  const painted = (root) => [...root.querySelectorAll('*')].filter((el) => {
    if (el.closest('.re-sw-reflection, .re-sr, dialog')) return false
    if (el.matches('.re-sw-slab, .re-sw-floor, .re-sw-thumb, .re-row, .re-meter-track, .re-backend-shot, svg')) return vis(el)
    if (el.closest('.re-sw-screen, .re-sw-thumb, svg')) return false
    if (el.tagName === 'IMG') return vis(el)
    return ownText(el) && vis(el)
  }).map((el) => el.getBoundingClientRect())
  const ink = (root) => { const rs = painted(root); return rs.length ? { top: Math.min(...rs.map((r) => r.top)) + scrollY, bottom: Math.max(...rs.map((r) => r.bottom)) + scrollY } : null }
  const rgb = (c) => (c.match(/[\d.]+/g) || []).map(Number)
  const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b) }
  const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05) }
  const opacityChain = (el) => { let o = 1; for (let e = el; e && e.nodeType === 1; e = e.parentElement) o *= +getComputedStyle(e).opacity; return o }
  window.__rh = { vis, ownText, painted, ink, rgb, contrast, opacityChain }
}

for (const [w, h] of WIDTHS) {
  const page = await ctx.newPage({ viewport: { width: w, height: h } })
  await page.setViewportSize({ width: w, height: h })
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(HELPERS)
  const r = await page.evaluate(({ SECTIONS }) => {
    const { ink, vis, rgb, contrast, opacityChain } = window.__rh
    const round = (v) => Math.round(v)
    const chapters = [...document.querySelectorAll('.re-sw[id]')].map((el) => ({ id: el.id.replace('work-', ''), ...ink(el) }))
    const chapterGaps = chapters.slice(1).map((c, i) => ({ pair: `${chapters[i].id}→${c.id}`, gap: round(c.top - chapters[i].bottom) }))
    const secs = SECTIONS.map((s) => { const el = document.querySelector(s); return el && { s, ...ink(el) } }).filter((x) => x && x.top != null)
    const sectionGaps = secs.slice(1).map((c, i) => ({ pair: `${secs[i].s}→${c.s}`, gap: round(c.top - secs[i].bottom) }))
    const ev = document.querySelector('.re-evidence'), prod = document.querySelector('.re-prod')
    const heroGap = ev && prod ? round(ink(prod).top - ink(ev).bottom) : null

    // Thumbnails and their caption.
    const ground = rgb('rgb(5, 5, 8)')
    const accent = rgb(getComputedStyle(document.querySelector('.re-root')).getPropertyValue('--re-accent').trim().replace(/^#(..)(..)(..)$/, (_, a, b, c) => `rgb(${parseInt(a, 16)},${parseInt(b, 16)},${parseInt(c, 16)})`))
    const thumbs = [...document.querySelectorAll('.re-sw-thumbs')].map((g) => {
      const btns = [...g.querySelectorAll('button')]
      const items = btns.map((b) => {
        const t = b.querySelector('.re-sw-thumb'), tr = t.getBoundingClientRect(), br = b.getBoundingClientRect()
        // The edge: box-shadow spread or outline/border on the thumbnail, composited at the button's opacity over the ground.
        const s = getComputedStyle(t); const sh = s.boxShadow.match(/rgba?\([^)]+\)[^,]*?(\d+(?:\.\d+)?)px(?:,|$)/)
        let edge = null, edgeW = 0
        const m = s.boxShadow.match(/(rgba?\([^)]+\))\s+0px\s+0px\s+0px\s+([\d.]+)px/)
        if (m) { edge = rgb(m[1]); edgeW = +m[2] }
        else if (parseFloat(s.outlineWidth) > 0 && s.outlineStyle !== 'none') { edge = rgb(s.outlineColor); edgeW = parseFloat(s.outlineWidth) }
        let edgeC = 0
        if (edge) { const a = (edge[3] ?? 1) * opacityChain(t); const c = [0, 1, 2].map((i) => edge[i] * a + ground[i] * (1 - a)); edgeC = Math.round(contrast(c, ground) * 100) / 100 }
        const current = b.getAttribute('aria-current') === 'true'
        const accentEdge = !!edge && [0, 1, 2].every((i) => Math.abs(edge[i] - accent[i]) < 3) && edgeW >= 2
        return { w: Math.round(tr.width * 10) / 10, h: Math.round(tr.height * 10) / 10, hitW: round(br.width), hitH: round(br.height), edgeC, edgeW, current, accentEdge, sh: !!sh }
      })
      const row = g.querySelector('.re-sw-thumb-row').getBoundingClientRect()
      const cap = g.querySelector('.re-sw-screen-label'), cr = cap?.getBoundingClientRect()
      const lh = cap ? parseFloat(getComputedStyle(cap).lineHeight) : 0
      const counter = cap?.querySelector('span')?.getBoundingClientRect()
      return {
        chapter: g.closest('.re-sw').id.replace('work-', ''), items,
        caption: cap && { text: cap.textContent.trim(), dx: round(cr.left - row.left), dy: round(cr.top - row.bottom), lines: Math.round(cr.height / lh), sameLine: counter ? Math.abs(counter.top - cr.top) < lh / 2 : false },
      }
    })
    // Any other caption in a chapter with thumbnails, outside the thumbnail group.
    const strayCaps = [...document.querySelectorAll('.re-sw')].filter((c) => c.querySelector('.re-sw-thumbs')).flatMap((c) => [...c.querySelectorAll('.re-sw-cap')].filter(vis).map((p) => ({ chapter: c.id, text: p.textContent.trim(), inGroup: !!p.closest('.re-sw-thumbs') })))
    // Process steps: columns per list and the widths of its items.
    const steps = [...document.querySelectorAll('.re-sw-process, .re-workflow ol')].filter(vis).map((ol) => {
      const lis = [...ol.children].map((li) => li.getBoundingClientRect())
      const lefts = [...new Set(lis.map((r) => round(r.left)))], widths = lis.map((r) => round(r.width))
      return { list: ol.className || 'workflow', cols: lefts.length, rows: new Set(lis.map((r) => round(r.top))).size, widths, overflow: ol.scrollWidth > ol.clientWidth + 1 || lis.some((r) => r.right > innerWidth) }
    })
    const sideways = document.documentElement.scrollWidth > innerWidth
    return { chapterGaps, sectionGaps, heroGap, thumbs, strayCaps, steps, sideways }
  }, { SECTIONS })
  out[w] = r

  const near = (v) => SCALE.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a))
  const one = (gaps, what) => {
    const vs = gaps.map((g) => g.gap); if (!vs.length) return
    const spread = Math.max(...vs) - Math.min(...vs), mid = (Math.max(...vs) + Math.min(...vs)) / 2
    if (spread > 8) failed.push(`${w}: ${what} gaps spread ${spread} px > 8 (${vs.join(', ')})`)
    if (Math.abs(near(mid) - mid) > 8) failed.push(`${w}: ${what} gap ${mid} px is not within 8 px of the scale (nearest ${near(mid)})`)
    r[`${what}Gap`] = { min: Math.min(...vs), max: Math.max(...vs), spread, scale: near(mid) }
  }
  one(r.chapterGaps, 'chapter'); one(r.sectionGaps, 'section')
  const minW = w >= 1024 ? 72 : 56
  for (const g of r.thumbs) {
    g.items.forEach((t, i) => {
      if (t.w < minW) failed.push(`${w}: ${g.chapter} thumb ${i + 1} ${t.w} px wide < ${minW}`)
      if (t.hitW < 44 || t.hitH < 44) failed.push(`${w}: ${g.chapter} thumb ${i + 1} hit ${t.hitW}×${t.hitH} < 44`)
      if (t.edgeC < 3) failed.push(`${w}: ${g.chapter} thumb ${i + 1} edge ${t.edgeC}:1 < 3:1`)
      if (t.current !== t.accentEdge) failed.push(`${w}: ${g.chapter} thumb ${i + 1} current ${t.current} but 2 px accent edge ${t.accentEdge}`)
    })
    if (g.items.filter((t) => t.current).length !== 1) failed.push(`${w}: ${g.chapter} has ${g.items.filter((t) => t.current).length} thumbs with aria-current`)
    const c = g.caption
    if (!c || !c.sameLine || c.lines !== 1 || Math.abs(c.dx) > 2 || c.dy < 0 || c.dy > 16) failed.push(`${w}: ${g.chapter} caption not one line under the row, left-aligned (${JSON.stringify(c)})`)
  }
  for (const s of r.strayCaps.filter((s) => !s.inGroup)) failed.push(`${w}: ${s.chapter} has a second caption "${s.text}" away from its thumbnails`)
  if (w === 390) for (const s of r.steps) {
    if (s.cols !== 2 || s.rows !== 2 || Math.max(...s.widths) - Math.min(...s.widths) > 1) failed.push(`390: steps ${s.list} not a 2×2 grid of equal columns (${s.cols} cols, ${s.rows} rows, widths ${s.widths})`)
  }
  for (const s of r.steps) if (s.overflow) failed.push(`${w}: steps ${s.list} overflow`)
  if (r.sideways) failed.push(`${w}: sideways scroll`)
  await page.close()
}

// Vocabulary at 1440: rest, focus, hover and press of every link and button below the hero.
{
  const page = await ctx.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(HELPERS)
  const els = await page.evaluate(({ SCOPE }) => {
    const { vis, rgb } = window.__rh
    const root = document.querySelector('.re-root')
    const hex = getComputedStyle(root).getPropertyValue('--re-accent').trim()
    const accent = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
    const isAccent = (c) => { const v = rgb(c); return v.length >= 3 && (v[3] ?? 1) > 0.05 && [0, 1, 2].every((i) => Math.abs(v[i] - accent[i]) < 3) }
    const role = (c) => {
      if (isAccent(c)) return 'accent'
      for (const t of ['--re-fg', '--re-fg-2', '--re-dim']) { const d = document.createElement('i'); d.style.color = `var(${t})`; root.append(d); const v = getComputedStyle(d).color; d.remove(); if (v === c) return t.slice(5) }
      return c
    }
    const list = [...document.querySelectorAll(`:is(${SCOPE}) :is(a, button, summary)`)].filter((el) => vis(el) && !el.closest('dialog'))
    const accentStray = []
    for (const el of document.querySelectorAll(`:is(${SCOPE}) *`)) {
      // Not counted: controls, the ledger's "after" values (data), and a screen's loading placeholder ([data-wait], the dot field).
      if (!vis(el) || el.closest('a, button, summary, label, dialog, .re-meter[data-kind="after"], [data-wait], [aria-hidden="true"]:not(.re-sw-process)')) continue
      const s = getComputedStyle(el)
      const hits = []
      if (window.__rh.ownText(el) && isAccent(s.color)) hits.push('color')
      if (isAccent(s.backgroundColor)) hits.push('background')
      if (s.backgroundImage.includes(`${accent[0]}, ${accent[1]}, ${accent[2]}`)) hits.push('background-image')
      for (const p of ['::before', '::after']) { const ps = getComputedStyle(el, p); if (ps.content !== 'none' && (isAccent(ps.backgroundColor) || ps.backgroundImage.includes(`${accent[0]}, ${accent[1]}, ${accent[2]}`) || isAccent(ps.color))) hits.push(p) }
      if (hits.length) accentStray.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} "${el.textContent.trim().slice(0, 32)}" ${hits.join('+')}`)
    }
    return {
      accentStray,
      items: list.map((el, i) => {
        el.dataset.rhId = i
        const s = getComputedStyle(el), r = el.getBoundingClientRect(), pb = getComputedStyle(el, '::before')
        // A hit area may reach past the words through an absolutely placed ::before (the index's names do).
        const grow = pb.content !== 'none' && pb.position === 'absolute' ? Math.max(0, -parseFloat(pb.top) - parseFloat(pb.bottom)) : 0
        const text = [...el.childNodes].filter((n) => n.nodeType === 3 || (n.nodeType === 1 && !n.matches('.re-sr, svg') && vis(n))).map((n) => n.textContent).join('').trim()
        const svg = el.querySelector('svg')
        return {
          id: i, tag: el.tagName.toLowerCase(), cls: String(el.className).split(' ')[0], text: text.slice(0, 40),
          kind: el.matches('button[aria-pressed]') ? 'tab' : !text ? 'control' : el.tagName === 'A' ? 'link' : 'button',
          edge: role(s.borderTopColor), pressed: el.getAttribute('aria-pressed') === 'true',
          color: role(s.color), underline: s.textDecorationLine.includes('underline') && rgb(s.textDecorationColor)[3] !== 0 ? role(s.textDecorationColor) : 'none',
          arrow: svg ? role(getComputedStyle(svg).color) : 'none', size: parseFloat(s.fontSize), weight: s.fontWeight,
          fill: rgb(s.backgroundColor)[3] === 0 || s.backgroundColor === 'rgba(0, 0, 0, 0)' ? 'none' : s.backgroundColor, radius: s.borderRadius,
          w: Math.round(r.width), h: Math.round(r.height + grow),
          // A tab's hover is its top-line layer (::after), so the timing is that layer's.
          trans: el.matches('button[aria-pressed]') ? getComputedStyle(el, '::after').transitionProperty + ' ' + getComputedStyle(el, '::after').transitionDuration : s.transitionProperty + ' ' + s.transitionDuration,
        }
      }),
    }
  }, { SCOPE })
  // Focus: keyboard modality first, then each element in turn.
  await page.keyboard.press('Shift')
  for (const it of els.items) {
    it.focus = await page.evaluate((id) => {
      const el = document.querySelector(`[data-rh-id="${id}"]`); el.focus({ preventScroll: true })
      const s = getComputedStyle(el)
      const hex = getComputedStyle(document.querySelector('.re-root')).getPropertyValue('--re-accent').trim()
      const acc = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ')
      return `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor.includes(acc) ? 'accent' : s.outlineColor} ${s.outlineOffset}`
    }, it.id)
  }
  await page.evaluate(() => document.activeElement?.blur())
  // Hover and press: what changes, and the transition timing of the changed property.
  for (const it of els.items) {
    const loc = page.locator(`[data-rh-id="${it.id}"]`)
    await loc.evaluate((el) => el.scrollIntoView({ block: 'center' }))
    const read = () => loc.evaluate((el) => {
      const pick = (e) => { const s = getComputedStyle(e); return { color: s.color, deco: s.textDecorationLine + ' ' + s.textDecorationColor, bg: s.backgroundColor, border: s.borderTopColor, transform: s.transform } }
      const kids = [...el.querySelectorAll('*')].filter((k) => !k.matches('.re-sr'))
      return { self: { ...pick(el), after: getComputedStyle(el, '::after').opacity }, kids: kids.map((k) => pick(k).transform) }
    })
    await page.mouse.move(2, 450)
    await page.waitForTimeout(260)
    const rest = await read()
    const box = await loc.boundingBox()
    if (!box) continue
    await page.mouse.move(box.x + Math.min(box.width / 2, 40), box.y + box.height / 2)
    await page.waitForTimeout(260)
    const hov = await read()
    it.hover = ['color', 'deco', 'bg', 'border', 'after'].filter((k) => hov.self[k] !== rest.self[k]).join('+') || 'none'
    await page.mouse.down()
    await page.waitForTimeout(260)
    const prs = await read()
    const scales = [prs.self.transform, ...prs.kids].filter((t) => t && t !== 'none').map((t) => +(t.match(/matrix\(([\d.]+)/)?.[1] ?? 1))
    it.press = scales.find((s) => s < 0.999) ?? 1
    await page.mouse.move(2, 450)
    await page.mouse.up()
  }
  await page.close()
  // A treatment is colour, underline and arrow colour at rest (size follows the context); buttons add their fill.
  const sig = (it) => it.kind === 'link' ? `link ${it.color} underline:${it.underline} arrow:${it.arrow === 'none' ? '-' : it.arrow}` : `button ${it.color} underline:${it.underline} fill:${it.fill}`
  const groups = {}
  for (const it of els.items) if (it.kind === 'link' || it.kind === 'button') (groups[sig(it)] ??= []).push(it.text)
  const linkT = Object.keys(groups).filter((k) => k.startsWith('link')), btnT = Object.keys(groups).filter((k) => k.startsWith('button'))
  // An arrow is optional in the secondary treatment (↗ marks a new tab); the primary is the accent one and must carry one.
  const linkFamilies = new Set(linkT.map((k) => k.replace(/ arrow:\S+/, '')))
  out.vocabulary = { treatments: groups, accentStray: els.accentStray, items: els.items }
  if (linkFamilies.size !== 2) failed.push(`vocabulary: ${linkFamilies.size} text-link treatments (want 2): ${[...linkFamilies].join(' | ')}`)
  if (btnT.length !== 1) failed.push(`vocabulary: ${btnT.length} button treatments (want 1): ${btnT.join(' | ')}`)
  for (const it of els.items) {
    const where = `${it.kind} "${it.text || it.cls}"`
    if (it.kind === 'link' && it.color === 'accent' && it.arrow === 'none') failed.push(`vocabulary: primary ${where} has no arrow`)
    if (it.kind === 'link' && it.color !== 'accent' && it.underline === 'none') failed.push(`vocabulary: ${where} is neither accent nor underlined`)
    if (it.focus !== 'solid 2px accent 4px') failed.push(`vocabulary: ${where} focus ring "${it.focus}"`)
    // The current tab is already marked; hovering it changes nothing on purpose.
    if (it.kind !== 'control' && !it.pressed && it.hover === 'none') failed.push(`vocabulary: ${where} has no hover change`)
    if (it.kind !== 'control' && !it.pressed && !/0\.15s/.test(it.trans)) failed.push(`vocabulary: ${where} hover is not a 150 ms transition [${it.trans}]`)
    // The button look has no colour or underline of its own, so an icon is what says it can be pressed (2026-11-11).
    if (it.kind === 'button' && it.arrow === 'none') failed.push(`vocabulary: ${where} has no icon`)
    if ((it.kind === 'button' || it.kind === 'tab') && Math.abs(it.press - 0.97) > 0.005) failed.push(`vocabulary: ${where} presses to ${it.press}, not 0.97`)
    if (it.kind === 'control' && it.tag === 'button' && it.fill !== 'none') failed.push(`vocabulary: icon-only ${where} has a fill (${it.fill})`)
    if (it.h < 44 || it.w < 24) failed.push(`vocabulary: ${where} target ${it.w}×${it.h}`)
  }
  const tabs = els.items.filter((it) => it.kind === 'tab')
  if (tabs.length && tabs.filter((it) => it.edge === 'accent').length !== 1) failed.push(`vocabulary: ${tabs.filter((it) => it.edge === 'accent').length} tabs carry the accent top line (want the current one)`)
  for (const s of els.accentStray) failed.push(`vocabulary: accent on a non-interactive element: ${s}`)
}

// The media control, with motion on (under reduced motion the screens do not turn, so it is not rendered).
{
  const mctx = await browser.newContext({ reducedMotion: 'no-preference', viewport: { width: 1440, height: 900 } })
  const page = await mctx.newPage()
  await page.goto(url, { waitUntil: 'networkidle' })
  const sel = `.${MEDIA_CONTROL}`
  if (!(await page.locator(sel).count())) failed.push(`media control: ${sel} not found with motion on`)
  else {
    await page.keyboard.press('Shift')
    const m = await page.evaluate((sel) => {
      const el = document.querySelector(sel); el.focus({ preventScroll: true })
      const s = getComputedStyle(el), r = el.getBoundingClientRect()
      const hex = getComputedStyle(document.querySelector('.re-root')).getPropertyValue('--re-accent').trim()
      const acc = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ')
      return { w: Math.round(r.width), h: Math.round(r.height), label: el.getAttribute('aria-label'), icon: !!el.querySelector('svg'), fill: s.backgroundColor, radius: s.borderRadius,
        focus: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor.includes(acc) ? 'accent' : s.outlineColor} ${s.outlineOffset}` }
    }, sel)
    await page.evaluate(() => document.activeElement?.blur())
    const box = await page.locator(sel).boundingBox()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down(); await page.waitForTimeout(260)
    m.press = await page.locator(sel).evaluate((el) => +(getComputedStyle(el).transform.match(/matrix\(([\d.]+)/)?.[1] ?? 1))
    await page.mouse.move(2, 450); await page.mouse.up()
    out.mediaControl = m
    if (m.focus !== 'solid 2px accent 4px') failed.push(`media control: focus ring "${m.focus}"`)
    if (m.w < 44 || m.h < 44) failed.push(`media control: target ${m.w}×${m.h}`)
    if (!m.label || !m.icon) failed.push('media control: needs an aria-label and an icon')
    if (parseFloat(m.radius) < 22) failed.push(`media control: radius ${m.radius} while focused (round: at least half its 44 px)`)
    if (Math.abs(m.press - 0.97) > 0.005) failed.push(`media control: presses to ${m.press}, not 0.97`)
  }
  await mctx.close()
}
await browser.close()

// Tables first, then the verdict.
for (const [w] of WIDTHS) {
  const r = out[w]
  console.log(`\n${w}  chapters: ${r.chapterGaps.map((g) => `${g.pair} ${g.gap}`).join(' · ')}`)
  console.log(`${w}  sections: ${r.sectionGaps.map((g) => `${g.pair} ${g.gap}`).join(' · ')}   (hero→work ${r.heroGap}, reported only)`)
  for (const g of r.thumbs) console.log(`${w}  thumbs ${g.chapter}: ${g.items.map((t) => `${t.w}×${t.h} hit ${t.hitW}×${t.hitH} edge ${t.edgeC}${t.current ? ' current' : ''}${t.accentEdge ? ' accent' : ''}`).join(' | ')}  caption ${JSON.stringify(g.caption)}`)
  if (r.strayCaps.length) console.log(`${w}  captions: ${JSON.stringify(r.strayCaps)}`)
  console.log(`${w}  steps: ${r.steps.map((s) => `${s.list} ${s.cols}×${s.rows} [${s.widths}]`).join(' · ')}`)
}
console.log('\nTreatments (1440):')
for (const [k, v] of Object.entries(out.vocabulary.treatments)) console.log(`  ${k}  ×${v.length}: ${v.slice(0, 6).join(', ')}${v.length > 6 ? ', …' : ''}`)
console.log('Items:')
for (const it of out.vocabulary.items) console.log(`  ${it.kind.padEnd(7)} ${(it.text || it.cls).padEnd(40)} ${it.color} u:${it.underline} arrow:${it.arrow} ${it.size}px/${it.weight} fill:${it.fill} r:${it.radius} ${it.w}×${it.h} hover:${it.hover} press:${it.press} focus:${it.focus} [${it.trans}]`)
if (out.mediaControl) console.log(`Media control (${MEDIA_CONTROL}, named exception): ${JSON.stringify(out.mediaControl)}`)
if (out.vocabulary.accentStray.length) console.log('Accent, not interactive:\n  ' + out.vocabulary.accentStray.join('\n  '))
if (jsonOut) writeFileSync(jsonOut, JSON.stringify(out, null, 1))
console.log(failed.length ? `\nFAIL (${failed.length})\n${failed.join('\n')}` : '\nPASS')
if (assert) process.exit(failed.length ? 1 : 0)
