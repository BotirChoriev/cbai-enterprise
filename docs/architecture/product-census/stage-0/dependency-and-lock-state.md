# Dependency and package-lock state

| Item | Value |
|------|-------|
| Package manager | npm (no `packageManager` field; no yarn.lock / pnpm-lock) |
| package.json name | `cbai-enterprise` |
| next | `16.2.10` (from package.json dependencies) |
| react | `19.2.4` |
| Build mode | `next.config.ts` → `output: "export"` |
| package-lock.json SHA-256 | `8c8c53e2d676cd3d757f157e1cca6840e421f0da12266b7aa89506ac122db564` |
| Working-tree note | `package.json` and `package-lock.json` appear in changed inventory (classification: ambiguous → human should treat as **dependency lock / product config**, not secret) |

Do not run `npm install` as part of Stage 0 recovery documentation. If restore needs deps, use non-destructive `npm ci` only after human approval on a clean machine copy.
