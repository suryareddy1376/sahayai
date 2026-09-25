import logging
from supabase import create_client, Client
from config import settings

logger = logging.getLogger(__name__)

# Use service role key to bypass RLS for backend operations
supabase: Client | None = None

if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
    try:
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
        logger.info(f"Supabase client initialized (URL: {settings.SUPABASE_URL[:30]}...)")
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        supabase = None
else:
    logger.warning("Supabase credentials not found in environment.")
