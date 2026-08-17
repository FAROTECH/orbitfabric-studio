import type {
  EntityIndexRecordDto,
  JsonObject,
  JsonValue,
  MissionContractObject,
  RelationshipRecordDto,
} from "../../core/contracts";
import { entityKey, type EntityRef } from "../../mission/entityRef";
import type { MissionSession } from "../../mission/MissionSession";
import { relationshipPresentation } from "../../mission/relationshipPresentation";
import { resolveEntityContract } from "../../mission/resolveEntityContract";
import type { ContextPathStep } from "../../mission/selection";

interface EntityXRayProps {
  session: MissionSession;
  subject: EntityRef;
  contextPath: readonly ContextPathStep[];
  onClose: () => void;
  onFollowRelationship: (step: ContextPathStep) => void;
  onTruncateContextPath: (subject: EntityRef, length: number) => void;
}

export function EntityXRay({
  session,
  subject,
  contextPath,
  onClose,
  onFollowRelationship,
  onTruncateContextPath,
}: EntityXRayProps) {
  const contract = resolveEntityContract(session.snapshot, subject);
  const indexRecord = session.readModel.entityRecordsByKey.get(entityKey(subject));

  return (
    <aside className="entity-xray" aria-label="Entity X-Ray">
      <header className="xray-header">
        <div>
          <p className="eyebrow">Entity X-Ray</p>
          <span className="xray-domain">{humanize(indexRecord?.entity_type ?? subject.domain)}</span>
          <h2>{displayName(indexRecord, contract, subject)}</h2>
          <code>{subject.id}</code>
        </div>
        <button className="icon-action" type="button" onClick={onClose} aria-label="Close Entity X-Ray">
          ×
        </button>
      </header>

      {contextPath.length > 0 ? (
        <ContextPath
          session={session}
          path={contextPath}
          onTruncate={onTruncateContextPath}
        />
      ) : null}

      <div className="xray-scroll">
        {contract ? (
          <>
            <ContractDetails domain={subject.domain} contract={contract} />
            <RelationshipSection
              session={session}
              subject={subject}
              onFollow={onFollowRelationship}
            />
            <Provenance indexRecord={indexRecord} />
          </>
        ) : (
          <section className="xray-section">
            <h3>Contract</h3>
            <p className="muted-copy">
              This entity is indexed by Core, but this Studio build does not yet have a type-aware
              contract resolver for <code>{subject.domain}</code>.
            </p>
          </section>
        )}
      </div>
    </aside>
  );
}

