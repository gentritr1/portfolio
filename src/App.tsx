import { lazy, Suspense } from "react";
import { Route, Routes, useLocation, useParams } from "react-router";
import { ScrollToTop } from "./components/ScrollToTop";
import { featuredProjects } from "./content/projects";
import { caseStudyPage } from "./lib/routes";
import { fontsReady, preloadCaseFonts } from "./pages/caseFonts";
import { groundNow } from "./pages/caseLight";
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then((m) => fontsReady().then(() => m)));
const DraftApp = lazy(() => import("./drafts/DraftApp"));
const KosovoHome = lazy(() => import("./drafts/kosovo-time/Draft"));

const CaseStudyPage = caseStudyPage.Component;

/** Unknown slugs load the small 404 route without any case-study modules. */
function CaseStudyRoute() {
  const { slug } = useParams();
  return featuredProjects.some((project) => project.slug === slug) ? (
    <CaseStudyPage />
  ) : (
    <NotFoundPage />
  );
}

export default function App() {
  const { pathname } = useLocation();
  if (pathname === "/")
    return (
      <>
        <ScrollToTop />
        <Suspense fallback={<div className="min-h-[100svh]" style={{ background: groundNow() }} />}>
          <KosovoHome />
        </Suspense>
      </>
    );
  if (pathname.startsWith("/work/")) {
    preloadCaseFonts();
    return (
      <>
        <ScrollToTop />
        <Suspense fallback={<div className="min-h-[100svh]" style={{ background: groundNow() }} />}>
          <Routes>
            <Route path="/work/:slug" element={<CaseStudyRoute />} />
          </Routes>
        </Suspense>
      </>
    );
  }
  if (pathname === "/drafts" || pathname.startsWith("/drafts/"))
    return (
      <>
        <meta name="robots" content="noindex,nofollow" />
        <ScrollToTop />
        <Suspense
          fallback={
            <div role="status" className="min-h-[100svh] p-8">
              Opening the drafts…
            </div>
          }
        >
          <DraftApp />
        </Suspense>
      </>
    );
  preloadCaseFonts();
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<div className="min-h-[100svh]" style={{ background: groundNow() }} />}>
        <NotFoundPage />
      </Suspense>
    </>
  );
}
