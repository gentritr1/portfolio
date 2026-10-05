import { lazy, Suspense } from "react";
import { Route, Routes, useLocation, useParams } from "react-router";
import { ScrollToTop } from "./components/ScrollToTop";
import { featuredProjects } from "./content/projects";
import { caseStudyPage } from "./lib/routes";
import { fontsReady } from "./pages/caseFonts";
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then((m) => fontsReady().then(() => m)));
const DraftApp = lazy(() => import("./drafts/DraftApp"));
const ProjectorHome = lazy(() => import("./drafts/projector/Draft"));

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
        <Suspense fallback={<div className="min-h-[100svh] bg-[#d9f26b]" />}>
          <ProjectorHome />
        </Suspense>
      </>
    );
  if (pathname.startsWith("/work/"))
    return (
      <>
        <ScrollToTop />
        <Suspense fallback={<div className="min-h-[100svh] bg-[#d9f26b]" />}>
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
      <Suspense fallback={<div className="min-h-[100svh] bg-[#d9f26b]" />}>
        <NotFoundPage />
      </Suspense>
    </>
  );
}
