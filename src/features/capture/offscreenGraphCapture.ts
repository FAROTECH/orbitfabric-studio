import { invoke } from "@tauri-apps/api/core";

import type { EntityRef } from "../../mission/entityRef";
import {
  captureCurrentStudioSurface as captureStandardStudioSurface,
  type SurfaceCaptureResult,
} from "./surfaceCapture";

const MAX_CANVAS_EDGE = 16_384;
const MAX_CANVAS_PIXELS = 64_000_000;
const CAPTURE_BOTTOM_GUARD = 12;

interface CaptureRequest {
  missionId: string;
  view: string;
  selection: EntityRef | null;
}

interface SurfaceCaptureSaveResult {
  path: string;
}

interface PointSnapshot {
  x: number;
  y: number;
}

interface MatrixSnapshot {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

interface EdgePathSnapshot {
  d: string;
  matrix: MatrixSnapshot;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  dash: number[];
  dashOffset: number;
  lineCap: CanvasLineCap;
  lineJoin: CanvasLineJoin;
  arrow: {
    tip: PointSnapshot;
    previous: PointSnapshot;
  } | null;
}

interface EdgeLabelSnapshot {
  text: string;
  center: PointSnapshot;
  fontFamily: string;
  fontSize: number;
  fontStyle: string;
  fontWeight: string;
  fill: string;
  opacity: number;
  background: {
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    opacity: number;
  } | null;
}

interface ReactFlowEdgeSnapshot {
  path: EdgePathSnapshot;
  label: EdgeLabelSnapshot | null;
}

export async function captureCurrentStudioSurface(
  request: CaptureRequest,
): Promise<SurfaceCaptureResult> {
  const liveTarget = document.querySelector<HTMLElement>(
    ".studio-main-surface .workspace-layout",
  );

  if (!liveTarget || liveTarget.querySelector(".react-flow") === null) {
    return captureStandardStudioSurface(request);
  }

  return captureGraphSurfaceOffscreen(liveTarget, request);
}

async function captureGraphSurfaceOffscreen(
  liveTarget: HTMLElement,
  request: CaptureRequest,
): Promise<SurfaceCaptureResult> {
  await waitForStableRendering(liveTarget);

  const liveRect = liveTarget.getBoundingClientRect();
  const width = Math.max(1, Math.ceil(liveRect.width));
  const edgeSnapshots = snapshotReactFlowEdges(liveTarget, liveRect);
  const background = captureBackgroundColor();
  const clone = createCaptureClone(liveTarget, width, background);

  document.body.appendChild(clone.host);

  try {
    await nextAnimationFrame();
    expandCloneLayout(clone.target);
    await nextAnimationFrame();
    await nextAnimationFrame();

    const height = measureExpandedHeight(clone.target) + CAPTURE_BOTTOM_GUARD;
    const pixelRatio = captureScale(width, height);

    clone.target.style.setProperty("height", `${height}px`, "important");
    clone.host.style.height = `${height}px`;
    hideReactFlowEdgeLayers(clone.target);

    await nextAnimationFrame();

    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(clone.target, {
      backgroundColor: background,
      scale: pixelRatio,
      width,
      height,
      windowWidth: Math.max(document.documentElement.clientWidth, width),
      windowHeight: Math.max(document.documentElement.clientHeight, height),
      scrollX: 0,
      scrollY: 0,
      useCORS: true,
      allowTaint: false,
      logging: false,
      imageTimeout: 5_000,
    });

    drawReactFlowEdges(canvas, edgeSnapshots, pixelRatio);
    const dataUrl = canvas.toDataURL("image/png");
    const filename = buildCaptureFilename(request);
    const saved = await invoke<SurfaceCaptureSaveResult>("save_surface_capture_png", {
      filename,
      dataUrl,
    });
    const copiedToClipboard = await copyDataUrlToClipboard(dataUrl);

    return {
      path: saved.path,
      copiedToClipboard,
      width,
      height,
    };
  } catch (error) {
    throw new Error(`Off-screen graph capture failed: ${describeCaptureError(error)}`);
  } finally {
    clone.host.remove();
  }
}

function createCaptureClone(
  liveTarget: HTMLElement,
  width: number,
  background: string,
): { host: HTMLDivElement; target: HTMLElement } {
  const host = document.createElement("div");
  host.dataset.studioCaptureOffscreen = "true";
  host.setAttribute("aria-hidden", "true");
  host.style.position = "fixed";
  host.style.left = "-20000px";
  host.style.top = "0";
  host.style.width = `${width}px`;
  host.style.height = "auto";
  host.style.overflow = "visible";
  host.style.pointerEvents = "none";
  host.style.zIndex = "-2147483647";
  host.style.background = background;

  const target = liveTarget.cloneNode(true) as HTMLElement;
  target.dataset.studioCaptureClone = "true";
  target.style.setProperty("width", `${width}px`, "important");
  target.style.setProperty("height", "auto", "important");
  target.style.setProperty("min-height", "0", "important");
  target.style.setProperty("max-height", "none", "important");
  target.style.setProperty("overflow", "visible", "important");
  target.style.setProperty("transform", "none", "important");
  target.style.setProperty("align-items", "start", "important");
  target.style.background = background;

  host.appendChild(target);
  return { host, target };
}

function expandCloneLayout(target: HTMLElement) {
  const structuralSelectors = [
    ".workspace-primary",
    ".entity-xray",
    ".xray-scroll",
    ".relations-workspace",
    ".relationship-explorer",
    ".relationship-groups",
  ];

  for (const selector of structuralSelectors) {
    for (const element of target.querySelectorAll<HTMLElement>(selector)) {
      makeContentSized(element);
    }
  }

  const xray = target.querySelector<HTMLElement>(".entity-xray");
  if (xray) {
    xray.style.setProperty("grid-template-rows", "auto auto auto", "important");
  }

  for (const element of target.querySelectorAll<HTMLElement>("*")) {
    if (element.closest(".react-flow")) {
      continue;
    }

    const style = window.getComputedStyle(element);
    if (
      style.overflow === "auto" ||
      style.overflow === "scroll" ||
      style.overflowY === "auto" ||
      style.overflowY === "scroll"
    ) {
      makeContentSized(element);
    }
  }

  for (const element of target.querySelectorAll<HTMLElement>("*")) {
    element.scrollTop = 0;
    element.scrollLeft = 0;
  }
}

function makeContentSized(element: HTMLElement) {
  element.style.setProperty("height", "auto", "important");
  element.style.setProperty("min-height", "0", "important");
  element.style.setProperty("max-height", "none", "important");
  element.style.setProperty("overflow", "visible", "important");
  element.style.setProperty("overflow-x", "visible", "important");
  element.style.setProperty("overflow-y", "visible", "important");
  element.style.setProperty("scrollbar-gutter", "auto", "important");
  element.style.setProperty("align-self", "start", "important");
}

function measureExpandedHeight(target: HTMLElement): number {
  const rect = target.getBoundingClientRect();
  let bottom = rect.bottom;

  for (const element of target.querySelectorAll<Element>("*")) {
    if (element.closest(".react-flow__viewport")) {
      continue;
    }

    const childRect = element.getBoundingClientRect();
    if (
      Number.isFinite(childRect.bottom) &&
      (childRect.width > 0 || childRect.height > 0)
    ) {
      bottom = Math.max(bottom, childRect.bottom);
    }
  }

  return Math.max(
    1,
    Math.ceil(target.scrollHeight),
    Math.ceil(target.offsetHeight),
    Math.ceil(bottom - rect.top),
  );
}

function snapshotReactFlowEdges(
  target: HTMLElement,
  targetRect: DOMRect,
): ReactFlowEdgeSnapshot[] {
  const snapshots: ReactFlowEdgeSnapshot[] = [];

  for (const path of target.querySelectorAll<SVGPathElement>(".react-flow__edge-path")) {
    const d = path.getAttribute("d");
    const matrix = path.getScreenCTM();
    if (!d || !matrix) {
      continue;
    }

    const style = window.getComputedStyle(path);
    const markerEnd = path.getAttribute("marker-end") || style.markerEnd;
    const edgeGroup = path.closest<SVGGElement>(".react-flow__edge");
    const text = edgeGroup?.querySelector<SVGTextElement>(".react-flow__edge-text") ?? null;
    const textBackground =
      edgeGroup?.querySelector<SVGElement>(".react-flow__edge-textbg") ?? null;

    snapshots.push({
      path: {
        d,
        matrix: {
          a: matrix.a,
          b: matrix.b,
          c: matrix.c,
          d: matrix.d,
          e: matrix.e - targetRect.left,
          f: matrix.f - targetRect.top,
        },
        stroke: visiblePaint(style.stroke, "#405064"),
        strokeWidth: cssNumber(style.strokeWidth, 1.45),
        opacity: cssNumber(style.strokeOpacity, 1) * cssNumber(style.opacity, 1),
        dash: parseDashArray(style.strokeDasharray),
        dashOffset: cssNumber(style.strokeDashoffset, 0),
        lineCap: canvasLineCap(style.strokeLinecap),
        lineJoin: canvasLineJoin(style.strokeLinejoin),
        arrow:
          markerEnd && markerEnd !== "none"
            ? snapshotPathEnd(path, matrix, targetRect)
            : null,
      },
      label: text ? snapshotEdgeLabel(text, textBackground, targetRect) : null,
    });
  }

  return snapshots;
}

function snapshotPathEnd(
  path: SVGPathElement,
  matrix: DOMMatrix,
  targetRect: DOMRect,
): { tip: PointSnapshot; previous: PointSnapshot } | null {
  try {
    const length = path.getTotalLength();
    if (!Number.isFinite(length) || length <= 0) {
      return null;
    }

    const tip = transformSvgPoint(path.getPointAtLength(length), matrix, targetRect);
    const previous = transformSvgPoint(
      path.getPointAtLength(Math.max(0, length - 8)),
      matrix,
      targetRect,
    );
    return { tip, previous };
  } catch {
    return null;
  }
}

function transformSvgPoint(
  point: DOMPoint,
  matrix: DOMMatrix,
  targetRect: DOMRect,
): PointSnapshot {
  const transformed = new DOMPoint(point.x, point.y).matrixTransform(matrix);
  return {
    x: transformed.x - targetRect.left,
    y: transformed.y - targetRect.top,
  };
}

function snapshotEdgeLabel(
  text: SVGTextElement,
  background: SVGElement | null,
  targetRect: DOMRect,
): EdgeLabelSnapshot | null {
  const value = text.textContent?.trim();
  if (!value) {
    return null;
  }

  const textRect = text.getBoundingClientRect();
  const style = window.getComputedStyle(text);
  const backgroundRect = background?.getBoundingClientRect() ?? null;
  const backgroundStyle = background ? window.getComputedStyle(background) : null;

  return {
    text: value,
    center: {
      x: textRect.left - targetRect.left + textRect.width / 2,
      y: textRect.top - targetRect.top + textRect.height / 2,
    },
    fontFamily: style.fontFamily || "sans-serif",
    fontSize: cssNumber(style.fontSize, 9),
    fontStyle: style.fontStyle || "normal",
    fontWeight: style.fontWeight || "400",
    fill: visiblePaint(style.fill, "#8090a5"),
    opacity: cssNumber(style.opacity, 1) * cssNumber(style.fillOpacity, 1),
    background:
      backgroundRect && backgroundStyle
        ? {
            x: backgroundRect.left - targetRect.left,
            y: backgroundRect.top - targetRect.top,
            width: backgroundRect.width,
            height: backgroundRect.height,
            fill: visiblePaint(backgroundStyle.fill, "rgba(11, 14, 19, 0.94)"),
            stroke: visiblePaint(backgroundStyle.stroke, "rgba(51, 67, 88, 0.85)"),
            strokeWidth: cssNumber(backgroundStyle.strokeWidth, 1),
            opacity:
              cssNumber(backgroundStyle.opacity, 1) *
              cssNumber(backgroundStyle.fillOpacity, 1),
          }
        : null,
  };
}

function hideReactFlowEdgeLayers(target: HTMLElement) {
  const seen = new Set<SVGSVGElement>();

  for (const path of target.querySelectorAll<SVGPathElement>(".react-flow__edge-path")) {
    const svg = path.closest("svg");
    if (svg instanceof SVGSVGElement && !seen.has(svg)) {
      seen.add(svg);
      svg.style.visibility = "hidden";
    }
  }
}

function drawReactFlowEdges(
  canvas: HTMLCanvasElement,
  snapshots: ReactFlowEdgeSnapshot[],
  pixelRatio: number,
) {
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Studio could not create a 2D context for React Flow edge compositing.");
  }

