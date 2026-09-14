import {
  coreConfigurationState,
  DEFAULT_CORE_EXECUTABLE,
} from "../../core/coreCompatibility";
import type { MissionSession } from "../../mission/MissionSession";

export function CoreProvenance({
  session,
  configuredExecutable,
  onConfiguredExecutableChange,
}: {
  session: MissionSession;
  configuredExecutable: string;
  onConfiguredExecutableChange: (value: string) => void;
}) {
  const configurationState = coreConfigurationState(
    session.core.configuredExecutable,
    configuredExecutable,
    session.core.compatibility.state,
  );

  return (
    <details className="core-provenance">
      <summary title={session.core.resolvedExecutable}>
        Core {session.core.orbitfabricVersion}
        <span className={`core-state core-state-${configurationState}`}>
          {stateLabel(configurationState)}
        </span>
      </summary>
      <div className="core-provenance-panel">
        <h2>Core provenance</h2>
        <ProvenanceValue label="Configured for session" value={session.core.configuredExecutable} />
        <ProvenanceValue label="Resolved launch executable" value={session.core.resolvedExecutable} />
        <ProvenanceValue label="Product version" value={session.core.orbitfabricVersion} />
        <ProvenanceValue label="Interface version" value={session.core.interfaceVersion} />
        <ProvenanceValue label="Interface SHA-256" value={session.core.interfaceSha256} />

        <div className="core-provenance-requirements">
          <strong>Studio requirements</strong>
          {Object.entries(session.core.compatibility.domains).map(([domain, result]) => (
            <div className="core-domain-state" key={domain}>
              <span>{domain}</span>
              <code>{result.state}</code>
            </div>
          ))}
          {session.core.compatibility.findings.map((finding) => (
            <p key={`${finding.domain}:${finding.capabilityId}`}>
              {finding.domain}: {finding.capabilityId} — {finding.reason}
            </p>
          ))}
        </div>

        <label className="core-next-configuration">
          Configured executable for next generation
          <span>
            <input
              value={configuredExecutable}
              onChange={(event) => onConfiguredExecutableChange(event.target.value)}
              spellCheck={false}
              autoCapitalize="off"
            />
            <button
              type="button"
              className="secondary-action"
              onClick={() => onConfiguredExecutableChange(DEFAULT_CORE_EXECUTABLE)}
            >
              Reset
            </button>
          </span>
        </label>
        {configurationState === "configuration_changed" ? (
          <p className="core-configuration-pending">
            Configuration changed. Refresh or open a mission to create a new authoritative
            generation. This session continues using its resolved executable.
          </p>
        ) : null}
      </div>
    </details>
  );
}

function ProvenanceValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="core-provenance-value">
      <span>{label}</span>
      <code title={value}>{value}</code>
    </div>
  );
}

function stateLabel(state: string): string {
  if (state === "configuration_changed") return "pending config";
  if (state === "compatible") return "compatible";
  return "partial";
}
