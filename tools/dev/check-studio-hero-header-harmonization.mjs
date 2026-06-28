import { readFileSync } from "node:fs";

const files = {
  css: "src/studioHeroHeaderHarmonization.css",
  main: "src/main.tsx",
  pkg: "package.json",
  doc: "docs/qa/e15-hero-header-harmonization.md",
};

function read(path) {
  return readFileSync(path, "utf8");
}

let failed = false;

function pass(label) {
  console.log(`[studio-hero-header-harmonization] PASS ${label}`);
}

function fail(label, detail) {
  failed = true;
  console.error(`[studio-hero-header-harmonization] FAIL ${label}`);
  if (detail) {
    console.error(detail);
  }
}

function requireIncludes(label, content, needle) {
  if (content.includes(needle)) {
    pass(label);
  } else {
    fail(label, `Missing: ${needle}`);
  }
}

const css = read(files.css);
const main = read(files.main);
const pkg = JSON.parse(read(files.pkg));
const doc = read(files.doc);

const requiredSurfaceSelectors = [
  ".mission-overview-desktop-surface",
  ".core-report-runner-desktop-surface",
  ".data-products-desktop-surface",
  ".generated-artifacts-desktop-surface",
  ".scenario-evidence-desktop-surface",
];

for (const selector of requiredSurfaceSelectors) {
  requireIncludes(`surface selector ${selector}`, css, selector);
}

const requiredTokenReferences = [
  "var(--of-visual-border-strong)",
  "var(--of-visual-border-soft)",
  "var(--of-visual-radius-panel)",
  "var(--of-visual-panel-bg)",
  "var(--of-visual-accent)",
  "var(--of-visual-text-primary)",
  "var(--of-visual-text-secondary)",
  "var(--of-visual-text-muted)",
  "var(--of-visual-action-bg)",
  "var(--of-visual-action-hover-bg)",
  "var(--of-visual-status-neutral-bg)",
];

for (const token of requiredTokenReferences) {
  requireIncludes(`token reference ${token}`, css, token);
}

requireIncludes("visible top accent line", css, "::before");
requireIncludes("visible accent gradient", css, "linear-gradient(");
requireIncludes("Data Products metadata no-wrap", css, "white-space: nowrap");
requireIncludes("Data Products metadata ellipsis", css, "text-overflow: ellipsis");
requireIncludes("command header right-side containment", css, ".scenario-evidence-desktop-surface .scenario-posture-grid");

const forbiddenCssFragments = [
  "mission-data-flow",
  "data-flow-workbench",
  "data-flow-drawer",
  "focus-mode",
  "flow-canvas",
];

for (const fragment of forbiddenCssFragments) {
  if (css.includes(fragment)) {
    fail("Data Flow selectors are not targeted", `Forbidden CSS fragment found: ${fragment}`);
  }
}

if (!forbiddenCssFragments.some((fragment) => css.includes(fragment))) {
  pass("Data Flow selectors are not targeted");
}

const importLine = 'import "./studioHeroHeaderHarmonization.css";';
const envelopeImport = 'import "./dataFlowWorkbenchDesktopEnvelope.css";';
const importIndex = main.indexOf(importLine);
const envelopeIndex = main.indexOf(envelopeImport);

if (envelopeIndex >= 0 && importIndex > envelopeIndex) {
  pass("main import order");
} else {
  fail("main import order", "studioHeroHeaderHarmonization.css must be imported after desktop envelope bridge CSS");
}

if (pkg.scripts?.["qa:studio-hero-header-harmonization"] === "node tools/dev/check-studio-hero-header-harmonization.mjs") {
  pass("package script");
} else {
  fail("package script", "Missing or unexpected qa:studio-hero-header-harmonization script");
}

requireIncludes("doc title", doc, "# E15 — Hero/Header Harmonization");
requireIncludes("doc explicit target style", doc, "Studio Command Header");
requireIncludes("doc current state", doc, "## 2. Current state by surface");
requireIncludes("doc expected visual result", doc, "## 3. Expected visual result by surface");
requireIncludes("doc Data Flow exclusion", doc, "does not target Data Flow Workbench");
requireIncludes("doc visual QA acceptance", doc, "## 9. Visual QA acceptance");
requireIncludes("doc acceptance criteria", doc, "## 11. Acceptance criteria");

if (failed) {
  process.exit(1);
}

console.log("[studio-hero-header-harmonization] PASS");
