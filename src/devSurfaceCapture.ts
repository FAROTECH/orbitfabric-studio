import { invoke } from "@tauri-apps/api/core";

import {
  DEV_SURFACE_CAPTURE_TARGETS,
  type DevSurfaceCaptureMode,
  type DevSurfaceCaptureTargetSpec,
} from "./devSurfaceCaptureManifest";
import type { ActiveSurface, TargetDomainId } from "./navigationModel";

export interface DevSurfaceCaptureContext {
  activeSurface: ActiveSurface;
  activeNavigationId: TargetDomainId;
}

interface ResolvedCaptureTarget {
  label: string;
  target: HTMLElement;
  scrollOwner: HTMLElement;
  targetSelector: string;
}

interface CaptureMetadata {
  label: string;
  mode: DevSurfaceCaptureMode;
  profile: string;
  viewportWidth: number;
  viewportHeight: number;
  contentWidth: number;
  contentHeight: number;
  sidebarState: "collapsed" | "expanded";
  dpr: number;
  scrollOwnerSelector: string;
  targetSelector: string;
  timestamp: string;
}

interface DevCaptureSaveResult {
  path: string;
}


export function isDevSurfaceCaptureEnabled(): boolean {
  return true;
}

export async function captureActiveSurface(
  context: DevSurfaceCaptureContext,
  mode: DevSurfaceCaptureMode,
): Promise<string> {
  const enteredFullscreen = mode === "fullscreen" ? await enterFullscreenForCapture() : false;

  try {
    await nextAnimationFrame();
    await nextAnimationFrame();

    const resolvedTarget = resolveCaptureTarget(context);
    await waitForImages(resolvedTarget.target);

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const initialContentWidth = measureContentWidth(resolvedTarget.target);
    const initialContentHeight = measureContentHeight(resolvedTarget.target);
    const timestamp = new Date().toISOString();

    const metadata: CaptureMetadata = {
      label: resolvedTarget.label,
      mode,
      profile: mode === "fullscreen" ? "Fullscreen current monitor" : "Current window",
      viewportWidth,
      viewportHeight,
      contentWidth: initialContentWidth,
      contentHeight: initialContentHeight,
      sidebarState: getSidebarState(),
      dpr: window.devicePixelRatio || 1,
      scrollOwnerSelector: selectorForElement(resolvedTarget.scrollOwner),
      targetSelector: resolvedTarget.targetSelector,
      timestamp,
    };

    const overlay = createMetadataOverlay(metadata);
    const restoreScroll = preserveScrollPosition(resolvedTarget.scrollOwner);
    const restoreTargetStyles = applyTemporaryStyles(resolvedTarget.target, {
      "max-height": "none",
      "overflow": "visible",
    });

    resolvedTarget.scrollOwner.scrollTo({ top: 0, left: 0 });
    resolvedTarget.target.insertBefore(overlay, resolvedTarget.target.firstChild);

    try {
      await nextAnimationFrame();

      const contentWidth = measureContentWidth(resolvedTarget.target);
      const contentHeight = measureContentHeight(resolvedTarget.target);
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(resolvedTarget.target, {
        cacheBust: true,
        pixelRatio,
        width: contentWidth,
        height: contentHeight,
        style: {
          width: `${contentWidth}px`,
          height: `${contentHeight}px`,
          maxHeight: "none",
          overflow: "visible",
          transform: "none",
        },
      });

      const filename = buildFilename({ ...metadata, contentWidth, contentHeight });
      const savedPath = await saveCaptureDataUrl(dataUrl, filename);
      await copyDataUrlToClipboard(dataUrl).catch(() => undefined);
      return savedPath;
    } finally {
      overlay.remove();
      restoreTargetStyles();
      restoreScroll();
    }
  } finally {
    if (enteredFullscreen && document.fullscreenElement) {
      await document.exitFullscreen().catch(() => undefined);
    }
  }
}

function resolveCaptureTarget(context: DevSurfaceCaptureContext): ResolvedCaptureTarget {
  const targetSpec = DEV_SURFACE_CAPTURE_TARGETS.find((candidate: DevSurfaceCaptureTargetSpec) => {
    if (candidate.activeSurface !== context.activeSurface) {
      return false;
    }

    return candidate.activeNavigationId
      ? candidate.activeNavigationId === context.activeNavigationId
      : true;
  });

  if (targetSpec) {
    const scopedTarget = document.querySelector<HTMLElement>(
      `${targetSpec.shellSelector} ${targetSpec.targetSelector}`,
    );
    const target = scopedTarget ?? document.querySelector<HTMLElement>(targetSpec.targetSelector);

    if (target) {
      return {
        label: targetSpec.label,
        target,
        scrollOwner: target.closest<HTMLElement>(".main-surface") ?? target,
        targetSelector: scopedTarget
          ? `${targetSpec.shellSelector} ${targetSpec.targetSelector}`
          : targetSpec.targetSelector,
      };
    }
  }

  const fallback = document.querySelector<HTMLElement>(".main-surface");

  if (!fallback) {
    throw new Error("No active Studio surface capture target found.");
  }

  return {
    label: "Active Surface",
    target: fallback,
    scrollOwner: fallback,
    targetSelector: ".main-surface",
  };
}

async function enterFullscreenForCapture(): Promise<boolean> {
  if (document.fullscreenElement) {
    return false;
  }

  const target = document.documentElement;

  if (!target.requestFullscreen) {
    throw new Error("Fullscreen capture is not available in this WebView.");
  }

  await target.requestFullscreen({ navigationUI: "hide" });
  await waitForFullscreenElement();
  return true;
}

