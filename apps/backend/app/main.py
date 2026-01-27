from datetime import datetime as DateTime
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError, available_timezones

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


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


class TimezoneConvertRequest(BaseModel):
    source_tz: str = Field(..., examples=["UTC"])
    target_tz: str = Field(..., examples=["America/New_York"])
    datetime: DateTime = Field(..., description="ISO 8601 datetime")


class TimezoneConvertResponse(BaseModel):
    source_tz: str
    target_tz: str
    input_datetime: str
    output_datetime: str
    output_label: str


def _get_zone(name: str) -> ZoneInfo:
    try:
        return ZoneInfo(name)
    except ZoneInfoNotFoundError as exc:
        raise HTTPException(
            status_code=400, detail=f"Unknown timezone: {name}"
        ) from exc


@app.get("/api/timezone/zones")
async def list_timezones() -> list[str]:
    return sorted(available_timezones())


@app.post("/api/timezone/convert", response_model=TimezoneConvertResponse)
async def convert_timezone(payload: TimezoneConvertRequest) -> TimezoneConvertResponse:
    source_zone = _get_zone(payload.source_tz)
    target_zone = _get_zone(payload.target_tz)

    source_dt = payload.datetime
    if source_dt.tzinfo is None:
        source_dt = source_dt.replace(tzinfo=source_zone)
    else:
        source_dt = source_dt.astimezone(source_zone)

    target_dt = source_dt.astimezone(target_zone)
    return TimezoneConvertResponse(
        source_tz=payload.source_tz,
        target_tz=payload.target_tz,
        input_datetime=source_dt.isoformat(),
        output_datetime=target_dt.isoformat(),
        output_label=target_dt.strftime("%Y-%m-%d %H:%M %Z"),
    )
