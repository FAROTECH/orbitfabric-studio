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

  const sourceRect = target.getBoundingClientRect();
  const sourceWidth = Math.ceil(Math.max(target.scrollWidth, sourceRect.width));
  const background = captureBackgroundColor();
  const clone = cloneForCapture(target);

  const staging = document.createElement("div");
  staging.setAttribute("aria-hidden", "true");
  staging.style.cssText = [
    "position:fixed",
    "left:-100000px",
    "top:0",
    `width:${sourceWidth}px`,
    "height:auto",
    "overflow:visible",
    `background:${background}`,
    "pointer-events:none",
    "z-index:-2147483648",
    "contain:none",
  ].join(";");

  clone.style.width = `${sourceWidth}px`;
  clone.style.maxWidth = "none";
  clone.style.height = "auto";
  clone.style.maxHeight = "none";
  clone.style.overflow = "visible";
  staging.appendChild(clone);
  document.body.appendChild(staging);

  try {
    await nextAnimationFrame();
    await nextAnimationFrame();

    const contentWidth = Math.ceil(Math.max(sourceWidth, clone.scrollWidth));
    const contentHeight = Math.ceil(Math.max(1, clone.scrollHeight));
    const wrapper = buildSerializableWrapper(clone, contentWidth, contentHeight, background);
    const svg = serializeAsSvg(wrapper, contentWidth, contentHeight);
    const png = await renderSvgToPng(svg, contentWidth, contentHeight, background);
    const filename = buildCaptureFilename(request);
    const saved = await invoke<SurfaceCaptureSaveResult>("save_surface_capture_png", {
      filename,
      dataUrl: png.dataUrl,
    });
    const copiedToClipboard = await copyPngToClipboard(png.blob);

    return {
      path: saved.path,
      copiedToClipboard,
      width: contentWidth,
      height: contentHeight,
    };
  } finally {
    staging.remove();
  }
}

function cloneForCapture(source: HTMLElement): HTMLElement {
  const clone = source.cloneNode(true) as HTMLElement;
  const sourceElements: Element[] = [source, ...Array.from(source.querySelectorAll("*"))];
  const cloneElements: Element[] = [clone, ...Array.from(clone.querySelectorAll("*"))];

  for (let index = 0; index < sourceElements.length; index += 1) {
    const sourceElement = sourceElements[index];
    const cloneElement = cloneElements[index];

    if (!sourceElement || !cloneElement) {
      continue;
    }

    inlineComputedStyle(sourceElement, cloneElement);
    preserveFormState(sourceElement, cloneElement);
    expandVerticalScrollContent(sourceElement, cloneElement);
  }

  return clone;
}

function inlineComputedStyle(source: Element, clone: Element) {
  const computed = window.getComputedStyle(source);
  const styledClone = clone as HTMLElement | SVGElement;

  for (const property of Array.from(computed)) {
    const value = computed.getPropertyValue(property);
    const priority = computed.getPropertyPriority(property);
    styledClone.style.setProperty(property, value, priority);
  }

  styledClone.style.setProperty("animation", "none", "important");
  styledClone.style.setProperty("transition", "none", "important");
  styledClone.style.setProperty("caret-color", "transparent", "important");
}

function preserveFormState(source: Element, clone: Element) {
  if (source instanceof HTMLInputElement && clone instanceof HTMLInputElement) {
    clone.value = source.value;
    clone.checked = source.checked;
  } else if (source instanceof HTMLTextAreaElement && clone instanceof HTMLTextAreaElement) {
    clone.value = source.value;
    clone.textContent = source.value;
  } else if (source instanceof HTMLSelectElement && clone instanceof HTMLSelectElement) {
    clone.value = source.value;
  }
}

function expandVerticalScrollContent(source: Element, clone: Element) {
  if (!(source instanceof HTMLElement) || !(clone instanceof HTMLElement)) {
    return;
  }

  if (source.scrollHeight <= source.clientHeight + 1) {
    return;
  }

  const overflowY = window.getComputedStyle(source).overflowY;
  if (!matchesScrollableOverflow(overflowY)) {
    return;
  }

  clone.style.height = `${source.scrollHeight}px`;
  clone.style.maxHeight = "none";
  clone.style.overflowY = "visible";
}

function matchesScrollableOverflow(value: string): boolean {
  return value === "auto" || value === "scroll" || value === "hidden" || value === "clip";
}

function buildSerializableWrapper(
  clone: HTMLElement,
  width: number,
  height: number,
  background: string,
): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
  wrapper.style.cssText = [
    `width:${width}px`,
    `height:${height}px`,
    `background:${background}`,
    "overflow:hidden",
    "margin:0",
    "padding:0",
  ].join(";");

  wrapper.appendChild(clone);
  return wrapper;
}

function serializeAsSvg(wrapper: HTMLElement, width: number, height: number): string {
  const serialized = new XMLSerializer().serializeToString(wrapper);

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<foreignObject x="0" y="0" width="100%" height="100%">${serialized}</foreignObject>`,
    "</svg>",
  ].join("");
}

async function renderSvgToPng(
  svg: string,
  width: number,
  height: number,
  background: string,
): Promise<{ dataUrl: string; blob: Blob }> {
  const scale = captureScale(width, height);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Studio could not create the PNG capture canvas.");
  }

  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const objectUrl = URL.createObjectURL(svgBlob);

  try {
    const image = await loadImage(objectUrl);
    context.fillStyle = background;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.scale(scale, scale);
    context.drawImage(image, 0, 0, width, height);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }

  const blob = await canvasToPngBlob(canvas);
  const dataUrl = await blobToDataUrl(blob);
  return { dataUrl, blob };
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

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Studio could not render the captured surface."));
    image.src = url;
  });
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Studio could not encode the captured surface as PNG."));
      }
    }, "image/png");
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Studio could not encode the PNG for saving."));
      }
    };
    reader.onerror = () => reject(new Error("Studio could not read the PNG capture."));
    reader.readAsDataURL(blob);
  });
}

async function copyPngToClipboard(blob: Blob): Promise<boolean> {
  try {
    if (!navigator.clipboard || typeof ClipboardItem === "undefined") {
      return false;
    }

    await navigator.clipboard.write([
      new ClipboardItem({
        "image/png": blob,
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
  const images = Array.from(root.querySelectorAll("img")).filter((image) => !image.complete);

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

  if (background && background !== "rgba(0, 0, 0, 0)" && background !== "transparent") {
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
