import { DashboardIcon } from "./DashboardIcon";
import { ProvenanceBadge, StatusBadge } from "./Badges";
import { InspectorField, formatInspectorPath } from "./InspectorField";
import type { ActiveSurface } from "./navigationModel";
import type { DomainEntitySummary } from "./domainSurfaceModel";
import type { GeneratedArtifactInspectorItem } from "./GeneratedArtifactExplorer";
import type { CoreCommandResult, FileContent, WorkspaceInspection } from "./types/workspace";

type SimulationInspectorRecordKind =
  | "timeline"
  | "event"
  | "command"
  | "modeTransition"
  | "dataFlowEvidence"
  | "failedExpectation";

export interface SimulationInspectorRecord {
  kind: SimulationInspectorRecordKind;
  title: string;
  record: unknown;
}

type StudioDetailKind =
  | "workspace"
  | "source-file"
  | "generated-artifact"
  | "simulation-record"
  | "core-entity"
  | "core-output";

export interface StudioDetailSelection {
  kind: StudioDetailKind;
  title: string;
  source: string;
}

export function InspectorPanel({
  workspace,
  activeSurface,
  selectedFile,
  selectedGeneratedArtifact,
  selectedSimulationRecord,
  selectedCoreDomainEntity,
  selectedDetail,
  coreResult,
  formatDashboardStatusLabel,
  formatUnknownBlock,
}: {
  workspace: WorkspaceInspection | null;
  activeSurface: ActiveSurface;
  selectedFile: FileContent | null;
  selectedGeneratedArtifact: GeneratedArtifactInspectorItem | null;
  selectedSimulationRecord: SimulationInspectorRecord | null;
  selectedCoreDomainEntity: DomainEntitySummary | null;
  selectedDetail: StudioDetailSelection | null;
  coreResult: CoreCommandResult | null;
  formatDashboardStatusLabel: (value: string | null) => string;
  formatUnknownBlock: (value: unknown) => string;
}) {
  const hasSelection = Boolean(
    selectedFile ||
      selectedGeneratedArtifact ||
      selectedSimulationRecord ||
      selectedCoreDomainEntity ||
      selectedDetail,
  );
  const selectedFileIsScenarioSource = Boolean(
    selectedFile &&
      workspace?.scenario_files.some((entry) => entry.path === selectedFile.path),
  );

  const selectedTitle =
    selectedSimulationRecord?.title ??
    selectedGeneratedArtifact?.name ??
    selectedCoreDomainEntity?.displayName ??
    selectedCoreDomainEntity?.id ??
    selectedFile?.name ??
    selectedDetail?.title ??
    "No selected context";

  const selectedKind =
    selectedSimulationRecord?.kind ??
    selectedGeneratedArtifact?.artifactClass ??
    (selectedCoreDomainEntity
      ? "core entity"
      : selectedFileIsScenarioSource
        ? "scenario source"
        : selectedFile
          ? "source file"
          : selectedDetail?.kind ?? "not selected");

  const selectedSource =
    selectedGeneratedArtifact?.relativePath ??
    selectedFile?.path ??
    selectedDetail?.source ??
    "not available";
  const showInspectorSafetyBoundary =
    !workspace || activeSurface !== "mission-dashboard";

  return (
    <aside className="contextual-inspector workbench-inspector" aria-label="Contextual inspector">
      <div className="inspector-hero">
        <div className="inspector-hero-title">
          <DashboardIcon kind="evidence" />
          <div>
            <span className="cockpit-eyebrow">Inspector</span>
            <h2>Detail panel</h2>
          </div>
        </div>
        <div className="badge-row inspector-badge-row">
          <ProvenanceBadge label="READ-ONLY" />
          <StatusBadge label={hasSelection ? "REPORTED" : "UNAVAILABLE"} />
        </div>
      </div>

      <section className="inspector-object-card" aria-label="Inspector selected context">
        <div className="inspector-object-title">
          <div>
            <span className="cockpit-eyebrow">Selected context</span>
            <h3>{selectedTitle}</h3>
          </div>
          <StatusBadge label={formatDashboardStatusLabel(hasSelection ? selectedKind : null)} />
        </div>

        <div className="inspector-property-grid">
          <InspectorField label="Kind" value={selectedKind} />
          <InspectorField label="Source" value={formatInspectorPath(selectedSource)} title={selectedSource} />
        </div>
      </section>

      <section className="inspector-section-modern">
        <div className="inspector-section-heading">
          <h3>Workspace</h3>
          <StatusBadge label={workspace ? "OPEN" : "UNAVAILABLE"} />
        </div>

        <div className="inspector-property-grid">
          <InspectorField label="Status" value={workspace ? "open" : "not selected"} />
          <InspectorField
            label="Path"
            value={formatInspectorPath(workspace?.selected_path)}
            title={workspace?.selected_path}
          />
          <InspectorField
            label="Mission"
            value={formatInspectorPath(workspace?.mission_dir)}
            title={workspace?.mission_dir ?? undefined}
          />
          <InspectorField
            label="Generated"
            value={formatInspectorPath(workspace?.generated_dir)}
            title={workspace?.generated_dir ?? undefined}
          />
        </div>
      </section>

      <section className="inspector-section-modern">
        <div className="inspector-section-heading">
          <h3>Selected object</h3>
          <StatusBadge
            label={
              selectedSimulationRecord
                ? selectedSimulationRecord.kind.toUpperCase()
                : selectedGeneratedArtifact
                  ? selectedGeneratedArtifact.knownStatus
                  : selectedCoreDomainEntity
                    ? selectedCoreDomainEntity.present ? "PRESENT" : "NOT PRESENT"
                    : selectedFile
                      ? "SOURCE"
                      : "UNAVAILABLE"
            }
          />
        </div>

        {selectedSimulationRecord ? (
          <>
            <div className="inspector-status-strip">
              <ProvenanceBadge label="CORE-DERIVED" />
              <ProvenanceBadge label="READ-ONLY" />
            </div>
            <div className="inspector-property-grid">
              <InspectorField label="Title" value={selectedSimulationRecord.title} />
              <InspectorField label="Kind" value={selectedSimulationRecord.kind} />
              <InspectorField label="Source" value="orbitfabric-sim JSON report" />
              <InspectorField label="Inference" value="none" />
            </div>
            <pre className="raw-output-block inspector-raw-block">
              {formatUnknownBlock(selectedSimulationRecord.record)}
            </pre>
          </>
        ) : selectedGeneratedArtifact ? (
          <>
            <div className="inspector-status-strip">
              <ProvenanceBadge label="GENERATED" />
              <StatusBadge
                label={selectedGeneratedArtifact.knownStatus === "known" ? "REPORTED" : "UNKNOWN"}
              />
              <StatusBadge
                label={
                  selectedGeneratedArtifact.previewStatus === "previewable"
                    ? "PREVIEW ONLY"
                    : "UNAVAILABLE"
                }
              />
            </div>
            <div className="inspector-property-grid">
              <InspectorField label="Name" value={selectedGeneratedArtifact.name} />
              <InspectorField label="Class" value={selectedGeneratedArtifact.artifactClass} />
              <InspectorField label="Relative path" value={selectedGeneratedArtifact.relativePath} />
              <InspectorField
                label="Path"
                value={formatInspectorPath(selectedGeneratedArtifact.path)}
                title={selectedGeneratedArtifact.path}
              />
              <InspectorField label="Size" value={`${selectedGeneratedArtifact.sizeBytes} bytes`} />
              <InspectorField label="Extension" value={selectedGeneratedArtifact.extension ?? "none"} />
              <InspectorField label="Provenance" value={selectedGeneratedArtifact.provenanceSource} />
              <InspectorField
                label="Detail"
                value={selectedGeneratedArtifact.provenanceDetail ?? "not reported"}
              />
            </div>
          </>
        ) : selectedCoreDomainEntity ? (
          <>
            <div className="inspector-status-strip">
              <ProvenanceBadge label="CORE-DERIVED" />
              <ProvenanceBadge label="READ-ONLY" />
              <StatusBadge label={selectedCoreDomainEntity.present ? "PRESENT" : "NOT PRESENT"} />
            </div>
            <div className="inspector-property-grid">
              <InspectorField label="ID" value={selectedCoreDomainEntity.id} />
              <InspectorField label="Display name" value={selectedCoreDomainEntity.displayName} />
              <InspectorField label="Domain" value={selectedCoreDomainEntity.domain} />
              <InspectorField label="Type" value={selectedCoreDomainEntity.entityType} />
              <InspectorField label="Source" value="Core entity_index.json" />
              <InspectorField label="Source file" value={selectedCoreDomainEntity.sourceFile} />
              <InspectorField label="Provenance" value={selectedCoreDomainEntity.provenance} />
              <InspectorField
                label="Required domain"
                value={selectedCoreDomainEntity.requiredDomain ? "yes" : "no"}
              />
              <InspectorField label="Inference" value="none" />
            </div>
            <pre className="raw-output-block inspector-raw-block">
              {formatUnknownBlock(selectedCoreDomainEntity.raw)}
            </pre>
          </>
        ) : selectedFile ? (
          <>
            <div className="inspector-status-strip">
              <ProvenanceBadge label="SOURCE" />
              {selectedFileIsScenarioSource ? <StatusBadge label="SCENARIO SOURCE" /> : null}
              <ProvenanceBadge label="READ-ONLY" />
              <ProvenanceBadge label="PREVIEW ONLY" />
            </div>
            <div className="inspector-property-grid">
              <InspectorField label="Name" value={selectedFile.name} />
              <InspectorField
                label="Category"
                value={selectedFileIsScenarioSource ? "scenario source" : "source preview"}
              />
              <InspectorField label="Language" value={selectedFile.language} />
              <InspectorField label="Size" value={`${selectedFile.size_bytes} bytes`} />
              <InspectorField
                label="Path"
                value={formatInspectorPath(selectedFile.path)}
                title={selectedFile.path}
              />
            </div>
          </>
        ) : (
          <p className="inspector-empty-copy">No source or generated artifact selected.</p>
        )}
      </section>

      <section className="inspector-section-modern">
        <div className="inspector-section-heading">
          <h3>Core output</h3>
          <StatusBadge label={coreResult ? (coreResult.success ? "PASS" : "FAIL") : "UNAVAILABLE"} />
        </div>

        {coreResult ? (
          <>
            <div className="inspector-status-strip">
              <ProvenanceBadge label="CORE-DERIVED" />
              {coreResult.json_report_available ? <StatusBadge label="REPORTED" /> : null}
            </div>
            <div className="inspector-property-grid">
              <InspectorField label="Command" value={coreResult.command} />
              <InspectorField label="Args" value={coreResult.args.join(" ") || "none"} />
              <InspectorField label="Exit code" value={String(coreResult.exit_code ?? "not available")} />
              <InspectorField
                label="JSON report"
                value={coreResult.json_report_available ? "available" : "not available"}
              />
              <InspectorField
                label="Report path"
                value={formatInspectorPath(coreResult.json_report_path)}
                title={coreResult.json_report_path ?? undefined}
              />
              <InspectorField
                label="Log"
                value={coreResult.log_available ? "available" : "not available"}
              />
              <InspectorField
                label="Log path"
                value={formatInspectorPath(coreResult.log_path)}
                title={coreResult.log_path ?? undefined}
              />
            </div>
          </>
        ) : (
          <p className="inspector-empty-copy">No Core command result selected.</p>
        )}
      </section>

      {showInspectorSafetyBoundary ? (
        <section className="inspector-section-modern inspector-boundary-section">
          <div className="inspector-section-heading">
            <h3>Safety boundary</h3>
            <DashboardIcon kind="shield" />
          </div>

          <div className="inspector-guardrail-list">
            <span>No editing</span>
            <span>No automatic fixes</span>
            <span>No private relationship inference</span>
            <span>No generated artifact mutation</span>
          </div>
        </section>
      ) : null}
    </aside>
  );
}
