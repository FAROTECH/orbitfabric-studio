import { invoke } from "@tauri-apps/api/core";

import type { EntityRef } from "../../mission/entityRef";

const MAX_CANVAS_EDGE = 16_384;
const MAX_CANVAS_PIXELS = 64_000_000;

interface CaptureRequest {
  missionId: string;
  view: string;
  selection: EntityRef | null;
}

interface SurfaceCaptureSaveResult {
  path: string;
}

export interface SurfaceCaptureResult {
  path: string;
  copiedToClipboard: boolean;
  width: number;
  height: number;
}

export async function captureCurrentStudioSurface(
  request: CaptureRequest,
): Promise<SurfaceCaptureResult> {
  const target = document.querySelector<HTMLElement>(
    ".studio-main-surface .workspace-layout",
  );

  if (!target) {
    throw new Error("No active Studio surface is available to capture.");
  }

  await waitForStableRendering(target);

  const scrollOwner =
    target.closest<HTMLElement>(".studio-main-surface") ?? target;
  const restoreScroll = preserveScrollPosition(scrollOwner);
  const restoreTargetStyles = applyTemporaryStyles(target, {
    height: "auto",
    "max-height": "none",
    overflow: "visible",
    transform: "none",
  });

  scrollOwner.scrollTo({ top: 0, left: 0 });

  try {
    await nextAnimationFrame();
    await nextAnimationFrame();

    const rect = target.getBoundingClientRect();
    const contentWidth = Math.ceil(Math.max(target.scrollWidth, rect.width));
    const contentHeight = Math.ceil(Math.max(target.scrollHeight, rect.height, 1));
    const pixelRatio = captureScale(contentWidth, contentHeight);
    const background = captureBackgroundColor();
    const { toPng } = await import("html-to-image");

    const dataUrl = await toPng(target, {
      cacheBust: true,
      pixelRatio,
      width: contentWidth,
      height: contentHeight,
      backgroundColor: background,
      style: {
        width: `${contentWidth}px`,
        height: `${contentHeight}px`,
        maxHeight: "none",
        overflow: "visible",
        transform: "none",
      },
    });

    const filename = buildCaptureFilename(request);
    const saved = await invoke<SurfaceCaptureSaveResult>("save_surface_capture_png", {
      filename,
      dataUrl,
    });
    const copiedToClipboard = await copyDataUrlToClipboard(dataUrl);

    return {
      path: saved.path,
      copiedToClipboard,
      width: contentWidth,
      height: contentHeight,
    };
  } finally {
    restoreTargetStyles();
    restoreScroll();
  }
}

function captureScale(width: number, height: number): number {
  let scale = Math.min(window.devicePixelRatio || 1, 2);
  scale = Math.min(scale, MAX_CANVAS_EDGE / width, MAX_CANVAS_EDGE / height);
  scale = Math.min(scale, Math.sqrt(MAX_CANVAS_PIXELS / (width * height)));

  if (!Number.isFinite(scale) || scale <= 0) {
    return 1;
  }

  return Math.min(2, scale);
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
  const previous = Object.entries(styles).map(([property, value]) => {
    const previousValue = element.style.getPropertyValue(property);
    const previousPriority = element.style.getPropertyPriority(property);
    element.style.setProperty(property, value);
    return [property, previousValue, previousPriority] as const;
  });

  return () => {
    for (const [property, previousValue, previousPriority] of previous) {
      if (previousValue) {
        element.style.setProperty(property, previousValue, previousPriority);
      } else {
        element.style.removeProperty(property);
      }
    }
  };
}

async function copyDataUrlToClipboard(dataUrl: string): Promise<boolean> {
  try {
    if (!navigator.clipboard || typeof ClipboardItem === "undefined") {
      return false;
    }

    const response = await fetch(dataUrl);
    const blob = await response.blob();

    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type || "image/png"]: blob,
      }),
    ]);
    return true;
  } catch {
    return false;
  }
}

async function waitForStableRendering(target: HTMLElement) {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  await waitForImages(target);
  await nextAnimationFrame();
  await nextAnimationFrame();
}

function waitForImages(root: HTMLElement): Promise<void> {
  const images = Array.from(root.querySelectorAll("img")).filter(
    (image) => !image.complete,
  );

  if (images.length === 0) {
    return Promise.resolve();
  }

  return Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          image.addEventListener("load", () => resolve(), { once: true });
          image.addEventListener("error", () => resolve(), { once: true });
        }),
    ),
  ).then(() => undefined);
}

function captureBackgroundColor(): string {
  const surface = document.querySelector<HTMLElement>(".studio-main-surface");
  const candidate = surface ?? document.body;
  const background = window.getComputedStyle(candidate).backgroundColor;

  if (
    background &&
    background !== "rgba(0, 0, 0, 0)" &&
    background !== "transparent"
  ) {
    return background;
  }

  return window.getComputedStyle(document.body).backgroundColor || "#0b0e13";
}

function buildCaptureFilename(request: CaptureRequest): string {
  const parts = ["orbitfabric-studio", request.missionId, request.view];

  if (request.selection) {
    parts.push(request.selection.domain, request.selection.id);
  }

  parts.push(new Date().toISOString().replace(/[:.]/g, "-"));
  return `${parts.map(slug).filter(Boolean).join("__")}.png`;
}

function slug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function nextAnimationFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}
