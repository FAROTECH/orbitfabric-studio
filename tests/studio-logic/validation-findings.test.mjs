import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { entityKey } = require("../../.test-dist/mission/entityRef.js");
const {
  filterValidationFindings,
  resolveFindingEntityRef,
  validationSeverityCount,
} = require("../../.test-dist/features/validation/validationModel.js");

function finding(overrides = {}) {
  return {
    severity: "warning",
    code: "OF-TEST-001",
    file: "mission.yaml",
    domain: null,
    object_id: null,
    message: "Test finding",
    suggestion: null,
    ...overrides,
  };
}

test("finding links only to the exact Core-indexed EntityRef", () => {
  const payload = { domain: "payloads", id: "hyperspectral_payload" };
  const subsystem = { domain: "subsystems", id: "hyperspectral_payload" };
  const readModel = {
    entityRecordsByKey: new Map([
      [entityKey(payload), payload],
      [entityKey(subsystem), subsystem],
    ]),
  };

  assert.deepEqual(
    resolveFindingEntityRef(
      finding({ domain: "payloads", object_id: "hyperspectral_payload" }),
      readModel,
    ),
    payload,
  );

  assert.deepEqual(
    resolveFindingEntityRef(
      finding({ domain: "subsystems", object_id: "hyperspectral_payload" }),
      readModel,
    ),
    subsystem,
  );

  assert.equal(
    resolveFindingEntityRef(
      finding({ domain: "telemetry", object_id: "hyperspectral_payload" }),
      readModel,
    ),
    null,
  );
});

test("finding without a complete EntityRef never creates an inspect target", () => {
  const readModel = { entityRecordsByKey: new Map() };

  assert.equal(resolveFindingEntityRef(finding({ domain: "commands" }), readModel), null);
  assert.equal(resolveFindingEntityRef(finding({ object_id: "reset" }), readModel), null);
});

test("severity filters expose Core findings without changing their order", () => {
  const findings = [
    finding({ severity: "WARNING", code: "W-1" }),
    finding({ severity: "error", code: "E-1" }),
    finding({ severity: "info", code: "I-1" }),
    finding({ severity: "custom", code: "C-1" }),
  ];

  assert.deepEqual(
    filterValidationFindings(findings, "warning").map((item) => item.code),
    ["W-1"],
  );
  assert.deepEqual(
    filterValidationFindings(findings, "all").map((item) => item.code),
    ["W-1", "E-1", "I-1", "C-1"],
  );
  assert.equal(validationSeverityCount(findings, "error"), 1);
});
