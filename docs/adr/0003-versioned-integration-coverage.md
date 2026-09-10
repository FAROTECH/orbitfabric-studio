# ADR 0003: Versioned Integration Result Coverage

Status: Accepted  
Date: 2026-09-10

## Context

Integration Result `0.1-candidate` defines typed generic coverage and its
summary invariants. Result `0.2-candidate` defines coverage as producer-owned
structured content. Studio previously sent both versions through the v0
decoder. This rejected the real F Prime Result and an official Core v1 fixture.

## Decision

Select coverage handling only from `result_version`.

- v0 retains the existing typed generic decoder and validation.
- v1 retains the producer-owned JSON object and its exact source lexeme.
- v1 generic interpretation is explicitly unavailable.
- unknown versions fail before coverage interpretation.

Studio does not infer a version from shape, adapter identity, producer fields
or `semantic_disposition`.

## Consequences

The original F Prime Result remains byte-identical and becomes consumable.
The official Core v1 zero-input fixture is consumable. V1 producer content is
shown separately from v0 generic coverage totals. Existing Result identity,
artifact integrity, context and generation gates remain active.

