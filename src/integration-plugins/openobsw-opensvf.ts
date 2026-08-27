import type {
  IntegrationInspectorAction,
  IntegrationPluginContext,
  IntegrationPluginDefinition,
  IntegrationTargetInspectionInput,
  IntegrationTargetInspectionModel,
} from "../integrations/plugin-api";

const INTEGRATION_ID = "orbitfabric-openobsw-opensvf";
const FLIGHT_ARTIFACT_ID = "flight.mission_contract";
const SRDB_ARTIFACT_ID = "ground.opensvf_srdb";

export const openObswOpenSvfIntegrationPlugin: IntegrationPluginDefinition = {
  apiVersion: "0.1-candidate",
  plugin: {
    id: "orbitfabric-studio.openobsw-opensvf",
    version: "0.1.0-candidate",
    displayName: "OpenOBSW / OpenSVF",
  },
  compatibility: {
    integrationIds: [INTEGRATION_ID],
  },
  contributions: {
    targetInspectors: [
      {
        id: "openobsw.contract-symbol",
        matches(input) {
          return input.target.namespace === "openobsw" && input.target.kind === "contract_symbol";
        },
        inspect(input, context) {
          return targetModel({
            title: "OpenOBSW contract symbol",
            targetLabel: "C symbol",
            artifactId: FLIGHT_ARTIFACT_ID,
            artifactLabel: "Reveal flight contract",
            input,
            context,
          });
        },
      },
      {
        id: "opensvf.srdb-parameter",
        matches(input) {
          return input.target.namespace === "opensvf" && input.target.kind === "srdb_parameter";
        },
        inspect(input, context) {
          return targetModel({
            title: "OpenSVF SRDB parameter",
            targetLabel: "SRDB name",
            artifactId: SRDB_ARTIFACT_ID,
            artifactLabel: "Reveal OpenSVF SRDB",
            input,
            context,
          });
        },
      },
    ],
  },
};

function targetModel({
  title,
  targetLabel,
  artifactId,
  artifactLabel,
  input,
  context,
}: {
  title: string;
  targetLabel: string;
  artifactId: string;
  artifactLabel: string;
  input: IntegrationTargetInspectionInput;
  context: IntegrationPluginContext;
}): IntegrationTargetInspectionModel {
  const actions: IntegrationInspectorAction[] = [
    {
      id: "open-core-source",
      label: "Open Core entity",
      request: { kind: "open_core_entity", ref: input.source },
    },
  ];

  const artifact = context.integration.result?.artifacts.find(
    (item) => item.id === artifactId && item.derivedFromMappings.includes(input.mapping.id),
  );
  if (artifact) {
    actions.push({
      id: `reveal-${artifact.id}`,
      label: artifactLabel,
      request: { kind: "reveal_result_artifact", artifactId: artifact.id },
    });
  }

  return {
    title,
    subtitle: input.target.id,
    badges: [
      { label: input.target.namespace, tone: "info" },
      { label: input.target.kind, tone: "neutral" },
    ],
    sections: [
      {
        id: "identity",
        rows: [
          { label: targetLabel, value: input.target.id, monospace: true, emphasis: "strong" },
          { label: "Mapping", value: input.mapping.id, monospace: true },
          {
            label: "Core source",
            value: `${input.source.domain}/${input.source.id}`,
            monospace: true,
          },
        ],
      },
    ],
    actions,
  };
}
