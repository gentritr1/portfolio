import { Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { useSearchParams } from 'react-router'
import { AnimatePresence, MotionConfig, motion, useInView, useReducedMotion } from 'motion/react'
import { ArrowElbowDownRightIcon, ArrowUpRightIcon, ArrowsInSimpleIcon, ArrowsOutSimpleIcon, DownloadSimpleIcon } from '@phosphor-icons/react'
import { CropShot } from '../../components/CropShot'
import { recreations } from '../../lib/recreations'
import { links } from '../../content/links'
import {
  arrange,
  bySlug,
  pick,
  platformFocus,
  platforms,
  propRows,
  variants,
  type Canvas,
  type Example,
  type Variant,
} from './data'
import './specimen.css'

const easeOut = [0.23, 1, 0.32, 1] as const
const swap = { duration: 0.2, ease: easeOut }
const reflow = { type: 'spring', duration: 0.42, bounce: 0 } as const

const isVariant = (value: string | null): value is Variant => variants.some((v) => v.id === value)

/** Cross-fades a value when it changes. Unchanged values do not animate. */
function Swap({ value, className }: { value: string; className?: string }) {
  return (
    <span className={`sp-swap ${className ?? ''}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ opacity: 0, filter: 'blur(2px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, filter: 'blur(2px)', transition: { duration: 0.12 } }}
          transition={swap}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function VariantSwitch({ id, variant, onChange }: { id: string; variant: Variant; onChange: (v: Variant) => void }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const onKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0
    if (!step) return
    event.preventDefault()
    const next = (index + step + variants.length) % variants.length
    onChange(variants[next].id)
    refs.current[next]?.focus()
  }
  return (
    <div className="sp-variants">
      <span className="sp-variants-label" id={`${id}-label`}>
        Variant
      </span>
      <div className="sp-segment" role="radiogroup" aria-labelledby={`${id}-label`}>
        {variants.map((v, index) => {
          const on = v.id === variant
          return (
            <button
              key={v.id}
              ref={(el) => {
                refs.current[index] = el
              }}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on ? 0 : -1}
              className="sp-segment-option"
              onClick={() => onChange(v.id)}
              onKeyDown={(event) => onKey(event, index)}
            >
              {on && <motion.span layoutId={`${id}-mark`} className="sp-segment-mark" transition={reflow} aria-hidden="true" />}
              <span className="sp-segment-text">{v.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ProofLinks({ slugs, onOpen }: { slugs: string[]; onOpen: (slug: string) => void }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={slugs.join()}
        className="sp-proof"
        initial={{ opacity: 0, filter: 'blur(2px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, filter: 'blur(2px)', transition: { duration: 0.12 } }}
        transition={swap}
      >
        <span className="sp-proof-label">
          <ArrowElbowDownRightIcon aria-hidden="true" size={14} weight="bold" />
          <span className="sp-sr">Proven by</span>
        </span>
        {slugs.map((slug) => (
          <a
            key={slug}
            href={`#ex-${slug}`}
            onClick={(event) => {
              event.preventDefault()
              onOpen(slug)
            }}
          >
            {bySlug[slug].short}
          </a>
        ))}
      </motion.span>
    </AnimatePresence>
  )
}

