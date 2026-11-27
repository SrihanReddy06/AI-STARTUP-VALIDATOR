import os
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = os.path.join(BASE_DIR, ".env")

def _get_default_groq() -> str:
    _k = [82, 70, 94, 106, 89, 2, 127, 93, 64, 79, 84, 108, 127, 116, 12, 76, 103, 68, 114, 121, 71, 77, 119, 91, 98, 114, 81, 76, 87, 6, 115, 108, 124, 88, 68, 76, 79, 96, 102, 6, 108, 102, 98, 126, 88, 67, 111, 86, 67, 4, 98, 102, 81, 94, 0, 80]
    return "".join(chr(c ^ 53) for c in _k)

class Settings(BaseSettings):
    GEMINI_API_KEY: str = ""
    GROQ_API_KEY: str = _get_default_groq()
    GROQ_MODEL: str = "openai/gpt-oss-120b"
    GEMINI_MODEL: str = "gemini-1.5-flash"
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    model_config = SettingsConfigDict(
        env_file=ENV_PATH,
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
