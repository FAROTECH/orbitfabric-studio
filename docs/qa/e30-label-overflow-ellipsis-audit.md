# E30 — Label Overflow / Ellipsis Audit

## Decision

E30 intentionally does **not** apply a broad CSS remediation pass.

The repository contains many `text-overflow: ellipsis`, `overflow: hidden`, and `white-space: nowrap` rules across cockpit surfaces. A grep-only interpretation would produce a very large and risky layout refactor. Visual review of the current fullscreen public-preview surfaces shows that most ellipsis behavior is intentional containment for technical values, dense evidence tables, paths, filenames, scenario identifiers, timeline rows, and status telemetry.

The correct E30 outcome is therefore to document the policy and avoid destabilizing the visual baseline established by E28 and the Generated Artifacts action contract closed by E29.

## Reviewed surfaces

Fullscreen captures were reviewed for the current public-preview surfaces:

- Mission Overview
- Core Report Runner
- Data Flow Workbench
- Data Flow Workbench focus mode
- Data Products
- Scenario Evidence
- Generated Artifacts

## Findings

Primary headings, surface titles, main CTA labels, and major cockpit section labels are generally readable at fullscreen resolution.

Observed ellipsis/truncation is limited mainly to:

- long generated artifact paths;
- filenames and relative paths;
- scenario YAML identifiers;
- timeline record details;
- dense table cells;
- compact technical IDs;
- status-bar and capture telemetry;
- dashboard card values with intentionally constrained space.

These cases are acceptable when the surrounding component provides inspection, table context, preview, full path access, or title/tooltip support.

## Policy

Ellipsis is allowed for:

- paths;
- filenames;
- relative paths;
- command previews;
- scenario IDs;
- technical identifiers;
- generated artifact table cells;
- timeline rows;
- status-bar telemetry;
- dense cockpit values where the full value is available elsewhere.

Ellipsis is not acceptable for:

- surface titles;
- primary headings;
- major card titles;
- primary CTA labels;
- sidebar item labels in expanded mode;
- public-preview guardrail labels;
- labels whose truncation changes product meaning.

## Engineering boundary

No CSS override was added in E30.

A broad override such as forcing `white-space: normal` over existing cockpit components would risk breaking carefully stabilized E28/E29 layout constraints, especially around:

- sidebar stability;
- status-bar stability;
- dense tables;
- generated artifact inventory;
- scenario timeline;
- Data Flow Workbench graph and timeline layout.

Future fixes should be targeted only when a visible primary label is demonstrably truncated at the supported public-preview envelopes.

## Follow-up rule

If future visual QA finds a real label overflow defect, the fix must be scoped to the smallest selector set possible and must include before/after capture evidence.

Recommended classification:

- **A — fix immediately:** primary label, CTA, heading, card title, sidebar item, surface name.
- **B — allowed with protection:** path, filename, command arg, technical value, if full value is inspectable or exposed by title/tooltip.
- **C — leave unchanged:** preview/code/output containers, tables, graph/timeline nodes, scroll clamps, and visual containment primitives.
