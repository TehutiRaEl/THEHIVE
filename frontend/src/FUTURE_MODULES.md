# Future modules (not in production build)

**Status:** FUTURE — labeled 2026-07-29 by founder decision (D2) via Grok PR #132.

These trees exist for later expansion. They are **excluded** from `tsconfig.build.json` and are **not** part of the shipped Kai EL OS surface today:

- `worlds/`
- `voxel/`
- `xp/`
- `avatars/`
- `conversation/`

**Rule:** Do not treat TypeScript errors here as blockers for production deploys.  
**Rule:** Integrate into the OS UI **only when** a concrete product need requires it, with real data or explicit “not live” labeling.  
**Rule:** Prefer thin slices over enabling the whole tree at once.

See also: `docs/WIP_VOXEL_WORLDS_STATUS.md`, `docs/GROK_FOUNDER_DECISIONS.md`.
