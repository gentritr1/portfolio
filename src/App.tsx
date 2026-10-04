import { lazy, Suspense } from "react";
import { Route, Routes, useLocation, useParams } from "react-router";
import { ScrollToTop } from "./components/ScrollToTop";
import { featuredProjects } from "./content/projects";
import { caseStudyPage } from "./lib/routes";
const NoSignalPage = lazy(() => import("./pages/NoSignalPage"));
const DraftApp = lazy(() => import("./drafts/DraftApp"));
const AisleHome = lazy(() => import("./drafts/aisle/Draft"));

const CaseStudyPage = caseStudyPage.Component;

/** Unknown slugs load the small 404 route without any case-study modules. */
function CaseStudyRoute() {
  const { slug } = useParams();
  return featuredProjects.some((project) => project.slug === slug) ? (
    <CaseStudyPage />
  ) : (
    <NoSignalPage />
  );
}

export default function App() {
  const { pathname } = useLocation();
  if (pathname === "/")
    return (
      <>
        <ScrollToTop />
        <Suspense fallback={<div className="min-h-[100svh] bg-[#ffd400]" />}>
          <AisleHome />
        </Suspense>
      </>
    );
  if (pathname.startsWith("/work/"))
    return (
      <>
        <ScrollToTop />
        <Suspense fallback={<div className="min-h-[100svh] bg-[#ffd400]" />}>
          <Routes>
            <Route path="/work/:slug" element={<CaseStudyRoute />} />
          </Routes>
        </Suspense>
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
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<div className="min-h-[100svh] bg-[#ffd400]" />}>
        <NoSignalPage />
      </Suspense>
    </>
  );
}
