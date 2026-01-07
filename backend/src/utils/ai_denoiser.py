# ai_denoiser.py - AI-based Audio Denoising using DeepFilterNet
"""
DeepFilterNet - High-quality speech enhancement and noise reduction
Uses pretrained deep learning model for superior denoising.
"""

import os
import tempfile
from pathlib import Path

try:
    from df.enhance import enhance, init_df, load_audio, save_audio
    DEEPFILTERNET_AVAILABLE = True
except ImportError:
    DEEPFILTERNET_AVAILABLE = False
    print("Warning: DeepFilterNet not available. Install with: pip install deepfilternet")


class AIDenoiser:
    """AI-based denoiser using DeepFilterNet."""
    
    def __init__(self):
        """Initialize the DeepFilterNet model."""
        self.model = None
        self.df_state = None
        self.sample_rate = None
        self._initialized = False
        
        if DEEPFILTERNET_AVAILABLE:
            try:
                print("Loading DeepFilterNet model...")
                self.model, self.df_state, _ = init_df()
                self.sample_rate = self.df_state.sr()
                self._initialized = True
                print(f"DeepFilterNet loaded successfully. Sample rate: {self.sample_rate} Hz")
            except Exception as e:
                print(f"Error initializing DeepFilterNet: {e}")
                self._initialized = False
    
    def is_available(self) -> bool:
        """Check if DeepFilterNet is available and initialized."""
        return DEEPFILTERNET_AVAILABLE and self._initialized
    
    def denoise(self, input_path: str, output_path: str = None) -> str:
        """
        Denoise audio file using DeepFilterNet.
        
        Args:
            input_path: Path to input audio file
            output_path: Path to save denoised audio (optional)
            
        Returns:
            Path to denoised audio file
        """
        if not self.is_available():
            raise RuntimeError("DeepFilterNet is not available")
        
        # Generate output path if not provided
        if output_path is None:
            suffix = Path(input_path).suffix or '.wav'
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
            output_path = temp_file.name
            temp_file.close()
        
        try:
            # Load audio at model's sample rate
            audio, _ = load_audio(input_path, sr=self.sample_rate)
            
            # Apply enhancement
            enhanced = enhance(self.model, self.df_state, audio)
            
            # Save enhanced audio
            save_audio(output_path, enhanced, self.sample_rate)
            
            return output_path
            
        except Exception as e:
            raise RuntimeError(f"Error during denoising: {e}")


# Global instance (lazy initialization)
_ai_denoiser = None


def get_ai_denoiser() -> AIDenoiser:
    """Get or create the global AIDenoiser instance."""
    global _ai_denoiser
    if _ai_denoiser is None:
        _ai_denoiser = AIDenoiser()
    return _ai_denoiser


def ai_denoise(input_path: str, output_path: str = None) -> str:
    """
    Convenience function to denoise audio using AI.
    
    Args:
        input_path: Path to input audio file
        output_path: Path to save denoised audio (optional)
        
    Returns:
        Path to denoised audio file
    """
    denoiser = get_ai_denoiser()
    return denoiser.denoise(input_path, output_path)
