// Quality loop for /drafts/refractive-engine: motion probes, frame timing, mobile audit, keyboard pass and screenshots.
// Usage (dev server on :5175): node design/quality/refractive/loop.mjs
// Each run writes runs/<stamp>/ (screenshots, results.json) and prints PASS/FAIL per check; it exits 1 on any FAIL.
// report.py then measures idle pixel change and builds a strip against the previous run.
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
const out = join(here, 'runs', stamp)
mkdirSync(out, { recursive: true })

const CASES = ['bayyinah-tv', 'read-to-feed', 'care-platform', 'design-system-react', 'viva-fresh', 'incentiv', 'dukagjini-bookstore', 'futurisma']
const CHAPTERS = ['bayyinah', 'reading', 'care', 'system', 'viva']
const go = (path) => `(async()=>{history.pushState(null,'','/drafts/refractive-engine${path}');dispatchEvent(new PopStateEvent('popstate'));for(let i=0;i<80&&!document.querySelector(${JSON.stringify(path ? '.re-cs-landing' : '.re-sw')});i++)await new Promise(r=>setTimeout(r,50));await new Promise(r=>setTimeout(r,500));scrollTo({top:0,behavior:'instant'});return 'at '+location.pathname})()`
const tag = (name, js) => ({ eval: `(async()=>JSON.stringify({check:${JSON.stringify(name)},value:await (${js})}))()` })

// Settle: sample the main screen's transform as its top moves from 100% to 55% of the viewport.
const settle = `(async()=>{const c=document.querySelector('.re-sw-care');const lead=c.querySelector('.re-sw-lead');const slabs=c.querySelector('.re-sw-slabs');const out=[];for(const f of [1,.95,.9,.85,.8,.75,.7,.66,.63,.61,.605,.6,.55]){scrollTo({top:lead.getBoundingClientRect().top+scrollY-innerHeight*f,behavior:'instant'});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const t=slabs.style.transform;out.push({f,ty:+(t.match(/translateY\\(([-\\d.]+)px\\)/)||[0,0])[1],rx:+(t.match(/rotateX\\(([-\\d.]+)deg\\)/)||[0,0])[1],op:slabs.style.opacity||'1'})}return out})()`
// Frame timing over a wheel-driven scroll, and over "Read the case".
const framesStart = `(()=>{window.__f=[];const t0=performance.now();const tick=()=>{window.__f.push(performance.now());if(performance.now()-t0<1500)requestAnimationFrame(tick)};requestAnimationFrame(tick);return 1})()`
const framesEnd = `(()=>{const d=window.__f,g=[];for(let i=1;i<d.length;i++)g.push(d[i]-d[i-1]);g.sort((a,b)=>a-b);return {frames:d.length,expected:Math.round((d[d.length-1]-d[0])/16.67)+1,p95:+g[Math.floor(g.length*.95)].toFixed(1),worst:Math.round(g[g.length-1])}})()`
const caseLanded = `(()=>{const h=document.querySelector('.re-cs-hero').getBoundingClientRect();return {landedW:Math.round(h.width),originW:window.__originW,names:document.querySelectorAll('[style*=view-transition-name]').length}})()`
// Mobile audit: horizontal overflow (outside screenshots and outside deliberate sideways scrollers, which hold their
// overflow), small tap targets, small text.
const audit = `(()=>{const W=innerWidth;const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0};const inScroller=e=>{for(let p=e.parentElement;p&&p!==document.body;p=p.parentElement){const o=getComputedStyle(p).overflowX;if(o==='auto'||o==='scroll')return true}return false};const over=[...document.querySelectorAll('.re-root *')].filter(e=>vis(e)&&e.getBoundingClientRect().right>W+1&&!e.closest('.re-sw-screen,.re-canvas,.re-sw-stage')&&!inScroller(e)).length;const small=[...document.querySelectorAll('.re-root :is(a,button,summary)')].filter(e=>{const r=e.getBoundingClientRect();return vis(e)&&(r.height<44||r.width<44)}).map(e=>e.className||e.tagName).slice(0,12);const tiny=[...document.querySelectorAll('.re-root :is(p,span,li,a,button,dd,dt,small,strong,b)')].filter(e=>vis(e)&&e.childNodes.length&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&!e.closest('.re-sw-screen,.re-tune')&&parseFloat(getComputedStyle(e).fontSize)<14).length;return {scrollW:document.documentElement.scrollWidth,W,overflowing:over,smallTargets:small.length,smallTargetSample:small,textUnder14:tiny}})()`
// Keyboard pass: one Tab at a time; record what has focus and whether its focus is visible (on it, or on a parent up to
// two levels, for rows that draw the ring around their button).
const focusNow = `(()=>{const e=document.activeElement;if(!e||e===document.body)return {stuck:'body'};const cs=getComputedStyle(e);const r=e.getBoundingClientRect();const has=x=>{const c=getComputedStyle(x);return (c.outlineStyle!=='none'&&parseFloat(c.outlineWidth)>0)||c.boxShadow!=='none'};const ring=has(e)||(!!e.parentElement&&has(e.parentElement))||(!!e.parentElement?.parentElement&&has(e.parentElement.parentElement));return {el:(e.className||e.tagName).toString().split(' ')[0]+':'+(e.textContent||'').trim().slice(0,24),visible:ring,onScreen:r.bottom>0&&r.top<innerHeight&&r.width>0}})()`

