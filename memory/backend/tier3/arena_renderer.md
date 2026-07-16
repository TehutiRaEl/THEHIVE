# tier3/arena_renderer

ARENA RENDERER — Sovereign Hive v11.0 Tier 3

## Classes

- `ColonyState` — 3D voxel grid representing a colony's state.
- `ArenaProjectionEngine` — Runs dual-colony simulation for an arena challenge.
- `FrameCompressor` — Compress arena frames for efficient WebSocket transmission.

## Functions

- `step()` — One simulation tick: resource growth + agent movement.
- `to_voxels()` — Export non-empty voxels as list of {x,y,z,r,g,b,a,channel}.
- `delta()` — Compute voxel delta vs previous frame for efficient streaming.
- `get_projection_history()`
- `get_frames()` — Persisted compact frames ({t,m,da,db,dv}) ordered by tick, for replay.
- `clear_frames()`
- `compress()` — Pack frame to compact JSON bytes.
- `decompress()`

## Links

[[core.config]]
