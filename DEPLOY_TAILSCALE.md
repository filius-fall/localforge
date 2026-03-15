# LocalForge Tailscale Deployment

## Server
- **CPU**: Intel Core i3-6100 @ 3.70GHz (2 cores, 4 threads)
- **RAM**: 8GB
- **Storage**: 256GB SSD
- **Network**: Tailscale

## Quick Start (One Command)

```bash
# On the server
./deploy.sh
```

## Access via Tailscale

Once deployed, access LocalForge via your server's Tailscale IP:

```bash
# Get Tailscale IP on the server
tailscale ip -4

# Access from your machine
# Frontend: http://<tailscale-ip>
# Backend API: http://<tailscale-ip>:8000/api
```

Example:
```
Server Tailscale IP: 100.64.0.5

Access: http://100.64.0.5
```

## Why Tailscale is Perfect for LocalForge

✅ **No public exposure needed** - Keep port 80/443 closed to internet
✅ **Built-in encryption** - Tailscale provides encrypted tunnel
✅ **No SSL setup required** - Tailscale handles encryption
✅ **Private network** - Only your Tailscale devices can access
✅ **Easy access** - No VPN configuration needed on client devices

## Deployment Steps

### 1. Setup Server (One-time)

```bash
# SSH into server
ssh user@server-ip

# Clone repo
git clone <your-repo> /opt/localforge
cd /opt/localforge

# Deploy
./deploy.sh
```

### 2. Get Tailscale IP

```bash
tailscale ip -4
# Output: 100.x.x.x
```

### 3. Access from Any Device

Open your browser and navigate to:
```
http://<tailscale-ip>
```

That's it! Your device is already on the Tailscale network.

## Configuration

### Allow Multiple Tailscale Devices

If multiple devices will access LocalForge, update `.env`:

```bash
# Get Tailscale IPs of all devices
tailscale status

# Add to CORS (comma-separated)
CORS_ORIGINS=http://100.x.x.x,http://100.x.x.y,http://localhost
```

### Firewall (Optional but Recommended)

Even with Tailscale, keep your server secure:

```bash
# Allow Tailscale only (no direct internet access)
sudo ufw deny 80
sudo ufw deny 443
sudo ufw deny 8000

# Allow SSH (if needed)
sudo ufw allow 22

# Enable firewall
sudo ufw enable
```

## Update LocalForge on Server

```bash
# SSH into server
ssh user@server-ip
cd /opt/localforge

# Pull latest
git pull

# Rebuild and restart
docker compose -f docker compose.server.yml up -d --build
```

## Troubleshooting

### Can't Access from Local Machine

1. **Check Tailscale status** on both devices:
   ```bash
   # On server
   tailscale status

   # On your machine
   tailscale status
   ```

2. **Ensure both devices are logged in** to same Tailscale account

3. **Check container is running**:
   ```bash
   docker compose -f docker compose.server.yml ps
   ```

4. **Check Tailscale IP hasn't changed**:
   ```bash
   tailscale ip -4
   ```

### Slow First Access

First load downloads ML models (~2-5GB). This happens once per deployment.

### Resource Limits

Your 8GB RAM is allocated:
- Backend (ML tools): 5GB max
- Frontend: 512MB max
- System: ~2.5GB reserved

If hitting memory limits:
```bash
# Add swap space (2GB)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## Backup

### Backup Configuration

```bash
# On server
cd /opt/localforge
tar czf localforge-config.tar.gz .env docker compose.server.yml
```

### Restore

```bash
tar xzf localforge-config.tar.gz
```

## Security Checklist

- [x] No public internet exposure (Tailscale only)
- [ ] Firewall configured (block ports 80/443/8000)
- [ ] Server updated regularly
- [ ] Backup configuration stored
- [ ] Only authorized devices on Tailscale network

## Quick Reference

| Command | Purpose |
|----------|---------|
| `tailscale ip -4` | Get server Tailscale IP |
| `tailscale status` | List all devices on network |
| `docker compose -f docker compose.server.yml logs -f` | View logs |
| `docker compose -f docker compose.server.yml restart` | Restart services |
| `docker stats localforge-backend` | Check resource usage |

## Access Summary

```
┌─────────────────┐           Tailscale           ┌─────────────────┐
│  Your Device    │ ──────────────────────────▶ │   Server       │
│  (Laptop/Phone)│      Encrypted Tunnel        │  (i3-6100)   │
│                 │                           │                 │
│  Access:        │                           │  LocalForge:    │
│  http://<ip>    │                           │  http://0.0.0.0  │
└─────────────────┘                           └─────────────────┘
```

No public IP needed. No SSL certificates needed. Just Tailscale!
