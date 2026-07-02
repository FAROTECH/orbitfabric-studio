# E26 — Studio Icon System Audit

## Purpose

E26 is an audit and planning gate for Studio iconography.

It does not change runtime UI, routing, layout, Core execution, scenario execution, artifact hydration, status bar behavior or private inference rules.

## Why this exists

Studio currently has a partial centralized SVG icon component plus several local glyph/icon usages across surfaces, cards, status controls and CSS. Before replacing icons, the system needs an explicit inventory and a semantic target registry.

## Deliverables

E26 adds:

- `tools/dev/audit-studio-icons.mjs`
- `npm run qa:icon-audit`
- `docs/qa/e26-studio-icon-inventory.generated.md`

The generated inventory catalogs:

- existing centralized `DashboardIcon` SVG paths;
- inline `aria-hidden` glyphs;
- CSS `content` glyphs;
- class names and selectors containing `icon`;
- raw glyph candidates;
- proposed semantic icon tokens for the E27 implementation pass.

## Audit conclusions

The implementation pass should introduce a single icon registry/component, tentatively named `StudioIcon`, and migrate UI iconography through semantic tokens rather than one-off glyphs.

Initial semantic tokens proposed for E27:

| Token | Meaning |
| --- | --- |
| `mission` | Mission overview / cockpit identity |
| `core` | Core Report Runner / fixed Core commands |
| `data-flow` | Relationships / route / traceability |
| `data-products` | Data Products / model inventory |
| `scenarios` | Scenario Evidence / timelines |
| `artifacts` | Generated Artifacts / outputs |
| `status-readonly` | Read-only/Core-owned boundary |
| `status-core` | Latest Core state |
| `capture` | Surface capture utility |
| `open-detail` | Open/detail/drill-down |
| `close/back` | Close/back/collapse |

## Acceptance criteria

E26 is acceptable when:

- the audit command runs locally;
- the generated inventory is committed;
- no runtime component behavior changes;
- E27 has enough information to implement the final icon registry without guessing.
