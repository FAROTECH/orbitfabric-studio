import { useEffect, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";

import type {
  AdapterLifecycleReadModel,
  ExactAdapterReleaseIdentity,
  InstalledAdapterLifecycleView,
  LifecycleObservation,
} from "../../convergence/adapterLifecycleReadModel";
import type {
  AdapterVerificationReport,
  VerificationDimension,
} from "../../convergence/adapterLifecycleContracts";

export function AdapterLifecyclePanel({
  model,
  disabled,
  onRefresh,
  onCheckProjectLock,
  onSelectCatalogRelease,
}: {
  model: AdapterLifecycleReadModel;
  disabled: boolean;
  onRefresh: () => Promise<void>;
  onCheckProjectLock: (path: string) => Promise<void>;
  onSelectCatalogRelease: (
    catalogPath: string,
    sourceCoordinate: string,
    releaseVersion: string,
  ) => Promise<void>;
}) {
  const [catalogPath, setCatalogPath] = useState<string | null>(null);
  const [catalogTargetKey, setCatalogTargetKey] = useState<string>(
    model.exactReleaseChoices[0]?.key ?? "",
  );

  useEffect(() => {
    if (model.exactReleaseChoices.some((identity) => identity.key === catalogTargetKey)) return;
    setCatalogTargetKey(model.exactReleaseChoices[0]?.key ?? "");
  }, [catalogTargetKey, model.exactReleaseChoices]);

  const catalogTarget = model.exactReleaseChoices.find(
    (identity) => identity.key === catalogTargetKey,
  ) ?? null;

  async function chooseProjectLock() {
    const path = await open({
      multiple: false,
      directory: false,
      title: "Read Adapter Project Lock",
      filters: [{ name: "Adapter Project Lock", extensions: ["json"] }],
    });
    if (typeof path === "string") await onCheckProjectLock(path);
  }

  async function chooseCatalog() {
    if (!catalogTarget) return;
    const path = await open({
      multiple: false,
      directory: false,
      title: "Read exact release from Adapter Catalog",
      filters: [{ name: "Adapter Catalog", extensions: ["json"] }],
    });
    if (typeof path !== "string") return;
    setCatalogPath(path);
    await onSelectCatalogRelease(
      path,
      catalogTarget.sourceCoordinateText,
      catalogTarget.releaseVersion,
    );
  }

  async function rereadCatalog() {
    if (!catalogPath || !catalogTarget) return;
    await onSelectCatalogRelease(
      catalogPath,
      catalogTarget.sourceCoordinateText,
      catalogTarget.releaseVersion,
    );
  }

  const inventoryBusy = model.inventory.availability === "pending" || model.inventory.refreshing;
  const lockBusy = model.projectLock.availability === "pending" || model.projectLock.refreshing;
  const catalogBusy = model.catalog.availability === "pending" || model.catalog.refreshing;

  return (
    <section className="adapter-lifecycle" aria-labelledby="adapter-lifecycle-title">
      <div className="adapter-lifecycle-heading">
        <div>
          <span className="section-kicker">Adapter understanding</span>
          <h2 id="adapter-lifecycle-title">Lifecycle</h2>
          <p>
            Exact installed, desired and Catalog facts are read from their owning contracts.
            Studio correlates them for this Mission generation without changing their meaning.
          </p>
        </div>
        <button
          className="secondary-action"
          type="button"
          disabled={disabled || inventoryBusy}
          onClick={() => void onRefresh()}
        >
          {inventoryBusy ? "Reading installed state…" : "Refresh installed state"}
        </button>
      </div>

      <LifecycleFailure label="Installed Adapter State" observation={model.inventory} />

      <div className="lifecycle-lane-heading">
        <div>
          <span className="lifecycle-lane-label">INSTALLED</span>
          <strong>What actually exists</strong>
        </div>
        <span className="status-pill">
          {model.inventory.availability === "available"
            ? `${model.installed.length} instance${model.installed.length === 1 ? "" : "s"}`
            : model.inventory.availability}
        </span>
      </div>

      {model.inventory.availability === "available" && model.installed.length === 0 ? (
        <p className="integration-empty">Core reports no installed adapter instances.</p>
      ) : null}
      <div className="lifecycle-instance-list">
        {model.installed.map((instance) => (
          <InstalledInstance key={instance.installed.instanceId} instance={instance} />
        ))}
      </div>

      <section className="lifecycle-lane">
        <div className="lifecycle-lane-heading">
          <div>
            <span className="lifecycle-lane-label">DESIRED + COMPARISON</span>
            <strong>Project Lock requirements and Core result</strong>
          </div>
          <button
            className="secondary-action"
            type="button"
            disabled={disabled || lockBusy}
            onClick={() => void chooseProjectLock()}
          >
            {lockBusy ? "Reading Project Lock…" : "Read Project Lock"}
          </button>
        </div>
        <LifecycleFailure label="Project Lock" observation={model.projectLock} />
        {model.projectLock.value ? (
          <>
            <div className="lifecycle-contract-summary">
              <ExactFact label="Lock path" value={model.projectLock.value.lockPath} />
              <ExactFact label="Lock contract" value={model.projectLock.value.lockVersion} />
              <ExactFact label="Core project result" value={model.projectLock.value.status} />
            </div>
            <div className="lifecycle-desired-list">
              {model.desired.map(({ identity, comparison }) => (
                <article className="lifecycle-desired-row" key={identity.key}>
                  <div>
                    <span className="lifecycle-lane-label">DESIRED</span>
                    <code title={identity.display}>{identity.display}</code>
                  </div>
                  <LifecycleStatus value={comparison.status} />
                  <div className="lifecycle-comparison-detail">
                    <span>matching instances: {comparison.matchingInstanceIds.join(", ") || "none"}</span>
                    <span>candidate instances: {comparison.candidateInstanceIds.join(", ") || "none"}</span>
                    {comparison.candidateMismatches.map((mismatch) => (
                      <span key={mismatch.instanceId}>
                        {mismatch.instanceId}: {mismatch.dimensions.join(", ")}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <p className="integration-empty">
            No Project Lock comparison is loaded. Installed state remains independently available.
          </p>
        )}
      </section>

      <section className="lifecycle-lane">
        <div className="lifecycle-lane-heading">
          <div>
            <span className="lifecycle-lane-label">AVAILABLE + PROVENANCE</span>
            <strong>One exact release selected through Core Catalog semantics</strong>
          </div>
          <button
            className="secondary-action"
            type="button"
            disabled={disabled || catalogBusy || !catalogTarget}
            onClick={() => void (catalogPath ? rereadCatalog() : chooseCatalog())}
          >
            {catalogBusy ? "Reading Catalog…" : catalogPath ? "Read exact release" : "Choose Catalog"}
          </button>
        </div>
        <label className="lifecycle-catalog-target">
          Exact release identity
          <select
            value={catalogTargetKey}
            disabled={disabled || catalogBusy || model.exactReleaseChoices.length === 0}
            onChange={(event) => setCatalogTargetKey(event.target.value)}
          >
            {model.exactReleaseChoices.map((identity) => (
              <option key={identity.key} value={identity.key}>{identity.display}</option>
            ))}
          </select>
        </label>
        {catalogPath ? (
          <button className="lifecycle-path-button" type="button" onClick={() => void chooseCatalog()}>
            <span>Catalog file</span>
            <code title={catalogPath}>{catalogPath}</code>
          </button>
        ) : null}
        <LifecycleFailure label="Catalog exact selection" observation={model.catalog} />
        {model.catalog.value && model.catalogIdentity ? (
          <div className="lifecycle-catalog-result">
            <div className="lifecycle-contract-summary">
              <ExactFact label="AVAILABLE exact identity" value={model.catalogIdentity.display} />
              <ExactFact
                label="Release descriptor digest"
                value={`${model.catalog.value.releaseDescriptorDigest.algorithm}:${model.catalog.value.releaseDescriptorDigest.value}`}
              />
            </div>
            <div className="lifecycle-provider-list">
              {model.catalog.value.sources.map((source) => (
                <article key={`${source.binding.id}\u0000${source.releaseRef}`}>
                  <span className="lifecycle-lane-label">PROVIDER FACT</span>
                  <strong>{source.binding.provider}</strong>
                  <code>{source.binding.id}</code>
                  <code>{source.releaseRef}</code>
                  <details>
                    <summary>Provider configuration</summary>
                    <pre>{JSON.stringify(source.binding.config, null, 2)}</pre>
                  </details>
                </article>
              ))}
            </div>
            <p className="lifecycle-boundary-note">
              Catalog membership means this exact release is available in the selected Catalog.
              It does not imply installation, trust, recommendation, preference or latest status.
            </p>
          </div>
        ) : (
          <p className="integration-empty">
            No exact Catalog release or provider provenance is loaded.
          </p>
        )}
      </section>
    </section>
  );
}

function InstalledInstance({ instance }: { instance: InstalledAdapterLifecycleView }) {
  const record = instance.installed;
  return (
    <article className="lifecycle-instance">
      <header>
        <div>
          <span className="lifecycle-lane-label">INSTALLED EXACT IDENTITY</span>
          <code title={instance.identity.display}>{instance.identity.display}</code>
        </div>
        <span className="status-pill">{record.instanceId}</span>
      </header>

      <div className="lifecycle-contract-summary">
        <ExactFact label="Instance" value={record.instanceId} />
        <ExactFact label="Source Coordinate" value={instance.identity.sourceCoordinateText} />
        <ExactFact label="Release version" value={record.releaseVersion} />
        <ExactFact label="Backend" value={record.backendId} />
      </div>

      <section className="lifecycle-dimension-block">
        <div className="lifecycle-subheading">
          <span className="lifecycle-lane-label">VERIFICATION</span>
          <strong>Independent Core dimensions</strong>
        </div>
        <Verification observation={instance.verification} />
      </section>

      <section className="lifecycle-dimension-block">
        <div className="lifecycle-subheading">
          <span className="lifecycle-lane-label">COMPARISON</span>
          <strong>Core Project Lock references to this instance</strong>
        </div>
        {instance.desiredComparisons.length ? (
          <div className="lifecycle-inline-statuses">
            {instance.desiredComparisons.map((comparison) => {
              const identity = `${comparison.sourceCoordinate.authority}:${comparison.sourceCoordinate.publisher}/${comparison.sourceCoordinate.name}@${comparison.releaseVersion}`;
              return (
                <div key={identity}>
                  <code>{identity}</code>
                  <LifecycleStatus value={comparison.status} />
                </div>
              );
            })}
          </div>
        ) : (
          <span className="integration-muted">No loaded Core comparison references this instance.</span>
        )}
      </section>

      <section className="lifecycle-dimension-block">
        <div className="lifecycle-subheading">
          <span className="lifecycle-lane-label">OPERATIONS</span>
          <strong>Exact digest-bound Integration Package</strong>
        </div>
        <LifecycleFailure label="Integration Package binding" observation={instance.packageBinding} />
        {instance.packageBinding.value ? (
          <>
            <div className="lifecycle-contract-summary">
              <ExactFact label="Manifest SHA-256" value={instance.packageBinding.value.manifestSha256} />
              <ExactFact label="Integration" value={instance.packageBinding.value.descriptor.integrationId} />
              <ExactFact
                label="Adapter declaration"
                value={`${instance.packageBinding.value.descriptor.adapterId}@${instance.packageBinding.value.descriptor.adapterVersion}`}
              />
              <ExactFact label="Protocol" value={instance.packageBinding.value.descriptor.execution.protocol} />
            </div>
            {instance.operations.length ? (
              <div className="lifecycle-operation-list">
                {instance.operations.map((operation) => (
                  <div key={operation.id}>
                    <code>{operation.id}</code>
                    <span>{operation.capabilities.join(", ") || "no advertised capabilities"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="integration-muted">The bound package advertises no operations.</span>
            )}
          </>
        ) : null}
      </section>

      <details className="lifecycle-provenance">
        <summary>Installed provenance and exact digests</summary>
        <div className="lifecycle-contract-summary">
          <ExactFact label="Release descriptor" value={record.releaseDescriptorPath} />
          <ExactFact label="Descriptor SHA-256" value={record.releaseDescriptorSha256} />
          <ExactFact label="Artifact" value={record.artifactId} />
          <ExactFact label="Artifact SHA-256" value={record.artifactSha256} />
          <ExactFact label="Install root" value={record.installRoot} />
          <ExactFact label="Manifest" value={record.manifestPath} />
          <ExactFact label="Acceptance policy" value={record.acceptancePolicy} />
          <ExactFact
            label="Acceptance warnings"
            value={record.acceptanceWarnings.join("; ") || "none"}
          />
        </div>
      </details>
    </article>
  );
}

function Verification({
  observation,
}: {
  observation: LifecycleObservation<AdapterVerificationReport>;
}) {
  const report = observation.value;
  if (!report) {
    return (
      <>
        <LifecycleFailure label="Verification" observation={observation} />
        {observation.availability === "unavailable" ? (
          <span className="integration-muted">Verification has not been observed.</span>
        ) : null}
      </>
    );
  }
  const dimensions: Array<[string, VerificationDimension]> = [
    ["Release descriptor integrity", report.releaseDescriptorIntegrity],
    ["Manifest integrity", report.manifestIntegrity],
    ["Manifest conformance", report.manifestConformance],
    ["Execution binding", report.executionBinding],
    ["Backend materialization", report.backendMaterialization],
  ];
  return (
    <>
      <LifecycleFailure label="Verification refresh" observation={observation} />
      <div className="lifecycle-verification-grid">
        {dimensions.map(([label, dimension]) => (
          <div key={label}>
            <span>{label}</span>
            <LifecycleStatus value={dimension.status} />
            {dimension.detail ? <small>{dimension.detail}</small> : null}
          </div>
        ))}
      </div>
    </>
  );
}

function LifecycleFailure<T>({
  label,
  observation,
}: {
  label: string;
  observation: LifecycleObservation<T>;
}) {
  if (!observation.failure) return null;
  return (
    <p className="lifecycle-observation-failure" role="status">
      <strong>{label} {observation.value ? "refresh failed" : "unavailable"}</strong>
      <span>{observation.failure.message}</span>
      <small>{observation.failure.class} observation failure</small>
      {observation.value ? <small>The last accepted observation remains visible.</small> : null}
    </p>
  );
}

function LifecycleStatus({ value }: { value: string }) {
  return (
    <span className={`lifecycle-status lifecycle-status-${value.toLowerCase().replaceAll("_", "-")}`}>
      {value}
    </span>
  );
}

function ExactFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="lifecycle-fact">
      <small>{label}</small>
      <code title={value}>{value}</code>
    </div>
  );
}
