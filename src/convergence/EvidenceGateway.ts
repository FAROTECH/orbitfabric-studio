export type EvidenceTextRead = {
  path: string;
  text: string;
};

export interface EvidenceGateway {
  readTextFile(path: string): Promise<EvidenceTextRead>;
}
