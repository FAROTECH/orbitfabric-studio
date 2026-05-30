import { type ReactNode } from "react";

import { DashboardIcon } from "./DashboardIcon";
import { type NavigationIconKind } from "./navigationModel";

export type MissionCockpitKpiCardVariant =
  | "health"
  | "completeness"
  | "lint"
  | "scenario"
  | "data-products"
  | "commandability"
  | "validation"
  | "model"
  | "coverage"
  | "artifacts";

export type MissionCockpitKpiCardIconKind = NavigationIconKind;

export type MissionCockpitKpiCardState =
  | "core-reported"
  | "not-reported"
  | "unavailable";

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
  state?: MissionCockpitKpiCardState;
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
  state,
  status,
  action,
}: MissionCockpitKpiCardProps) {
  const cardState = state ?? (isReported ? "core-reported" : "unavailable");

  return (
    <article
      className={`cockpit-kpi-card cockpit-kpi-card-${variant} cockpit-kpi-state-${cardState} ${
        isReported ? "cockpit-kpi-state-reported" : "cockpit-kpi-state-unavailable"
      }`}
    >
      <DashboardIcon kind={iconKind} />
      <div>
        <h3>{title}</h3>
        <strong>{value}</strong>
        <div className="cockpit-kpi-detail">{detail}</div>
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
