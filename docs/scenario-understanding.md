# Scenario Understanding

Open a mission, select **Scenarios**, then **Choose Scenario** and select a local Scenario YAML file associated with that mission. Studio asks Core to export the structured declaration. No adapter is required.

The workspace shows the Scenario purpose, mission binding, initial-state declarations, actions, expectations, and every normalized atom. Entity links open the existing Entity X-Ray using Core's domain-qualified references.

The list preserves Core declaration order. Source steps retain authored order, while atoms inside a step follow Core normalization order. A displayed time is the declared Scenario time in seconds, not a measurement, execution duration or downstream schedule.

An expected status such as `PASSED` is a declared expectation. This workspace does not execute the Scenario or assign a verdict.

Expand **Exact identity, source and Core boundaries** to inspect the full Scenario id and source SHA-256. An atom is identified by that SHA-256 plus its atom id. The selected path is only a locator.

**Refresh Scenario** reads the same source again. The previously accepted declaration remains visible during refresh and after a hydration failure, with an explicit notice. Choosing a file replaces the current selection. A successful mission refresh or replacement clears the Scenario observation.

Core declaration failure exposes structured diagnostics with no partial Scenario. Transport, protocol and mission consistency failures remain distinct. Missing description, unresolved entities and unavailable information are explicit.

Automatic discovery, projection coverage, generated artifacts, execution results and observations are unavailable in this workspace. Scenario editing and execution are outside its scope.
