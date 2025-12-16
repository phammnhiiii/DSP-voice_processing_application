# filters.py - Audio Filters and Voice Processing - IMPROVED VERSION
import librosa
import numpy as np
import soundfile as sf
import tempfile
import os
from scipy.signal import butter, lfilter
from scipy.ndimage import binary_dilation

from src.utils.visualization import save_plot


# ============== FILTER FUNCTIONS ==============

def butter_lowpass_filter(data: np.ndarray, cutoff: float, fs: int, order: int = 5) -> np.ndarray:
    """Apply Butterworth lowpass filter."""
    nyq = 0.5 * fs
    normal_cutoff = cutoff / nyq
    b, a = butter(order, normal_cutoff, btype='low', analog=False)
    y = lfilter(b, a, data)
    return y


def butter_highpass_filter(data: np.ndarray, cutoff: float, fs: int, order: int = 5) -> np.ndarray:
    """Apply Butterworth highpass filter - removes low frequency rumble."""
    nyq = 0.5 * fs
    normal_cutoff = cutoff / nyq
    b, a = butter(order, normal_cutoff, btype='high', analog=False)
    y = lfilter(b, a, data)
    return y


def remove_non_voice_sounds(y: np.ndarray, sr: int, low: float = 300, high: float = 3400) -> np.ndarray:
    """Remove frequencies outside human voice range (default 300-3400 Hz)."""
    Y = np.fft.fft(y)
    freqs = np.fft.fftfreq(len(Y), 1/sr)
    Y[(np.abs(freqs) > high) | (np.abs(freqs) < low)] = 0
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


def noise_gate(y: np.ndarray, threshold: float = 0.02) -> np.ndarray:
    """Apply noise gate - silence audio below threshold."""
    mask = np.abs(y) > threshold
    # Smooth the mask to avoid clicks
    mask = binary_dilation(mask, iterations=100)
    return y * mask


def spectral_subtraction(y: np.ndarray, sr: int, noise_reduce: float = 0.5) -> np.ndarray:
    """Simple spectral subtraction for noise reduction."""
    noise_samples = int(0.1 * sr)
    if len(y) > noise_samples:
        noise_profile = np.abs(np.fft.fft(y[:noise_samples]))
        noise_estimate = np.mean(noise_profile) * noise_reduce
        
        Y = np.fft.fft(y)
        magnitude = np.abs(Y)
        phase = np.angle(Y)
        
        magnitude = np.maximum(magnitude - noise_estimate, 0)
        Y_clean = magnitude * np.exp(1j * phase)
        return np.fft.ifft(Y_clean).real
    return y


def normalize_audio(y: np.ndarray, target_peak: float = 0.95) -> np.ndarray:
    """Normalize audio to target peak level."""
    peak = np.max(np.abs(y))
    if peak > 0:
        return y * (target_peak / peak)
    return y


# ============== VOICE PROCESSING PIPELINE ==============

def process_voice(audio_path: str, cutoff: float = 3000, delay: float = 0.2, attenuation: float = 0.6) -> tuple[str, str]:
    """
    Process voice - IMPROVED pipeline:
    1. Highpass 80Hz - remove rumble
    2. Lowpass filter - remove high freq noise
    3. Bandpass 300-3400Hz - keep voice only
    4. Remove echo
    5. Noise gate
    6. Normalize
    """
    y, sr = librosa.load(audio_path)
    
    # 1. Highpass 80Hz - remove rumble/hum
    y = butter_highpass_filter(y, 80, sr)
    
    # 2. Lowpass filter
    y = butter_lowpass_filter(y, cutoff, sr)
    
    # 3. Bandpass voice frequencies
    y = remove_non_voice_sounds(y, sr, low=300, high=3400)
    
    # 4. Remove echo
    y = remove_echo(y, sr, delay, attenuation)
    
    # 5. Noise gate
    y = noise_gate(y, threshold=0.02)
    
    # 6. Normalize
    y = normalize_audio(y)

    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
        sf.write(temp_file.name, y, sr)
        processed_audio_path = temp_file.name

    waveform_path = save_plot(y, sr, "Voice Processing", os.path.dirname(processed_audio_path))
    return processed_audio_path, waveform_path
