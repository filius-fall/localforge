# Docker Deployment - Quick Reference

## Files Created

| File | Purpose |
|------|---------|
| `docker compose.server.yml` | Production Compose file with resource limits |
| `.env.server` | Production environment variables |
| `.dockerignore` | Files to exclude from Docker builds |
| `deploy.sh` | One-command deployment script |
| `DEPLOY_SERVER.md` | Detailed deployment guide |

## One-Command Deployment

```bash
./deploy.sh
```

## Manual Deployment

```bash
# Configure environment
cp .env.server .env

# Build and start
docker compose -f docker compose.server.yml up -d

# Check status
docker compose -f docker compose.server.yml ps
```

## Server-Specific Optimizations

### Memory Limits (8GB RAM)
- Backend: 5GB max
- Frontend: 512MB max
- System: ~2.5GB reserved

### CPU Allocation (i3-6100, 2 cores)
- Backend: 1.5 cores max
- Frontend: 0.5 cores max
- System: Reserved

### ML Tool Optimization
Environment variables set for optimal threading:
```bash
OMP_NUM_THREADS=2
OPENBLAS_NUM_THREADS=2
MKL_NUM_THREADS=2
```

## Access Points

| Service | URL |
|----------|------|
| Frontend | http://localhost or http://server-ip |
| Backend API | http://localhost:8000/api |
| Health Check | http://localhost:8000/api/health |

## Common Commands

```bash
# View logs
docker compose -f docker compose.server.yml logs -f

# Restart services
docker compose -f docker compose.server.yml restart

# Stop services
docker compose -f docker compose.server.yml down

# Update to latest version
git pull && docker compose -f docker compose.server.yml up -d --build

# Clean up unused images
docker image prune -a -f

# Check resource usage
docker stats
```

## Troubleshooting

| Issue | Solution |
|--------|----------|
| Port 80 in use | Change port in docker compose.server.yml or stop conflicting service |
| Out of memory | Reduce concurrent operations or add swap: `sudo fallocate -l 2G /swapfile && sudo swapon /swapfile` |
| Can't access externally | Check firewall: `sudo ufw allow 80/tcp` |
| Slow first run | ML models downloading; check logs for progress |

## Health Checks

Services include automatic health checks:
- Backend: `/api/health` endpoint
- Frontend: HTTP root endpoint

Check health status:
```bash
docker inspect localforge-backend | grep -A 10 Health
docker inspect localforge-frontend | grep -A 10 Health
```

## Data Persistence

ML model cache persisted in volume:
- Volume: `ml_cache`
- Purpose: Cache downloaded ML models between restarts
- Location: `/tmp/.cache` in container

View volume:
```bash
docker volume inspect localforge_ml_cache
```

## Resource Monitoring

Real-time stats:
```bash
docker stats localforge-backend localforge-frontend
```

Expected usage (normal operation):
- Backend: 2-3GB RAM, 10-30% CPU
- Frontend: 50-100MB RAM, <5% CPU

During ML operations:
- Backend: 3-5GB RAM (OCR, face detection, etc.)
- CPU may spike to 100% briefly

## Production Checklist

Before exposing to internet:

- [ ] Configure CORS origins in `.env`
- [ ] Set up firewall rules
- [ ] Configure HTTPS/SSL certificates
- [ ] Set up domain DNS
- [ ] Configure backup strategy
- [ ] Set up monitoring/alerting
- [ ] Review security headers

See `DEPLOY_SERVER.md` for detailed production setup.
