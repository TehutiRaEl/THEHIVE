"""Helper utilities."""
import json
from typing import Any


def safe_json_loads(s: str, default: Any = None) -> Any:
    try:
        return json.loads(s)
    except (json.JSONDecodeError, TypeError):
        return default


def truncate_string(s: str, max_length: int = 100) -> str:
    if len(s) <= max_length:
        return s
    return s[:max_length] + "..."
