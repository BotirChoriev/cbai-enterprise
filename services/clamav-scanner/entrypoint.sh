#!/bin/sh
set -eu

freshclam --no-warnings || true
mkdir -p /run/clamav
chown clamav:clamav /run/clamav
clamd &

attempt=0
until clamdscan --ping >/dev/null 2>&1; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 30 ]; then
    echo "ClamAV daemon did not become ready" >&2
    exit 1
  fi
  sleep 1
done

exec node /app/server.mjs
