from datetime import datetime as DateTime
import io
from typing import Iterable, cast
import logging
import re
import shutil
import socket
import subprocess
import tempfile
import time
import uuid
import zipfile
from pathlib import Path
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError, available_timezones

import dns.resolver
import pandas as pd
from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse, Response
from PIL import Image, ImageDraw, ImageFont
from pydantic import BaseModel, Field
from pypdf import PdfReader, PdfWriter

from app.decision_logger import router as decision_logger_router


logger = logging.getLogger("localforge")
if not logger.handlers:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
    )
logger.setLevel(logging.INFO)


app = FastAPI(title="LocalForge API", version="0.2.0")
app.include_router(decision_logger_router)


@app.middleware("http")
async def add_noindex_header(request: Request, call_next):
    request_id = uuid.uuid4().hex[:12]
    start_time = time.perf_counter()
    logger.info(
        "request.start id=%s method=%s path=%s",
        request_id,
        request.method,
        request.url.path,
    )
    try:
        response = await call_next(request)
    except Exception:
        logger.exception(
            "request.error id=%s method=%s path=%s",
            request_id,
            request.method,
            request.url.path,
        )
        raise
    duration_ms = (time.perf_counter() - start_time) * 1000
    response.headers["X-Robots-Tag"] = "noindex, nofollow"
    response.headers["X-Request-Id"] = request_id
    logger.info(
        "request.complete id=%s method=%s path=%s status=%s duration_ms=%.2f",
        request_id,
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    return response


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


@app.get("/robots.txt", response_class=PlainTextResponse)
async def robots_txt() -> str:
    return "User-agent: *\nDisallow: /\n"


TOOLS = [
    {
        "slug": "timezone",
        "name": "Time Zone Converter",
        "path": "/tools/timezone",
        "description": "Convert dates and times across time zones.",
    },
    {
        "slug": "image",
        "name": "Image Toolkit",
        "path": "/tools/image",
        "description": "Convert, resize, crop, and watermark images locally.",
    },
    {
        "slug": "html",
        "name": "HTML Compiler",
        "path": "/tools/html",
        "description": "Live HTML, CSS, and JS preview in a sandbox.",
    },
    {
        "slug": "pdf",
        "name": "PDF Toolkit",
        "path": "/tools/pdf",
        "description": "Merge, split, rotate, and optimize PDF files.",
    },
    {
        "slug": "convert",
        "name": "File Converter",
        "path": "/tools/convert",
        "description": "DOCX, PDF, CSV, XLSX, and Markdown conversions.",
    },
    {
        "slug": "media",
        "name": "Video & Audio Tools",
        "path": "/tools/media",
        "description": "Trim, convert, compress, and extract audio locally.",
    },
    {
        "slug": "text",
        "name": "Text Utilities",
        "path": "/tools/text",
        "description": "Case conversion, dedupe, regex, JSON/CSV helpers.",
    },
    {
        "slug": "qr",
        "name": "QR Generator",
        "path": "/tools/qr",
        "description": "Generate QR codes for links or text.",
    },
    {
        "slug": "network",
        "name": "Network Helpers",
        "path": "/tools/network",
        "description": "Ping, DNS lookup, port checks, and IP info.",
    },
    {
        "slug": "code",
        "name": "Code Tools",
        "path": "/tools/code",
        "description": "Beautify/minify code and Base64 helpers.",
    },
    {
        "slug": "clipboard",
        "name": "Clipboard History",
        "path": "/tools/clipboard",
        "description": "Local clipboard history with quick recall.",
    },
    {
        "slug": "time",
        "name": "Timestamp Tools",
        "path": "/tools/time",
        "description": "Epoch converter, cron helper, timezone compare.",
    },
    {
        "slug": "notes",
        "name": "Notes & Snippets",
        "path": "/tools/notes",
        "description": "Lightweight notes and code snippets stored locally.",
    },
    {
        "slug": "emoji",
        "name": "Emoji",
        "description": "Search, select, and copy emojis.",
        "path": "/tools/emoji",
    },
    {
        "slug": "color-picker",
        "name": "Color Picker",
        "description": "Pick colors and copy hex/rgb values.",
        "path": "/tools/color-picker",
    },
    {
        "slug": "mock-api",
        "name": "Mock API Server",
        "description": "Create and manage mock API responses.",
        "path": "/tools/mock-api",
    },
    {
        "slug": "data-generator",
        "name": "Data Generator",
        "description": "Generate fake profiles, addresses, and company data.",
        "path": "/tools/data-generator",
    },
    {
        "slug": "palette-generator",
        "name": "Palette Generator",
        "description": "Extract dominant color palettes from images.",
        "path": "/tools/palette-generator",
    },
    {
        "slug": "base-converter",
        "name": "Base Converter",
        "description": "Convert numbers between binary, octal, decimal, and hexadecimal.",
        "path": "/tools/base-converter",
    },
    {
        "slug": "color-converter",
        "name": "Color Converter",
        "description": "Convert colors between HEX and RGB formats.",
        "path": "/tools/color-converter",
    },
    {
        "slug": "decision-logger",
        "name": "Decision Logger",
        "description": "Log and track architecture decisions (ADRs).",
        "path": "/tools/decision-logger",
    },
]

IMAGE_FORMATS = {
    "png": "PNG",
    "jpeg": "JPEG",
    "jpg": "JPEG",
    "webp": "WEBP",
}

IMAGE_MEDIA_TYPES = {
    "png": "image/png",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "webp": "image/webp",
}

MEDIA_MEDIA_TYPES = {
    "mp4": "video/mp4",
    "webm": "video/webm",
    "mov": "video/quicktime",
    "mp3": "audio/mpeg",
    "wav": "audio/wav",
    "m4a": "audio/mp4",
    "aac": "audio/aac",
}

AUDIO_FORMATS = {"mp3", "wav", "m4a", "aac"}
VIDEO_FORMATS = {"mp4", "webm", "mov"}

PDF_OPTIMIZE_LEVELS = {"screen", "ebook", "printer", "prepress"}
DNS_RECORD_TYPES = {"A", "AAAA", "CNAME", "MX", "TXT", "NS"}


def _safe_host(value: str) -> str:
    if not re.fullmatch(r"[A-Za-z0-9.-]+", value):
        raise HTTPException(status_code=400, detail="Invalid host.")
    return value


def _safe_port(port: int) -> int:
    if port < 1 or port > 65535:
        raise HTTPException(status_code=400, detail="Invalid port.")
    return port


def _ensure_binary(name: str) -> str:
    path = shutil.which(name)
    if not path:
        logger.error("dependency.missing name=%s", name)
        raise HTTPException(
            status_code=501, detail=f"Missing system dependency: {name}."
        )
    return path


def _find_libreoffice() -> str:
    for candidate in ("soffice", "libreoffice", "libreoffice7.5"):
        path = shutil.which(candidate)
        if path:
            logger.info("dependency.found name=libreoffice path=%s", path)
            return path
    logger.error("dependency.missing name=libreoffice")
    raise HTTPException(
        status_code=501,
        detail="LibreOffice is required for this conversion. "
        "If running in Docker, rebuild the image with 'docker compose build --no-cache'. "
        "For local dev, install LibreOffice: sudo apt install libreoffice-writer",
    )


def _run_command(args: list[str], error_message: str) -> None:
    try:
        logger.info("command.run tool=%s", args[0])
        subprocess.run(
            args, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
        )
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=501, detail=f"Missing system dependency: {args[0]}"
        ) from exc
    except subprocess.CalledProcessError as exc:
        stderr = exc.stderr.strip() or exc.stdout.strip()
        logger.error("command.failed tool=%s error=%s", args[0], stderr)
        raise HTTPException(
            status_code=400, detail=f"{error_message} {stderr}"
        ) from exc


