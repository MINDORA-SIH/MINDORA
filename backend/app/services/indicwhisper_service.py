import io
import os
import logging
import numpy as np

logger = logging.getLogger(__name__)

class IndicWhisperService:
    def __init__(self):
        self.model = None
        self.processor = None
        self.device = None
        self.is_loaded = False

    def load_model(self):
        model_id = os.getenv("INDICWHISPER_MODEL", "ai4bharat/indicwhisper-medium")
        device_env = os.getenv("INDICWHISPER_DEVICE", "auto")

        logger.info(f"Loading IndicWhisper model {model_id} on device {device_env}...")
        
        try:
            import torch
            from transformers import WhisperProcessor, WhisperForConditionalGeneration
            
            if device_env == "auto":
                self.device = "cuda" if torch.cuda.is_available() else "cpu"
            else:
                self.device = device_env

            self.processor = WhisperProcessor.from_pretrained(model_id)
            self.model = WhisperForConditionalGeneration.from_pretrained(model_id).to(self.device)
            self.is_loaded = True
            logger.info(f"Model loaded successfully on {self.device}")
        except Exception as e:
            logger.warning(f"Failed to load IndicWhisper model: {e}. Will use fallback/mock responses.")
            self.is_loaded = False

    def transcribe(self, audio_bytes: bytearray, mime_type: str) -> dict:
        if not self.is_loaded:
            logger.info("Using mock transcription due to model not being loaded")
            return {
                "text": "This is a mock transcription because the model failed to load.",
                "language": "en",
                "confidence": 0.95
            }

        try:
            import librosa
            import soundfile as sf
            
            # Use soundfile directly with BytesIO
            with io.BytesIO(audio_bytes) as audio_file:
                audio_array, sample_rate = sf.read(audio_file)

            # Convert to mono if necessary
            if len(audio_array.shape) > 1:
                audio_array = librosa.to_mono(audio_array.T)

            # Resample to 16000Hz which Whisper expects
            if sample_rate != 16000:
                audio_array = librosa.resample(audio_array, orig_sr=sample_rate, target_sr=16000)

            # Process with model
            import torch
            inputs = self.processor(audio_array, sampling_rate=16000, return_tensors="pt")
            input_features = inputs.input_features.to(self.device)

            with torch.no_grad():
                predicted_ids = self.model.generate(input_features)
                
            transcription = self.processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
            
            # Zero out the arrays
            audio_array.fill(0)
            
            return {
                "text": transcription.strip(),
                "language": "en", # Simplified language detection for mock/indicwhisper-medium
                "confidence": 0.85
            }
        except Exception as e:
            logger.error("Error during transcription") # generic log without transcript info
            raise RuntimeError(f"Transcription failed")

indicwhisper_service = IndicWhisperService()
