from fastapi import APIRouter, HTTPException, status
import time
import secrets
import logging
from app.schemas.speech import SessionResponse, TranscribeRequest, TranscribeResponse
from app.services.crypto_service import crypto_service
from app.services.indicwhisper_service import indicwhisper_service
from app.services.language_service import language_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/asr", tags=["speech"])

@router.get("/session", response_model=SessionResponse)
async def get_session():
    try:
        session_id = secrets.token_urlsafe(32)
        crypto_service.create_session(session_id)
        public_key = crypto_service.get_server_public_key_base64()
        return SessionResponse(session_id=session_id, public_key=public_key)
    except Exception as e:
        logger.error(f"Error creating session: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/transcribe", response_model=TranscribeResponse)
async def transcribe(request: TranscribeRequest):
    start_time = time.time()
    
    # A session is one-use and must be valid before any key or ciphertext work.
    try:
        crypto_service.consume_session(request.session_id)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error))

    # Check if model is loaded
    if not indicwhisper_service.is_loaded:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="ASR model is unavailable")

    # Derive session key
    try:
        session_key = crypto_service.derive_session_key(request.client_public_key)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=400, detail="Key derivation failed")

    # Decrypt audio
    try:
        audio_bytes_array = crypto_service.decrypt_audio(request.encrypted_audio, request.iv, session_key)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=400, detail="Decryption failed")

    # Run ASR
    try:
        transcription_result = indicwhisper_service.transcribe(audio_bytes_array, request.mime_type)
    except Exception:
        raise HTTPException(status_code=500, detail="Transcription processing failed")
    finally:
        # Zero out memory
        for i in range(len(audio_bytes_array)):
            audio_bytes_array[i] = 0

    text = transcription_result["text"]
    raw_lang = transcription_result.get("language", "en")
    confidence = transcription_result.get("confidence", 1.0)
    
    mapped_lang = language_service.map_language(raw_lang)

    # Encrypt transcript response
    try:
        encrypted_result = crypto_service.encrypt_response(text, session_key)
    except ValueError:
        raise HTTPException(status_code=500, detail="Encryption failed")

    # Log ONLY safe data
    processing_time_ms = int((time.time() - start_time) * 1000)
    logger.info(f"Transcription complete | session_id: {request.session_id} | language: {mapped_lang} | confidence: {confidence:.2f} | processing_time_ms: {processing_time_ms}")

    return TranscribeResponse(
        encrypted_text=encrypted_result["encrypted_text"],
        iv=encrypted_result["iv"],
        language=mapped_lang,
        confidence=confidence
    )
