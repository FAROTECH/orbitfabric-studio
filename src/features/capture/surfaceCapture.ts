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

interface ToPngOptions {
  cacheBust?: boolean;
  pixelRatio?: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
  style?: Record<string, string | number>;
}

type ToPng = (node: HTMLElement, options?: ToPngOptions) => Promise<string>;

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

  let restoreReactFlowSnapshots: (() => void) | null = null;

  try {
    await nextAnimationFrame();
    await nextAnimationFrame();

    const rect = target.getBoundingClientRect();
    const contentWidth = Math.ceil(Math.max(target.scrollWidth, rect.width));
    const contentHeight = Math.ceil(Math.max(target.scrollHeight, rect.height, 1));
    const pixelRatio = captureScale(contentWidth, contentHeight);
    const background = captureBackgroundColor();
    const { toPng } = await import("html-to-image");
    const renderToPng = toPng as ToPng;

    restoreReactFlowSnapshots = await flattenReactFlowViewports(
      target,
      renderToPng,
    );

    const dataUrl = await renderToPng(target, {
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
    restoreReactFlowSnapshots?.();
    restoreTargetStyles();
    restoreScroll();
  }
}

async function flattenReactFlowViewports(
  target: HTMLElement,
  toPng: ToPng,
): Promise<() => void> {
  const flows = Array.from(target.querySelectorAll<HTMLElement>(".react-flow"));
  const restorers: Array<() => void> = [];

  try {
    for (const flow of flows) {
      const viewport = flow.querySelector<HTMLElement>(".react-flow__viewport");
      const renderer = viewport?.parentElement;

      if (!viewport || !(renderer instanceof HTMLElement)) {
        continue;
      }

      const flowRect = flow.getBoundingClientRect();
      const width = Math.max(1, Math.ceil(flowRect.width));
      const height = Math.max(1, Math.ceil(flowRect.height));
      const viewportStyle = window.getComputedStyle(viewport);
      let dataUrl: string;

      try {
        dataUrl = await toPng(viewport, {
          cacheBust: true,
          pixelRatio: captureScale(width, height),
          width,
          height,
          backgroundColor: "transparent",
          style: {
            width: `${width}px`,
            height: `${height}px`,
            transform: viewportStyle.transform,
            transformOrigin: viewportStyle.transformOrigin || "0 0",
            overflow: "visible",
          },
        });
      } catch (error) {
        throw new Error(
          `React Flow viewport capture failed: ${describeCaptureError(error)}`,
        );
      }

      const snapshot = document.createElement("img");
      snapshot.src = dataUrl;
      snapshot.alt = "";
      snapshot.setAttribute("aria-hidden", "true");
      snapshot.dataset.studioCaptureReactFlowSnapshot = "true";
      snapshot.style.position = "absolute";
      snapshot.style.inset = "0";
      snapshot.style.width = "100%";
      snapshot.style.height = "100%";
      snapshot.style.objectFit = "fill";
      snapshot.style.pointerEvents = "none";
      snapshot.style.zIndex = "2";

      renderer.appendChild(snapshot);
      await waitForImageElement(snapshot);

      const previousDisplay = viewport.style.display;
      viewport.style.display = "none";

      restorers.push(() => {
        snapshot.remove();
        viewport.style.display = previousDisplay;
      });
    }
  } catch (error) {
    for (const restore of restorers.reverse()) {
      restore();
    }
    throw error;
  }

  return () => {
    for (const restore of restorers.reverse()) {
      restore();
    }
  };
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

  return Promise.all(images.map(waitForImageElement)).then(() => undefined);
}

function waitForImageElement(image: HTMLImageElement): Promise<void> {
  if (image.complete) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    image.addEventListener("load", () => resolve(), { once: true });
    image.addEventListener(
      "error",
      (event) => reject(new Error(`Capture image failed to load: ${describeCaptureError(event)}`)),
      { once: true },
    );
  });
}

function describeCaptureError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (error instanceof Event) {
    const target = error.target;
    if (target instanceof HTMLImageElement) {
      return "renderer emitted an error event from <img>";
    }
    return `renderer emitted an ${error.type || "unknown"} event`;
  }
  return String(error);
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
