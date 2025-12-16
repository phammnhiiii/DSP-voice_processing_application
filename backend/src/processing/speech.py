# speech.py - Text-to-Speech and Speech-to-Text
import tempfile
import speech_recognition as sr
from gtts import gTTS


def text_to_speech(text: str, lang: str = 'vi') -> str:
    """Convert text to speech using Google TTS."""
    tts = gTTS(text=text, lang=lang)
    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_file:
        tts.save(temp_file.name)
        return temp_file.name


def speech_to_text(audio_path: str, language: str = "vi-VN") -> str:
    """Convert speech to text using Google Speech Recognition."""
    r = sr.Recognizer()
    try:
        with sr.AudioFile(audio_path) as source:
            audio = r.record(source)
        text = r.recognize_google(audio, language=language)
        return text
    except sr.UnknownValueError:
        return "Không thể nhận diện giọng nói."
    except sr.RequestError as e:
        return f"Lỗi khi kết nối đến dịch vụ nhận diện: {e}"
    except Exception as e:
        return f"Lỗi: {str(e)}"
