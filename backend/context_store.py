import threading
from typing import Dict, Any, Optional
from datetime import datetime

class ContextStore:
    def __init__(self):
        self._store: Dict[str, Dict[str, Any]] = {}
        self._lock = threading.Lock()

    def create_session(self, session_id: str, profile: Optional[Dict] = None, preferences: Optional[Dict] = None) -> Dict[str, Any]:
        with self._lock:
            if session_id in self._store:
                return self._store[session_id]
            
            session_data = {
                "session_id": session_id,
                "profile": profile or {},
                "preferences": preferences or {},
                "conversation_history": [],
                "created_at": datetime.utcnow().isoformat()
            }
            self._store[session_id] = session_data
            return session_data

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        with self._lock:
            return self._store.get(session_id)

    def update_session(self, session_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        with self._lock:
            if session_id not in self._store:
                return None
            
            self._store[session_id].update(updates)
            return self._store[session_id]

    def delete_session(self, session_id: str) -> bool:
        with self._lock:
            if session_id in self._store:
                del self._store[session_id]
                return True
            return False

# Global singleton instance
context_store = ContextStore()
