import type { CSSProperties } from 'react'
import { Link, useLocation } from 'react-router'
import { motion, useReducedMotion } from 'motion/react'
import { links } from '../content/links'
import { findProject } from '../content/projects'
import { productBySlug } from '../drafts/aisle/products'
import './aisle-case.css'

const suggestions = ['bayyinah-tv', 'read-to-feed', 'dukagjini-bookstore']

function Arrow({ back = false }: { back?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" style={back ? { transform: 'rotate(180deg)' } : undefined}>
      <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

/** An empty spot on the shelf: the address has no product. */
export default function NoSignalPage() {
  const { pathname } = useLocation()
  const reduced = Boolean(useReducedMotion())

  return (
    <main className="aisle-case ac-404" aria-labelledby="ac-404-title">
      <title>Out of stock — Gentrit Rashiti</title>
      <header className="ac-talker">
        <Link to="/" className="ac-mark" aria-label="Aisle 7, back to the shelf">AISLE <em>7</em></Link>
        <p className="ac-talker-line"><span>Gentrit Rashiti</span><i aria-hidden="true">—</i><span>Web · Mobile · Full stack</span></p>
        <nav className="ac-tools" aria-label="Site">
          <Link to="/"><Arrow back />Back to the shelf</Link>
          <a href={links.cv} download>CV <Arrow /></a>
        </nav>
      </header>

      <section className="ac-404-shelf">
        <div className="ac-404-copy">
          <h1 id="ac-404-title">This shelf is empty.</h1>
          <p className="ac-404-path"><span>Item not found:</span> <code>{pathname}</code></p>
          <p>There is no product at this address. Every project is on the main shelf.</p>
          <Link to="/" className="ac-404-button">Back to the shelf <Arrow /></Link>
        </div>
        <div className="ac-404-spot" aria-hidden="true">
          <div className="ac-404-outline" />
          <div className="ac-404-edge" />
          <motion.p
            className="ac-tag ac-404-tag"
            initial={reduced ? false : { rotate: 14 }}
            animate={{ rotate: 0 }}
            transition={reduced ? { duration: 0.01 } : { type: 'spring', duration: 1.1, bounce: 0.55, delay: 0.25 }}
          >
            <strong>404</strong>
            <span>Out of stock</span>
          </motion.p>
        </div>
      </section>

      <section className="ac-404-try" aria-labelledby="ac-404-try-title">
        <h2 id="ac-404-try-title" className="ac-heading">Try instead</h2>
        <ul>
          {suggestions.map((slug) => {
            const project = findProject(slug)
            const pack = productBySlug.get(slug)?.pack
            if (!project || !pack) return null
            return (
              <li key={slug}>
                <Link
                  to={`/work/${slug}`}
                  className="ac-404-box"
                  style={{ '--ac-next-field': pack.field, '--ac-next-ink': pack.ink } as CSSProperties}
                >
                  <strong>{project.name}</strong>
                  <span>{project.kind}</span>
                  <Arrow />
                </Link>
              </li>
            )
          })}
        </ul>
      </section>
    </main>
  )
}
