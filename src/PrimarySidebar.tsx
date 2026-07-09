import { useEffect, useRef } from "react";

import { DashboardIcon } from "./DashboardIcon";
import { StudioIcon } from "./StudioIcon";
import { shellSurfaceItems, type ActiveSurface, type TargetDomainId } from "./navigationModel";

export function PrimarySidebar({
  activeNavigationId,
  surfaceAvailability,
  isCollapsed,
  onToggleCollapsed,
  onNavigationSelect,
}: {
  activeNavigationId: TargetDomainId | null;
  surfaceAvailability: Record<ActiveSurface, boolean>;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  onNavigationSelect: (surface: ActiveSurface, navigationId: TargetDomainId) => void;
}) {
  const activeItemRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!activeNavigationId) {
      activeItemRef.current = null;
      return;
    }

    activeItemRef.current?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });
  }, [activeNavigationId]);

  return (
    <nav
      className={[
        "primary-sidebar",
        "cockpit-sidebar",
        "reference-sidebar",
        isCollapsed ? "reference-sidebar-collapsed" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Studio surfaces"
    >
      <ul className="surface-nav-list cockpit-surface-nav-list reference-sidebar-nav">
        {shellSurfaceItems.map((item) => {
          const isActive = activeNavigationId !== null && item.id === activeNavigationId;
          const isEnabled = Boolean(surfaceAvailability[item.surface]);
          const itemClassName = [
            "surface-nav-item",
            "cockpit-surface-nav-item",
            "reference-sidebar-item",
            isActive ? "surface-nav-item-active reference-sidebar-item-active" : "",
            !isEnabled ? "surface-nav-item-disabled reference-sidebar-item-disabled" : "",
          ]
            .filter(Boolean)
            .join(" ");

          const itemContent = (
            <>
              <DashboardIcon kind={item.icon} />
              <span className="surface-nav-copy reference-sidebar-copy">
                <strong>{item.label}</strong>
              </span>
            </>
          );

          return (
            <li key={item.label}>
              {isEnabled ? (
                <a
                  ref={(node) => {
                    if (isActive) {
                      activeItemRef.current = node;
                    }
                  }}
                  className={`${itemClassName} surface-nav-link`}
                  href={`#${item.targetId}`}
                  title={item.label}
                  aria-current={isActive ? "page" : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    onNavigationSelect(item.surface, item.id);
                  }}
                >
                  {itemContent}
                </a>
              ) : (
                <span
                  ref={(node) => {
                    if (isActive) {
                      activeItemRef.current = node;
                    }
                  }}
                  className={itemClassName}
                  title={item.label}
                  aria-disabled="true"
                >
                  {itemContent}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        className="reference-sidebar-collapse"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-pressed={isCollapsed}
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        onClick={onToggleCollapsed}
      >
        <StudioIcon kind={isCollapsed ? "collapse-right" : "collapse-left"} />
      </button>
    </nav>
  );
}
