# OrbitFabric Studio — Current Risk Register

This register tracks risks relevant to the rebooted Studio public preview. Historical E60 planning/audit risks are preserved by Git history and do not define the current product.

| Risk | Impact | Current mitigation / status |
|---|---|---|
| Core/Studio surface drift | Studio may fail to load or mis-hydrate after Core changes | Preview pins a known Core integration baseline in CI; protocol shape is validated; unsupported/malformed output fails explicitly |
| Studio invents semantics | Loss of engineering trust | Core remains semantic authority; no YAML/filesystem heuristic recovery; relationship endpoints validated against Entity Index; missing meaning is unavailable, not inferred |
| Core process hangs | Frozen desktop / leaked child | Bounded process timeouts, termination and reap; automated Rust coverage |
| Temporary hydration residue | Workspace pollution or temp leakage | Outputs written to Studio-owned OS temp; cleanup tested including primary-open failure paths |
| Stale async refresh overwrites current session | Wrong mission facts shown after refresh/open race | Generation-scoped transactional hydration; stale responses ignored |
| Textual ID collision across domains | Wrong entity selected or related | Universal `{domain,id}` identity; FINCH acceptance explicitly exercises duplicate textual IDs |
| Dense or cyclic graph becomes unreadable | Context/Operational maps lose their purpose on real missions | Local progressive context; ELK-owned orthogonal routes rendered without reinterpretation by React Flow; geometric no-node-crossing tests; dense OreSat/FINCH acceptance; grouping/collapse remains an option if future missions require it |
| Responsive layout regression | Public preview unusable on narrower desktop windows | Explicit Wide/Standard/Compact visual acceptance at 1280/960/640 on real Tauri app |
| WebView/browser chrome leaks into product | Accidental reload/navigation/devtools and broken desktop mental model | Global context-menu suppression; browser controls are not product UI |
| Tauri/WebKit security regression | Desktop attack surface | Hardened Tauri 2.x baseline; production CSP + localhost-only dev CSP; minimal window capability; production-path Tauri build in CI |
| Dependency vulnerability reintroduced | Security/release risk | Full `npm audit --audit-level=low` is a blocking CI gate; no blind `audit fix --force` policy |
| Linux host differences | README works only on developer machine | Debian 12 primary acceptance, Ubuntu 22.04 CI, documented Node/Rust/Python/system prerequisites; one clean-clone README-only run still required |
| Documentation drifts back to E60/product-plumbing framing | Contributors implement the wrong product | Current-facing docs rewritten mission-first; historical cockpit/workbench docs and obsolete QA tooling removed from active tree |
| Release naming/version ambiguity | Public preview appears older/newer than its actual architecture | Final preview version/release naming remains a mandatory release gate |
| Binary distribution expectations | Users expect installers/signing/Core bundling prematurely | First release explicitly developer/source only; bundling, sidecar strategy, signing and notarization deferred |

## Release-critical open risks

Before publishing the source preview, the following must close:

1. one README-only clean-clone installation;
2. manual SpaceLab no-payload acceptance;
3. preview version/release naming;
4. green CI on the final release candidate.

## Risk rule

A new risk belongs here only if it can materially affect correctness, trust, usability, security or reproducibility of the current product. Historical implementation milestones are not current risks.
