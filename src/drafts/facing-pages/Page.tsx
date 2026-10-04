import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
} from "react";
import { motion } from "motion/react";
import { projects } from "../../content/projects";
import { caseNarratives } from "../../content/caseNarratives";
import { links } from "../../content/links";
import {
  arabic,
  arabicLinks,
  arabicReadouts,
  arabicRoles,
  chapterFor,
  chapters,
  orderedProjects,
} from "./content";
import { spring } from "./motion";
import { CareFile } from "./CareFile";

export interface ReadingPosition {
  chapter: string;
  project: string | null;
  page: number;
}
export interface PageMetrics {
  pages: number;
  width: number;
}
interface PageProps {
  language: "en" | "ar";
  position: ReadingPosition;
  fontSize: number;
  reduced: boolean;
  mobileHidden: boolean;
  onMeasure: (language: "en" | "ar", metrics: PageMetrics) => void;
  onOpen: (slug: string) => void;
  onContents: () => void;
  onFocusPage: (page: number) => void;
}

export function Page({
  language,
  position,
  fontSize,
  reduced,
  mobileHidden,
  onMeasure,
  onOpen,
  onContents,
  onFocusPage,
}: PageProps) {
  const paper = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const stream = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1);
  const [count, setCount] = useState(1);
  const ar = language === "ar";
  const project = projects.find((item) => item.slug === position.project);
  const translation = project ? arabic[project.slug] : null;
  const chapter = chapters.find((item) => item.id === position.chapter);
  const listed = chapter
    ? orderedProjects.filter((item) =>
        (chapter.slugs as readonly string[]).includes(item.slug),
      )
    : orderedProjects;
  const narrative = project ? caseNarratives[project.slug] : undefined;
  const image =
    project?.slug === "care-platform"
      ? null
      : (project?.media.galleries?.[0]?.items[0] ?? project?.media.shot);
  const title = project
    ? ar
      ? translation!.title
      : project.name
    : ar
      ? (chapter?.ar ?? "المحتويات")
      : (chapter?.en ?? "Contents");
  const gap = 48;

  useLayoutEffect(() => {
    const node = viewport.current;
    const content = stream.current;
    if (!node || !content) return;
    let frame = 0;
    let disposed = false;
    const measure = () => {
      if (disposed) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const measuredWidth = node.clientWidth;
        if (!measuredWidth) return;
        const pages = Math.max(
          1,
          Math.ceil((content.scrollWidth + gap - 1) / (measuredWidth + gap)),
        );
        setWidth(measuredWidth);
        setCount(pages);
        onMeasure(language, { width: measuredWidth, pages });
      });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    observer.observe(content);
    content.addEventListener("load", measure, true);
    void document.fonts.ready.then(measure);
    measure();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      content.removeEventListener("load", measure, true);
    };
  }, [position.chapter, position.project, fontSize, language, onMeasure]);

  function revealFocused(event: FocusEvent<HTMLDivElement>) {
    const content = stream.current;
    const node = event.target as HTMLElement;
    if (!content || !node.closest("button,a")) return;
    const rect = node.getBoundingClientRect();
    const left = content.getBoundingClientRect().left;
    const next = Math.max(
      0,
      Math.floor((rect.left - left + 2) / (width + gap)),
    );
    if (next !== position.page) onFocusPage(next);
  }

  return (
    <motion.section
      layout="position"
      transition={reduced ? { duration: 0.01 } : spring.ui}
      className="fp-paper"
      ref={paper}
      data-language={language}
      data-dense-contents={!project && !chapter}
      data-mobile-hidden={mobileHidden}
      lang={language}
      aria-hidden={mobileHidden || undefined}
      style={{ "--fp-type-size": fontSize + "px" } as CSSProperties}
    >
      <header className="fp-running-head" dir={ar ? "rtl" : "ltr"}>
        <span>{ar ? "صفحات متقابلة" : "Facing Pages"}</span>
        <span>{ar ? "عربي" : "English"}</span>
      </header>
      <div className="fp-page-window" ref={viewport}>
        <div
          className="fp-columns"
          ref={stream}
          onFocusCapture={revealFocused}
          style={{
            transform: "translateX(" + -position.page * (width + gap) + "px)",
          }}
        >
          <div className="fp-language-content" dir={ar ? "rtl" : "ltr"}>
            <motion.h2
              layoutId={
                project
                  ? "fp-title-" + language + "-" + project.slug
                  : undefined
              }
              transition={reduced ? { duration: 0.01 } : spring.ui}
            >
              {title}
            </motion.h2>
            {project && ar && (
              <p className="fp-original-name" dir="ltr">
                {project.name}
              </p>
            )}
            {project ? (
              <>
                <p className="fp-project-line">
                  {ar ? translation!.line : project.line}
                </p>
                <p className="fp-publication">
                  {project.years ?? (ar ? "عمل مستقل" : "Independent work")}{" "}
                  <span aria-hidden="true"> / </span>{" "}
                  {ar ? chapterFor(project.slug).ar : project.kind}
                </p>
                {(ar
                  ? translation!.paragraphs
                  : narrative
                    ? [
                        narrative.story.product,
                        narrative.story.built,
                        narrative.story.result,
                      ]
                    : [project.summary]
                ).map((paragraph, index) => (
                  <p className="fp-body-copy" key={index}>
                    {paragraph}
                  </p>
                ))}
                {project.slug === "care-platform" && (
                  <CareFile language={language} reduced={reduced} />
                )}
                {image && (
                  <figure className="fp-project-figure">
                    <img
                      src={image.src}
                      alt={image.alt}
                      loading="eager"
                      decoding="async"
                    />
                    <figcaption>
                      {ar
                        ? "صورة من صفحة عامة للمشروع."
                        : "From the project’s public pages."}
                    </figcaption>
                  </figure>
                )}
                <h3>{ar ? "ملاحظات العمل" : "Working notes"}</h3>
                <dl className="fp-project-notes">
                  <div>
                    <dt>{ar ? "الدور" : "Role"}</dt>
                    <dd dir={ar ? "rtl" : "ltr"}>
                      {ar
                        ? (arabicRoles[project.role] ?? project.role)
                        : project.role}
                    </dd>
                  </div>
                  <div>
                    <dt>{ar ? "الأدوات" : "Tools"}</dt>
                    <dd dir="ltr">{project.stack.join(" · ")}</dd>
                  </div>
                </dl>
                {project.featured?.readouts?.map((readout) => (
                  <p className="fp-readout" key={readout.label}>
                    <strong dir="ltr">
                      {readout.value}
                      {readout.to ? " → " + readout.to : ""}
                    </strong>
                    <span lang={ar ? "ar" : "en"}>
                      {ar
                        ? (arabicReadouts[readout.label] ?? readout.label)
                        : readout.label}
                    </span>
                  </p>
                ))}
                {project.links.length > 0 && (
                  <nav
                    className="fp-source-links"
                    aria-label={ar ? "روابط المشروع" : "Project sources"}
                  >
                    {project.links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {ar
                          ? (arabicLinks[link.label] ?? link.label)
                          : link.label}
                        <svg
                          viewBox="0 0 20 20"
                          width="16"
                          height="16"
                          aria-hidden="true"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.3"
                        >
                          <path d="M4 16 16 4M5 4h11v11" />
                        </svg>
                      </a>
                    ))}
                  </nav>
                )}
                <button
                  className="fp-return"
                  type="button"
                  onClick={onContents}
                >
                  {ar ? "العودة إلى المحتويات" : "Back to contents"}
                </button>
              </>
            ) : (
              <>
                <p className="fp-contents-intro">
                  {ar
                    ? `${listed.length} مشروعاً. اختر عنواناً لقراءة العمل.`
                    : listed.length +
                      " projects. Open a title to read the work."}
                </p>
                <ol className="fp-contents-list">
                  {listed.map((item, index) => (
                    <li key={item.slug}>
                      <button type="button" onClick={() => onOpen(item.slug)}>
                        <span className="fp-entry-number">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span>
                          <motion.strong
                            layoutId={"fp-title-" + language + "-" + item.slug}
                            transition={
                              reduced ? { duration: 0.01 } : spring.ui
                            }
                          >
                            {ar ? arabic[item.slug].title : item.name}
                          </motion.strong>
                          <small>
                            {ar ? arabic[item.slug].line : item.line}
                          </small>
                        </span>
                        <span className="fp-entry-year" dir="ltr">
                          {item.years ?? "—"}
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
                <div className="fp-colophon">
                  <h3>{ar ? "حول هذا الكتاب" : "A note on this edition"}</h3>
                  <p>
                    {ar
                      ? "هذه المحفظة تقرأ في اتجاهين. يستند النص العربي إلى حقائق المشاريع نفسها، وتبقى أسماء الأدوات والروابط كما هي. تكبير النص يعيد توزيع الصفحات فعلياً."
                      : "One body of work, read in two directions. These pages borrow from the EPUB readers in Read to Feed and the English–Arabic interface of Bayyinah TV. Change the type size: the text really moves to another page."}
                  </p>
                  <p>
                    {ar
                      ? "جنتريت راشيتي · كوسوفو · الويب والهاتف والتطوير المتكامل."
                      : "Gentrit Rashiti · Kosovo · Web, mobile and full stack."}
                  </p>
                  <a href={"mailto:" + links.email}>{links.email}</a>
                </div>
              </>
            )}
          </div>
        </div>
        {position.page >= count && (
          <div className="fp-end-translation" dir={ar ? "rtl" : "ltr"}>
            <p>
              {ar
                ? "انتهى النص العربي في الصفحة السابقة."
                : "This translation ends on the previous page."}
            </p>
            <small>
              {ar
                ? "تابع النص المقابل أو عد إلى المحتويات."
                : "Continue the facing text, or return to contents."}
            </small>
          </div>
        )}
      </div>
      <footer className="fp-folio">
        <span>{ar ? "جنتريت راشيتي" : "Gentrit Rashiti"}</span>
        <span>
          {Math.min(position.page + 1, count)} / {count}
        </span>
      </footer>
    </motion.section>
  );
}
