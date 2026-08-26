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

  const restoreCaptureLayout = prepareCaptureLayout(target);
  let restoreGraphSnapshots: (() => void) | null = null;

  try {
    await nextAnimationFrame();
    await nextAnimationFrame();

    const rect = target.getBoundingClientRect();
    const contentWidth = Math.ceil(Math.max(target.scrollWidth, rect.width));
    const contentHeight = Math.ceil(Math.max(target.scrollHeight, rect.height, 1));
    const pixelRatio = captureScale(contentWidth, contentHeight);
    const background = captureBackgroundColor();
    const hasReactFlow = target.querySelector(".react-flow") !== null;

    if (hasReactFlow) {
      restoreGraphSnapshots = await flattenReactFlowEdgeLayers(target);
      await nextAnimationFrame();
    }

    const dataUrl = hasReactFlow
      ? await renderGraphSurfaceWithCanvas(
          target,
          contentWidth,
          contentHeight,
          pixelRatio,
          background,
        )
      : await renderSurfaceWithHtmlToImage(
          target,
          contentWidth,
          contentHeight,
          pixelRatio,
          background,
        );

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
    restoreGraphSnapshots?.();
    restoreCaptureLayout();
  }
}

function prepareCaptureLayout(target: HTMLElement): () => void {
  const restorers: Array<() => void> = [];

  const studioSurface = target.closest<HTMLElement>(".studio-main-surface");
  if (studioSurface) {
    restorers.push(preserveScrollPosition(studioSurface));
    studioSurface.scrollTo({ top: 0, left: 0 });
  }

  restorers.push(
    applyTemporaryStyles(target, {
      height: "auto",
      "max-height": "none",
      overflow: "visible",
      transform: "none",
    }),
  );

  const nestedScrollers = Array.from(target.querySelectorAll<HTMLElement>("*"))
    .filter((element) => !element.closest(".react-flow"))
    .filter((element) => {
      const style = window.getComputedStyle(element);
      const scrollsVertically = style.overflowY === "auto" || style.overflowY === "scroll";
      return scrollsVertically && element.scrollHeight > element.clientHeight + 1;
    });

  for (const scroller of nestedScrollers) {
    restorers.push(preserveScrollPosition(scroller));
    const expandedHeight = Math.max(scroller.scrollHeight, scroller.clientHeight, 1);
    restorers.push(
      applyTemporaryStyles(scroller, {
        height: `${expandedHeight}px`,
        "max-height": "none",
        "overflow-y": "visible",
        "scrollbar-gutter": "auto",
      }),
    );
    scroller.scrollTo({ top: 0, left: scroller.scrollLeft });
  }

  const xray = target.querySelector<HTMLElement>(".entity-xray");
  if (xray) {
    restorers.push(
      applyTemporaryStyles(xray, {
        height: "auto",
        "max-height": "none",
        overflow: "visible",
        "grid-template-rows": "auto auto auto",
        "align-self": "start",
      }),
    );
  }

  return () => {
    for (const restore of restorers.reverse()) {
      restore();
    }
  };
}

async function flattenReactFlowEdgeLayers(target: HTMLElement): Promise<() => void> {
  const edgeSvgs = uniqueEdgeSvgLayers(target);
  const restorers: Array<() => void> = [];

  try {
    for (const svg of edgeSvgs) {
      const flow = svg.closest<HTMLElement>(".react-flow");
      const parent = svg.parentElement;
      if (!flow || !(parent instanceof HTMLElement)) {
        continue;
      }

      const width = Math.max(flow.clientWidth, 1);
      const height = Math.max(flow.clientHeight, 1);
      const pngDataUrl = await rasterizeSvgLayer(svg, width, height);
      const snapshot = document.createElement("img");

      snapshot.src = pngDataUrl;
      snapshot.alt = "";
      snapshot.setAttribute("aria-hidden", "true");
      snapshot.dataset.studioCaptureReactFlowEdges = "true";
      snapshot.style.position = "absolute";
      snapshot.style.inset = "0";
      snapshot.style.width = "100%";
      snapshot.style.height = "100%";
      snapshot.style.objectFit = "fill";
      snapshot.style.pointerEvents = "none";

      parent.insertBefore(snapshot, svg);
      await waitForSnapshotImage(snapshot);

      const previousVisibility = svg.style.visibility;
      svg.style.visibility = "hidden";

      restorers.push(() => {
        svg.style.visibility = previousVisibility;
        snapshot.remove();
      });
    }
  } catch (error) {
    for (const restore of restorers.reverse()) {
      restore();
    }
    throw new Error(`React Flow edge snapshot failed: ${describeCaptureError(error)}`);
  }

  return () => {
    for (const restore of restorers.reverse()) {
      restore();
    }
  };
}

