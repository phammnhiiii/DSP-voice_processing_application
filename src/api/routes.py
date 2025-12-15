# src/api/routes.py - FastAPI Routes
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import FileResponse, JSONResponse
import shutil
import os
import uuid
import traceback

from config.settings import TEMP_DIR
from src.utils.audio_io import convert_to_wav
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

router = APIRouter()


@router.post("/process-audio")
async def process_audio_endpoint(
    file: UploadFile = File(...),
    effect: str = Form(...),
    delay: float = Form(0.2),
    repeat: int = Form(3)
):
    """Process audio with selected DSP effect."""
    try:
        # Save uploaded file
        file_ext = file.filename.split(".")[-1] if "." in file.filename else "webm"
        temp_input_path = os.path.join(TEMP_DIR, f"input_{uuid.uuid4()}.{file_ext}")
        
        with open(temp_input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Convert to WAV format for librosa compatibility
        # This handles webm from browser recording
        try:
            wav_path = convert_to_wav(temp_input_path)
            print(f"Converted {file_ext} to WAV: {wav_path}")
        except Exception as conv_err:
            print(f"Conversion error: {conv_err}")
            return JSONResponse(status_code=400, content={
                "error": f"Cannot convert audio format: {str(conv_err)}. Try uploading WAV or MP3 file."
            })

        processed_path = None
        waveform_path = None

        # Apply selected effect
        effect_map = {
            "chipmunk": lambda: chipmunk_effect(wav_path),
            "robot": lambda: robot_effect(wav_path),
            "echo": lambda: echo_effect(wav_path, delay),
            "electronic": lambda: electronic_voice_effect(wav_path),
            "stutter": lambda: stutter_effect(wav_path, repeat),
            "process_voice": lambda: process_voice(wav_path, delay=delay),
        }

        if effect not in effect_map:
            return JSONResponse(status_code=400, content={"error": "Invalid effect type"})

        processed_path, waveform_path = effect_map[effect]()

        if not processed_path or not os.path.exists(processed_path):
            return JSONResponse(status_code=500, content={"error": "Processing failed"})

        # Move processed files to TEMP_DIR
        final_audio_name = os.path.basename(processed_path)
        final_audio_path = os.path.join(TEMP_DIR, final_audio_name)
        shutil.move(processed_path, final_audio_path)

        final_waveform_name = None
        if waveform_path and os.path.exists(waveform_path):
            final_waveform_name = os.path.basename(waveform_path)
            shutil.move(waveform_path, os.path.join(TEMP_DIR, final_waveform_name))

        # Cleanup temp files
        for f in [temp_input_path, wav_path]:
            if f and os.path.exists(f):
                try:
                    os.remove(f)
                except:
                    pass

        return {
            "audio_url": f"/files/{final_audio_name}",
            "waveform_url": f"/files/{final_waveform_name}" if final_waveform_name else None
        }

    except Exception as e:
        print(f"Error processing audio: {traceback.format_exc()}")
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
        
        # Convert to WAV for speech recognition
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
