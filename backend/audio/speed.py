import librosa

def change_speed(y, speed=1.0):
    """
    speed < 1.0 : nói chậm
    speed = 1.0 : bình thường
    speed > 1.0 : nói nhanh
    """
    if speed <= 0:
        raise ValueError("Speed must be > 0")

    return librosa.effects.time_stretch(y, rate=speed)
