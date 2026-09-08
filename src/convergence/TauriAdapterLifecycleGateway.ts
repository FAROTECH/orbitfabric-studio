import { invoke } from "@tauri-apps/api/core";
import type { CoreInvocationResult } from "../core/contracts";
import type {
  AdapterLifecycleGateway,
  LifecycleTextRead,
} from "./AdapterLifecycleGateway";

export class TauriAdapterLifecycleGateway implements AdapterLifecycleGateway {
  async listInstalled(executable: string): Promise<CoreInvocationResult> {
    return invoke<CoreInvocationResult>("run_core_adapter_list", { executable });
  }

  async verifyInstalled(executable: string, instanceId: string): Promise<CoreInvocationResult> {
    return invoke<CoreInvocationResult>("run_core_adapter_verify", { executable, instanceId });
  }

  async checkProjectLock(executable: string, lockPath: string): Promise<CoreInvocationResult> {
    return invoke<CoreInvocationResult>("run_core_adapter_lock_check", { executable, lockPath });
  }

  async selectCatalogRelease(
    executable: string,
    catalogPath: string,
    sourceCoordinate: string,
    releaseVersion: string,
  ): Promise<CoreInvocationResult> {
    return invoke<CoreInvocationResult>("run_core_adapter_catalog_select", {
      executable,
      catalogPath,
      sourceCoordinate,
      releaseVersion,
    });
  }

  async readTextFile(path: string): Promise<LifecycleTextRead> {
    return invoke<LifecycleTextRead>("read_integration_text_file", { path });
  }
}
