# OrbitFabric Studio — Vision

## See the mission

OrbitFabric Studio exists to make a mission understandable as one engineering system.

> **OrbitFabric exposes the Mission Data Contract. OrbitFabric Studio exposes the mission to the human.**

The product is not a prettier view of YAML and not a dashboard over Core reports. Its job is to turn explicit mission data and relationships into a coherent mental model that an engineer can explore.

## The human problem

A real mission spreads meaning across spacecraft structure, modes, telemetry, commands, events, faults, payloads, data products, lifecycle intent, contacts, recovery logic and scenario evidence.

The difficulty is not that these facts are stored in text. The difficulty is understanding how they form one mission.

Studio should let a user begin with the mission and progressively ask:

```text
What exists?
How is it connected?
What can happen?
How does data move?
What was exercised?
Where did this fact come from?
```

## Mission-understanding model

Studio organizes the mission through complementary lenses:

### SYSTEM
What exists, which participants are modeled and how the mission is structured.

### OPERATIONS
What modes/states exist, what transitions are declared and what can happen from a selected operational context.

### MISSION DATA
Commands, telemetry, events, faults, packets and other mission-data entities as parts of the same system.

### DATA LIFECYCLE
How mission data products are produced, transformed, stored and made eligible for transfer/downlink.

### SCENARIOS & EVIDENCE
What behavior was exercised, what expectations were evaluated and what deterministic evidence exists.

Relationships connect these lenses. They are not a separate destination.

## Cognitive order

The UI should follow this order whenever possible:

```text
MISSION / DATA
      -> RELATIONSHIPS / INTENT
      -> BEHAVIOR / EVIDENCE
      -> PROVENANCE / RAW FILES
```

This is intentionally different from a report-centric workbench. Provenance remains mandatory, but the user should not have to understand the reliability mechanism before understanding the mission.

## Contract to evidence

The longer-term arc is:

```text
MISSION CONTRACT
      -> RELATIONSHIPS
      -> SCENARIO
      -> RUN / REPLAY
      -> EXPECTATIONS
      -> COVERAGE
```

Studio must never blur the line between what is declared and what happened in evidence:

```text
DECLARED != OBSERVED
```

A declared transition is not an observed transition. Downlink eligibility is not actual downlink. A scenario expectation is not proof until corresponding evidence exists.

## What Studio should feel like

Studio should feel like a serious engineering workstation:

- technical;
- calm;
- explicit;
- visual where visuals reduce cognitive load;
- traceable;
- responsive;
- local-first;
- focused on the mission rather than on application machinery.

It should not feel like:

- mission control;
- a SaaS dashboard;
- a file browser with decorations;
- a graph toy;
- an investor demo;
- a generic modeling IDE.

## Visual direction

Visual structures are justified when they explain structure, state, flow or relationships better than text.

Examples include:

- a Mission Atlas for structural orientation;
- an Operational State Map for mode/transition logic;
- a Context Map for local relationship exploration;
- a Data Product Journey for lifecycle understanding.

A visual that cannot explain its nodes, edges and provenance is not engineering truth and should not be presented as such.

## Authority and trust

The Mission Model and OrbitFabric Core remain authoritative for engineering meaning.

Studio may aggregate, group, label, lay out and navigate those facts. It must not create a second semantic layer by inference.

If Core does not expose a fact, Studio should either request a stronger Core surface or say that the information is unavailable.

Trust comes from that restraint.

## Local-first direction

Studio begins as a local desktop application using a locally available OrbitFabric Core runtime and local mission workspaces.

No cloud account, hosted project store or hidden network service is required for the first serious product.

This is not merely an implementation shortcut. It matches the trust model of engineering workspaces that may contain proprietary mission data.

## Product evolution

The first preview proves the foundational loop:

```text
OPEN MISSION
      -> ORIENT
      -> FIND
      -> UNDERSTAND
      -> FOLLOW RELATIONSHIPS
```

The next layers deepen mission understanding:

```text
OPERATIONS
      -> DATA LIFECYCLE
      -> SCENARIOS / EVIDENCE
```

Editing is not an assumed destination. If authoring is ever considered, it requires a separate product decision and must preserve Core authority; the current vision does not depend on it.

## Success

Studio succeeds when a user can open an unfamiliar compatible mission and form a useful, trustworthy mental model faster than by beginning with raw files and command output.

It fails if it becomes a second Core, a generic contract GUI, a decorative dashboard, or a collection of unrelated utilities.

The shortest statement of the vision remains:

> **See the mission.**
