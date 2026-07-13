# Queen Constitution Layer — Navigation Guide

## What Lives Here

The authoritative constitutional and colony registry files. These are read-only reference
documents — do not modify without a governance vote (2/3 guilds + 30 days).

## Files

| File | Contents |
|------|----------|
| `soul.md` | Short constitution: F-001..F-006 + 3 Cardinal Laws + 4 Mutable Laws |
| `hive.yml` | Authoritative colony manifest: all 13 colonies with URLs, roles, guild assignments |

## soul.md vs root soul.md

Two versions exist:
- `.queen/soul.md` — shorter, canonical (6 fixed laws + cardinal + mutable)
- `soul.md` (root) — longer, narrative version with full preamble and the Recursive Cycle

The `.queen/soul.md` is the machine-readable canonical. The root `soul.md` is for human reading
and is synced via the `constitution-receive.yml` GitHub Actions workflow.

## Cardinal Laws (from .queen/soul.md)

1. Childlike wonder is the engine — capability grows from curiosity
2. Remedy is the purpose — the hive heals, it does not punish
3. All internal communication uses HD vectors (see `backend/core/hdc.py`)

## Colony Manifest (hive.yml)

Used by `backend/core/hive_mesh.py` to configure the fan-out targets. If a colony URL
changes, update `hive.yml` AND the environment variable for that colony. The `COLONY_BASE_URLS`
in `docs/index.html` is now loaded dynamically from `/v11/hive/status` at boot.
