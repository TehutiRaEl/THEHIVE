# Voice of the Hive

This directory is Kai's window into the founder.

## Purpose

Kai cannot read the founder's entire directory on every turn — it is too large,
too slow, and too expensive. But Kai cannot work *alongside* the founder without
knowing the founder's voice, mission, values, and constraints.

This directory solves that. It is a **live compression** of the founder's
directory — a canonical file (`VOICE.md`) that carries everything Kai needs to
see on every turn, and nothing Kai does not.

## Structure

- **VOICE.md** — The canonical compressed voice. Read on every turn by Kai.
- **COMPRESSION_PROTOCOL.md** — Rules for what compresses, what stays, what must never be lost.
- **MANIFEST.md** — Auto-generated inventory of what exists in the founder's directory.
- **DELTA_LOG.md** — Chronological log of every compression event.

## The Three Rules

1. **VOICE.md is always read first.** Before anything else on every turn.
2. **VOICE.md is a cache, not a source.** The founder's directory is the source
   of truth. When they disagree, the directory wins and VOICE.md is refreshed.
3. **VOICE.md never drops a constraint.** Compression is allowed for illustrative
   text. Binding text — the No-Usurper clause, the proprietary firewall, the
   immutable laws — is preserved verbatim.

## How to Refresh

On any founder directory change (or on schedule), Kai re-reads the founder's
directory and rewrites VOICE.md per COMPRESSION_PROTOCOL.md. The refresh is
logged in DELTA_LOG.md.

## Path note

This lives under `Project_file/Founders Visonary Folder/` (repo canonical founder
folder). Worker loaders also accept R2 key `founder/voice-of-the-hive/VOICE.md`
when the file is mirrored to the FILES binding.
