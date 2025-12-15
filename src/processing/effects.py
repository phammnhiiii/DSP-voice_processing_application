# effects.py - Audio Effects (DSP)
import librosa
import numpy as np
import soundfile as sf
import tempfile
import os

from src.utils.visualization import save_plot


def chipmunk_effect(audio_path: str, rate: float = 2.0) -> tuple[str, str]:
    """Apply chipmunk effect (high pitch, fast playback)."""
    y, sr = librosa.load(audio_path)
    y_fast = librosa.resample(y, orig_sr=sr, target_sr=int(sr * rate))
    y_high_pitch = librosa.effects.pitch_shift(y_fast, sr=int(sr * rate), n_steps=12)

    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
        sf.write(temp_file.name, y_high_pitch, int(sr * rate))
        processed_audio_path = temp_file.name

    waveform_path = save_plot(y_high_pitch, int(sr * rate), "Chipmunk Effect", os.path.dirname(processed_audio_path))
    return processed_audio_path, waveform_path


def robot_effect(audio_path: str) -> tuple[str, str]:
    """Apply robot effect (low pitch, clipped)."""
    y, sr = librosa.load(audio_path)
    y_low_pitch = librosa.effects.pitch_shift(y, sr=sr, n_steps=-6)
    y_robot = np.clip(y_low_pitch, -0.5, 0.5)

    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
        sf.write(temp_file.name, y_robot, sr)
        processed_audio_path = temp_file.name

    waveform_path = save_plot(y_robot, sr, "Robot Effect", os.path.dirname(processed_audio_path))
    return processed_audio_path, waveform_path


def echo_effect(audio_path: str, delay: float = 0.2) -> tuple[str, str]:
    """Apply echo effect with configurable delay."""
    y, sr = librosa.load(audio_path)
    echo = np.zeros_like(y)
    delay_samples = int(delay * sr)
    if delay_samples < len(y):
        echo[delay_samples:] = y[:-delay_samples]
    y_echo = y + 0.6 * echo

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

    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
        sf.write(temp_file.name, y_stutter, sr)
        processed_audio_path = temp_file.name

    waveform_path = save_plot(y_stutter, sr, "Stutter Effect", os.path.dirname(processed_audio_path))
    return processed_audio_path, waveform_path
