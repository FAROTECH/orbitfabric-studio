import { readFileSync } from "node:fs";

const files = {
  css: "src/studioVisualSemantics.css",
  main: "src/main.tsx",
  pkg: "package.json",
  doc: "docs/qa/e14-studio-visual-token-contract.md",
};

function read(path) {
  return readFileSync(path, "utf8");
}

let failed = false;

function pass(label) {
  console.log(`[studio-visual-token-contract] PASS ${label}`);
}

function fail(label, detail) {
  failed = true;
  console.error(`[studio-visual-token-contract] FAIL ${label}`);
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

const requiredTokens = [
  "--of-visual-surface-bg",
  "--of-visual-panel-bg",
  "--of-visual-card-bg",
  "--of-visual-border-soft",
  "--of-visual-border",
  "--of-visual-border-strong",
  "--of-visual-divider",
  "--of-visual-text-primary",
  "--of-visual-text-secondary",
  "--of-visual-text-muted",
  "--of-visual-text-faint",
  "--of-visual-accent",
  "--of-visual-accent-muted",
  "--of-visual-status-success",
  "--of-visual-status-warning",
  "--of-visual-status-danger",
  "--of-visual-status-info",
  "--of-visual-status-neutral",
  "--of-visual-provenance-bg",
  "--of-visual-provenance-border",
  "--of-visual-provenance-text",
  "--of-visual-evidence-bg",
  "--of-visual-evidence-border",
  "--of-visual-evidence-text",
  "--of-visual-action-bg",
  "--of-visual-action-border",
  "--of-visual-action-text",
  "--of-visual-action-hover-bg",
  "--of-visual-selected-bg",
  "--of-visual-selected-border",
  "--of-visual-focus-ring",
  "--of-visual-disabled-opacity",
  "--of-visual-raw-bg",
  "--of-visual-raw-border",
  "--of-visual-raw-text",
  "--of-visual-radius-panel",
  "--of-visual-radius-card",
  "--of-visual-radius-control",
  "--of-visual-radius-pill",
];

for (const token of requiredTokens) {
  requireIncludes(`token ${token}`, css, `${token}:`);
}

const strippedCss = css.replace(/\/\*[\s\S]*?\*\//g, "");
const selectors = [...strippedCss.matchAll(/([^{}]+)\{/g)].map((match) =>
  match[1].trim(),
);

if (selectors.length === 1 && selectors[0] === ":root") {
  pass("CSS has root-only selector contract");
} else {
  fail(
    "CSS has root-only selector contract",
    `Found selectors: ${selectors.join(", ") || "<none>"}`,
  );
}

if (/--(?!of-visual-|of-desktop-)[a-z0-9-]+\s*:/i.test(css)) {
  fail("CSS token namespaces are restricted to visual declarations and desktop references");
} else {
  pass("CSS token namespaces are restricted to visual declarations and desktop references");
}

const desktopImport = 'import "./desktopEnvelopePrimitives.css";';
const visualImport = 'import "./studioVisualSemantics.css";';
const desktopIndex = main.indexOf(desktopImport);
const visualIndex = main.indexOf(visualImport);

if (desktopIndex >= 0 && visualIndex > desktopIndex) {
  pass("main import order");
} else {
  fail("main import order", "studioVisualSemantics.css must be imported after desktopEnvelopePrimitives.css");
}

if (pkg.scripts?.["qa:studio-visual-token-contract"] === "node tools/dev/check-studio-visual-token-contract.mjs") {
  pass("package script");
} else {
  fail("package script", "Missing or unexpected qa:studio-visual-token-contract script");
}

requireIncludes("doc title", doc, "# E14 — Studio Visual Token Contract");
requireIncludes("doc non-goals", doc, "## 3. Non-goals");
requireIncludes("doc namespace contract", doc, "--of-visual-*");
requireIncludes("doc acceptance criteria", doc, "## 10. Acceptance criteria");

if (failed) {
  process.exit(1);
}

console.log("[studio-visual-token-contract] PASS");
