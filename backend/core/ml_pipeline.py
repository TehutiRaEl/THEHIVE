"""
ML Pipeline — Sovereign Hive v12.0
Unified interface for local ML tasks: speech-to-text (Whisper), image generation
(Stable Diffusion), and general NLP (HuggingFace Transformers).
Patterns from: Transformers pipeline(), faster-whisper, diffusers.

All models are optional — the pipeline gracefully skips missing deps.
On Oracle Cloud Always Free (4 ARM cores, 24GB RAM):
  - Whisper tiny/base runs on CPU in ~1-3s per 30s of audio
  - SD 1.5 fp16 needs ~4GB RAM; skip on machines without GPU
  - Transformers classification/summarization runs CPU-only fine
"""

import asyncio
import io
import logging
import os
import time
from typing import Any, Dict, Optional

logger = logging.getLogger("jasper.ml")

# ── Lazy model cache ───────────────────────────────────────────
_models: Dict[str, Any] = {}


def _get_model(key: str):
    return _models.get(key)


def _set_model(key: str, model: Any):
    _models[key] = model


# ── Whisper (speech-to-text) ───────────────────────────────────

def _load_whisper(model_size: str = "base"):
    cached = _get_model(f"whisper:{model_size}")
    if cached:
        return cached
    try:
        # Prefer faster-whisper (CTranslate2 backend, 4x faster on CPU)
        from faster_whisper import WhisperModel
        m = WhisperModel(model_size, device="cpu", compute_type="int8")
        _set_model(f"whisper:{model_size}", m)
        logger.info(f"Loaded faster-whisper:{model_size}")
        return m
    except ImportError:
        pass
    try:
        import whisper
        m = whisper.load_model(model_size)
        _set_model(f"whisper:{model_size}", ("openai", m))
        logger.info(f"Loaded openai-whisper:{model_size}")
        return ("openai", m)
    except ImportError:
        return None


async def transcribe(audio_bytes: bytes, model_size: str = "base", language: Optional[str] = None) -> Dict:
    """
    Transcribe audio bytes → text.
    Supports WAV, MP3, M4A, OGG. Returns {text, language, duration_s, segments}.
    """
    def _run():
        t0 = time.monotonic()
        model = _load_whisper(model_size)
        if model is None:
            return {"error": "Whisper not installed. Run: pip install faster-whisper"}

        # Write bytes to a temp file (whisper needs file path or numpy array)
        import tempfile
        suffix = ".wav"
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as f:
            f.write(audio_bytes)
            tmp_path = f.name

        try:
            if isinstance(model, tuple) and model[0] == "openai":
                import whisper as ow
                result = model[1].transcribe(tmp_path, language=language)
                text = result["text"].strip()
                lang = result.get("language", "unknown")
                segs = [{"start": s["start"], "end": s["end"], "text": s["text"]} for s in result.get("segments", [])]
            else:
                # faster-whisper
                kwargs = {"language": language} if language else {}
                segments, info = model.transcribe(tmp_path, **kwargs)
                segs = [{"start": s.start, "end": s.end, "text": s.text} for s in segments]
                text = " ".join(s["text"] for s in segs).strip()
                lang = info.language
        finally:
            os.unlink(tmp_path)

        elapsed = round(time.monotonic() - t0, 2)
        return {"text": text, "language": lang, "duration_s": elapsed, "segments": segs}

    return await asyncio.get_event_loop().run_in_executor(None, _run)


# ── Stable Diffusion (text-to-image) ──────────────────────────

def _load_sd(model_id: str = "runwayml/stable-diffusion-v1-5"):
    cached = _get_model(f"sd:{model_id}")
    if cached:
        return cached
    try:
        import torch
        from diffusers import StableDiffusionPipeline
        device = "cuda" if torch.cuda.is_available() else "cpu"
        dtype = torch.float16 if device == "cuda" else torch.float32
        pipe = StableDiffusionPipeline.from_pretrained(model_id, torch_dtype=dtype)
        pipe = pipe.to(device)
        if device == "cpu":
            pipe.enable_attention_slicing()
        _set_model(f"sd:{model_id}", pipe)
        logger.info(f"Loaded SD pipeline: {model_id} on {device}")
        return pipe
    except ImportError:
        return None
    except Exception as e:
        logger.warning(f"Failed to load SD model {model_id}: {e}")
        return None


