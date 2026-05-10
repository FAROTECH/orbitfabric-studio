# OrbitFabric Studio — Risk Register

## 1. Purpose

This document identifies the main architectural, product, UX and trust risks for OrbitFabric Studio.

OrbitFabric Studio is a downstream visual engineering workbench for OrbitFabric Mission Data Contracts.

Its main risk is not technical difficulty.

Its main risk is semantic drift.

Studio must never become a second OrbitFabric Core, a fake ground segment, a decorative dashboard or an unsafe visual editor.

The Mission Model remains the source of truth.

OrbitFabric Core remains authoritative for validation, scenario evidence and generated artifacts.

---

## 2. Risk Severity Scale

```text
Low       = limited impact, easy to correct
Medium    = meaningful impact, requires design correction
High      = serious impact on project quality or trust
Critical  = threatens project identity or architectural validity
```

---

## 3. Risk Probability Scale

```text
Low       = unlikely if current discipline is maintained
Medium    = plausible during normal development
High      = likely unless actively controlled
```

---

# R1 — Studio Becomes a Second Core

## Severity

Critical

## Probability

Medium

## Description

Studio duplicates OrbitFabric Core responsibilities such as model loading, semantic validation, linting, reference resolution, scenario execution logic or artifact generation.

## Why It Matters

This would create two sources of truth.

The CLI and Studio could disagree.

The Mission Data Contract would lose trust.

## Early Warning Signs

- Studio implements its own semantic validator.
- Studio reports validity without Core validation.
- Studio creates private model concepts.
- Studio resolves references differently from Core.
- Studio hides or rewrites Core diagnostics.
- Studio-generated artifacts do not come from Core.

## Mitigation

- Delegate validation to OrbitFabric Core.
- Consume machine-readable Core outputs.
- Keep the Adapter Layer presentational.
- Add Core outputs when Studio needs structured information.
- Prohibit private Studio semantics.
- Document every integration boundary.

## Owner

Architecture

## Status

Active mitigation required from v0.0 onward.

---

# R2 — Studio Creates Semantic Drift Through the Adapter Layer

## Severity

Critical

## Probability

Medium

## Description

The Studio Adapter Layer gradually becomes a second model engine by normalizing, inferring or repairing contract semantics.

## Why It Matters

The Adapter Layer is necessary, but dangerous.

It must convert Core outputs into UI state without creating new engineering meaning.

## Early Warning Signs

- Adapter code contains domain validation logic.
- Adapter silently fills missing relationships.
- Adapter repairs invalid model states.
- Adapter creates synthetic entities that look authoritative.
- UI graphs show relationships not emitted or supported by Core.
- Tests validate Adapter semantics instead of Core output rendering.

## Mitigation

- Define Adapter Layer as presentation-only.
- Require provenance for nodes, edges and diagnostics.
- Mark UI-only objects clearly.
- Push missing semantics into OrbitFabric Core.
- Add tests that verify provenance, not private semantics.

## Owner

Architecture / Implementation

## Status

Active mitigation required before v0.1.

---

# R3 — Studio Is Perceived as a Ground Segment

## Severity

High

## Probability

Medium

## Description

Users interpret Studio as a live telemetry system, command console, mission control platform or ground segment.

## Why It Matters

This would confuse the identity of both Studio and OrbitFabric.

It could also create false expectations about operational capabilities.

## Early Warning Signs

- UI uses mission-control language.
- Screens imitate operator consoles.
- Ground artifact views look like live telemetry dashboards.
- Generated dictionaries are presented as operational systems.
- Documentation says or implies "ground system ready".
- Screenshots show fake spacecraft status.

## Mitigation

- Use precise language: ground-facing artifact, not ground segment.
- Prohibit fake live telemetry visuals.
- Prohibit command uplink UI.
- Clearly mark scenario evidence as deterministic, not live.
- Clearly mark generated artifacts as generated.
- Keep NON_GOALS visible in README and docs.

## Owner

UX / Documentation

## Status

Active mitigation required from v0.0 onward.

---

# R4 — Studio Looks Like Mission Control

## Severity

High

## Probability

Medium

## Description

Studio adopts visual metaphors that imply live operations, such as spacecraft status panels, telemetry lights, command buttons or pass execution dashboards.

## Why It Matters

OrbitFabric Studio is an engineering workbench.

It is not an operator console.

The wrong visual language would damage project credibility.

