import { lazy, Suspense } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router'
import { ScrollToTop } from './components/ScrollToTop'
import { firstView, isHomePath } from './lib/firstView'
const Home = lazy(() => import("./portfolio/Draft"))
const MOVED: Record<string, string> = { '/workflow': '/', '/civiclee': '/', '/design-system': '/design-system-react' }

export default function App() {
  const { pathname, search, hash } = useLocation()
  const legacy = pathname.startsWith('/drafts/refractive-engine')
    ? pathname.slice('/drafts/refractive-engine'.length) || '/'
    : pathname.startsWith('/work/') ? pathname.slice('/work'.length) : null
  const moved = MOVED[pathname.replace(/\/$/, '')] ?? legacy
  if (moved) return <Navigate to={{ pathname: moved, search, hash }} replace />
  if (!isHomePath(pathname)) return (
    <main style={{ minHeight: '100svh', background: '#050508', color: '#ededf0', padding: 'clamp(24px, 8vw, 100px)', fontFamily: 'Archivo, sans-serif' }}>
      <title>Page not found - Gentrit Rashiti</title>
      <meta name="robots" content="noindex" />
      <h1>This page is no longer here.</h1>
      <p style={{ marginBlock: 24 }}>Explore the portfolio and its project case studies.</p>
      <Link to="/" style={{ color: '#b9dce6', textDecoration: 'underline', paddingBlock: 12 }}>Back to the portfolio</Link>
    </main>
  )
  const Page = firstView.home ?? Home
  return <><ScrollToTop /><Suspense fallback={<div style={{ minHeight: '100svh', background: '#050508' }} />}><Routes><Route path="/*" element={<Page />} /></Routes></Suspense></>
}
