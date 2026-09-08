import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { initialStudioState, studioReducer } = require("../../.test-dist/app/studioState.js");
const { emptyMissionReadModel } = require("../../.test-dist/mission/MissionSession.js");
const {
  getIntegrationContext,
  integrationResultExactIdentity,
} = require("../../.test-dist/convergence/integrationSlot.js");
const { scenarioExactIdentity } = require("../../.test-dist/convergence/scenarioSlot.js");

const SCENARIO_SHA = "1".repeat(64);
const RESULT_SHA = "2".repeat(64);
const EVIDENCE_MANIFEST_SHA = "3".repeat(64);
const RELEASE_DESCRIPTOR_SHA = "4".repeat(64);
const ARTIFACT_SHA = "5".repeat(64);
const PACKAGE_MANIFEST_SHA = "6".repeat(64);

const CONTEXT = {
  integrationId: "reference-integration",
  adapterId: "reference-adapter",
  adapterVersion: "1.0.0",
  operationId: "project",
};

function membership(sessionId = "session-1", generation = 1) {
  return { sessionId, generation };
}

function session(sessionId = "session-1", generation = 1) {
  return {
    sessionId,
    generation,
    source: { selectedPath: "/tmp", missionDir: "/tmp/mission" },
    core: {
      executable: "orbitfabric",
      orbitfabricVersion: "1.3.0",
      versionText: "orbitfabric 1.3.0",
    },
    snapshot: {
      kind: "orbitfabric.mission_snapshot",
      snapshot_version: "0.1-candidate",
      orbitfabric_version: "1.3.0",
      result: "loaded",
      mission: { id: "mission-1", name: "Mission 1", model_version: "1" },
      source: { mission_dir: "/tmp/mission" },
      boundaries: {},
      diagnostics: [],
      model: {
        spacecraft: { id: "spacecraft-1", model_version: "1" },
        subsystems: [],
        modes: {},
        mode_transitions: [],
        telemetry: [],
        commands: [],
        events: [],
        faults: [],
        packets: [],
        policies: {},
        payloads: [],
        data_products: [],
        contacts: {},
        commandability: {},
      },
    },
    entityIndex: null,
    relationships: null,
    lint: null,
    readiness: { entities: "pending", relationships: "pending", lint: "pending" },
    failures: [],
    readModel: emptyMissionReadModel(),
    openedAt: 0,
    lastSuccessfulRefreshAt: null,
  };
}

function loadedScenario(member = membership()) {
  return {
    kind: "orbitfabric.scenario_declaration",
    declarationVersion: "0.1-candidate",
    orbitfabricVersion: "1.3.0",
    result: "loaded",
    scenario: { id: "scenario-1", name: "Scenario 1", description: null },
    mission: { id: "mission-1", modelVersion: "1" },
    source: { scenarioSha256: SCENARIO_SHA },
    boundaries: {},
    atomCount: 1,
    atoms: [
      {
        id: "atom-0001",
        kind: "action",
        order: 1,
        refs: [],
      },
    ],
    diagnostics: [],
    _membership: member,
  };
}

function integrationObservation(member = membership()) {
  return {
    membership: member,
    context: CONTEXT,
    resultPath: "/tmp/result.json",
    resultSha256: RESULT_SHA,
    result: {
      mappings: [{ id: "mapping-1" }],
      artifacts: [{ id: "artifact-1" }],
    },
    bundle: {
      resultPath: "/tmp/result.json",
      resultText: "{}",
      artifactChecks: [],
    },
  };
}

function evidenceObservation(member = membership()) {
  return {
    membership: member,
    targetPath: "/tmp/evidence.json",
    manifestSha256: EVIDENCE_MANIFEST_SHA,
    manifest: {
      kind: "orbitfabric.evidence_set_manifest",
      manifestVersion: "0.1-candidate",
      evidenceSet: { id: "evidence-set-1" },
      curator: { id: "curator-1" },
      records: [
        {
          id: "evidence-record-1",
          content: {
            kind: "fixture",
            producer: { id: "producer-1" },
            reference: { path: "evidence.txt", sha256: "7".repeat(64) },
          },
          subjects: [
            {
              type: "scenario_source",
              scenarioId: "scenario-1",
              scenarioSha256: SCENARIO_SHA,
            },
            {
              type: "integration_result",
              resultSha256: RESULT_SHA,
            },
          ],
        },
      ],
    },
  };
}

