# src/api/routes.py - FastAPI Routes
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import FileResponse, JSONResponse
import shutil
import os
import uuid
import traceback
from datetime import datetime

from config.settings import TEMP_DIR
from src.utils.audio_io import convert_to_wav
from src.utils.visualization import save_comparison_plot
from src.utils.translation import translate_text
from src.processing import (
    chipmunk_effect,
    robot_effect,
    echo_effect,
    electronic_voice_effect,
    stutter_effect,
    process_voice,
    text_to_speech,
    speech_to_text,
)
from src.processing.filters import butter_lowpass_filter, remove_non_voice_sounds
import librosa
import soundfile as sf
import numpy as np
import tempfile

router = APIRouter()

# Paths
RAW_AUDIO_DIR = os.path.join(os.path.dirname(TEMP_DIR), "raw")
os.makedirs(RAW_AUDIO_DIR, exist_ok=True)


def apply_noise_filter(audio_path: str) -> str:
    """Apply noise filtering to audio: lowpass + remove non-voice."""
    y, sr = librosa.load(audio_path)
    y_filtered = butter_lowpass_filter(y, 3000, sr)
    y_clean = remove_non_voice_sounds(y_filtered, sr)
    
    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
        sf.write(temp_file.name, y_clean, sr)
        return temp_file.name


@router.post("/process-audio")
async def process_audio_endpoint(
    file: UploadFile = File(...),
    effect: str = Form(...),
    delay: float = Form(0.2),
    repeat: int = Form(3),
    enable_filter: str = Form("false")
):
    """Process audio with selected DSP effect."""
    try:
        # Save uploaded file
        file_ext = file.filename.split(".")[-1] if "." in file.filename else "webm"
        temp_input_path = os.path.join(TEMP_DIR, f"input_{uuid.uuid4()}.{file_ext}")
        
        with open(temp_input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Convert to WAV format
        try:
            wav_path = convert_to_wav(temp_input_path)
            print(f"Converted {file_ext} to WAV: {wav_path}")
        except Exception as conv_err:
            print(f"Conversion error: {conv_err}")
            return JSONResponse(status_code=400, content={
                "error": f"Cannot convert audio format: {str(conv_err)}. Try uploading WAV or MP3 file."
            })

        # SAVE RAW AUDIO to data/raw/
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        raw_filename = f"raw_{timestamp}_{uuid.uuid4().hex[:8]}.wav"
        raw_audio_path = os.path.join(RAW_AUDIO_DIR, raw_filename)
        shutil.copy(wav_path, raw_audio_path)
        print(f"Saved raw audio: {raw_audio_path}")

        # Load original audio for comparison
        original_y, original_sr = librosa.load(wav_path)
        
        # Apply noise filter if enabled
        audio_to_process = wav_path
        if enable_filter.lower() == "true":
            try:
                audio_to_process = apply_noise_filter(wav_path)
                print("Noise filter applied")
            except Exception as filter_err:
                print(f"Filter error (continuing without filter): {filter_err}")
                audio_to_process = wav_path

        processed_path = None

        # Apply selected effect
        effect_map = {
            "chipmunk": lambda: chipmunk_effect(audio_to_process),
            "robot": lambda: robot_effect(audio_to_process),
            "echo": lambda: echo_effect(audio_to_process, delay),
            "electronic": lambda: electronic_voice_effect(audio_to_process),
            "stutter": lambda: stutter_effect(audio_to_process, repeat),
            "process_voice": lambda: process_voice(audio_to_process, delay=delay),
        }

        if effect not in effect_map:
            return JSONResponse(status_code=400, content={"error": "Invalid effect type"})

        processed_path, _ = effect_map[effect]()

        if not processed_path or not os.path.exists(processed_path):
            return JSONResponse(status_code=500, content={"error": "Processing failed"})

        # Load processed audio for comparison
        processed_y, processed_sr = librosa.load(processed_path)
        
        # Create OVERLAY comparison waveform plot
        waveform_path = save_comparison_plot(
            original_y, original_sr, 
            processed_y, processed_sr,
            effect.title(),
            TEMP_DIR
        )

        # Move processed files to TEMP_DIR
        final_audio_name = os.path.basename(processed_path)
        final_audio_path = os.path.join(TEMP_DIR, final_audio_name)
        shutil.move(processed_path, final_audio_path)

        final_waveform_name = None
        if waveform_path and os.path.exists(waveform_path):
            final_waveform_name = os.path.basename(waveform_path)
            final_waveform_path = os.path.join(TEMP_DIR, final_waveform_name)
            if waveform_path != final_waveform_path:
                shutil.move(waveform_path, final_waveform_path)

        # Cleanup temp files
        for f in [temp_input_path]:
            if f and os.path.exists(f):
                try:
                    os.remove(f)
                except:
                    pass

        return {
            "audio_url": f"/files/{final_audio_name}",
            "waveform_url": f"/files/{final_waveform_name}" if final_waveform_name else None,
            "raw_audio_url": f"/raw/{raw_filename}"
        }

    except Exception as e:
        print(f"Error processing audio: {traceback.format_exc()}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.post("/translate")
async def translate_endpoint(
    text: str = Form(...),
    source_lang: str = Form("vi"),
    target_lang: str = Form("en")
):
    """Translate text between languages."""
    try:
        translated = translate_text(text, source_lang, target_lang)
        return {"translated_text": translated}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.post("/tts")
async def tts_endpoint(text: str = Form(...), lang: str = Form("vi")):
    """Convert text to speech."""
    try:
        output_path = text_to_speech(text, lang)
        final_name = os.path.basename(output_path)
        shutil.move(output_path, os.path.join(TEMP_DIR, final_name))
        return {"audio_url": f"/files/{final_name}"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.post("/stt")
async def stt_endpoint(file: UploadFile = File(...), language: str = Form("vi-VN")):
    """Convert speech to text."""
    try:
        file_ext = file.filename.split(".")[-1] if "." in file.filename else "webm"
        temp_input_path = os.path.join(TEMP_DIR, f"stt_input_{uuid.uuid4()}.{file_ext}")
        with open(temp_input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        try:
            wav_path = convert_to_wav(temp_input_path)
        except:
            wav_path = temp_input_path
            
        text = speech_to_text(wav_path, language)
        return {"text": text}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.get("/files/{filename}")
async def get_file(filename: str):
    """Serve processed files."""
    file_path = os.path.join(TEMP_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return JSONResponse(status_code=404, content={"error": "File not found"})


@router.get("/raw/{filename}")
async def get_raw_file(filename: str):
    """Serve raw audio files."""
    file_path = os.path.join(RAW_AUDIO_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return JSONResponse(status_code=404, content={"error": "Raw file not found"})
