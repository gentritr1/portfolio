import { Suspense } from 'react'
import { Route, Routes, useParams } from 'react-router'
import { Footer } from './components/Footer'
import { Masthead } from './components/Masthead'
import { ScrollToTop } from './components/ScrollToTop'
import { featuredProjects } from './content/projects'
import { caseStudyPage } from './lib/routes'
import { HomePage } from './pages/HomePage'
import { NoSignalPage } from './pages/NoSignalPage'

const CaseStudyPage = caseStudyPage.Component

/** Unknown slugs render No signal from the main chunk, so the lazy fallback never paints first. */
function CaseStudyRoute() {
  const { slug } = useParams()
  return featuredProjects.some((project) => project.slug === slug) ? <CaseStudyPage /> : <NoSignalPage />
}

export default function App() {
  return (
    <>
      <a
        href="#main"
        className="fixed left-4 top-3 z-(--z-skip) inline-flex min-h-11 -translate-y-24 items-center rounded-sm bg-signal px-4 label text-on-signal transition-transform duration-200 ease-out focus-visible:translate-y-0"
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
