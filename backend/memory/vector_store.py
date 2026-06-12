"""Vector Store — ChromaDB integration for semantic memory."""
from typing import Dict, List, Optional


class VectorStore:
    def __init__(self):
        self.storage: Dict[str, list] = {}
        self.chroma_available = False

        try:
            import chromadb
            from sentence_transformers import SentenceTransformer
            self.client = chromadb.PersistentClient(path="chroma_db")
            self.collection = self.client.get_or_create_collection("hive_memory")
            self.encoder = SentenceTransformer("all-MiniLM-L6-v2")
            self.chroma_available = True
        except ImportError:
            pass

    def add(self, key: str, vector: list):
        self.storage[key] = vector
        if self.chroma_available:
            try:
                self.collection.add(embeddings=[vector], ids=[key], documents=[f"doc:{key}"])
            except Exception:
                pass

    def get(self, key: str) -> Optional[list]:
        return self.storage.get(key)

    def search(self, query_vector: list, top_k: int = 5) -> List[Dict]:
        if not self.chroma_available:
            return []
        try:
            results = self.collection.query(query_embeddings=[query_vector], n_results=top_k)
            return [{"id": id, "distance": dist} for id, dist in zip(results["ids"][0], results["distances"][0])]
        except Exception:
            return []
