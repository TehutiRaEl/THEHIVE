# Contributing to the Sovereign Hive

## Adding a New Module

1. Create a new directory under `src/` or in the root
2. Add `__init__.py`
3. Write your module
4. Add tests in `tests/`
5. Update `requirements.txt` if needed
6. Update `README.md`
7. Submit a pull request

## Adding a New Guild

1. Create a new file in `backend/guilds/`
2. Inherit from the base Guild class
3. Implement required methods
4. Register in `backend/main.py`

## Code Style

- Use Python type hints
- Write docstrings for all public functions
- Follow PEP 8
- Use `black` and `ruff` for formatting

## Testing

- All new code should include unit tests
- Integration tests for API endpoints
- Run `pytest tests/` before submitting
