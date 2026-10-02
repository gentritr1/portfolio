import { Suspense } from 'react'
import { Route, Routes } from 'react-router'
import { Footer } from './components/Footer'
import { Masthead } from './components/Masthead'
import { ScrollToTop } from './components/ScrollToTop'
import { caseStudyPage } from './lib/routes'
import { HomePage } from './pages/HomePage'
import { NoSignalPage } from './pages/NoSignalPage'

const CaseStudyRoute = caseStudyPage.Component

export default function App() {
  return (
    <>
      <a
        href="#main"
        className="fixed left-4 top-3 z-(--z-skip) -translate-y-24 rounded-sm bg-signal px-4 py-3 label text-on-signal transition-transform duration-200 ease-out focus-visible:translate-y-0"
      >
        Skip to content
      </a>
      <ScrollToTop />
      <Masthead />
      <main id="main">
        <Suspense fallback={<div className="min-h-[100svh]" />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/work/:slug" element={<CaseStudyRoute />} />
            <Route path="*" element={<NoSignalPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
