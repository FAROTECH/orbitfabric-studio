import { invoke } from "@tauri-apps/api/core";
import type { IntegrationBundleRead } from "./contracts";
import type { IntegrationGateway, IntegrationTextRead } from "./IntegrationGateway";

export class TauriIntegrationGateway implements IntegrationGateway {
  async readPackageManifest(path: string): Promise<IntegrationTextRead> {
    return invoke<IntegrationTextRead>("read_integration_package_manifest", { path });
  }

  async readResultBundle(path: string): Promise<IntegrationBundleRead> {
    return invoke<IntegrationBundleRead>("read_integration_result_bundle", { path });
  }
}
