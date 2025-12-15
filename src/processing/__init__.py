# Audio Processing Module
from .effects import (
    chipmunk_effect,
    robot_effect,
    echo_effect,
    electronic_voice_effect,
    stutter_effect,
)
from .filters import process_voice
from .speech import text_to_speech, speech_to_text

__all__ = [
    "chipmunk_effect",
    "robot_effect", 
    "echo_effect",
    "electronic_voice_effect",
    "stutter_effect",
    "process_voice",
    "text_to_speech",
    "speech_to_text",
]
