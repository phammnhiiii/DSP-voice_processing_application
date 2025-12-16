# elevenlabs.py - ElevenLabs TTS Integration
import os
import tempfile
import requests
from dotenv import load_dotenv

load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
BASE_URL = "https://api.elevenlabs.io/v1"


def get_headers():
    """Get API headers with authentication."""
    return {
        "Accept": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY
    }


def list_voices() -> list:
    """Get all available voices from ElevenLabs."""
    try:
        response = requests.get(
            f"{BASE_URL}/voices",
            headers=get_headers()
        )
        if response.status_code == 200:
            data = response.json()
            voices = []
            for voice in data.get("voices", []):
                voices.append({
                    "voice_id": voice["voice_id"],
                    "name": voice["name"],
                    "category": voice.get("category", "unknown")
                })
            return voices
        else:
            return []
    except Exception as e:
        print(f"Error listing voices: {e}")
        return []


def text_to_speech_eleven(text: str, voice_id: str = "21m00Tcm4TlvDq8ikWAM") -> str:
    """
    Convert text to speech using ElevenLabs API.
    Default voice: Rachel (21m00Tcm4TlvDq8ikWAM)
    Returns path to audio file.
    """
    try:
        response = requests.post(
            f"{BASE_URL}/text-to-speech/{voice_id}",
            headers={
                "Accept": "audio/mpeg",
                "Content-Type": "application/json",
                "xi-api-key": ELEVENLABS_API_KEY
            },
            json={
                "text": text,
                "model_id": "eleven_multilingual_v2",
                "voice_settings": {
                    "stability": 0.5,
                    "similarity_boost": 0.75
                }
            }
        )
        
        if response.status_code == 200:
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_file:
                temp_file.write(response.content)
                return temp_file.name
        else:
            print(f"ElevenLabs error: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"Error in ElevenLabs TTS: {e}")
        return None


def clone_voice(name: str, audio_path: str, description: str = "") -> dict:
    """
    Clone a voice from an audio sample.
    Requires at least 30 seconds of clear audio.
    Returns voice info with voice_id.
    """
    try:
        with open(audio_path, 'rb') as audio_file:
            response = requests.post(
                f"{BASE_URL}/voices/add",
                headers={"xi-api-key": ELEVENLABS_API_KEY},
                data={
                    "name": name,
                    "description": description or f"Cloned voice: {name}"
                },
                files={
                    "files": (os.path.basename(audio_path), audio_file, "audio/mpeg")
                }
            )
        
        if response.status_code == 200:
            data = response.json()
            return {
                "success": True,
                "voice_id": data.get("voice_id"),
                "name": name
            }
        else:
            return {
                "success": False,
                "error": response.text
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def delete_voice(voice_id: str) -> bool:
    """Delete a cloned voice."""
    try:
        response = requests.delete(
            f"{BASE_URL}/voices/{voice_id}",
            headers=get_headers()
        )
        return response.status_code == 200
    except Exception:
        return False
