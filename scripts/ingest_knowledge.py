#!/usr/bin/env python3
"""
Knowledge Ingestion — Sovereign Hive v12.0
Clones (or updates) open source knowledge repos and ingests their content
into ChromaDB as vector embeddings for RAG.

Repos ingested (all read-only, never executed):
  - free-programming-books (TehutiRaEl fork)
  - CS Notes, system-design-primer, coding-interview-university
  - build-your-own-x, project-based-learning
  - every-programmer-should-know, Awesome Python, Public APIs
  - developer-roadmap (markdown only)

Usage:
  python scripts/ingest_knowledge.py [--dry-run] [--repo <name>]
"""

import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Iterator, List, Optional, Tuple

REPOS = [
    # name, clone_url, branch
    ("free-programming-books", "https://github.com/EbookFoundation/free-programming-books", "main"),
    ("system-design-primer", "https://github.com/donnemartin/system-design-primer", "master"),
    ("coding-interview-university", "https://github.com/jwasham/coding-interview-university", "main"),
    ("build-your-own-x", "https://github.com/codecrafters-io/build-your-own-x", "master"),
    ("project-based-learning", "https://github.com/practical-tutorials/project-based-learning", "master"),
    ("every-programmer-should-know", "https://github.com/mtdvio/every-programmer-should-know", "master"),
    ("awesome-python", "https://github.com/vinta/awesome-python", "master"),
    ("public-apis", "https://github.com/public-apis/public-apis", "master"),
    ("developer-roadmap", "https://github.com/kamranahmedse/developer-roadmap", "master"),
    ("cs-notes", "https://github.com/CyC2018/CS-Notes", "master"),
]

CHUNK_SIZE = 500   # tokens (approximate: chars / 4)
CHUNK_OVERLAP = 50
COLLECTION_NAME = "hive_knowledge"

# ── Text extraction ────────────────────────────────────────────

def _clean(text: str) -> str:
    """Strip HTML tags, excess whitespace."""
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s{3,}", "\n\n", text)
    return text.strip()


def _iter_markdown_files(repo_dir: Path) -> Iterator[Path]:
    for p in repo_dir.rglob("*.md"):
        # Skip node_modules, .git, images-only files
        parts = p.parts
        if any(x in parts for x in (".git", "node_modules", "__pycache__")):
            continue
        yield p


def _chunk_text(text: str, source: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[dict]:
    """Split text into overlapping chunks. Returns list of {text, source, chunk_id}."""
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk_words = words[i:i + chunk_size]
        chunk_text = " ".join(chunk_words)
        chunk_id = hashlib.sha256(f"{source}:{i}".encode()).hexdigest()[:16]
        chunks.append({"text": chunk_text, "source": source, "chunk_id": chunk_id})
        i += chunk_size - overlap
    return chunks


def _extract_chunks(repo_name: str, repo_dir: Path) -> List[dict]:
    all_chunks = []
    for md_file in _iter_markdown_files(repo_dir):
        try:
            text = _clean(md_file.read_text(errors="ignore"))
        except Exception:
            continue
        if len(text) < 100:
            continue
        rel_path = str(md_file.relative_to(repo_dir))
        source = f"{repo_name}/{rel_path}"
        chunks = _chunk_text(text, source)
        all_chunks.extend(chunks)
    return all_chunks


# ── ChromaDB ingestion ─────────────────────────────────────────

def _get_chroma_collection():
    try:
        import chromadb
    except ImportError:
        print("chromadb not installed — skipping vector ingestion. Run: pip install chromadb")
        return None

    chroma_path = os.getenv("CHROMA_PATH", "./chroma_db")
    client = chromadb.PersistentClient(path=chroma_path)
    col = client.get_or_create_collection(
        COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )
    return col


def _ingest_chunks(col, chunks: List[dict], batch_size: int = 100, dry_run: bool = False):
    if dry_run:
        print(f"  [dry-run] Would ingest {len(chunks)} chunks")
        return

    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i + batch_size]
        col.upsert(
            ids=[c["chunk_id"] for c in batch],
            documents=[c["text"] for c in batch],
            metadatas=[{"source": c["source"]} for c in batch],
        )
    print(f"  Ingested {len(chunks)} chunks")


# ── Repo management ────────────────────────────────────────────

def _clone_or_update(name: str, url: str, branch: str, base_dir: Path) -> Optional[Path]:
    repo_dir = base_dir / name
    if repo_dir.exists():
        print(f"  Updating {name}...")
        result = subprocess.run(
            ["git", "-C", str(repo_dir), "pull", "--ff-only", "origin", branch],
            capture_output=True, text=True,
        )
        if result.returncode != 0:
            print(f"  Warning: pull failed for {name}: {result.stderr[:200]}")
    else:
        print(f"  Cloning {name} ({url})...")
        result = subprocess.run(
            ["git", "clone", "--depth=1", "--branch", branch, url, str(repo_dir)],
            capture_output=True, text=True,
        )
        if result.returncode != 0:
            print(f"  Error cloning {name}: {result.stderr[:200]}")
            return None
    return repo_dir


# ── Main ───────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Ingest knowledge repos into ChromaDB")
    parser.add_argument("--dry-run", action="store_true", help="Don't write to ChromaDB")
    parser.add_argument("--repo", default="", help="Only ingest this repo name")
    parser.add_argument("--cache-dir", default=os.path.expanduser("~/.hive/knowledge_cache"), help="Where to clone repos")
    args = parser.parse_args()

    cache_dir = Path(args.cache_dir)
    cache_dir.mkdir(parents=True, exist_ok=True)

    col = None if args.dry_run else _get_chroma_collection()

    total_chunks = 0
    repos_to_run = [(n, u, b) for n, u, b in REPOS if not args.repo or n == args.repo]

    for name, url, branch in repos_to_run:
        print(f"\n[{name}]")
        repo_dir = _clone_or_update(name, url, branch, cache_dir)
        if not repo_dir:
            continue

        chunks = _extract_chunks(name, repo_dir)
        print(f"  Extracted {len(chunks)} chunks from {name}")

        if col is not None:
            _ingest_chunks(col, chunks, dry_run=False)
        elif args.dry_run:
            print(f"  [dry-run] Would ingest {len(chunks)} chunks")

        total_chunks += len(chunks)

    print(f"\nDone. Total chunks: {total_chunks}")
    if col:
        count = col.count()
        print(f"ChromaDB collection '{COLLECTION_NAME}' now has {count} documents.")


if __name__ == "__main__":
    main()
