Verify a branch is safe to merge: check CI, run imports, test key endpoints, confirm no regressions.

Usage: /merge-verify [branch_name]

Defaults to current branch if no branch specified.

Steps:
1. Check git status — no uncommitted changes:
   ```bash
   git status && git log --oneline origin/main..HEAD
   ```

2. Verify Python imports — core modules must load without error:
   ```bash
   cd /home/user/THEHIVE
   python3 -c "
   from backend.core.config import settings
   from backend.core.hdc import hdc
   from backend.core.protocol import protocol
   from backend.core.wealth import wealth
   from backend.core.genesis import gap_detector, mission_generator
   from backend.core.validator import validator
   print('All core imports OK')
   print(f'CORS origins: {settings.cors_origins}')
   print(f'HDC concepts: {hdc.concept_count()}')
   "
   ```

3. Run existing unit tests:
   ```bash
   cd /home/user/THEHIVE && python3 -m pytest tests/unit/ -q --tb=short 2>&1 | tail -20
   ```

4. Check no endpoint drift — verify key routes exist in routes.py:
   ```bash
   grep -E "^@router\.(get|post|put|patch|delete)" backend/api/routes.py | grep -E "/brain/|/agents|/llm/status|/dream/status|/constitution/history" 
   ```

5. Confirm CLAUDE.md nav docs are present:
   ```bash
   for f in CLAUDE.md memory/CLAUDE.md backend/CLAUDE.md backend/core/CLAUDE.md .queen/CLAUDE.md; do
     [ -f "$f" ] && echo "✅ $f" || echo "❌ MISSING: $f"
   done
   ```

6. Check branch is up to date with main:
   ```bash
   git fetch origin main && git log --oneline origin/main..HEAD | wc -l
   # ideally 0 commits behind (or rebased)
   ```

7. Report: PASS / FAIL with specifics on any failures.

This command replaces the skill `skill-merge-order-and-regression-verify.md` from the 
Founders Visionary Folder. Run before creating a PR or before merging to main.
