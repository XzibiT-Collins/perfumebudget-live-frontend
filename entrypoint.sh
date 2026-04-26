#!/bin/sh
# entrypoint.sh - Start nginx with dynamic port

PORT=${PORT:-80}

# Replace port in nginx config
sed -i "s/listen 80;/listen ${PORT};/" /etc/nginx/conf.d/default.conf

# Start nginx in foreground
exec nginx -g "daemon off;"
