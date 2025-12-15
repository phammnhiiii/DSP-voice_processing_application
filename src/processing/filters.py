# filters.py - Audio Filters and Voice Processing
import librosa
import numpy as np
import soundfile as sf
import tempfile
import os
from scipy.signal import butter, lfilter

from src.utils.visualization import save_plot


def butter_lowpass_filter(data: np.ndarray, cutoff: float, fs: int, order: int = 5) -> np.ndarray:
    """Apply Butterworth lowpass filter."""
    nyq = 0.5 * fs
    normal_cutoff = cutoff / nyq
    b, a = butter(order, normal_cutoff, btype='low', analog=False)
    y = lfilter(b, a, data)
    return y


def remove_non_voice_sounds(y: np.ndarray, sr: int) -> np.ndarray:
    """Remove frequencies outside human voice range (300-3000 Hz)."""
    Y = np.fft.fft(y)
    freqs = np.fft.fftfreq(len(Y), 1/sr)
    Y[(freqs > 3000)] = 0
    Y[(freqs < 300)] = 0
    y_filtered = np.fft.ifft(Y).real
    return y_filtered


def remove_echo(y: np.ndarray, sr: int, delay: float = 0.2, attenuation: float = 0.6) -> np.ndarray:
    """Remove echo from audio signal."""
    delay_samples = int(delay * sr)
    y_echo = np.zeros_like(y)
    if delay_samples < len(y):
        y_echo[delay_samples:] = y[:-delay_samples]
    y_no_echo = y - attenuation * y_echo
    return y_no_echo


def process_voice(audio_path: str, cutoff: float = 3000, delay: float = 0.2, attenuation: float = 0.6) -> tuple[str, str]:
    """Process voice: lowpass filter, remove non-voice sounds, remove echo."""
    y, sr = librosa.load(audio_path)
    y_filtered = butter_lowpass_filter(y, cutoff, sr)
    y_voice_only = remove_non_voice_sounds(y_filtered, sr)
    y_no_echo = remove_echo(y_voice_only, sr, delay, attenuation)

    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
        sf.write(temp_file.name, y_no_echo, sr)
        processed_audio_path = temp_file.name

    waveform_path = save_plot(y_no_echo, sr, "Voice Processing", os.path.dirname(processed_audio_path))
    return processed_audio_path, waveform_path
