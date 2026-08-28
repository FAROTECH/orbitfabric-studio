# Security Policy

## Supported scope

OrbitFabric Studio is a local-first desktop engineering workbench. Security-sensitive fixes are considered for the current public `main` branch and, where applicable, the latest published public preview.

Studio is not flight software, a ground segment, an authentication or authorization service, a command uplink system or an operational spacecraft control system.

## Reporting a vulnerability

Do not report suspected security vulnerabilities through public issues, discussions or pull requests.

Use GitHub private vulnerability reporting when available, or contact the maintainers through a private channel.

A useful report should identify:

- the affected Studio version or commit;
- the affected operating system and runtime context;
- the affected component, process boundary or workflow;
- the observed behavior and security impact;
- reproducible steps using synthetic or otherwise safe data;
- any known mitigation.

Do not include proprietary mission data, private spacecraft information, operational logs, credentials, tokens, export-controlled material, NDA-protected details or other confidential information in a vulnerability report.

## Relevant security areas

Relevant reports may include issues involving:

- Tauri capabilities, IPC or WebView isolation;
- Content Security Policy or unintended remote-content access;
- execution of the configured OrbitFabric Core process;
- process timeout, termination or child-process cleanup;
- path handling and native directory selection;
- Studio-owned temporary-file creation or cleanup;
- unintended writes into a mission workspace;
- local preference persistence that exposes sensitive paths unexpectedly;
- capture/export behavior that writes outside the mission workspace;
- dependency or supply-chain handling in npm, Cargo or CI;
- external Integration Package / adapter execution boundaries;
- Integration Plugin API gate bypasses or unintended access beyond the documented public context;
- artifact reveal/navigation actions escaping their documented Integration Result constraints;
- accidental remote upload, analytics or network transmission of mission data;
- accidental exposure of sensitive information in logs, screenshots, captures, CI artifacts or repository history.

## Integration boundary

Integration Packages and Studio Integration Plugins have different security boundaries.

The Integration Package or adapter owns target-specific projection and generation behavior. Studio owns the bounded execution and result-consumption boundary it explicitly exposes.

The current Integration Plugin API is intentionally constrained. It does not grant arbitrary filesystem access, process or shell execution, Tauri invoke passthrough, raw Mission Model access, artifact-content access, reducer access or local-storage access.

A report showing that a plugin contribution can bypass a Studio-owned gate or obtain capabilities outside the documented API is security-relevant to Studio.

A vulnerability entirely inside an external adapter, generated target runtime or target ecosystem should normally be reported to the project that owns that component.

## Core boundary

OrbitFabric Core owns Mission Data Contract semantics. Vulnerabilities in Core parsing, validation, generation or simulation should normally be reported against OrbitFabric Core unless the issue is caused by Studio's process, protocol or trust handling.

## Sensitive local outputs

Studio is local-first, but local outputs can still contain sensitive information. Mission paths, screenshots, captures, logs and integration artifacts may reveal mission content even when no network service is involved.

Security reporting does not relax the clean-room requirement: do not use a vulnerability report as a channel for sharing material that you are not authorized to disclose.
