# ADR 0001: Mission Content First Studio

Status: accepted

Date: 2026-06-02

## Context

OrbitFabric Studio is a read-only companion surface for OrbitFabric Core. The current baseline protects the engineering boundary: Core remains authoritative, Studio does not edit Mission Model YAML, Studio does not perform operational control, and Studio does not infer private mission semantics.

The QA baseline identified a product problem: the UI often presented the reliability mechanism before the mission itself. Users saw paths, report states, preview states, provenance and evidence routing before they could answer basic mission questions.

Those questions are:

- What mission is open?
- What spacecraft and payloads are modeled?
- Which data products exist?
- Which scenarios exist and what ran?
- Which generated outputs are available?
- Where are the current warnings?

Read-only does not mean metadata-first. Core-derived does not mean the primary content must be report plumbing.

## Decision

Studio will follow a mission-content-first product rule:

> Show the mission first. Then show why that representation is reliable.

The Mission Cockpit will be driven by a Mission Content View Model. That view model is a deterministic, read-only adapter over already available Studio and Core inputs:

- workspace inspection;
- Core model summary;
- Core entity index;
- Core relationship manifest;
- Core dashboard summary;
- Core scenario run index;
- Core coverage summary;
- Core simulation report;
- generated artifact dashboard summary.

The adapter may normalize, group and label Core and workspace facts for presentation. It must not parse YAML semantically, derive private health scores, derive private completeness scores, infer relationship graphs, infer mission readiness, mutate generated artifacts or introduce runtime behavior.

## Persistence decision

No durable Studio database is introduced for this pivot.

Mission content, coverage, scenario outcomes, data-flow links, generated artifact mappings and model entities remain reconstructable from workspace files and Core-owned outputs. Adding SQLite, a key-value database, localStorage-backed mission state or a Tauri store now would create a second authoritative-looking state that must be invalidated and reconciled.

Durable local persistence is deferred until there is a non-authoritative UI need, such as:

- last opened workspaces;
- recent projects;
- panel layout preferences;
- local UI preferences;
- cache entries with strong invalidation and no mission authority.

Persistence must not become a source of mission truth.

## Consequences

The v0.15.0 Cockpit should foreground:

- mission identity;
- spacecraft summary;
- payload summary;
- data product summary;
- scenario summary;
- generated artifact summary;
- warnings;
- compact evidence posture.

The following concepts remain visible only as support evidence, not as the primary story:

- Core report availability;
- read-only boundary;
- source paths;
- known or unknown artifact state;
- previewability;
- provenance;
- raw command output.

This ADR does not authorize React Flow, YAML authoring, visual model editing, operational control, live telemetry or private mission inference.
