FROM python:3.12-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    ghostscript \
    iputils-ping \
    libreoffice \
    libreoffice-writer \
    libreoffice-calc \
    libreoffice-impress \
    libreoffice-draw \
    libreoffice-math \
    libreoffice-base-core \
    pandoc \
    wkhtmltopdf \
    fonts-dejavu-core \
    fonts-dejavu-extra \
    && rm -rf /var/lib/apt/lists/*

# Create symlinks for LibreOffice binaries
RUN ln -sf /usr/lib/libreoffice/program/soffice /usr/bin/soffice || true \
    && ln -sf /usr/lib/libreoffice/program/soffice /usr/local/bin/soffice || true

# Verify dependencies are installed
RUN which soffice && which wkhtmltopdf && which pandoc && which ffmpeg && which gs

RUN pip install --no-cache-dir uv

COPY pyproject.toml uv.lock /app/
RUN uv sync --frozen --no-dev

COPY app /app/app

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
