# LocalForge

LocalForge is a multi-tool web app that hosts focused utilities in one place.

Initial tools:
- Time zone converter
- Image converter
- HTML compiler (live preview)

Stack:
- Backend: FastAPI
- Frontend: React + Vite

Repository layout (planned):
- `apps/backend`
- `apps/frontend`

Quick start (backend):
- `python3 -m venv .venv && source .venv/bin/activate`
- `pip install -r apps/backend/requirements.txt`
- `uvicorn app.main:app --reload --app-dir apps/backend`
