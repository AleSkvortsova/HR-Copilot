import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


def _float_env(name: str, default: float) -> float:
    value = os.getenv(name)
    return float(value) if value else default


def _int_env(name: str, default: int) -> int:
    value = os.getenv(name)
    return int(value) if value else default


BASE_DIR = Path(__file__).resolve().parent
UPLOAD_FOLDER = BASE_DIR / "uploads"
UPLOAD_FOLDER.mkdir(exist_ok=True)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_TEMPERATURE = _float_env("OPENAI_TEMPERATURE", 0.45)
OPENAI_TOP_P = _float_env("OPENAI_TOP_P", 1)
OPENAI_MAX_TOKENS = _int_env("OPENAI_MAX_TOKENS", 2000)

MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10 MB
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-in-production")
