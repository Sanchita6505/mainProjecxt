from functools import lru_cache
from typing import Any, Dict, List, Optional, Sequence

from chromadb import PersistentClient
from chromadb.api.models.Collection import Collection
from chromadb.config import Settings as ChromaClientSettings

from app.config.settings import Settings, get_settings
from app.vectorstore.schemas import VectorRecord, VectorSearchResult


class ChromaCollectionManager:
    def __init__(self, settings: Settings) -> None:
        self._default_collection_name = settings.chroma_collection_name
        self._distance_metric = settings.chroma_distance_metric
        self._client = PersistentClient(
            path=settings.chroma_persist_directory,
            settings=ChromaClientSettings(anonymized_telemetry=False),
        )

    def get_collection(self, collection_name: Optional[str] = None) -> Collection:
        return self._client.get_or_create_collection(
            name=collection_name or self._default_collection_name,
            metadata={"hnsw:space": self._distance_metric},
        )

    def upsert(self, records: Sequence[VectorRecord], collection_name: Optional[str] = None) -> None:
        if not records:
            return

        collection = self.get_collection(collection_name)
        ids = [record.record_id for record in records]
        embeddings = [record.embedding for record in records]
        documents = [record.document for record in records]
        metadatas = [record.metadata for record in records]

        documents_arg: Optional[List[Optional[str]]] = None
        if not all(document is None for document in documents):
            documents_arg = documents

        metadatas_arg: Optional[List[Optional[Dict[str, Any]]]] = None
        if not all(metadata is None for metadata in metadatas):
            metadatas_arg = metadatas

        collection.upsert(
            ids=ids,
            embeddings=embeddings,
            documents=documents_arg,
            metadatas=metadatas_arg,
        )

    def delete(
        self,
        *,
        collection_name: Optional[str] = None,
        ids: Optional[Sequence[str]] = None,
        where: Optional[Dict[str, Any]] = None,
    ) -> None:
        if not ids and where is None:
            return

        collection = self.get_collection(collection_name)
        collection.delete(ids=list(ids) if ids else None, where=where)

    def search(
        self,
        *,
        query_embedding: Sequence[float],
        n_results: int = 5,
        where: Optional[Dict[str, Any]] = None,
        collection_name: Optional[str] = None,
    ) -> List[VectorSearchResult]:
        collection = self.get_collection(collection_name)
        response = collection.query(
            query_embeddings=[list(query_embedding)],
            n_results=n_results,
            where=where,
            include=["distances", "documents", "metadatas"],
        )

        ids = response.get("ids", [[]])[0]
        distances = response.get("distances", [[]])[0]
        documents = response.get("documents", [[]])[0]
        metadatas = response.get("metadatas", [[]])[0]

        results: List[VectorSearchResult] = []
        for index, record_id in enumerate(ids):
            distance = distances[index] if index < len(distances) else None
            document = documents[index] if index < len(documents) else None
            metadata = metadatas[index] if index < len(metadatas) else None
            results.append(
                VectorSearchResult(
                    record_id=record_id,
                    distance=distance,
                    document=document,
                    metadata=metadata,
                )
            )
        return results


@lru_cache
def get_collection_manager() -> ChromaCollectionManager:
    return ChromaCollectionManager(get_settings())