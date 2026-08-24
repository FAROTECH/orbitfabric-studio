# OrbitFabric Studio — Data Boundaries

## Purpose

This document defines what data Studio may hold and what authority that data has.

The boundary follows one rule:

> **OrbitFabric Core owns mission semantics. Studio owns a non-authoritative human read model and interaction state.**

## 1. Mission source

Mission Model files remain authoritative source data.

Studio may expose source/provenance information supplied by Core surfaces, but the current preview does not semantically parse YAML to reconstruct mission meaning and does not modify source files.

Opening, browsing, refreshing or rendering a mission must not rewrite or reorganize the user's workspace.

## 2. Core-derived mission surfaces

The first preview consumes machine-readable Core surfaces including:

- Mission Snapshot;
- Entity Index;
- Relationship Manifest;
- lint/diagnostic information.

These are derived representations of the mission. They are not editable source.

Studio may:

- validate their protocol shape;
- verify that relationship endpoints resolve against the available entity index;
- normalize them into presentation-friendly structures;
- group and label facts without changing their engineering meaning.

Studio must not:

- add semantic relationships that Core did not provide;
- convert missing information into inferred facts;
- override Core diagnostics;
- present modified data as raw Core output.

## 3. Primary and secondary hydration

Mission Snapshot is primary hydration and determines whether the mission can enter the useful Studio experience.

Entity Index, relationships and lint are secondary progressive hydration.

This means:

```text
loadable != lint-clean
```

A loaded mission with warnings remains a valid Studio session. A missing secondary surface may reduce available detail without erasing the already-loaded mission.

## 4. Studio read model

`MissionSession` is a non-authoritative, generation-scoped read model assembled from Core outputs.

It may contain:

- mission identity/content needed by the active lenses;
- indexed entities;
- explicit relationships;
- lint status;
- presentation-ready lookup structures.

It must never become a replacement source of truth for the Mission Model.

## 5. UI-only state

Studio owns local presentation state such as:

- current mission path;
- recent mission paths;
- configured Core executable path;
- global semantic selection;
- active lens;
- filters;
- Context Path;
- last valid Operations Mode Focus;
- graph expansion state;
- pan/zoom/layout state.

This state may influence what the user sees. It must not define mission entities or engineering relationships.

Recent paths and Core executable configuration may be persisted locally because they are application preferences, not mission truth.

## 6. Entity identity

Studio identifies an entity by:

```text
{domain,id}
```

Textual ID alone is insufficient because different domains may legitimately reuse the same ID.

All cross-surface selection, lookup and relationship handling must preserve the domain-qualified identity.

## 7. Relationship boundary

Engineering relationship semantics belong to Core.

Studio may create presentation concepts around explicit relationships, such as:

- engineering-intent grouping;
- local graph membership;
- current-neighborhood emphasis;
- Context Path based on edges the user actually followed.

Those are presentation state. They do not create new mission edges or causality.

## 8. Context Graph boundary

The Context Graph contains nodes and edges selected from explicit Core-owned relationships plus UI-only expansion/selection metadata.

The Operational State Map contains only Mission Snapshot `modes` and `mode_transitions`. Mode Focus may join explicit Core fields such as `allowed_modes`, recovery `mode_transition`, recovery-intent `target_mode` and commandability mode declarations. Preconditions and expected effects are preserved as declared Core JSON; Studio does not interpret them into private behavior. Payload lifecycle values remain effects and never become mission-mode nodes.

ELK geometry and React Flow positions/routes are UI state only. Position, distance and direction on screen must not be interpreted as additional mission semantics beyond the explicit edge direction supplied by Core-owned facts.

## 9. Temporary Core output

Core commands invoked for hydration write structured output only into Studio-owned OS temporary directories.

Temporary files must not be written to the mission workspace as a side effect of opening or refreshing Studio.

Request temporary directories are cleaned after use, including failure paths covered by the backend implementation/tests.

## 10. Process result boundary

Studio distinguishes:

```text
process status
protocol validity
semantic result
```

They are not interchangeable.

A non-zero process exit may accompany a valid structured semantic result such as lint findings. A zero exit with malformed expected JSON is still a protocol failure from Studio's perspective.

## 11. Refresh and stale data

Open/Refresh use generation-scoped transactional hydration.

A late response from an older generation must not overwrite a newer mission session.

On successful refresh, valid semantic selection and Context Path are reconciled where possible. UI geometry may be recalculated.

## 12. Provenance and raw data

Provenance supports trust and should remain reachable when Core provides it.

However, provenance/raw files are the final layer of the cognitive flow rather than the primary product object:

```text
MISSION / DATA
      -> RELATIONSHIPS / INTENT
      -> BEHAVIOR / EVIDENCE
      -> PROVENANCE / RAW FILES
```

## 13. Future scenario/evidence boundary

When scenario/replay/evidence surfaces are implemented, they must distinguish declared model facts from exercised/observed evidence:

```text
DECLARED != OBSERVED
```

Studio must not promote expected behavior into observed behavior without evidence supplied by the appropriate Core surface.

## 14. Generated outputs

Generated/exported artifacts may become provenance or integration context in later lenses, but they are not part of the first preview's primary product surface and are never authoritative mission source.

Studio must not mutate generated artifacts and present the result as Core output.

## 15. Source modification

The current roadmap is read-only with respect to Mission Model source.

No file write is authorized merely because Studio can display the corresponding entity. Any future authoring proposal requires a separate architecture/product decision.

## 16. Network and sensitive data

The preview is local-first and should not require hidden remote services, automatic uploads, analytics or cloud copies of a mission workspace.

Mission data may be proprietary. Introducing remote storage, collaboration or telemetry requires an explicit security/trust decision.

Studio must not own operational credentials, live spacecraft telemetry, command authorization state or ground-station execution state.

## Boundary test

For any new data field or feature, ask:

1. Is this an authoritative mission fact? If yes, it must originate from source/Core semantics.
2. Is this only presentation/interaction state? If yes, Studio may own it but must not present it as mission truth.
3. Is Studio inferring engineering meaning because Core does not expose it? If yes, stop and improve Core or show unavailable.
