export function InspectorField({
  label,
  value,
  title,
}: {
  label: string;
  value: string | number | null | undefined;
  title?: string;
}) {
  return (
    <div className="inspector-field" title={title}>
      <span>{label}</span>
      <strong>{value === null || value === undefined || value === "" ? "not available" : value}</strong>
    </div>
  );
}

export function formatInspectorPath(value: string | null | undefined): string {
  if (!value) {
    return "not available";
  }

  const parts = value.split(/[\\/]/).filter(Boolean);

  if (parts.length <= 3) {
    return value;
  }

  return `…/${parts.slice(-3).join("/")}`;
}
