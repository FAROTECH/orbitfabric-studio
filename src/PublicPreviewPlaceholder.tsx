import { ProvenanceBadge, StatusBadge } from "./Badges";

export function PublicPreviewPlaceholder({
  title,
  summary,
}: {
  title: string;
  summary: string;
}) {
  return (
    <section className="active-surface-frame public-preview-placeholder" aria-label={title}>
      <div className="file-viewer-header">
        <div>
          <span className="surface-section-kicker">Mission Content First Public Preview</span>
          <h2>{title}</h2>
          <p>{summary}</p>
        </div>
        <div className="badge-row">
          <ProvenanceBadge label="READ-ONLY" />
          <StatusBadge label="IN REDESIGN" />
          <StatusBadge label="NO PRIVATE INFERENCE" />
        </div>
      </div>
      <div className="placeholder-detail-grid">
        <article className="placeholder-detail-card">
          <strong>Available in this preview</strong>
          <span>Mission Overview, Core Report Runner, Data Flow Workbench, Data Products, Scenario Evidence and Generated Artifacts.</span>
        </article>
        <article className="placeholder-detail-card">
          <strong>Boundary</strong>
          <span>Studio remains a read-only inspection cockpit over Core-generated evidence.</span>
        </article>
      </div>
    </section>
  );
}
