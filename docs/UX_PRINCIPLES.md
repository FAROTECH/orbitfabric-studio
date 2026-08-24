# OrbitFabric Studio — UX Principles

## 1. Mission first

Studio begins from the mission, not from files, reports or application plumbing.

The primary UX rule is:

> **Show the mission first. Then show why that representation is reliable.**

The preferred cognitive order is:

```text
MISSION / DATA
      -> RELATIONSHIPS / INTENT
      -> BEHAVIOR / EVIDENCE
      -> PROVENANCE / RAW FILES
```

## 2. Every surface answers a human question

A screen must answer a concrete engineering question.

Examples:

- What is in this mission?
- Where is the entity I care about?
- What does this entity mean in context?
- What is it connected to?
- How did I get here in my investigation?
- What can happen from this mode/state?
- How does this data product move through the mission?
- What was declared versus what was exercised?
- Where did this fact come from?

A screen that exists only because a Core command or JSON report exists is not automatically a product surface.

## 3. One mission, complementary lenses

Studio should maintain one global mental model and one semantic selection across lenses.

The principal long-term lenses are:

- System;
- Operations;
- Mission Data;
- Data Lifecycle;
- Scenarios & Evidence.

Relationships connect the lenses. Switching lenses should not feel like switching applications.

## 4. Progressive disclosure

The user should move naturally from orientation to detail:

```text
mission overview
      -> entity discovery
      -> entity X-Ray
      -> immediate relationships
      -> local context
      -> provenance/raw evidence
```

Do not show every engineering detail at once. Do not hide Core-reported problems merely to keep the overview clean.

## 5. Global selection

Selecting an entity establishes the current semantic subject for Studio. Atlas, Explore, X-Ray and Relations should agree on that subject wherever the lens can represent it.

Filtering a list must not silently discard a valid current selection merely because the selected item is no longer visible in the filtered list.

## 6. Context Path is the user's investigation

The Context Path represents the route the user actually followed through explicit Core-owned relationships.

It is not a shortest-path algorithm and not a causal claim.

Following a direct relationship extends the path. Returning to an earlier path entity truncates back to that point.

## 7. Selection is not expansion

In the Context Map:

- selecting a node changes the current subject;
- explicit `+`/expand actions add relationship context;
- background interaction pans/zooms the board.

These actions must remain distinct so exploration is predictable.

## 8. Local context beats the global hairball

The Context Map is an investigation surface around the current subject, progressively expanded by the user.

Do not default to rendering the entire mission relationship graph. High-degree entities may require grouping/collapse by relationship family, but grouping must never fabricate semantics.

## 9. Visuals explain engineering structure

Use a visual structure when geometry materially improves understanding.

Examples:

- Mission Atlas for system orientation;
- Operational State Map for modes/transitions;
- Context Map for relationship investigation;
- Data Product Journey for lifecycle/flow.

A visual must make its nodes/edges and provenance explainable. Decorative connectivity is not acceptable.

## 10. Evidence over dashboard theater

Counts may orient the user to mission content. They must not turn into unsupported KPIs, health cards or readiness scoring.

Studio is an engineering workstation, not a status wall.

## 11. Declared is not observed

Future scenario/replay/evidence UX must preserve:

```text
DECLARED != OBSERVED
```

Examples:

- a declared transition is not an observed transition;
- downlink eligibility is not actual downlink;
- an expectation is not evidence of success;
- a recovery relationship does not prove recovery occurred.

Wording and visual grammar must keep those states distinct.

## 12. Provenance is reachable, not dominant

Every meaningful engineering fact should be traceable to source/Core evidence where the surface provides provenance.

But source paths, raw JSON and command details are supporting evidence. They should not displace the mission itself from the top of the experience.

## 13. Error states remain engineering-readable

Differentiate at least:

- Core executable missing/unconfigured;
- Core process failure/timeout;
- malformed or unsupported structured output;
- mission structural load failure;
- successfully loaded mission with lint findings;
- internal Studio failure.

`loadable != lint-clean`.

A Core-reported warning is not a Studio crash.

## 14. Responsive, same meaning

The first preview must remain usable at representative widths:

```text
Wide      1280 px
Standard   960 px
Compact    640 px
```

Layout may stack or collapse. Semantic content and available investigation actions must remain coherent.

## 15. Desktop means desktop

Studio should suppress browser/WebView chrome that breaks the product illusion or can reset state unexpectedly. No browser back/forward/reload/inspect menu should be exposed as normal product interaction.

## 16. Local-first trust

The preview assumes local mission workspaces and a local Core runtime. No hidden network dependency, upload or account should be required to understand a mission.

## 17. Serious visual tone

Prefer:

- restrained dark engineering UI;
- clear hierarchy;
- readable density;
- subtle semantic tones;
- explicit current subject;
- stable interactions.

Avoid:

- fake telemetry lights;
- neon mission-control aesthetics;
- excessive animation;
- promotional dashboard language;
- decorative space imagery that competes with engineering content.

## 18. Current first-preview journey

The product acceptance baseline is:

```text
Open Mission
  -> Mission Atlas
  -> Entity Explorer
  -> Entity X-Ray
  -> explicit relationship traversal
  -> Relationship Explorer
  -> Context Path
  -> Context Map
```

New features must not be added before the public-preview release gate closes.
