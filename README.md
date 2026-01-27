# LocalForge

LocalForge is a multi-tool web app that hosts focused utilities in one place.

Initial tools:
- Time zone converter
- Image converter
- HTML compiler (live preview)

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