async def _save_upload(file: UploadFile, path: Path) -> None:
    content = await file.read()
    path.write_bytes(content)


def _response_from_bytes(data: bytes, media_type: str, filename: str) -> Response:
    return Response(
        content=data,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


def _response_from_file(path: Path, media_type: str, filename: str) -> Response:
    return _response_from_bytes(path.read_bytes(), media_type, filename)


def _parse_page_ranges(ranges: str | None, total_pages: int) -> list[list[int]]:
    if not ranges:
        return [[index] for index in range(total_pages)]

    groups: list[list[int]] = []
    for raw in ranges.split(","):
        chunk = raw.strip()
        if not chunk:
            continue
        if "-" in chunk:
            start_str, end_str = chunk.split("-", 1)
            start = int(start_str)
            end = int(end_str)
            if start < 1 or end > total_pages or start > end:
                raise HTTPException(status_code=400, detail="Invalid page range.")
            groups.append(list(range(start - 1, end)))
        else:
            page = int(chunk)
            if page < 1 or page > total_pages:
                raise HTTPException(status_code=400, detail="Invalid page range.")
            groups.append([page - 1])
    if not groups:
        raise HTTPException(status_code=400, detail="Invalid page range.")
    return groups


def _page_index_set(pages: str | None, total_pages: int) -> set[int]:
    if not pages:
        return set(range(total_pages))
    groups = _parse_page_ranges(pages, total_pages)
    return {index for group in groups for index in group}


def _resolve_image_format(file: UploadFile, target_format: str | None) -> str:
    if target_format:
        format_key = target_format.strip().lower()
    else:
        suffix = Path(file.filename or "").suffix.lower().lstrip(".")
        format_key = suffix if suffix in IMAGE_FORMATS else "png"

    if format_key not in IMAGE_FORMATS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported format. Use png, jpeg, or webp.",
        )
    return format_key


