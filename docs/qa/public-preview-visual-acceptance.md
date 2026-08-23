# OrbitFabric Studio — Public Preview Visual Acceptance

**Purpose:** repeatable manual visual acceptance on the real Tauri/WebKit application before the first developer/source public preview.

This is deliberately not a mock-browser screenshot suite. The preview's primary visual gate is exercised against the real desktop shell, real Core hydration and real mission data.

## Viewport classes

The preview must be checked at three representative window widths:

| Class | Width | Product expectation |
| --- | ---: | --- |
| Wide | 1280 px | full workstation composition; primary surface and X-Ray coexist |
| Standard | 960 px | reduced horizontal room without semantic loss or accidental clipping |
| Compact | 640 px | intentional single-surface degradation; selected entity/X-Ray remains usable |

Height should be at least 720 px for Wide/Standard and at least 560 px for Compact. Vertical scrolling is acceptable where the surface owns it explicitly.

## Required surfaces

### 1. Overview / Mission Atlas

Use OrbitFabric Reference Mission, then repeat the topology sanity check on SpaceLab.

PASS when:

- mission identity is immediately visible;
- participant/territory content remains presence-driven;
- no card, label or engineering identifier is clipped without an intentional overflow treatment;
- no horizontal page scrollbar is introduced accidentally;
- Compact mode remains a usable mission overview rather than a scaled-down Wide layout;
- a no-payload mission does not leave an empty payload pillar or dead visual placeholder.

### 2. Explore + Entity X-Ray

Use an entity with substantial type-specific content and immediate relationships.

PASS when:

- Explorer remains useful for discovery at Wide and Standard widths;
- selected X-Ray retains its content while Explorer filters change;
- X-Ray owns its vertical scrolling when required;
- at Compact width the primary Explorer surface yields intentionally to the selected X-Ray rather than producing a squeezed two-column layout;
- long IDs, property names and source paths remain inspectable;
- closing X-Ray returns to the underlying exploration surface cleanly.

### 3. Relations / Context Map

Use a relationship-dense entity (Reference Mission FDIR or FINCH payload).

PASS when:

- map controls, node labels and `+` expansion controls remain operable;
- selection does not imply expansion;
- wheel zoom and background pan remain distinct from node click interaction;
- the current node and all directly connected edges are visibly emphasized;
- Context Path remains readable and does not overlap map controls;
- fit/reset behavior produces a readable local context;
- Compact mode keeps graph interaction usable without exposing WebView/browser chrome or accidental page scrolling.

## Required mission-shape checks

### Reference Mission

Primary visual baseline. Exercise Overview, Explore/X-Ray and Relations/Context Map.

### FINCH-inspired minislice

Density stress. Confirm that high-degree payload and duplicate textual IDs across domains remain visually distinguishable and navigable.

### SpaceLab-inspired communications minislice

No-payload acceptance. Confirm that Overview and Explore/Relations remain coherent without any payload-specific structural assumption.

### OreSat-inspired minislice

Heterogeneous/power-backlog smoke. Confirm that subsystem/context density does not produce a topology-specific regression.

### demo-3u

Minimal smoke. Confirm that the product does not depend on a large or richly populated mission to remain understandable.

## Interaction checks at every width

- Open Mission / Recent Mission still reachable.
- Refresh remains visible and does not destroy current valid content while loading.
- top navigation remains operable.
- no native WebView context menu is exposed by right-clicking the Studio surface.
- focus/selection styling remains distinguishable.
- no important action is available only by hover.
- scroll ownership is local and predictable.

## Evidence

For the release candidate, retain at least these screenshots in the release review notes or PR discussion:

1. Reference Mission Overview — Wide.
2. Reference Mission Explore + X-Ray — Standard.
3. Reference Mission Relations / Context Map — Wide.
4. Reference Mission selected X-Ray — Compact.
5. SpaceLab Overview — Wide or Standard.
6. FINCH dense Context Map — Wide.

The screenshots are release evidence, not product semantics and not runtime assets.

## Release rule

A visual issue is release-blocking when it prevents recognition, understanding, navigation or inspection of Core-owned facts at one of the supported viewport classes.

Pure cosmetic differences that do not reduce those capabilities may be deferred.
