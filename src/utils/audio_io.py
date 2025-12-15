# audio_io.py - Audio Input/Output Utilities
import os
import uuid
import tempfile
from pydub import AudioSegment


def convert_to_wav(input_path: str) -> str:
    """
    Convert any audio file to WAV format for processing.
    Supports: webm, mp3, ogg, m4a, flac, etc.
    """
    try:
        # Detect format from extension
        ext = os.path.splitext(input_path)[1].lower().replace('.', '')
        
        # Handle webm specifically (browser recording format)
        if ext == 'webm':
            audio = AudioSegment.from_file(input_path, format='webm')
        elif ext == 'mp3':
            audio = AudioSegment.from_mp3(input_path)
        elif ext == 'ogg':
            audio = AudioSegment.from_ogg(input_path)
        elif ext == 'm4a':
            audio = AudioSegment.from_file(input_path, format='m4a')
        elif ext == 'wav':
            # Already WAV, but might need resampling
            audio = AudioSegment.from_wav(input_path)
        else:
            # Try generic loading
            audio = AudioSegment.from_file(input_path)
        
        # Export as WAV
        output_path = tempfile.mktemp(suffix='.wav')
        audio.export(output_path, format='wav')
        
        return output_path
    except Exception as e:
        raise ValueError(f"Cannot convert audio file: {str(e)}")


def ensure_wav_format(input_path: str) -> str:
    """
    Ensure input is in WAV format. Convert if necessary.
    Returns path to WAV file.
    """
    ext = os.path.splitext(input_path)[1].lower()
    
    if ext == '.wav':
        # Check if it's a valid WAV
        try:
            audio = AudioSegment.from_wav(input_path)
            return input_path
        except:
            pass
    
    # Convert to WAV
    return convert_to_wav(input_path)
