import type { IntegrationPackageDescriptor } from "./contracts";

export type RegisteredIntegrationPackage = {
  manifestPath: string;
  descriptor: IntegrationPackageDescriptor | null;
  error: string | null;
};

export class IntegrationPackageRegistry {
  private readonly entries = new Map<string, RegisteredIntegrationPackage>();

  register(entry: RegisteredIntegrationPackage): void {
    const path = entry.manifestPath.trim();
    if (!path) {
      throw new Error("Integration Package manifest path must be non-empty.");
    }
    this.entries.set(path, { ...entry, manifestPath: path });
  }

  unregister(manifestPath: string): void {
    this.entries.delete(manifestPath);
  }

  get(manifestPath: string): RegisteredIntegrationPackage | undefined {
    return this.entries.get(manifestPath);
  }

  list(): RegisteredIntegrationPackage[] {
    return [...this.entries.values()].sort((a, b) =>
      a.manifestPath.localeCompare(b.manifestPath),
    );
  }

  clear(): void {
    this.entries.clear();
  }
}
