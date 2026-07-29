# CBAI private ClamAV scanner

This service is the malware boundary for private research artifacts. It accepts
only authenticated scan jobs, downloads only from the exact configured Supabase
Storage origin, verifies byte length and SHA-256, and returns a ClamAV verdict.

Required secrets/environment:

- `SCANNER_TOKEN`: random service-to-service bearer token.
- `ALLOWED_DOWNLOAD_ORIGIN`: exact Supabase project origin, for example
  `https://PROJECT_REF.supabase.co`.
- `MAX_SCAN_BYTES`: optional; defaults to 200 MiB.

The service must be private or protected by the bearer token, use HTTPS, retain
no files, and expose `/healthz` for deployment health checks. Artifact files are
deleted from the container's temporary directory after every request.

Cloudflare Preview requires these encrypted secrets:

- `SUPABASE_SERVICE_ROLE_KEY`
- `ARTIFACT_SCANNER_URL`
- `ARTIFACT_SCANNER_TOKEN`

And these Preview variables:

- `SUPABASE_URL`
- `ARTIFACT_ALLOWED_ORIGINS`

Do not configure Production until Preview clean, EICAR, scanner-unavailable,
ownership, hash-mismatch, and cleanup gates all pass.

The checked-in `wrangler.jsonc` deploys a single `basic` Cloudflare Container
instance for Preview. Set the Worker secret without printing it:

```sh
npx wrangler secret put SCANNER_TOKEN
npm run deploy:preview
```
