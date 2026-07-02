#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const shouldWrite = process.argv.includes("--write");
const srcDir = path.join(repoRoot, "src");
const outputPath = path.join(repoRoot, "docs", "qa", "e26-studio-icon-inventory.generated.md");

const TEXT_EXTENSIONS = new Set([".ts", ".tsx", ".css"]);

function walk(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) {
      continue;
    }

    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }

    if (entry.isFile() && TEXT_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function rel(filePath) {
  return path.relative(repoRoot, filePath).replaceAll(path.sep, "/");
}

function lineForOffset(text, offset) {
  return text.slice(0, offset).split("\n").length;
}

function sanitizeCell(value) {
  return String(value)
    .replaceAll("|", "\\|")
    .replaceAll("\n", " ")
    .trim();
}

function markdownTable(headers, rows) {
  if (rows.length === 0) {
    return "_None found._\n";
  }

  return [
    `| ${headers.join(" |")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(sanitizeCell).join(" | ")} |`),
  ].join("\n") + "\n";
}

function uniqueBy(items, keyFn) {
  const seen = new Set();
  const result = [];

  for (const item of items) {
    const key = keyFn(item);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(item);
  }

  return result;
}

const files = walk(srcDir);
const records = {
  dashboardIconPaths: [],
  hiddenGlyphs: [],
  cssContentGlyphs: [],
  iconClassReferences: [],
  cssIconSelectors: [],
  rawGlyphCandidates: [],
};

const glyphPattern = /[^\x00-\x7F]|[▣◉♢⌁▤›‹→←↔↑↓•·…○●◌◇◆□■△▲▽▼✓✕×]/u;
const interestingAsciiGlyphs = new Set([">", "<"]);