function ContractDetails({
  domain,
  contract,
}: {
  domain: string;
  contract: MissionContractObject;
}) {
  switch (domain) {
    case "subsystems":
      return (
        <ContractSection title="Declared participant">
          <Property label="Type" value={contract.type} />
          <Property label="Criticality" value={contract.criticality} />
          <Description value={contract.description} />
        </ContractSection>
      );

    case "modes":
      return (
        <ContractSection title="Operational mode">
          <Property label="Initial" value={contract.initial} />
          <Description value={contract.description} />
        </ContractSection>
      );

    case "telemetry":
      return (
        <>
          <ContractSection title="Telemetry contract">
            <Property label="Type" value={contract.type} />
            <Property label="Unit" value={contract.unit} />
            <Property label="Source" value={contract.source} code />
            <Property label="Sampling" value={contract.sampling} />
            <Property label="Criticality" value={contract.criticality} />
            <Property label="Persistence" value={contract.persistence} />
            <Property label="Downlink priority" value={contract.downlink_priority} />
            <Property label="Allowed enum values" value={contract.enum} />
            <Description value={contract.description} />
          </ContractSection>
          {isObject(contract.limits) ? (
            <ContractSection title="Declared telemetry limits" note="Limits do not imply fault conditions.">
              <Property label="Warning low" value={contract.limits.warning_low} />
              <Property label="Critical low" value={contract.limits.critical_low} />
              <Property label="Warning high" value={contract.limits.warning_high} />
              <Property label="Critical high" value={contract.limits.critical_high} />
            </ContractSection>
          ) : null}
        </>
      );

    case "commands":
      return (
        <>
          <ContractSection title="Command contract">
            <Property label="Target" value={contract.target} code />
            <Property label="Allowed modes" value={contract.allowed_modes} code />
            <Property label="Acknowledgment" value={contract.requires_ack} />
            <Property label="Timeout" value={milliseconds(contract.timeout_ms)} />
            <Property label="Risk" value={contract.risk} />
            <Description value={contract.description} />
          </ContractSection>
          {contract.preconditions !== null && contract.preconditions !== undefined ? (
            <ContractSection
              title="Declared preconditions"
              note="Displayed as declared. Studio does not parse textual preconditions into relationships."
            >
              <DeclaredValue value={contract.preconditions} />
            </ContractSection>
          ) : null}
          {isNonEmptyObject(contract.expected_effects) ? (
            <ContractSection title="Declared expected effects">
              <DeclaredValue value={contract.expected_effects} />
            </ContractSection>
          ) : null}
        </>
      );

    case "events":
      return (
        <ContractSection title="Event contract">
          <Property label="Source" value={contract.source} code />
          <Property label="Severity" value={contract.severity} />
          <Property label="Persistence" value={contract.persistence} />
          <Property label="Downlink priority" value={contract.downlink_priority} />
          <Description value={contract.description} />
        </ContractSection>
      );

    case "faults":
      return (
        <>
          <ContractSection title="Fault contract">
            <Property label="Source" value={contract.source} code />
            <Property label="Severity" value={contract.severity} />
            <Property label="Emits" value={contract.emits} code />
            <Description value={contract.description} />
          </ContractSection>
          {isObject(contract.condition) ? (
            <ContractSection title="Declared fault condition">
              <Property label="Telemetry" value={contract.condition.telemetry} code />
              <Property label="Event" value={contract.condition.event} code />
              <Property label="Operator" value={contract.condition.operator} />
              <Property label="Value" value={contract.condition.value} />
              <Property label="Debounce samples" value={contract.condition.debounce_samples} />
              <Property label="Occurrences" value={contract.condition.occurrences} />
              <Property label="Window" value={seconds(contract.condition.window_s)} />
            </ContractSection>
          ) : null}
          {isObject(contract.recovery) ? (
            <ContractSection title="Declared recovery">
              <Property label="Target mode" value={contract.recovery.mode_transition} code />
              <Property label="Automatic commands" value={contract.recovery.auto_commands} code />
            </ContractSection>
          ) : null}
        </>
      );

    case "packets":
      return (
        <ContractSection title="Packet contract">
          <Property label="Type" value={contract.type} />
          <Property label="Max payload" value={bytes(contract.max_payload_bytes)} />
          <Property label="Period" value={contract.period} />
          <Property label="Telemetry" value={contract.telemetry} code />
          <Description value={contract.description} />
        </ContractSection>
      );

    case "payloads":
      return (
        <>
          <ContractSection title="Payload contract">
            <Property label="Subsystem" value={contract.subsystem} code />
            <Property label="Profile" value={contract.profile} />
            <Description value={contract.description} />
          </ContractSection>
          {isObject(contract.lifecycle) ? (
            <ContractSection title="Payload lifecycle">
              <Property label="Initial state" value={contract.lifecycle.initial_state} />
              <Property label="States" value={contract.lifecycle.states} />
            </ContractSection>
          ) : null}
        </>
      );

    case "data_products":
      return (
        <>
          <ContractSection title="Data product contract">
            <Property label="Producer" value={contract.producer} code />
            <Property label="Producer type" value={contract.producer_type} />
            <Property label="Product type" value={contract.type} />
            <Property label="Estimated size" value={bytes(contract.estimated_size_bytes)} />
            <Property label="Priority" value={contract.priority} />
            <Description value={contract.description} />
          </ContractSection>
          {isObject(contract.storage) ? (
            <ContractSection
              title="Storage intent"
              note="Storage intent does not imply a physical storage-subsystem path."
            >
              <Property label="Class" value={contract.storage.class} />
              <Property label="Retention" value={contract.storage.retention} />
              <Property label="Overflow policy" value={contract.storage.overflow_policy} />
            </ContractSection>
          ) : null}
          {isObject(contract.downlink) ? (
            <ContractSection title="Downlink intent">
              <Property label="Policy" value={contract.downlink.policy} />
            </ContractSection>
          ) : null}
        </>
      );

    case "contact_profiles":
      return (
        <ContractSection title="Contact profile">
          <Property label="Target" value={contract.target} />
          <Description value={contract.description} />
        </ContractSection>
      );

    case "link_profiles":
      return (
        <ContractSection title="Link profile">
          <Property label="Direction" value={contract.direction} />
          <Property label="Assumed rate" value={bitsPerSecond(contract.assumed_rate_bps)} />
          <Description value={contract.description} />
        </ContractSection>
      );

    case "contact_windows":
      return (
        <ContractSection title="Contact window">
          <Property label="Contact profile" value={contract.contact_profile} code />
          <Property label="Link profile" value={contract.link_profile} code />
          <Property label="Start" value={contract.start} />
          <Property label="Duration" value={seconds(contract.duration_seconds)} />
          <Property label="Assumed capacity" value={bytes(contract.assumed_capacity_bytes)} />
          <Description value={contract.description} />
        </ContractSection>
      );

    case "downlink_flows":
      return (
        <ContractSection title="Downlink flow">
          <Property label="Contact profile" value={contract.contact_profile} code />
          <Property label="Link profile" value={contract.link_profile} code />
          <Property label="Queue policy" value={contract.queue_policy} />
          <Property label="Eligible products" value={contract.eligible_data_products} code />
          <Description value={contract.description} />
        </ContractSection>
      );

    case "command_sources":
      return (
        <ContractSection title="Command source">
          <Property label="Type" value={contract.type} />
          <Property label="Requires contact" value={contract.requires_contact} />
          <Property label="Contact profile" value={contract.contact_profile} code />
          <Description value={contract.description} />
        </ContractSection>
      );

    case "commandability_rules":
      return (
        <>
          <ContractSection title="Commandability rule">
            <Property label="Command" value={contract.command} code />
            <Property label="Sources" value={contract.sources} code />
            <Property label="Allowed modes" value={contract.allowed_modes} code />
            <Property label="Confirmation" value={contract.confirmation} />
            <Property label="Timeout" value={milliseconds(contract.timeout_ms)} />
            <Description value={contract.description} />
          </ContractSection>
          {isNonEmptyObject(contract.expected_effects) ? (
            <ContractSection title="Declared expected effects">
              <DeclaredValue value={contract.expected_effects} />
            </ContractSection>
          ) : null}
        </>
      );

    case "autonomous_actions":
      return (
        <>
          <ContractSection title="Autonomous action">
            <Description value={contract.description} />
          </ContractSection>
          {isObject(contract.trigger) ? (
            <ContractSection title="Declared trigger">
              <Property label="Fault" value={contract.trigger.fault} code />
              <Property label="Event" value={contract.trigger.event} code />
              <Property label="Telemetry" value={contract.trigger.telemetry} code />
              <Property label="Mode" value={contract.trigger.mode} code />
            </ContractSection>
          ) : null}
          {isObject(contract.dispatches) ? (
            <ContractSection title="Declared dispatch">
              <Property label="Command" value={contract.dispatches.command} code />
              <Property label="Source" value={contract.dispatches.source} code />
            </ContractSection>
          ) : null}
        </>
      );

    case "recovery_intents":
      return (
        <ContractSection title="Recovery intent">
          <Property label="Fault" value={contract.fault} code />
          <Property label="Event" value={contract.event} code />
          <Property label="Target mode" value={contract.target_mode} code />
          <Property label="Commands" value={contract.commands} code />
          <Description value={contract.description} />
        </ContractSection>
      );

    default:
      return (
        <ContractSection title="Contract">
          <Description value={contract.description} />
          <p className="muted-copy">
            Type-aware detail for <code>{domain}</code> is not yet part of this build.
          </p>
        </ContractSection>
      );
  }
}

