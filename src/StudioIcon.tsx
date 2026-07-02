export type StudioIconKind =
  | "mission"
  | "core"
  | "core-report-runner"
  | "data-flow"
  | "data-products"
  | "scenarios"
  | "artifacts"
  | "reports"
  | "docs"
  | "runtime"
  | "ground"
  | "validation"
  | "model"
  | "coverage"
  | "evidence"
  | "shield"
  | "contracts"
  | "relationships"
  | "raw"
  | "status-readonly"
  | "status-core"
  | "capture"
  | "open-detail"
  | "collapse-left"
  | "collapse-right"
  | "chevron-down"
  | "help"
  | "settings"
  | "profile"
  | "unknown";

const STUDIO_ICON_PATHS: Record<StudioIconKind, string> = {
  mission: "M12 3l7 4v10l-7 4-7-4V7l7-4z M12 7v10 M5 7l7 4 7-4",
  core: "M5 5h14v14H5V5z M8 9l3 3-3 3 M13 15h4",
  "core-report-runner": "M5 5h14v14H5V5z M8 9l3 3-3 3 M13 15h4",
  "data-flow": "M6 7a2 2 0 1 0 .1 0 M18 7a2 2 0 1 0 .1 0 M12 17a2 2 0 1 0 .1 0 M8 8l3 7 M16 8l-3 7 M8 7h8",
  "data-products": "M4 5h7v7H4z M13 5h7v7h-7z M4 14h7v5H4z M13 14h7v5h-7z",
  scenarios: "M4 6h5l3 6 3-6h5 M4 18h5l3-6 3 6h5",
  artifacts: "M6 4h9l3 3v13H6z M15 4v4h4 M8 12h8 M8 16h6",
  reports: "M5 4h14v16H5z M8 8h8 M8 12h8 M8 16h5",
  docs: "M7 4h10v16H7z M9 8h6 M9 12h6 M9 16h4",
  runtime: "M5 6h14v12H5z M8 10h8 M8 14h4 M14 14h2",
  ground: "M4 18h16 M7 18l5-12 5 12 M9 13h6",
  validation: "M5 12l4 4L19 6 M4 4h16v16H4z",
  model: "M4 5h7v7H4z M13 5h7v7h-7z M4 14h7v5H4z M13 14h7v5h-7z",
  coverage: "M12 20a8 8 0 1 0-8-8 M12 12l5-5 M12 12v8",
  evidence: "M5 5h14v10H8l-3 3z M8 9h8 M8 12h6",
  shield: "M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z",
  contracts: "M7 4h10v16H7z M9 8h6 M9 12h6 M9 16h4",
  relationships: "M6 7a2 2 0 1 0 .1 0 M18 7a2 2 0 1 0 .1 0 M12 17a2 2 0 1 0 .1 0 M8 8l3 7 M16 8l-3 7 M8 7h8",
  raw: "M8 8l-4 4 4 4 M16 8l4 4-4 4 M13 6l-2 12",
  "status-readonly": "M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z M9 12l2 2 4-5",
  "status-core": "M12 4v4 M12 16v4 M4 12h4 M16 12h4 M7 7l3 3 M17 7l-3 3 M7 17l3-3 M17 17l-3-3",
  capture: "M5 8h3l1.5-2h5L16 8h3v10H5z M12 11a3 3 0 1 0 0.1 0",
  "open-detail": "M9 6l6 6-6 6",
  "collapse-left": "M15 6l-6 6 6 6",
  "collapse-right": "M9 6l6 6-6 6",
  "chevron-down": "M7 10l5 5 5-5",
  help: "M9.5 9a2.5 2.5 0 1 1 4.2 1.8c-.9.8-1.7 1.2-1.7 2.7 M12 17h.01 M4 12a8 8 0 1 0 16 0 8 8 0 0 0-16 0",
  settings: "M12 8.5a3.5 3.5 0 1 0 0.1 0 M19 12a7 7 0 0 0-.1-1l2-1.4-2-3.4-2.4 1a7 7 0 0 0-1.7-1L14.5 3h-5l-.3 3.2a7 7 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.4a7 7 0 0 0 0 2l-2 1.4 2 3.4 2.4-1a7 7 0 0 0 1.7 1l.3 3.2h5l.3-3.2a7 7 0 0 0 1.7-1l2.4 1 2-3.4-2-1.4c.1-.3.1-.7.1-1",
  profile: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 20a8 8 0 0 1 16 0",
  unknown: "M9.5 9a2.5 2.5 0 1 1 4.2 1.8c-.9.8-1.7 1.2-1.7 2.7 M12 17h.01",
};

export function StudioIcon({
  kind,
  className,
  title,
}: {
  kind: StudioIconKind;
  className?: string;
  title?: string;
}) {
  return (
    <span
      className={["studio-icon", `studio-icon-${kind}`, className ?? ""]
        .filter(Boolean)
        .join(" ")}
      aria-hidden={title ? undefined : "true"}
      role={title ? "img" : undefined}
      aria-label={title}
    >
      <svg viewBox="0 0 24 24" focusable="false">
        <path d={STUDIO_ICON_PATHS[kind]} />
      </svg>
    </span>
  );
}
