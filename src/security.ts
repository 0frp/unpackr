import { createHash } from "crypto";
import { existsSync } from "fs";
import { basename } from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { ScanResult, ThreatIndicator } from "./types";

const execFileAsync = promisify(execFile);

const SUSPICIOUS_NAME_PATTERN = /(crack|keygen|payload|trojan|stealer|dropper|macro|exploit)/i;
const RISKY_EXTENSIONS = new Set([".ps1", ".vbs", ".js", ".jse", ".scr", ".bat", ".cmd", ".hta", ".exe"]);

function extensionScore(filename: string): number {
  for (const ext of RISKY_EXTENSIONS) {
    if (filename.toLowerCase().endsWith(ext)) {
      return 24;
    }
  }
  return 0;
}

function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

async function runWindowsDefenderScan(targetPath: string): Promise<{ status: string; raw: string }> {
  const powershell = process.platform === "win32" ? "powershell.exe" : "pwsh";
  const command = [
    "-NoProfile",
    "-Command",
    `Try { Start-MpScan -ScanType CustomScan -ScanPath \"${targetPath.replace(/\\/g, "\\\\")}\"; Write-Output \"CLEAN\" } Catch { Write-Output \"UNAVAILABLE\"; exit 0 }`
  ];

  try {
    const { stdout } = await execFileAsync(powershell, command, { timeout: 120000 });
    return {
      status: stdout.includes("CLEAN") ? "clean" : "unavailable",
      raw: stdout.trim()
    };
  } catch (error) {
    return { status: "unavailable", raw: `Scanner unavailable: ${(error as Error).message}` };
  }
}

export async function runPreExtractionScan(archivePath: string): Promise<ScanResult> {
  const indicators: ThreatIndicator[] = [];
  const scannerEngineSummary: string[] = [];
  let score = 0;

  if (!existsSync(archivePath)) {
    return {
      severity: "blocked",
      score: 100,
      indicators: [
        {
          code: "ARCHIVE_MISSING",
          message: "Archive does not exist at selected path.",
          recommendation: "Re-select file and verify source integrity."
        }
      ],
      scannerEngineSummary: ["File existence validation failed"]
    };
  }

  const fileName = basename(archivePath);
  if (SUSPICIOUS_NAME_PATTERN.test(fileName)) {
    score += 34;
    indicators.push({
      code: "SUSPICIOUS_FILENAME",
      message: `Filename '${fileName}' matched suspicious threat pattern heuristics.`,
      recommendation: "Prefer extraction in sandbox mode and verify source authenticity."
    });
  }

  const extScore = extensionScore(fileName);
  if (extScore > 0) {
    score += extScore;
    indicators.push({
      code: "RISKY_ARCHIVE_EXTENSION",
      message: `Archive filename indicates executable/script-style payload risk (${fileName}).`,
      recommendation: "Enable quarantine and inspect extracted executable files manually."
    });
  }

  const pseudoHash = sha256Hex(`${archivePath}:${fileName}`);
  scannerEngineSummary.push(`Local hash fingerprint (pseudo): ${pseudoHash.slice(0, 20)}...`);

  const defenderResult = await runWindowsDefenderScan(archivePath);
  scannerEngineSummary.push(`Windows Defender adapter: ${defenderResult.status}`);

  if (defenderResult.status === "unavailable") {
    score += 8;
    indicators.push({
      code: "SCANNER_UNAVAILABLE",
      message: "Primary local malware scanner unavailable in current environment.",
      recommendation: "Install/enable Defender or configure ClamAV plugin in production."
    });
  }

  let severity: ScanResult["severity"] = "safe";
  if (score >= 55) {
    severity = "blocked";
  } else if (score >= 20) {
    severity = "suspicious";
  }

  return {
    severity,
    score,
    indicators,
    scannerEngineSummary
  };
}

export function detectUnsafeExtractionTarget(outputPath: string): ThreatIndicator | null {
  const normalized = outputPath.replace(/\\/g, "/");

  if (normalized.includes("../") || normalized.includes("..\\")) {
    return {
      code: "PATH_TRAVERSAL",
      message: "Output path includes traversal pattern that could escape destination.",
      recommendation: "Choose a dedicated folder that does not contain relative traversal segments."
    };
  }

  if (/^[A-Za-z]:\//.test(normalized) || normalized.startsWith("//")) {
    return {
      code: "ABSOLUTE_OR_NETWORK_PATH",
      message: "Output path appears to be an absolute/system or network target.",
      recommendation: "Extract to a local user directory first, then move after validation."
    };
  }

  return null;
}
