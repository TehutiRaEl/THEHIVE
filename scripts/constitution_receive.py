#!/usr/bin/env python3
"""Sync `.queen/soul.md` (canonical, machine-readable) into root `soul.md`
(human-readable) — the receiving half of the `constitution-receive.yml` workflow.

Why this exists (2026-08-18): `.queen/CLAUDE.md` documented this sync as the original
intended design from day one — `.queen/soul.md` canonical, root `soul.md` a synced
human-readable copy — but the workflow that was supposed to do it was never built.
Meanwhile a *different*, already-existing workflow (`constitution-sync.yml`) treats root
`soul.md` as canonical and pushes it OUT to colonies — the opposite direction. Both real,
both currently in the repo. This file only closes the gap the founder asked for
(.queen/soul.md -> root soul.md); it does not touch or resolve that other workflow. See
the PR body for the honest account of that overlap.

Direction is one-way and strict: `.queen/soul.md` is the source of truth going forward.
Root `soul.md` is *regenerated* from it, never the reverse. A malformed source (missing
required section, empty file, empty required list) must be REJECTED — root soul.md is left
byte-for-byte untouched and the process exits non-zero. This was a named requirement
because a buggy version of this exact workflow could otherwise propagate bad law straight
into the human-readable constitution.

Sections `.queen/soul.md` defines (Preamble, Fixed Laws, Cardinal Laws, Mutable Laws) are
fully regenerated in root's existing prose style. Sections that exist only in root today
(The Recursive Cycle, The 14-Layer Architecture, The Spore Planter, The End State, The Hive
in One Sentence) have no counterpart in the canonical source yet, so they are preserved
verbatim rather than silently deleted — regeneration replaces what the source actually
defines, it does not invent authority to delete what it doesn't.

Zero third-party dependencies — stdlib only (re, hashlib, sys, argparse), matching the
repo's stated zero-dependency philosophy for its own tooling (see automaton/).

Usage:
    python3 scripts/constitution_receive.py sync <queen_soul_path> <root_soul_path>
        Validates queen_soul_path; on success, regenerates root_soul_path in place and
        prints the new sha256 of queen_soul_path to stdout. On validation failure, root
        soul is left untouched and the process exits 1 with the error on stderr.

    python3 scripts/constitution_receive.py hash <path>
        Prints sha256 of the given file. Used by the workflow to fill hive.yml's
        soul_md_hash field after a successful sync.
"""
from __future__ import annotations

import hashlib
import re
import sys


class MalformedSoulError(ValueError):
    """Raised when `.queen/soul.md` fails validation — sync must not proceed."""


REQUIRED_SECTIONS = [
    "Preamble",
    "Fixed Laws",
    "Cardinal Laws",
    "Mutable Laws",
]

ROOT_TITLE = "# SOUL.MD — The Sovereign Constitution of Kai El"

# Root sections that are regenerated wholesale from the canonical source, in this order.
GENERATED_HEADINGS = {
    "preamble": "## Preamble",
    "fixed_laws": "## Fixed Laws (Immutable)",
    "cardinal_laws": "## Cardinal Laws (Non-Negotiable Spirit)",
    "mutable_laws": "## Mutable Laws (Amendable by 2/3 Guilds + 30 Days)",
}

# Root sections with no counterpart in .queen/soul.md today — preserved verbatim.
PRESERVED_HEADING_PREFIXES = (
    "## The Recursive Cycle",
    "## The 14-Layer Architecture",
    "## The Spore Planter",
    "## The End State",
    "## The Hive in One Sentence",
)


