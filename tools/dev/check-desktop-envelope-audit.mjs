import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const write = process.argv.includes("--write");

const migratedSurfaces = [
  {
    label: "Mission Overview",
    checklistLabel: "Mission Overview",
    slug: "mission-overview",
    source: "src/MissionCockpit.tsx",
    bridgeCss: "src/missionOverviewDesktopEnvelope.css",
    bridgeClass: "mission-overview-desktop-surface",
    shellSelector: ".main-surface",
    targetSelector: ".mission-target",
    profiles: ["desktop-reference-1440x900", "desktop-fullscreen"],
  },
  {
    label: "Core Report Runner",
    checklistLabel: "Core Report Runner",
    slug: "core-report-runner",
    source: "src/CoreReportRunnerSurface.tsx",
    bridgeCss: "src/coreReportRunnerDesktopEnvelope.css",
    bridgeClass: "core-report-runner-desktop-surface",
    shellSelector: ".main-surface-core-report-runner",
    targetSelector: ".core-report-runner-surface",
    profiles: ["desktop-reference-1440x900", "desktop-fullscreen"],
  },
  {
    label: "Data Products",
    checklistLabel: "Data Products",
    slug: "data-products",
    source: "src/DataProductsDomainSurface.tsx",
    bridgeCss: "src/dataProductsDesktopEnvelope.css",
    bridgeClass: "data-products-desktop-surface",
    shellSelector: ".main-surface-data-products",
    targetSelector: ".data-products-cockpit-surface",
    profiles: ["desktop-reference-1440x900", "desktop-fullscreen"],
  },
  {
    label: "Generated Artifacts",
    checklistLabel: "Generated Artifacts",
    slug: "generated-artifacts",
    source: "src/GeneratedArtifactsSurface.tsx",
    bridgeCss: "src/generatedArtifactsDesktopEnvelope.css",
    bridgeClass: "generated-artifacts-desktop-surface",
    shellSelector: ".main-surface-generated-artifacts",
    targetSelector: ".generated-artifacts-surface",
    profiles: ["desktop-reference-1440x900", "desktop-fullscreen"],
  },
  {
    label: "Scenario Evidence",
    checklistLabel: "Scenarios",
    slug: "scenarios",
    source: "src/ScenarioTimelineRunnerSurface.tsx",
    bridgeCss: "src/scenarioEvidenceDesktopEnvelope.css",
    bridgeClass: "scenario-evidence-desktop-surface",
    shellSelector: ".main-surface-scenario-evidence",
    targetSelector: ".scenario-evidence-cockpit",
    profiles: ["desktop-reference-1440x900", "desktop-fullscreen"],
  },
];

const specialCaseSurfaces = [
  {
    label: "Data Flow Workbench",
    checklistLabel: "Data Flow Workbench",
    slug: "data-flow-workbench",
    status: "special-case",
    reason: "mini-app/workbench canvas kept out of the normal envelope migration sequence",
    shellSelector: ".main-surface",
    targetSelector: ".mission-data-flow-workbench",
    profiles: ["desktop-fullscreen"],
  },
];

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function cssImportPath(cssPath) {
  return `./${path.basename(cssPath)}`;
}

function containsField(text, field, value) {
  const single = `${field}: '${value}'`;
  const double = `${field}: "${value}"`;
  return text.includes(single) || text.includes(double);
}

function combinedTarget(surface) {
  return `${surface.shellSelector} ${surface.targetSelector}`.trim();
}

const mainTsx = readFile("src/main.tsx");
const manifestTs = readFile("src/devSurfaceCaptureManifest.ts");
const checklistPath = "docs/qa/visual-qa-capture-checklist.md";
const checklistMd = exists(checklistPath) ? readFile(checklistPath) : "";

function manifestChecks(surface) {
  return [
    { name: "manifest slug", ok: containsField(manifestTs, "slug", surface.slug) },
    { name: "manifest shell selector", ok: containsField(manifestTs, "shellSelector", surface.shellSelector) },
    { name: "manifest target selector", ok: containsField(manifestTs, "targetSelector", surface.targetSelector) },
    ...surface.profiles.map((profile) => ({
      name: `manifest profile ${profile}`,
      ok: manifestTs.includes(`"${profile}"`) || manifestTs.includes(`'${profile}'`),
    })),
  ];
}

