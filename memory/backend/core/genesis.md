# core/genesis

Genesis — Generative Mechanism — Sovereign Hive

## Classes

- `MissionStatus`
- `Gap`
- `MissionTemplate`
- `GapDetector` — Scans the hive's map and episodic memory for under-explored areas.
- `MissionGenerator` — Generates mission templates from detected gaps (strategic layer — Nanuet).

## Functions

- `gap_severity()` — Classify gap severity from a gap dict or Gap object.
- `to_dict()`
- `to_dict()`
- `scan()` — Scan for gaps and return a list of detected Gap objects. Cached 60s.
- `generate()` — Generate a mission template for a detected gap.
- `receive_child_proposal()` — Accept a mission proposal from a child agent (emergent layer).
- `formalize()` — Nanuet formalizes a proposed mission — advances to 'formalized' state.
- `activate()` — Promote a formalized mission to active.
- `update_mission_status()` — Update mission status with an optional audit note.
- `get_active_missions()` — Return all active missions.
- `list_missions()`

## Links

[[core.db]] · [[core.protocol]]
