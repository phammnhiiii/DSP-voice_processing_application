import speech_recognition as sr

def speech_to_text(audio_path, lang="vi-VN"):
    r = sr.Recognizer()
    with sr.AudioFile(audio_path) as src:
        audio = r.record(src)
    return r.recognize_google(audio, language=lang)
