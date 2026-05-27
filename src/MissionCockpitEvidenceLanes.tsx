interface MissionCockpitEvidenceLane {
  label: string;
  value: string;
  isReported: boolean;
}

interface MissionCockpitEvidenceLanesProps {
  reportedEvidenceCount: number;
  reportedEvidenceItems: readonly MissionCockpitEvidenceLane[];
}

export function MissionCockpitEvidenceLanes({
  reportedEvidenceCount,
  reportedEvidenceItems,
}: MissionCockpitEvidenceLanesProps) {
  return (
    <div className="cockpit-tactical-band" aria-label="Reported evidence lanes band">
      <div className="cockpit-tactical-summary">
        <span className="cockpit-eyebrow">Reported evidence lanes</span>
        <strong>
          {reportedEvidenceCount}/{reportedEvidenceItems.length} evidence lanes populated
        </strong>
      </div>

      <div className="cockpit-tactical-segments">
        {reportedEvidenceItems.map((item) => (
          <div
            className={`cockpit-tactical-segment ${
              item.isReported
                ? "cockpit-tactical-segment-ready"
                : "cockpit-tactical-segment-missing"
            }`}
            key={item.label}
          >
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