function waitForFullscreenElement(): Promise<void> {
  if (document.fullscreenElement) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const onFullscreenChange = () => {
      if (document.fullscreenElement) {
        document.removeEventListener("fullscreenchange", onFullscreenChange);
        resolve();
      }
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    window.setTimeout(() => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      resolve();
    }, 1200);
  });
}

function nextAnimationFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function waitForImages(root: HTMLElement): Promise<void> {
  const pendingImages = Array.from(root.querySelectorAll("img")).filter(
    (image) => !image.complete,
  );

  if (pendingImages.length === 0) {
    return Promise.resolve();
  }

  return Promise.all(
    pendingImages.map(
      (image) =>
        new Promise<void>((resolve) => {
          image.addEventListener("load", () => resolve(), { once: true });
          image.addEventListener("error", () => resolve(), { once: true });
        }),
    ),
  ).then(() => undefined);
}

function measureContentWidth(element: HTMLElement): number {
  const rect = element.getBoundingClientRect();
  return Math.ceil(Math.max(element.scrollWidth, rect.width));
}

function measureContentHeight(element: HTMLElement): number {
  const rect = element.getBoundingClientRect();
  return Math.ceil(Math.max(element.scrollHeight, rect.height));
}

function preserveScrollPosition(element: HTMLElement): () => void {
  const top = element.scrollTop;
  const left = element.scrollLeft;

  return () => {
    element.scrollTo({ top, left });
  };
}

function applyTemporaryStyles(
  element: HTMLElement,
  styles: Record<string, string>,
): () => void {
  const previousValues = Object.entries(styles).map(([property, value]) => {
    const previousValue = element.style.getPropertyValue(property);
    element.style.setProperty(property, value);
    return [property, previousValue] as const;
  });

  return () => {
    for (const [property, previousValue] of previousValues) {
      if (previousValue) {
        element.style.setProperty(property, previousValue);
      } else {
        element.style.removeProperty(property);
      }
    }
  };
}

function createMetadataOverlay(metadata: CaptureMetadata): HTMLElement {
  const overlay = document.createElement("section");
  overlay.setAttribute("aria-label", "OrbitFabric Studio surface capture metadata");
  overlay.dataset.ofDevCaptureOverlay = "true";
  overlay.style.cssText = [
    "display:grid",
    "gap:6px",
    "margin:0 0 14px 0",
    "border:1px solid rgba(103,232,249,0.42)",
    "border-radius:16px",
    "padding:12px 14px",
    "background:linear-gradient(135deg, rgba(2,6,23,0.98), rgba(8,47,73,0.92))",
    "color:#dff8ff",
    "box-shadow:0 14px 38px rgba(0,0,0,0.28)",
    "font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    "font-size:11px",
    "line-height:1.35",
    "letter-spacing:0.01em",
    "position:relative",
    "z-index:999",
  ].join(";");

  const title = document.createElement("strong");
  title.textContent = "OrbitFabric Studio Surface Capture";
  title.style.cssText = "color:#67e8f9;font-size:12px;letter-spacing:0.08em;text-transform:uppercase";
  overlay.appendChild(title);

  const rows = [
    `Surface: ${metadata.label}`,
    `Mode: ${formatMode(metadata.mode)}`,
    `Profile: ${metadata.profile}`,
    `Viewport: ${metadata.viewportWidth}x${metadata.viewportHeight}`,
    `Captured content: ${metadata.contentWidth}x${metadata.contentHeight}`,
    `Sidebar: ${metadata.sidebarState}`,
    `DPR: ${metadata.dpr}`,
    `Scroll owner: ${metadata.scrollOwnerSelector}`,
    `Target: ${metadata.targetSelector}`,
    `Timestamp: ${metadata.timestamp}`,
  ];

  const rowGrid = document.createElement("div");
  rowGrid.style.cssText = "display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 18px";

  for (const row of rows) {
    const item = document.createElement("span");
    item.textContent = row;
    item.style.cssText = "min-width:0;overflow-wrap:anywhere;color:#cbd5e1";
    rowGrid.appendChild(item);
  }

  overlay.appendChild(rowGrid);
  return overlay;
}

function formatMode(mode: DevSurfaceCaptureMode): string {
  return mode === "fullscreen" ? "Full surface fullscreen" : "Full surface current window";
}

function getSidebarState(): "collapsed" | "expanded" {
  return document.querySelector(".workbench-layout-sidebar-collapsed")
    ? "collapsed"
    : "expanded";
}

function selectorForElement(element: HTMLElement): string {
  if (element.id) {
    return `#${element.id}`;
  }

  const classList = Array.from(element.classList);

  if (classList.length > 0) {
    return `.${classList.join(".")}`;
  }

  return element.tagName.toLowerCase();
}

function buildFilename(metadata: CaptureMetadata): string {
  return [
    "of-studio-capture",
    slug(metadata.label),
    slug(metadata.mode),
    `viewport-${metadata.viewportWidth}x${metadata.viewportHeight}`,
    `content-${metadata.contentWidth}x${metadata.contentHeight}`,
    `sidebar-${metadata.sidebarState}`,
    slug(metadata.timestamp),
  ].join("__") + ".png";
}

function slug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function saveCaptureDataUrl(dataUrl: string, filename: string): Promise<string> {
  const result = await invoke<DevCaptureSaveResult>("save_dev_capture_png", {
    filename,
    dataUrl,
  });

  return result.path;
}

async function copyDataUrlToClipboard(dataUrl: string): Promise<void> {
  if (!navigator.clipboard || typeof ClipboardItem === "undefined") {
    return;
  }

  const blob = await dataUrlToBlob(dataUrl);
  await navigator.clipboard.write([
    new ClipboardItem({
      [blob.type]: blob,
    }),
  ]);
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  return response.blob();
}
