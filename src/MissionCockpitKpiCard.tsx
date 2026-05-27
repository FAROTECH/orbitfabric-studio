import { type ReactNode } from "react";

import { DashboardIcon } from "./DashboardIcon";

type MissionCockpitKpiCardVariant =
  | "validation"
  | "model"
  | "scenario"
  | "coverage"
  | "artifacts";

type MissionCockpitKpiCardIconKind = MissionCockpitKpiCardVariant;

interface MissionCockpitKpiCardAction {
  label: string;
  onClick: () => void;
  disabled: boolean;
}

interface MissionCockpitKpiCardProps {
  variant: MissionCockpitKpiCardVariant;
  iconKind: MissionCockpitKpiCardIconKind;
  isReported: boolean;
  title: ReactNode;
  value: ReactNode;
  detail: ReactNode;
  status?: ReactNode;
  action?: MissionCockpitKpiCardAction;
}

export function MissionCockpitKpiCard({
  variant,
  iconKind,
  isReported,
  title,
  value,
  detail,
  status,
  action,
}: MissionCockpitKpiCardProps) {
  return (
    <article
      className={`cockpit-kpi-card cockpit-kpi-card-${variant} ${
        isReported ? "cockpit-kpi-state-reported" : "cockpit-kpi-state-unavailable"
      }`}
    >
      <DashboardIcon kind={iconKind} />
      <div>
        <h3>{title}</h3>
        <strong>{value}</strong>
        <span>{detail}</span>
      </div>
      {status ?? null}
      {action ? (
        <button
          type="button"
          className="cockpit-card-action"
          onClick={action.onClick}
          disabled={action.disabled}
        >
          {action.label}
        </button>
      ) : null}
    </article>
  );
}
