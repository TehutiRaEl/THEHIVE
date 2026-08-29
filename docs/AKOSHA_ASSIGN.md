# A-1 — Akosha assign / claim by specialty

> Status: protocol 2026-08-29. Enforce after TH-1 routes live.

## Rules
- Akosha **assigns** work on TownHall items matched to agent specialties (`preferred_specialty` / `specialty_tags`).
- Specialists may **claim** open items whose specialty matches their duty (Horus=health, Ma'at=balance, Solomon=wisdom, Sekhmet=arena, Thoth=drift, Ptah=architecture, Kai=synthesis, Akosha=coordination).
- Assignment sets `assigned_by`, `claimed_by`, `status=claimed|in_progress`, reduces `pressure`/`signal_score`.
- Never assigns money/constitution/external-exec without `requires_founder=1` stop.

## API (planned)
- `POST /v11/townhall/:id/assign` — Akosha or founder
- `POST /v11/townhall/:id/claim` — specialist if specialty matches
