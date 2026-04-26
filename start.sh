#!/bin/sh
set -e

# Strip any accidental whitespace from Railway-injected env vars
export PORT="$(printf '%s' "${PORT:-8080}" | tr -d '[:space:]')"

echo "[nginx] Starting on PORT=$PORT"

envsubst '${PORT}' \
  < /etc/nginx/nginx.conf.template \
  > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
