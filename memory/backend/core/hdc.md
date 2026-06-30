# core/hdc

Hyperdimensional Computing — Sovereign Hive v11.0

## Classes

- `HyperDimensionalComputing` — Vector Symbolic Architecture (VSA/HDC).

## Functions

- `make_base_vector()` — Generate a deterministic base vector from a name.
- `bundle()` — Superposition — represents SET of concepts.
- `bind()` — Element-wise product — represents RELATION between concepts.
- `unbind()` — Inverse bind (self-inverse for bipolar vectors).
- `permute()` — Rotation — encodes SEQUENCE position.
- `similarity()` — Cosine similarity ∈ [-1, 1].
- `encode_sequence()` — Position-aware sequence encoding: Σ permute(v_i, i).
- `encode_message()` — Encode `verb * obj (+ subject)` — the VSA sentence form.
- `closest()` — Return top-k closest concepts in lexicon.
- `get()` — Get vector for a concept (create if missing).
- `lexicon_summary()` — Get summary of lexicon.
- `add_concept()` — Add a new concept to the lexicon with optional metadata.
- `remove_concept()` — Remove a concept from the lexicon.
- `bind_sequence()` — Bind multiple concepts together.
- `encode_role_filler()` — Encode a role-filler binding.
- `extract_filler()` — Extract filler from a role-filler binding.
- `compare_sequences()` — Compare two sequences by their HD vector encodings.
- `clean_up_memory()` — Find concepts with similarity above threshold.
- `serialize()` — Serialize the lexicon to JSON.
- `deserialize()` — Deserialize the lexicon from JSON.
