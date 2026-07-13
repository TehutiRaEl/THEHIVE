Query the HDC neocortex for concepts nearest to a given query — associative firing through the grey matter.

Usage: /brain-query <concept> [top_k=10]

Steps:
1. Query via API (if backend running):
   ```bash
   curl -s "http://localhost:8080/v11/brain/query?q=SOUL&top_k=10"
   ```

2. Or directly in Python:
   ```python
   from backend.core.hdc import hdc
   vec = hdc.get("$ARGUMENTS")
   nearest = hdc.closest(vec, top_k=10)
   for concept, sim in nearest:
       print(f"{sim:.3f}  {concept}")
   ```

3. Cross-reference the top results against `memory/_graph.json` to show which nearest concepts
   also have explicit graph edges (confirmed relationships vs HDC-inferred ones):
   ```python
   import json
   g = json.load(open("memory/_graph.json"))
   graph_nodes = {n["id"] for n in g["nodes"]}
   # mark which HDC-nearest also appear in graph
   ```

4. Display results as a ranked list:
   ```
   HDC Query: SOUL (top 10)
   
   0.412  TOKEN          [in graph]
   0.381  WEALTH         [in graph]
   0.354  ARENA
   0.341  CONSTITUTION   [in graph]
   ...
   ```

The HDC neocortex has ~150 pre-built concepts. Any concept not in the lexicon is auto-encoded
via `hdc.get()` using a deterministic seed from the concept name string hash.
