# Windows Installer Notes

Unpackr supports creating a reusable `.exe` installer so users install once and then launch via desktop shortcut.

## Option A (default): electron-builder + NSIS

Configured in `package.json`:

- `target: nsis`
- `createDesktopShortcut: true`
- `createStartMenuShortcut: true`
- `allowToChangeInstallationDirectory: true`

### Build command

```bash
npm run dist
```

Output: `release/Unpackr-Setup-<version>.exe`

## Option B (advanced control): Inno Setup

Script included at `installer/Unpackr.iss` for teams needing custom installer flow.

### Typical flow

1. Build unpacked app first (`npm run dist` or `npm run pack` depending on desired artifacts).
2. Open `installer/Unpackr.iss` in Inno Setup Compiler.
3. Compile to create a branded installer executable.

## Desktop shortcut behavior

Both installer paths are configured to create desktop shortcut(s), so users run Unpackr from desktop and do not need to launch from source folders.
