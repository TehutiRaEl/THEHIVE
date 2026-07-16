Regenerate all per-folder CLAUDE.md navigation documents and rebuild the memory vault graph.

Usage: /update-nav

This command runs the memory-librarian agent to refresh all nav docs.

Steps:
1. Run the vault generator:
   ```bash
   cd /home/user/THEHIVE && python3 scripts/generate_memory_vault.py
   ```

2. Check the graph was rebuilt:
   ```bash
   python3 -c "
   import json
   g = json.load(open('memory/_graph.json'))
   print(f'Graph: {len(g[\"nodes\"])} nodes, {len(g[\"edges\"])} edges')
   "
   ```

3. Report stale nav docs — check modification times of folder CLAUDE.md files vs their
   containing directories. Flag any that are more than 7 days older than their contents.

4. List the 9 nav doc paths and confirm each exists:
   - `CLAUDE.md` (root)
   - `memory/CLAUDE.md`
   - `memory/planning/CLAUDE.md`
   - `memory/colonies/CLAUDE.md`
   - `memory/guilds/CLAUDE.md`
   - `backend/CLAUDE.md`
   - `backend/core/CLAUDE.md`
   - `Project_file/CLAUDE.md`
   - `.queen/CLAUDE.md`

5. Commit the graph update if nodes changed:
   ```bash
   git add memory/_graph.json memory/
   git diff --cached --quiet || git commit -m "[ROLE: Memory Architect] chore(memory): refresh vault graph and nav docs"
   ```

Run this after any significant backend refactoring or when starting a new session after a
gap of more than a few days.
