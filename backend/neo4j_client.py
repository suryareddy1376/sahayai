import logging
from neo4j import GraphDatabase, exceptions

logger = logging.getLogger(__name__)

class Neo4jClient:
    def __init__(self, uri, user, password):
        self.uri = uri
        self.user = user
        self.password = password
        self.driver = None
        
        if uri and user and password:
            try:
                self.driver = GraphDatabase.driver(uri, auth=(user, password))
                self.driver.verify_connectivity()
                logger.info("Successfully connected to Neo4j.")
            except exceptions.ServiceUnavailable:
                logger.warning("Neo4j database is unavailable. Check credentials or network.")
                self.driver = None
            except Exception as e:
                logger.error(f"Failed to connect to Neo4j: {e}")
                self.driver = None
        else:
            logger.info("Neo4j credentials not fully provided; skipping graph database setup.")

    def close(self):
        if self.driver:
            self.driver.close()

    def emit_user_node(self, user_id, profile_data):
        """Creates or updates a User node in Neo4j."""
        if not self.driver:
            return {"status": "skipped", "reason": "not_configured"}
            
        cypher = """
        MERGE (u:User {id: $user_id})
        SET u += $properties,
            u.last_updated = datetime()
        """
        # Flatten properties slightly for neo4j
        props = {}
        for k, v in profile_data.items():
            if isinstance(v, dict):
                for sub_k, sub_v in v.items():
                    props[f"{k}_{sub_k}"] = sub_v
            else:
                props[k] = v
                
        try:
            with self.driver.session() as session:
                session.run(cypher, user_id=user_id, properties=props)
            return {"status": "success", "node_id": user_id}
        except Exception as e:
            logger.error(f"Failed to emit user node: {e}")
            return {"status": "error", "error": str(e)}

    def execute_cypher_script(self, cypher_text):
        if not self.driver:
            return False
            
        queries = [q.strip() for q in cypher_text.split(';') if q.strip()]
        try:
            with self.driver.session() as session:
                for q in queries:
                    session.run(q)
            return True
        except Exception as e:
            logger.error(f"Cypher script execution failed: {e}")
            return False

# Singleton instance will be initialized in main
neo4j_client = None