  for (const snapshot of snapshots) {
    drawEdgePath(context, snapshot.path, pixelRatio);
    if (snapshot.path.arrow) {
      drawEdgeArrow(context, snapshot.path, pixelRatio);
    }
    if (snapshot.label) {
      drawEdgeLabel(context, snapshot.label, pixelRatio);
    }
  }
}

function drawEdgePath(
  context: CanvasRenderingContext2D,
  snapshot: EdgePathSnapshot,
  pixelRatio: number,
) {
  const matrix = snapshot.matrix;
  context.save();
  context.setTransform(
    matrix.a * pixelRatio,
    matrix.b * pixelRatio,
    matrix.c * pixelRatio,
    matrix.d * pixelRatio,
    matrix.e * pixelRatio,
    matrix.f * pixelRatio,
  );
  context.strokeStyle = snapshot.stroke;
  context.lineWidth = snapshot.strokeWidth;
  context.lineCap = snapshot.lineCap;
  context.lineJoin = snapshot.lineJoin;
  context.globalAlpha = snapshot.opacity;
  context.setLineDash(snapshot.dash);
  context.lineDashOffset = snapshot.dashOffset;
  context.stroke(new Path2D(snapshot.d));
  context.restore();
}

function drawEdgeArrow(
  context: CanvasRenderingContext2D,
  snapshot: EdgePathSnapshot,
  pixelRatio: number,
) {
  const arrow = snapshot.arrow;
  if (!arrow) {
    return;
  }

  const angle = Math.atan2(
    arrow.tip.y - arrow.previous.y,
    arrow.tip.x - arrow.previous.x,
  );
  const size = Math.max(6.5, snapshot.strokeWidth * 4.5);

  context.save();
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.translate(arrow.tip.x, arrow.tip.y);
  context.rotate(angle);
  context.globalAlpha = snapshot.opacity;
  context.fillStyle = snapshot.stroke;
  context.strokeStyle = snapshot.stroke;
  context.lineWidth = Math.max(1, snapshot.strokeWidth * 0.8);
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(-size, -size * 0.55);
  context.lineTo(-size, size * 0.55);
  context.closePath();
  context.fill();
  context.stroke();
  context.restore();
}

