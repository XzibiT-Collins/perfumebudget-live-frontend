#!/bin/sh
# entrypoint.sh - Start Express server with dynamic port

set -e

# Get port from environment or use default
PORT=${PORT:-3000}

echo "=========================================="
echo "Starting Express Server on PORT: $PORT"
echo "=========================================="

# Set environment and start the app
export NODE_ENV=production
export PORT=$PORT

# Start the Express server which serves the built dist folder
exec tsx server.ts
