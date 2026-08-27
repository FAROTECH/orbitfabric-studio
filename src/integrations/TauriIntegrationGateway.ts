import { invoke } from "@tauri-apps/api/core";
import type { IntegrationBundleRead, IntegrationTextDigestRead } from "./contracts";
import type { IntegrationGateway, IntegrationTextRead } from "./IntegrationGateway";
import { sha256Utf8 } from "./sha256";

function packageRoot(path: string): { root: string; separator: string; windows: boolean } {
  const slash = path.lastIndexOf("/");
  const backslash = path.lastIndexOf("\\");
  const index = Math.max(slash, backslash);
  if (index < 0) {
    throw new Error("Integration Package manifest path has no parent directory.");
  }
  const separator = backslash > slash ? "\\" : "/";
  return {
    root: path.slice(0, index),
    separator,
    windows: separator === "\\",
  };
}

function containedInPackage(manifestPath: string, resolvedPath: string): boolean {
  const { root, separator, windows } = packageRoot(manifestPath);
  const prefix = `${root}${separator}`;
  if (windows) {
    return resolvedPath.toLowerCase().startsWith(prefix.toLowerCase());
  }
  return resolvedPath.startsWith(prefix);
}

function packageAssetPath(manifestPath: string, relativePath: string): string {
  const { root, separator } = packageRoot(manifestPath);
  const normalizedRelative = relativePath.replace(/[\\/]/g, separator);
  return `${root}${separator}${normalizedRelative}`;
}

export class TauriIntegrationGateway implements IntegrationGateway {
  async readPackageManifest(path: string): Promise<IntegrationTextRead> {
    return invoke<IntegrationTextRead>("read_integration_package_manifest", { path });
  }

  async readPackageProfileSchema(
    manifestPath: string,
    schemaPath: string,
    expectedSha256: string,
  ): Promise<IntegrationTextDigestRead> {
    const candidate = packageAssetPath(manifestPath, schemaPath);
    const read = await invoke<IntegrationTextRead>("read_integration_package_manifest", {
      path: candidate,
    });
    const sha256 = await sha256Utf8(read.text);
    return {
      path: read.path,
      text: read.text,
      sha256,
      contained: containedInPackage(manifestPath, read.path),
      sha256Matches: sha256.toLowerCase() === expectedSha256.toLowerCase(),
    };
  }

  async readResultBundle(path: string): Promise<IntegrationBundleRead> {
    return invoke<IntegrationBundleRead>("read_integration_result_bundle", { path });
  }
}
