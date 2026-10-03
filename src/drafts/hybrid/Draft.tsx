import { HomePage } from "../../pages/HomePage";
import { Masthead } from "../../components/Masthead";
import { Footer } from "../../components/Footer";
import { StudioHero } from "../../components/case/StudioHero";
import { findProject } from "../../content/projects";
import "./style.css";

export default function HybridDraft() {
  const project = findProject("bayyinah-tv")!;
  return (
    <div className="draft-hybrid">
      <Masthead />
      <main>
        <HomePage />
        <section
          className="hybrid-case"
          aria-label="Featured case: Bayyinah TV"
        >
          <StudioHero project={project} />
          <div
            id="technical-story"
            className="portfolio-shell hybrid-case-copy"
          >
            <h2>An entire platform. Rebuilt.</h2>
            <p>{project.summary}</p>
            <a href="/work/bayyinah-tv">Read the complete case</a>
          </div>
        </section>
      </main>
      <Footer />
      <a className="hybrid-gallery-link" href="/drafts">All drafts</a>
    </div>
  );
}
