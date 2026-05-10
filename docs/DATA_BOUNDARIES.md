# OrbitFabric Studio — Data Boundaries

## 1. Purpose

This document defines the data boundaries of OrbitFabric Studio.

Studio is a downstream visual engineering workbench for OrbitFabric Mission Data Contracts.

It may inspect, display, organize, visualize and eventually help users modify selected Mission Model data through explicit, validation-gated workflows.

It must not create hidden mission semantics, private model formats or alternative sources of truth.

The Mission Model remains the source of truth.

OrbitFabric Core remains authoritative for validation, scenario evidence and generated artifacts.

---

## 2. Boundary Thesis

Studio operates on four different categories of data:

```text
source model      = authoritative user-authored Mission Model files
derived report    = OrbitFabric Core output derived from the source model
generated output  = disposable artifact generated from the contract
UI state          = local representation used by Studio
```

Every Studio view must preserve this distinction.

Every future editing workflow must write back to the source model explicitly.

No Studio-internal representation may become more authoritative than the Mission Model.

---

## 3. Source Model Data

Source model data is authoritative.

Examples include OrbitFabric mission model files such as:

- spacecraft definitions;
- subsystem definitions;
- mode definitions;
- telemetry definitions;
- command definitions;
- event definitions;
- fault definitions;
- payload definitions;
- data product definitions;
- packet definitions;
- contact window definitions;
- policy definitions;
- commandability definitions;
- autonomy definitions;
- scenario definitions, where applicable.

Studio may:

- read source model files;
- display source model files;
- link diagnostics to source model files;
- show source provenance;
- show entity summaries derived from Core outputs;
- eventually propose explicit patches to source model files;
- eventually write source model changes only through controlled editing workflows.

Studio must not:

- silently rewrite source model files;
- silently normalize source model files;
- hide source model changes;
- create unsupported source model sections;
- create private Studio-only mission semantics;
- treat an internal UI representation as authoritative.

---

## 4. Derived Report Data

Derived reports are outputs produced by OrbitFabric Core from source model data.

Examples include:

- lint reports;
- validation reports;
- semantic diagnostics;
- model summaries;
- entity indexes;
- relationship indexes;
- scenario execution reports;
- data-flow evidence reports;
- generated artifact manifests;
- runtime contract manifests;
- ground export manifests;
- future plugin reports.

Derived reports are not source.

They explain, summarize or evaluate the source Mission Model.

Studio may:

- display derived reports;
- group diagnostics;
- make diagnostics navigable;
- build UI indexes from reports;
- render relationship views from reports;
- preserve raw report access;
- link reports back to source model files where metadata exists.

Studio must not:

- alter derived reports and present them as Core output;
- invent diagnostics not emitted by Core;
- suppress validation failures silently;
- upgrade invalid reports to valid UI states;
- treat derived reports as editable source data.

If a derived report lacks information needed by Studio, the preferred action is to improve OrbitFabric Core outputs.

Studio must not compensate by implementing private semantic interpretation.

---

## 5. Generated Output Data

Generated outputs are disposable artifacts produced from the Mission Data Contract.

Examples include:

- generated Markdown documentation;
- generated JSON reports;
- generated data-flow documentation;
- generated runtime-facing C++ bindings;
- generated adapter interfaces;
- generated registries;
- generated command argument structures;
- generated smoke-test artifacts;
- generated telemetry dictionaries;
- generated command dictionaries;
- generated event dictionaries;
- generated fault dictionaries;
- generated packet dictionaries;
- generated decoder skeletons;
- generated ground export files;
- future plugin-generated artifacts.

Generated outputs are not authoritative source.

Studio may:

- list generated outputs;
- classify generated outputs;
- preview generated outputs;
- display artifact provenance;
- display artifact freshness where possible;
- link generated outputs back to source entities where Core metadata supports it;
- distinguish runtime-facing from ground-facing artifacts;
- distinguish experimental from stable artifacts where metadata exists.

Studio must not:

- encourage manual editing of generated outputs;
- treat generated outputs as source Mission Model data;
- silently patch generated outputs;
- merge generated code with user code;
- claim generated artifacts are operational unless explicitly supported;
- claim external compatibility unless implemented, tested and documented.

If a generated artifact needs to change, the source Mission Model or generator configuration should be changed, then artifacts regenerated.

---

## 6. UI State Data

UI state is local Studio data used to support interaction.

Examples include:

- expanded/collapsed tree nodes;
- selected workspace;
- selected file;
- selected entity;
- selected graph filters;
- panel layout;
- recent projects;
- theme or display preferences;
- cached view models;
- local command history;
- last validation status display;
- non-authoritative graph layout positions.

Studio may persist UI state locally.

Studio must make sure UI state does not become contract state.

UI state must not:

- define mission entities;
- define mission semantics;
- override Core validation;
- hide validation results;
- create private model truth;
- modify source model files without an explicit editing workflow.

Cached UI state must be invalidated or refreshed when source files or Core outputs change.

---

## 7. Workspace Data

A Studio workspace is expected to be a local OrbitFabric mission workspace.

The local workspace may contain:

```text
mission source files
scenario files
generated reports
generated documentation
runtime-facing generated artifacts
ground-facing generated artifacts
logs
temporary outputs
```

Studio may:

- open a local workspace;
- inspect workspace structure;
- detect known OrbitFabric files and directories;
- detect generated output directories;
- detect available reports;
- detect available scenarios;
- detect configured Core executable;
- detect Core version where available.

Studio must not:

- assume every folder is a valid OrbitFabric mission;
- silently create missing model structure in early releases;
- silently delete generated artifacts;
- silently move source files;
- silently reorganize a user's workspace;
- require cloud storage for local inspection.

Early Studio versions are inspection-first, not project-creation-first.

---

## 8. Core Command Data

Studio may invoke OrbitFabric Core commands.

Examples include:

- validation commands;
- documentation generation commands;
- scenario execution commands;
- runtime binding generation commands;
- ground artifact generation commands, when available;
- version or capability discovery commands.

Studio may consume:

- command exit status;
- standard output;
- standard error;
- generated JSON reports;
- generated files;
- generated manifests;
- version information.

Studio must:

- preserve command failures visibly;
- distinguish validation failure from application failure;
- display unsupported Core versions clearly;
- avoid hiding raw Core output;
- avoid converting Core diagnostics into vague UI errors.

Studio must not:

- fake successful Core execution;
- ignore Core command failures;
- substitute private Studio validation for failed Core validation;
- mutate command outputs and present them as raw Core output.

---

## 9. Scenario Data

Scenario data may include:

- scenario source files;
- scenario metadata;
- Core scenario execution output;
- scenario logs;
- evidence JSON;
- evidence Markdown;
- data-flow evidence records;
- expected effects;
- passed expectations;
- failed expectations.

Studio may:

- list scenarios;
- display scenario source;
- run scenarios through OrbitFabric Core;
- display deterministic evidence;
- show timelines;
- show passed/failed expectations;
- link evidence to source model entities where possible.

Studio must not:

- present scenario evidence as live spacecraft behavior;
- present scenario execution as physical simulation;
- present scenario outputs as real telemetry;
- simulate dynamics, RF, payload physics or onboard execution independently;
- invent scenario outcomes.

Scenario evidence is deterministic contract-level evidence.

It is not mission operations.

---

## 10. Runtime-facing Data

Runtime-facing data may include artifacts generated by OrbitFabric Core for implementation-facing use.

Examples include:

- C++ identifiers;
- command argument structures;
- registries;
- adapter interfaces;
- runtime contract manifests;
- host-build smoke validation artifacts;
- generated headers or source files.

Studio may:

- inspect runtime-facing artifacts;
- classify them as generated;
- show provenance where available;
- show related Mission Model entities;
- show generation status;
- show experimental/stable status where metadata exists.

Studio must not:

- claim to execute flight software;
- claim to validate runtime integration beyond Core outputs;
- modify generated runtime artifacts directly;
- merge generated code into user code;
- become an OBC framework;
- become a runtime build system.

Runtime-facing artifacts are generated contract outputs.

They are not Studio-owned runtime behavior.

---

## 11. Ground-facing Data

Ground-facing data may include artifacts generated by OrbitFabric Core for ground integration experiments or workflows.

Examples include:

- telemetry dictionaries;
- command dictionaries;
- event dictionaries;
- fault dictionaries;
- data product dictionaries;
- packet dictionaries;
- decoder skeletons;
- ground export manifests;
- mission database preview outputs;
- future exporter/plugin outputs.

Studio may:

- inspect ground-facing artifacts;
- classify them as generated;
- show provenance;
- show compatibility metadata where implemented;
- distinguish prototype/experimental/stable status;
- link artifacts back to contract entities where possible.

Studio must not:

- claim to be a ground segment;
- claim to be a mission control system;
- claim live telemetry support;
- claim command uplink support;
- claim Yamcs/OpenC3/XTCE compatibility unless implemented, tested and documented;
- execute ground operations;
- store mission operations credentials.

Ground-facing artifacts are contract exports.

They are not operational ground infrastructure.

---

## 12. Plugin Data

Plugin data is future-facing and must remain tightly controlled.

Potential plugin-related data may include:

- plugin metadata;
- plugin manifests;
- plugin diagnostics;
- plugin-generated reports;
- plugin-generated artifacts;
- plugin compatibility information.

Studio may eventually:

- list Core-declared plugins;
- display plugin metadata;
- display plugin diagnostics;
- display plugin-generated artifacts;
- distinguish Core outputs from plugin outputs;
- show plugin provenance.

Studio must not:

- create an independent plugin system before Core supports one;
- execute untrusted plugin code without a security model;
- treat plugin outputs as Core outputs;
- hide whether an artifact came from Core or from a plugin;
- allow plugins to create hidden contract semantics.

Plugin support requires explicit architecture and security decisions.

---

## 13. Authoring Data

Authoring data includes proposed changes to the source Mission Model.

Future authoring data may include:

- proposed entity creation;
- proposed entity modification;
- YAML patch;
- structured patch;
- diff preview;
- validation result after write;
- rejected change state;
- accepted change state;
- generated artifact impact hint;
- scenario regeneration hint.

