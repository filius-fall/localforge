import io
import shutil
import wave
import zipfile

import pandas as pd
import pytest
from fastapi.testclient import TestClient
from PIL import Image
from pypdf import PdfWriter

from app.main import app


client = TestClient(app)


def make_pdf_bytes(pages: int = 2) -> bytes:
    writer = PdfWriter()
    for _ in range(pages):
        writer.add_blank_page(width=200, height=200)
    output = io.BytesIO()
    writer.write(output)
    return output.getvalue()


def make_image_bytes() -> bytes:
    image = Image.new("RGB", (16, 16), (255, 0, 0))
    output = io.BytesIO()
    image.save(output, format="PNG")
    return output.getvalue()


def make_wav_bytes(duration: float = 0.1, sample_rate: int = 8000) -> bytes:
    frames = int(duration * sample_rate)
    output = io.BytesIO()
    with wave.open(output, "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(b"\x00\x00" * frames)
    return output.getvalue()


def test_tools_list_includes_new_tools():
    response = client.get("/api/tools")
    assert response.status_code == 200
    slugs = {tool["slug"] for tool in response.json()}
    expected = {
        "pdf",
        "convert",
        "media",
        "text",
        "qr",
        "network",
        "code",
        "clipboard",
        "time",
        "notes",
    }
    assert expected.issubset(slugs)


def test_noindex_headers_and_robots():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert "noindex" in response.headers.get("x-robots-tag", "")
    robots = client.get("/robots.txt")
    assert robots.status_code == 200
    assert "Disallow: /" in robots.text


def test_pdf_merge_split_rotate():
    pdf_a = make_pdf_bytes(1)
    pdf_b = make_pdf_bytes(1)
    response = client.post(
        "/api/pdf/merge",
        files=[
            ("files", ("a.pdf", pdf_a, "application/pdf")),
            ("files", ("b.pdf", pdf_b, "application/pdf")),
        ],
    )
    assert response.status_code == 200
    assert response.content.startswith(b"%PDF")

    split = client.post(
        "/api/pdf/split",
        files={"file": ("c.pdf", make_pdf_bytes(2), "application/pdf")},
        data={"ranges": "1"},
    )
    assert split.status_code == 200
    archive = zipfile.ZipFile(io.BytesIO(split.content))
    assert archive.namelist()

    rotate = client.post(
        "/api/pdf/rotate",
        files={"file": ("d.pdf", make_pdf_bytes(1), "application/pdf")},
        data={"angle": "90"},
    )
    assert rotate.status_code == 200
    assert rotate.content.startswith(b"%PDF")


def test_pdf_optimize_requires_ghostscript():
    response = client.post(
        "/api/pdf/optimize",
        files={"file": ("e.pdf", make_pdf_bytes(1), "application/pdf")},
        data={"level": "screen"},
    )
    if shutil.which("gs"):
        assert response.status_code == 200
        assert response.content.startswith(b"%PDF")
    else:
        assert response.status_code == 501


def test_docx_and_pdf_conversion():
    libreoffice_available = shutil.which("soffice") or shutil.which("libreoffice")
    if libreoffice_available:
        docx = pytest.importorskip("docx")
        document = docx.Document()
        document.add_paragraph("Hello LocalForge")
        buffer = io.BytesIO()
        document.save(buffer)
        buffer.seek(0)
        response = client.post(
            "/api/convert/docx-to-pdf",
            files={
                "file": (
                    "sample.docx",
                    buffer.getvalue(),
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                )
            },
        )
        assert response.status_code == 200
        assert response.content.startswith(b"%PDF")
    else:
        response = client.post(
            "/api/convert/docx-to-pdf",
            files={
                "file": (
                    "sample.docx",
                    b"invalid",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                )
            },
        )
        assert response.status_code == 501

    response = client.post(
        "/api/convert/pdf-to-docx",
        files={"file": ("sample.pdf", make_pdf_bytes(1), "application/pdf")},
    )
    if libreoffice_available:
        assert response.status_code == 200
        assert response.content.startswith(b"PK")
    else:
        assert response.status_code == 501


def test_csv_xlsx_conversion():
    csv_data = b"name,age\nAlice,30\nBob,25\n"
    response = client.post(
        "/api/convert/csv-to-xlsx",
        files={"file": ("sample.csv", csv_data, "text/csv")},
    )
    assert response.status_code == 200
    assert response.content.startswith(b"PK")

    df = pd.DataFrame({"name": ["Alice"], "age": [30]})
    buffer = io.BytesIO()
    df.to_excel(buffer, index=False)
    response = client.post(
        "/api/convert/xlsx-to-csv",
        files={"file": ("sample.xlsx", buffer.getvalue(), "application/octet-stream")},
    )
    assert response.status_code == 200
    assert b"name,age" in response.content


def test_markdown_to_pdf_dependency_check():
    response = client.post(
        "/api/convert/markdown-to-pdf",
        files={"file": ("sample.md", b"# Hello", "text/markdown")},
    )
    if shutil.which("pandoc") and shutil.which("wkhtmltopdf"):
        assert response.status_code == 200
        assert response.content.startswith(b"%PDF")
    else:
        assert response.status_code == 501


def test_image_toolkit_endpoints():
    image_data = make_image_bytes()
    response = client.post(
        "/api/image/convert",
        files={"file": ("image.png", image_data, "image/png")},
        data={"target_format": "jpeg"},
    )
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("image/")

    resize = client.post(
        "/api/image/resize",
        files={"file": ("image.png", image_data, "image/png")},
        data={"width": "8", "height": "8", "target_format": "png"},
    )
    assert resize.status_code == 200

    crop = client.post(
        "/api/image/crop",
        files={"file": ("image.png", image_data, "image/png")},
        data={
            "x": "0",
            "y": "0",
            "width": "8",
            "height": "8",
            "target_format": "png",
        },
    )
    assert crop.status_code == 200

    watermark = client.post(
        "/api/image/watermark",
        files={"file": ("image.png", image_data, "image/png")},
        data={"text": "LocalForge", "target_format": "png"},
    )
    assert watermark.status_code == 200

    strip_exif = client.post(
        "/api/image/strip-exif",
        files={"file": ("image.png", image_data, "image/png")},
        data={"target_format": "png"},
    )
    assert strip_exif.status_code == 200


def test_media_endpoints():
    audio_data = make_wav_bytes()
    responses = [
        client.post(
            "/api/media/convert",
            files={"file": ("audio.wav", audio_data, "audio/wav")},
            data={"target_format": "mp3"},
        ),
        client.post(
            "/api/media/extract-audio",
            files={"file": ("audio.wav", audio_data, "audio/wav")},
            data={"target_format": "mp3"},
        ),
        client.post(
            "/api/media/trim",
            files={"file": ("audio.wav", audio_data, "audio/wav")},
            data={"start": "0", "end": "0.05", "target_format": "mp3"},
        ),
        client.post(
            "/api/media/compress",
            files={"file": ("audio.wav", audio_data, "audio/wav")},
            data={"target_format": "mp3"},
        ),
    ]

    if shutil.which("ffmpeg"):
        assert all(response.status_code == 200 for response in responses)
    else:
        assert all(response.status_code == 501 for response in responses)


def test_network_helpers_validation():
    response = client.get("/api/network/ip")
    assert response.status_code == 200
    assert "server_ip" in response.json()

    bad_ping = client.get("/api/network/ping?host=bad host!")
    assert bad_ping.status_code == 400

    bad_dns = client.get("/api/network/dns?host=example.com&record_type=BAD")
    assert bad_dns.status_code == 400

    bad_port = client.get("/api/network/port?host=example.com&port=70000")
    assert bad_port.status_code == 400
