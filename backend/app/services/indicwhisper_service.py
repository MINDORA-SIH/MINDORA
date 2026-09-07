import io
import os
import logging
import subprocess
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
        except Exception:
            logger.warning("IndicWhisper model could not be loaded; voice transcription is unavailable.")
            self.is_loaded = False

    def transcribe(self, audio_bytes: bytearray, mime_type: str) -> dict:
        if not self.is_loaded:
            raise RuntimeError("ASR model is unavailable")

        try:
            import soundfile as sf
            try:
                with io.BytesIO(audio_bytes) as audio_file:
                    audio_array, sample_rate = sf.read(audio_file, dtype="float32")
                if len(audio_array.shape) > 1:
                    audio_array = np.mean(audio_array, axis=1, dtype=np.float32)
                if sample_rate != 16000:
                    import librosa
                    audio_array = librosa.resample(audio_array, orig_sr=sample_rate, target_sr=16000)
            except Exception:
                # FFmpeg converts WebM/Opus in memory; no audio file is created.
                result = subprocess.run(
                    ["ffmpeg", "-v", "error", "-i", "pipe:0", "-f", "f32le", "-ac", "1", "-ar", "16000", "pipe:1"],
                    input=bytes(audio_bytes), capture_output=True, check=True, timeout=15,
                )
                audio_array = np.frombuffer(result.stdout, dtype=np.float32).copy()

            if audio_array.size == 0:
                raise RuntimeError("Audio contained no samples")

            # Process with model
            import torch
            inputs = self.processor(audio_array, sampling_rate=16000, return_tensors="pt")
            input_features = inputs.input_features.to(self.device)

            with torch.no_grad():
                generation = self.model.generate(
                    input_features,
                    return_dict_in_generate=True,
                    output_scores=True,
                )
            predicted_ids = generation.sequences
                
            transcription = self.processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]

            detected_language = "en"
            language_ids = getattr(self.model.generation_config, "lang_to_id", {})
            initial_tokens = set(predicted_ids[0, :5].tolist())
            for language, token_id in language_ids.items():
                if token_id in initial_tokens:
                    detected_language = language.removeprefix("<|").removesuffix("|>")
                    break

            confidence = 0.0
            if generation.scores:
                confidence = sum(
                    float(torch.softmax(score, dim=-1).max(dim=-1).values.mean().item())
                    for score in generation.scores
                ) / len(generation.scores)
            
            # Zero out the arrays
            audio_array.fill(0)
            
            return {
                "text": transcription.strip(),
                "language": detected_language,
                "confidence": confidence
            }
        except Exception:
            logger.error("Error during transcription")
            raise RuntimeError("Transcription failed")

indicwhisper_service = IndicWhisperService()
