Capture a new concept or event into the Sovereign Hive memory vault and HDC lexicon.

Usage: /remember <concept> [description]

Steps:
1. If the backend is running, encode the concept via the API:
   ```bash
   curl -s -X POST "http://localhost:8080/v11/brain/remember" \
     -H "Content-Type: application/json" \
     -d "{\"concept\": \"$ARGUMENTS\", \"description\": \"\"}"
   ```

2. Append to `memory/_index.md` (create if absent):
   ```markdown
   ## <CONCEPT>
   
   Added: <date>
   Description: <description if provided>
   
   Related: [[<nearest HDC concept>]]
   ```

3. If description is substantive (>20 words), create a dedicated note in the appropriate memory subfolder:
   - Architectural concepts → `memory/backend/<concept>.md`
   - Colony events → `memory/colonies/<concept>.md`
   - Philosophy/vision → `memory/philosophy/<concept>.md`
   - Planning items → `memory/planning/<concept>.md`

4. Report what was added and the nearest HDC concepts.

The HDC lexicon grows in-process only (not persisted to disk between restarts). The memory vault Markdown files persist permanently via git.
