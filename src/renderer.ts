type ScanSeverity = "safe" | "suspicious" | "blocked";

interface ScanResult {
  severity: ScanSeverity;
  score: number;
  indicators: { code: string; message: string; recommendation: string }[];
  scannerEngineSummary: string[];
}

interface ExtractionResult {
  status: "success" | "quarantined" | "blocked" | "failed";
  scanResult: ScanResult;
  extractedPath?: string;
  quarantinePath?: string;
  details: string;
}

declare global {
  interface Window {
    unpackr: {
      pickArchive: () => Promise<string | null>;
      pickOutput: () => Promise<string | null>;
      extract: (payload: { archivePath: string; outputPath: string; password?: string }) => Promise<ExtractionResult>;
    };
  }
}

const archivePathEl = document.getElementById("archivePath") as HTMLInputElement;
const outputPathEl = document.getElementById("outputPath") as HTMLInputElement;
const passwordEl = document.getElementById("password") as HTMLInputElement;
const runButtonEl = document.getElementById("runExtraction") as HTMLButtonElement;
const resultEl = document.getElementById("result") as HTMLDivElement;
const scanSummaryEl = document.getElementById("scanSummary") as HTMLUListElement;
const indicatorListEl = document.getElementById("indicators") as HTMLUListElement;

function badgeClass(severity: ScanSeverity): string {
  if (severity === "safe") return "badge safe";
  if (severity === "suspicious") return "badge suspicious";
  return "badge blocked";
}

function renderResult(result: ExtractionResult): void {
  const severity = result.scanResult.severity;
  resultEl.innerHTML = `
    <div class="result-card">
      <div class="result-header">
        <strong>Status: ${result.status.toUpperCase()}</strong>
        <span class="${badgeClass(severity)}">${severity.toUpperCase()} / Score ${result.scanResult.score}</span>
      </div>
      <p>${result.details}</p>
      ${result.extractedPath ? `<p><strong>Extracted Path:</strong> ${result.extractedPath}</p>` : ""}
      ${result.quarantinePath ? `<p><strong>Quarantine Path:</strong> ${result.quarantinePath}</p>` : ""}
    </div>
  `;

  scanSummaryEl.innerHTML = "";
  result.scanResult.scannerEngineSummary.forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = entry;
    scanSummaryEl.append(li);
  });

  indicatorListEl.innerHTML = "";
  if (result.scanResult.indicators.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No threat indicators detected.";
    indicatorListEl.append(li);
    return;
  }

  result.scanResult.indicators.forEach((indicator) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${indicator.code}</strong> — ${indicator.message} <em>${indicator.recommendation}</em>`;
    indicatorListEl.append(li);
  });
}

async function pickArchive(): Promise<void> {
  const path = await window.unpackr.pickArchive();
  if (path) {
    archivePathEl.value = path;
  }
}

async function pickOutput(): Promise<void> {
  const path = await window.unpackr.pickOutput();
  if (path) {
    outputPathEl.value = path;
  }
}

async function runExtraction(): Promise<void> {
  if (!archivePathEl.value || !outputPathEl.value) {
    resultEl.innerHTML = '<p class="error">Please choose both archive and output folder.</p>';
    return;
  }

  runButtonEl.disabled = true;
  runButtonEl.textContent = "Processing...";

  try {
    const result = await window.unpackr.extract({
      archivePath: archivePathEl.value,
      outputPath: outputPathEl.value,
      password: passwordEl.value || undefined
    });

    renderResult(result);
  } catch (error) {
    resultEl.innerHTML = `<p class="error">Extraction failed: ${(error as Error).message}</p>`;
  } finally {
    runButtonEl.disabled = false;
    runButtonEl.textContent = "Run Secure Extraction";
  }
}

(document.getElementById("pickArchive") as HTMLButtonElement).addEventListener("click", pickArchive);
(document.getElementById("pickOutput") as HTMLButtonElement).addEventListener("click", pickOutput);
runButtonEl.addEventListener("click", runExtraction);

export {};
