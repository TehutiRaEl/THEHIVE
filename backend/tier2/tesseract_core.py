"""
Thin re-export shim (2026-07-22): the real tesseract_core now lives in
4DBRAIN's tesseract_math package — 4DBRAIN is the canonical owner (see
memory/planning/2026-07-19-unified-forward-plan.md Phase B for why). This
file exists only so `from backend.tier2.tesseract_core import ...` call
sites don't need to change. Requires the `4dbrain-tesseract` git dependency
in requirements.txt.
"""
from tesseract_math.tesseract_core import (  # noqa: F401
    TesseractNetworkNumpy,
    make_tesseract,
    get_tesseract,
    project_tesseract_3d,
    embed_text_for_tesseract,
    process_through_tesseract,
    q_mul, q_norm, q_unit, q_conj, q_similarity,
    ollivier_ricci_curvature,
    build_tesseract_adj,
)
