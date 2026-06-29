"""
ML API — Sovereign Hive v12.0
Endpoints for speech-to-text (Whisper), image generation (Stable Diffusion),
text classification, summarization, and embeddings (HuggingFace Transformers).
"""

import logging
from typing import List, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field

logger = logging.getLogger("jasper.ml_api")

router = APIRouter(prefix="/v11", tags=["ml"])


# ── /v11/voice/transcribe ──────────────────────────────────────

@router.post("/voice/transcribe")
async def voice_transcribe(
    audio: UploadFile = File(..., description="Audio file (WAV, MP3, M4A, OGG)"),
    model_size: str = Form("base", description="Whisper model: tiny, base, small, medium, large"),
    language: Optional[str] = Form(None, description="Force language (e.g. 'en', 'zh'). Auto-detect if omitted."),
):
    """
    Transcribe audio to text using Whisper.
    Returns full transcript, detected language, and segment timestamps.
    """
    from backend.core.ml_pipeline import transcribe
    audio_bytes = await audio.read()
    if len(audio_bytes) > 50 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Audio file too large (max 50MB)")
    result = await transcribe(audio_bytes, model_size=model_size, language=language)
    if "error" in result:
        raise HTTPException(status_code=503, detail=result["error"])
    return result


# ── /v11/image/generate ────────────────────────────────────────

class ImageGenRequest(BaseModel):
    prompt: str = Field(..., min_length=2, description="Text prompt for image generation")
    negative_prompt: str = "blurry, low quality, distorted"
    steps: int = Field(20, ge=5, le=50)
    width: int = Field(512, ge=256, le=1024)
    height: int = Field(512, ge=256, le=1024)
    model_id: str = "runwayml/stable-diffusion-v1-5"


@router.post("/image/generate")
async def image_generate(req: ImageGenRequest):
    """
    Generate an image from a text prompt using Stable Diffusion.
    Returns base64-encoded PNG. First call downloads the model (~4GB).
    """
    from backend.core.ml_pipeline import generate_image
    result = await generate_image(
        prompt=req.prompt,
        negative_prompt=req.negative_prompt,
        steps=req.steps,
        width=req.width,
        height=req.height,
        model_id=req.model_id,
    )
    if "error" in result:
        raise HTTPException(status_code=503, detail=result["error"])
    return result


# ── /v11/ml/classify ──────────────────────────────────────────

class ClassifyRequest(BaseModel):
    text: str
    labels: List[str] = Field(..., min_items=2)
    model: Optional[str] = None


@router.post("/ml/classify")
async def ml_classify(req: ClassifyRequest):
    """Zero-shot text classification using HuggingFace Transformers."""
    from backend.core.ml_pipeline import classify
    result = await classify(req.text, req.labels, req.model)
    if "error" in result:
        raise HTTPException(status_code=503, detail=result["error"])
    return result


# ── /v11/ml/summarize ─────────────────────────────────────────

class SummarizeRequest(BaseModel):
    text: str = Field(..., min_length=50)
    max_length: int = Field(150, ge=30, le=500)
    model: Optional[str] = None


@router.post("/ml/summarize")
async def ml_summarize(req: SummarizeRequest):
    """Summarize text using HuggingFace Transformers."""
    from backend.core.ml_pipeline import summarize
    result = await summarize(req.text, req.max_length, req.model)
    if "error" in result:
        raise HTTPException(status_code=503, detail=result["error"])
    return result


# ── /v11/ml/embed ─────────────────────────────────────────────

class EmbedRequest(BaseModel):
    texts: List[str] = Field(..., min_items=1, max_items=100)
    model: Optional[str] = None


@router.post("/ml/embed")
async def ml_embed(req: EmbedRequest):
    """Generate sentence embeddings using sentence-transformers."""
    from backend.core.ml_pipeline import embed
    result = await embed(req.texts, req.model)
    if "error" in result:
        raise HTTPException(status_code=503, detail=result["error"])
    return result


# ── /v11/ml/status ────────────────────────────────────────────

@router.get("/ml/status")
async def ml_status():
    """Report which ML pipelines are available on this node."""
    from backend.core.ml_pipeline import pipeline_status
    return await pipeline_status()
