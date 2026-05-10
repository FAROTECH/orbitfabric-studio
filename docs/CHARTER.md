# OrbitFabric Studio — Project Charter

## Purpose

OrbitFabric Studio exists to make OrbitFabric Mission Data Contracts easier to inspect, validate, navigate and understand through a visual workbench.

Studio is not the source of truth.

The OrbitFabric Mission Model is the source of truth.

## Core Statement

OrbitFabric Studio is not where mission semantics are created.
It is where mission semantics become inspectable.

## Problem Statement

As OrbitFabric evolves, the Mission Data Contract spans multiple domains:

- spacecraft
- subsystems
- telemetry
- commands
- events
- faults
- payloads
- data products
- storage intent
- downlink intent
- contact windows
- commandability
- autonomy
- scenario evidence
- runtime-facing bindings
- ground-facing artifacts
- future plugins and extensions

These relationships are validatable and generatable by OrbitFabric Core, but they are not always cognitively easy to inspect as a set of text files, command-line outputs, JSON reports and generated documentation.

Studio exists to expose those relationships as an inspectable engineering surface.

## Product Thesis

OrbitFabric Studio turns the Mission Data Contract into an inspectable engineering surface.

It does not replace the Mission Model.
It does not replace OrbitFabric Core.
It does not create independent semantics.

## Scope

Studio may eventually support:

- opening an OrbitFabric mission workspace
- inspecting mission model files
- invoking OrbitFabric validation
- displaying validation results
- visualizing relationships among contract entities
- inspecting generated documentation
- inspecting generated runtime-facing bindings
- inspecting generated ground-facing artifacts
- inspecting deterministic scenario evidence
- supporting controlled editing only after read/inspect/validate workflows are stable

## Authority Model

The Mission Model remains authoritative.

OrbitFabric Core remains authoritative for:

- model loading
- validation
- semantic linting
- scenario evidence
- generated documentation
- generated runtime-facing bindings
- generated ground-facing artifacts
- future plugin semantics

Studio may display, organize, navigate and explain those outputs.

Studio must not invent hidden validation rules, private semantic interpretations or alternative model behavior.

## Dependency Direction

OrbitFabric Studio may depend on OrbitFabric Core.

OrbitFabric Core must not depend on OrbitFabric Studio.

## Required Discipline

Studio must remain downstream of the Mission Data Contract.

When Studio requires a machine-readable output that OrbitFabric Core does not yet expose, the preferred solution is to improve OrbitFabric Core outputs, not to duplicate core logic inside Studio.

## Release Philosophy

Studio grows through narrow, inspectable, validation-aligned vertical slices.

Each release must have:

- a clear engineering purpose
- explicit non-goals
- clear dependency on OrbitFabric Core surfaces
- no hidden semantic drift
- no broad product claim ahead of implemented capability

## v0.0 Exit Criteria

The v0.0 charter is complete only when:

1. the repository clearly explains why Studio exists;
2. the repository clearly explains what Studio is not;
3. the relationship with OrbitFabric Core is unambiguous;
4. the Mission Model is explicitly declared as source of truth;
5. Studio is defined as downstream, not authoritative;
6. validation is delegated to OrbitFabric Core;
7. initial UX principles are documented;
8. initial architectural boundaries are documented;
9. project risks are documented;
10. the next milestone is narrow and executable.