const desktop = [
  { eval: go('') }, { wait: 4000 }, { shot: 'idle-a' }, { wait: 1000 }, { shot: 'idle-b' },
  tag('settle', settle),
  { scrollTo: '.re-sw-bayyinah', offset: -400 }, { wait: 300 }, { eval: framesStart }, { wheel: 220, ticks: 30 }, { wait: 1200 }, tag('scrollFrames', framesEnd),
  ...CHAPTERS.flatMap((c) => [{ scrollTo: `.re-sw-${c}` }, { wait: 500 }, { shot: `d-chapter-${c}` }]),
  { scrollTo: '.re-sw-bayyinah', offset: 120 }, { wait: 700 },
  { eval: `(window.__originW=Math.round(document.querySelector('.re-sw-bayyinah .re-sw-lead').getBoundingClientRect().width),1)` },
  { eval: framesStart }, { tap: '.re-sw-bayyinah .re-prod-case' }, { wait: 1600 }, tag('caseFrames', framesEnd), tag('caseLanded', caseLanded),
  ...['bayyinah-tv', 'read-to-feed', 'care-platform'].flatMap((s) => [{ eval: go('/' + s) }, { shot: `d-case-${s}` }]),
  { eval: go('') }, { wait: 800 }, { eval: '(scrollTo({top:0,behavior:"instant"}),document.activeElement.blur(),1)' },
  ...Array.from({ length: 60 }, (_, i) => [{ key: 'Tab' }, tag(`tab${i}`, focusNow)]).flat(),
]
const phone = (w, h) => [
  { eval: go('') }, tag(`audit-home-${w}`, audit),
  ...CASES.flatMap((s) => [{ eval: go('/' + s) }, tag(`audit-${s}-${w}`, audit)]),
  ...(w === 390 ? [{ eval: go('') }, ...CHAPTERS.flatMap((c) => [{ scrollTo: `.re-sw-${c}`, offset: -56 }, { wait: 400 }, { shot: `p-chapter-${c}` }]), { eval: go('/bayyinah-tv') }, { shot: 'p-case-bayyinah-tv' }] : []),
]
const plans = [
  { name: 'desktop', w: 1440, h: 900, dpr: 1, steps: desktop },
  { name: 'reduced', w: 1440, h: 900, dpr: 1, reduced: true, steps: [tag('reducedSettle', settle)] },
  ...[[360, 800], [375, 667], [390, 844]].map(([w, h]) => ({ name: `phone${w}`, w, h, mobile: true, steps: phone(w, h) })),
]
writeFileSync(join(out, 'plan.json'), JSON.stringify(plans))
const log = execFileSync('node', [join(here, 'cap.mjs'), out, join(out, 'plan.json')], { encoding: 'utf8', maxBuffer: 1 << 26 })
const results = {}
for (const line of log.split('\n')) {
  const m = line.match(/^\S+ "(\{.*\})"$/)
  if (m) { const r = JSON.parse(JSON.parse(`"${m[1]}"`)); results[r.check] = r.value }
}
results.consoleErrors = log.includes('no console errors') ? [] : log.split('no console errors')[0].split('\n').filter((l) => /^(EXC|error)/.test(l))
writeFileSync(join(out, 'results.json'), JSON.stringify(results, null, 2))

