import { useMemo, useState } from "react";

import { executeIntegrationInspectorAction } from "../../integrations/plugin-actions";
import type {
  IntegrationInspectorAction,
  IntegrationPluginContext,
  IntegrationTargetInspectionInput,
} from "../../integrations/plugin-api";
import type { IntegrationPluginRegistry } from "../../integrations/plugin-registry";

export function IntegrationTargetInspectorHost({
  registry,
  input,
  context,
}: {
  registry: IntegrationPluginRegistry;
  input: IntegrationTargetInspectionInput;
  context: IntegrationPluginContext;
}) {
  const [actionError, setActionError] = useState<string | null>(null);
  const dispatch = useMemo(
    () => registry.inspectTarget(input, context),
    [registry, input, context],
  );

  async function runAction(action: IntegrationInspectorAction) {
    setActionError(null);
    try {
      await executeIntegrationInspectorAction(action, input, context);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : String(error));
    }
  }

  return (
    <div className="integration-target-inspector-host">
      <div className="integration-target-fallback">
        <small>Opaque target ref</small>
        <code>
          {input.target.namespace} · {input.target.kind} · {input.target.id}
        </code>
      </div>

      {dispatch.matches.map((match) => (
        <article
          className="integration-target-inspector"
          key={`${match.pluginId}/${match.contributionId}`}
        >
          <header>
            <div>
              <strong>{match.model.title}</strong>
              {match.model.subtitle ? <span>{match.model.subtitle}</span> : null}
            </div>
            <small>
              {match.pluginDisplayName} · {match.contributionId}
            </small>
          </header>

          {match.model.badges?.length ? (
            <div className="integration-target-inspector-badges">
              {match.model.badges.map((badge, index) => (
                <span
                  className={`status-pill tone-${badge.tone ?? "neutral"}`}
                  key={`${badge.label}-${index}`}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          ) : null}

          {match.model.sections.map((section) => (
            <section key={section.id} className="integration-target-inspector-section">
              {section.title ? <h3>{section.title}</h3> : null}
              <dl>
                {section.rows.map((row, index) => (
                  <div key={`${row.label}-${index}`}>
                    <dt>{row.label}</dt>
                    <dd
                      className={`emphasis-${row.emphasis ?? "normal"}${
                        row.monospace ? " is-monospace" : ""
                      }`}
                    >
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}

          {match.model.actions?.length ? (
            <div className="integration-target-inspector-actions">
              {match.model.actions.map((action) => (
                <button
                  className="secondary-action"
                  key={action.id}
                  type="button"
                  onClick={() => void runAction(action)}
                >
                  {action.label}
                </button>
              ))}
            </div>
          ) : null}
        </article>
      ))}

      {dispatch.failures.length ? (
        <div className="integration-plugin-failures" role="status">
          {dispatch.failures.map((failure) => (
            <small key={`${failure.pluginId}/${failure.contributionId}/${failure.phase}`}>
              Plugin contribution {failure.pluginId}/{failure.contributionId} failed during {failure.phase}: {failure.message}
            </small>
          ))}
        </div>
      ) : null}

      {actionError ? <small className="integration-bad">{actionError}</small> : null}
    </div>
  );
}
