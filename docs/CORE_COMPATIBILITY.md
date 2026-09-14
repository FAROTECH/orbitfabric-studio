# Core Compatibility and Provenance

OrbitFabric Studio consumes the Core-owned, mission-independent Core Interface Manifest before opening a MissionSession generation.

```bash
orbitfabric export core-interface --json <path>
```

Studio resolves the configured executable once. A bare command is resolved from `PATH`; an explicit path is canonicalized. The resulting executable path is then used for the manifest probe and every Core operation belonging to that accepted generation.

Changing `orbitfabric-studio.core-executable` does not mutate an active session. The changed value remains pending until Refresh or Open Mission creates and accepts a new `sessionId + generation`.

## Current Studio requirements

| Studio domain | Capability | Contract kind | Version |
|---|---|---|---|
| Primary mission | `mission_snapshot` | `orbitfabric.mission_snapshot` | `0.1-candidate` |
| Entities | `entity_index` | `orbitfabric.entity_index` | `0.1` |
| Relationships | `relationship_manifest` | `orbitfabric.relationship_manifest` | `0.1-candidate` |
| Scenarios | `scenario_declaration` | `orbitfabric.scenario_declaration` | `0.1-candidate` |
| Integrations | `integration_input_set` | `orbitfabric.integration_input_set` | `0.1-candidate` |

Requirements are evaluated by domain. Primary incompatibility prevents Mission open. Secondary and Scenario incompatibility remains localized and does not destroy valid primary Mission state.

Lint JSON remains a legacy secondary report. It is not part of capability negotiation because Core does not give it an independent contract kind/version identity. Simulation JSON and Adapter Lifecycle surfaces are also not H4 requirements.

Studio compares capability id, contract kind and contract version. Product version is provenance only. `interface_sha256` identifies a complete declared interface compactly, but fingerprint equality is not the compatibility rule.

## Inspectable session provenance

After Mission open, the Core control in the top bar exposes:

- configured executable captured by the session;
- resolved launch executable;
- Core product version;
- Core interface version;
- complete interface SHA-256;
- per-domain compatibility and exact findings;
- configuration pending for the next generation.

Studio does not search for Core installations, inspect repositories, infer capabilities from semantic versions or executable names, or parse `--help`.

## Failure states

Studio preserves these states where applicable:

- `executable_unavailable`
- `invocation_failed`
- `compatibility_protocol_failed`
- `version_unavailable`
- `interface_identity_unavailable`
- `compatibility_response_malformed`
- `known_incompatible`
- `compatible`
- `configuration_changed`
