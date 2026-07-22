"""
Thin re-export shim (2026-07-22): the real argnn now lives in 4DBRAIN's
tesseract_math package — see backend/tier2/tesseract_core.py's docstring
for why. Requires the `4dbrain-tesseract` git dependency in requirements.txt.
"""
from tesseract_math.argnn import (  # noqa: F401
    RiemannianNode,
    GeodesicAttention,
    ARGNNLayer,
    ColonyDensityGraph,
    FrequencyResonanceMatcher,
    get_matcher,
    match_task_to_agents,
)
