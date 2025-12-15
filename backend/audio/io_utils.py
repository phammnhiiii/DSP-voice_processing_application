import librosa
import soundfile as sf

def load_audio(path, sr=None):
    return librosa.load(path, sr=sr)

def save_audio(path, y, sr):
    sf.write(path, y, sr)
