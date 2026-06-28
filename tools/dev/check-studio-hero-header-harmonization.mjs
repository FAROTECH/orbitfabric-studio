import { readFileSync } from "node:fs";

const files = {
  css: "src/studioHeroHeaderHarmonization.css",
  main: "src/main.tsx",
  pkg: "package.json",
  doc: "docs/qa/e15-hero-header-harmonization.md",
  mission: "src/MissionCockpit.tsx",
  navigation: "src/navigationModel.ts",
  dataProducts: "src/DataProductsDomainSurface.tsx",
  generatedArtifacts: "src/GeneratedArtifactExplorer.tsx",
  scenarios: "src/ScenarioTimelineRunnerSurface.tsx",
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

function requireExcludes(label, content, needle) {
  if (!content.includes(needle)) {
    pass(label);
  } else {
    fail(label, `Unexpected: ${needle}`);
  }
}

const css = read(files.css);
const main = read(files.main);
const pkg = JSON.parse(read(files.pkg));
const doc = read(files.doc);
const mission = read(files.mission);
const navigation = read(files.navigation);
const dataProducts = read(files.dataProducts);
const generatedArtifacts = read(files.generatedArtifacts);
const scenarios = read(files.scenarios);

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
  "var(--of-visual-status-neutral-bg)",
];

for (const token of requiredTokenReferences) {
  requireIncludes(`token reference ${token}`, css, token);
}

requireIncludes("visible top accent line", css, "::before");
requireIncludes("accent line inset to avoid bleed", css, "left: 12px;");
requireIncludes("operational compact clamp", css, "-webkit-line-clamp: 2");
requireIncludes("Mission variable summary clamp", css, "-webkit-line-clamp: 3");
requireIncludes("Mission Overview eyebrow CSS", css, ".mission-target-eyebrow");
requireIncludes("neutral static hero values", css, "Static hero values default to neutral");

requireExcludes("Mission Overview top bar markup removed", mission, 'className="mission-target-heading"');
requireExcludes("Mission Overview top CTA removed", mission, "View Generated Reports");
requireIncludes("Mission Overview eyebrow markup", mission, 'className="mission-target-eyebrow"');
requireIncludes("sidebar label renamed", navigation, 'label: "Mission Overview"');
requireExcludes("old sidebar label removed", navigation, 'label: "Mission",');

requireIncludes("Data Products eyebrow", dataProducts, '<span className="cockpit-eyebrow">Data Products</span>');
requireIncludes("Data Products short title", dataProducts, "<h2>Data Products</h2>");
requireIncludes("Data Products compact summary", dataProducts, "Cross-check declared products against Core evidence and generated bridge outputs.");
requireExcludes("Data Products long title removed", dataProducts, "Cross-check mission model contract, Core evidence and bridge outputs");

requireIncludes("Generated Artifacts eyebrow", generatedArtifacts, '<span className="cockpit-eyebrow">Generated Outputs</span>');
requireIncludes("Generated Artifacts compact summary", generatedArtifacts, "Review generated files by family, evidence status, and downstream use.");

requireIncludes("Scenario Evidence eyebrow", scenarios, '<span className="cockpit-eyebrow">Scenario Evidence</span>');
requireIncludes("Scenario Evidence short title", scenarios, "<h2>Scenarios</h2>");
requireIncludes("Scenario Evidence compact summary", scenarios, "Inspect scenario sources, Core simulation reports, and generated evidence.");
requireExcludes("Scenario Evidence long title removed", scenarios, "Scenario construction and Core exercise evidence");

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
requireIncludes("doc hero information contract", doc, "## 2. Hero information contract");
requireIncludes("doc compactness contract", doc, "## 5. Compactness contract");
requireIncludes("doc semantic value contract", doc, "## 6. Semantic value contract");
requireIncludes("doc clickability contract", doc, "## 7. Clickability contract");
requireIncludes("doc acceptance criteria", doc, "## 13. Acceptance criteria");

if (failed) {
  process.exit(1);
}

console.log("[studio-hero-header-harmonization] PASS");
