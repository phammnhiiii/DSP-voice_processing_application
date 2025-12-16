# test_effects.py - Unit Tests for Audio Effects
import pytest
import os
import sys

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def test_imports():
    """Test that all processing modules can be imported."""
    from src.processing import (
        chipmunk_effect,
        robot_effect,
        echo_effect,
        electronic_voice_effect,
        stutter_effect,
        process_voice,
        text_to_speech,
        speech_to_text,
    )
    assert callable(chipmunk_effect)
    assert callable(robot_effect)
    assert callable(echo_effect)
    assert callable(text_to_speech)


def test_config_imports():
    """Test that config can be imported."""
    from config.settings import TEMP_DIR, CORS_ORIGINS
    assert TEMP_DIR is not None
    assert isinstance(CORS_ORIGINS, list)


def test_api_imports():
    """Test that API can be imported."""
    from src.api import router
    assert router is not None


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
