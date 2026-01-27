from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="LocalForge API", version="0.1.0")

allowed_origins = [
    "http://localhost:5173",
    "http://localhost:4173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TOOLS = [
    {
        "slug": "timezone",
        "name": "Time Zone Converter",
        "path": "/tools/timezone",
        "description": "Convert dates and times across time zones.",
    },
    {
        "slug": "image",
        "name": "Image Converter",
        "path": "/tools/image",
        "description": "Convert images to common web formats.",
    },
    {
        "slug": "html",
        "name": "HTML Compiler",
        "path": "/tools/html",
        "description": "Live HTML, CSS, and JS preview.",
    },
]


@app.get("/api/health")
async def health_check() -> dict:
    return {"status": "ok"}


@app.get("/api/tools")
async def list_tools() -> list[dict]:
    return TOOLS
