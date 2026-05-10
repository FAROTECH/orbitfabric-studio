# OrbitFabric Studio — UX Principles

## Principle 1 — Contract First

The Mission Data Contract is the primary object of the interface.

Studio should not start from screens, dashboards or diagrams. It should start from contract entities and their relationships.

## Principle 2 — Evidence Over Decoration

Visuals must clarify engineering relationships.

Decorative visuals that do not improve traceability, validation or comprehension should be avoided.

## Principle 3 — Traceability

Every visual element should be traceable to one of the following:

- Mission Model entity
- scenario definition
- validation result
- generated report
- generated artifact
- plugin-declared output

## Principle 4 — Source Awareness

The user must always know whether they are looking at:

- source model
- derived report
- generated output
- local UI state

## Principle 5 — Broken References Must Be Visible

Invalid or unresolved relationships must not be hidden.

Studio should make broken references, missing artifacts and validation errors easy to locate.

## Principle 6 — No Hidden Auto-fixes

Studio must not silently repair, rewrite or reinterpret Mission Model data.

Any future assisted edit must be explicit, reviewable and validation-gated.

## Principle 7 — Validation Decides

Studio may present validation results.

OrbitFabric Core decides validity.

## Principle 8 — Generated Means Disposable

Generated artifacts must be visually marked as generated.

Studio should not encourage users to manually edit generated outputs.

## Principle 9 — Reduce Cognitive Load Without Reducing Explicitness

Studio should make complex contract relationships easier to understand while preserving engineering explicitness.

A simplified view must not become a vague view.

## Principle 10 — Local-first Workflow

Studio should initially support local project inspection and validation.

Remote/cloud concepts are not part of the initial UX foundation.

## Principle 11 — Narrow Workflows Beat Broad Dashboards

Each screen should answer a precise engineering question.

Examples:

- What entities are defined?
- Is the model valid?
- Which data product is produced by which payload?
- Which contact window can support which downlink intent?
- Which generated artifacts came from this model?
- Which scenario evidence passed or failed?

## Principle 12 — Do Not Imitate Mission Control

Studio is not an operator console.

The UI must not imply live spacecraft access, real telemetry, command uplink or mission operations capability.
