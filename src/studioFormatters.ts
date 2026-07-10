import type { TargetDomainId } from "./navigationModel";

export function formatNavigationLabel(navigationId: TargetDomainId): string {
  return navigationId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ").replace(" And ", " & " );
}

export function formatUnknownBlock(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value, null, 2);
}

export function formatDashboardStatusLabel(value: string | null): string {
  return value ? value.toUpperCase() : "UNAVAILABLE";
}