def _image_to_bytes(image: Image.Image, format_key: str) -> bytes:
    output = io.BytesIO()
    image.save(output, format=IMAGE_FORMATS[format_key])
    output.seek(0)
    return output.read()


def _image_response(image: Image.Image, format_key: str, filename: str) -> Response:
    data = _image_to_bytes(image, format_key)
    return _response_from_bytes(data, IMAGE_MEDIA_TYPES[format_key], filename)


@app.get("/api/health")
async def health_check() -> dict:
    logger.info("health.check")
    return {"status": "ok"}


@app.get("/api/tools")
async def list_tools() -> list[dict]:
    logger.info("tools.list count=%s", len(TOOLS))
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
    logger.info("timezone.zones.list")
    return sorted(available_timezones())


@app.post("/api/timezone/convert", response_model=TimezoneConvertResponse)
async def convert_timezone(payload: TimezoneConvertRequest) -> TimezoneConvertResponse:
    logger.info(
        "timezone.convert source=%s target=%s",
        payload.source_tz,
        payload.target_tz,
    )
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


@app.post("/api/pdf/merge")
async def merge_pdf(files: list[UploadFile] = File(...)) -> Response:
    logger.info("pdf.merge count=%s", len(files))
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="Upload at least two PDFs.")

    writer = PdfWriter()
    for file in files:
        data = await file.read()
        try:
            reader = PdfReader(io.BytesIO(data))
        except Exception as exc:
            raise HTTPException(status_code=400, detail="Invalid PDF file.") from exc
        for page in reader.pages:
            writer.add_page(page)

    output = io.BytesIO()
    writer.write(output)
    output.seek(0)
    return _response_from_bytes(output.read(), "application/pdf", "merged.pdf")


@app.post("/api/pdf/split")
async def split_pdf(
    file: UploadFile = File(...),
    ranges: str | None = Form(None),
) -> Response:
    logger.info("pdf.split name=%s ranges=%s", file.filename, ranges or "all")
    data = await file.read()
    try:
        reader = PdfReader(io.BytesIO(data))
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid PDF file.") from exc

    groups = _parse_page_ranges(ranges, len(reader.pages))
    archive = io.BytesIO()
    with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for index, pages in enumerate(groups, start=1):
            writer = PdfWriter()
            for page_index in pages:
                writer.add_page(reader.pages[page_index])
            output = io.BytesIO()
            writer.write(output)
            output.seek(0)
            zip_file.writestr(f"split-{index}.pdf", output.read())

    archive.seek(0)
    return _response_from_bytes(archive.read(), "application/zip", "split-pdfs.zip")