function RelationshipSection({
  session,
  subject,
  onFollow,
}: {
  session: MissionSession;
  subject: EntityRef;
  onFollow: (step: ContextPathStep) => void;
}) {
  if (session.readiness.relationships === "pending") {
    return (
      <section className="xray-section">
        <h3>Relationships</h3>
        <p className="muted-copy">Hydrating explicit Core relationships…</p>
      </section>
    );
  }

  if (session.readiness.relationships === "failed") {
    return (
      <section className="xray-section">
        <h3>Relationships</h3>
        <p className="muted-copy">Relationship surface is unavailable for this session.</p>
      </section>
    );
  }

  const key = entityKey(subject);
  const outgoing = session.readModel.outgoingByEntity.get(key) ?? [];
  const incoming = session.readModel.incomingByEntity.get(key) ?? [];

  if (outgoing.length === 0 && incoming.length === 0) {
    return null;
  }

  return (
    <section className="xray-section">
      <div className="xray-section-heading">
        <h3>Immediate relationships</h3>
        <span>{outgoing.length + incoming.length}</span>
      </div>
      <div className="relationship-list">
        {outgoing.map((relationship) => (
          <RelationshipButton
            key={relationship.relationship_id}
            session={session}
            relationship={relationship}
            direction="forward"
            neighbor={relationship.to}
            onClick={() =>
              onFollow({
                relationshipId: relationship.relationship_id,
                from: subject,
                to: relationship.to,
                direction: "forward",
              })
            }
          />
        ))}
        {incoming.map((relationship) => (
          <RelationshipButton
            key={relationship.relationship_id}
            session={session}
            relationship={relationship}
            direction="inverse"
            neighbor={relationship.from}
            onClick={() =>
              onFollow({
                relationshipId: relationship.relationship_id,
                from: subject,
                to: relationship.from,
                direction: "inverse",
              })
            }
          />
        ))}
      </div>
    </section>
  );
}

