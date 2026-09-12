# Scenario browser acceptance

Generate fresh reports from the pinned Core and Reference Mission:

```sh
python tools/test/scenario-browser/prepare.py /path/to/orbitfabric-reference-mission --core /path/to/orbitfabric
npm run dev
```

Open `/tools/test/scenario-browser/index.html` on the development server. The test entry loads the real App and styles. Open Mission selects the supplied R1 mission; Choose Scenario selects its stop-acquisition Scenario. These explicit fixture selections replace the native file chooser only in this test entry.

The Tauri test API substitutes IPC responses with freshly exported, retained Core reports in ignored `.sp2-acceptance/reports.json`. `TauriCoreGateway`, protocol parsing, both hydrators, the central reducer, understanding/presentation models and React UI remain the actual product implementation. No adapter is instantiated.

This is browser interaction and presentation evidence, not a native IPC or live subprocess proof. The separate pinned R1 acceptance gate must exercise the native Scenario command and consume its actual report before SP2-G closes.

Inspect empty selection, eight-atom accounting, initial state, action, expected false/READY/PASSED, exact digest, entity navigation, refresh, and mission-generation reset. Check that no display implies runtime timing or a run verdict. The production entrypoint does not import this harness.

Open the same test entry with `?scenario=failed` to inspect a real Core declaration failure. The preparation script exports this negative fixture from a temporary copy containing a nonexistent command. The canonical Reference Mission stays unchanged.

Open with `?evidence=r1` to exercise the product Evidence workspace against the exact changed COSMOS R1 Result, its Result-owned accounting artifact and a curator-authored Evidence Set. Select the Scenario first, then load the Result and Evidence Set. The fixture preserves the exact generated Result and sidecar bytes; the mock returns bounded native-reader observations computed from those bytes.

### SP3-G Evidence acceptance matrix

Every matrix route loads the real product entrypoint, models, hydrators, reducers and Evidence UI. Variants exist only in `retained-preview.ts`. Retained fixtures are never mutated; changed bytes are constructed in memory and receive recalculated Result, artifact, content and curator-subject identities. The banner identifies each case as `RETAINED BYTES` or `SYNTHETIC IN-MEMORY`.

Use `/tools/test/scenario-browser/?evidence=r1&case=<case>` and always open the Mission, choose the Scenario, then follow the case-specific actions:

| Case | Actions | Required visible result | Forbidden interpretation |
| --- | --- | --- | --- |
| `multiple-paths` | Load the Result; select atom `atom-0006`. | Only `mapping.op-0002`; two exact downstream target paths. | No extra mapping, equivalence, timing, execution or causality. |
| `stale-subject` | Load the Result and Evidence Set; expand the accounting Evidence record and all curator subjects. | Existing exact subjects remain `current`; same Scenario id with different SHA is independently `stale`. | Stale is not FAIL and co-membership creates no edge. |
| `unresolved-subject` | Load the Result and Evidence Set; expand the accounting Evidence record and all curator subjects. | Existing subjects remain `current`; the unloaded exact Result identity is independently `unresolved`. | Unresolved is not stale, missing content or FAIL. |
| `missing-content` | Load the Result and Evidence Set; expand both retained records. | Manifest and two records remain; one reference is `missing`, the other `verified`; accounting remains available. | No manifest failure, subject failure or producer verdict. |
| `digest-mismatch` | Load the Result and Evidence Set; expand both retained records. | Manifest and two records remain; one reference is `digest_mismatch`, the other `verified`; accounting remains available. | Integrity does not change curator meaning or producer content. |
| `unsupported-accounting` | Load the Result; inspect an atom and the independent Result identity. | Result stays loaded with its exact synthetic SHA and operation result; accounting is `unsupported`. | No version shape fallback, disposition, mapping or execution inference. |
| `ambiguous-accounting` | Load the Result; inspect an atom and the independent Result identity. | Result stays loaded; accounting is localized `failure` with the explicit ambiguous-selection reason. | Neither accounting artifact is selected or interpreted. |
| `dual-results` | Load the Result twice, then load the Evidence Set. | Exact COSMOS and F Prime Result identities remain separate. COSMOS has accounting; every F Prime atom disposition is unavailable. | No Scenario-to-F-Prime atom binding, mapping equivalence, shared execution, causality or curator correlation. |
| `observed-pass` | Load the Result; expand its Result identity and producer statements; inspect atom `atom-0008` declaration. | The retained F Prime producer records visibly retain their existing `status: "passed"`; expected `PASSED` remains `DECLARED`; atom disposition is unavailable. | Studio does not normalize or invent an OBSERVED verdict. |
| `late-completion` | Use the acceptance-only controls as described below. | Released stale completions never replace the current Result or replacement Mission generation. | Completion order is not execution order, runtime timing or causality. |

The F Prime Result is the existing exact fixture with SHA-256 `9e348163162a279eb8e0df3a466b55f2d53a613170782596f4d20cb0b8c08ae9`. It has no Scenario operation input. The browser fixture supplies bounded positive artifact-check observations so the exact retained Result can traverse the normal hydrator; those gateway observations are not producer content and do not establish Scenario correlation or native-runtime acceptance.

The `observed-pass` case does not invent an Evidence shape. It exposes the retained F Prime Result's existing producer-owned evidence records with fields `id`, `kind`, `producer`, `sha256` and `status: "passed"`. Studio displays those bytes under “Producer-owned evidence statements” without converting expected Scenario `PASSED` into an observation.

For `late-completion`, reload the route before each subcase:

1. Open the Mission, choose the Scenario and enter Evidence. Select **Start request-token probe**. The harness starts two same-generation Result selections, holding the old preview. Wait until the Result containing `acceptance-current-request` is visible, select **Release old completion**, and confirm the exact current Result and marker remain unchanged.
2. Reload and prepare the same view. Select **Start generation probe**, wait for the old preview to be held, then use the product **Open Mission** action. After the replacement Mission is visible, select **Release old completion** and confirm no old Result, Evidence state, failure or busy state appears.

The delay/release buttons are acceptance-harness controls inserted by the browser entrypoint. For the request-token probe only, the harness re-enables the busy Result button long enough to invoke the real handler for the superseding request; the product code and reducer are unchanged. These controls are not imported by the production entrypoint and grant no runtime or adapter authority.

For a static browser build:

```sh
npx vite build --config tools/test/scenario-browser/vite.config.ts
python -m http.server 1420 --bind 127.0.0.1 --directory .sp3-browser-dist
```

## SP3 acceptance-only GitHub Pages preview

Pull request #348 may publish this harness through the dedicated `SP3 acceptance preview` workflow. The workflow is restricted to `feature/sp3-evidence-replay`, builds the exact branch head and verifies the checked-out SHA before running the normal logic, TypeScript and minified production-build gates. The build job has read-only repository permission. A separate deployment job receives only the static Pages artifact and cannot execute candidate application code.

The deployed R1 route is:

```text
https://farotech.github.io/orbitfabric-studio/tools/test/scenario-browser/?evidence=r1
```

The page displays the complete source commit SHA together with the repository and pull-request identity. The same values are retained in `/orbitfabric-studio/source-commit.json`. This preview is an acceptance facility only: it grants no product runtime authority, executes no adapter and is not part of the production entrypoint.
