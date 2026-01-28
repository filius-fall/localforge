# LocalForge - Agent Guidelines

## Project Overview
Monorepo with FastAPI backend (Python 3.12+) and React + Vite frontend (TypeScript).
Local-first developer utilities: file conversion, data generation, color manipulation, architecture decision tracking.

## Build/Test Commands

### Backend (FastAPI)
```bash
# Install dependencies
cd apps/backend && uv sync --group dev

# Run development server
uv run fastapi dev

# Run all tests
uv run pytest

# Run single test
uv run pytest tests/test_api.py::test_health_check

# Run tests with coverage
uv run pytest --cov=app --cov-report=html --cov-report=term

# Linting
uv run ruff check .
uv run mypy app/

# Formatting
uv run ruff format app/
```

### Frontend (React + Vite + TypeScript)
```bash
# Install dependencies
cd apps/frontend && npm install

# Run development server
npm run dev

# Run all tests
npm test -- --run

# Run single test file
npm test -- --run src/test/example.test.ts

# Build for production
npm run build

# Linting
npm run lint

# Formatting
npm run format
```

### Root Makefile
Use `make help` for all available commands.
- `make dev` - Start both backend (8000) and frontend (5173)
- `make test` - Run all tests (backend + frontend)
- `make lint` - Run all linters (backend + frontend)
- `make format` - Format all code (backend + frontend)

## Code Style Guidelines

### Backend (Python)
- **Type hints**: Modern Python 3.12 style (`list[str]` not `List[str]`)
- **Imports**: Standard library → third-party → local modules
- **Logging**: Structured format: `logger.info("key=value", var1, var2)`
- **Error handling**: `raise HTTPException(status_code, detail)` with explicit exception chaining (`from exc`)
- **Function naming**: `snake_case`
- **Private functions**: Prefix with underscore (`_save_upload`, `_resolve_format`)
- **Pydantic models**: Use `Field(..., examples=[...])` for request fields
- **File organization**:
  - `apps/backend/app/main.py` - Main FastAPI app and endpoints
  - `apps/backend/app/decision_logger.py` - Router modules
  - `apps/backend/tests/` - Test files with `TestClient`

**Example error handling:**
```python
try:
    result = process()
except Exception as exc:
    logger.error("operation.failed", detail=str(exc))
    raise HTTPException(status_code=500, detail="Operation failed") from exc
```

### Frontend (TypeScript + React)
- **TypeScript config**: Strict mode enabled, no unused locals/parameters, no `any`
- **Components**: Functional components with simple exports (no `export default ComponentName`)
- **JSX**: `react-jsx` transform (no explicit React imports)
- **File organization**:
  - `src/pages/` - Page components (e.g., `TimezoneConverter.tsx`)
  - `src/components/` - Reusable components (e.g., `ToolLayout.tsx`, `SideNav.tsx`)
  - `src/lib/` - Utilities (e.g., `api.ts`, `clipboard.ts`)
  - `src/test/` - Test utilities (setup files, test helpers)

**Component pattern:**
```tsx
interface ComponentProps {
  value: string
  onChange: (value: string) => void
}

function Component({ value, onChange }: ComponentProps) {
  return <div>{value}</div>
}

export default Component
```

**API calls pattern** (centralized in `src/lib/api.ts`):
```ts
const API_BASE = import.meta.env.VITE_API_URL ?? ''

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(`Request failed: ${response.status}`)
  return response.json() as T
}
```

### Testing
- **Backend**: pytest with TestClient. Test files in `apps/backend/tests/`. Use helper functions for test data generation (`make_pdf_bytes`, `make_image_bytes`).
- **Frontend**: Vitest with jsdom. Test files co-located with components or in `src/test/`. Global test functions available (`describe`, `it`, `expect`).

## Tooling Configuration

### Backend
- **Package manager**: uv (fast Python dependency manager)
- **Linter**: ruff (fast Python linter/formatter), mypy (type checker)
- **Testing**: pytest, TestClient from fastapi.testclient
- **Key deps**: fastapi, uvicorn, pydantic, pandas, pillow, pypdf

### Frontend
- **Package manager**: npm
- **Linter**: ESLint with TypeScript ESLint, React Hooks, React Refresh plugins
- **Testing**: Vitest with jsdom, @testing-library/react, @testing-library/jest-dom
- **Build**: Vite with @vitejs/plugin-react
- **Key deps**: react 19, react-router-dom 7, @faker-js/faker, papaparse, qrcode

## Important Notes

### Environment Variables
Backend requires `.env` file (copy from `.env.example`):
- `GH_TOKEN` - GitHub personal access token for Decision Logger
- `DECISION_LOG_OWNER` - GitHub username
- `DECISION_LOG_REPO` - Repository name for ADRs
- `DECISION_LOG_BRANCH` - Branch name (default: main)

Never commit `.env` file to git.

### CORS Configuration
Backend only allows origins: `http://localhost:5173`, `http://localhost:4173`.
Frontend dev server proxies `/api` to `http://localhost:8000`.

### Clipboard API
Clipboard writes require HTTPS or localhost. HTTP/raw IP addresses will block clipboard operations.

### System Dependencies
Some endpoints require external binaries (returns 501 if missing):
- PDF optimization: `gs` (Ghostscript)
- DOCX/PDF conversion: `soffice` (LibreOffice)
- Markdown to PDF: `pandoc`, `wkhtmltopdf`
- Media tools: `ffmpeg`

### No Existing Rules
No `.cursorrules`, `.cursor/rules/`, or `.github/copilot-instructions.md` found. Follow the patterns documented above.
