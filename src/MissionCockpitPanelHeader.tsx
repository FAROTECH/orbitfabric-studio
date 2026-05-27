import { type ReactNode } from "react";

interface MissionCockpitPanelHeaderProps {
  eyebrow: ReactNode;
  title: ReactNode;
  trailing: ReactNode;
}

export function MissionCockpitPanelHeader({
  eyebrow,
  title,
  trailing,
}: MissionCockpitPanelHeaderProps) {
  return (
    <div className="cockpit-panel-header">
      <div>
        <span className="cockpit-eyebrow">{eyebrow}</span>
        <h3>{title}</h3>
      </div>
      {trailing}
    </div>
  );
}