const rows = migratedSurfaces.map((surface) => {
  const sourceExists = exists(surface.source);
  const source = sourceExists ? readFile(surface.source) : "";
  const cssExists = exists(surface.bridgeCss);
  const checks = [
    { name: "source exists", ok: sourceExists },
    { name: "uses DesktopSurface", ok: source.includes("DesktopSurface") },
    { name: "bridge class present", ok: source.includes(surface.bridgeClass) },
    { name: "bridge css exists", ok: cssExists },
    { name: "bridge css imported", ok: mainTsx.includes(cssImportPath(surface.bridgeCss)) },
    ...manifestChecks(surface),
    { name: "checklist row", ok: checklistMd.includes(`| ${surface.checklistLabel} |`) },
  ];

  return {
    ...surface,
    checks,
    ok: checks.every((check) => check.ok),
  };
});

const specialRows = specialCaseSurfaces.map((surface) => {
  const checks = [
    ...manifestChecks(surface),
    { name: "checklist row", ok: checklistMd.includes(`| ${surface.checklistLabel} |`) },
  ];

  return {
    ...surface,
    checks,
    ok: checks.every((check) => check.ok),
  };
});

const failed = [...rows, ...specialRows].filter((row) => !row.ok);
const generatedAt = new Date().toISOString();

function status(value) {
  return value ? "PASS" : "FAIL";
}

function markdown() {
  const lines = [];
  lines.push("# Desktop Envelope Migration Audit");
  lines.push("");
  lines.push(`Generated at: ${generatedAt}`);
  lines.push("");
  lines.push("This audit is generated by `npm run qa:desktop-envelope-audit`.");
  lines.push("");
  lines.push("It verifies that the normal Studio public surfaces are wrapped by the shared desktop envelope, that their bridge stylesheets are imported, and that the visual QA manifest/checklist reflects the required capture profiles.");
  lines.push("");
  lines.push("## Migrated normal surfaces");
  lines.push("");
  lines.push("| Surface | Source | Bridge CSS | QA target | Profiles | Status |");
  lines.push("| --- | --- | --- | --- | --- | --- |");
  for (const row of rows) {
    lines.push(`| ${row.label} | \`${row.source}\` | \`${row.bridgeCss}\` | \`${combinedTarget(row)}\` | ${row.profiles.map((profile) => `\`${profile}\``).join("<br>")} | ${status(row.ok)} |`);
  }
  lines.push("");
  lines.push("## Special-case surfaces");
  lines.push("");
  lines.push("| Surface | Status | Reason | QA target | Profiles | Audit |");
  lines.push("| --- | --- | --- | --- | --- | --- |");
  for (const row of specialRows) {
    lines.push(`| ${row.label} | ${row.status} | ${row.reason} | \`${combinedTarget(row)}\` | ${row.profiles.map((profile) => `\`${profile}\``).join("<br>")} | ${status(row.ok)} |`);
  }
  lines.push("");
  lines.push("## Check detail");
  lines.push("");
  for (const row of [...rows, ...specialRows]) {
    lines.push(`### ${row.label}`);
    lines.push("");
    for (const check of row.checks) {
      lines.push(`- ${check.ok ? "PASS" : "FAIL"}: ${check.name}`);
    }
    lines.push("");
  }
  lines.push("## Result");
  lines.push("");
  lines.push(failed.length === 0 ? "PASS - desktop envelope migration audit is clean." : "FAIL - at least one desktop envelope audit check failed.");
  lines.push("");
  return `${lines.join("\n")}\n`;
}

const output = markdown();

if (write) {
  fs.writeFileSync(path.join(root, "docs/qa/desktop-envelope-migration-audit.md"), output, "utf8");
}

for (const row of rows) {
  console.log(`[desktop-envelope-audit] ${status(row.ok)} ${row.label}`);
}
for (const row of specialRows) {
  console.log(`[desktop-envelope-audit] ${status(row.ok)} ${row.label} (${row.status})`);
}

if (failed.length > 0) {
  console.error("[desktop-envelope-audit] failed checks:");
  for (const row of failed) {
    for (const check of row.checks.filter((item) => !item.ok)) {
      console.error(`  - ${row.label}: ${check.name}`);
    }
  }
  process.exitCode = 1;
} else {
  console.log("[desktop-envelope-audit] PASS");
}
