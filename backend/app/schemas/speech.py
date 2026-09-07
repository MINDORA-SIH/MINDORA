from pydantic import BaseModel, Field, validator
from typing import Literal

class SessionResponse(BaseModel):
    session_id: str
    public_key: str
    key_algorithm: str = "ECDH-P256-HKDF-SHA256-AES-256-GCM"

class TranscribeRequest(BaseModel):
    session_id: str
    client_public_key: str
    encrypted_audio: str
    iv: str
    mime_type: str
    
    @validator("encrypted_audio")
    def validate_audio_length(cls, v):
        if len(v) > 2_097_152:
            raise ValueError("Audio payload too large (max 2MB base64)")
        return v
    
    @validator("mime_type")
    def validate_mime_type(cls, v):
        allowed = ["audio/webm", "audio/webm;codecs=opus", "audio/ogg", "audio/wav"]
        if v not in allowed:
            raise ValueError(f"Invalid mime_type: {v}")
        return v
    
    @validator("iv")
    def validate_iv(cls, v):
        if len(v) != 16:
            raise ValueError("IV must be 16 base64 characters (12 bytes)")
        return v

class TranscribeResponse(BaseModel):
    encrypted_text: str
    iv: str
    language: str
    confidence: float