function uniqueEdgeSvgLayers(target: HTMLElement): SVGSVGElement[] {
  const result: SVGSVGElement[] = [];
  const seen = new Set<SVGSVGElement>();

  for (const path of target.querySelectorAll<SVGElement>(".react-flow__edge-path")) {
    const svg = path.closest("svg");
    if (svg instanceof SVGSVGElement && !seen.has(svg)) {
      seen.add(svg);
      result.push(svg);
    }
  }

  return result;
}

async function rasterizeSvgLayer(
  source: SVGSVGElement,
  width: number,
  height: number,
): Promise<string> {
  const clone = source.cloneNode(true) as SVGSVGElement;
  inlineComputedSvgStyles(source, clone);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));

  if (!clone.hasAttribute("viewBox")) {
    clone.setAttribute("viewBox", `0 0 ${width} ${height}`);
  }

  const serialized = new XMLSerializer().serializeToString(clone);
  const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialized)}`;
  const image = new Image();
  image.src = svgDataUrl;
  await waitForSnapshotImage(image);

  const scale = captureScale(width, height);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.ceil(width * scale));
  canvas.height = Math.max(1, Math.ceil(height * scale));
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Studio could not create a canvas for the React Flow edge layer.");
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

function inlineComputedSvgStyles(source: SVGSVGElement, clone: SVGSVGElement) {
  const sourceElements: Element[] = [source, ...source.querySelectorAll("*")];
  const cloneElements: Element[] = [clone, ...clone.querySelectorAll("*")];
  const properties = [
    "color",
    "display",
    "fill",
    "fill-opacity",
    "font-family",
    "font-size",
    "font-style",
    "font-weight",
    "marker-end",
    "marker-mid",
    "marker-start",
    "opacity",
    "stroke",
    "stroke-dasharray",
    "stroke-dashoffset",
    "stroke-linecap",
    "stroke-linejoin",
    "stroke-opacity",
    "stroke-width",
    "text-anchor",
    "visibility",
  ];

  for (let index = 0; index < sourceElements.length; index += 1) {
    const sourceElement = sourceElements[index];
    const cloneElement = cloneElements[index];
    if (!(cloneElement instanceof SVGElement)) {
      continue;
    }

    const computed = window.getComputedStyle(sourceElement);
    for (const property of properties) {
      const value = computed.getPropertyValue(property);
      if (value) {
        cloneElement.style.setProperty(property, value);
      }
    }
  }
}

async function renderSurfaceWithHtmlToImage(
  target: HTMLElement,
  width: number,
  height: number,
  pixelRatio: number,
  background: string,
): Promise<string> {
  try {
    const { toPng } = await import("html-to-image");
    return await toPng(target, {
      cacheBust: true,
      pixelRatio,
      width,
      height,
      backgroundColor: background,
      style: {
        width: `${width}px`,
        height: `${height}px`,
        maxHeight: "none",
        overflow: "visible",
        transform: "none",
      },
    });
  } catch (error) {
    throw new Error(`Surface capture failed: ${describeCaptureError(error)}`);
  }
}

async function renderGraphSurfaceWithCanvas(
  target: HTMLElement,
  width: number,
  height: number,
  pixelRatio: number,
  background: string,
): Promise<string> {
  try {
    const { default: html2canvas } = await import("html2canvas");
    const documentWidth = Math.max(
      document.documentElement.clientWidth,
      document.documentElement.scrollWidth,
      width,
    );
    const documentHeight = Math.max(
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      height,
    );

    const canvas = await html2canvas(target, {
      backgroundColor: background,
      scale: pixelRatio,
      width,
      height,
      windowWidth: documentWidth,
      windowHeight: documentHeight,
      scrollX: 0,
      scrollY: 0,
      useCORS: true,
      allowTaint: false,
      logging: false,
      imageTimeout: 5_000,
    });

    return canvas.toDataURL("image/png");
  } catch (error) {
    throw new Error(`React Flow surface capture failed: ${describeCaptureError(error)}`);
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

function waitForSnapshotImage(image: HTMLImageElement): Promise<void> {
  if (image.complete) {
    return image.naturalWidth > 0
      ? Promise.resolve()
      : Promise.reject(new Error("Capture snapshot image could not be decoded."));
  }

  return new Promise<void>((resolve, reject) => {
    image.addEventListener("load", () => resolve(), { once: true });
    image.addEventListener(
      "error",
      (event) =>
        reject(new Error(`Capture snapshot image failed to load: ${describeCaptureError(event)}`)),
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
