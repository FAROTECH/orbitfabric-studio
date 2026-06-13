import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import "./dataProductsCockpit.css";
import { ProvenanceBadge, StatusBadge } from "./Badges";
import {
  parseCoreCoverageSummary,
  parseCoreEntityIndex,
  parseCoreModelSummary,
  parseCoreRelationshipManifest,
  parseCoreScenarioRunIndex,
  parseCoreSimulationReport,
} from "./coreReports";
import type { DomainEntitySummary } from "./domainSurfaceModel";
import type { MissionModelAtlasSurfaceProps } from "./MissionModelAtlasSurface";
import type {
  CoreCoverageRecord,
  CoreCoverageSummary,
  CoreEntityIndex,
  CoreEntityIndexEntity,
  CoreModelSummary,
  CoreRelationshipManifest,
  CoreRelationshipRecord,
  CoreScenarioRunIndex,
  CoreSimulationDataFlowEvidenceRecord,
  CoreSimulationReport,
  FileContent,
  GeneratedArtifactEntry,
  GeneratedArtifactInventory,
  ProjectEntry,
  WorkspaceInspection,
} from "./types/workspace";

const DATA_PRODUCTS_DOMAIN_ID = "data_products";

const generatedReportPaths = {
  modelSummary: ["reports/model_summary.json", "reports/orbitfabric_studio_model_summary.json"],
  entityIndex: ["reports/entity_index.json", "reports/orbitfabric_studio_entity_index.json"],
  relationshipManifest: [
    "reports/relationship_manifest.json",
    "reports/orbitfabric_studio_relationship_manifest.json",
  ],
  scenarioRunIndex: [
    "reports/scenario_run_index.json",
    "reports/orbitfabric_studio_scenario_run_index.json",
  ],
  coverageSummary: ["reports/coverage_summary.json", "reports/orbitfabric_studio_coverage_summary.json"],
};

const bridgeContractPaths = [
  "ground/generic/ground_contract_manifest.json",
  "runtime/cpp17/runtime_contract_manifest.json",
];

const preferredBridgeArtifactPaths = [
  "docs/data_products.md",
  "docs/data_flow.md",
  "ground/generic/ground_contract_manifest.json",
  "ground/generic/ground_dictionaries.md",
  "runtime/cpp17/runtime_contract_manifest.json",
];

interface PassiveGeneratedEvidence {
  modelSummary: CoreModelSummary | null;
  entityIndex: CoreEntityIndex | null;
  relationshipManifest: CoreRelationshipManifest | null;
  scenarioRunIndex: CoreScenarioRunIndex | null;
  coverageSummary: CoreCoverageSummary | null;
  simulationReports: CoreSimulationReport[];
  artifactInventory: GeneratedArtifactInventory | null;
  bridgeProducts: BridgeProductDetail[];
  warnings: string[];
}

interface BridgeProductDetail {
  id: string;
  producer: string | null;
  producerType: string | null;
  productType: string | null;
  estimatedSizeBytes: number | null;
  priority: string | null;
  storageClass: string | null;
  storageRetention: string | null;
  storageOverflowPolicy: string | null;
  downlinkPolicy: string | null;
  description: string | null;
  sourceArtifact: string;
  raw: unknown;
}

type ProductCoverageState = "covered" | "uncovered" | "not-reported";

interface DataProductRecord {
  id: string;
  displayName: string;
  entity: DomainEntitySummary | null;
  bridge: BridgeProductDetail | null;
  sourceFile: string;
  producer: string | null;
  producerType: string | null;
  relationships: CoreRelationshipRecord[];
  producerRelationships: CoreRelationshipRecord[];
  downlinkRelationships: CoreRelationshipRecord[];
  evidenceRecords: CoreSimulationDataFlowEvidenceRecord[];
  coverageState: ProductCoverageState;
  present: boolean;
}

interface RelationshipCoverageRow {
  id: string;
  label: string;
  covered: number;
  total: number;
  ratio: number | null;
  state: "reported" | "not-reported";
  raw: CoreCoverageRecord | null;
}

interface SummaryCard {
  label: string;
  value: string;
  detail: string;
  icon: string;
  tone: "model" | "core" | "bridge";
}

const emptyPassiveEvidence: PassiveGeneratedEvidence = {
  modelSummary: null,
  entityIndex: null,
  relationshipManifest: null,
  scenarioRunIndex: null,
  coverageSummary: null,
  simulationReports: [],
  artifactInventory: null,
  bridgeProducts: [],
  warnings: [],
};