## Early Warning Signs

- "Live" labels appear in the UI.
- Fake spacecraft state is shown.
- Buttons imply command transmission.
- Scenario evidence is displayed as telemetry stream.
- Ground exports are displayed as active ground contacts.
- UI prioritizes spectacle over traceability.

## Mitigation

- Use engineering workbench terminology.
- Prefer source/provenance/status views over operations panels.
- Label scenario evidence explicitly.
- Label ground exports explicitly.
- Review mockups against NON_GOALS and UX_PRINCIPLES.
- Avoid fake mission-control screenshots.

## Owner

UX / Product

## Status

Active mitigation required before mockups.

---

# R5 — Studio Becomes a Decorative Dashboard

## Severity

Medium

## Probability

Medium

## Description

Studio focuses on impressive visuals rather than traceable engineering value.

## Why It Matters

The value of Studio is not visual polish.

The value is making contract relationships, diagnostics, evidence and generated artifacts inspectable.

## Early Warning Signs

- Graphs have unclear node/edge meaning.
- Visuals lack provenance.
- Dashboards summarize without source links.
- UI hides raw reports.
- Screens look impressive but do not answer technical questions.
- Mockups are optimized for social sharing rather than engineering review.

## Mitigation

- Require each screen to answer a specific engineering question.
- Require provenance for every meaningful visual element.
- Preserve raw output access.
- Prefer narrow workflows over broad dashboards.
- Review every view against UX_PRINCIPLES.

## Owner

UX / Product

## Status

Active mitigation required from v0.0 onward.

---

# R6 — Studio Is Treated as Only a Post-processing Viewer

## Severity

Medium

## Probability

Medium

## Description

Studio is perceived as only a viewer for already-completed contracts, generated documentation and lint results.

## Why It Matters

Studio starts read-only by maturity strategy, not by identity.

The long-term vision includes controlled, validation-gated authoring.

If this is not clear, Studio may appear too limited or strategically weak.

## Early Warning Signs

- Documentation says or implies Studio only runs lint/gen.
- Authoring is never mentioned.
- Roadmap stops at artifact viewing.
- Users ask why Studio exists instead of using CLI plus documentation.
- Early UX questions only cover completed contract inspection.

## Mitigation

- State clearly that Studio is not read-only by identity.
- Keep authoring in the long-term roadmap.
- Define controlled authoring as patch-based and validation-gated.
- Avoid introducing authoring too early.
- Explain the maturity sequence: inspect first, author later.

## Owner

Product / Documentation

## Status

Mitigated in v0.0 wording; continue monitoring.

---

# R7 — Authoring Is Introduced Too Early

## Severity

High

## Probability

Medium

## Description

Studio begins modifying Mission Model files before inspection, validation, navigation and diagnostics are reliable.

## Why It Matters

Premature editing risks corrupting source models and creating user distrust.

It also increases pressure to implement private semantics in Studio.

## Early Warning Signs

- Visual editing appears before read-only inspection is stable.
- Form-based editing bypasses Core validation.
- Diffs are not shown.
- Unsupported domains become editable.
- Generated artifacts are edited directly.
- Invalid changes are silently corrected.

## Mitigation

- Delay authoring until after inspection and validation workflows are stable.
- Start with low-risk domains only.
- Use explicit patches.
- Show diffs before writes.
- Validate after every write.
- Keep unsupported domains read-only.
- Never edit generated artifacts as source.

## Owner

Architecture / UX / Implementation

## Status

Deferred until controlled authoring milestone.

---

# R8 — Authoring Creates a Private Studio Model

## Severity

Critical

## Probability

Medium

## Description

Future editing workflows create an internal visual model that becomes more important than the OrbitFabric Mission Model.

## Why It Matters

This would undermine the core identity of OrbitFabric.

Studio would become an alternative modeling system.

## Early Warning Signs

- Studio stores mission entities in a private database.
- YAML becomes an export format instead of source of truth.
- Users can create concepts not supported by Core.
- UI state contains authoritative mission semantics.
- Round-trip between Studio and YAML is lossy.
- Studio can show a "valid" model that Core cannot validate.

## Mitigation

- The Mission Model remains source of truth.
- Editing must produce explicit YAML/source patches.
- Diffs must be visible.
- Core validation must decide acceptance.
- No unsupported domain editing.
- No private schema without Core support.

## Owner

Architecture

## Status

