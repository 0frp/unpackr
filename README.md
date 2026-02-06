# Unpackr

Public, modern archive extraction desktop app with built-in pre-extraction security checks.

## Project goal
Unpackr provides a simple interface for extracting files while enforcing secure defaults:

- scan-before-extract workflow,
- suspicious/archive risk scoring,
- unsafe destination path blocking,
- quarantine for suspicious inputs,
- one-click Windows installer experience.

---

## Public release policy: single installer artifact
This repository now ships **one official Windows installer artifact** per release:

- `Unpackr-Setup-<version>.exe`

No alternate installer format is published from this repo. This keeps public downloads simple and reduces confusion.

---

## Tech stack
- Electron + TypeScript desktop runtime
- Renderer UI (HTML/CSS/TS)
- `electron-builder` NSIS packaging

---

## Local development

```bash
npm install
npm run start
```

## Build app

```bash
npm run build
```

## Build installer

```bash
npm run dist
```

Expected output (single installer):
- `release/Unpackr-Setup-<version>.exe`

---

## Release process

1. Open a release issue from `.github/ISSUE_TEMPLATE/release-checklist.md`
2. Push a version tag:

```bash
git tag v0.1.0
git push origin v0.1.0
```

3. GitHub Actions workflow `.github/workflows/release-windows.yml` will:
   - build installer,
   - validate that exactly one installer exists,
   - generate SHA256 checksum,
   - publish GitHub Release with only the installer + checksum.

---

## Notes
- Archive extraction engine is scaffolded and security orchestration is implemented.
- Next production step is integrating full archive backends (zip/rar/7z/tar) behind the current secure workflow.
