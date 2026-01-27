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
- `VITE_API_URL` (optional): override the API base URL. Defaults to Vite proxy.

## API Endpoints (MVP)
- `GET /api/health`
- `GET /api/tools`
- `GET /api/timezone/zones`
- `POST /api/timezone/convert`
- `POST /api/image/convert`