Critical risk for future authoring.

---

# R9 — Generated Artifacts Are Treated as Source

## Severity

High

## Probability

Medium

## Description

Users or Studio workflows treat generated documentation, runtime bindings or ground exports as authoritative editable source.

## Why It Matters

Generated artifacts are disposable outputs.

The source Mission Model must remain authoritative.

## Early Warning Signs

- UI allows editing generated files.
- Generated outputs appear in the same visual category as source.
- Generated artifacts lack "generated" labels.
- Users are guided to patch generated code manually.
- Studio merges generated artifacts with user code.

## Mitigation

- Clearly label generated artifacts.
- Separate source and generated areas in the UI.
- Discourage manual edits to generated outputs.
- Guide users back to the source model or generator inputs.
- Preserve artifact provenance.

## Owner

UX / Architecture

## Status

Active mitigation required before artifact explorer.

---

# R10 — Validation Failures Are Hidden or Softened

## Severity

High

## Probability

Medium

## Description

Studio hides, softens, rephrases too aggressively or visually downplays Core validation failures.

## Why It Matters

Validation failure is an engineering result.

It must remain visible and actionable.

## Early Warning Signs

- Invalid models produce vague UI errors.
- Diagnostics are hidden behind generic banners.
- Raw Core output is unavailable.
- UI shows green status despite Core warnings.
- Validation failures are treated as crashes.
- Studio suppresses diagnostics locally.

## Mitigation

- Preserve raw Core output.
- Distinguish validation failure from application failure.
- Display diagnostics clearly.
- Group diagnostics without changing meaning.
- Never override Core status.
- Avoid suppression features unless Core supports them.

## Owner

UX / Implementation

## Status

Active mitigation required before v0.2.

---

# R11 — Missing Core Outputs Lead to Studio Workarounds

## Severity

High

## Probability

High

## Description

Studio needs structured information that OrbitFabric Core does not yet emit, so Studio implements local parsing or inference.

## Why It Matters

This is the most likely path to semantic drift.

## Early Warning Signs

- Studio parses multiple YAML files deeply.
- Studio reconstructs entity relationships.
- Studio infers data-flow links not emitted by Core.
- Studio creates graph relationships from heuristics.
- Studio adds ad-hoc model assumptions.

## Mitigation

- Open Core issues for missing machine-readable outputs.
- Add Core-generated summaries, indexes and manifests.
- Keep Studio parsing shallow and presentational.
- Mark best-effort UI data clearly.
- Avoid stable features depending on heuristics.

## Owner

Architecture / Core Integration

## Status

High-probability risk before v0.3/v0.4.

---

# R12 — Core Is Distorted to Serve UI Convenience

## Severity

High

## Probability

Medium

## Description

OrbitFabric Core semantics or model shape are changed only to simplify Studio rendering.

## Why It Matters

Core must remain a clean Mission Data Contract framework.

UI convenience must not drive semantic compromise.

## Early Warning Signs

- Model fields are renamed only for UI layout.
- Core data model becomes UI-shaped.
- Core accepts weaker semantics for easier rendering.
- Core adds presentation concepts to source model.
- Core outputs become less engineering-oriented.

## Mitigation

- Add derived reports or manifests instead of changing source semantics.
- Keep source model decisions Core-led.
- Use ADRs for cross-repo decisions.
- Separate semantic model from presentation summaries.
- Protect Core roadmap discipline.

## Owner

Core Architecture / Studio Architecture

## Status

Active mitigation required after repo creation.

---

# R13 — Compatibility Claims Outrun Implementation

## Severity

High

## Probability

Medium

## Description

Studio or its documentation claims compatibility with Yamcs, OpenC3, XTCE, CCSDS, PUS or other external standards/tools before support is real.

## Why It Matters

Weak compatibility claims damage credibility.

OrbitFabric must remain precise.

## Early Warning Signs

- Documentation says "compatible with" without tests.
- Mockups show external tool logos.
- Ground artifacts are described as operational.
- Decoder skeletons are presented as complete integrations.
- Export previews imply standard compliance.

## Mitigation

- Use terms such as experimental export or generated skeleton.
- Claim compatibility only when implemented, tested and documented.
- Track compatibility in Core/exporter metadata.
- Keep ground artifact viewer explicit about status.
- Avoid logos or integration claims in early UI.

## Owner

Documentation / Product / Core Integration

## Status

