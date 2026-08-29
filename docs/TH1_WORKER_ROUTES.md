# TH-1 Worker routes (apply to `worker/src/index.js`)

## 1. In `ensureTables` batch, add CREATE for `townhall_items`
Use DDL from `worker/schema/townhall.sql` (same columns).

## 2. Routes (after `/updates` block is fine)

### GET `/v11/townhall`
- `pageParams` limit default 50 max 200
- Optional filters: `status`, `kind`, `specialty` (preferred_specialty)
- `ORDER BY signal_score DESC, id DESC`
- Return `{ items, limit, offset }`
- Ensure tables first: `await ensureTables(DB)`

### POST `/v11/townhall`
- `tokenOk` + rate limit
- Required: `title`; optional body fields from schema
- `author_agent` default `Kai El`
- `kind` default `plan`
- If `risk_tier===high` set `requires_founder=1`
- `priority` clamp 0–100; `signal_score = priority + pressure`
- INSERT; return `{ ok: true, id }`

### Claim/assign
Stub 501 with message pointing to A-1 until A-1 ships, or implement minimal claim setting `claimed_by` + status `claimed`.

## 3. `/debug/endpoints` list
Add `GET /townhall`, `POST /townhall`.

## 4. Safety
No approve/merge/spend. No FOUNDER_KEY bypass.
