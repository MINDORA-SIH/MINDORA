import base64
import os
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

MAX_AUDIO_PAYLOAD_BYTES = int(os.getenv("MAX_AUDIO_PAYLOAD_BYTES", "2097152"))


class ApiModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class SessionResponse(ApiModel):
    session_id: str = Field(serialization_alias="sessionId")
    public_key: str = Field(serialization_alias="publicKey")
    key_algorithm: str = Field(
        default="ECDH-P256-HKDF-SHA256-AES-256-GCM",
        serialization_alias="keyAlgorithm",
    )


class TranscribeRequest(ApiModel):
    session_id: str = Field(validation_alias="sessionId")
    client_public_key: str = Field(validation_alias="clientPublicKey")
    encrypted_audio: str = Field(validation_alias="encryptedAudio")
    iv: str
    mime_type: Literal["audio/webm", "audio/webm;codecs=opus", "audio/ogg", "audio/wav"] = Field(validation_alias="mimeType")

    @field_validator("session_id")
    @classmethod
    def validate_session_id(cls, value: str) -> str:
        if not value.strip() or len(value) > 128:
            raise ValueError("Invalid session ID")
        return value

    @field_validator("encrypted_audio")
    @classmethod
    def validate_audio(cls, value: str) -> str:
        if not value or len(value) > MAX_AUDIO_PAYLOAD_BYTES:
            raise ValueError("Audio payload too large (max 2MB base64)")
        try:
            base64.b64decode(value, validate=True)
        except Exception as error:
            raise ValueError("Invalid encrypted audio encoding") from error
        return value

    @field_validator("iv")
    @classmethod
    def validate_iv(cls, value: str) -> str:
        if len(value) != 16:
            raise ValueError("IV must be 16 base64 characters (12 bytes)")
        try:
            if len(base64.b64decode(value, validate=True)) != 12:
                raise ValueError("IV must be exactly 12 bytes")
        except ValueError:
            raise
        except Exception as error:
            raise ValueError("Invalid IV encoding") from error
        return value

    @field_validator("client_public_key")
    @classmethod
    def validate_client_key(cls, value: str) -> str:
        try:
            if len(base64.b64decode(value, validate=True)) != 65:
                raise ValueError("Invalid P-256 public key")
        except ValueError:
            raise
        except Exception as error:
            raise ValueError("Invalid P-256 public key") from error
        return value


class TranscribeResponse(ApiModel):
    encrypted_text: str = Field(serialization_alias="encryptedText")
    iv: str
    language: str
    confidence: float
