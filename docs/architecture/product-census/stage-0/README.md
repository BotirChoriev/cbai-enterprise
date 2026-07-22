# Stage 0 — Recovery package README

**Stage:** 0 only (freeze, recovery, data safety)
**Branch:** `preview/spatial-world-intelligence`
**HEAD:** `2d1558995f355a899100a6ca15c7d924e913c690`
**Upstream:** `NO_UPSTREAM`
**Date context:** 2026-07-22 (local)

## Purpose

Make the dirty working tree on this preview branch **recoverable and auditable** without implementing Stage 1/2, without product code changes, and without committing.

## Contents

| File | Purpose |
|------|---------|
| `git-status-short-branch.txt` | Exact `git status --short --branch` at Stage 0 capture |
| `stage-0-inventory.json` | Machine-readable counts and classification tallies |
| `changed-file-manifest.csv` | Every changed/untracked file: status, classification, owner, SHA-256 |
| `checksums-sha256.txt` | SHA-256 list for ordinary files (secrets/generated excluded) |
| `directory-summary.csv` | Top-level path counts |
| `classification-summary.csv` | Classification tallies |
| `product-module-ownership.csv` | Heuristic module ownership map |
| `never-commit-list.txt` | Must-not-commit policy + local secret file **names** |
| `ambiguous-files-human-approval.txt` | Paths needing human reclassification |
| `path-integrity-issues.txt` | Symlinks / outside-repo / missing (none at capture) |
| `ignored-file-policy.md` | `.gitignore` summary |
| `environment-variable-names.txt` | Env **names** only from examples |
| `dependency-and-lock-state.md` | npm + package-lock digest |
| `test-script-inventory.txt` | `package.json` test:* scripts |
| `user-data-storage-audit.md` | Device-local schema/key audit (read-only) |
| `security-freeze-blockers.md` | Release blockers (unsafe cluster) |
| `restore-recovery-instructions.md` | Non-destructive recovery steps |
| `baseline-verification-results.md` | tsc/lint/build/critical tests |
| `stage-1-entry-gate.md` | Go/no-go checklist |
| `stage-0-final-report.md` | Stage 0 closeout report |

## Explicit non-actions

- No product code refactor/delete/rename/merge/quarantine
- No migrations executed against user data
- No commit / push / deploy / branch switch
- No copying of `.dev.vars`, `.env.local`, keys, tokens, or private user payloads into this package
