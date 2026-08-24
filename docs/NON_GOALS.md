# OrbitFabric Studio — Non-goals

OrbitFabric Studio is intentionally narrow in authority even when it becomes broad in mission understanding.

These boundaries protect the product from becoming a second semantic system or an imitation of operational software.

## Not OrbitFabric Core

Studio does not own:

- Mission Model semantics;
- schema interpretation;
- semantic validation or lint rules;
- engineering relationship semantics;
- scenario semantics;
- generated/exported contract semantics;
- mission health, readiness, completeness or coverage definitions.

Core decides engineering meaning. Studio presents and helps humans explore it.

## Not a private semantic recovery layer

Studio must not infer authoritative facts from:

- filenames or directory shape;
- YAML field-name guesses;
- textual preconditions;
- telemetry limits;
- naming similarity;
- entity co-occurrence;
- graph proximity;
- UI layout.

If a semantic relationship is missing from Core, Studio shows it as unavailable or Core is improved.

## Not a generic contract GUI

The product is not organized around reports, validators, generated files or Core commands as independent tools.

Those are support mechanisms and provenance. The primary object is the mission.

Studio should not regress into a shell of Contract Explorer, Report Runner, Generated Artifact Explorer and other disconnected utilities.

## Not a dashboard/KPI product

Studio must not manufacture dashboard metrics merely because counts are easy to display.

It must not derive private:

- health scores;
- readiness scores;
- completeness scores;
- quality grades;
- coverage percentages.

Counts are acceptable when they help orient the user to mission content. They are not mission status unless Core explicitly defines that meaning.

## Not a generic file browser or YAML IDE

Raw files remain reachable for provenance and engineering review, but Studio is not a replacement for VS Code, Vim, JetBrains tools or generic YAML tooling.

The user should encounter mission concepts before filesystem structure.

## Not a generic graph editor

The Context Map is a local relationship-exploration surface, not a freeform canvas.

Studio does not provide:

- arbitrary engineering edges;
- drag-to-create relationships;
- layout-as-semantics;
- a whole-mission graph dump as the primary UX;
- a visual model format separate from OrbitFabric.

Every engineering edge displayed as truth must be explainable by Core/source semantics.

## Not Mission Model authoring in the current roadmap

The current product and public-preview roadmap are read-only with respect to mission source.

Mission Model editing, visual authoring and automated patch generation are not implied future milestones. If authoring is ever proposed, it requires a separate product/architecture decision and cannot bypass Core authority.

## Not mission control

Studio does not provide or imply:

- live spacecraft telemetry;
- command uplink;
- operator authority;
- live pass execution;
- onboard state synchronization;
- operational alarms;
- real-time ground-station connectivity.

Engineering visuals must never masquerade as live operations.

## Not flight software

Studio is not an OBC framework, scheduler, mode manager, fault manager, autonomy engine, command dispatcher, storage manager or payload controller.

It may explain declared mission behavior. It does not execute onboard behavior.

## Not a spacecraft simulator

Studio does not simulate orbital mechanics, ADCS, thermal behavior, power physics, RF/link performance, payload physics or real onboard timing.

Future scenario/replay views represent deterministic contract evidence, not physical simulation.

## Not a ground segment

Studio is not a telemetry archive, mission database runtime, ground-station controller, command service or replacement for Yamcs/OpenC3.

Ground-facing artifacts may later be explained as part of provenance/lifecycle, but Studio does not become the operational consumer of those artifacts.

## Not a cloud platform for the preview

The first product is local-first. It does not require:

- accounts;
- cloud workspaces;
- remote validation;
- hidden uploads;
- project synchronization;
- collaboration servers.

Any remote capability requires an explicit trust and security decision.

## Not a binary-distribution promise yet

The first public target is a developer/source preview. Core sidecar strategy, desktop bundling, signing and notarization are later distribution decisions.

## Not browser/WebView chrome

The desktop application should not expose browser context menus, reload/navigation affordances or developer-tool behavior as product UI.

## Boundary test

For every proposed feature, ask:

```text
Does this help a person understand the mission?
```

If not, it likely does not belong in Studio.

Then ask:

```text
Does it require Studio to invent engineering meaning?
```

If yes, it does not belong in Studio unless Core first exposes that meaning explicitly.

Finally ask:

```text
Is the feature explaining declared data, relationships, behavior/evidence or provenance?
```

If none applies, the feature is probably outside the product thesis.
