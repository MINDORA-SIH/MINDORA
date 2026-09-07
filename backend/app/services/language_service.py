import logging

logger = logging.getLogger(__name__)

class LanguageService:
    def __init__(self):
        # Map IndicWhisper codes to app language codes
        self.language_map = {
            "en": "en",
            "hi": "hi",
            "as": "as",
            "bn": "bn",
            "ne": "ne",
            "brx": "brx",
            "mni": "mni",
            "lus": "lus",
            "kha": "kha",
            "trp": "trp",
        }
        self.supported_languages = set(self.language_map.values())

    def map_language(self, detected_code: str) -> str:
        code = detected_code.lower()
        mapped = self.language_map.get(code, "en")
        if mapped not in self.supported_languages:
            return "en"
        return mapped

language_service = LanguageService()
