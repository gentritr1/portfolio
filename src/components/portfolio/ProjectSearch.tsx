import { useEffect, useRef, useState } from "react";
import { projects } from "../../content/projects";
import { useNavigate } from "react-router";
import "./project-search.css";

export default function ProjectSearch({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate();
  const results = projects.filter((project) =>
    `${project.name} ${project.kind} ${project.stack.join(" ")}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  useEffect(() => {
    const node = dialog.current;
    const opener = document.activeElement as HTMLElement | null;
    if (!node) return;
    node.showModal();
    input.current?.focus();
    const overflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      node.close();
      document.documentElement.style.overflow = overflow;
      opener?.focus();
    };
  }, []);
  useEffect(() => {
    dialog.current
      ?.querySelector(`[data-result="${selected}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [selected]);
  function open(slug: string) {
    const project = projects.find((item) => item.slug === slug);
    onClose();
    navigate(project?.featured ? `/work/${slug}` : `/?p=${slug}`);
  }
  return (
    <dialog
      ref={dialog}
      className="project-search"
      aria-labelledby="search-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialog.current) onClose();
      }}
    >
      <div className="project-search-inner">
        <div className="search-heading">
          <h2 id="search-title">Find a project</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close project search"
          >
            Esc
          </button>
        </div>
        <input
          ref={input}
          type="search"
          value={query}
          placeholder="Project, platform or technology…"
          aria-label="Search projects"
          aria-controls="search-results"
          aria-activedescendant={
            results[selected] ? `search-${results[selected].slug}` : undefined
          }
          role="combobox"
          aria-expanded="true"
          autoComplete="off"
          onChange={(event) => {
            setQuery(event.target.value);
            setSelected(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              setSelected((value) =>
                Math.max(
                  0,
                  Math.min(
                    results.length - 1,
                    value + (event.key === "ArrowDown" ? 1 : -1),
                  ),
                ),
              );
            }
            if (event.key === "Enter" && results[selected]) {
              event.preventDefault();
              open(results[selected].slug);
            }
          }}
        />
        <ul id="search-results" role="listbox" aria-label="Projects">
          {results.map((project, index) => (
            <li
              key={project.slug}
              id={`search-${project.slug}`}
              role="option"
              aria-selected={index === selected}
              data-result={index}
            >
              <button
                type="button"
                onClick={() => open(project.slug)}
                onFocus={() => setSelected(index)}
              >
                <span>
                  {project.name}
                  <small>{project.kind}</small>
                </span>
                <span>{project.years}</span>
              </button>
            </li>
          ))}
        </ul>
        {!results.length && (
          <p className="search-empty">
            No matching projects. Try “React”, “mobile” or a product name.
          </p>
        )}
        <p className="search-help">Arrow keys to browse · Enter to open</p>
      </div>
    </dialog>
  );
}
