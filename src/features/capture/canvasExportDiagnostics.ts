let installed = false;

export function installCanvasExportDiagnostics() {
  if (installed) {
    return;
  }

  installed = true;
  const original = HTMLCanvasElement.prototype.toDataURL;

  HTMLCanvasElement.prototype.toDataURL = function patchedToDataURL(
    type?: string,
    quality?: number,
  ): string {
    const result = original.call(this, type, quality);

    if (type === "image/png" && result === "data:,") {
      throw new Error(
        `Canvas PNG export failed for backing canvas ${this.width}×${this.height}. ` +
          "The WebView renderer rejected this canvas size.",
      );
    }

    return result;
  };
}
