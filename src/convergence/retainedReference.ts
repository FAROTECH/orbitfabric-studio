// Byte integrity is distinct from correlation and producer meaning.
export interface RetainedReferenceRead {
  status: "verified" | "missing" | "digest_mismatch" | "failure";
  path: string | null;
  sha256: string | null;
  text: string | null;
  reason: string | null;
}

export interface RetainedReferenceRequest {
  parentPath: string;
  parentSha256: string;
  relativePath: string;
  expectedSha256: string;
}
