# 2026-07-18 — Constitution synced to the UI, chat overlay fixed, a confabulation caught

**Summary:** You asked me to sync your constitution update into the UI and pointed out the
commune chat box was floating over content it shouldn't. Both done (PR #114) — and tracing
down where your update actually landed turned up a real bug: the live chat had been
inventing specific facts when it couldn't back them up.

## Did

- Traced your constitution edit to where it actually landed — `docs/GOVERNANCE.md`
  (your commit `10166cc`), not `soul.md`. Cleaned the leftover LLM wrapper text and broken
  code fences your paste brought in with it; your actual content untouched.
- Built a real Constitution panel in Kai EL OS (📜 nav entry) that fetches and renders the
  live `docs/GOVERNANCE.md` — so this and every future edit shows up in the UI automatically,
  which wasn't true before (GOVERN only ever showed the governance-log event stream).
- Found why the chat gave you a confident-sounding but fabricated answer to "did you get my
  constitution update?" — it had zero access to the real constitution text, so it improvised
  "F-006A is at 92.4" and fake timestamps. Checked the repo: that number doesn't exist
  anywhere. Fixed at the root — the chat now reads the real, current article list before
  answering and is told to say "I don't have that" instead of inventing a number.
- Fixed the chat box itself: it was a permanent floating box with no way to close it, used
  in all 13 of the older tabs, which is why it sat over the Arena's challenge list in your
  screenshots. Minimized by default everywhere now, opens on click.
- Reviewed the full "Commercial Hive" blueprint you pasted and wrote an honest intake
  (`VISION/2026-07-18-vision-commercial-hive-blueprint-intake-001.md`): the app-factory/
  copywriting/dropshipping ideas are catalogued for later, gated the same way as the rest
  of Commerce Under Law. Declined to build the "fully encrypted, untraceable even from the
  Hive's own operators" payout scheme — that's concealment infrastructure regardless of
  framing, not a payments feature, and conflicts with explainability and the existing rule
  that real money moves visibly to your own named accounts.

## Needs

- Nothing blocking. If you want any piece of the commercial-hive blueprint actually built,
  say which one — the intake doc suggests starting with copywriting since it's fully
  offline-capable and lowest-risk.
- Worth a look when you have time: three different "constitution" files now exist in the
  repo (`soul.md`, `.queen/soul.md`, `docs/GOVERNANCE.md`) with different article numbering.
  `docs/GOVERNANCE.md` is what the UI now shows live; `soul.md` is still what `CLAUDE.md`
  calls canonical. Not reconciled this pass — flagging so it isn't silently forgotten.

## Learned

- "Did you get my update?" is exactly the kind of question a chat model will answer
  confidently even when it has nothing to go on — the fix wasn't telling it to be more
  careful, it was giving it the actual data so confidence and correctness point the same
  way. A model told to "never invent metrics" will still invent them if that's the only way
  it can produce an answer at all; grounding beats instruction here.
- Session-harvest note: this entry covers this session's own verified work (PR #114) —
  the UI panel, the chat grounding fix, the overlay fix, and the intake document I wrote.
  `docs/GOVERNANCE.md`'s content itself is your own edit (commit `10166cc`), not claimed as
  mine — only the cleanup and the UI wiring around it are.
