# LocalForge

LocalForge is a multi-tool web app that hosts focused utilities in one place.

Tools included:
- Time zone converter
- Image toolkit (convert/resize/crop/watermark/strip EXIF)
- HTML compiler (live preview)
- PDF toolkit
- File converter (DOCX/PDF/CSV/XLSX/Markdown)
- Video & audio tools
- Text utilities
- QR generator
- Network helpers
- Code tools
- Clipboard history
- Timestamp tools
- Notes & snippets

Stack:
- Backend: FastAPI
- Frontend: React + Vite

Repository layout:
- `apps/backend` (FastAPI)
- `apps/frontend` (React + Vite)

## Prerequisites
- uv (Python package manager)
- Node.js 20+

## Backend (FastAPI)
```bash
cd apps/backend
uv sync --group dev
uv run fastapi dev
```

Backend runs at `http://localhost:8000`.

## Frontend (React + Vite)
```bash
cd apps/frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and proxies `/api` to the backend.

## Docker (Ubuntu/RPi)
This setup runs everything in containers with one command. Use the Docker v2 CLI:

```bash
docker compose up --build
```

Services:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`

The backend container includes required system tools:
- `ffmpeg` for audio/video operations
- `libreoffice` for DOCX/PDF conversions
- `pandoc` + `wkhtmltopdf` for Markdown → PDF
- `ghostscript` for PDF optimization

## Search Engine Indexing
This app ships with no-index protections enabled:
- `robots.txt` disallows all crawling
- `X-Robots-Tag: noindex, nofollow` headers
- `<meta name="robots" content="noindex, nofollow">`

## Testing
```bash
# Backend
cd apps/backend
uv run pytest

# Frontend
cd apps/frontend
npm test
```

## Environment

### GitHub Workflow for Decision Logger
The Decision Logger requires a private GitHub repository for ADR (Architecture Decision Record) storage.

**Required Environment Variables:**
- `GH_TOKEN` (required): GitHub Personal Access Token with `repo` scope
  ```bash
  # Generate token: https://github.com/settings/tokens
  # Scope: repo (full control of private repositories)
  export GH_TOKEN="ghp_..."
  ```

- `DECISION_LOG_OWNER` (required): GitHub username for Decision Logger repo
  ```bash
  export DECISION_LOG_OWNER="filius-fall"
  ```

- `DECISION_LOG_REPO` (required): Name of Decision Logger repository
  ```bash
  export DECISION_LOG_REPO="localforge-decisions"
  ```

- `DECISION_LOG_BRANCH` (required): Default branch for Decision Logger repo
  ```bash
  export DECISION_LOG_BRANCH="main"
  ```

**Setup Instructions:**
```bash
# 1. Generate GitHub PAT with repo scope
gh auth login
gh auth token  # Copy the PAT

# 2. Create private Decision Logger repo
gh repo create localforge-decisions --private --description "Decision logging repository for LocalForge project"

# 3. Export environment variables
export GH_TOKEN="your-pat-here"
export DECISION_LOG_OWNER="filius-fall"
export DECISION_LOG_REPO="localforge-decisions"
export DECISION_LOG_BRANCH="main"

# 4. Verify setup
gh auth status
gh repo view localforge-decisions
```

**Notes:**
- DO NOT commit `GH_TOKEN` to the repository or client code
- Token should only be used via GitHub CLI (`gh`) or API
- All ADRs are stored at: `https://github.com/<DECISION_LOG_OWNER>/<DECISION_LOG_REPO>`

### Application Environment
- `VITE_API_URL` (optional): override the API base URL. Defaults to Vite proxy.

## API Endpoints (MVP)
- `GET /api/health`
- `GET /api/tools`
- `GET /api/timezone/zones`
- `POST /api/timezone/convert`
- `POST /api/image/convert`
