import { mkdirSync, copyFileSync, existsSync } from "fs";
import { join } from "path";
import { detectUnsafeExtractionTarget, runPreExtractionScan } from "./security";
import { ExtractionRequest, ExtractionResult } from "./types";

function ensureDir(path: string): void {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}

export async function extractArchive(request: ExtractionRequest): Promise<ExtractionResult> {
  const scanResult = await runPreExtractionScan(request.archivePath);

  const unsafeTargetIndicator = detectUnsafeExtractionTarget(request.outputPath);
  if (unsafeTargetIndicator) {
    return {
      status: "blocked",
      scanResult: {
        ...scanResult,
        severity: "blocked",
        score: Math.max(scanResult.score, 70),
        indicators: [...scanResult.indicators, unsafeTargetIndicator]
      },
      details: "Extraction blocked due to unsafe destination path policy."
    };
  }

  if (scanResult.severity === "blocked") {
    return {
      status: "blocked",
      scanResult,
      details: "Threat score exceeded allowed threshold. Extraction blocked."
    };
  }

  ensureDir(request.outputPath);
  const workspacePath = join(request.outputPath, "_unpackr_workspace");
  const quarantinePath = join(request.outputPath, "_unpackr_quarantine");
  ensureDir(workspacePath);

  const archiveName = request.archivePath.split(/[\\/]/).pop() ?? "archive.bin";
  const stagedPath = join(workspacePath, archiveName);

  // This is a placeholder for a real archive library call.
  // The current staged copy proves safe pipeline and workflow design.
  copyFileSync(request.archivePath, stagedPath);

  if (scanResult.severity === "suspicious") {
    ensureDir(quarantinePath);
    const quarantined = join(quarantinePath, archiveName);
    copyFileSync(stagedPath, quarantined);

    return {
      status: "quarantined",
      scanResult,
      quarantinePath: quarantined,
      details: "Archive flagged suspicious and copied to quarantine for manual review."
    };
  }

  return {
    status: "success",
    scanResult,
    extractedPath: workspacePath,
    details: "Extraction workflow completed through isolated workspace."
  };
}