Active mitigation required before ground artifact milestone.

---

# R14 — Plugin Support Becomes Unsafe

## Severity

High

## Probability

Medium

## Description

Studio executes or trusts plugin code or plugin outputs without a security and provenance model.

## Why It Matters

Plugins can introduce security, trust and semantic risks.

## Early Warning Signs

- Studio loads arbitrary plugins directly.
- Plugin outputs look like Core outputs.
- Plugin diagnostics are indistinguishable from Core diagnostics.
- Plugin code executes without user awareness.
- No plugin compatibility metadata exists.
- No plugin provenance exists.

## Mitigation

- Do not create Studio plugin system before Core support.
- Consume Core-declared plugin metadata only.
- Distinguish plugin outputs from Core outputs.
- Require plugin provenance.
- Define security model before plugin execution.
- Avoid plugin marketplace concepts early.

## Owner

Architecture / Security

## Status

Deferred until Core plugin layer exists.

---

# R15 — Hidden Network or Cloud Behavior Damages Trust

## Severity

High

## Probability

Low to Medium

## Description

Studio introduces network calls, analytics, cloud sync, remote validation or hosted features without explicit design and user trust model.

## Why It Matters

Mission workspaces may contain sensitive engineering data.

Studio is expected to be local-first.

## Early Warning Signs

- App requires account login.
- App sends telemetry by default.
- Validation runs remotely.
- Projects are indexed remotely.
- Cloud sync appears before local workflow is mature.
- External services are required for basic use.

## Mitigation

- Keep Studio local-first.
- No hidden network calls.
- No analytics by default.
- No remote validation in early versions.
- Require explicit ADR for cloud/collaboration features.
- Document data handling clearly.

## Owner

Architecture / Security / Product

## Status

Active boundary from v0.0 onward.

---

# R16 — Stale Artifacts Are Presented as Current

## Severity

Medium

## Probability

Medium

## Description

Studio displays generated artifacts, validation reports or scenario evidence without indicating that they may be stale relative to source files.

## Why It Matters

Users may trust outdated outputs.

## Early Warning Signs

- Generated documentation appears current without freshness data.
- Reports are shown without timestamp or source relation.
- UI cannot tell if validation predates edits.
- Scenario evidence is shown after source changes with no warning.
- Runtime/ground exports lack generation metadata.

## Mitigation

- Track freshness where possible.
- Display timestamps and Core version where available.
- Use manifests.
- Warn when source files are newer than generated artifacts.
- Request Core artifact metadata where missing.
- Avoid false freshness claims.

## Owner

UX / Core Integration

## Status

Important for artifact and evidence milestones.

---

# R17 — Error States Are Collapsed Into Generic Failures

## Severity

Medium

## Probability

Medium

## Description

Studio presents different failures as generic "something went wrong" errors.

## Why It Matters

Engineering users need precise failure categories.

## Early Warning Signs

- Missing Core executable looks like invalid model.
- Failed validation looks like application crash.
- Unsupported Core version looks like missing workspace.
- Malformed Core output has no diagnostic detail.
- Generated artifact missing is not distinguishable from generation failure.

## Mitigation

- Define error categories explicitly.
- Preserve raw command output.
- Distinguish Core errors from Studio errors.
- Distinguish invalid model from failed command.
- Provide actionable next steps.
- Test error states deliberately.

## Owner

UX / Implementation

## Status

Active mitigation required before v0.1/v0.2.

---

# R18 — UI State Becomes Contract State

## Severity

High

## Probability

Medium

## Description

Cached UI state, graph layout or local settings begin to represent mission truth.

## Why It Matters

UI state must remain non-authoritative.

The Mission Model and Core outputs must remain authoritative.

## Early Warning Signs

- Graph layout stores semantic relationships.
- UI cache survives source changes and overrides current model.
- Local settings alter validation meaning.
- Recent selections drive generated outputs.
- UI-only nodes appear as contract entities.

## Mitigation

- Treat UI state as presentation-only.
- Invalidate caches on source/Core output changes.
- Never store mission semantics only in UI state.
- Label UI-only objects.
- Avoid hidden local project databases early.

## Owner

Architecture / Implementation

## Status

Active mitigation required after v0.1.

---

# R19 — Scope Creep Toward SaaS/Product Platform

## Severity

Medium

## Probability

Medium

## Description

