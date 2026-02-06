export type ScanSeverity = "safe" | "suspicious" | "blocked";

export interface ThreatIndicator {
  code: string;
  message: string;
  recommendation: string;
}

export interface ScanResult {
  severity: ScanSeverity;
  score: number;
  indicators: ThreatIndicator[];
  scannerEngineSummary: string[];
}

export interface ExtractionRequest {
  archivePath: string;
  outputPath: string;
  password?: string;
}

export interface ExtractionResult {
  status: "success" | "quarantined" | "blocked" | "failed";
  scanResult: ScanResult;
  extractedPath?: string;
  quarantinePath?: string;
  details: string;
}
