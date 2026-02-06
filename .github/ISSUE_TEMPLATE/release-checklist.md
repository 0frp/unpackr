---
name: Release checklist
about: Track a public Unpackr release
title: "release: vX.Y.Z"
labels: ["release", "installer"]
assignees: []
---

## Release goals
- [ ] Confirm version and changelog
- [ ] Confirm single installer artifact policy
- [ ] Confirm README instructions are up-to-date

## Validation checklist
- [ ] `npm ci`
- [ ] `npm run build`
- [ ] `npm run dist`
- [ ] Exactly one installer `.exe` exists in `release/`
- [ ] Desktop shortcut launch verified
- [ ] Uninstall path verified
- [ ] `SHA256SUMS.txt` generated and published

## Release assets
- [ ] `Unpackr-Setup-<version>.exe`
- [ ] `SHA256SUMS.txt`

## Notes
Record packaging issues, known bugs, and follow-up tasks.
