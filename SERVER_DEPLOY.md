# LocalForge Server Deployment Summary

## Your Server
- **CPU**: Intel Core i3-6100 @ 3.70GHz (2 cores, 4 threads)
- **RAM**: 8GB
- **Network**: Tailscale

## Files for Server Deployment

| File | Purpose |
|------|---------|
| `docker compose.server.yml` | Docker Compose with resource limits |
| `.env.server` | Environment variables template |
| `deploy.sh` | One-command deployment |
| `update.sh` | One-command update |
| `DEPLOY_TAILSCALE.md` | Detailed Tailscale guide |

## One-Time Setup (Run Once on Server)

```bash
# 1. Clone repository
git clone <your-repo> /opt/localforge
cd /opt/localforge

# 2. Deploy
./deploy.sh
```

That's it! Done.

## Access

After deployment, get your Tailscale IP:

```bash
# On the server
tailscale ip -4
# Example output: 100.64.0.5
```

Then access from any device on your Tailscale network:

```
http://100.64.0.5
```

## Update to Latest Version

```bash
# On the server
cd /opt/localforge
./update.sh
```

## Local Development

For local development, use make:

```bash
# Start backend
make start-backend

# Start frontend
make start-frontend
# or
make dev
```

Access locally at `http://localhost:5173`

## Quick Commands

| Command | Purpose |
|----------|---------|
| `./deploy.sh` | First-time deployment on server |
| `./update.sh` | Update to latest version on server |
| `make start` | Start local development |
| `tailscale ip -4` | Get Tailscale IP |
| `docker compose -f docker compose.server.yml logs -f` | View logs |
| `docker compose -f docker compose.server.yml restart` | Restart services |

## Why This Setup?

### Local Development (Make)
- Fast iteration
- No Docker overhead
- Immediate feedback
- Use `make start` or `make dev`

### Server Deployment (Docker + Tailscale)
- Easy one-command deployment
- Isolated environment
- Resource limits (8GB RAM safe)
- No public exposure needed
- Encrypted via Tailscale
- Access from any Tailscale device

## Resource Limits (8GB RAM)

| Service | Limit | Purpose |
|----------|--------|---------|
| Backend | 5GB | ML tools (OCR, face detection, etc.) |
| Frontend | 512MB | Static web serving |
| System | ~2.5GB | OS, Docker, etc. |

ML tools can use 2-5GB temporarily when processing.

## Troubleshooting

| Issue | Solution |
|--------|----------|
| Can't access from Tailscale | Check `tailscale status` on both devices |
| Slow first load | ML models downloading (~2-5GB, one-time) |
| Out of memory | Add swap: `sudo fallocate -l 2G /swapfile && sudo swapon /swapfile` |
| Container won't start | Check logs: `docker compose -f docker compose.server.yml logs` |

## What's Different from Original?

- Added Tailscale-specific documentation
- Optimized for 8GB RAM server
- One-command deploy/update scripts
- No public IP/SSL needed (Tailscale handles it)
- Easy local dev with make (no Docker)

See `DEPLOY_TAILSCALE.md` for detailed server documentation.