export function DataProductsDomainSurface({
  workspace,
  modelSummary,
  entityIndex,
  selectedEntity,
  onSelectEntity,
  onOpenFile,
}: MissionModelAtlasSurfaceProps) {
  const [passiveEvidence, setPassiveEvidence] = useState<PassiveGeneratedEvidence>(emptyPassiveEvidence);
  const [isLoadingPassiveEvidence, setIsLoadingPassiveEvidence] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ProductCoverageState>("all");

  useEffect(() => {
    let cancelled = false;

    async function loadPassiveEvidence() {
      setIsLoadingPassiveEvidence(true);

      try {
        const nextEvidence = await readPassiveGeneratedEvidence(workspace);

        if (!cancelled) {
          setPassiveEvidence(nextEvidence);
        }
      } catch (caught) {
        if (!cancelled) {
          setPassiveEvidence({
            ...emptyPassiveEvidence,
            warnings: [`Unable to load generated Data Products evidence: ${formatCaughtError(caught)}`],
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoadingPassiveEvidence(false);
        }
      }
    }

    void loadPassiveEvidence();

    return () => {
      cancelled = true;
    };
  }, [workspace.selected_path]);

  const effectiveModelSummary = modelSummary ?? passiveEvidence.modelSummary;
  const effectiveEntityIndex = entityIndex ?? passiveEvidence.entityIndex;
  const effectiveRelationshipManifest = passiveEvidence.relationshipManifest;
  const effectiveCoverageSummary = passiveEvidence.coverageSummary;
  const effectiveScenarioRunIndex = passiveEvidence.scenarioRunIndex;
  const simulationReports = passiveEvidence.simulationReports;
  const artifactInventory = passiveEvidence.artifactInventory;

  const products = useMemo(
    () => createDataProductRecords({
      entityIndex: effectiveEntityIndex,
      bridgeProducts: passiveEvidence.bridgeProducts,
      relationshipManifest: effectiveRelationshipManifest,
      coverageSummary: effectiveCoverageSummary,
      simulationReports,
    }),
    [
      effectiveEntityIndex,
      effectiveRelationshipManifest,
      effectiveCoverageSummary,
      passiveEvidence.bridgeProducts,
      simulationReports,
    ],
  );

  useEffect(() => {
    if (products.length === 0) {
      setSelectedProductId(null);
      return;
    }

    const selectedStillExists = products.some((product) => product.id === selectedProductId);

    if (!selectedStillExists) {
      const firstCoveredProduct = products.find((product) => product.coverageState === "covered");
      setSelectedProductId(firstCoveredProduct?.id ?? products[0].id);
    }
  }, [products, selectedProductId]);

  const selectedProduct = products.find((product) => product.id === selectedProductId) ?? products[0] ?? null;
  const filteredProducts = filterProducts(products, query, statusFilter);
  const bridgeArtifacts = getBridgeArtifacts(artifactInventory);
  const dataProductsCoverage = effectiveCoverageSummary?.entity_coverage[DATA_PRODUCTS_DOMAIN_ID] ?? null;
  const relationshipCoverageRows = createRelationshipCoverageRows(
    effectiveRelationshipManifest,
    effectiveCoverageSummary,
  );
  const summaryCards = createSummaryCards({
    products,
    dataProductsCoverage,
    scenarioRunIndex: effectiveScenarioRunIndex,
    simulationReports,
    bridgeArtifacts,
  });
  const sourceEntry = findDataProductsSourceEntry(workspace);
  const selectedRoute = createEvidenceRoute(selectedProduct);
  const selectedJsonPayload = selectedProduct
    ? createSelectedJsonPayload(selectedProduct)
    : { status: "not reported" };

  function handleSelectProduct(product: DataProductRecord) {
    setSelectedProductId(product.id);

    if (product.entity) {
      onSelectEntity(product.entity);
    }
  }

  function handleOpenArtifact(artifact: GeneratedArtifactEntry) {
    onOpenFile({
      name: artifact.name,
      path: artifact.path,
      kind: "file",
      category: artifact.artifact_class === "reports" || artifact.artifact_class === "logs"
        ? "derivedReport"
        : "generatedOutput",
    });
  }

  return (
    <section
      id="studio-model"
      className="data-products-cockpit-surface"
      aria-label="Data Products Cockpit"
    >
      <header className="data-products-cockpit-hero">
        <div>
          <span className="cockpit-eyebrow">Data Products Cockpit</span>
          <h2>Cross-check mission model contract, Core evidence and bridge outputs</h2>
          <p>
            Review declared data products, Core-reported evidence, coverage status and generated
            bridge artifacts without editing source files or inferring private runtime behavior.
          </p>
        </div>
        <div className="data-products-cockpit-hero-side">
          <div className="badge-row">
            <ProvenanceBadge label="READ-ONLY" />
            <ProvenanceBadge label="CORE-DERIVED" />
            <StatusBadge label="GENERATED-AWARE" />
            <StatusBadge label="NO PRIVATE INFERENCE" />
          </div>
          <strong>{formatMissionIdentity(effectiveModelSummary, effectiveEntityIndex)}</strong>
        </div>
      </header>

      <section className="data-products-summary-strip" aria-label="Data Products summary">
        {summaryCards.map((card) => (
          <article className={`data-products-summary-card data-products-summary-card-${card.tone}`} key={card.label}>
            <span aria-hidden="true">{card.icon}</span>
            <div>
              <small>{card.label}</small>
              <strong>{card.value}</strong>
              <em>{card.detail}</em>
            </div>
          </article>
        ))}
      </section>

      <section className="data-products-layer-grid" aria-label="Data Products layered cockpit">
        <section className="data-products-layer data-products-layer-model" aria-label="Model contract layer">
          <LayerHeader index="1" label="MODEL CONTRACT" />
          <div className="data-products-panel-heading">
            <div>
              <h3>Product Catalog</h3>
              <p>Declared data product identities from Core entity index and generated bridge detail.</p>
            </div>
            <StatusBadge label={`${products.length} PRODUCTS`} />
          </div>

          <div className="data-products-filter-row">
            <input
              type="search"
              value={query}
              placeholder="Filter products..."
              aria-label="Filter data products"
              onChange={(event) => setQuery(event.target.value)}
            />
            <select
              value={statusFilter}
              aria-label="Coverage status filter"
              onChange={(event) => setStatusFilter(event.target.value as "all" | ProductCoverageState)}
            >
              <option value="all">All Status</option>
              <option value="covered">Covered</option>
              <option value="uncovered">Uncovered</option>
              <option value="not-reported">Not reported</option>
            </select>
          </div>

          <div className="data-products-catalog-list">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <button
                  type="button"
                  className={[
                    "data-products-catalog-card",
                    selectedProduct?.id === product.id ? "data-products-catalog-card-active" : "",
                  ].filter(Boolean).join(" ")}
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  aria-current={selectedProduct?.id === product.id ? "true" : undefined}
                >
                  <span className={`data-products-coverage-dot data-products-coverage-dot-${product.coverageState}`} />
                  <strong>{product.displayName}</strong>
                  <small>Producer</small>
                  <em>{formatProducer(product)}</em>
                  <small>Type</small>
                  <em>{product.bridge?.productType ?? "not reported"}</em>
                  <small>Priority</small>
                  <PriorityPill value={product.bridge?.priority ?? "not reported"} />
                  <small>Coverage</small>
                  <CoverageLabel state={product.coverageState} />
                </button>
              ))
            ) : (
              <div className="data-products-empty-state">
                <strong>No matching data products</strong>
                <span>Clear filters to return to the full product catalog.</span>
              </div>
            )}
          </div>

          <footer className="data-products-panel-footer">
            <span>{products.length} items</span>
            <span>{isLoadingPassiveEvidence ? "Loading generated evidence" : "Generated evidence loaded when available"}</span>
          </footer>
        </section>

        <section className="data-products-layer data-products-layer-core" aria-label="Core evidence layer">
          <LayerHeader index="2" label="CORE EVIDENCE" />
          {selectedProduct ? (
            <>
              <section className="data-products-selected-card" aria-label="Selected data product">
                <div className="data-products-selected-title-row">
                  <div className="data-products-selected-icon" aria-hidden="true">◇</div>
                  <div>
                    <h3>{selectedProduct.id}</h3>
                    <span>{selectedProduct.bridge?.description ?? "No generated description reported."}</span>
                  </div>
                  <PriorityPill value={selectedProduct.bridge?.priority ?? "not reported"} />
                </div>

                <div className="data-products-selected-grid">
                  <InspectorField label="Producer" value={formatProducer(selectedProduct)} />
                  <InspectorField label="Product type" value={selectedProduct.bridge?.productType} />
                  <InspectorField
                    label="Estimated size"
                    value={formatBytes(selectedProduct.bridge?.estimatedSizeBytes)}
                  />
                  <InspectorField label="Priority" value={selectedProduct.bridge?.priority} />
                  <InspectorField label="Storage intent" value={formatStorageIntent(selectedProduct.bridge)} />
                  <InspectorField label="Downlink intent" value={formatDownlinkIntent(selectedProduct.bridge)} />
                  <InspectorField label="Source file" value={selectedProduct.sourceFile} />
                  <InspectorField label="Evidence records" value={String(selectedProduct.evidenceRecords.length)} />
                </div>
              </section>

              <section className="data-products-route-panel" aria-label="Data product evidence route">
                <div className="data-products-subpanel-heading">
                  <h3>Data Path</h3>
                  <span>Evidence route</span>
                </div>
                {selectedRoute.length > 0 ? (
                  <div className="data-products-route-flow">
                    {selectedRoute.map((node, index) => (
                      <div className="data-products-route-node-wrap" key={`${node.kind}-${node.value}-${index}`}>
                        <article className={`data-products-route-node data-products-route-node-${node.kind}`}>
                          <strong>{node.value}</strong>
                          <span>{node.label}</span>
                        </article>
                        {index < selectedRoute.length - 1 ? <span className="data-products-route-arrow">→</span> : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="data-products-empty-state">
                    <strong>No route evidence reported</strong>
                    <span>Studio does not infer command, downlink flow or contact windows.</span>
                  </div>
                )}
              </section>

              <section className="data-products-coverage-panel" aria-label="Relationship and entity coverage">
                <div className="data-products-subpanel-heading">
                  <h3>Relationship & Entity Coverage</h3>
                  <StatusBadge label={selectedProduct.coverageState.toUpperCase()} />
                </div>
                <div className="data-products-relationship-table">
                  {relationshipCoverageRows.map((row) => (
                    <article key={row.id}>
                      <span>{row.label}</span>
                      <strong>{row.state === "reported" ? `${row.covered} / ${row.total}` : "not reported"}</strong>
                      <div className="data-products-progress-track" aria-hidden="true">
                        <span style={{ width: `${Math.round((row.ratio ?? 0) * 100)}%` }} />
                      </div>
                    </article>
                  ))}
                </div>
                <div className="data-products-entity-coverage">
                  <header>
                    <span>Entity coverage for data_products domain</span>
                    <strong>{formatCoverageSummary(dataProductsCoverage)}</strong>
                  </header>
                  <CoverageIdGroup label="Covered IDs" ids={dataProductsCoverage?.covered_ids ?? []} tone="covered" />
                  <CoverageIdGroup label="Uncovered IDs" ids={dataProductsCoverage?.uncovered_ids ?? []} tone="uncovered" />
                </div>
              </section>
            </>
          ) : (
            <div className="data-products-empty-state data-products-empty-state-large">
              <strong>No data products reported</strong>
              <span>Load Core entity index or generated bridge artifacts to populate this cockpit.</span>
            </div>
          )}
        </section>

        <section className="data-products-layer data-products-layer-bridge" aria-label="Bridge output layer">
          <LayerHeader index="3" label="BRIDGE OUTPUTS" />
          <div className="data-products-panel-heading">
            <div>
              <h3>Evidence / Inspector</h3>
              <p>Selected product view across model identity, Core evidence and generated artifacts.</p>
            </div>
            <StatusBadge label={selectedProduct ? "SELECTED" : "WAITING"} />
          </div>

          {selectedProduct ? (
            <div className="data-products-inspector-stack">
              <InspectorSection title="Model" subtitle="Mission Contract" tone="model">
                <InspectorField label="entity" value={selectedProduct.id} />
                <InspectorField label="domain" value={DATA_PRODUCTS_DOMAIN_ID} />
                <InspectorField label="provenance" value={selectedProduct.entity?.provenance ?? "not reported"} />
                <InspectorField label="relationship" value={formatPrimaryRelationship(selectedProduct)} />
              </InspectorSection>

              <InspectorSection title="Core Evidence" subtitle="Data-flow" tone="core">
                {selectedProduct.evidenceRecords.length > 0 ? (
                  <div className="data-products-evidence-table">
                    <header>
                      <span>Scenario Run</span>
                      <span>t(s)</span>
                      <span>Triggered By Command</span>
                    </header>
                    {selectedProduct.evidenceRecords.map((record, index) => (
                      <article key={`${record.data_product_id ?? selectedProduct.id}-${record.t}-${index}`}>
                        <span>{findScenarioForEvidence(simulationReports, record)}</span>
                        <strong>{formatNumber(record.t)}</strong>
                        <span>{record.triggered_by_command ?? "not reported"}</span>
                      </article>
                    ))}
                    <div className="data-products-evidence-tags">
                      <TagList label="eligible_downlink_flows" values={collectEvidenceStringValues(selectedProduct.evidenceRecords, "eligible_downlink_flows")} />
                      <TagList label="contact_windows" values={collectEvidenceStringValues(selectedProduct.evidenceRecords, "contact_windows")} />
                    </div>
                  </div>
                ) : (
                  <div className="data-products-empty-state">
                    <strong>No Core data-flow evidence</strong>
                    <span>This product is declared but not covered by current simulation JSON reports.</span>
                  </div>
                )}
              </InspectorSection>

              <InspectorSection title="Artifacts" subtitle="Bridge Outputs" tone="bridge">
                {bridgeArtifacts.length > 0 ? (
                  <div className="data-products-artifact-list">
                    {bridgeArtifacts.map((artifact) => (
                      <button type="button" key={artifact.path} onClick={() => handleOpenArtifact(artifact)}>
                        <span>{artifact.relative_path}</span>
                        <strong>{artifact.artifact_class}</strong>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="data-products-empty-state">
                    <strong>No bridge artifacts reported</strong>
                    <span>Generated artifact inventory is empty or not loaded.</span>
                  </div>
                )}
              </InspectorSection>

              <InspectorSection title="JSON" subtitle="Selected Evidence Record" tone="json">
                <pre className="data-products-json-block">
                  {JSON.stringify(selectedJsonPayload, null, 2)}
                </pre>
              </InspectorSection>
            </div>
          ) : (
            <div className="data-products-empty-state data-products-empty-state-large">
              <strong>No product selected</strong>
              <span>Select a product from the catalog to populate the inspector.</span>
            </div>
          )}
        </section>
      </section>

      <section className="data-products-guardrail-strip" aria-label="Data Products cockpit guardrails">
        <span>Mission Model is source of truth</span>
        <span>Generated outputs are reviewable artifacts</span>
        <span>No runtime or ground behavior inferred</span>
        {sourceEntry ? (
          <button type="button" onClick={() => onOpenFile(sourceEntry)}>
            Inspect data_products.yaml
          </button>
        ) : null}
      </section>

      {passiveEvidence.warnings.length > 0 ? (
        <section className="data-products-warning-strip" aria-label="Passive generated evidence warnings">
          {passiveEvidence.warnings.slice(0, 3).map((warning) => (
            <span key={warning}>{warning}</span>
          ))}
        </section>
      ) : null}
    </section>
  );
}

function LayerHeader({ index, label }: { index: string; label: string }) {
  return (
    <header className="data-products-layer-header">
      <strong>{index}</strong>
      <span>{label}</span>
    </header>
  );
}

function InspectorSection({
  title,
  subtitle,
  tone,
  children,
}: {
  title: string;
  subtitle: string;
  tone: "model" | "core" | "bridge" | "json";
  children: React.ReactNode;
}) {
  return (
    <section className={`data-products-inspector-section data-products-inspector-section-${tone}`}>
      <header>
        <div>
          <strong>{title}</strong>
          <span>{subtitle}</span>
        </div>
      </header>
      <div className="data-products-inspector-section-body">{children}</div>
    </section>
  );
}

function InspectorField({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="data-products-inspector-field">
      <span>{label}</span>
      <strong>{value === null || value === undefined || value === "" ? "not reported" : value}</strong>
    </div>
  );
}

function PriorityPill({ value }: { value: string }) {
  return <span className={`data-products-priority-pill data-products-priority-${normalizeToken(value)}`}>{value}</span>;
}

function CoverageLabel({ state }: { state: ProductCoverageState }) {
  const label = state === "not-reported" ? "not reported" : state;
  return <span className={`data-products-coverage-label data-products-coverage-label-${state}`}>{label}</span>;
}

function CoverageIdGroup({
  label,
  ids,
  tone,
}: {
  label: string;
  ids: string[];
  tone: "covered" | "uncovered";
}) {
  return (
    <div className="data-products-coverage-id-group">
      <span>{label} ({ids.length})</span>
      <div>
        {ids.length > 0 ? (
          ids.map((id) => <em className={`data-products-id-pill data-products-id-pill-${tone}`} key={id}>{id}</em>)
        ) : (
          <em className="data-products-id-pill">none reported</em>
        )}
      </div>
    </div>
  );
}

function TagList({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <span>{label}</span>
      <div>
        {values.length > 0 ? (
          values.map((value) => <em className="data-products-id-pill data-products-id-pill-covered" key={value}>{value}</em>)
        ) : (
          <em className="data-products-id-pill">not reported</em>
        )}
      </div>
    </div>
  );
}

async function readPassiveGeneratedEvidence(workspace: WorkspaceInspection): Promise<PassiveGeneratedEvidence> {
  const warnings: string[] = [];
  const evidence: PassiveGeneratedEvidence = {
    ...emptyPassiveEvidence,
    warnings,
  };

  let artifactInventory: GeneratedArtifactInventory | null = null;

  try {
    artifactInventory = await invoke<GeneratedArtifactInventory>("inspect_generated_artifacts", {
      workspacePath: workspace.selected_path,
    });
    evidence.artifactInventory = artifactInventory;
    warnings.push(...artifactInventory.warnings);
  } catch (caught) {
    warnings.push(`Generated artifact inventory unavailable: ${formatCaughtError(caught)}`);
  }

  const artifacts = artifactInventory?.artifacts ?? [];

  for (const artifact of artifacts) {
    if (artifact.artifact_class !== "reports" || artifact.preview_status !== "previewable") {
      continue;
    }

    if (!artifact.relative_path.endsWith(".json")) {
      continue;
    }

    const fileContent = await readArtifactFile(workspace, artifact).catch((caught) => {
      warnings.push(`Unable to read ${artifact.relative_path}: ${formatCaughtError(caught)}`);
      return null;
    });

    if (!fileContent) {
      continue;
    }

    if (matchReportArtifact(artifact.relative_path, generatedReportPaths.modelSummary)) {
      evidence.modelSummary = evidence.modelSummary ?? parseCoreModelSummary(fileContent);
      continue;
    }

    if (matchReportArtifact(artifact.relative_path, generatedReportPaths.entityIndex)) {
      evidence.entityIndex = evidence.entityIndex ?? parseCoreEntityIndex(fileContent);
      continue;
    }

    if (matchReportArtifact(artifact.relative_path, generatedReportPaths.relationshipManifest)) {
      evidence.relationshipManifest = evidence.relationshipManifest ?? parseCoreRelationshipManifest(fileContent);
      continue;
    }

    if (matchReportArtifact(artifact.relative_path, generatedReportPaths.scenarioRunIndex)) {
      evidence.scenarioRunIndex = evidence.scenarioRunIndex ?? parseCoreScenarioRunIndex(fileContent);
      continue;
    }

    if (matchReportArtifact(artifact.relative_path, generatedReportPaths.coverageSummary)) {
      evidence.coverageSummary = evidence.coverageSummary ?? parseCoreCoverageSummary(fileContent);
      continue;
    }

    const simulationReport = parseCoreSimulationReport(fileContent);

    if (simulationReport) {
      evidence.simulationReports = upsertSimulationReport(evidence.simulationReports, simulationReport);
    }
  }

  const bridgeProductsById = new Map<string, BridgeProductDetail>();

  for (const relativePath of bridgeContractPaths) {
    const artifact = artifacts.find((candidate) => candidate.relative_path === relativePath);

    if (!artifact || artifact.preview_status !== "previewable") {
      continue;
    }

    const fileContent = await readArtifactFile(workspace, artifact).catch((caught) => {
      warnings.push(`Unable to read ${artifact.relative_path}: ${formatCaughtError(caught)}`);
      return null;
    });

    if (!fileContent) {
      continue;
    }

    for (const product of parseBridgeProducts(fileContent, relativePath)) {
      const current = bridgeProductsById.get(product.id);
      bridgeProductsById.set(product.id, current ? mergeBridgeProduct(current, product) : product);
    }
  }

  evidence.bridgeProducts = [...bridgeProductsById.values()];

  return evidence;
}

async function readArtifactFile(
  workspace: WorkspaceInspection,
  artifact: GeneratedArtifactEntry,
): Promise<string> {
  const file = await invoke<FileContent>("read_text_file", {
    workspacePath: workspace.selected_path,
    filePath: artifact.path,
  });

  return file.content;
}

function matchReportArtifact(relativePath: string, candidates: string[]): boolean {
  return candidates.some((candidate) => relativePath === candidate);
}

function upsertSimulationReport(
  reports: CoreSimulationReport[],
  report: CoreSimulationReport,
): CoreSimulationReport[] {
  const nextReports = reports.filter((candidate) => candidate.scenario !== report.scenario);
  return [...nextReports, report];
}

function createDataProductRecords({
  entityIndex,
  bridgeProducts,
  relationshipManifest,
  coverageSummary,
  simulationReports,
}: {
  entityIndex: CoreEntityIndex | null;
  bridgeProducts: BridgeProductDetail[];
  relationshipManifest: CoreRelationshipManifest | null;
  coverageSummary: CoreCoverageSummary | null;
  simulationReports: CoreSimulationReport[];
}): DataProductRecord[] {
  const entitiesById = new Map<string, DomainEntitySummary>();
  const bridgeById = new Map(bridgeProducts.map((product) => [product.id, product]));
  const ids = new Set<string>();

  for (const entity of entityIndex?.entities ?? []) {
    if (entity.domain !== DATA_PRODUCTS_DOMAIN_ID) {
      continue;
    }

    const summary = toDomainEntitySummary(entity);
    entitiesById.set(entity.id, summary);
    ids.add(entity.id);
  }

  for (const product of bridgeProducts) {
    ids.add(product.id);
  }

  const relationships = relationshipManifest?.relationships ?? [];
  const coverageRecord = coverageSummary?.entity_coverage[DATA_PRODUCTS_DOMAIN_ID] ?? null;
  const evidenceRecords = simulationReports.flatMap((report) => report.data_flow_evidence);

  return [...ids].sort().map((id) => {
    const entity = entitiesById.get(id) ?? null;
    const bridge = bridgeById.get(id) ?? null;
    const productRelationships = relationships.filter(
      (relationship) =>
        (relationship.from.domain === DATA_PRODUCTS_DOMAIN_ID && relationship.from.id === id) ||
        (relationship.to.domain === DATA_PRODUCTS_DOMAIN_ID && relationship.to.id === id),
    );
    const producerRelationships = productRelationships.filter(
      (relationship) => relationship.relationship_type.startsWith("data_product_produced_by"),
    );
    const downlinkRelationships = productRelationships.filter(
      (relationship) => relationship.relationship_type === "downlink_flow_includes_data_product",
    );
    const productEvidenceRecords = evidenceRecords.filter((record) => record.data_product_id === id);

    return {
      id,
      displayName: entity?.displayName ?? bridge?.id ?? id,
      entity,
      bridge,
      sourceFile: entity?.sourceFile ?? "not reported",
      producer: bridge?.producer ?? producerRelationships[0]?.to.id ?? null,
      producerType: bridge?.producerType ?? producerRelationships[0]?.to.domain ?? null,
      relationships: productRelationships,
      producerRelationships,
      downlinkRelationships,
      evidenceRecords: productEvidenceRecords,
      coverageState: getProductCoverageState(coverageRecord, id),
      present: entity?.present ?? true,
    };
  });
}

function filterProducts(
  products: DataProductRecord[],
  query: string,
  statusFilter: "all" | ProductCoverageState,
): DataProductRecord[] {
  const normalizedQuery = query.trim().toLowerCase();

  return products.filter((product) => {
    const matchesQuery = !normalizedQuery ||
      product.id.toLowerCase().includes(normalizedQuery) ||
      (product.bridge?.producer ?? "").toLowerCase().includes(normalizedQuery) ||
      (product.bridge?.productType ?? "").toLowerCase().includes(normalizedQuery);
    const matchesStatus = statusFilter === "all" || product.coverageState === statusFilter;

    return matchesQuery && matchesStatus;
  });
}

function createSummaryCards({
  products,
  dataProductsCoverage,
  scenarioRunIndex,
  simulationReports,
  bridgeArtifacts,
}: {
  products: DataProductRecord[];
  dataProductsCoverage: CoreCoverageRecord | null;
  scenarioRunIndex: CoreScenarioRunIndex | null;
  simulationReports: CoreSimulationReport[];
  bridgeArtifacts: GeneratedArtifactEntry[];
}): SummaryCard[] {
  const producers = new Set(products.map((product) => product.producer).filter(isNonEmptyString));
  const dataFlowEvidenceCount = products.reduce((total, product) => total + product.evidenceRecords.length, 0);
  const passedRuns = scenarioRunIndex?.summary.passed ?? simulationReports.filter((report) => report.result === "passed").length;

  return [
    {
      label: "Data products",
      value: String(products.length),
      detail: "defined",
      icon: "▧",
      tone: "model",
    },
    {
      label: "Producers",
      value: String(producers.size),
      detail: "unique",
      icon: "◌",
      tone: "model",
    },
    {
      label: "Entity coverage",
      value: dataProductsCoverage ? `${dataProductsCoverage.covered} / ${dataProductsCoverage.total}` : "not reported",
      detail: dataProductsCoverage ? "covered" : "Core coverage missing",
      icon: "◎",
      tone: "core",
    },
    {
      label: "Scenario runs",
      value: String(passedRuns),
      detail: "passed",
      icon: "◈",
      tone: "core",
    },
    {
      label: "Data-flow evidence",
      value: String(dataFlowEvidenceCount),
      detail: "records",
      icon: "⌁",
      tone: "core",
    },
    {
      label: "Bridge artifacts",
      value: String(bridgeArtifacts.length),
      detail: "linked artifacts",
      icon: "⛓",
      tone: "bridge",
    },
  ];
}

function createEvidenceRoute(product: DataProductRecord | null): Array<{
  kind: "command" | "product" | "flow" | "contact";
  label: string;
  value: string;
}> {
  if (!product) {
    return [];
  }

  const firstEvidence = product.evidenceRecords[0] ?? null;
  const flowFromRelationship = product.downlinkRelationships[0]?.from.id ?? null;
  const firstFlow = firstEvidence?.eligible_downlink_flows?.[0] ?? flowFromRelationship;
  const firstContact = firstEvidence?.contact_windows?.[0] ?? null;
  const nodes: Array<{ kind: "command" | "product" | "flow" | "contact"; label: string; value: string }> = [];

  if (firstEvidence?.triggered_by_command) {
    nodes.push({ kind: "command", label: "Command", value: firstEvidence.triggered_by_command });
  }

  nodes.push({ kind: "product", label: "Data Product", value: product.id });

  if (firstFlow) {
    nodes.push({ kind: "flow", label: "Downlink Flow", value: firstFlow });
  }

  if (firstContact) {
    nodes.push({ kind: "contact", label: "Contact Window", value: firstContact });
  }

  return nodes;
}

function createRelationshipCoverageRows(
  relationshipManifest: CoreRelationshipManifest | null,
  coverageSummary: CoreCoverageSummary | null,
): RelationshipCoverageRow[] {
  const dataProductRelationshipTypes = (relationshipManifest?.relationship_types ?? [])
    .filter(
      (relationshipType) =>
        relationshipType.from_domain === DATA_PRODUCTS_DOMAIN_ID ||
        relationshipType.to_domain === DATA_PRODUCTS_DOMAIN_ID,
    )
    .map((relationshipType) => relationshipType.relationship_type);
  const ids = dataProductRelationshipTypes.length > 0
    ? dataProductRelationshipTypes
    : [
        "data_product_produced_by_payload",
        "data_product_produced_by_subsystem",
        "downlink_flow_includes_data_product",
      ];

  return ids.map((id) => {
    const coverage = coverageSummary?.relationship_coverage.by_type[id] ?? null;

    return {
      id,
      label: id,
      covered: coverage?.covered ?? 0,
      total: coverage?.total ?? 0,
      ratio: coverage?.coverage_ratio ?? null,
      state: coverage ? "reported" : "not-reported",
      raw: coverage,
    };
  });
}

function getBridgeArtifacts(inventory: GeneratedArtifactInventory | null): GeneratedArtifactEntry[] {
  const artifacts = inventory?.artifacts ?? [];

  return preferredBridgeArtifactPaths
    .map((relativePath) => artifacts.find((artifact) => artifact.relative_path === relativePath) ?? null)
    .filter((artifact): artifact is GeneratedArtifactEntry => Boolean(artifact));
}

function getProductCoverageState(
  coverageRecord: CoreCoverageRecord | null,
  productId: string,
): ProductCoverageState {
  if (!coverageRecord) {
    return "not-reported";
  }

  if (coverageRecord.covered_ids.includes(productId)) {
    return "covered";
  }

  if (coverageRecord.uncovered_ids.includes(productId)) {
    return "uncovered";
  }

  return "not-reported";
}

function createSelectedJsonPayload(product: DataProductRecord) {
  const evidence = product.evidenceRecords[0] ?? null;

  if (evidence) {
    return {
      data_product_id: evidence.data_product_id ?? product.id,
      producer: evidence.producer ?? product.producer ?? undefined,
      producer_type: evidence.producer_type ?? product.producerType ?? undefined,
      triggered_by_command: evidence.triggered_by_command,
      eligible_downlink_flows: evidence.eligible_downlink_flows,
      contact_windows: evidence.contact_windows,
    };
  }

  return {
    id: product.id,
    domain: DATA_PRODUCTS_DOMAIN_ID,
    source_file: product.sourceFile,
    coverage: product.coverageState,
    bridge_detail: product.bridge ?? undefined,
  };
}

function parseBridgeProducts(content: string, sourceArtifact: string): BridgeProductDetail[] {
  try {
    const parsed: unknown = JSON.parse(content);
    const contract = getRecordValue(parsed, "contract");
    const dataProducts = getArrayValue(contract, "data_products");

    return dataProducts.flatMap((entry) => {
      const product = toBridgeProductDetail(entry, sourceArtifact);
      return product ? [product] : [];
    });
  } catch {
    return [];
  }
}

function toBridgeProductDetail(value: unknown, sourceArtifact: string): BridgeProductDetail | null {
  if (!isRecord(value)) {
    return null;
  }

  const metadata = getRecordValue(value, "metadata");
  const storage = getRecordValue(value, "storage");
  const downlink = getRecordValue(value, "downlink");
  const id = getStringValue(value, "model_id") ?? getStringValue(value, "id");

  if (!id) {
    return null;
  }

  return {
    id,
    producer: getStringValue(value, "producer") ?? getStringValue(metadata, "producer"),
    producerType: getStringValue(value, "producer_type") ?? getStringValue(metadata, "producer_type"),
    productType: getStringValue(value, "type") ?? getStringValue(metadata, "type"),
    estimatedSizeBytes: getNumberValue(value, "estimated_size_bytes") ?? getNumberValue(metadata, "estimated_size_bytes"),
    priority: getStringValue(value, "priority") ?? getStringValue(metadata, "priority"),
    storageClass: getStringValue(storage, "class") ?? getStringValue(metadata, "storage_policy"),
    storageRetention: getStringValue(storage, "retention"),
    storageOverflowPolicy: getStringValue(storage, "overflow_policy"),
    downlinkPolicy: getStringValue(downlink, "policy") ?? getStringValue(metadata, "downlink_policy"),
    description: getStringValue(value, "description"),
    sourceArtifact,
    raw: value,
  };
}

function mergeBridgeProduct(left: BridgeProductDetail, right: BridgeProductDetail): BridgeProductDetail {
  return {
    id: left.id,
    producer: left.producer ?? right.producer,
    producerType: left.producerType ?? right.producerType,
    productType: left.productType ?? right.productType,
    estimatedSizeBytes: left.estimatedSizeBytes ?? right.estimatedSizeBytes,
    priority: left.priority ?? right.priority,
    storageClass: left.storageClass ?? right.storageClass,
    storageRetention: left.storageRetention ?? right.storageRetention,
    storageOverflowPolicy: left.storageOverflowPolicy ?? right.storageOverflowPolicy,
    downlinkPolicy: left.downlinkPolicy ?? right.downlinkPolicy,
    description: left.description ?? right.description,
    sourceArtifact: left.sourceArtifact,
    raw: left.raw,
  };
}

function findDataProductsSourceEntry(workspace: WorkspaceInspection): ProjectEntry | null {
  return workspace.source_model_files.find((entry) => entry.name === "data_products.yaml") ?? null;
}

function findScenarioForEvidence(
  reports: CoreSimulationReport[],
  evidence: CoreSimulationDataFlowEvidenceRecord,
): string {
  return reports.find((report) => report.data_flow_evidence.some((candidate) => candidate === evidence))?.scenario ?? "not reported";
}

function collectEvidenceStringValues(
  evidenceRecords: CoreSimulationDataFlowEvidenceRecord[],
  key: "eligible_downlink_flows" | "contact_windows",
): string[] {
  return [...new Set(evidenceRecords.flatMap((record) => record[key] ?? []))];
}

function toDomainEntitySummary(entity: CoreEntityIndexEntity): DomainEntitySummary {
  return {
    id: entity.id,
    domain: entity.domain,
    entityType: entity.entity_type,
    displayName: entity.display_name,
    sourceFile: entity.source_file,
    provenance: entity.provenance,
    requiredDomain: entity.required_domain,
    present: entity.present,
    raw: entity,
  };
}

function formatMissionIdentity(
  modelSummary: CoreModelSummary | null,
  entityIndex: CoreEntityIndex | null,
): string {
  const mission = modelSummary?.mission ?? entityIndex?.mission ?? null;

  return mission ? `Mission: ${mission.id}` : "Mission: not reported";
}

function formatProducer(product: DataProductRecord): string {
  if (!product.producer) {
    return "not reported";
  }

  return product.producerType ? `${product.producer} (${product.producerType})` : product.producer;
}

function formatStorageIntent(detail: BridgeProductDetail | null): string {
  if (!detail) {
    return "not reported";
  }

  return [
    detail.storageClass ? `class ${detail.storageClass}` : null,
    detail.storageRetention ? `retention ${detail.storageRetention}` : null,
    detail.storageOverflowPolicy ? `overflow ${detail.storageOverflowPolicy}` : null,
  ].filter(Boolean).join(", ") || "not reported";
}

function formatDownlinkIntent(detail: BridgeProductDetail | null): string {
  return detail?.downlinkPolicy ? `policy ${detail.downlinkPolicy}` : "not reported";
}

function formatPrimaryRelationship(product: DataProductRecord): string {
  const relationship = product.producerRelationships[0];

  if (!relationship) {
    return "not reported";
  }

  return `${relationship.relationship_type}: ${relationship.to.domain}:${relationship.to.id}`;
}

function formatCoverageSummary(record: CoreCoverageRecord | null): string {
  return record ? `${record.covered} / ${record.total} covered` : "not reported";
}

function formatBytes(value: number | null | undefined): string {
  return typeof value === "number" ? `${value} B` : "not reported";
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function formatCaughtError(caught: unknown): string {
  return caught instanceof Error ? caught.message : String(caught);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getRecordValue(value: unknown, key: string): Record<string, unknown> | null {
  if (!isRecord(value)) {
    return null;
  }

  const candidate = value[key];
  return isRecord(candidate) ? candidate : null;
}

function getArrayValue(value: unknown, key: string): unknown[] {
  if (!isRecord(value)) {
    return [];
  }

  const candidate = value[key];
  return Array.isArray(candidate) ? candidate : [];
}

function getStringValue(value: unknown, key: string): string | null {
  if (!isRecord(value)) {
    return null;
  }

  const candidate = value[key];
  return typeof candidate === "string" && candidate.trim() ? candidate : null;
}

function getNumberValue(value: unknown, key: string): number | null {
  if (!isRecord(value)) {
    return null;
  }

  const candidate = value[key];
  return typeof candidate === "number" ? candidate : null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeToken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unknown";
}
