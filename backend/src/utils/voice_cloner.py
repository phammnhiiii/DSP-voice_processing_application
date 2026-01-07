# voice_cloner.py - Voice Cloning using XTTS (Coqui TTS)
"""
XTTS - Cross-lingual Text-to-Speech with Voice Cloning
Supports 17 languages including Vietnamese.
Uses pretrained model - no training required.
"""

import os
import tempfile
from pathlib import Path
from uuid import uuid4

# Fix for PyTorch 2.6+ weights_only default change
try:
    import torch
    # Allow loading TTS model weights
    torch.serialization.add_safe_globals([])
except:
    pass

try:
    # Set environment variable to allow unsafe loading (needed for XTTS)
    os.environ["TORCH_WEIGHTS_ONLY"] = "0"
    from TTS.api import TTS
    XTTS_AVAILABLE = True
    XTTS_ERROR = None
except ImportError as e:
    XTTS_AVAILABLE = False
    XTTS_ERROR = f"TTS not installed: {e}"
    print(f"Warning: TTS not available. Install with: pip install TTS")
except Exception as e:
    XTTS_AVAILABLE = False
    XTTS_ERROR = f"TTS import error: {e}"
    print(f"Warning: TTS import error: {e}")


class VoiceCloner:
    """Voice cloning using XTTS model."""
    
    # Supported languages
    SUPPORTED_LANGUAGES = [
        "en", "es", "fr", "de", "it", "pt", "pl", "tr", "ru", 
        "nl", "cs", "ar", "zh-cn", "ja", "hu", "ko", "hi"
    ]
    
    def __init__(self):
        """Initialize XTTS model."""
        self.tts = None
        self._initialized = False
        
        if XTTS_AVAILABLE:
            try:
                print("Loading XTTS model (this may take a while on first run)...")
                # Use XTTS v2 for best quality
                self.tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")
                self._initialized = True
                print("XTTS model loaded successfully!")
            except Exception as e:
                print(f"Error initializing XTTS: {e}")
                self._initialized = False
    
    def is_available(self) -> bool:
        """Check if XTTS is available and initialized."""
        return XTTS_AVAILABLE and self._initialized
    
    def clone_voice(
        self, 
        text: str, 
        speaker_wav: str, 
        language: str = "vi",
        output_path: str = None
    ) -> str:
        """
        Clone voice from speaker sample and generate speech.
        
        Args:
            text: Text to synthesize
            speaker_wav: Path to speaker audio sample (6+ seconds recommended)
            language: Target language code (default: Vietnamese)
            output_path: Path to save output (optional)
            
        Returns:
            Path to generated audio file
        """
        if not self.is_available():
            raise RuntimeError("XTTS is not available")
        
        # Validate language
        if language not in self.SUPPORTED_LANGUAGES:
            print(f"Warning: Language '{language}' may not be supported. Using 'en'.")
            language = "en"
        
        # Generate output path if not provided
        if output_path is None:
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
            output_path = temp_file.name
            temp_file.close()
        
        try:
            # Generate speech with cloned voice
            self.tts.tts_to_file(
                text=text,
                speaker_wav=speaker_wav,
                language=language,
                file_path=output_path
            )
            
            return output_path
            
        except Exception as e:
            raise RuntimeError(f"Error during voice cloning: {e}")
    
    def get_supported_languages(self) -> list:
        """Get list of supported language codes."""
        return self.SUPPORTED_LANGUAGES.copy()


# Global instance (lazy initialization)
_voice_cloner = None


def get_voice_cloner() -> VoiceCloner:
    """Get or create the global VoiceCloner instance."""
    global _voice_cloner
    if _voice_cloner is None:
        _voice_cloner = VoiceCloner()
    return _voice_cloner


def clone_voice_xtts(
    text: str, 
    speaker_wav: str, 
    language: str = "vi",
    output_path: str = None
) -> str:
    """
    Convenience function to clone voice using XTTS.
    
    Args:
        text: Text to synthesize
        speaker_wav: Path to speaker audio sample
        language: Target language code
        output_path: Path to save output (optional)
        
    Returns:
        Path to generated audio file
    """
    cloner = get_voice_cloner()
    return cloner.clone_voice(text, speaker_wav, language, output_path)
