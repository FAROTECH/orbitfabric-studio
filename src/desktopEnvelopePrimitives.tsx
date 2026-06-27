import type { ReactNode } from "react";

export type DesktopSurfaceWidth = "readable" | "content" | "wide" | "full";
export type DesktopSurfaceDensity = "compact" | "standard" | "dense";
export type DesktopGridColumns = 2 | 3 | 4 | 5 | 6;
export type DesktopSplitVariant = "standard" | "balanced" | "wide-main";

export interface DesktopSurfaceProps {
  children: ReactNode;
  label: string;
  className?: string;
  id?: string;
  width?: DesktopSurfaceWidth;
  density?: DesktopSurfaceDensity;
}

export function DesktopSurface({
  children,
  label,
  className,
  id,
  width = "content",
  density = "standard",
}: DesktopSurfaceProps) {
  return (
    <section
      id={id}
      className={cx(
        "of-desktop-surface",
        `of-desktop-surface-width-${width}`,
        `of-desktop-surface-density-${density}`,
        className,
      )}
      aria-label={label}
      data-of-desktop-surface="true"
    >
      {children}
    </section>
  );
}

export interface DesktopHeroProps {
  title: string;
  eyebrow?: string;
  summary?: string;
  aside?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function DesktopHero({
  title,
  eyebrow,
  summary,
  aside,
  className,
  children,
}: DesktopHeroProps) {
  return (
    <header className={cx("of-desktop-hero", className)}>
      <div className="of-desktop-hero-main">
        {eyebrow ? <span className="of-desktop-kicker">{eyebrow}</span> : null}
        <h1 className="of-desktop-title">{title}</h1>
        {summary ? <p className="of-desktop-summary">{summary}</p> : null}
        {children}
      </div>
      {aside ? <div className="of-desktop-hero-aside">{aside}</div> : null}
    </header>
  );
}

export interface DesktopCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  summary?: string;
  ariaLabel?: string;
}

export function DesktopCard({
  children,
  className,
  title,
  summary,
  ariaLabel,
}: DesktopCardProps) {
  return (
    <article className={cx("of-desktop-card", className)} aria-label={ariaLabel}>
      {title ? <h2 className="of-desktop-card-title">{title}</h2> : null}
      {summary ? <p className="of-desktop-card-copy">{summary}</p> : null}
      {children}
    </article>
  );
}

export interface DesktopPanelProps {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}

export function DesktopPanel({ children, className, ariaLabel }: DesktopPanelProps) {
  return (
    <section className={cx("of-desktop-panel", className)} aria-label={ariaLabel}>
      {children}
    </section>
  );
}

export interface DesktopGridProps {
  children: ReactNode;
  columns?: DesktopGridColumns;
  className?: string;
  ariaLabel?: string;
}

export function DesktopGrid({
  children,
  columns = 3,
  className,
  ariaLabel,
}: DesktopGridProps) {
  return (
    <section
      className={cx("of-desktop-grid", `of-desktop-grid-${columns}`, className)}
      aria-label={ariaLabel}
    >
      {children}
    </section>
  );
}

export interface DesktopSplitProps {
  main: ReactNode;
  aside: ReactNode;
  variant?: DesktopSplitVariant;
  className?: string;
  ariaLabel?: string;
}

export function DesktopSplit({
  main,
  aside,
  variant = "standard",
  className,
  ariaLabel,
}: DesktopSplitProps) {
  return (
    <section
      className={cx(
        "of-desktop-split",
        variant === "balanced" ? "of-desktop-split-balanced" : null,
        variant === "wide-main" ? "of-desktop-split-wide-main" : null,
        className,
      )}
      aria-label={ariaLabel}
    >
      <div>{main}</div>
      <aside>{aside}</aside>
    </section>
  );
}

export interface DesktopStat {
  label: string;
  value: string;
  detail: string;
}

export interface DesktopStatStripProps {
  stats: DesktopStat[];
  className?: string;
  ariaLabel?: string;
}

export function DesktopStatStrip({
  stats,
  className,
  ariaLabel = "Surface statistics",
}: DesktopStatStripProps) {
  return (
    <section className={cx("of-desktop-stat-strip", className)} aria-label={ariaLabel}>
      {stats.map((stat) => (
        <article className="of-desktop-stat" key={stat.label}>
          <span>{stat.label}</span>
          <strong>{stat.value}</strong>
          <small>{stat.detail}</small>
        </article>
      ))}
    </section>
  );
}

function cx(...classes: Array<string | null | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}