for (const filePath of files) {
  const text = fs.readFileSync(filePath, "utf8");
  const relativePath = rel(filePath);

  if (relativePath === "src/DashboardIcon.tsx") {
    const iconObjectRegex = /(?:^|\n)\s*(?:"([^"]+)"|([a-zA-Z][\w-]*)):\s*"([^"]+)"/g;
    let match;

    while ((match = iconObjectRegex.exec(text)) !== null) {
      const kind = match[1] ?? match[2];
      const svgPath = match[3];

      if (!svgPath.startsWith("M")) {
        continue;
      }

      records.dashboardIconPaths.push({
        file: relativePath,
        line: lineForOffset(text, match.index),
        kind,
        svgPath,
      });
    }
  }

  const hiddenTagRegex = /<([a-zA-Z][\w.]*)\b(?=[^>]*aria-hidden=["']true["'])[^>]*>([^<>]{0,80})<\/\1>/g;
  let hiddenMatch;

  while ((hiddenMatch = hiddenTagRegex.exec(text)) !== null) {
    const stripped = hiddenMatch[2].trim();

    if (!stripped) {
      continue;
    }

    if (glyphPattern.test(stripped) || [...interestingAsciiGlyphs].some((candidate) => stripped === candidate)) {
      records.hiddenGlyphs.push({
        file: relativePath,
        line: lineForOffset(text, hiddenMatch.index),
        tag: hiddenMatch[1],
        glyph: stripped,
      });
    }
  }

  const cssContentRegex = /content:\s*["']([^"']+)["']/g;
  let cssMatch;

  while ((cssMatch = cssContentRegex.exec(text)) !== null) {
    const value = cssMatch[1];

    if (value.trim().length === 0) {
      continue;
    }

    const normalizedContent = value.trim();

    if (
      !glyphPattern.test(normalizedContent) &&
      normalizedContent.length > 4
    ) {
      continue;
    }

    records.cssContentGlyphs.push({
      file: relativePath,
      line: lineForOffset(text, cssMatch.index),
      content: normalizedContent,
    });
  }

  const classNameIconRegex = /className=(?:\{[^}\n]*icon[^}\n]*\}|["'][^"']*icon[^"']*["'])/g;
  let classMatch;

  while ((classMatch = classNameIconRegex.exec(text)) !== null) {
    records.iconClassReferences.push({
      file: relativePath,
      line: lineForOffset(text, classMatch.index),
      usage: classMatch[0].slice(0, 160),
    });
  }

  if (relativePath.endsWith(".css")) {
    const cssSelectorRegex = /(^|[}\n,]\s*)([.#][^{\n,]*icon[^{\n,]*)\s*\{/g;
    let selectorMatch;

    while ((selectorMatch = cssSelectorRegex.exec(text)) !== null) {
      records.cssIconSelectors.push({
        file: relativePath,
        line: lineForOffset(text, selectorMatch.index),
        selector: selectorMatch[2].trim(),
      });
    }
  }

  const rawGlyphRegex = /(["'`>])([^"'`<>\n]{0,24}[▣◉♢⌁▤›‹→←↔↑↓•·…○●◌◇◆□■△▲▽▼✓✕×][^"'`<>\n]{0,24})(["'`<])/gu;
  let rawMatch;

  while ((rawMatch = rawGlyphRegex.exec(text)) !== null) {
    records.rawGlyphCandidates.push({
      file: relativePath,
      line: lineForOffset(text, rawMatch.index),
      text: rawMatch[2].trim(),
    });
  }
}

records.hiddenGlyphs = uniqueBy(records.hiddenGlyphs, (item) => `${item.file}:${item.line}:${item.glyph}`);
records.cssContentGlyphs = uniqueBy(records.cssContentGlyphs, (item) => `${item.file}:${item.line}:${item.content}`);
records.iconClassReferences = uniqueBy(records.iconClassReferences, (item) => `${item.file}:${item.line}:${item.usage}`);
records.cssIconSelectors = uniqueBy(records.cssIconSelectors, (item) => `${item.file}:${item.line}:${item.selector}`);
records.rawGlyphCandidates = uniqueBy(records.rawGlyphCandidates, (item) => `${item.file}:${item.line}:${item.text}`);

const proposedRegistry = [
  ["mission", "Mission overview / cockpit identity", "hex/cube orbital frame", "Existing DashboardIcon mission can remain baseline"],
  ["core", "Core Report Runner / fixed Core commands", "terminal/report card", "Unify core and core-report-runner into one primary operational mark"],
  ["data-flow", "Relationships / route / traceability", "connected-node path", "Create dedicated StudioIcon instead of reusing relationships ad hoc"],
  ["data-products", "Data Products / model inventory", "stacked grid/data tiles", "Separate from generic model grid"],
  ["scenarios", "Scenario Evidence / timelines", "branching timeline", "Keep distinct from data-flow relationship graph"],
  ["artifacts", "Generated Artifacts / outputs", "document stack", "Existing artifacts path is acceptable but should be moved into final registry"],
  ["status-readonly", "Read-only/Core-owned boundary", "shield/lock", "Do not use random glyphs like ▣ for this"],
  ["status-core", "Core latest state", "small pulse/dot", "OK/FAIL/Idle should be semantic state, not separate icons"],
  ["capture", "Surface capture utility", "camera/frame", "Replace plain text-only capture affordance in implementation pass"],
  ["open-detail", "Open/detail/drill-down", "chevron right", "Use one chevron primitive everywhere"],
  ["close/back", "Close/back/collapse", "chevron left / x", "Keep sidebar collapse separate but same stroke language"],
];

const findings = [
  ["Centralized SVG registry exists", records.dashboardIconPaths.length, "src/DashboardIcon.tsx"],
  ["Inline aria-hidden glyphs", records.hiddenGlyphs.length, "Replace or justify through StudioIcon"],
  ["CSS generated glyphs", records.cssContentGlyphs.length, "Audit before implementation"],
  ["Icon class references", records.iconClassReferences.length, "Map to semantic registry"],
  ["CSS icon selectors", records.cssIconSelectors.length, "Check for duplicated visual primitives"],
  ["Raw glyph candidates", records.rawGlyphCandidates.length, "Potential ad hoc icons"],
];

const generatedAt = new Date().toISOString();

const markdown = `# E26 — Studio Icon Inventory

Generated by: \`npm run qa:icon-audit\`  
Generated at: ${generatedAt}

> This file is generated. Do not edit manually; update \`tools/dev/audit-studio-icons.mjs\` or the source icon usage.

---

## Summary

${markdownTable(["Finding", "Count", "Action"], findings)}

---

## Existing centralized DashboardIcon paths

${markdownTable(
  ["Kind", "File", "Line", "SVG path"],
  records.dashboardIconPaths.map((item) => [item.kind, item.file, item.line, item.svgPath]),
)}

---

## Inline aria-hidden glyphs

${markdownTable(
  ["Glyph", "Tag", "File", "Line"],
  records.hiddenGlyphs.map((item) => [item.glyph, item.tag, item.file, item.line]),
)}

---

## CSS content glyphs

${markdownTable(
  ["Content", "File", "Line"],
  records.cssContentGlyphs.map((item) => [item.content, item.file, item.line]),
)}

---

## Icon class references

${markdownTable(
  ["File", "Line", "Usage"],
  records.iconClassReferences.map((item) => [item.file, item.line, item.usage]),
)}

---

## CSS icon selectors

${markdownTable(
  ["Selector", "File", "Line"],
  records.cssIconSelectors.map((item) => [item.selector, item.file, item.line]),
)}

---

## Raw glyph candidates

${markdownTable(
  ["Text", "File", "Line"],
  records.rawGlyphCandidates.map((item) => [item.text, item.file, item.line]),
)}

---

## Proposed semantic icon registry for E27

${markdownTable(
  ["Token", "Meaning", "Visual primitive", "Implementation note"],
  proposedRegistry,
)}

---

## E27 implementation rules

- All reusable icons should be rendered through a single \`StudioIcon\` component.
- Raw glyphs are allowed only for text content, never for primary UI iconography.
- Sidebar, status bar, surface headers, cards, tables and action controls should share the same stroke language.
- Same semantic action means same icon across surfaces.
- Decorative icons must remain \`aria-hidden="true"\`; semantic icon-only buttons require accessible labels.
- Icon color must come from semantic CSS state, not from per-component hard-coded color.
`;

if (shouldWrite) {
  fs.writeFileSync(outputPath, markdown);
  console.log(`Wrote ${path.relative(repoRoot, outputPath)}`);
} else {
  process.stdout.write(markdown);
}
