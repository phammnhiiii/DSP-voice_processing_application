import numpy as np
import librosa

# 1. Chipmunk
def chipmunk(y, sr):
    y_fast = librosa.effects.time_stretch(y=y, rate=1.5)
    y_high = librosa.effects.pitch_shift(y=y_fast, sr=sr, n_steps=8)
    return y_high, sr

# 2. Robot
def robot(y, sr):
    y_low = librosa.effects.pitch_shift(y=y, sr=sr, n_steps=-6)
    y_robot = np.sign(y_low) * np.abs(y_low)
    return y_robot, sr

# 3. Echo
def echo(y, sr, delay=0.3, decay=0.5):
    delay_samples = int(delay * sr)
    echo_signal = np.zeros_like(y)
    echo_signal[delay_samples:] = y[:-delay_samples]
    y_echo = y + decay * echo_signal
    return y_echo, sr

# 4. Whisper
def whisper(y, sr):
    noise = np.random.normal(0, 0.02, y.shape)
    y_whisper = noise * np.sign(y)
    return y_whisper, sr

# 5. Distortion
def distortion(y, sr, gain=6):
    y_dist = np.tanh(gain * y)
    return y_dist, sr

# 6. Reverse
def reverse_audio(y, sr):
    return y[::-1], sr

# 7. Telephone effect
def telephone(y, sr):
    y_band = librosa.effects.preemphasis(y=y)
    y_band = librosa.effects.deemphasis(y=y_band)
    return y_band, sr

# 8. Monster voice
def monster(y, sr):
    y_low = librosa.effects.pitch_shift(y=y, sr=sr, n_steps=-10)
    y_slow = librosa.effects.time_stretch(y=y_low, rate=0.8)
    return y_slow, sr

# 9. Stutter
def stutter(y, sr, repeat=3):
    chunk = y[:len(y)//8]
    y_stutter = np.concatenate([chunk]*repeat + [y])
    return y_stutter, sr
