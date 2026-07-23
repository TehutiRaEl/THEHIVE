"""
Thin re-export shim (2026-07-22): the real dream_engine now lives in
4DBRAIN's tesseract_math package — see backend/tier2/tesseract_core.py's
docstring for why. Requires the `4dbrain-tesseract` git dependency in
requirements.txt.
"""
from tesseract_math.dream_engine import (  # noqa: F401
    DreamEngine,
    get_dream_engine,
    DreamPrimitive,
    WakePhase,
    SleepPhase,
    ProbabilisticDreamer,
    FrequencyBroadcast,
    DR_AXIOMS,
    DREAM_PRIMITIVES,
    get_acu_insights,
)
