import { type NavigationIconKind } from "./navigationModel";

type DashboardIconKind = NavigationIconKind;

export function DashboardIcon({ kind }: { kind: DashboardIconKind }) {
  const iconPath = {
    mission: "M12 3l7 4v10l-7 4-7-4V7l7-4z M12 7v10 M5 7l7 4 7-4",
    validation: "M5 12l4 4L19 6 M4 4h16v16H4z",
    model: "M4 5h7v7H4z M13 5h7v7h-7z M4 14h7v5H4z M13 14h7v5h-7z",
    scenario: "M4 6h5l3 6 3-6h5 M4 18h5l3-6 3 6h5",
    coverage: "M12 20a8 8 0 1 0-8-8 M12 12l5-5 M12 12v8",
    artifacts: "M6 4h9l3 3v13H6z M15 4v4h4 M8 12h8 M8 16h6",
    evidence: "M5 5h14v10H8l-3 3z M8 9h8 M8 12h6",
    shield: "M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z",
    core: "M8 9h8 M8 15h8 M5 6h14v12H5z",
    contracts: "M7 4h10v16H7z M9 8h6 M9 12h6 M9 16h4",
    relationships: "M6 7a2 2 0 1 0 0.1 0 M18 7a2 2 0 1 0 0.1 0 M12 17a2 2 0 1 0 0.1 0 M8 8l3 7 M16 8l-3 7 M8 7h8",
    reports: "M5 4h14v16H5z M8 8h8 M8 12h8 M8 16h5",
    ground: "M4 18h16 M7 18l5-12 5 12 M9 13h6",
    raw: "M8 8l-4 4 4 4 M16 8l4 4-4 4 M13 6l-2 12",
  }[kind];

  return (
    <span className={`dashboard-icon dashboard-icon-${kind}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" role="img">
        <path d={iconPath} />
      </svg>
    </span>
  );
}
