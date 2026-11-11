import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { BrowserRouter, HashRouter } from 'react-router'
import './styles/globals.css'
import App from './App.tsx'
import { preloadFirstView } from './lib/firstView'

const hashRouting = import.meta.env.VITE_ROUTER === 'hash'
const Router = hashRouting ? HashRouter : BrowserRouter

// A hash-routed build is hosted under an unknown path, so site-absolute links move into the hash.
if (hashRouting) {
  document.addEventListener('click', (event) => {
    const anchor = (event.target as Element | null)?.closest?.('a[href^="/"]')
    if (!anchor || event.button !== 0 || anchor.hasAttribute('download')) return
    const href = anchor.getAttribute('href') ?? ''
    if (href.startsWith('//') || /\.[a-z0-9]{2,5}$/i.test(href.split(/[?#]/)[0])) return
    event.preventDefault()
    event.stopPropagation()
    window.location.hash = href
  }, true)
}

preloadFirstView()
const root = createRoot(document.getElementById('root')!)
// Rendered synchronously as the entry runs, so the first frame after it carries the page. The paint is not held for the
// script: holding it (blocking="render") left a slow connection on a blank screen 1.4 s longer for no earlier content.
flushSync(() =>
  root.render(
    <StrictMode>
      {/* Synchronous updates let flushSync commit a route inside a view transition. */}
      <Router useTransitions={false}>
        <App />
      </Router>
    </StrictMode>,
  ),
)
