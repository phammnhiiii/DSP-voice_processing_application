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
    whisper_effect,
    distortion_effect,
    reverse_effect,
    monster_effect,
    telephone_effect,
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
    """Apply noise filtering to audio using Spectral Subtraction."""
    y, sr = librosa.load(audio_path)
    
    # Spectral Subtraction - thông minh hơn lowpass+bandpass
    # Phân tích và trừ tiếng ồn, giữ giọng tự nhiên hơn
    noise_samples = int(0.1 * sr)
    if len(y) > noise_samples:
        noise_profile = np.abs(np.fft.fft(y[:noise_samples]))
        noise_estimate = np.mean(noise_profile) * 0.5  # noise_reduce = 0.5
        
        Y = np.fft.fft(y)
        magnitude = np.abs(Y)
        phase = np.angle(Y)
        
        magnitude = np.maximum(magnitude - noise_estimate, 0)
        Y_clean = magnitude * np.exp(1j * phase)
        y_clean = np.fft.ifft(Y_clean).real
    else:
        y_clean = y
    
    # Normalize
    peak = np.max(np.abs(y_clean))
    if peak > 0:
        y_clean = y_clean * (0.95 / peak)
    
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
            "whisper": lambda: whisper_effect(audio_to_process),
            "distortion": lambda: distortion_effect(audio_to_process),
            "reverse": lambda: reverse_effect(audio_to_process),
            "monster": lambda: monster_effect(audio_to_process),
            "telephone": lambda: telephone_effect(audio_to_process),
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


@router.post("/filter-audio")
async def filter_audio_endpoint(
    file: UploadFile = File(...),
    filter_type: str = Form("noise"),
    intensity: float = Form(50)
):
    """Apply audio filter with DSP algorithms."""
    try:
        # Save uploaded file
        file_ext = file.filename.split(".")[-1] if "." in file.filename else "webm"
        temp_input_path = os.path.join(TEMP_DIR, f"filter_{uuid.uuid4()}.{file_ext}")
        
        with open(temp_input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Convert to WAV
        try:
            wav_path = convert_to_wav(temp_input_path)
        except:
            wav_path = temp_input_path

        # Load audio
        y, sr = librosa.load(wav_path)
        
        # Normalize intensity to 0-1
        intensity_factor = intensity / 100.0

        if filter_type == "noise":
            # Spectral Subtraction - remove background noise
            noise_samples = int(0.1 * sr)
            if len(y) > noise_samples:
                noise_profile = np.abs(np.fft.fft(y[:noise_samples]))
                noise_estimate = np.mean(noise_profile) * intensity_factor
                
                Y = np.fft.fft(y)
                magnitude = np.abs(Y)
                phase = np.angle(Y)
                
                magnitude = np.maximum(magnitude - noise_estimate, 0)
                Y_clean = magnitude * np.exp(1j * phase)
                y = np.fft.ifft(Y_clean).real
        
        elif filter_type == "echo":
            # Remove echo using delay cancellation
            delay = 0.2  # 200ms
            attenuation = 0.3 + (intensity_factor * 0.4)  # 0.3-0.7
            delay_samples = int(delay * sr)
            y_echo = np.zeros_like(y)
            if delay_samples < len(y):
                y_echo[delay_samples:] = y[:-delay_samples]
            y = y - attenuation * y_echo
        
        elif filter_type == "music":
            # Bandpass filter - keep only voice frequencies (300-3400Hz)
            from scipy.signal import butter, lfilter
            low = 300
            high = 3400 - (intensity_factor * 1000)  # Tighter with more intensity
            nyq = 0.5 * sr
            low_norm = low / nyq
            high_norm = high / nyq
            b, a = butter(5, [low_norm, high_norm], btype='band')
            y = lfilter(b, a, y)
        
        elif filter_type == "siren":
            # Notch filter - remove specific frequency (sirens ~800Hz)
            notch_freq = 800
            Q = 5 + (intensity_factor * 20)  # Higher Q = narrower notch
            from scipy.signal import iirnotch, lfilter
            b, a = iirnotch(notch_freq, Q, sr)
            y = lfilter(b, a, y)
        
        # Normalize
        peak = np.max(np.abs(y))
        if peak > 0:
            y = y * (0.95 / peak)
        
        # Save processed audio
        output_path = os.path.join(TEMP_DIR, f"filtered_{uuid.uuid4()}.wav")
        sf.write(output_path, y, sr)
        
        # Cleanup
        if temp_input_path != wav_path and os.path.exists(temp_input_path):
            os.remove(temp_input_path)
        if os.path.exists(wav_path) and wav_path != output_path:
            os.remove(wav_path)
        
        final_name = os.path.basename(output_path)
        return {"audio_url": f"/files/{final_name}"}
    
    except Exception as e:
        print(f"Error filtering audio: {traceback.format_exc()}")
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


# ============== ELEVENLABS TTS ==============

@router.get("/voices")
async def list_voices_endpoint():
    """Get all available ElevenLabs voices."""
    try:
        from src.utils.elevenlabs import list_voices
        voices = list_voices()
        return {"voices": voices}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.post("/tts-eleven")
async def tts_eleven_endpoint(text: str = Form(...), voice_id: str = Form("21m00Tcm4TlvDq8ikWAM")):
    """Convert text to speech using ElevenLabs."""
    try:
        from src.utils.elevenlabs import text_to_speech_eleven
        output_path = text_to_speech_eleven(text, voice_id)
        if output_path:
            final_name = os.path.basename(output_path)
            shutil.move(output_path, os.path.join(TEMP_DIR, final_name))
            return {"audio_url": f"/files/{final_name}"}
        else:
            return JSONResponse(status_code=500, content={"error": "ElevenLabs TTS failed"})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.post("/clone-voice")
async def clone_voice_endpoint(
    name: str = Form(...),
    file: UploadFile = File(...),
    description: str = Form("")
):
    """Clone a voice from audio sample."""
    try:
        from src.utils.elevenlabs import clone_voice
        
        # Save uploaded audio
        file_ext = file.filename.split(".")[-1] if "." in file.filename else "mp3"
        temp_path = os.path.join(TEMP_DIR, f"clone_{uuid.uuid4()}.{file_ext}")
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Clone voice
        result = clone_voice(name, temp_path, description)
        
        # Cleanup
        os.remove(temp_path)
        
        if result.get("success"):
            return {"voice_id": result["voice_id"], "name": result["name"]}
        else:
            return JSONResponse(status_code=400, content={"error": result.get("error", "Clone failed")})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

