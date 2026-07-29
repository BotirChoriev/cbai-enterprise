#!/bin/sh
set -eu

mkdir -p /run/clamav
chown clamav:clamav /run/clamav
clamd &

# Signature refresh is best-effort after readiness. Cloudflare requires the
# container to bind its port promptly, so a slow mirror must never block HTTP
# startup. clamd's self-check reloads the updated database after freshclam exits.
if [ "${SKIP_SIGNATURE_UPDATE:-0}" != "1" ]; then
  (
    attempt=0
    until clamdscan --ping=1:1 >/dev/null 2>&1; do
      attempt=$((attempt + 1))
      if [ "$attempt" -ge 120 ]; then
        echo "ClamAV daemon did not become ready for signature refresh" >&2
        exit 0
      fi
      sleep 1
    done
    timeout 60 freshclam --no-warnings || true
  ) &
fi

exec node /app/server.mjs
