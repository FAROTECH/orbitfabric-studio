import studioIconUrl from "../../../assets/app-icon.png";

import type { MissionOpenFailure } from "../../app/studioState";

interface MissionLauncherProps {
  isOpening: boolean;
  coreExecutable: string;
  recentMissions: string[];
  failure: MissionOpenFailure | null;
  onCoreExecutableChange: (value: string) => void;
  onOpenMission: () => void;
  onOpenRecent: (path: string) => void;
}

export function MissionLauncher({
  isOpening,
  coreExecutable,
  recentMissions,
  failure,
  onCoreExecutableChange,
  onOpenMission,
  onOpenRecent,
}: MissionLauncherProps) {
  return (
    <main className="launcher-shell">
      <section className="launcher-panel" aria-labelledby="launcher-title">
        <div className="launcher-mark" aria-hidden="true">
          <img src={studioIconUrl} alt="" />
        </div>
        <div className="launcher-copy">
          <p className="eyebrow">OrbitFabric Studio</p>
          <h1 id="launcher-title">See the mission.</h1>
          <p className="launcher-intro">
            Open an OrbitFabric mission and explore the contract as one engineering system.
          </p>
        </div>

        <button
          className="primary-action launcher-open"
          type="button"
          onClick={onOpenMission}
          disabled={isOpening}
        >
          {isOpening ? "Opening mission…" : "Open Mission"}
        </button>

        {failure ? <MissionOpenFailureView failure={failure} /> : null}

        {recentMissions.length > 0 ? (
          <div className="launcher-recents">
            <h2>Recent</h2>
            <div className="recent-list">
              {recentMissions.map((path) => (
                <button
                  key={path}
                  className="recent-mission"
                  type="button"
                  disabled={isOpening}
                  onClick={() => onOpenRecent(path)}
                  title={path}
                >
                  <span>{lastPathSegment(path)}</span>
                  <small>{path}</small>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <details className="launcher-integration">
          <summary>Core integration</summary>
          <label>
            OrbitFabric executable
            <input
              value={coreExecutable}
              onChange={(event) => onCoreExecutableChange(event.target.value)}
              spellCheck={false}
              autoCapitalize="off"
            />
          </label>
          <p>
            Studio asks OrbitFabric Core for structured mission facts. The executable can be
            changed for local development or compatibility testing.
          </p>
        </details>
      </section>
    </main>
  );
}

function MissionOpenFailureView({ failure }: { failure: MissionOpenFailure }) {
  return (
    <section className="open-failure" aria-live="polite">
      <strong>Mission could not be opened</strong>
      <p>{failure.message}</p>
      {failure.diagnostics.length > 0 ? (
        <ul>
          {failure.diagnostics.slice(0, 5).map((diagnostic, index) => (
            <li key={`${diagnostic.code}-${diagnostic.file ?? ""}-${index}`}>
              <code>{diagnostic.code}</code> {diagnostic.message}
              {diagnostic.file ? <small>{diagnostic.file}</small> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function lastPathSegment(path: string): string {
  const normalized = path.replace(/[\\/]+$/, "");
  return normalized.split(/[\\/]/).pop() || path;
}