Studio may eventually produce authoring data.

Authoring data must be explicit, reviewable and validation-gated.

The required flow is:

```text
user intent
    -> proposed patch
    -> visible diff
    -> explicit confirmation
    -> source model write
    -> OrbitFabric Core validation
    -> accepted/rejected state
```

Studio must not:

- write hidden changes;
- create unreviewed model modifications;
- silently auto-fix source files;
- edit unsupported domains;
- edit generated artifacts as if they were source;
- create Studio-only model state;
- treat unvalidated changes as accepted.

Authoring assistance must improve Mission Model quality.

It must not bypass the Mission Model.

---

## 14. Forbidden Data Surfaces

Studio must not own or require:

- live spacecraft telemetry;
- live command paths;
- mission operations credentials;
- ground station credentials;
- RF system credentials;
- spacecraft access tokens;
- telemetry archive databases;
- command authorization databases;
- operational procedure execution state;
- live pass execution state;
- onboard runtime state;
- hidden cloud copies of mission workspaces;
- undisclosed remote uploads;
- private alternative mission models.

These surfaces are outside the identity of Studio.

---

## 15. Sensitive and Proprietary Data Considerations

Mission workspaces may contain sensitive or proprietary engineering information.

Studio should be designed with local-first trust assumptions.

Early versions should avoid:

- automatic network calls;
- telemetry uploads;
- remote validation;
- cloud sync;
- account systems;
- hidden analytics;
- remote project indexing;
- external service dependencies.

If future remote or collaboration features are considered, they require explicit architecture decisions and clear user consent.

---

## 16. File Modification Policy

Early versions should be read-only.

When write support is introduced, Studio may modify source Mission Model files only through explicit authoring workflows.

Studio must not modify files as a side effect of:

- opening a workspace;
- viewing a file;
- running validation;
- browsing artifacts;
- rendering graphs;
- inspecting evidence.

Generated outputs may be created only through explicit Core generation commands or user-approved workflows.

Studio must not silently delete, overwrite or reorganize source files.

---

## 17. Caching Policy

Studio may cache data for performance or convenience.

Cacheable data may include:

- parsed UI read models;
- graph layout positions;
- recent workspace list;
- last selected entity;
- rendered previews;
- validation report references;
- artifact indexes.

Cached data must not be authoritative.

Studio must invalidate or refresh caches when:

- source model files change;
- derived reports change;
- generated artifacts change;
- Core version changes;
- workspace path changes;
- plugin metadata changes.

A stale cache must not override current Core validation or current source model content.

---

## 18. Provenance Policy

Studio should preserve provenance for every meaningful object.

For each displayed object, Studio should eventually know:

```text
object kind
source / derived / generated / UI-only category
origin file or report
origin command, where relevant
related source entity, where available
generated artifact path, where relevant
timestamp or freshness metadata, where available
Core version, where available
plugin origin, where relevant
```

Objects without provenance should be treated as presentation-only.

They must not be presented as engineering truth.

---

## 19. Freshness Policy

Studio should eventually help users understand freshness.

Relevant questions:

- Has validation been run after the latest source change?
- Were generated artifacts produced from the current source model?
- Is scenario evidence stale?
- Is a runtime binding generated from the current contract?
- Is a ground export generated from the current contract?
- Did the Core version change since the artifact was generated?

Freshness may initially be best-effort.

Studio must not falsely imply that stale outputs are current.

---

## 20. Error State Data

Studio must distinguish error states clearly.

Important error categories:

- OrbitFabric executable missing;
- OrbitFabric executable not configured;
- unsupported Core version;
- invalid workspace;
- missing source model file;
- malformed source file;
- failed validation;
- failed generation;
- malformed Core output;
- missing generated artifact;
- stale generated artifact;
- scenario execution failure;
- plugin metadata failure;
- internal Studio failure.

Validation failure is not a Studio crash.

Invalid model is not an application error.

The UI must preserve that distinction.

---

## 21. Data Boundary Test

When adding a new feature, apply this test:

```text
Which data category does this feature touch?
```

Possible answers:

- source model;
- derived report;
- generated output;
- UI state;
- external system data;
- forbidden operational data.

Then ask:

```text
Is this data authoritative?
```

If yes, it must be owned by the Mission Model or OrbitFabric Core.

Then ask:

```text
Is Studio creating new engineering meaning?
```

If yes, the feature is invalid unless that meaning is explicitly defined by OrbitFabric Core.

Then ask:

```text
Can this be implemented through Core outputs, manifests or explicit patches?
```

If no, the feature is premature.

---

## 22. Summary

Studio may read, display, organize and visualize Mission Data Contract data.

Studio may eventually propose explicit, reviewable and validation-gated Mission Model changes.

Studio may inspect derived reports and generated artifacts.

Studio may cache UI state.

Studio must not create hidden semantics.

Studio must not become authoritative for mission meaning.

Studio must not own live operational data.

Studio must not blur source, derived, generated and UI-only data.

The Mission Model remains the source of truth.

OrbitFabric Core remains the validation and generation authority.

Studio makes those surfaces inspectable.
