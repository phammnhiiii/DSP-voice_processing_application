# elevenlabs.py - ElevenLabs TTS Integration
import os
import tempfile
import requests
from dotenv import load_dotenv

load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
BASE_URL = "https://api.elevenlabs.io/v1"

# Predefined multilingual voices for eleven_multilingual_v2 model
MULTILINGUAL_VOICES = [
    # English
    {"voice_id": "pNInz6obpgDQGcFmaJgB", "name": "Adam - American Male, Deep", "category": "multilingual"},
    {"voice_id": "Xb7hH8MSUJpSbSDYk0k2", "name": "Alice - British Female", "category": "multilingual"},
    {"voice_id": "ErXwobaYiN019PkySvjV", "name": "Antoni - American Male, Young", "category": "multilingual"},
    {"voice_id": "IKne3meq5aSn9XLyUdCD", "name": "Charlie - Australian Male", "category": "multilingual"},
    {"voice_id": "XB0fDUnXU5powFXDhCwa", "name": "Charlotte - Swedish Female", "category": "multilingual"},
    {"voice_id": "onwK4e9ZLuTAKqWW03F9", "name": "Daniel - British Male, Deep", "category": "multilingual"},
    {"voice_id": "21m00Tcm4TlvDq8ikWAM", "name": "Rachel - American Female", "category": "multilingual"},
    # French
    {"voice_id": "ODq5zmih8GrVes37Dizd", "name": "Antoine - French Male", "category": "multilingual"},
    # German
    {"voice_id": "XrExE9yKIg1WjnnlVkGX", "name": "Hans - German Male", "category": "multilingual"},
    # Japanese
    {"voice_id": "bVMeCyTHy58xNoL34h3p", "name": "Yuki - Japanese Female", "category": "multilingual"},
    # Korean
    {"voice_id": "AZnzlk1XvdvUeBnXmlld", "name": "Seoyeon - Korean Female", "category": "multilingual"},
    # Spanish
    {"voice_id": "GBv7mTt0atIp3Br8iCZE", "name": "Sofia - Spanish Female", "category": "multilingual"},
    # Vietnamese
    {"voice_id": "FTYCiQT21H9XQvhRu0ch", "name": "Minh Trung - Vietnamese Male", "category": "multilingual"},
    {"voice_id": "3VnrjnYrskPMDsapTr8X", "name": "Tùng Duy - Vietnamese Male", "category": "multilingual"},
]


def get_headers():
    """Get API headers with authentication."""
    return {
        "Accept": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY
    }


def list_voices() -> list:
    """Get all available voices from ElevenLabs + predefined multilingual voices."""
    # Start with predefined multilingual voices
    voices = MULTILINGUAL_VOICES.copy()
    
    # Get existing voice_ids to avoid duplicates
    existing_ids = {v["voice_id"] for v in voices}
    
    try:
        response = requests.get(
            f"{BASE_URL}/voices",
            headers=get_headers()
        )
        if response.status_code == 200:
            data = response.json()
            for voice in data.get("voices", []):
                # Only add if not already in predefined list
                if voice["voice_id"] not in existing_ids:
                    voices.append({
                        "voice_id": voice["voice_id"],
                        "name": voice["name"],
                        "category": voice.get("category", "unknown")
                    })
            return voices
        else:
            return voices
    except Exception as e:
        print(f"Error listing voices: {e}")
        return voices


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
