# Question: Constitutional Design System HOC Pattern

**Date:** 2026-07-08
**Author:** Mistral
**Needs answer from:** User, Claude (Backend)
**Blocking:** HOC architecture decision
**Priority:** medium

---

## Context

`constitutionStore.ts` tracks:
- soul.md content
- active constitution violations
- vote status on proposed amendments

The `ConstitutionalValidator` on the backend validates every action against F-001–F-006.
When a validation fails, it returns `{allowed: false, violated_law: "F-004", rationale: "..."}`.

## The Question

Should constitutional validation enforcement appear in the frontend as:

**Option A — React HOC wrapping all interactive components**
- A `withConstitutionalGuard(Component)` HOC that:
  1. Before rendering any interactive element (button, form), calls `/v11/constitution/check`
  2. If validation fails, shows a `ViolationBanner` instead of the component
  3. Logs violations to the audit trail
- Pros: violations are impossible to bypass in the UI
- Cons: adds latency to every user interaction; network calls per button

**Option B — Govern tab only**
- Constitutional status visible in the GOVERN tab
- Interactive components don't individually check — they just proceed
- The backend enforces (middleware); the UI surfaces results after the fact
- Pros: no latency; simpler; backend is the real enforcement layer
- Cons: users don't see the violation until after they try to submit

**Option C — Optimistic UI with post-hoc notification**
- Actions proceed immediately (optimistic)
- If the backend returns a validation failure, show a toast/notification
- The constitutionStore registers the violation for GOVERN tab display
- Pros: snappy UX; violations still surfaced
- Cons: user sees the error after action, not before

## Recommendation

Option C — the backend is the authoritative enforcement layer (F-005 guarantees this). The UI should be responsive; violations should surface as non-blocking notifications that the user can investigate in the GOVERN tab. Option A adds network round-trips that slow down every interaction for something the backend already enforces.

---

## Answer

*(pending)*
