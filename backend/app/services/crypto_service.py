import os
import base64
import logging
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.exceptions import InvalidTag

logger = logging.getLogger(__name__)

class CryptoService:
    def __init__(self):
        self._private_key = None
        self._public_key_bytes = None

    def initialize(self):
        logger.info("Initializing server ECDH key pair")
        self._private_key = ec.generate_private_key(ec.SECP256R1())
        public_key = self._private_key.public_key()
        # Export as uncompressed point (0x04 || x || y), 65 bytes
        self._public_key_bytes = public_key.public_numbers().encode_point()
        logger.info("Server ECDH key pair initialized")

    def get_server_public_key_base64(self) -> str:
        if not self._public_key_bytes:
            raise RuntimeError("CryptoService not initialized")
        return base64.b64encode(self._public_key_bytes).decode("utf-8")

    def derive_session_key(self, client_public_key_base64: str) -> bytes:
        try:
            client_pub_bytes = base64.b64decode(client_public_key_base64)
            # Validate P-256 point
            client_public_key = ec.EllipticCurvePublicKey.from_encoded_point(
                ec.SECP256R1(), client_pub_bytes
            )
            # Perform ECDH
            shared_key = self._private_key.exchange(ec.ECDH(), client_public_key)
            
            # HKDF with SHA-256, no salt, info=b'mindora-voice-aes256gcm', output 32 bytes
            hkdf = HKDF(
                algorithm=hashes.SHA256(),
                length=32,
                salt=None,
                info=b'mindora-voice-aes256gcm',
            )
            derived_key = hkdf.derive(shared_key)
            return derived_key
        except Exception as e:
            logger.error(f"Error deriving session key: {e}")
            raise ValueError("Invalid client public key or ECDH failure")

    def decrypt_audio(self, encrypted_data_b64: str, iv_b64: str, key: bytes) -> bytearray:
        try:
            encrypted_data = base64.b64decode(encrypted_data_b64)
            iv = base64.b64decode(iv_b64)
            
            if len(iv) != 12:
                raise ValueError("IV must be exactly 12 bytes")
                
            aesgcm = AESGCM(key)
            decrypted = aesgcm.decrypt(iv, encrypted_data, None)
            return bytearray(decrypted)
        except InvalidTag:
            logger.error("AES-GCM authentication tag verification failed")
            raise ValueError("Authentication tag validation failed (tampered data)")
        except Exception as e:
            logger.error(f"Error decrypting audio: {str(e)}")
            raise ValueError(f"Decryption failed: {str(e)}")

    def encrypt_response(self, plaintext: str, key: bytes) -> dict:
        try:
            iv = os.urandom(12)
            aesgcm = AESGCM(key)
            encrypted = aesgcm.encrypt(iv, plaintext.encode("utf-8"), None)
            
            return {
                "encrypted_text": base64.b64encode(encrypted).decode("utf-8"),
                "iv": base64.b64encode(iv).decode("utf-8")
            }
        except Exception as e:
            logger.error(f"Error encrypting response: {str(e)}")
            raise ValueError("Encryption failed")

crypto_service = CryptoService()
