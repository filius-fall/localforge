# LocalForge

LocalForge is a multi-tool web application that hosts developer utilities in one place, built for local-first workflows. It provides quick access to tools for file conversion, data generation, color manipulation, and architecture decision tracking.

## What is LocalForge?

A collection of developer-focused utilities for everyday tasks:
- **File & Media Tools**: Convert, resize, and process images, PDFs, documents, audio, and video
- **Text & Code Helpers**: Lorem ipsum generator, base converters, clipboard history, regex, and JSON/CSV utilities
- **Time & Date Tools**: Time zone conversion and timestamp generation
- **Color Tools**: Color picker, palette extractor, and HEX/RGB converter
- **Network Tools**: QR generator, ping, DNS lookup, and port checking
- **Decision Logger**: Architecture Decision Records (ADRs) stored in a private GitHub repository

## Quick Start

```bash
# Clone and start (development mode)
git clone <your-repo-url>
cd localforge

# Backend (requires Python 3.11+)
cd apps/backend
uv sync --group dev
uv run fastapi dev

# Frontend (requires Node.js 18+)
cd apps/frontend
npm install
npm run dev
```

Access the app at `http://localhost:5173`. The backend API runs at `http://localhost:8000`.

## Local Development

### Backend
```bash
cd apps/backend
uv sync --group dev
uv run fastapi dev
```

### Frontend
```bash
cd apps/frontend
npm install
npm run dev
```

## Testing

```bash
# Backend
cd apps/backend
uv run pytest

# Frontend
cd apps/frontend
npm test
```

## Environment Variables

### Decision Logger (GitHub ADR storage)

Required for `POST /api/decisions`. Creates markdown ADRs in a private GitHub repository.

```bash
# Generate token with repo scope (recommended method)
export GH_TOKEN=$(gh auth token)

# Required configuration
export DECISION_LOG_OWNER="your-username-or-org"
export DECISION_LOG_REPO="localforge-decisions"
export DECISION_LOG_BRANCH="main"  # Optional, defaults to main
```

**Important**: The `GH_TOKEN` must have `repo` scope. Use `gh auth token --scopes repo` to verify.

## Clipboard Notes

Clipboard writes require HTTPS or localhost. Accessing the app via HTTP or raw IP addresses may block clipboard operations due to browser security restrictions.

## Tools Included

### Core Tools
- **Time Zone Converter**: Convert dates and times across time zones
- **Image Toolkit**: Convert, resize, crop, watermark, and strip EXIF from images
- **HTML Compiler**: Live preview of HTML, CSS, and JavaScript in a sandbox
- **PDF Toolkit**: Merge, split, rotate, and optimize PDF files
- **File Converter**: Convert between DOCX, PDF, CSV, XLSX, and Markdown
- **Video & Audio Tools**: Trim, convert, compress, and extract audio
- **Text Utilities**: Case conversion, deduplication, regex, and JSON/CSV helpers
- **QR Generator**: Generate QR codes for links or text
- **Network Helpers**: Ping, DNS lookup, port checks, and IP information
- **Code Tools**: Base64 encoding, JSON formatting, and code utilities
- **Clipboard History**: Keep a local trail of clipboard snippets (50 entries max)
- **Timestamp Tools**: Generate Unix timestamps and formatted dates
- **Notes & Snippets**: Save text snippets and notes locally

### New Tools (from Backlog)
- **Lorem Ipsum Generator**: Generate placeholder text with configurable length (paragraphs, sentences, words)
- **Emoji Picker**: Search, select, and copy emojis with skin tone support
- **Color Picker**: Pick colors and copy HEX/RGB values
- **Mock API Server**: Create custom HTTP endpoints with configurable responses, delays, and status codes
- **Data Generator**: Generate fake profiles, addresses, and company data for testing
- **Palette Generator**: Extract color palettes (up to 8 colors) from uploaded images
- **Base Converter**: Convert numbers between binary, octal, decimal, and hexadecimal
- **Color Converter**: Bidirectional HEX ↔ RGB conversion with validation
- **Decision Logger**: Log architecture decisions with GitHub integration (creates ADRs as markdown files)

## Stack

- **Backend**: FastAPI (Python 3.11+)
- **Frontend**: React + Vite (TypeScript)
- **Storage**: localStorage (clipboard history, decisions) + Private GitHub repo (Decision Logger)

## Production Deployment (Ubuntu with HTTPS)

### 1. Install Docker
```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Clone and configure
```bash
git clone <your-repo-url> localforge
cd localforge
```

Create `.env` file for backend environment variables:
```bash
# Copy from example and fill in your values
cp .env.example .env

# Or manually set (DO NOT commit .env to git!)
export GH_TOKEN="your_github_pat_here"
export DECISION_LOG_OWNER="your-github-username"
export DECISION_LOG_REPO="localforge-decisions"
export DECISION_LOG_BRANCH="main"
```

**Important**: Never commit `.env` file to git - it contains secrets. Use `.env.example` as a template only.

### 3. Docker Compose file
Create `docker-compose.yml`:
```yaml
version: "3.9"
services:
  backend:
    build: ./apps/backend
    container_name: localforge-backend
    env_file:
      - .env
    ports:
      - "8000:8000"

  frontend:
    build: ./apps/frontend
    container_name: localforge-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

Start services:
```bash
docker compose up -d --build
```

### 4. Add domain and configure Nginx

#### Install Nginx and Certbot
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

#### Configure Nginx
Create `/etc/nginx/sites-available/localforge`:
```nginx
server {
  listen 80;
  server_name yourdomain.com www.yourdomain.com;

  location / {
    proxy_pass http://127.0.0.1:80;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/localforge /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Enable HTTPS with Let's Encrypt
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot will automatically configure Nginx for HTTPS.

### 5. Verify deployment
```bash
# Frontend (HTTPS)
curl -I https://yourdomain.com

# Backend health check
curl https://yourdomain.com/api/health
```

## Repo Layout

- `apps/backend/` (FastAPI)
- `apps/frontend/` (React + Vite)

## API Endpoints

### Core Endpoints
- `GET /api/health` - Health check
- `GET /api/tools` - List available tools
- `POST /api/timezone/convert` - Convert time zones
- `POST /api/image/convert` - Convert images
- `POST /api/decisions/health` - Decision Logger configuration check
- `POST /api/decisions` - Create architecture decision (writes to private GitHub repo)

### Tool-Specific Endpoints
- `GET /api/timezone/zones` - List time zones
- `GET /api/mock/routes` - List mock API routes
- `POST /api/mock/routes` - Create mock route
- `PUT /api/mock/routes/{id}` - Update mock route
- `DELETE /api/mock/routes/{id}` - Delete mock route
- `GET /mock/*` - Serve mock responses