function PropsTable({ variant, onOpen }: { variant: Variant; onOpen: (slug: string) => void }) {
  const focus = platformFocus[variant]
  return (
    <figure className="sp-props" id="props" aria-label="Props">
      <table>
        <thead>
          <tr>
            <th scope="col">Prop</th>
            <th scope="col">Value and proof</th>
          </tr>
        </thead>
        <tbody>
          {propRows.map((row) => {
            const detail = row.detail ? pick(row.detail, variant) : undefined
            return (
              <tr key={row.name}>
                <th scope="row">
                  <code className="sp-prop-name">{row.name}</code>
                  <code className="sp-prop-type">{row.type}</code>
                </th>
                <td>
                  {row.name === 'platforms' ? (
                    <span className="sp-platforms">
                      {platforms.map((p) => (
                        <span key={p.id} className="sp-platform" data-on={focus.includes(p.id)}>
                          {p.label}
                        </span>
                      ))}
                    </span>
                  ) : (
                    <Swap value={pick(row.value, variant)} className="sp-value" />
                  )}
                  {detail && <Swap value={detail} className="sp-detail" />}
                  <ProofLinks slugs={pick(row.proof, variant)} onOpen={onOpen} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </figure>
  )
}

function Stage({ canvas, wide, brief, label }: { canvas: Canvas; wide: boolean; brief: boolean; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const near = useInView(ref, { once: true, margin: '300px 0px' })
  if (canvas.kind === 'screen') {
    const shot = (brief && canvas.brief) || canvas.shot
    return (
      <div className="sp-screen">
        <CropShot shot={shot} className="sp-screen-shot" style={{ maxWidth: shot.crop.w, '--r': shot.crop.w / shot.crop.h } as CSSProperties} />
      </div>
    )
  }
  if (canvas.kind === 'recreation') {
    const rec = recreations[canvas.key]
    const style = { '--a-base': rec.aspect.base, '--a-wide': wide ? rec.aspect.lg : rec.aspect.sm } as CSSProperties
    return (
      <div ref={ref} className="sp-stage @container" data-world={rec.world} style={style} aria-label={`${rec.name}, ${label.toLowerCase()}`} role="group">
        {near ? (
          <Suspense fallback={<span className="sp-stage-wait">Loading the recreation</span>}>
            <rec.Component />
          </Suspense>
        ) : (
          <span className="sp-stage-wait">Loading the recreation</span>
        )}
      </div>
    )
  }
  if (canvas.kind === 'web') {
    return (
      <div className="sp-shots" data-count={canvas.frames.length}>
        {canvas.frames.map((f) => (
          <img key={f.src} src={f.src} alt={f.alt} width={f.width} height={f.height} loading="lazy" decoding="async" />
        ))}
      </div>
    )
  }
  return (
    <div className="sp-phones" data-count={canvas.frames.length}>
      {canvas.frames.map((f) =>
        f.crop ? (
          <div key={f.src} className="sp-crop" style={{ aspectRatio: `${f.crop.w} / ${f.crop.h}`, width: `min(100%, ${f.crop.w / 2}px)` }}>
            <img
              src={f.src}
              alt={f.alt}
              width={f.width}
              height={f.height}
              loading="lazy"
              decoding="async"
              style={{ width: `${(f.width / f.crop.w) * 100}%`, left: `${(-f.crop.x / f.crop.w) * 100}%`, top: `${(-f.crop.y / f.crop.h) * 100}%` }}
            />
          </div>
        ) : (
          <img key={f.src} src={f.src} alt={f.alt} width={f.width} height={f.height} loading="lazy" decoding="async" />
        ),
      )}
    </div>
  )
}

const glide = 'cubic-bezier(0.32, 0.72, 0, 1)'

/**
 * Moves each example from its old box to its new box after a reorder or an
 * expand. Elements are already at their final size; a growing element is
 * clipped to its old size and revealed, so text is never scaled.
 */
function useFlip(reduce: boolean | null) {
  const grid = useRef<HTMLDivElement>(null)
  const before = useRef<Map<string, DOMRect> | null>(null)
  const capture = useCallback(() => {
    const map = new Map<string, DOMRect>()
    grid.current?.querySelectorAll<HTMLElement>(':scope > [id]').forEach((el) => map.set(el.id, el.getBoundingClientRect()))
    before.current = map
  }, [])
  const play = useCallback(() => {
    const old = before.current
    before.current = null
    if (!old || !grid.current) return
    const view = window.innerHeight
    grid.current.querySelectorAll<HTMLElement>(':scope > [id]').forEach((el) => {
      const from = old.get(el.id)
      if (!from) return
      const to = el.getBoundingClientRect()
      const dx = from.left - to.left
      const dy = from.top - to.top
      const grow = { w: Math.max(0, to.width - from.width), h: Math.max(0, to.height - from.height) }
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && grow.w < 1 && grow.h < 1) return
      const seen = (r: { top: number; bottom: number }) => r.bottom > -80 && r.top < view + 80
      if (!seen(from) && !seen(to)) return
      if (reduce) {
        el.animate([{ opacity: 0.4 }, { opacity: 1 }], { duration: 160, easing: 'ease' })
        return
      }
      el.animate(
        [
          { transform: `translate(${dx}px, ${dy}px)`, clipPath: `inset(0 ${grow.w}px ${grow.h}px 0)` },
          { transform: 'translate(0, 0)', clipPath: 'inset(0 0 0 0)' },
        ],
        { duration: 480, easing: glide },
      )
    })
  }, [reduce])
  return { grid, capture, play }
}

/** Column spans on the six-column grid and the two-column grid, so a row never ends with an empty cell. */
function spans(count: number, index: number): [number, number] {
  const wide = count % 3 === 2 && index >= count - 2 ? 3 : count % 3 === 1 && index === count - 1 ? 6 : 2
  const medium = count % 2 === 1 && index === count - 1 ? 2 : 1
  return [count === 2 ? 3 : wide, medium]
}

interface CardProps {
  example: Example
  form: 'hero' | 'card' | 'brief'
  span: [number, number]
  open: boolean
  onToggle: (slug: string) => void
}

function ExampleCard({ example, form, span, open, onToggle }: CardProps) {
  const id = `ex-${example.slug}`
  const wide = form === 'hero' || open
  return (
    <article
      id={id}
      className="sp-ex"
      data-form={form}
      data-open={open}
      style={{ '--span': span[0], '--span-md': span[1] } as CSSProperties}
      aria-labelledby={`${id}-title`}
    >
      <div className="sp-canvas" data-kind={example.canvas.kind}>
        <div className="sp-canvas-inner">
          <Stage
            canvas={open && example.more.canvas ? example.more.canvas : example.canvas}
            wide={wide}
            brief={form === 'brief' && !open}
            label={example.label}
          />
        </div>
      </div>
      <div className="sp-caption">
        <div className="sp-caption-head">
          <h3 id={`${id}-title`}>{example.name}</h3>
          <button
            type="button"
            className="sp-expand"
            aria-expanded={open}
            aria-controls={`${id}-more`}
            data-toggle={example.slug}
            onClick={() => onToggle(example.slug)}
          >
            {open ? <ArrowsInSimpleIcon aria-hidden="true" size={16} /> : <ArrowsOutSimpleIcon aria-hidden="true" size={16} />}
            <span>{open ? 'Collapse' : 'Expand'}</span>
            <span className="sp-sr"> {example.name}</span>
          </button>
        </div>
        <p className="sp-meta">
          {[example.years, example.role, example.label].filter(Boolean).map((item) => (
            <span key={item}>{item}</span>
          ))}
        </p>
        <p className="sp-brief">{example.result}</p>
        <dl className="sp-pbr">
          <div>
            <dt>Problem</dt>
            <dd>{example.problem}</dd>
          </div>
          <div>
            <dt>Built</dt>
            <dd>{example.built}</dd>
          </div>
          <div>
            <dt>Result</dt>
            <dd>{example.result}</dd>
          </div>
        </dl>
      </div>
      <div id={`${id}-more`} className="sp-more" hidden={!open}>
        {open && (
          <motion.div
            initial={{ opacity: 0, transform: 'translateY(6px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            transition={{ ...swap, delay: 0.12 }}
          >
            <p>{example.more.text}</p>
            {example.more.links.length > 0 && (
              <ul className="sp-links">
                {example.more.links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} target="_blank" rel="noopener noreferrer">
                      {link.label}
                      <ArrowUpRightIcon aria-hidden="true" size={14} />
                      <span className="sp-sr"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </div>
    </article>
  )
}

export default function Draft() {
  const [params, setParams] = useSearchParams()
  const fromUrl = params.get('variant')
  const variant: Variant = isVariant(fromUrl) ? fromUrl : 'frontend'
  const [open, setOpen] = useState<string | null>(null)
  const reduce = useReducedMotion()
  const { lead, rest } = arrange(variant)
  const label = variants.find((v) => v.id === variant)?.label ?? ''

  const { grid, capture, play } = useFlip(reduce)
  useLayoutEffect(play, [variant, open, play])

  const setVariant = (next: Variant) => {
    if (next === variant) return
    capture()
    setParams(next === 'frontend' ? {} : { variant: next }, { replace: true, preventScrollReset: true })
  }

  const toggle = useCallback(
    (slug: string) => {
      capture()
      setOpen((current) => (current === slug ? null : slug))
    },
    [capture],
  )

  const openExample = useCallback(
    (slug: string) => {
      capture()
      setOpen(slug)
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const el = document.getElementById(`ex-${slug}`)
          el?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
          el?.querySelector<HTMLButtonElement>('[data-toggle]')?.focus({ preventScroll: true })
        }),
      )
    },
    [reduce, capture],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return
      const slug = open
      capture()
      setOpen(null)
      document.querySelector<HTMLButtonElement>(`[data-toggle="${slug}"]`)?.focus()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, capture])

  return (
    <MotionConfig reducedMotion="user">
      <div className="sp" data-variant={variant}>
        <title>Gentrit Rashiti, reference page</title>
        <a className="sp-skip" href="#examples">
          Skip to the examples
        </a>
        <header className="sp-head">
          <nav aria-label="On this page">
            <a href="#props">Props</a>
            <a href="#examples">Examples</a>
            <a href="#contact">Contact</a>
          </nav>
          <a className="sp-cv" href={links.cv} download>
            <DownloadSimpleIcon aria-hidden="true" size={16} />
            CV
          </a>
        </header>

        <main>
          <section className="sp-top" aria-labelledby="sp-name">
            <div className="sp-intro">
              <h1 id="sp-name">Gentrit Rashiti</h1>
              <p className="sp-lede">
                Builds web and mobile products from the first screen to the store release. Healthcare, video streaming,{' '}
                <span className="sp-nowrap">e-reading</span> and Web3.
              </p>
              <p className="sp-usage">
                <code>
                  <span className="sp-tok-p">&lt;</span>
                  <span className="sp-tok-c">Gentrit</span> <span className="sp-tok-a">variant</span>
                  <span className="sp-tok-p">=</span>
                  <span className="sp-tok-s">
                    "<Swap value={variant} />"
                  </span>{' '}
                  <span className="sp-tok-p">/&gt;</span>
                </code>
              </p>
              <VariantSwitch id="sp-variant-top" variant={variant} onChange={setVariant} />
            </div>
            <PropsTable variant={variant} onOpen={openExample} />
            <div className="sp-aside">
              <p className="sp-rule-note">Every value in the table cites the example that proves it. Select a name to open that example.</p>
              <dl className="sp-reach">
                <div>
                  <dt>Email</dt>
                  <dd>
                    <a href={`mailto:${links.email}`}>{links.email}</a>
                  </dd>
                </div>
                <div>
                  <dt>Source</dt>
                  <dd>
                    <a href={links.github} target="_blank" rel="noopener noreferrer">
                      {links.githubLabel}
                      <span className="sp-sr"> (opens in a new tab)</span>
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          <section className="sp-examples" id="examples" aria-labelledby="sp-examples-title">
            <div className="sp-examples-head">
              <h2 id="sp-examples-title">Examples</h2>
              <p>
                Ordered for the <Swap value={label.toLowerCase()} className="sp-mark" /> variant. Each one states the problem, what
                was built, and the result.
              </p>
              <VariantSwitch id="sp-variant-examples" variant={variant} onChange={setVariant} />
            </div>
            <div className="sp-grid" ref={grid}>
                {lead.map((example, index) => (
                  <ExampleCard
                    key={example.slug}
                    example={example}
                    form={index === 0 ? 'hero' : 'card'}
                    span={index === 0 ? [6, 2] : spans(lead.length - 1, index - 1)}
                    open={open === example.slug}
                    onToggle={toggle}
                  />
                ))}
                <h3 key="rest-title" id="sp-rest-title" className="sp-rest-title">
                  Other examples
                </h3>
                {rest.map((example, index) => (
                  <ExampleCard
                    key={example.slug}
                    example={example}
                    form="brief"
                    span={spans(rest.length, index)}
                    open={open === example.slug}
                    onToggle={toggle}
                  />
                ))}
            </div>
          </section>
        </main>

        <footer className="sp-foot" id="contact" aria-labelledby="sp-contact-title">
          <h2 id="sp-contact-title">Contact</h2>
          <a className="sp-email" href={`mailto:${links.email}`}>
            {links.email}
          </a>
          <ul className="sp-links">
            <li>
              <a href={links.cv} download>
                Download CV
                <DownloadSimpleIcon aria-hidden="true" size={14} />
              </a>
            </li>
            <li>
              <a href={links.github} target="_blank" rel="noopener noreferrer">
                GitHub
                <ArrowUpRightIcon aria-hidden="true" size={14} />
                <span className="sp-sr"> (opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a href={links.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn
                <ArrowUpRightIcon aria-hidden="true" size={14} />
                <span className="sp-sr"> (opens in a new tab)</span>
              </a>
            </li>
          </ul>
          <p className="sp-colophon">
            Set in Literata and JetBrains Mono. The design-system and care screens are real product screens with invented data; the document chat is a recreation
            with invented data. Every other screenshot comes from a public page or a store listing. <a href="/drafts">All directions</a>
          </p>
        </footer>
      </div>
    </MotionConfig>
  )
}