def sha256_of(path: str) -> str:
    with open(path, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()


def _split_sections(text: str) -> dict:
    """Split a soul.md-style document into {heading_text: body_text} by '## ' headings.
    Content before the first '## ' heading (title + anything else) is discarded here —
    callers only care about the '## '-level sections."""
    sections: dict[str, str] = {}
    # Find every "## Heading" line and slice the body up to the next "## " or EOF.
    matches = list(re.finditer(r"^##\s+(.+?)\s*$", text, flags=re.MULTILINE))
    for i, m in enumerate(matches):
        heading = m.group(1).strip()
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        sections[heading] = text[start:end].strip("\n")
    return sections


def _numbered_items(body: str) -> list[str]:
    """Extract '1. text' / '2. text' style list items from a section body."""
    items = []
    for line in body.splitlines():
        m = re.match(r"^\s*\d+\.\s+(.+?)\s*$", line)
        if m:
            items.append(m.group(1).strip())
    return items


def parse_queen_soul(text: str) -> dict:
    """Parse and VALIDATE `.queen/soul.md`. Raises MalformedSoulError on any problem.
    Returns a dict with keys: preamble (str), fixed_laws (list[str]),
    cardinal_laws (list[str]), mutable_laws (list[str])."""
    if not text or not text.strip():
        raise MalformedSoulError("source file is empty")

    sections = _split_sections(text)

    # Match required section names loosely (heading may carry a parenthetical suffix,
    # e.g. "Fixed Laws (Immutable)"), but every required section name must appear as a
    # prefix of some real heading found in the document.
    found_for: dict[str, str] = {}
    for required in REQUIRED_SECTIONS:
        match = next((h for h in sections if h.startswith(required)), None)
        if match is None:
            raise MalformedSoulError(f"missing required section: '{required}'")
        found_for[required] = match

    preamble = sections[found_for["Preamble"]].strip()
    if not preamble:
        raise MalformedSoulError("Preamble section is empty")

    fixed_laws = _numbered_items(sections[found_for["Fixed Laws"]])
    if not fixed_laws:
        raise MalformedSoulError("Fixed Laws section has no numbered items")

    cardinal_laws = _numbered_items(sections[found_for["Cardinal Laws"]])
    if not cardinal_laws:
        raise MalformedSoulError("Cardinal Laws section has no numbered items")

    mutable_laws = _numbered_items(sections[found_for["Mutable Laws"]])
    if not mutable_laws:
        raise MalformedSoulError("Mutable Laws section has no numbered items")

    return {
        "preamble": preamble,
        "fixed_laws": fixed_laws,
        "cardinal_laws": cardinal_laws,
        "mutable_laws": mutable_laws,
    }


def render_root_soul(parsed: dict, existing_root_text: str) -> str:
    """Build the new root soul.md text: regenerate the sections .queen/soul.md defines,
    preserve everything else that already exists in root and has no counterpart yet."""
    existing_sections = _split_sections(existing_root_text)

    parts = [ROOT_TITLE, ""]

    parts.append(GENERATED_HEADINGS["preamble"])
    parts.append(parsed["preamble"])
    parts.append("")

    parts.append(GENERATED_HEADINGS["fixed_laws"])
    for i, item in enumerate(parsed["fixed_laws"], start=1):
        parts.append(f"{i}. {item}")
    parts.append("")

    parts.append(GENERATED_HEADINGS["cardinal_laws"])
    for i, item in enumerate(parsed["cardinal_laws"], start=1):
        parts.append(f"{i}. {item}")
    parts.append("")

    parts.append(GENERATED_HEADINGS["mutable_laws"])
    for i, item in enumerate(parsed["mutable_laws"], start=1):
        parts.append(f"{i}. {item}")
    parts.append("")

    # Preserve any existing root-only sections verbatim, in their original order.
    matches = list(re.finditer(r"^##\s+(.+?)\s*$", existing_root_text, flags=re.MULTILINE))
    for i, m in enumerate(matches):
        heading_line = m.group(0).strip()
        heading = m.group(1).strip()
        if heading_line.startswith(PRESERVED_HEADING_PREFIXES) or any(
            heading.startswith(p[3:]) for p in PRESERVED_HEADING_PREFIXES
        ):
            start = m.end()
            end = matches[i + 1].start() if i + 1 < len(matches) else len(existing_root_text)
            body = existing_root_text[start:end].strip("\n")
            parts.append(f"## {heading}")
            parts.append(body)
            parts.append("")

    return "\n".join(parts).rstrip() + "\n"


def sync(queen_soul_path: str, root_soul_path: str) -> str:
    """Validate + regenerate. Returns the new sha256 of queen_soul_path on success.
    Raises MalformedSoulError (root soul is left untouched) on failure."""
    with open(queen_soul_path, "r", encoding="utf-8") as f:
        queen_text = f.read()

    parsed = parse_queen_soul(queen_text)  # raises on malformed input

    with open(root_soul_path, "r", encoding="utf-8") as f:
        existing_root_text = f.read()

    new_root_text = render_root_soul(parsed, existing_root_text)

    with open(root_soul_path, "w", encoding="utf-8") as f:
        f.write(new_root_text)

    return sha256_of(queen_soul_path)


def _main(argv: list[str]) -> int:
    if len(argv) < 2:
        print(__doc__, file=sys.stderr)
        return 2

    cmd = argv[1]
    if cmd == "hash" and len(argv) == 3:
        print(sha256_of(argv[2]))
        return 0

    if cmd == "sync" and len(argv) == 4:
        try:
            new_hash = sync(argv[2], argv[3])
        except MalformedSoulError as e:
            print(f"REJECTED: {e}", file=sys.stderr)
            return 1
        except OSError as e:
            print(f"ERROR: {e}", file=sys.stderr)
            return 1
        print(new_hash)
        return 0

    print(__doc__, file=sys.stderr)
    return 2


if __name__ == "__main__":
    sys.exit(_main(sys.argv))
