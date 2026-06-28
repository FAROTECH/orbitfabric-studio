#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const args = new Set(process.argv.slice(2));
const shouldWrite = args.has('--write');

const srcDir = path.join(repoRoot, 'src');
const manifestPath = path.join(srcDir, 'devSurfaceCaptureManifest.ts');
const qaDocPath = path.join(repoRoot, 'docs/qa/data-flow-workbench-audit.md');

const textExtensions = new Set(['.ts', '.tsx', '.css', '.mjs', '.js']);
const strictDataFlowTokens = [
  'Data Flow Workbench',
  'data-flow-workbench',
  'mission-data-flow-workbench',
  'mission-data-flow',
  'dataFlow',
  'DataFlow',
];

function readUtf8(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function listFiles(rootDir) {
  const results = [];

  function walk(currentDir) {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') {
          continue;
        }
        walk(fullPath);
        continue;
      }

      if (entry.isFile() && textExtensions.has(path.extname(entry.name))) {
        results.push(fullPath);
      }
    }
  }

  walk(rootDir);
  return results.sort();
}

function relative(filePath) {
  return path.relative(repoRoot, filePath).replaceAll(path.sep, '/');
}

function isDataFlowSurfaceCandidate(entry) {
  const lowerPath = entry.path.toLowerCase();

  return (
    entry.content.includes('mission-data-flow-workbench') ||
    entry.content.includes('.mission-data-flow-workbench') ||
    lowerPath.includes('dataflow') ||
    lowerPath.includes('data-flow')
  );
}

function hasDesktopSurfaceRender(content) {
  return /<\s*DesktopSurface\b/.test(content);
}

function findMatchingFiles(files) {
  return files
    .map((filePath) => {
      const content = readUtf8(filePath);
      const matches = strictDataFlowTokens.filter((token) => content.includes(token));
      return {
        path: relative(filePath),
        matches,
        content,
        hasDesktopSurfaceRender: hasDesktopSurfaceRender(content),
        isCss: path.extname(filePath) === '.css',
      };
    })
    .filter((entry) => entry.matches.length > 0)
    .sort((a, b) => a.path.localeCompare(b.path));
}

function statusIcon(pass) {
  return pass ? 'PASS' : 'FAIL';
}

function formatList(values) {
  if (values.length === 0) {
    return '_none found_';
  }

  return values.map((value) => `- \`${value}\``).join('\n');
}

function writeIfChanged(filePath, content) {
  const previous = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null;

  if (previous !== content) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
    return true;
  }

  return false;
}

if (!fs.existsSync(manifestPath)) {
  console.error('[data-flow-workbench-audit] FAIL: src/devSurfaceCaptureManifest.ts not found');
  process.exit(1);
}

const sourceFiles = listFiles(srcDir);
const manifest = readUtf8(manifestPath);
const matchingFiles = findMatchingFiles(sourceFiles);
const cssMatches = matchingFiles.filter((entry) => entry.isCss);
const sourceMatches = matchingFiles.filter((entry) => !entry.isCss);
const dataFlowSurfaceCandidates = matchingFiles.filter(isDataFlowSurfaceCandidate);
const dataFlowDesktopSurfaceRenders = dataFlowSurfaceCandidates.filter((entry) => entry.hasDesktopSurfaceRender);

const manifestChecks = [
  {
    label: 'manifest label',
    pass: manifest.includes('label: "Data Flow Workbench"'),
    evidence: '`label: "Data Flow Workbench"`',
  },
  {
    label: 'manifest slug',
    pass: manifest.includes('slug: "data-flow-workbench"'),
    evidence: '`slug: "data-flow-workbench"`',
  },
  {
    label: 'manifest active surface',
    pass: manifest.includes('activeSurface: "mission-data-flow-workbench"'),
    evidence: '`activeSurface: "mission-data-flow-workbench"`',
  },
  {
    label: 'manifest explicit target',
    pass: manifest.includes('targetSelector: ".mission-data-flow-workbench"'),
    evidence: '`targetSelector: ".mission-data-flow-workbench"`',
  },
  {
    label: 'manifest fullscreen-only profile',
    pass: manifest.includes('requiredProfiles: ["desktop-fullscreen"]'),
    evidence: '`requiredProfiles: ["desktop-fullscreen"]`',
  },
  {
    label: 'manifest special-case note',
    pass: manifest.toLowerCase().includes('special-case'),
    evidence: '`special-case` note present',
  },
];

