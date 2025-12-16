# effects.py - Audio Effects (DSP) - IMPROVED VERSION
import librosa
import numpy as np
import soundfile as sf
import tempfile
import os
from scipy.signal import butter, lfilter

from src.utils.visualization import save_plot


# ============== UTILITY FUNCTIONS ==============

def normalize_audio(y: np.ndarray, target_peak: float = 0.95) -> np.ndarray:
    """Normalize audio to target peak level."""
    peak = np.max(np.abs(y))
    if peak > 0:
        return y * (target_peak / peak)
    return y


def highpass_filter(y: np.ndarray, sr: int, cutoff: float = 80, order: int = 5) -> np.ndarray:
    """Apply highpass filter to remove low frequency rumble."""
    nyq = 0.5 * sr
    normal_cutoff = cutoff / nyq
    b, a = butter(order, normal_cutoff, btype='high', analog=False)
    return lfilter(b, a, y)


def bandpass_filter(y: np.ndarray, sr: int, low: float = 300, high: float = 3400) -> np.ndarray:
    """Apply bandpass filter using FFT."""
    Y = np.fft.fft(y)
    freqs = np.fft.fftfreq(len(Y), 1/sr)
    Y[(np.abs(freqs) < low) | (np.abs(freqs) > high)] = 0
    return np.fft.ifft(Y).real


def noise_gate(y: np.ndarray, threshold: float = 0.02) -> np.ndarray:
    """Apply noise gate - silence audio below threshold."""
    mask = np.abs(y) > threshold
    # Smooth the mask to avoid clicks
    from scipy.ndimage import binary_dilation
    mask = binary_dilation(mask, iterations=100)
    return y * mask


def spectral_subtraction(y: np.ndarray, sr: int, noise_reduce: float = 0.5) -> np.ndarray:
    """Simple spectral subtraction for noise reduction."""
    # Estimate noise from first 0.1 seconds (assuming silence/noise at start)
    noise_samples = int(0.1 * sr)
    if len(y) > noise_samples:
        noise_profile = np.abs(np.fft.fft(y[:noise_samples]))
        noise_profile = np.mean(noise_profile) * noise_reduce
        
        Y = np.fft.fft(y)
        magnitude = np.abs(Y)
        phase = np.angle(Y)
        
        # Subtract noise estimate
        magnitude = np.maximum(magnitude - noise_profile, 0)
        
        # Reconstruct
        Y_clean = magnitude * np.exp(1j * phase)
        return np.fft.ifft(Y_clean).real
    return y


# ============== EFFECT FUNCTIONS ==============

def chipmunk_effect(audio_path: str) -> tuple[str, str]:
    """Apply chipmunk effect - IMPROVED with time_stretch."""
    y, sr = librosa.load(audio_path)
    
    # Use time_stretch (better quality than resample)
    y_fast = librosa.effects.time_stretch(y, rate=1.5)
    # Pitch shift +8 semitones (not +12, more natural)
    y_high_pitch = librosa.effects.pitch_shift(y_fast, sr=sr, n_steps=8)
    # Normalize
    y_high_pitch = normalize_audio(y_high_pitch)

    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
        sf.write(temp_file.name, y_high_pitch, sr)
        processed_audio_path = temp_file.name

    waveform_path = save_plot(y_high_pitch, sr, "Chipmunk Effect", os.path.dirname(processed_audio_path))
    return processed_audio_path, waveform_path


def robot_effect(audio_path: str) -> tuple[str, str]:
    """Apply robot effect - IMPROVED with ring modulation."""
    y, sr = librosa.load(audio_path)
    
    # Pitch shift down
    y_low_pitch = librosa.effects.pitch_shift(y, sr=sr, n_steps=-6)
    
    # Ring modulation with 50Hz sine wave (robotic sound)
    t = np.arange(len(y_low_pitch)) / sr
    modulator = np.sin(2 * np.pi * 50 * t)
    y_robot = y_low_pitch * modulator
    
    # Clip and normalize
    y_robot = np.clip(y_robot, -0.5, 0.5)
    y_robot = normalize_audio(y_robot)

    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
        sf.write(temp_file.name, y_robot, sr)
        processed_audio_path = temp_file.name

    waveform_path = save_plot(y_robot, sr, "Robot Effect", os.path.dirname(processed_audio_path))
    return processed_audio_path, waveform_path


def echo_effect(audio_path: str, delay: float = 0.2) -> tuple[str, str]:
    """Apply multi-tap echo effect - IMPROVED with 3 echoes."""
    y, sr = librosa.load(audio_path)
    
    # Multi-tap echo with decaying amplitude
    delays = [delay, delay * 2, delay * 3]
    decays = [0.5, 0.3, 0.1]
    
    y_echo = y.copy()
    for d, decay in zip(delays, decays):
        delay_samples = int(d * sr)
        if delay_samples < len(y):
            echo = np.zeros_like(y)
            echo[delay_samples:] = y[:-delay_samples] * decay
            y_echo = y_echo + echo
    
    # Normalize to prevent clipping
    y_echo = normalize_audio(y_echo)

    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
        sf.write(temp_file.name, y_echo, sr)
        processed_audio_path = temp_file.name

    waveform_path = save_plot(y_echo, sr, "Echo Effect", os.path.dirname(processed_audio_path))
    return processed_audio_path, waveform_path