@app.post("/api/pdf/rotate")
async def rotate_pdf(
    file: UploadFile = File(...),
    angle: int = Form(...),
    pages: str | None = Form(None),
) -> Response:
    logger.info(
        "pdf.rotate name=%s angle=%s pages=%s",
        file.filename,
        angle,
        pages or "all",
    )
    if angle not in {90, 180, 270}:
        raise HTTPException(status_code=400, detail="Angle must be 90, 180, or 270.")

    data = await file.read()
    try:
        reader = PdfReader(io.BytesIO(data))
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid PDF file.") from exc

    targets = _page_index_set(pages, len(reader.pages))
    writer = PdfWriter()
    for index, page in enumerate(reader.pages):
        if index in targets:
            page = page.rotate(angle)
        writer.add_page(page)

    output = io.BytesIO()
    writer.write(output)
    output.seek(0)
    return _response_from_bytes(output.read(), "application/pdf", "rotated.pdf")


@app.post("/api/pdf/optimize")
async def optimize_pdf(
    file: UploadFile = File(...),
    level: str = Form("screen"),
) -> Response:
    logger.info("pdf.optimize name=%s level=%s", file.filename, level)
    level_key = level.strip().lower()
    if level_key not in PDF_OPTIMIZE_LEVELS:
        raise HTTPException(
            status_code=400,
            detail="Level must be screen, ebook, printer, or prepress.",
        )

    gs = _ensure_binary("gs")
    with tempfile.TemporaryDirectory() as tmp_dir:
        input_path = Path(tmp_dir) / "input.pdf"
        output_path = Path(tmp_dir) / "optimized.pdf"
        await _save_upload(file, input_path)
        args = [
            gs,
            "-sDEVICE=pdfwrite",
            "-dCompatibilityLevel=1.4",
            f"-dPDFSETTINGS=/{level_key}",
            "-dNOPAUSE",
            "-dBATCH",
            "-dQUIET",
            f"-sOutputFile={output_path}",
            str(input_path),
        ]
        _run_command(args, "PDF optimization failed.")
        return _response_from_file(output_path, "application/pdf", "optimized.pdf")


@app.post("/api/convert/docx-to-pdf")
async def docx_to_pdf(file: UploadFile = File(...)) -> Response:
    logger.info("convert.docx_to_pdf name=%s", file.filename)
    soffice = _find_libreoffice()
    with tempfile.TemporaryDirectory() as tmp_dir:
        input_path = Path(tmp_dir) / "input.docx"
        await _save_upload(file, input_path)
        _run_command(
            [
                soffice,
                "--headless",
                "--convert-to",
                "pdf",
                "--outdir",
                tmp_dir,
                str(input_path),
            ],
            "DOCX conversion failed.",
        )
        output_path = next(Path(tmp_dir).glob("input*.pdf"), None)
        if not output_path:
            raise HTTPException(
                status_code=500, detail="Conversion produced no output."
            )
        return _response_from_file(output_path, "application/pdf", "converted.pdf")


