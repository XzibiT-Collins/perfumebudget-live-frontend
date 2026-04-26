#!/bin/sh
# entrypoint.sh - Start nginx with dynamic port

set -e

PORT=${PORT:-80}

echo "Starting nginx on port: $PORT"

# Use sed to replace the port in nginx config
sed -i "s/listen 80;/listen ${PORT};/" /etc/nginx/conf.d/default.conf

# Verify the config was updated
echo "Nginx configuration:"
grep "listen" /etc/nginx/conf.d/default.conf

# Validate nginx configuration
nginx -t

# Start nginx in foreground
echo "Nginx started successfully"
exec nginx -g "daemon off;"