def electronic_voice_effect(audio_path: str) -> tuple[str, str]:
    """Apply electronic/synth voice effect."""
    y, sr = librosa.load(audio_path)
    y_low_pitch = librosa.effects.pitch_shift(y, sr=sr, n_steps=-3)
    noise = np.random.normal(0, 0.002, y.shape)
    y_electronic = np.sin(y_low_pitch * 2 * np.pi) + noise
    y_electronic = normalize_audio(y_electronic)

    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
        sf.write(temp_file.name, y_electronic, sr)
        processed_audio_path = temp_file.name

    waveform_path = save_plot(y_electronic, sr, "Electronic Voice Effect", os.path.dirname(processed_audio_path))
    return processed_audio_path, waveform_path


def stutter_effect(audio_path: str, repeat: int = 3) -> tuple[str, str]:
    """Apply stutter effect with configurable repeat count."""
    y, sr = librosa.load(audio_path)
    chunk_size = len(y) // 10
    if chunk_size > 0:
        y_stutter = np.concatenate([y[:chunk_size]] * repeat + [y])
    else:
        y_stutter = y
    
    y_stutter = normalize_audio(y_stutter)

    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
        sf.write(temp_file.name, y_stutter, sr)
        processed_audio_path = temp_file.name

    waveform_path = save_plot(y_stutter, sr, "Stutter Effect", os.path.dirname(processed_audio_path))
    return processed_audio_path, waveform_path


def whisper_effect(audio_path: str) -> tuple[str, str]:
    """Apply whisper effect (breathy, quiet voice)."""
    y, sr = librosa.load(audio_path)
    noise = np.random.normal(0, 0.02, y.shape)
    y_whisper = noise * np.sign(y)
    y_whisper = normalize_audio(y_whisper)

    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
        sf.write(temp_file.name, y_whisper, sr)
        processed_audio_path = temp_file.name

    waveform_path = save_plot(y_whisper, sr, "Whisper Effect", os.path.dirname(processed_audio_path))
    return processed_audio_path, waveform_path


def distortion_effect(audio_path: str, gain: float = 6.0) -> tuple[str, str]:
    """Apply distortion effect (like guitar distortion)."""
    y, sr = librosa.load(audio_path)
    y_dist = np.tanh(gain * y)
    y_dist = normalize_audio(y_dist)

    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
        sf.write(temp_file.name, y_dist, sr)
        processed_audio_path = temp_file.name

    waveform_path = save_plot(y_dist, sr, "Distortion Effect", os.path.dirname(processed_audio_path))
    return processed_audio_path, waveform_path


def reverse_effect(audio_path: str) -> tuple[str, str]:
    """Reverse the audio playback."""
    y, sr = librosa.load(audio_path)
    y_reverse = y[::-1]

    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
        sf.write(temp_file.name, y_reverse, sr)
        processed_audio_path = temp_file.name

    waveform_path = save_plot(y_reverse, sr, "Reverse Effect", os.path.dirname(processed_audio_path))
    return processed_audio_path, waveform_path


def monster_effect(audio_path: str) -> tuple[str, str]:
    """Apply monster voice effect (deep, slow)."""
    y, sr = librosa.load(audio_path)
    y_low = librosa.effects.pitch_shift(y, sr=sr, n_steps=-10)
    y_slow = librosa.effects.time_stretch(y_low, rate=0.8)
    y_slow = normalize_audio(y_slow)

    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
        sf.write(temp_file.name, y_slow, sr)
        processed_audio_path = temp_file.name

    waveform_path = save_plot(y_slow, sr, "Monster Effect", os.path.dirname(processed_audio_path))
    return processed_audio_path, waveform_path


def telephone_effect(audio_path: str) -> tuple[str, str]:
    """Apply old telephone effect - IMPROVED with real bandpass 300-3400Hz."""
    y, sr = librosa.load(audio_path)
    
    # Real bandpass filter for telephone (300-3400 Hz)
    y_telephone = bandpass_filter(y, sr, low=300, high=3400)
    
    # Add slight distortion for vintage feel
    y_telephone = np.tanh(y_telephone * 2) * 0.8
    
    y_telephone = normalize_audio(y_telephone)

    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
        sf.write(temp_file.name, y_telephone, sr)
        processed_audio_path = temp_file.name

    waveform_path = save_plot(y_telephone, sr, "Telephone Effect", os.path.dirname(processed_audio_path))
    return processed_audio_path, waveform_path