// Checks: each is [name, pass, detail].
const checks = []
const s = results.settle ?? []
const moving = s.filter((x) => x.ty > 0)
const last = moving[moving.length - 1]
checks.push(['settle lands softly (last step ≤ 0.5 px, ≤ 0.2°)', !!last && last.ty <= 0.5 && last.rx <= 0.2, last && `last ${last.ty} px, ${last.rx}°`])
checks.push(['settle never fades the screens', s.every((x) => x.op === '1'), s.map((x) => x.op).join(',')])
checks.push(['reduced motion: no settle', (results.reducedSettle ?? []).every((x) => x.ty === 0 && x.rx === 0), ''])
const sf = results.scrollFrames
// Jank is a dropped frame or one longer than two refreshes. p95 of the frame interval is reported, not gated: with every
// frame delivered it moved 20.1 → 21.3 ms between runs as host load rose 7 → 12, i.e. timer jitter (2026-10-28).
checks.push(['wheel scroll frames (none dropped beyond 5%, worst ≤ 34 ms)', !!sf && sf.worst <= 34 && sf.frames >= sf.expected * 0.95, sf && `${sf.frames}/${sf.expected}, p95 ${sf.p95}, worst ${sf.worst}`])
const cf = results.caseFrames
checks.push(['Read the case worst frame ≤ 100 ms (target 50)', !!cf && cf.worst <= 100, cf && `${cf.frames}/${cf.expected}, worst ${cf.worst} ms`])
const cl = results.caseLanded
checks.push(['case lands at the clicked width (±2%)', !!cl && Math.abs(cl.landedW - cl.originW) <= cl.originW * 0.02 && cl.names === 0, cl && `${cl.originW} → ${cl.landedW}, leftover names ${cl.names}`])
for (const [k, v] of Object.entries(results).filter(([k]) => k.startsWith('audit-'))) {
  checks.push([`${k}: no overflow`, v.scrollW === v.W && v.overflowing === 0, `scrollW ${v.scrollW}/${v.W}, overflowing ${v.overflowing}`])
}
const audits = Object.values(results).filter((v) => v && typeof v === 'object' && 'smallTargets' in v)
checks.push(['phone: small tap targets (report)', true, `max ${Math.max(...audits.map((a) => a.smallTargets))} per page; e.g. ${audits.find((a) => a.smallTargets)?.smallTargetSample.slice(0, 4).join(', ') ?? 'none'}`])
checks.push(['phone: text under 14 px (report)', true, `max ${Math.max(...audits.map((a) => a.textUnder14))} elements per page`])
const tabs = Object.entries(results).filter(([k]) => k.startsWith('tab')).map(([, v]) => v)
const stuck = tabs.filter((t) => t.stuck), hidden = tabs.filter((t) => !t.stuck && (!t.visible || !t.onScreen))
checks.push(['keyboard: focus never lost to <body>', stuck.length === 0, `${stuck.length} of ${tabs.length} tabs`])
checks.push(['keyboard: focus visible and on screen', hidden.length === 0, hidden.slice(0, 6).map((t) => t.el + (t.visible ? '' : ' (no ring)') + (t.onScreen ? '' : ' (off-screen)')).join('; ')])
checks.push(['no console errors', results.consoleErrors.length === 0, results.consoleErrors.slice(0, 3).join(' | ')])

let fail = 0
for (const [name, pass, detail] of checks) { if (!pass) fail++; console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`) }
const runs = readdirSync(join(here, 'runs')).sort()
console.log(`\nrun: ${out}\nprevious: ${runs.length > 1 ? join(here, 'runs', runs[runs.length - 2]) : 'none'}`)
console.log(`then: python3 ${join(here, 'report.py')} ${out}`)
process.exit(fail ? 1 : 0)
