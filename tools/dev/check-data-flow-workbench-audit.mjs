#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const args = new Set(process.argv.slice(2));
const shouldWrite = args.has('--write');

const srcDir = path.join(repoRoot, 'src');
const manifestPath = path.join(srcDir, 'devSurfaceCaptureManifest.ts');
const qaDocPath = path.join(repoRoot, 'docs/qa/data-flow-workbench-audit.md');
const surfacePath = path.join(srcDir, 'MissionDataFlowWorkbenchSurface.tsx');
const bridgeCssPath = path.join(srcDir, 'dataFlowWorkbenchDesktopEnvelope.css');
const mainPath = path.join(srcDir, 'main.tsx');

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

function exists(filePath) {
  return fs.existsSync(filePath);
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

if (!exists(manifestPath)) {
  console.error('[data-flow-workbench-audit] FAIL: src/devSurfaceCaptureManifest.ts not found');
  process.exit(1);
}

const sourceFiles = listFiles(srcDir);
const manifest = readUtf8(manifestPath);
const surface = exists(surfacePath) ? readUtf8(surfacePath) : '';
const bridgeCss = exists(bridgeCssPath) ? readUtf8(bridgeCssPath) : '';
const mainTsx = exists(mainPath) ? readUtf8(mainPath) : '';
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
    label: 'manifest reference profile',
    pass: manifest.includes('"desktop-reference-1440x900"'),
    evidence: '`desktop-reference-1440x900` required',
  },
  {
    label: 'manifest fullscreen profile',
    pass: manifest.includes('"desktop-fullscreen"'),
    evidence: '`desktop-fullscreen` required',
  },
  {
    label: 'manifest desktop contract note',
    pass: manifest.toLowerCase().includes('desktop-contract migrated in e12'),
    evidence: '`Desktop-contract migrated in E12` note present',
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
    label: 'DesktopSurface contract present',
    pass: surface.includes('DesktopSurface') && surface.includes('data-flow-workbench-desktop-surface'),
    evidence: surface.includes('data-flow-workbench-desktop-surface')
      ? '`MissionDataFlowWorkbenchSurface` renders the desktop contract class'
      : '`MissionDataFlowWorkbenchSurface` is missing the desktop contract class',
  },
  {
    label: 'bridge CSS exists',
    pass: exists(bridgeCssPath) && bridgeCss.includes('data-flow-workbench-desktop-surface'),
    evidence: '`src/dataFlowWorkbenchDesktopEnvelope.css`',
  },
  {
    label: 'bridge CSS imported',
    pass: mainTsx.includes('./dataFlowWorkbenchDesktopEnvelope.css'),
    evidence: '`src/main.tsx` imports Data Flow bridge CSS',
  },
  {
    label: 'explicit Data Flow DesktopSurface render discovered',
    pass: dataFlowDesktopSurfaceRenders.length > 0,
    evidence:
      dataFlowDesktopSurfaceRenders.length > 0
        ? `${dataFlowDesktopSurfaceRenders.length} explicit Data Flow target/source files render \`<DesktopSurface\``
        : 'no explicit Data Flow target/source file renders `<DesktopSurface`',
  },
];

const checks = [...manifestChecks, ...footprintChecks];
const failedChecks = checks.filter((check) => !check.pass);

for (const check of checks) {
  console.log(`[data-flow-workbench-audit] ${statusIcon(check.pass)} ${check.label}`);
}

const doc = `# Data Flow Workbench Desktop Contract Audit

This document is generated by \`npm run qa:data-flow-workbench-audit\`.

## Verdict

Data Flow Workbench has a dedicated E12 desktop contract.

It is now wrapped by \`DesktopSurface\`, requires both the desktop-reference and fullscreen visual QA profiles, and remains read-only. This contract does not change Core semantics, graph semantics, data-flow evidence, focus-mode behavior, drawer behavior, generated artifacts, or scenario behavior.

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
- The required visual QA profiles are \`desktop-reference-1440x900\` and \`desktop-fullscreen\`.
- The surface root is promoted to \`DesktopSurface\` through \`MissionDataFlowWorkbenchSurface\`.
- The dedicated bridge stylesheet is \`src/dataFlowWorkbenchDesktopEnvelope.css\`.
- Data Flow remains a workbench-style mini-app surface: the desktop contract stabilizes width, scroll, and reference behavior without changing its data semantics.

## Visual QA gates after E12

1. Data Flow Workbench fullscreen capture.
2. Data Flow Workbench desktop-reference capture around 1400/1440.
3. Mission Overview fullscreen smoke capture.
4. Core Report Runner fullscreen smoke capture.
5. Data Products fullscreen smoke capture.
6. Generated Artifacts fullscreen smoke capture.
7. Scenario Evidence fullscreen smoke capture.

## Explicit non-goals

- no OrbitFabric Core changes
- no reference mission changes
- no Data Flow semantics changes
- no graph or workflow behavior changes
- no drawer/focus-mode behavior changes
- no screenshot automation changes
- no mobile/tablet support
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