function drawEdgeLabel(
  context: CanvasRenderingContext2D,
  label: EdgeLabelSnapshot,
  pixelRatio: number,
) {
  context.save();
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  if (label.background) {
    context.globalAlpha = label.background.opacity;
    context.fillStyle = label.background.fill;
    context.strokeStyle = label.background.stroke;
    context.lineWidth = label.background.strokeWidth;
    roundedRect(
      context,
      label.background.x,
      label.background.y,
      label.background.width,
      label.background.height,
      3,
    );
    context.fill();
    if (label.background.strokeWidth > 0) {
      context.stroke();
    }
  }

  context.globalAlpha = label.opacity;
  context.fillStyle = label.fill;
  context.font = `${label.fontStyle} ${label.fontWeight} ${label.fontSize}px ${label.fontFamily}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(label.text, label.center.x, label.center.y);
  context.restore();
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.quadraticCurveTo(x + width, y, x + width, y + r);
  context.lineTo(x + width, y + height - r);
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  context.lineTo(x + r, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
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

async function waitForStableRendering(target: HTMLElement) {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const images = Array.from(target.querySelectorAll("img")).filter(
    (image) => !image.complete,
  );

  await Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          image.addEventListener("load", () => resolve(), { once: true });
          image.addEventListener("error", () => resolve(), { once: true });
        }),
    ),
  );

  await nextAnimationFrame();
  await nextAnimationFrame();
}

async function copyDataUrlToClipboard(dataUrl: string): Promise<boolean> {
  try {
    if (!navigator.clipboard || typeof ClipboardItem === "undefined") {
      return false;
    }

    const response = await fetch(dataUrl);
    const blob = await response.blob();
    await navigator.clipboard.write([
      new ClipboardItem({ [blob.type || "image/png"]: blob }),
    ]);
    return true;
  } catch {
    return false;
  }
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

function cssNumber(value: string, fallback: number): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseDashArray(value: string): number[] {
  if (!value || value === "none") {
    return [];
  }
  return value
    .split(/[ ,]+/)
    .map((part) => Number.parseFloat(part))
    .filter((part) => Number.isFinite(part));
}

function canvasLineCap(value: string): CanvasLineCap {
  return value === "round" || value === "square" ? value : "butt";
}

function canvasLineJoin(value: string): CanvasLineJoin {
  return value === "round" || value === "bevel" ? value : "miter";
}

function visiblePaint(value: string, fallback: string): string {
  if (!value || value === "none" || value === "transparent") {
    return fallback;
  }
  return value;
}

function describeCaptureError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (error instanceof Event) {
    return `renderer emitted an ${error.type || "unknown"} event`;
  }
  return String(error);
}

function nextAnimationFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}
