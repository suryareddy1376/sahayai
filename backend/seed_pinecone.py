import os
import sys
import json
import logging
from config import settings
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone, ServerlessSpec

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_pinecone():
    api_key = settings.PINECONE_API_KEY
    if not api_key:
        logger.error("PINECONE_API_KEY not set in environment.")
        sys.exit(1)

    index_name = settings.PINECONE_INDEX_NAME
    
    logger.info("Initializing Pinecone client...")
    pc = Pinecone(api_key=api_key)

    # Check if index exists
    existing_indexes = [idx.name for idx in pc.list_indexes()]
    
    # We will use the 'all-MiniLM-L6-v2' model which has dimension 384
    dimension = 384

    if index_name not in existing_indexes:
        logger.info(f"Creating Pinecone index '{index_name}' with dimension {dimension}...")
        pc.create_index(
            name=index_name,
            dimension=dimension,
            metric='cosine',
            spec=ServerlessSpec(
                cloud='aws',
                region='us-east-1' # Fallback serverless region
            )
        )
    else:
        logger.info(f"Pinecone index '{index_name}' already exists.")

    index = pc.Index(index_name)

    # Load schemes
    schemes_path = os.path.join("data", "schemes_verified.json")
    if not os.path.exists(schemes_path):
        # We might not have this file created as a standalone JSON yet if it was embedded in Python
        # I'll generate it here from the python array if it doesn't exist
        from agents.scheme_match import VERIFIED_SCHEMES
        schemes = VERIFIED_SCHEMES
    else:
        with open(schemes_path, "r") as f:
            schemes = json.load(f)

    logger.info("Loading sentence-transformers embedding model...")
    model = SentenceTransformer('all-MiniLM-L6-v2')

    logger.info("Embedding schemes...")
    vectors_to_upsert = []
    
    for scheme in schemes:
        # Create a rich text representation for embedding
        text_for_embedding = (
            f"Scheme Name: {scheme['name']}. "
            f"Corporation: {scheme['corporation']}. "
            f"Category: {scheme['category']}. "
            f"Target Audience: {scheme.get('recommendedFor', '')}. "
            f"Details: {scheme.get('headline', '')}"
        )
        
        # Embed
        embedding = model.encode(text_for_embedding).tolist()
        
        # Prepare metadata
        metadata = {
            "name": scheme["name"],
            "category": scheme["category"],
            "corporation": scheme["corporation"],
            "maxAmount": scheme.get("maxAmount", 0)
        }
        
        vectors_to_upsert.append({
            "id": scheme["id"],
            "values": embedding,
            "metadata": metadata
        })

    logger.info(f"Upserting {len(vectors_to_upsert)} vectors to Pinecone...")
    index.upsert(vectors=vectors_to_upsert, namespace="sahay-schemes-ns")
    logger.info("Pinecone seeding complete!")

if __name__ == "__main__":
    seed_pinecone()
