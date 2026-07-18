---
name: founder-directive-capture
description: Use whenever the founder gives a substantive directive, vision statement, or constitutional/policy instruction — not a routine bug report or small tweak, but something shaping the hive's direction, economics, or governance. Preserves the founder's own words verbatim (unredacted, uncensored, unabridged, untruncated) into Project_file/Founders Visonary Folder/HIVE_UPDATES/, as the primary-source record distinct from session-harvest's distilled summaries.
---

# founder-directive-capture — the founder's own words, preserved exactly

The founder's explicit, standing instruction (given 2026-07-18, repeated across sessions):
*"all that I've added recently into this session and last sessions needs to be fully updated
in the founders visionary folder in the repo for all updates, which needs to be a skill for
any time I update you... all needs to go unredacted uncensored unabridged and untruncated into
the updates folder directory."*

This is the standing process that fulfills it.

## The distinction from session-harvest

`session-harvest` (a separate, existing skill) writes **Claude's own distilled account** of a
session's work — what was built, decided, root-caused. It summarizes and interprets.

`founder-directive-capture` writes **the founder's own words**, exactly as given — no
summarizing, no paraphrasing, no trimming for length. Where session-harvest is the hive's
memory of *what it did*, this is the hive's memory of *what it was told*. Both matter; neither
replaces the other. A single session can produce both a session-harvest entry and one or more
founder-directive-capture entries.

## When to run it

Trigger on a founder message that does any of the following — not on routine requests:
- Gives a vision statement, a business/economic directive, or a new capability to build
- Instructs a constitutional or governance change (a new article, a policy, an allocation rule)
- Describes multiple inventions, plans, or ideas meant to become part of the hive's permanent
  record
- Explicitly asks for this capture ("put this in the updates folder," "unredacted," etc.)

Do **not** trigger on: a bug report, a one-line tweak request, a status question, routine
back-and-forth clarification. Judgment applies — this is for the messages that are themselves
part of the hive's history, not every message in a conversation.

## The process

1. **Locate the exact founder message(s)** in the current conversation — the literal text, as
   typed, including run-ons, typos, and informal phrasing. Do not clean it up.
2. **Write a new dated file** in
   `Project_file/Founders Visonary Folder/HIVE_UPDATES/YYYY-MM-DD-directive-<short-slug>-NNN.md`
   (same naming convention as the rest of `HIVE_UPDATES/`).
3. **File contents:**
   - A one-line header: date, and which conversation/session this came from.
   - The founder's message(s), verbatim, in a blockquote or fenced block, exactly as given —
     unredacted, uncensored, unabridged, untruncated. If multiple messages together form one
     directive, include all of them in order.
   - A short, separate "Response" section *below* the verbatim text — what was actually built
     or decided in reply, so the record shows both the instruction and the outcome side by
     side. This section may summarize; the directive text above it never does.
4. **Never edit the verbatim section on a later pass.** If a directive is superseded later,
   that goes in a new dated file, not a rewrite of the old one — the record is append-only,
   same as the rest of `HIVE_UPDATES/`.
5. **Ownership/license gate still applies** (same as `session-harvest`): this only ever
   captures the founder's own words, handed to the hive directly in conversation. It is not a
   license to copy third-party text found elsewhere.

## Honest limitation

This skill can only capture verbatim what is actually present in the current conversation's
context. It cannot retroactively reconstruct a *prior* session's exact wording if that
session's raw transcript is no longer available to the running session — only what's in front
of it right now. Where a prior session's content has already been distilled (not preserved
verbatim) before this skill existed, say so plainly rather than presenting a paraphrase as if
it were the original text.

*Origin: founder directive, 2026-07-18, given in THEHIVE — formalized the same session it was
requested, per the founder's own instruction that this become a standing skill, not a one-off.*
