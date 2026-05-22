interface BadgeProps {
  label: string;
}

export function ProvenanceBadge({ label }: BadgeProps) {
  return (
    <span className={`provenance-badge provenance-badge-${toBadgeClass(label)}`}>
      {label}
    </span>
  );
}

export function StatusBadge({ label }: BadgeProps) {
  return (
    <span className={`status-badge status-badge-${toBadgeClass(label)}`}>
      {label}
    </span>
  );
}

export function SeverityBadge({ label }: BadgeProps) {
  return (
    <span className={`severity-badge severity-badge-${toBadgeClass(label)}`}>
      {label}
    </span>
  );
}

function toBadgeClass(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
