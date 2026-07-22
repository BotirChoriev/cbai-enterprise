# Ignored-file policy (Stage 0)

Evidence: `.gitignore` (read-only).

## Must never commit (enforced by ignore + policy)

| Pattern | Reason |
|---------|--------|
| `.dev.vars` | Cloudflare local voice broker secrets (`OPENAI_API_KEY`, etc.) |
| `.env*` except `.env.example` | Local env values |
| `node_modules/` | Dependencies |
| `.next/`, `out/`, `/build` | Generated build |
| `coverage/` | Test coverage |
| `.wrangler/` | Cloudflare local build artifacts |
| `*.pem` | Certificates/keys |
| `/reference/` | Nested reference material |

## Present on this machine (names only — values never inventoried)

- `.dev.vars` — EXISTS, gitignored
- `.env.local` — EXISTS, gitignored

Templates (safe to track): `.env.example`, `.dev.vars.example`

## Stage 0 recovery package rule

Never copy secret-bearing files into `docs/architecture/product-census/stage-0/`.
Checksums for those paths are recorded as `EXCLUDED_SECRET_OR_SENSITIVE` only when they appear in git status (they do not, because ignored).
