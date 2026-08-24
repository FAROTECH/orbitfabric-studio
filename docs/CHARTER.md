# OrbitFabric Studio — Project Charter

## Purpose

OrbitFabric Studio exists to help a human **see and understand a mission** represented by OrbitFabric.

The foundational relationship is:

> **OrbitFabric exposes the Mission Data Contract. OrbitFabric Studio exposes the mission to the human.**

Studio is not designed to support OrbitFabric as a development convenience. It is designed to support the end user who needs to form a coherent engineering understanding of a mission.

## Product thesis

A mission is one system. Studio presents complementary lenses over that system rather than a collection of disconnected tools.

The long-term mission-understanding lenses are:

- **SYSTEM** — what exists and how the mission is structured;
- **OPERATIONS** — what can happen and under which declared conditions;
- **MISSION DATA** — commands, telemetry, events, faults and other mission data;
- **DATA LIFECYCLE** — how mission data products are produced, stored and moved;
- **SCENARIOS & EVIDENCE** — what was exercised and what evidence exists.

Relationships are connective tissue across those lenses, not a sixth domain.

The cognitive order is:

```text
MISSION / DATA
      -> RELATIONSHIPS / INTENT
      -> BEHAVIOR / EVIDENCE
      -> PROVENANCE / RAW FILES
```

Source files and raw Core outputs remain important for trust and traceability, but they are not the first thing the user should have to understand.

## Questions Studio should answer

A useful Studio session should progressively answer questions such as:

- What mission is this?
- What spacecraft, subsystems, payloads and mission-data entities exist?
- How is a selected entity connected to the rest of the mission?
- What path did I follow while investigating it?
- What can happen from this operational state or mode?
- How does a data product move through its declared lifecycle?
- What behavior is declared by the contract?
- What behavior was actually exercised or observed in deterministic evidence?
- Where did this fact come from?

## Authority model

OrbitFabric Core owns engineering meaning, including:

- Mission Model loading and schema interpretation;
- semantic validation and lint;
- explicit engineering relationships;
- scenario semantics and evidence;
- generated/exported contract artifacts;
- future machine-readable mission semantics.

Studio owns:

- visual organization;
- navigation and selection;
- progressive disclosure;
- read-model hydration;
- graph layout and interaction;
- presentation labels/grouping that do not create new engineering facts;
- local, non-authoritative UI state.

Studio may explain mission meaning. It must not invent mission meaning.

## First public-preview scope

The feature-frozen developer/source preview contains one complete differentiated product slice with complementary lenses:

```text
Open Mission
  -> Mission Atlas
  -> Explore / Entity X-Ray
  -> Relations / Context Path / Context Map
  -> Validation Findings / exact entity inspection
  -> Operations / Operational State Map / Mode Focus
```

A user can enter through the mission, find an entity, understand it, follow real Core-owned relationships, review Core validation and explore declared operational logic without beginning from YAML or reports.

## Next product slice

After the preview, the next product slice is:

1. **Data Product Journey** — answer how a product moves from producer through declared lifecycle and downlink context.

Scenario/replay/evidence work comes later and must preserve the distinction:

```text
DECLARED != OBSERVED
```

## Explicit boundaries

Studio is not:

- OrbitFabric Core;
- a second validator;
- a Mission Model editor in the current roadmap;
- a generic YAML IDE;
- a generic graph editor;
- a dashboard/KPI product;
- flight software;
- a spacecraft simulator;
- mission control;
- a ground segment;
- a live telemetry or command system;
- a cloud collaboration platform.

## Engineering principles

- Mission first; implementation plumbing later.
- Every engineering relationship shown as truth must be Core-owned or explicitly source-owned.
- A missing semantic surface is shown as unavailable, not reconstructed heuristically.
- Provenance must be reachable from meaningful facts.
- Visuals must answer real engineering questions; decoration alone is not a feature.
- The UI may reduce cognitive load, never engineering explicitness.
- Local UI state must never become mission truth.
- `loadable != lint-clean`.
- `DECLARED != OBSERVED`.

## Release philosophy

Releases are narrow, inspectable and tied to real Core capabilities. The first preview is a developer/source release, not a binary packaging promise.

The release criterion is simple:

> An engineer who did not build Studio can install it, open a compatible OrbitFabric mission, understand that mission faster, and trust that the facts shown were not invented by Studio.