function installedRecord() {
  return {
    instanceId: "adapter-instance-1",
    sourceCoordinate: {
      authority: "github",
      publisher: "FAROTECH",
      name: "reference-adapter",
    },
    releaseVersion: "1.0.0",
    releaseDescriptorPath: "/tmp/release.json",
    releaseDescriptorSha256: RELEASE_DESCRIPTOR_SHA,
    artifactId: "wheel",
    artifactSha256: ARTIFACT_SHA,
    backendId: "python-wheel-managed-env",
    installRoot: "/tmp/adapter",
    manifestPath: "/tmp/adapter/integration_package.json",
    manifestSha256: PACKAGE_MANIFEST_SHA,
    executionArgvPrefix: ["/tmp/adapter/bin/adapter"],
    acceptancePolicy: "development-explicit-source",
    acceptanceWarnings: [],
  };
}

function openPrimary(state, nextSession) {
  state = studioReducer(state, {
    type: "MISSION_OPEN_REQUESTED",
    opening: {
      requestId: nextSession.sessionId,
      generation: nextSession.generation,
      selectedPath: "/tmp",
      isRefresh: nextSession.generation > 1,
    },
  });
  return studioReducer(state, { type: "MISSION_PRIMARY_COMMITTED", session: nextSession });
}

function populateAllSlots(state, member = membership()) {
  const scenarioRequest = {
    membership: member,
    requestToken: "scenario-1",
    targetPath: "/tmp/scenario.yaml",
    mode: "replace",
  };
  state = studioReducer(state, { type: "SCENARIO_REQUESTED", request: scenarioRequest });
  state = studioReducer(state, {
    type: "SCENARIO_DECLARATION_READY",
    request: scenarioRequest,
    declaration: loadedScenario(member),
  });

  const integrationRequest = {
    membership: member,
    requestToken: "integration-1",
    context: CONTEXT,
    resultPath: "/tmp/result.json",
  };
  state = studioReducer(state, {
    type: "INTEGRATION_RESULT_REQUESTED",
    request: integrationRequest,
  });
  state = studioReducer(state, {
    type: "INTEGRATION_RESULT_READY",
    request: integrationRequest,
    observation: integrationObservation(member),
  });

  const evidenceRequest = {
    membership: member,
    requestToken: "evidence-1",
    targetPath: "/tmp/evidence.json",
    mode: "replace",
  };
  state = studioReducer(state, { type: "EVIDENCE_SET_REQUESTED", request: evidenceRequest });
  state = studioReducer(state, {
    type: "EVIDENCE_SET_READY",
    request: evidenceRequest,
    observation: evidenceObservation(member),
  });

  const lifecycleRequest = {
    membership: member,
    requestToken: "lifecycle-1",
    mode: "replace",
  };
  state = studioReducer(state, {
    type: "ADAPTER_LIFECYCLE_INSTALLED_REQUESTED",
    request: lifecycleRequest,
  });
  state = studioReducer(state, {
    type: "ADAPTER_LIFECYCLE_INSTALLED_READY",
    request: lifecycleRequest,
    records: [installedRecord()],
  });

  return { state, scenarioRequest, integrationRequest, evidenceRequest, lifecycleRequest };
}

