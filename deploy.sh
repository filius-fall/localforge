#!/bin/bash

# LocalForge Server Deployment Script
# Optimized for servers with 8GB RAM (i3-6100 or similar)

set -e

echo "======================================"
echo "  LocalForge Server Deployment"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo -e "${RED}Error: Please don't run this script as root${NC}"
    echo "Use: ./deploy.sh"
    exit 1
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check Docker Compose
if ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not available${NC}"
    echo "Docker Compose plugin should be built into Docker"
    echo "Check: docker compose version"
    exit 1
fi

# Configuration
COMPOSE_FILE="docker compose.server.yml"
ENV_FILE=".env"

echo -e "${YELLOW}[1/6] Checking configuration...${NC}"

# Create .env from example if doesn't exist
if [ ! -f "$ENV_FILE" ]; then
    if [ -f ".env.server" ]; then
        echo "Creating .env from .env.server..."
        cp .env.server "$ENV_FILE"
    else
        echo -e "${RED}Error: Neither .env nor .env.server found${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓ Configuration OK${NC}"
echo ""

echo -e "${YELLOW}[2/6] Stopping existing containers...${NC}"
docker compose -f "$COMPOSE_FILE" down 2>/dev/null || true
echo -e "${GREEN}✓ Containers stopped${NC}"
echo ""

echo -e "${YELLOW}[3/6] Building Docker images...${NC}"
echo "This may take 5-10 minutes on first run..."
docker compose -f "$COMPOSE_FILE" build
echo -e "${GREEN}✓ Images built${NC}"
echo ""

echo -e "${YELLOW}[4/6] Starting services...${NC}"
docker compose -f "$COMPOSE_FILE" up -d
echo -e "${GREEN}✓ Services started${NC}"
echo ""

echo -e "${YELLOW}[5/6] Waiting for health check...${NC}"
for i in {1..30}; do
    if curl -sf http://localhost/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend is healthy${NC}"
        break
    fi
    echo -n "."
    sleep 2
done
echo ""

echo -e "${YELLOW}[6/6] Verifying deployment...${NC}"
docker compose -f "$COMPOSE_FILE" ps
echo ""

# Display access information
echo "======================================"
echo -e "${GREEN}Deployment Complete!${NC}"
echo "======================================"
echo ""
echo "Access LocalForge:"
echo "  Frontend:  ${GREEN}http://localhost${NC} (or http://$(tailscale ip -4 2>/dev/null || echo '<tailscale-ip>')${NC})"
echo "  Backend:   ${GREEN}http://localhost:8000/api${NC}"
echo ""
echo "Tailscale:"
echo "  Your Tailscale IP: $(tailscale ip -4 2>/dev/null || echo 'Run: tailscale ip -4')"
echo "  Access from any device on Tailscale network"
echo ""
echo "Management commands:"
echo "  View logs:   docker compose -f $COMPOSE_FILE logs -f"
echo "  Stop:        docker compose -f $COMPOSE_FILE down"
echo "  Restart:     docker compose -f $COMPOSE_FILE restart"
echo "  Update:      git pull && docker compose -f $COMPOSE_FILE up -d --build"
echo ""
echo "For detailed information, see: ${GREEN}DEPLOY_SERVER.md${NC}"
echo ""
