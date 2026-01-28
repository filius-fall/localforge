import base64
import os
import re
import uuid
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()


class DecisionCreate(BaseModel):
    title: str = Field(..., min_length=1)
    summary: str | None = None
    context: str | None = None
    decision: str = Field(..., min_length=1)
    consequences: str | None = None
    tags: list[str] | None = None
    status: str = "accepted"


class DecisionSaved(BaseModel):
    id: str
    title: str
    summary: str
    context: str
    decision: str
    consequences: str
    tags: list[str]
    status: str
    date: str
    path: str
    url: str
    sha: str
    commitUrl: str


def _require_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise HTTPException(
            status_code=500, detail=f"Missing {name} environment variable"
        )
    return value


def _slugify(value: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9]+", "-", value.strip().lower())
    return cleaned.strip("-") or "decision"


def _build_markdown(payload: DecisionCreate, created_at: str) -> str:
    summary = payload.summary.strip() if payload.summary else "Not provided."
    context = payload.context.strip() if payload.context else "Not provided."
    consequences = (
        payload.consequences.strip() if payload.consequences else "Not provided."
    )
    tags_str = ", ".join(payload.tags) if payload.tags else ""
    status = payload.status or "accepted"

    frontmatter = f"""---
status: {status}
date: {created_at[:10]}
tags: [{tags_str}]
---
"""

    return (
        frontmatter + f"# {payload.title}\n\n"
        f"## Summary\n{summary}\n\n"
        f"## Context\n{context}\n\n"
        f"## Decision\n{payload.decision}\n\n"
        f"## Consequences\n{consequences}\n"
    )


@router.get("/api/decisions/health")
async def decision_health() -> dict:
    try:
        owner = os.getenv("DECISION_LOG_OWNER")
        repo = os.getenv("DECISION_LOG_REPO")
        if not owner or not repo:
            return {
                "configured": False,
                "missing": [
                    k
                    for k, v in [
                        ("DECISION_LOG_OWNER", owner),
                        ("DECISION_LOG_REPO", repo),
                    ]
                    if not v
                ],
            }
        return {
            "configured": True,
            "owner": owner,
            "repo": repo,
        }
    except Exception:
        return {
            "configured": False,
            "missing": ["DECISION_LOG_OWNER", "DECISION_LOG_REPO"],
        }


@router.post("/api/decisions", response_model=dict)
async def create_decision(payload: DecisionCreate):
    owner = _require_env("DECISION_LOG_OWNER")
    repo = _require_env("DECISION_LOG_REPO")
    branch = os.getenv("DECISION_LOG_BRANCH", "main")
    token = _require_env("GH_TOKEN")

    created_at = datetime.now(timezone.utc).isoformat()
    date_str = created_at[:10]
    slug = _slugify(payload.title)

    # Try to create unique filename with suffix if conflict
    file_path = None
    final_headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    for attempt in range(1, 6):
        suffix = "" if attempt == 1 else f"-{attempt}"
        candidate_path = f"decisions/{date_str}/{date_str}--{slug}{suffix}.md"
        url = f"https://api.github.com/repos/{owner}/{repo}/contents/{candidate_path}"

        async with httpx.AsyncClient(timeout=15.0) as client:
            lookup = await client.get(
                url, headers=final_headers, params={"ref": branch}
            )

            if lookup.status_code == 404:
                file_path = candidate_path
                break
            elif lookup.status_code == 200:
                pass
            else:
                raise HTTPException(
                    status_code=502,
                    detail=f"Failed to check decision path on GitHub (status: {lookup.status_code})",
                )

    if not file_path:
        raise HTTPException(
            status_code=409, detail="Decision log path conflict after multiple retries"
        )

    url = f"https://api.github.com/repos/{owner}/{repo}/contents/{file_path}"

    content = _build_markdown(payload, created_at)
    encoded = base64.b64encode(content.encode("utf-8")).decode("utf-8")

    async with httpx.AsyncClient(timeout=15.0) as client:
        body = {
            "message": f"chore(decisions): add {slug}",
            "content": encoded,
            "branch": branch,
        }

        response = await client.put(url, headers=final_headers, json=body)
        if response.status_code not in (200, 201):
            raise HTTPException(
                status_code=502, detail="Failed to write decision to GitHub"
            )

        data = response.json()
        content_data = data.get("content", {})
        commit_data = data.get("commit", {})

    decision = DecisionSaved(
        id=uuid.uuid4().hex,
        title=payload.title,
        summary=payload.summary or "",
        context=payload.context or "",
        decision=payload.decision,
        consequences=payload.consequences or "",
        tags=payload.tags or [],
        status=payload.status or "accepted",
        date=created_at[:10],
        path=file_path,
        url=f"https://github.com/{owner}/{repo}/blob/{branch}/{file_path}",
        sha=content_data.get("sha", ""),
        commitUrl=commit_data.get("html_url", ""),
    )

    return {"decision": decision.model_dump()}
