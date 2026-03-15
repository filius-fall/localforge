# LocalForge Server Deployment Guide

## Server Specifications

- **CPU**: Intel Core i3-6100 @ 3.70GHz (2 cores, 4 threads)
- **RAM**: 8GB
- **Storage**: 256GB SSD
- **OS**: Linux

## Quick Start

### 1. Clone Repository

```bash
git clone <your-repo-url> /opt/localforge
cd /opt/localforge
```

### 2. Configure Environment

```bash
cp .env.server .env
# Edit .env if needed (CORS origins, etc.)
```

### 3. Build and Start

```bash
# Build images
docker compose -f docker compose.server.yml build

# Start services
docker compose -f docker compose.server.yml up -d
```

### 4. Verify Deployment

```bash
# Check services are running
docker compose -f docker compose.server.yml ps

# Check health
curl http://localhost/api/health
curl http://localhost/
```

## Access

- **Frontend**: http://localhost or http://your-server-ip
- **Backend API**: http://localhost:8000/api

## Resource Configuration

### Memory Limits

Your server has 8GB RAM. The configuration allocates:
- **Backend**: 5GB max (includes ML tools)
- **Frontend**: 512MB max
- **System/OS**: ~2.5GB reserved

### ML Tool Memory Usage

| Tool | Memory Required | Notes |
|------|----------------|--------|
| OCR (easyocr) | 2-3GB | First load only |
| Face Detection | 1-2GB | Per request |
| Background Removal | 1-2GB | Per request |
| Whisper (small) | 2-3GB | Per request |

### CPU Allocation

- **Backend**: 1.5 cores max (leaves 0.5 for system)
- **Frontend**: 0.5 cores max
- **System**: Reserved

## Management

### View Logs

```bash
# All services
docker compose -f docker compose.server.yml logs -f

# Backend only
docker compose -f docker compose.server.yml logs -f backend

# Frontend only
docker compose -f docker compose.server.yml logs -f frontend
```

### Stop Services

```bash
docker compose -f docker compose.server.yml down
```

### Restart Services

```bash
docker compose -f docker compose.server.yml restart
```

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker compose -f docker compose.server.yml up -d --build
```

### Clean Up (Remove Old Images)

```bash
docker image prune -a -f
docker system prune -f
```

## Troubleshooting

### Backend Out of Memory

If you encounter OOM errors:

```bash
# Check memory usage
docker stats localforge-backend

# If consistently hitting limits, reduce concurrent ML operations
# or add swap space:
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Slow ML Operations

First runs are slower (models need to download). Check logs:

```bash
docker compose -f docker compose.server.yml logs backend | grep -i download
```

### Cannot Access from External IP

If you can access via localhost but not external IP:

```bash
# Check firewall
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 8000/tcp

# Check if service is listening
sudo netstat -tlnp | grep -E ':(80|8000)'
```

### Service Won't Start

```bash
# Check detailed logs
docker compose -f docker compose.server.yml logs

# Check health status
docker inspect localforge-backend | grep -A 10 Health
```

## Performance Monitoring

### Real-time Stats

```bash
docker stats
```

### Disk Usage

```bash
docker system df
```

### Volume Cleanup

```bash
docker compose -f docker compose.server.yml down -v
```

## Security Considerations

1. **Change Default Ports**: If exposing publicly, consider using different ports
2. **HTTPS**: Add reverse proxy (Nginx/Apache) with SSL certificates
3. **Firewall**: Only expose ports 80/443 to internet, keep 8000 internal
4. **Updates**: Regularly run `git pull` and `docker compose up -d --build`

## Backup

### Backup Data

```bash
# Backup volumes (if you add persistent data volumes)
docker run --rm -v localforge_ml_cache:/data -v $(pwd):/backup alpine tar czf /backup/ml_cache.tar.gz -C /data .
```

### Restore Data

```bash
docker run --rm -v localforge_ml_cache:/data -v $(pwd):/backup alpine tar xzf /backup/ml_cache.tar.gz -C /data
```

## Production Recommendations

1. **Add SSL**: Use Let's Encrypt with Certbot
2. **Domain**: Point your domain to server IP
3. **Monitoring**: Set up health checks and alerting
4. **Updates**: Automate updates with cron or GitHub Actions
5. **Backup**: Schedule regular backups of configuration and volumes

## Support

- Issues: https://github.com/filius-fall/localforge/issues
- Docs: Check README.md for tool-specific documentation
