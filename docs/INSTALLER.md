# Installer Guide (Single Artifact)

Unpackr publishes a **single Windows installer file** for public use:

- `Unpackr-Setup-<version>.exe`

## Why single installer
- Easier public distribution
- One trusted path for users
- Lower support burden

## Build locally

```bash
npm run dist
```

## Result
Installer is created in:
- `release/Unpackr-Setup-<version>.exe`

## Shortcut behavior
Installer creates:
- Desktop shortcut
- Start Menu shortcut

Users install once, then launch from shortcuts (no need to run from source folders).

## Automated release
Tag push (`v*`) or manual dispatch triggers `.github/workflows/release-windows.yml`, which uploads only:
- installer `.exe`
- `SHA256SUMS.txt`
