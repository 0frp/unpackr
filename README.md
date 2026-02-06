# Unpackr (Desktop Starter)

Unpackr is a modern, security-first archive extraction application starter built with **Electron + TypeScript**.

This update moves beyond concept-only documentation and provides a working desktop architecture with:

- pre-extraction security scanning pipeline,
- safe extraction/quarantine workflow,
- modern UI shell,
- and **Windows `.exe` installer packaging with desktop shortcut support**.

---

## What this implementation includes

## 1) Modern desktop app shell
- Electron desktop app (`src/main.ts`) with secure defaults:
  - `contextIsolation: true`
  - `nodeIntegration: false`
  - `sandbox: true`
- Preload bridge (`src/preload.ts`) exposing a minimal, typed API.
- Sleek renderer UI (`src/renderer.html`, `src/renderer.css`, `src/renderer.ts`) for:
  - selecting archive input
  - selecting extraction destination
  - optional password input
  - running secure extraction flow
  - displaying scan outcome and threat indicators

## 2) Security pipeline (advanced starter)
Implemented in `src/security.ts`:

- File existence validation.
- Heuristic suspicious filename detection.
- Risk scoring for dangerous executable/script style extensions.
- Windows Defender adapter (PowerShell `Start-MpScan`) with graceful fallback.
- Severity classification (`safe`, `suspicious`, `blocked`).
- Unsafe destination path policy checks to stop traversal-like extraction targets.

## 3) Safe extraction workflow
Implemented in `src/extraction.ts`:

- Runs scan before extraction.
- Blocks extraction on high-risk score.
- Blocks extraction to unsafe paths.
- Uses an isolated workspace destination.
- Quarantines suspicious inputs for manual review.

> Note: archive content unpacking is currently placeholder-staged (copy workflow) so the secure orchestration can be validated now; plugging in `7zip-bin` / `node-7z` / native Rust extractor can be done next.

## 4) Windows installer `.exe` + desktop shortcut
Two installer paths are included:

1. **Electron Builder NSIS (recommended first path)** via `package.json`:
   - generates Windows setup `.exe`
   - supports install directory selection
   - creates desktop + start menu shortcuts
   - runs app after install

2. **Advanced Inno Setup script** (`installer/Unpackr.iss`) for teams that need custom installer control and branding.

---

## Project structure

```text
.
├─ package.json
├─ tsconfig.json
├─ src/
│  ├─ main.ts
│  ├─ preload.ts
│  ├─ renderer.ts
│  ├─ renderer.html
│  ├─ renderer.css
│  ├─ security.ts
│  ├─ extraction.ts
│  └─ types.ts
├─ scripts/
│  └─ copy-static.mjs
└─ installer/
   └─ Unpackr.iss
```

---

## Local development

```bash
npm install
npm run start
```

## Build app binaries

```bash
npm run build
```

## Build Windows installer `.exe`

```bash
npm run dist
```

The installer output is written to `release/` (e.g., `Unpackr-Setup-0.1.0.exe`), and users can install once then open via desktop shortcut.

---

## Next upgrades (recommended)

- Replace placeholder extraction with real archive library (7z/rar/zip/tar).
- Add recursive nested-archive inspection and streaming scan.
- Add multi-engine scanner abstraction (Defender + ClamAV + cloud reputation).
- Add signed tamper-evident audit logs.
- Add policy profiles and automation rules for enterprise mode.
- Add code signing for production Windows installer.
