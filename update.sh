#!/bin/bash

# LocalForge Server Update Script
# Run this on the server to update LocalForge

set -e

COMPOSE_FILE="docker-compose.server.yml"

echo "======================================"
echo "  Updating LocalForge"
echo "======================================"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo "Error: Please don't run this script as root"
    echo "Use: ./update.sh"
    exit 1
fi

echo "Pulling latest code..."
git pull
echo "✓ Code updated"
echo ""

echo "Rebuilding Docker images..."
docker-compose -f "$COMPOSE_FILE" build
echo "✓ Images rebuilt"
echo ""

echo "Restarting services..."
docker-compose -f "$COMPOSE_FILE" up -d
echo "✓ Services restarted"
echo ""

echo "Waiting for health check..."
for i in {1..30}; do
    if curl -sf http://localhost/api/health > /dev/null 2>&1; then
        echo "✓ Backend is healthy"
        break
    fi
    echo -n "."
    sleep 2
done
echo ""

echo "======================================"
echo "Update Complete!"
echo "======================================"
echo ""
echo "Tailscale IP: $(tailscale ip -4 2>/dev/null || echo 'Unknown')"
echo "Access: http://$(tailscale ip -4 2>/dev/null || echo '<tailscale-ip>')"
echo ""
