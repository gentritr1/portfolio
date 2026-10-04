// Builds a hash-routed copy of the site in dist-artifact/ with relative asset paths,
// for hosting under an unknown path (a published artifact).
import { execSync } from 'node:child_process'
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { join, relative, dirname, extname } from 'node:path'

const out = 'dist-artifact'
execSync(`npx vite build --base=./ --outDir ${out} --emptyOutDir`, { stdio: 'inherit', env: { ...process.env, VITE_ROUTER: 'hash' } })

const roots = readdirSync(out).filter((name) => name !== 'assets' && name !== 'index.html')
const pattern = new RegExp(`(["'\`(])/(${roots.map((r) => r.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(?=[/"'\`)?#])`, 'g')
let changed = 0
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) { walk(path); continue }
    if (!['.js', '.css', '.html'].includes(extname(name))) continue
    const prefix = extname(name) === '.css' ? relative(dirname(path), out) || '.' : '.'
    const before = readFileSync(path, 'utf8')
    const after = before.replace(pattern, (_, quote, root) => `${quote}${prefix}/${root}`)
    if (after !== before) { writeFileSync(path, after); changed += 1 }
  }
}
walk(out)
console.log(`rewrote site-absolute asset paths in ${changed} files`)
