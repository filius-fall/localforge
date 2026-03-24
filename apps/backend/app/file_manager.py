"""File manager for handling temporary file storage and cleanup."""

import asyncio
import logging
import shutil
import time
from pathlib import Path
from typing import Optional
import uuid

logger = logging.getLogger("localforge")

# Configuration
UPLOAD_DIR = Path("/tmp/localforge_uploads")
SESSION_RETENTION_MINUTES = 30
CLEANUP_INTERVAL_SECONDS = 300  # 5 minutes

# In-memory session tracking (in production, use Redis or similar)
sessions: dict[str, dict] = {}


def init_upload_dir() -> None:
    """Initialize the upload directory."""
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    logger.info("upload.dir.initialized path=%s", UPLOAD_DIR)


def create_session() -> str:
    """Create a new session for file retention."""
    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        "created_at": time.time(),
        "files": [],
        "expires_at": time.time() + (SESSION_RETENTION_MINUTES * 60),
    }
    logger.info("session.created id=%s expires_in=%d_minutes", session_id, SESSION_RETENTION_MINUTES)
    return session_id


def get_session(session_id: str) -> Optional[dict]:
    """Get session details if valid."""
    session = sessions.get(session_id)
    if not session:
        return None
    if time.time() > session["expires_at"]:
        delete_session(session_id)
        return None
    return session


def delete_session(session_id: str) -> bool:
    """Delete a session and all associated files."""
    session = sessions.get(session_id)
    if not session:
        return False
    
    # Delete all files associated with this session
    for file_path in session["files"]:
        try:
            path = Path(file_path)
            if path.exists():
                path.unlink()
                logger.info("file.deleted session=%s path=%s", session_id, file_path)
        except Exception as exc:
            logger.warning("file.delete.failed session=%s path=%s error=%s", session_id, file_path, exc)
    
    # Remove session from tracking
    del sessions[session_id]
    logger.info("session.deleted id=%s", session_id)
    return True


def add_file_to_session(session_id: str, file_path: Path) -> None:
    """Add a file to session tracking."""
    session = sessions.get(session_id)
    if session:
        session["files"].append(str(file_path))
        logger.debug("file.added session=%s path=%s", session_id, file_path)


def extend_session(session_id: str, minutes: int = SESSION_RETENTION_MINUTES) -> bool:
    """Extend session expiration time."""
    session = sessions.get(session_id)
    if not session:
        return False
    session["expires_at"] = time.time() + (minutes * 60)
    logger.info("session.extended id=%s by=%d_minutes", session_id, minutes)
    return True


async def cleanup_expired_sessions() -> None:
    """Background task to clean up expired sessions."""
    while True:
        await asyncio.sleep(CLEANUP_INTERVAL_SECONDS)
        current_time = time.time()
        expired_sessions = [
            sid for sid, session in sessions.items()
            if current_time > session["expires_at"]
        ]
        for session_id in expired_sessions:
            delete_session(session_id)
        if expired_sessions:
            logger.info("cleanup.completed deleted=%d_sessions", len(expired_sessions))


def start_cleanup_task() -> asyncio.Task:
    """Start the background cleanup task."""
    init_upload_dir()
    loop = asyncio.get_event_loop()
    task = loop.create_task(cleanup_expired_sessions())
    logger.info("cleanup.task.started interval=%d_seconds", CLEANUP_INTERVAL_SECONDS)
    return task
