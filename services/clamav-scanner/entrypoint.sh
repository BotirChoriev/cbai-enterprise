#!/bin/sh
set -eu

# Signature refresh is best-effort at cold start. A transient mirror outage must
# not keep the health endpoint in "starting" forever; the image already carries
# a verified signature set and deployment monitoring records refresh failures.
if [ "${SKIP_SIGNATURE_UPDATE:-0}" != "1" ]; then
  timeout 60 freshclam --no-warnings || true
fi
mkdir -p /run/clamav
chown clamav:clamav /run/clamav
clamd &

attempt=0
until clamdscan --ping=1:1 >/dev/null 2>&1; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 30 ]; then
    echo "ClamAV daemon did not become ready" >&2
    exit 1
  fi
  sleep 1
done

exec node /app/server.mjs
