# config/settings.py - Application Configuration
import os

# API Settings
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))

# CORS Settings
CORS_ORIGINS = [
    "http://localhost:5173",   # Vite dev server
    "http://localhost:3000",
    "*"
]

# File Storage
TEMP_DIR = os.getenv("TEMP_DIR", "data/processed")
os.makedirs(TEMP_DIR, exist_ok=True)

# Supported Languages for TTS/STT
SUPPORTED_LANGUAGES = {
    "vi": "Vietnamese",
    "en": "English",
    "ja": "Japanese",
    "ko": "Korean",
    "zh-CN": "Chinese",
    "fr": "French",
    "de": "German",
    "es": "Spanish",
}
