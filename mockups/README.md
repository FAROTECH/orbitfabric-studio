# Mockups

This directory may contain conceptual sketches for OrbitFabric Studio.

Mockups are not product commitments.

They are design aids used to explore possible user experience directions while preserving the architectural boundaries defined by the Charter.

---

## Allowed Mockup Themes

Mockups may explore:

- Mission Contract Explorer;
- Validation Workbench;
- Diagnostics Panel;
- Contract Navigation Surface;
- Mission Model Graph;
- Generated Artifact Explorer;
- Scenario Evidence Explorer;
- Ground Integration Artifact Viewer;
- Controlled Authoring Preview;
- Integration Workbench.

---

## Required Discipline

Every mockup must respect the following rules:

```text
The Mission Model remains the source of truth.
OrbitFabric Core remains authoritative.
Studio is a downstream visual engineering workbench.
```

A mockup must not imply that Studio owns mission semantics.

A mockup must not imply that Studio performs live operations.

A mockup must not imply that Studio replaces OrbitFabric Core.

---

## Provenance Requirement

Any meaningful visual element in a mockup should be explainable in terms of:

- source Mission Model entity;
- OrbitFabric Core report;
- generated artifact;
- scenario evidence;
- future plugin-declared output;
- UI-only presentation state.

A graph node or edge without provenance should not be presented as engineering truth.

---

## Forbidden Mockup Patterns

Avoid mockups that show or imply:

- fake live telemetry;
- fake command uplink;
- fake mission-control console;
- active ground station connectivity;
- real spacecraft state;
- live pass execution;
- operational alarms;
- real-time monitoring dashboard;
- unsupported Yamcs/OpenC3/XTCE compatibility;
- cloud collaboration before explicitly justified;
- AI-generated contract changes without explicit patch/review/validation flow.

---

## Generated Artifacts in Mockups

Generated artifacts must be clearly marked as generated.

Source model files, derived reports, generated outputs and UI state must remain visually distinguishable.

A mockup must not encourage users to edit generated outputs directly.

---

## Controlled Authoring Mockups

Controlled authoring mockups are allowed only if they show the full safety loop:

```text
user intent
    -> proposed Mission Model patch
    -> visible diff
    -> explicit confirmation
    -> source model write
    -> OrbitFabric Core validation
    -> accepted/rejected state
```

A mockup must not show freeform visual editing that bypasses the Mission Model.

---

## Status Label

Recommended status label for early mockups:

```text
Conceptual mockup — not an implemented feature.
```

For future implementation-aligned mockups:

```text
Design candidate — pending implementation.
```

Mockups must not be presented as shipped UI until the corresponding feature exists.
