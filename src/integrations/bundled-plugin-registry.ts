import { openObswOpenSvfIntegrationPlugin } from "../integration-plugins/openobsw-opensvf";
import { IntegrationPluginRegistry } from "./plugin-registry";

export function createBundledIntegrationPluginRegistry(): IntegrationPluginRegistry {
  const registry = new IntegrationPluginRegistry();
  registry.register(openObswOpenSvfIntegrationPlugin);
  return registry;
}