function RelationshipButton({
  session,
  relationship,
  direction,
  neighbor,
  onClick,
}: {
  session: MissionSession;
  relationship: RelationshipRecordDto;
  direction: "forward" | "inverse";
  neighbor: EntityRef;
  onClick: () => void;
}) {
  const presentation = relationshipPresentation(relationship.relationship_type);
  const record = session.readModel.entityRecordsByKey.get(entityKey(neighbor));
  const label = presentation
    ? direction === "forward"
      ? presentation.forwardLabel
      : presentation.inverseLabel
    : null;

  return (
    <button className="relationship-row" type="button" onClick={onClick}>
      <span className="relationship-verb">
        {label ?? "Core relationship"}
        {!presentation ? <code>{relationship.relationship_type}</code> : null}
      </span>
      <span className="relationship-target">
        <strong>{record?.display_name ?? neighbor.id}</strong>
        <code>{neighbor.id}</code>
      </span>
      <span aria-hidden="true">→</span>
    </button>
  );
}

function ContextPath({
  session,
  path,
  onTruncate,
}: {
  session: MissionSession;
  path: readonly ContextPathStep[];
  onTruncate: (subject: EntityRef, length: number) => void;
}) {
  const first = path[0]?.from;
  if (!first) {
    return null;
  }

  const nodes = [first, ...path.map((step) => step.to)];

  return (
    <nav className="context-path" aria-label="Context path">
      {nodes.map((node, index) => {
        const record = session.readModel.entityRecordsByKey.get(entityKey(node));
        return (
          <span key={`${entityKey(node)}-${index}`}>
            {index > 0 ? <span className="context-separator">→</span> : null}
            <button
              type="button"
              onClick={() => onTruncate(node, index)}
              title={`${node.domain}:${node.id}`}
            >
              {record?.display_name ?? node.id}
            </button>
          </span>
        );
      })}
    </nav>
  );
}

function Provenance({ indexRecord }: { indexRecord: EntityIndexRecordDto | undefined }) {
  if (!indexRecord) {
    return null;
  }

  return (
    <section className="xray-section provenance-section">
      <h3>Source</h3>
      <Property label="Contract file" value={indexRecord.source_file} code />
      <Property label="Provenance" value={indexRecord.provenance} />
    </section>
  );
}

function ContractSection({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="xray-section">
      <h3>{title}</h3>
      {note ? <p className="section-note">{note}</p> : null}
      <dl className="property-list">{children}</dl>
    </section>
  );
}

function Property({
  label,
  value,
  code = false,
}: {
  label: string;
  value: JsonValue | undefined;
  code?: boolean;
}) {
  const text = simpleValue(value);
  if (text === null) {
    return null;
  }

  return (
    <div className="property-row">
      <dt>{label}</dt>
      <dd>{code ? <code>{text}</code> : text}</dd>
    </div>
  );
}

function Description({ value }: { value: JsonValue | undefined }) {
  if (typeof value !== "string" || value.length === 0) {
    return null;
  }
  return <p className="contract-description">{value}</p>;
}

function DeclaredValue({ value }: { value: JsonValue | undefined }) {
  if (value === undefined) {
    return null;
  }

  return <pre className="declared-value">{JSON.stringify(value, null, 2)}</pre>;
}

function simpleValue(value: JsonValue | undefined): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value === "boolean") {
    return value ? "yes" : "no";
  }
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (Array.isArray(value) && value.every((item) => typeof item === "string" || typeof item === "number")) {
    return value.length > 0 ? value.join(", ") : null;
  }
  return null;
}

function isObject(value: JsonValue | undefined): value is JsonObject {
  return value !== null && value !== undefined && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyObject(value: JsonValue | undefined): value is JsonObject {
  return isObject(value) && Object.keys(value).length > 0;
}

function milliseconds(value: JsonValue | undefined): JsonValue | undefined {
  return typeof value === "number" ? `${value} ms` : value;
}

function seconds(value: JsonValue | undefined): JsonValue | undefined {
  return typeof value === "number" ? `${value} s` : value;
}

function bytes(value: JsonValue | undefined): JsonValue | undefined {
  return typeof value === "number" ? `${value.toLocaleString()} B` : value;
}

function bitsPerSecond(value: JsonValue | undefined): JsonValue | undefined {
  return typeof value === "number" ? `${value.toLocaleString()} bit/s` : value;
}

function displayName(
  indexRecord: EntityIndexRecordDto | undefined,
  contract: MissionContractObject | null,
  ref: EntityRef,
): string {
  const name = contract?.name;
  return indexRecord?.display_name ?? (typeof name === "string" ? name : ref.id);
}

function humanize(value: string): string {
  return value.replaceAll("_", " ");
}
