# E27 — Studio Icon System Implementation

## Purpose

E27 introduces the Studio icon registry and starts migrating reusable UI iconography away from one-off glyphs.

## Scope

Implemented in this pass:

- `StudioIcon` centralized component;
- `studioIcons.css` shared icon geometry/stroke contract;
- `DashboardIcon` compatibility bridge backed by `StudioIcon`;
- shell command utilities migrated to registry icons;
- sidebar collapse chevrons migrated to registry icons;
- status bar read-only/Core glyphs migrated to registry icons;
- Capture control given a registry icon;
- Data Products selected/route icons migrated to registry icons;
- Generated Artifacts family/action icons migrated to registry icons.
- Scenarios sidebar position is explicitly locked against route-specific scroll hardening drift.
- Scenario Evidence no longer mutates the shell sidebar with route-local inline styles.
- Scenario Evidence scroll hardening is confined to the main surface and no longer mutates shell/workbench/sidebar geometry.
- Scenarios expanded sidebar keeps the same optical inset and visible width as the other public-preview surfaces.
- Data Flow selected path exposes a direct `Open focus mode` action using the icon registry.

## Deliberate non-goals

- No runtime behavior changes.
- No route/layout changes.
- No Core execution changes.
- No scenario execution changes.
- No artifact hydration changes.
- No private inference changes.
- No redesign of icon colors beyond using existing semantic CSS color inheritance.

Some textual arrows remain valid where they are part of data text, for example mode transitions or route labels generated from Core content.

## Acceptance criteria

E27 is acceptable when:

- `npm run build` passes;
- `npm run qa:icon-audit` runs and regenerates the inventory;
- sidebar icons remain visually stable;
- status bar keeps the E25 contract;
- Data Products and Generated Artifacts no longer rely on local decorative glyphs for primary UI iconography;
- E28 can close the visual baseline without another icon audit pass.
- Scenarios final parity lock aligns visible sidebar width, sidebar inset, collapse position and status-bar row with the other public-preview routes.
- Scenarios bottom parity lock matches workbench height, status-bar row and expanded collapse-control size with the other public-preview routes.
- Scenarios workbench height parity aligns the status row with Generated Artifacts after screenshot comparison.
