"""
Knowledge API — Sovereign Hive v12.0
RAG search over ChromaDB-ingested knowledge repos.
Run scripts/ingest_knowledge.py first to populate the collection.
"""

import logging
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

logger = logging.getLogger("jasper.knowledge")

router = APIRouter(prefix="/v11/knowledge", tags=["knowledge"])

COLLECTION_NAME = "hive_knowledge"
_chroma_col = None


def _get_collection():
    global _chroma_col
    if _chroma_col is not None:
        return _chroma_col
    try:
        import chromadb
        from backend.core.config import settings
        client = chromadb.PersistentClient(path=settings.chroma_path)
        _chroma_col = client.get_or_create_collection(COLLECTION_NAME)
        return _chroma_col
    except Exception as e:
        logger.warning(f"ChromaDB unavailable: {e}")
        return None


class KnowledgeResult(BaseModel):
    text: str
    source: str
    distance: Optional[float] = None


@router.get("/search", response_model=dict)
async def knowledge_search(
    q: str = Query(..., min_length=2, description="Search query"),
    k: int = Query(5, ge=1, le=20, description="Number of results"),
    source_filter: Optional[str] = Query(None, description="Filter by repo name prefix"),
):
    """
    Semantic search over the ingested knowledge corpus (free-programming-books,
    system-design-primer, build-your-own-x, etc.).
    Returns top-k most relevant chunks.
    """
    col = _get_collection()
    if col is None:
        return {
            "query": q,
            "results": [],
            "note": "Knowledge base not available. Run: python scripts/ingest_knowledge.py",
        }

    try:
        where = {"source": {"$contains": source_filter}} if source_filter else None
        qr = col.query(
            query_texts=[q],
            n_results=min(k, col.count() or 1),
            where=where,
            include=["documents", "metadatas", "distances"],
        )
        docs = qr.get("documents", [[]])[0]
        metas = qr.get("metadatas", [[]])[0]
        dists = qr.get("distances", [[]])[0]

        results = [
            {
                "text": doc,
                "source": meta.get("source", ""),
                "distance": round(dist, 4),
            }
            for doc, meta, dist in zip(docs, metas, dists)
        ]
        return {"query": q, "results": results, "count": len(results)}

    except Exception as e:
        logger.error(f"Knowledge search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sources")
async def knowledge_sources():
    """List ingested knowledge sources (repo names)."""
    col = _get_collection()
    if col is None:
        return {"sources": [], "total_chunks": 0}

    try:
        total = col.count()
        # Sample to get source names
        sample = col.get(limit=1000, include=["metadatas"])
        sources_seen = set()
        for meta in sample.get("metadatas", []):
            src = meta.get("source", "")
            if src:
                repo = src.split("/")[0]
                sources_seen.add(repo)
        return {"sources": sorted(sources_seen), "total_chunks": total}
    except Exception as e:
        logger.error(f"Knowledge sources error: {e}")
        return {"sources": [], "total_chunks": 0, "error": str(e)}


@router.get("/status")
async def knowledge_status():
    """Quick status check for the knowledge base."""
    col = _get_collection()
    if col is None:
        return {"status": "unavailable", "total_chunks": 0}
    try:
        total = col.count()
        return {"status": "ready" if total > 0 else "empty", "total_chunks": total}
    except Exception as e:
        return {"status": "error", "error": str(e)}
