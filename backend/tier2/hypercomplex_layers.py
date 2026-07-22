"""
Thin re-export shim (2026-07-22): the real hypercomplex_layers now lives in
4DBRAIN's tesseract_math package — see backend/tier2/tesseract_core.py's
docstring for why. Requires the `4dbrain-tesseract` git dependency in
requirements.txt.
"""
from tesseract_math.hypercomplex_layers import (  # noqa: F401
    QuaternionOps,
    QuaternionLinear,
    CliffordAlgebra,
    HyperComplexRNN,
    DualNumber,
    GuildEncoder,
    get_guild_encoder,
    task_priority_sensitivity,
)