async def generate_image(
    prompt: str,
    negative_prompt: str = "blurry, low quality",
    steps: int = 20,
    width: int = 512,
    height: int = 512,
    model_id: str = "runwayml/stable-diffusion-v1-5",
) -> Dict:
    """
    Generate an image from a text prompt.
    Returns {image_b64: str, width, height, steps, model} or {error: str}.
    """
    def _run():
        import base64
        t0 = time.monotonic()
        pipe = _load_sd(model_id)
        if pipe is None:
            return {"error": "diffusers not installed or model unavailable. Run: pip install diffusers accelerate"}
        try:
            result = pipe(
                prompt,
                negative_prompt=negative_prompt,
                num_inference_steps=steps,
                width=width,
                height=height,
            )
            img = result.images[0]
            buf = io.BytesIO()
            img.save(buf, format="PNG")
            b64 = base64.b64encode(buf.getvalue()).decode()
            elapsed = round(time.monotonic() - t0, 2)
            return {
                "image_b64": b64,
                "width": width,
                "height": height,
                "steps": steps,
                "model": model_id,
                "duration_s": elapsed,
            }
        except Exception as e:
            return {"error": str(e)}

    return await asyncio.get_event_loop().run_in_executor(None, _run)


# ── HuggingFace Transformers (general NLP) ─────────────────────

def _hf_pipeline(task: str, model: Optional[str] = None):
    key = f"hf:{task}:{model or 'default'}"
    cached = _get_model(key)
    if cached:
        return cached
    try:
        from transformers import pipeline as hf_pipe
        kwargs = {"model": model} if model else {}
        p = hf_pipe(task, **kwargs)
        _set_model(key, p)
        logger.info(f"Loaded HF pipeline: {task} / {model or 'default'}")
        return p
    except ImportError:
        return None
    except Exception as e:
        logger.warning(f"Failed to load HF pipeline {task}: {e}")
        return None


async def classify(text: str, labels: list, model: Optional[str] = None) -> Dict:
    """Zero-shot text classification."""
    def _run():
        pipe = _hf_pipeline("zero-shot-classification", model or "facebook/bart-large-mnli")
        if pipe is None:
            return {"error": "transformers not installed"}
        result = pipe(text, candidate_labels=labels)
        return {"label": result["labels"][0], "score": result["scores"][0], "all": dict(zip(result["labels"], result["scores"]))}
    return await asyncio.get_event_loop().run_in_executor(None, _run)


async def summarize(text: str, max_length: int = 150, model: Optional[str] = None) -> Dict:
    """Summarize text."""
    def _run():
        pipe = _hf_pipeline("summarization", model)
        if pipe is None:
            return {"error": "transformers not installed"}
        result = pipe(text[:3000], max_length=max_length, min_length=30, do_sample=False)
        return {"summary": result[0]["summary_text"]}
    return await asyncio.get_event_loop().run_in_executor(None, _run)


async def embed(texts: list, model: Optional[str] = None) -> Dict:
    """Generate sentence embeddings."""
    def _run():
        try:
            from sentence_transformers import SentenceTransformer
            key = f"st:{model or 'all-MiniLM-L6-v2'}"
            m = _get_model(key)
            if m is None:
                m = SentenceTransformer(model or "all-MiniLM-L6-v2")
                _set_model(key, m)
            vecs = m.encode(texts).tolist()
            return {"embeddings": vecs, "model": model or "all-MiniLM-L6-v2", "dim": len(vecs[0]) if vecs else 0}
        except ImportError:
            return {"error": "sentence-transformers not installed"}
    return await asyncio.get_event_loop().run_in_executor(None, _run)


# ── Status check ───────────────────────────────────────────────

async def pipeline_status() -> Dict:
    """Report which ML pipelines are available."""
    status = {}

    # Whisper
    for lib in ["faster_whisper", "whisper"]:
        try:
            __import__(lib.replace("_", "-") if lib == "faster_whisper" else lib)
            status["whisper"] = {"available": True, "backend": lib}
            break
        except ImportError:
            status["whisper"] = {"available": False, "install": "pip install faster-whisper"}

    # Diffusers
    try:
        import diffusers  # noqa: F401
        status["stable_diffusion"] = {"available": True}
    except ImportError:
        status["stable_diffusion"] = {"available": False, "install": "pip install diffusers accelerate"}

    # Transformers
    try:
        import transformers  # noqa: F401
        status["transformers"] = {"available": True}
    except ImportError:
        status["transformers"] = {"available": False, "install": "pip install transformers"}

    # Sentence transformers
    try:
        import sentence_transformers  # noqa: F401
        status["sentence_transformers"] = {"available": True}
    except ImportError:
        status["sentence_transformers"] = {"available": False, "install": "pip install sentence-transformers"}

    # Loaded model cache
    status["loaded_models"] = list(_models.keys())
    return status
