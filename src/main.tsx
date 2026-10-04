import './lab/prepareReview'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router'
import './styles/globals.css'
import App from './App.tsx'

const hashRouting = import.meta.env.VITE_ROUTER === 'hash'
const Router = hashRouting ? HashRouter : BrowserRouter

// A hash-routed build is hosted under an unknown path, so site-absolute links move into the hash.
if (hashRouting) {
  document.addEventListener('click', (event) => {
    const anchor = (event.target as Element | null)?.closest?.('a[href^="/"]')
    if (!anchor || event.defaultPrevented || event.button !== 0 || anchor.hasAttribute('download')) return
    const href = anchor.getAttribute('href') ?? ''
    if (href.startsWith('//') || /\.[a-z0-9]{2,5}$/i.test(href.split(/[?#]/)[0])) return
    event.preventDefault()
    window.location.hash = href
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Synchronous updates let flushSync commit a route inside a view transition. */}
    <Router useTransitions={false}>
      <App />
    </Router>
  </StrictMode>,
)
