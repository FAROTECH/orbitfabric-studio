import { type NavigationIconKind } from "./navigationModel";
import { StudioIcon, type StudioIconKind } from "./StudioIcon";

type DashboardIconKind = NavigationIconKind;

const DASHBOARD_TO_STUDIO_ICON: Record<DashboardIconKind, StudioIconKind> = {
  mission: "mission",
  validation: "validation",
  model: "model",
  scenario: "scenarios",
  coverage: "coverage",
  artifacts: "artifacts",
  evidence: "evidence",
  shield: "shield",
  core: "core",
  "core-report-runner": "core",
  contracts: "contracts",
  relationships: "data-flow",
  reports: "reports",
  ground: "ground",
  raw: "raw",
};

export function DashboardIcon({ kind }: { kind: DashboardIconKind }) {
  return (
    <StudioIcon
      kind={DASHBOARD_TO_STUDIO_ICON[kind]}
      className={`dashboard-icon dashboard-icon-${kind}`}
    />
  );
}
