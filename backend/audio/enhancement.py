from .filters import lowpass_filter, bandpass_voice

def enhance_voice(y, sr):
    y = lowpass_filter(y, sr)
    y = bandpass_voice(y, sr)
    return y
