from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uuid
import os

# Audio modules
from audio.io_utils import load_audio, save_audio
from audio.visualization import save_waveform
from audio.speed import change_speed
from audio.effects import (
    chipmunk, robot, echo, whisper,
    distortion, reverse_audio,
    monster, telephone, stutter
)
from audio.filters import lowpass_filter
from audio.enhancement import enhance_voice

# Speech modules
from speech.tts import text_to_speech
from speech.stt import speech_to_text


# FastAPI App
app = FastAPI(
    title="Voice Processing Web App",
    description="Audio effects, speech processing, TTS & STT",
    version="1.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directories
UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"
WAVEFORM_DIR = "outputs/waveforms"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(WAVEFORM_DIR, exist_ok=True)

# Static files
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")


# Home
@app.get("/")
def home():
    return {"message": "Voice Processing Backend is running"}


# Upload audio
@app.post("/upload")
async def upload_audio(file: UploadFile = File(...)):
    filename = f"{uuid.uuid4()}.wav"
    path = os.path.join(UPLOAD_DIR, filename)

    with open(path, "wb") as f:
        f.write(await file.read())

    return {"audio_path": path}


# Apply audio effect
@app.post("/process")
def process_audio(
    audio_path: str,
    effect: str = "robot",
    speed: float = 1.0,
    cutoff: int = 3000
):
    try:
        # FIX PATH
        audio_path = audio_path.replace("\\", "/")

        # LOAD ORIGINAL
        y_orig, sr = load_audio(audio_path)
        y = y_orig.copy()

        # SPEED
        if speed != 1.0:
            y = change_speed(y, speed)

        # EFFECT
        if effect == "chipmunk":
            y, sr = chipmunk(y, sr)
        elif effect == "robot":
            y, sr = robot(y, sr)
        elif effect == "echo":
            y, sr = echo(y, sr)
        elif effect == "whisper":
            y, sr = whisper(y, sr)
        elif effect == "distortion":
            y, sr = distortion(y, sr)
        elif effect == "reverse":
            y, sr = reverse_audio(y, sr)
        elif effect == "monster":
            y, sr = monster(y, sr)
        elif effect == "telephone":
            y, sr = telephone(y, sr)
        elif effect == "stutter":
            y, sr = stutter(y, sr)
        elif effect == "enhance":
            y = enhance_voice(y, sr)
        elif effect == "lowpass":
            y = lowpass_filter(y, sr, cutoff)

        # SAVE AUDIO
        out_name = f"{uuid.uuid4()}.wav"
        out_path = os.path.join("outputs", out_name)
        save_audio(out_path, y, sr)

        # SAVE WAVEFORM
        waveform_name = f"{uuid.uuid4()}.png"
        waveform_path = os.path.join("outputs/waveforms", waveform_name)
        save_waveform(y_orig, y, waveform_path)

        return {
            "audio_url": f"/outputs/{out_name}",
            "waveform_url": f"/outputs/waveforms/{waveform_name}"
        }

    except Exception as e:
        return {
            "error": str(e)
        }


# Text to Speech
@app.post("/tts")
def tts(text: str, lang: str = "vi"):
    audio_path = text_to_speech(text, lang)
    return {"audio_path": audio_path}


# Speech to Text
@app.post("/stt")
def stt(audio_path: str, language: str = "vi-VN"):
    text = speech_to_text(audio_path, language)
    return {"text": text}
