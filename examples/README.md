# Examples

This directory is reserved for OrbitFabric Studio examples.

For `v0.0.0 — Studio Charter`, no executable examples are required.

Studio examples must remain aligned with OrbitFabric Core and must not introduce private mission semantics.

---

## Intended Future Use

Future examples may include:

- references to public OrbitFabric mission workspaces;
- sample Studio inspection sessions;
- example validation reports;
- example generated artifact manifests;
- example scenario evidence views;
- example graph input/output mappings;
- example controlled authoring patch flows.

---

## Relationship with OrbitFabric Core Examples

Studio should prefer using public examples from the OrbitFabric Core repository where possible.

Studio examples should demonstrate how Studio consumes and presents Core outputs.

They should not define an alternative model format.

Correct pattern:

```text
OrbitFabric example mission
    -> OrbitFabric Core validation/generation
    -> Studio inspection surface
```

Incorrect pattern:

```text
Studio-only example mission
    -> private Studio semantics
    -> UI-specific contract behavior
```

---

## Example Data Categories

Examples should clearly distinguish:

```text
source model      = authoritative Mission Model files
derived report    = OrbitFabric Core output
generated output  = disposable artifact generated from the contract
UI state          = local Studio representation
```

Example folders should not blur these categories.

---

## Forbidden Example Content

Do not include examples that imply:

- live telemetry;
- command uplink;
- mission control behavior;
- operational ground segment behavior;
- real spacecraft access;
- ground station credentials;
- proprietary or sensitive mission data;
- external tool compatibility unless implemented and tested;
- Studio-only model semantics.

---

## Future Example Candidate Structure

A future example may use a structure like:

```text
examples/
└── demo-3u-inspection/
    ├── README.md
    ├── mission/
    │   └── <reference or copy of public OrbitFabric example>
    ├── core-outputs/
    │   ├── lint-report.json
    │   ├── artifact-manifest.json
    │   └── scenario-evidence.json
    └── studio-notes/
        └── inspection-flow.md
```

This is only a future candidate structure.

It is not required for v0.0.0.

---

## v0.0.0 Position

For v0.0.0, this directory exists only to reserve the location and define example policy.

No example should be added until it can be clearly tied to real OrbitFabric Core outputs.
