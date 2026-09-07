from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import logging
from contextlib import asynccontextmanager

load_dotenv()

# Logging config - NEVER log transcript or audio
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.services.indicwhisper_service import indicwhisper_service
    from app.services.crypto_service import crypto_service
    indicwhisper_service.load_model()
    crypto_service.initialize()
    yield

app = FastAPI(title="Mindora Voice API", version="1.0.0", lifespan=lifespan)

@app.exception_handler(RequestValidationError)
async def validation_error_handler(_: Request, __: RequestValidationError):
    # Never echo invalid voice payloads back in an error response.
    return JSONResponse(status_code=400, content={"detail": "Invalid voice request"})

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:8443").split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)

from app.routes.speech import router as speech_router
app.include_router(speech_router)
