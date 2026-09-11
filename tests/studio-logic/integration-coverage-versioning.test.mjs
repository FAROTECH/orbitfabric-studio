import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import test from "node:test";

const require = createRequire(import.meta.url);
const { parseIntegrationResult, validateIntegrationResult } = require(
  "../../.test-dist/integrations/result.js",
);

const FIXTURES = join("tests", "fixtures", "integrations", "g2");

function read(name) {
  return readFileSync(join(FIXTURES, name), "utf8");
}

test("real F Prime v1 Result is accepted with producer-owned coverage intact", () => {
  const text = read("fprime-original-result.json");
  const result = parseIntegrationResult(text);
  const validation = validateIntegrationResult(result);

  assert.equal(validation.usable, true, validation.issues.map((item) => item.message).join("\n"));
  assert.equal(result.resultVersion, "0.2-candidate");
  assert.equal(result.coverage.mode, "producer-owned-v1");
  assert.equal(result.coverage.genericInterpretation, "unavailable");
  assert.deepEqual(JSON.parse(result.coverage.sourceJson), result.coverage.content);
  assert.equal(
    createHash("sha256").update(text).digest("hex"),
    "9e348163162a279eb8e0df3a466b55f2d53a613170782596f4d20cb0b8c08ae9",
  );
  assert.equal(result.coverage.content.records[0].semantic_disposition, "PARTIAL");
  assert.equal("state" in result.coverage.content.records[0], false);
});

test("official Core v1 zero-input fixture is accepted without v0 decoding", () => {
  const result = parseIntegrationResult(read("core-v1-zero-input-result.json"));
  const validation = validateIntegrationResult(result);

  assert.equal(validation.usable, true, validation.issues.map((item) => item.message).join("\n"));
  assert.equal(result.coverage.mode, "producer-owned-v1");
  assert.deepEqual(result.coverage.content, { status: "unavailable" });
  assert.equal(result.coverage.sourceJson, '{"status": "unavailable"}');
});

test("v1 coverage preserves exact numeric and whitespace lexemes", () => {
  const base = read("core-v1-zero-input-result.json");
  const source = '{ "counter": 9007199254740993, "ratio": 1.2300, "nested": [ true ] }';
  const text = base.replace('{"status": "unavailable"}', source);
  const result = parseIntegrationResult(text);

  assert.equal(result.coverage.mode, "producer-owned-v1");
  assert.equal(result.coverage.sourceJson, source);
  assert.equal(result.coverage.genericInterpretation, "unavailable");
});

test("v1 content that resembles v0 does not acquire generic semantics", () => {
  const base = read("core-v1-zero-input-result.json");
  const source = JSON.stringify({
    status: "complete",
    scope: { domains: [] },
    reason: null,
    summary: {},
    records: [],
  });
  const result = parseIntegrationResult(base.replace('{"status": "unavailable"}', source));

  assert.equal(result.coverage.mode, "producer-owned-v1");
  assert.equal(result.coverage.genericInterpretation, "unavailable");
  assert.equal("records" in result.coverage, false);
});

test("version selection is explicit and duplicate root coverage is rejected", () => {
  const base = read("core-v1-zero-input-result.json");
  assert.throws(
    () => parseIntegrationResult(base.replace('"0.2-candidate"', '"0.3-candidate"')),
    /Unsupported Result version/,
  );
  assert.throws(
    () => parseIntegrationResult(base.replace('"coverage":', '"coverage": {}, "coverage":')),
    /duplicate root key coverage/,
  );
});
