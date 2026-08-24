import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { entityKey, sameEntity } = require("../../.test-dist/mission/entityRef.js");

test("same textual id in different domains remains distinct", () => {
  const subsystem = { domain: "subsystems", id: "hyperspectral_payload" };
  const payload = { domain: "payloads", id: "hyperspectral_payload" };

  assert.notEqual(entityKey(subsystem), entityKey(payload));
  assert.equal(sameEntity(subsystem, payload), false);
  assert.equal(sameEntity(payload, { ...payload }), true);
});
