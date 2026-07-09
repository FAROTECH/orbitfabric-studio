import type { ProjectEntry } from "./types/workspace";

export function EntrySection({
  id,
  title,
  entries,
  emptyText,
  onOpenFile,
}: {
  id?: string;
  title: string;
  entries: ProjectEntry[];
  emptyText: string;
  onOpenFile: (entry: ProjectEntry) => void;
}) {
  return (
    <section id={id} className="entry-section">
      <h3>{title}</h3>
      {entries.length > 0 ? (
        <ul className="entry-list">
          {entries.map((entry) => (
            <li key={entry.path}>
              <div className="entry-main">
                <button
                  className="entry-button"
                  type="button"
                  onClick={() => onOpenFile(entry)}
                  disabled={entry.kind !== "file"}
                >
                  {entry.name}
                </button>
                <span className={`category-badge category-${entry.category}`}>
                  {formatCategory(entry.category)}
                </span>
              </div>
              <span className="entry-path">{entry.path}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-text">{emptyText}</p>
      )}
    </section>
  );
}

function formatCategory(category: ProjectEntry["category"]) {
  switch (category) {
    case "sourceModel":
      return "source model";
    case "scenarioSource":
      return "scenario source";
    case "derivedReport":
      return "derived report";
    case "generatedOutput":
      return "generated output";
  }
}
