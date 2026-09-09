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
