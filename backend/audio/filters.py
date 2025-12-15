import numpy as np
from scipy.signal import butter, lfilter

def lowpass_filter(y, sr, cutoff=3000, order=5):
    nyq = 0.5 * sr
    normal = cutoff / nyq
    b, a = butter(order, normal, btype='low')
    return lfilter(b, a, y)

def bandpass_voice(y, sr):
    Y = np.fft.fft(y)
    freqs = np.fft.fftfreq(len(Y), 1/sr)
    Y[(freqs < 300) | (freqs > 3000)] = 0
    return np.fft.ifft(Y).real