Studio drifts toward account systems, cloud project hosting, collaboration, sharing, dashboards or platform features before the local workbench is mature.

## Why It Matters

This would distract from the core mission and increase complexity.

## Early Warning Signs

- Login appears in early mockups.
- Roadmap adds collaboration before local validation is stable.
- Cloud workspace becomes central.
- Hosted validation is discussed before local CLI integration.
- Product language replaces engineering language.

## Mitigation

- Keep local-first as foundational.
- Require ADR for cloud/collaboration.
- Complete core workbench loops first.
- Avoid SaaS language.
- Keep early roadmap narrow.

## Owner

Product / Architecture

## Status

Active mitigation required from v0.0 onward.

---

# R20 — v0.0 Is Treated as Empty Because It Has No App

## Severity

Medium

## Probability

Medium

## Description

A documentation-only v0.0 may be perceived as not a real release.

## Why It Matters

The Charter is foundational.

If perceived as empty, pressure may grow to add premature app scaffolding.

## Early Warning Signs

- "No code yet" is treated as a weakness.
- Boilerplate is added to make repo look active.
- UI scaffold appears before decisions are stable.
- README undersells the architecture-first purpose.
- Release notes fail to explain why v0.0 matters.

## Mitigation

- Present v0.0 as Studio Charter.
- Explain that it defines boundaries and architecture.
- Avoid empty repo appearance with strong documentation.
- Do not add fake implementation.
- Make exit criteria explicit.
- Tag v0.0.0 only when docs are coherent.

## Owner

Documentation / Product

## Status

Active during initial repo creation.

---

# R21 — The First Public Impression Is Weak

## Severity

Medium

## Probability

Medium

## Description

The repository is made public before it communicates a clear and disciplined purpose.

## Why It Matters

OrbitFabric Studio must look architecture-first, not improvised.

## Early Warning Signs

- Public repo has incomplete README.
- Roadmap is vague.
- Non-goals are missing.
- Relationship with Core is unclear.
- No release tag exists.
- GitHub description is generic.

## Mitigation

- Prepare locally first.
- Commit coherent v0.0 baseline.
- Use clear repository description.
- Tag v0.0.0.
- Publish only after review.
- Avoid broad launch communication until baseline is polished.

## Owner

Product / Repository Management

## Status

Active before GitHub publication.

---

# R22 — Technology Stack Is Chosen Too Early

## Severity

Medium

## Probability

Medium

## Description

The project commits to a frontend/desktop stack before validating integration with OrbitFabric Core.

## Why It Matters

A premature stack choice can create unnecessary maintenance burden.

## Early Warning Signs

- Tauri/React scaffold appears in v0.0.
- Dependencies are added before architecture review.
- UI library choices dominate discussions.
- Core invocation is not tested.
- Packaging is discussed before v0.1 needs.

## Mitigation

- Keep v0.0 documentation-only.
- Record stack as direction, not commitment.
- Confirm stack with ADR before v0.1 implementation.
- Prototype Core invocation before UI complexity.
- Avoid dependency lock-in too early.

## Owner

Architecture / Implementation

## Status

Mitigated in v0.0; revisit before v0.1.

---

# R23 — Security Is Added Too Late

## Severity

High

## Probability

Medium

## Description

Security, trust and data-handling considerations are postponed until after plugin, cloud or workspace features appear.

## Why It Matters

Mission data may be sensitive.

Studio may eventually execute commands, inspect generated code, or handle plugin outputs.

## Early Warning Signs

- Plugins are discussed without trust model.
- Cloud features appear without data policy.
- Generated code inspection ignores provenance.
- External commands are invoked without clear boundaries.
- Workspace paths or data are sent externally.

## Mitigation

- Keep local-first.
- Avoid hidden network calls.
- Treat plugin execution as future security-sensitive design.
- Preserve provenance.
- Require ADRs for external execution, plugins and cloud.
- Document forbidden data surfaces.

## Owner

Security / Architecture

## Status

Active boundary from v0.0 onward.

---

# R24 — Documentation and Roadmap Diverge

## Severity

Medium

## Probability

Medium

## Description

README, Charter, Roadmap, Non-goals, Architecture and UX documents drift apart over time.

## Why It Matters

Studio depends on clear boundaries.

Conflicting documents create confusion and weaken decisions.

## Early Warning Signs

- README says one thing, Roadmap another.
- Non-goals conflict with mockups.
- Architecture permits what Charter forbids.
- UX suggests mission control visuals.
- Changelog omits important boundary changes.

