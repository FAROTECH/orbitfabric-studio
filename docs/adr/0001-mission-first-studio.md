# ADR 0001: Mission-first Studio

**Status:** accepted  
**Supersedes:** the historical cockpit/report-oriented product framing preserved in Git history

## Context

OrbitFabric Studio must preserve a strict engineering boundary: OrbitFabric Core owns mission semantics; Studio does not infer private relationships, perform independent validation, edit Mission Model source in the current roadmap, or perform operational control.

The earlier Studio generations nevertheless framed the product too often around implementation mechanisms: workspaces, reports, generated artifacts, validation runners, provenance plumbing and cockpit-style summaries. That made the reliability mechanism more visible than the mission itself.

The reboot establishes a stronger product thesis:

> **OrbitFabric exposes the Mission Data Contract. OrbitFabric Studio exposes the mission to the human.**

## Decision

Studio is mission-first.

The primary object of the UI is the mission as one system, explored through complementary lenses. The user should understand mission content and relationships before needing to inspect source paths, raw JSON or Core command details.

The cognitive order is:

```text
MISSION / DATA
      -> RELATIONSHIPS / INTENT
      -> BEHAVIOR / EVIDENCE
      -> PROVENANCE / RAW FILES
```

Relationships are connective tissue across mission-understanding lenses, not an isolated product domain.

## First implementation consequence

The first public-preview journey is:

```text
Open Mission
  -> Mission Atlas
  -> Entity Explorer
  -> Entity X-Ray
  -> explicit relationship traversal
  -> Relationship Explorer
  -> Context Path
  -> Context Map
```

Core Mission Snapshot is primary hydration. Entity Index, relationships and lint hydrate progressively after the mission is already useful.

This encodes:

```text
loadable != lint-clean
```

## Semantic boundary

Studio may normalize, group, label, lay out and navigate Core-owned facts for presentation.

Studio must not:

- parse YAML/filesystem structure to recover missing semantics;
- infer engineering relationships;
- derive private health/readiness/completeness/coverage;
- treat graph geometry as mission meaning;
- turn expected/declarative behavior into observed evidence.

If Core does not expose required meaning, Studio improves the Core surface or shows the information as unavailable.

## Identity and exploration

Entity identity is domain-qualified:

```text
{domain,id}
```

The Global Studio Selection identifies the current semantic subject across lenses.

Context Path is explicitly UI presentation state representing the path the user actually followed through Core-owned edges. It is not a shortest-path or causal claim.

## Persistence consequence

No durable mission database is introduced.

Studio may persist non-authoritative convenience state such as recent mission paths and the configured Core executable. Mission truth remains reconstructable from the Mission Model and Core-owned outputs.

## Future consequence

The next mission-understanding slices are Operations Logic and Data Product Journey. Scenario/replay/evidence work must preserve:

```text
DECLARED != OBSERVED
```

Mission Model authoring is not an implied destination of this ADR. It would require a separate product and architecture decision.
