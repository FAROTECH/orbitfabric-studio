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

For a static browser build:

```sh
npx vite build --config tools/test/scenario-browser/vite.config.ts
python -m http.server 1420 --bind 127.0.0.1 --directory .sp3-browser-dist
```

## SP3 acceptance-only GitHub Pages preview

Pull request #348 may publish this harness through the dedicated `SP3 acceptance preview` workflow. The workflow is restricted to `feature/sp3-evidence-replay`, builds the exact pull-request head and verifies the checked-out SHA before running the normal logic, TypeScript and minified production-build gates. The build job has read-only repository permission. A separate deployment job receives only the static Pages artifact and cannot execute candidate application code.

The deployed R1 route is:

```text
https://farotech.github.io/orbitfabric-studio/tools/test/scenario-browser/?evidence=r1
```

The page displays the complete source commit SHA together with the repository and pull-request identity. The same values are retained in `/orbitfabric-studio/source-commit.json`. This preview is an acceptance facility only: it grants no product runtime authority, executes no adapter and is not part of the production entrypoint.
