# translation.py - Text Translation Utilities
from deep_translator import GoogleTranslator


def translate_text(text: str, source_lang: str, target_lang: str) -> str:
    """
    Translate text using Google Translate (free, no API key required).
    
    Args:
        text: Text to translate
        source_lang: Source language code (e.g., 'vi', 'en', 'ja')
        target_lang: Target language code
    
    Returns:
        Translated text
    """
    try:
        # Map full language codes to short codes
        source = source_lang.split('-')[0] if '-' in source_lang else source_lang
        target = target_lang.split('-')[0] if '-' in target_lang else target_lang
        
        translator = GoogleTranslator(source=source, target=target)
        translated = translator.translate(text)
        return translated
    except Exception as e:
        raise ValueError(f"Translation failed: {str(e)}")


# Supported language codes
SUPPORTED_LANGUAGES = {
    'vi': 'Tiếng Việt',
    'en': 'English',
    'ja': '日本語',
    'ko': '한국어',
    'zh-CN': '中文',
    'fr': 'Français',
    'de': 'Deutsch',
    'es': 'Español',
    'ru': 'Русский',
    'th': 'ไทย',
    'id': 'Bahasa Indonesia',
}