test("SP1-G keeps Scenario, Integration, Evidence and Adapter Lifecycle as independent exact observations", () => {
  let state = openPrimary(initialStudioState, session());
  ({ state } = populateAllSlots(state));

  const scenario = state.scenario.accepted.declaration;
  const result = getIntegrationContext(state.integration, CONTEXT).accepted;
  const evidence = state.evidence.accepted;
  const installed = state.lifecycle.installed.accepted[0];

  assert.deepEqual(scenarioExactIdentity(scenario), {
    scenarioId: "scenario-1",
    scenarioSha256: SCENARIO_SHA,
  });
  assert.equal(integrationResultExactIdentity(result), RESULT_SHA);
  assert.equal(evidence.manifestSha256, EVIDENCE_MANIFEST_SHA);
  assert.equal(evidence.manifest.records[0].id, "evidence-record-1");
  assert.deepEqual(evidence.records[0].subjects.map((subject) => subject.state), [
    "current",
    "current",
  ]);
  assert.equal(installed.instanceId, "adapter-instance-1");
  assert.equal(installed.releaseDescriptorSha256, RELEASE_DESCRIPTOR_SHA);
  assert.equal(installed.artifactSha256, ARTIFACT_SHA);
  assert.equal(installed.manifestSha256, PACKAGE_MANIFEST_SHA);

  assert.equal(state.scenario.accepted.declaration.result, "loaded");
  assert.equal(state.evidence.accepted.manifest.records[0].content.kind, "fixture");
  assert.notEqual(state.scenario, state.evidence);
});

test("SP1-G generation replacement clears all convergence slots and rejects every late old-generation completion", () => {
  let state = openPrimary(initialStudioState, session());
  const populated = populateAllSlots(state);
  state = populated.state;

  state = openPrimary(state, session("session-2", 2));
  assert.equal(state.activeSession.sessionId, "session-2");
  assert.equal(state.scenario.accepted, null);
  assert.equal(state.integration.contexts.size, 0);
  assert.equal(state.evidence.accepted, null);
  assert.equal(state.lifecycle.installed.accepted, null);

  const beforeLate = state;
  state = studioReducer(state, {
    type: "SCENARIO_DECLARATION_READY",
    request: populated.scenarioRequest,
    declaration: loadedScenario(),
  });
  state = studioReducer(state, {
    type: "INTEGRATION_RESULT_READY",
    request: populated.integrationRequest,
    observation: integrationObservation(),
  });
  state = studioReducer(state, {
    type: "EVIDENCE_SET_READY",
    request: populated.evidenceRequest,
    observation: evidenceObservation(),
  });
  state = studioReducer(state, {
    type: "ADAPTER_LIFECYCLE_INSTALLED_FAILED",
    request: populated.lifecycleRequest,
    failure: { class: "transport", message: "late old-generation failure" },
  });

  assert.equal(state, beforeLate);
});

test("SP1-G failed same-target refresh is localized and preserves independently accepted state", () => {
  let state = openPrimary(initialStudioState, session());
  ({ state } = populateAllSlots(state));

  const acceptedScenario = state.scenario.accepted;
  const acceptedIntegration = getIntegrationContext(state.integration, CONTEXT).accepted;
  const acceptedEvidence = state.evidence.accepted;
  const acceptedLifecycle = state.lifecycle.installed.accepted;

  const refresh = {
    membership: membership(),
    requestToken: "lifecycle-refresh",
    mode: "refresh",
  };
  state = studioReducer(state, {
    type: "ADAPTER_LIFECYCLE_INSTALLED_REQUESTED",
    request: refresh,
  });
  state = studioReducer(state, {
    type: "ADAPTER_LIFECYCLE_INSTALLED_FAILED",
    request: refresh,
    failure: { class: "transport", message: "fixture transport failure" },
  });

  assert.equal(state.activeSession.sessionId, "session-1");
  assert.equal(state.scenario.accepted, acceptedScenario);
  assert.equal(getIntegrationContext(state.integration, CONTEXT).accepted, acceptedIntegration);
  assert.equal(state.evidence.accepted, acceptedEvidence);
  assert.equal(state.lifecycle.installed.accepted, acceptedLifecycle);
  assert.equal(state.lifecycle.installed.failure.message, "fixture transport failure");
});