## Mitigation

- Review docs together at every milestone.
- Keep Charter authoritative.
- Update ADRs for major decisions.
- Keep roadmap non-goals aligned.
- Avoid duplicated wording where it creates contradictions.
- Add release checklist.

## Owner

Documentation / Product

## Status

Active mitigation required at every release.

---

# R25 — Studio Understates Its Own Strategic Value

## Severity

Medium

## Probability

Low to Medium

## Description

In trying to avoid overclaiming, Studio may be described too narrowly as a viewer or lint UI.

## Why It Matters

Studio has a legitimate strategic role as the human-facing workbench for Mission Data Contracts.

It should not be inflated, but it also should not be undersold.

## Early Warning Signs

- Messaging says "just a GUI".
- README describes only lint/docs viewing.
- Authoring direction disappears.
- Evidence and integration workbench concepts are hidden.
- The product thesis is absent.

## Mitigation

- Keep the product thesis visible:
  "Studio turns the Mission Data Contract into an inspectable engineering surface."
- State long-term authoring direction clearly.
- Preserve strict authority boundaries.
- Communicate scope without overclaiming.
- Keep vision and non-goals together.

## Owner

Product / Documentation

## Status

Mitigated by current vision; continue monitoring.

---

# Summary Table

| ID | Risk | Severity | Probability | Primary Mitigation |
|---|---|---:|---:|---|
| R1 | Studio becomes a second Core | Critical | Medium | Core-delegated validation |
| R2 | Adapter creates semantic drift | Critical | Medium | Adapter is presentation-only |
| R3 | Studio perceived as ground segment | High | Medium | Strict language and UX boundaries |
| R4 | Studio looks like mission control | High | Medium | Engineering workbench visual tone |
| R5 | Decorative dashboard drift | Medium | Medium | Evidence and provenance first |
| R6 | Studio seen only as post-processing viewer | Medium | Medium | Explicit authoring direction |
| R7 | Authoring introduced too early | High | Medium | Delay and gate authoring |
| R8 | Private Studio model emerges | Critical | Medium | Patch-based source model workflow |
| R9 | Generated artifacts treated as source | High | Medium | Label generated outputs clearly |
| R10 | Validation failures hidden | High | Medium | Preserve Core diagnostics |
| R11 | Missing Core outputs cause workarounds | High | High | Improve Core outputs |
| R12 | Core distorted for UI convenience | High | Medium | Separate semantic and presentation concerns |
| R13 | Compatibility claims outrun implementation | High | Medium | No weak compatibility claims |
| R14 | Plugin support becomes unsafe | High | Medium | Delay plugin execution; require metadata/security |
| R15 | Hidden network/cloud behavior | High | Low-Medium | Local-first, no hidden network calls |
| R16 | Stale artifacts shown as current | Medium | Medium | Freshness metadata and warnings |
| R17 | Generic error states | Medium | Medium | Explicit error taxonomy |
| R18 | UI state becomes contract state | High | Medium | UI state is presentation-only |
| R19 | Scope creep toward SaaS | Medium | Medium | Local-first roadmap discipline |
| R20 | v0.0 perceived as empty | Medium | Medium | Strong Charter release framing |
| R21 | Weak first public impression | Medium | Medium | Publish after coherent v0.0 |
| R22 | Stack chosen too early | Medium | Medium | ADR before implementation |
| R23 | Security added too late | High | Medium | Security boundaries from v0.0 |
| R24 | Documentation diverges | Medium | Medium | Charter-led review |
| R25 | Studio understates strategic value | Medium | Low-Medium | Strong but bounded thesis |

---

# v0.0 Risk Baseline Exit Criteria

The risk baseline is acceptable for v0.0 only if:

1. second-Core risk is explicitly identified;
2. semantic drift is explicitly identified;
3. ground-segment confusion is explicitly identified;
4. mission-control UI risk is explicitly identified;
5. premature authoring risk is explicitly identified;
6. private Studio model risk is explicitly identified;
7. generated artifact/source confusion is explicitly identified;
8. compatibility overclaim risk is explicitly identified;
9. local-first/security risk is explicitly identified;
10. documentation divergence risk is explicitly identified;
11. every critical/high risk has a mitigation strategy;
12. the risk register reinforces the Charter, Non-goals, Architecture and UX Principles.