const footprintChecks = [
  {
    label: 'source footprint discovered',
    pass: matchingFiles.length > 0,
    evidence: `${matchingFiles.length} matched files`,
  },
  {
    label: 'CSS/layout footprint discovered',
    pass: cssMatches.length > 0,
    evidence: `${cssMatches.length} matched CSS files`,
  },
  {
    label: 'Data Flow surface candidates discovered',
    pass: dataFlowSurfaceCandidates.length > 0,
    evidence: `${dataFlowSurfaceCandidates.length} explicit Data Flow target/source files`,
  },
  {
    label: 'kept out of normal DesktopSurface migration',
    pass: dataFlowDesktopSurfaceRenders.length === 0,
    evidence:
      dataFlowDesktopSurfaceRenders.length === 0
        ? 'no explicit Data Flow target/source file renders `<DesktopSurface`'
        : `${dataFlowDesktopSurfaceRenders.length} explicit Data Flow target/source files render \`<DesktopSurface\``,
  },
];

const checks = [...manifestChecks, ...footprintChecks];
const failedChecks = checks.filter((check) => !check.pass);

for (const check of checks) {
  console.log(`[data-flow-workbench-audit] ${statusIcon(check.pass)} ${check.label}`);
}

const doc = `# Data Flow Workbench Audit

This document is generated by \`npm run qa:data-flow-workbench-audit\`.

## Verdict

Data Flow Workbench remains an intentional special-case surface after the desktop envelope migration phase.

This audit does **not** migrate Data Flow Workbench to \`DesktopSurface\`. It records the current repo contract and the evidence needed before deciding whether Data Flow should be migrated, wrapped with a dedicated contract, or redesigned as a mini-application surface.

## Audit checks

| Check | Status | Evidence |
| --- | --- | --- |
${checks.map((check) => `| ${check.label} | ${statusIcon(check.pass)} | ${check.evidence} |`).join('\n')}

## Explicit Data Flow surface candidates

${formatList(dataFlowSurfaceCandidates.map((entry) => `${entry.path} — ${entry.matches.join(', ')}`))}

## Matched source footprint

${formatList(sourceMatches.map((entry) => `${entry.path} — ${entry.matches.join(', ')}`))}

## Matched CSS/layout footprint

${formatList(cssMatches.map((entry) => `${entry.path} — ${entry.matches.join(', ')}`))}

## Current contract

- Data Flow Workbench is captured by the dev QA harness as \`data-flow-workbench\`.
- The active surface remains \`mission-data-flow-workbench\`.
- The capture target remains \`.mission-data-flow-workbench\`.
- The required visual QA profile remains fullscreen-only.
- It is intentionally excluded from the normal desktop envelope migration set.
- The audit only treats explicit Data Flow target/source files as migration candidates; generic files that mention Data Flow while also importing \`DesktopSurface\` for other surfaces are not migration evidence.

## Decision gates before migration

Before any Data Flow Workbench migration, answer these questions from code and captures:

1. Which element owns horizontal width?
2. Which element owns vertical scroll?
3. Is the Workbench a normal Studio surface or a mini-application with its own layout contract?
4. Can it safely use \`DesktopSurface\`, or does it need a dedicated Data Flow shell?
5. Does the 1440x900 reference profile need to become mandatory for this surface?
6. Which CSS rules are historical compatibility shims and which are still required?

## Explicit non-goals for this audit

- no OrbitFabric Core changes
- no reference mission changes
- no Data Flow semantics changes
- no graph or workflow behavior changes
- no screenshot automation changes
- no mobile/tablet support
- no Data Flow Workbench migration
`;

if (shouldWrite) {
  const changed = writeIfChanged(qaDocPath, doc);
  console.log(
    `[data-flow-workbench-audit] ${changed ? 'updated' : 'unchanged'} docs/qa/data-flow-workbench-audit.md`,
  );
} else if (!fs.existsSync(qaDocPath)) {
  console.error('[data-flow-workbench-audit] FAIL docs/qa/data-flow-workbench-audit.md missing; rerun with --write');
  process.exit(1);
}

if (failedChecks.length > 0) {
  console.error('[data-flow-workbench-audit] failed checks:');
  for (const check of failedChecks) {
    console.error(`  - ${check.label}`);
  }
  process.exit(1);
}

console.log('[data-flow-workbench-audit] PASS');
