import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation, useParams } from "react-router";
import { ScrollToTop } from "./components/ScrollToTop";
import { featuredProjects } from "./content/projects";
import { caseStudyPage } from "./lib/routes";
import { fontsReady, preloadCaseFonts } from "./pages/caseFonts";
import { groundNow } from "./pages/caseLight";
import { firstView, isHomePath, isLoopPath } from "./lib/firstView";
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then((m) => fontsReady().then(() => m)));
const DraftApp = lazy(() => import("./drafts/DraftApp"));
const Home = lazy(() => import("./drafts/refractive-engine/Draft"));

/** Addresses from before the refractive engine became the home (2026-10-30), sent to their closest page. */
const MOVED: Record<string, string> = { "/workflow": "/", "/civiclee": "/", "/design-system": "/design-system-react" };

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
  const { pathname, search, hash } = useLocation();
  const legacyHome = pathname === "/drafts/refractive-engine" || pathname.startsWith("/drafts/refractive-engine/");
  const moved = MOVED[pathname.replace(/\/$/, "")] ?? (legacyHome ? pathname.slice("/drafts/refractive-engine".length) || "/" : null);
  if (moved) return <Navigate to={{ pathname: moved, search, hash }} replace />;
  if (isHomePath(pathname)) {
    const Page = firstView.home ?? Home;
    return (
      <>
        <ScrollToTop />
        <Suspense fallback={<div className="min-h-[100svh]" style={{ background: "#050508" }} />}>
          <Routes>
            <Route path="/*" element={<Page />} />
          </Routes>
        </Suspense>
      </>
    );
  }
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
  const Loop = firstView.loop;
  if (Loop && isLoopPath(pathname))
    return (
      <>
        <meta name="robots" content="noindex,nofollow" />
        <ScrollToTop />
        <Loop />
      </>
    );
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
