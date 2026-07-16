Create an HDC bind() association between two named concepts — wires a new synapse in the neocortex.

Usage: /link-nodes <concept_a> <concept_b>

Steps:
1. Create the association via the API (if backend running):
   ```bash
   curl -s -X POST "http://localhost:8080/v11/brain/associate" \
     -H "Content-Type: application/json" \
     -d "{\"concept_a\": \"CONCEPT_A\", \"concept_b\": \"CONCEPT_B\"}"
   ```
   The response shows the similarity of the bound vector to each parent.

2. Or directly in Python:
   ```python
   from backend.core.hdc import hdc
   va = hdc.get("CONCEPT_A")
   vb = hdc.get("CONCEPT_B")
   bound = hdc.bind(va, vb)
   key = "CONCEPT_A:CONCEPT_B"
   hdc.lexicon[key] = bound
   print(f"Association '{key}' created")
   ```

3. Add a wiki-link in the memory vault — append to both concept notes if they exist:
   ```markdown
   Related: [[CONCEPT_B]]
   ```

4. Report the association key and similarity values.

Note: HDC bind() in `backend/core/hdc.py` uses XOR on bipolar vectors — the bound vector is
equidistant from both parents. This is how the neocortex wires "DREAM + ARENA = combat-vision".
Bindings persist in-process only; the wiki-links in memory/ persist to disk.
