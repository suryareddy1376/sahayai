from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    SARVAM_API_KEY: Optional[str] = None
    BHASHINI_API_KEY: Optional[str] = None
    BHASHINI_USER_ID: Optional[str] = None
    
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str
    
    PINECONE_API_KEY: str
    PINECONE_INDEX_NAME: str = 'sahay-schemes'
    PINECONE_ENVIRONMENT: str = 'gcp-starter'
    
    NEO4J_URI: Optional[str] = None
    NEO4J_USER: Optional[str] = None
    NEO4J_PASSWORD: Optional[str] = None
    
    OSM_USER_AGENT: str = 'SahayAI-SIH2026/1.0'
    NOMINATIM_BASE_URL: str = 'https://nominatim.openstreetmap.org'
    OVERPASS_BASE_URL: str = 'https://overpass-api.de/api/interpreter'
    OSRM_BASE_URL: str = 'https://router.project-osrm.org'
    
    FRONTEND_BASE_URL: str = 'http://localhost:5173'
    BACKEND_BASE_URL: str = 'http://localhost:8000'
    
    JWT_SECRET: str = 'dev-secret'
    REDIS_URL: Optional[str] = None

    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8')

settings = Settings()
