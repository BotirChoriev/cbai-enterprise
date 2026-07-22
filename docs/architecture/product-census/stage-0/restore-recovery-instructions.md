# Restore / recovery instructions (non-destructive)

**Forbidden in Stage 0 and in casual recovery:** `git reset --hard`, `git clean -fd`, `git checkout --`, stash drop, force push, deleting user data, rewriting history.

## A. Recover knowledge of what changed (no mutation)

```bash
cd /path/to/cbai-enterprise
git branch --show-current    # expect: preview/spatial-world-intelligence
git rev-parse HEAD           # expect: 2d1558995f355a899100a6ca15c7d924e913c690
git status --short --branch
```

Compare to:

- `docs/architecture/product-census/stage-0/git-status-short-branch.txt`
- `docs/architecture/product-census/stage-0/changed-file-manifest.csv`
- `docs/architecture/product-census/stage-0/checksums-sha256.txt`

Verify a file was not silently altered:

```bash
shasum -a 256 path/to/file
# compare to checksums-sha256.txt line for that path
```

## B. Full working-tree backup (recommended before Stage 1)

Create a **copy** of the repo directory (Finder/cp/rsync) to an external backup location.
Do **not** include or transmit:

- `.dev.vars`
- `.env.local`
- any real API keys

Optional: archive only tracked+untracked source with rsync excludes for `node_modules`, `.next`, `out`, `.dev.vars`, `.env.local`.

## C. Browser user-data backup (manual)

In the browser used for CBAI Local Mode, export relevant `localStorage` keys matching `cbai-*` via DevTools **Application** panel (copy values privately). Stage 0 does not automate this (would risk secret exposure in logs).

## D. If HEAD drifts unexpectedly

Stop. Record `git rev-parse HEAD` and `git status`. Do not “fix” with reset. Human decides.

## E. Reinstall dependencies (optional, non-destructive to git)

```bash
npm ci
```

Uses lockfile; does not alter git history. Still does not restore ignored secrets — recreate `.dev.vars` from `.dev.vars.example` manually without pasting secrets into git.

## F. What “recovery” does **not** mean

- Not discarding the 137 modified tracked files
- Not deleting 500+ untracked verification assets
- Not merging to `main`
- Not running product migrations