@app.post("/api/convert/pdf-to-docx")
async def pdf_to_docx(file: UploadFile = File(...)) -> Response:
    logger.info("convert.pdf_to_docx name=%s", file.filename)
    soffice = _find_libreoffice()
    with tempfile.TemporaryDirectory() as tmp_dir:
        input_path = Path(tmp_dir) / "input.pdf"
        await _save_upload(file, input_path)
        _run_command(
            [
                soffice,
                "--headless",
                "--infilter=writer_pdf_import",
                "--convert-to",
                "docx:Office Open XML Text",
                "--outdir",
                tmp_dir,
                str(input_path),
            ],
            "PDF conversion failed.",
        )
        output_path = next(Path(tmp_dir).glob("input*.docx"), None)
        if not output_path:
            raise HTTPException(
                status_code=500, detail="Conversion produced no output."
            )
        media_type = (
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
        return _response_from_file(output_path, media_type, "converted.docx")


@app.post("/api/convert/csv-to-xlsx")
async def csv_to_xlsx(file: UploadFile = File(...)) -> Response:
    logger.info("convert.csv_to_xlsx name=%s", file.filename)
    with tempfile.TemporaryDirectory() as tmp_dir:
        input_path = Path(tmp_dir) / "input.csv"
        output_path = Path(tmp_dir) / "output.xlsx"
        await _save_upload(file, input_path)
        df = pd.read_csv(input_path)
        df.to_excel(output_path, index=False)
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        return _response_from_file(output_path, media_type, "converted.xlsx")


@app.post("/api/convert/xlsx-to-csv")
async def xlsx_to_csv(file: UploadFile = File(...)) -> Response:
    logger.info("convert.xlsx_to_csv name=%s", file.filename)
    with tempfile.TemporaryDirectory() as tmp_dir:
        input_path = Path(tmp_dir) / "input.xlsx"
        output_path = Path(tmp_dir) / "output.csv"
        await _save_upload(file, input_path)
        df = pd.read_excel(input_path)
        df.to_csv(output_path, index=False)
        return _response_from_file(output_path, "text/csv", "converted.csv")


@app.post("/api/convert/markdown-to-pdf")
async def markdown_to_pdf(file: UploadFile = File(...)) -> Response:
    logger.info("convert.markdown_to_pdf name=%s", file.filename)
    pandoc = _ensure_binary("pandoc")
    _ensure_binary("wkhtmltopdf")
    with tempfile.TemporaryDirectory() as tmp_dir:
        input_path = Path(tmp_dir) / "input.md"
        output_path = Path(tmp_dir) / "output.pdf"
        await _save_upload(file, input_path)
        _run_command(
            [
                pandoc,
                str(input_path),
                "-o",
                str(output_path),
                "--pdf-engine=wkhtmltopdf",
            ],
            "Markdown conversion failed.",
        )
        return _response_from_file(output_path, "application/pdf", "converted.pdf")


@app.post("/api/image/convert")
async def convert_image(
    file: UploadFile = File(...),
    target_format: str = Form(...),
) -> Response:
    logger.info(
        "image.convert name=%s target=%s",
        file.filename,
        target_format,
    )
    format_key = _resolve_image_format(file, target_format)
    try:
        image = Image.open(file.file)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid image file.") from exc

    if IMAGE_FORMATS[format_key] == "JPEG" and image.mode in ("RGBA", "P"):
        image = image.convert("RGB")

    filename = f"{Path(file.filename or 'image').stem}.{format_key}"
    return _image_response(image, format_key, filename)


@app.post("/api/image/resize")
async def resize_image(
    file: UploadFile = File(...),
    width: int | None = Form(None),
    height: int | None = Form(None),
    target_format: str | None = Form(None),
) -> Response:
    logger.info(
        "image.resize name=%s width=%s height=%s",
        file.filename,
        width,
        height,
    )
    if width is None and height is None:
        raise HTTPException(status_code=400, detail="Provide width or height.")

    format_key = _resolve_image_format(file, target_format)
    try:
        image = Image.open(file.file)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid image file.") from exc

    original_width, original_height = image.size
    target_width = width
    target_height = height
    if target_width is None:
        if target_height is None:
            raise HTTPException(status_code=400, detail="Provide width or height.")
        target_width = int(original_width * (target_height / original_height))
    if target_height is None:
        if target_width is None:
            raise HTTPException(status_code=400, detail="Provide width or height.")
        target_height = int(original_height * (target_width / original_width))

    resized = image.resize((target_width, target_height))
    if IMAGE_FORMATS[format_key] == "JPEG" and resized.mode in ("RGBA", "P"):
        resized = resized.convert("RGB")

    filename = f"{Path(file.filename or 'image').stem}-resize.{format_key}"
    return _image_response(resized, format_key, filename)


@app.post("/api/image/crop")
async def crop_image(
    file: UploadFile = File(...),
    x: int = Form(...),
    y: int = Form(...),
    width: int = Form(...),
    height: int = Form(...),
    target_format: str | None = Form(None),
) -> Response:
    logger.info(
        "image.crop name=%s x=%s y=%s width=%s height=%s",
        file.filename,
        x,
        y,
        width,
        height,
    )
    if width <= 0 or height <= 0:
        raise HTTPException(status_code=400, detail="Invalid crop size.")

    format_key = _resolve_image_format(file, target_format)
    try:
        image = Image.open(file.file)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid image file.") from exc

    cropped = image.crop((x, y, x + width, y + height))
    if IMAGE_FORMATS[format_key] == "JPEG" and cropped.mode in ("RGBA", "P"):
        cropped = cropped.convert("RGB")

    filename = f"{Path(file.filename or 'image').stem}-crop.{format_key}"
    return _image_response(cropped, format_key, filename)


@app.post("/api/image/watermark")
async def watermark_image(
    file: UploadFile = File(...),
    text: str = Form(...),
    target_format: str | None = Form(None),
) -> Response:
    logger.info(
        "image.watermark name=%s text_length=%s",
        file.filename,
        len(text),
    )
    format_key = _resolve_image_format(file, target_format)
    try:
        image = Image.open(file.file).convert("RGBA")
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid image file.") from exc

    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    font = ImageFont.load_default()
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    padding = 16
    position = (
        max(padding, image.width - text_width - padding),
        max(padding, image.height - text_height - padding),
    )
    draw.text(position, text, fill=(255, 255, 255, 160), font=font)
    combined = Image.alpha_composite(image, overlay)

    if IMAGE_FORMATS[format_key] == "JPEG":
        combined = combined.convert("RGB")

    filename = f"{Path(file.filename or 'image').stem}-watermark.{format_key}"
    return _image_response(combined, format_key, filename)


@app.post("/api/image/strip-exif")
async def strip_exif(
    file: UploadFile = File(...),
    target_format: str | None = Form(None),
) -> Response:
    logger.info("image.strip_exif name=%s", file.filename)
    format_key = _resolve_image_format(file, target_format)
    try:
        image = Image.open(file.file)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid image file.") from exc

    data = cast(Iterable, image.getdata())
    clean = Image.new(image.mode, image.size)
    clean.putdata(list(data))
    if IMAGE_FORMATS[format_key] == "JPEG" and clean.mode in ("RGBA", "P"):
        clean = clean.convert("RGB")

    filename = f"{Path(file.filename or 'image').stem}-clean.{format_key}"
    return _image_response(clean, format_key, filename)


@app.post("/api/media/convert")
async def convert_media(
    file: UploadFile = File(...),
    target_format: str = Form(...),
) -> Response:
    logger.info("media.convert name=%s target=%s", file.filename, target_format)
    format_key = target_format.strip().lower()
    if format_key not in MEDIA_MEDIA_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported media format.")

    ffmpeg = _ensure_binary("ffmpeg")
    with tempfile.TemporaryDirectory() as tmp_dir:
        suffix = Path(file.filename or "").suffix
        input_path = Path(tmp_dir) / f"input{suffix}"
        await _save_upload(file, input_path)
        output_path = Path(tmp_dir) / f"output.{format_key}"
        args = [ffmpeg, "-y", "-i", str(input_path)]
        if format_key in AUDIO_FORMATS:
            args += ["-vn"]
        args.append(str(output_path))
        _run_command(args, "Media conversion failed.")
        return _response_from_file(
            output_path, MEDIA_MEDIA_TYPES[format_key], f"converted.{format_key}"
        )


@app.post("/api/media/extract-audio")
async def extract_audio(
    file: UploadFile = File(...),
    target_format: str = Form("mp3"),
) -> Response:
    logger.info("media.extract_audio name=%s target=%s", file.filename, target_format)
    format_key = target_format.strip().lower()
    if format_key not in MEDIA_MEDIA_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported audio format.")

    ffmpeg = _ensure_binary("ffmpeg")
    with tempfile.TemporaryDirectory() as tmp_dir:
        suffix = Path(file.filename or "").suffix
        input_path = Path(tmp_dir) / f"input{suffix}"
        await _save_upload(file, input_path)
        output_path = Path(tmp_dir) / f"audio.{format_key}"
        _run_command(
            [ffmpeg, "-y", "-i", str(input_path), "-vn", str(output_path)],
            "Audio extraction failed.",
        )
        return _response_from_file(
            output_path, MEDIA_MEDIA_TYPES[format_key], f"audio.{format_key}"
        )


@app.post("/api/media/trim")
async def trim_media(
    file: UploadFile = File(...),
    start: float = Form(...),
    end: float = Form(...),
    target_format: str = Form("mp4"),
) -> Response:
    logger.info(
        "media.trim name=%s start=%s end=%s target=%s",
        file.filename,
        start,
        end,
        target_format,
    )
    if start < 0 or end <= start:
        raise HTTPException(status_code=400, detail="Invalid start/end time.")

    format_key = target_format.strip().lower()
    if format_key not in MEDIA_MEDIA_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported media format.")

    ffmpeg = _ensure_binary("ffmpeg")
    with tempfile.TemporaryDirectory() as tmp_dir:
        suffix = Path(file.filename or "").suffix
        input_path = Path(tmp_dir) / f"input{suffix}"
        await _save_upload(file, input_path)
        output_path = Path(tmp_dir) / f"trim.{format_key}"
        input_ext = suffix.lower().lstrip(".")
        args = [
            ffmpeg,
            "-y",
            "-ss",
            str(start),
            "-to",
            str(end),
            "-i",
            str(input_path),
        ]
        if input_ext == format_key:
            args += ["-c", "copy"]
        elif format_key in AUDIO_FORMATS:
            args += ["-vn", "-b:a", "128k"]
        else:
            args += ["-vcodec", "libx264", "-crf", "23", "-preset", "veryfast"]
        args.append(str(output_path))
        _run_command(args, "Trim failed.")
        return _response_from_file(
            output_path, MEDIA_MEDIA_TYPES[format_key], f"trimmed.{format_key}"
        )


@app.post("/api/media/compress")
async def compress_media(
    file: UploadFile = File(...),
    target_format: str = Form("mp4"),
) -> Response:
    logger.info("media.compress name=%s target=%s", file.filename, target_format)
    format_key = target_format.strip().lower()
    if format_key not in MEDIA_MEDIA_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported media format.")

    ffmpeg = _ensure_binary("ffmpeg")
    with tempfile.TemporaryDirectory() as tmp_dir:
        suffix = Path(file.filename or "").suffix
        input_path = Path(tmp_dir) / f"input{suffix}"
        await _save_upload(file, input_path)
        output_path = Path(tmp_dir) / f"compress.{format_key}"
        args = [ffmpeg, "-y", "-i", str(input_path)]
        if format_key in AUDIO_FORMATS:
            args += ["-b:a", "128k", str(output_path)]
        else:
            args += [
                "-vcodec",
                "libx264",
                "-crf",
                "28",
                "-preset",
                "veryfast",
                str(output_path),
            ]

        _run_command(args, "Compression failed.")
        return _response_from_file(
            output_path, MEDIA_MEDIA_TYPES[format_key], f"compressed.{format_key}"
        )


@app.get("/api/network/ip")
async def ip_info(request: Request) -> dict:
    logger.info("network.ip_info")
    server_host = socket.gethostname()
    server_ip = socket.gethostbyname(server_host)
    client_ip = request.client.host if request.client else "unknown"
    return {"server_host": server_host, "server_ip": server_ip, "client_ip": client_ip}


@app.get("/api/network/ping")
async def ping_host(host: str) -> dict:
    host = _safe_host(host)
    logger.info("network.ping host=%s", host)
    ping_bin = _ensure_binary("ping")
    try:
        result = subprocess.run(
            [ping_bin, "-c", "4", "-W", "2", host],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
    except subprocess.CalledProcessError as exc:
        message = exc.stderr.strip() or exc.stdout.strip()
        raise HTTPException(status_code=400, detail=message) from exc

    return {"host": host, "output": result.stdout}


@app.get("/api/network/dns")
async def dns_lookup(host: str, record_type: str = "A") -> dict:
    host = _safe_host(host)
    record = record_type.strip().upper()
    logger.info("network.dns host=%s record=%s", host, record)
    if record not in DNS_RECORD_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported DNS record type.")

    try:
        answers = dns.resolver.resolve(host, record)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="DNS lookup failed.") from exc

    answer_set = answers.rrset
    if answer_set is None:
        return {
            "host": host,
            "record_type": record,
            "answers": [],
        }

    return {
        "host": host,
        "record_type": record,
        "answers": [str(answer) for answer in answer_set],
    }


@app.get("/api/network/port")
async def port_check(host: str, port: int) -> dict:
    host = _safe_host(host)
    port = _safe_port(port)
    logger.info("network.port_check host=%s port=%s", host, port)
    try:
        with socket.create_connection((host, port), timeout=3):
            return {"host": host, "port": port, "open": True}
    except Exception:
        return {"host": host, "port": port, "open": False}
