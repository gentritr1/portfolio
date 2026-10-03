import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './styles/globals.css'
import App from './App.tsx'

if (import.meta.env.DEV) {
  const { applyReviewPreferences } = await import('./lab/preferences')
  applyReviewPreferences()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Synchronous updates let flushSync commit a route inside a view transition. */}
    <BrowserRouter useTransitions={false}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
