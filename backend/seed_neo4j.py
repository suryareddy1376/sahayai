import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load env before importing neo4j_client
load_dotenv()

from neo4j_client import Neo4jClient

def seed_graph():
    uri = os.getenv("NEO4J_URI")
    user = os.getenv("NEO4J_USER")
    password = os.getenv("NEO4J_PASSWORD")
    
    if not uri or not password or password == "put_your_password_here":
        print("Error: Please set NEO4J_PASSWORD in your .env file first!")
        sys.exit(1)
        
    print(f"Connecting to Neo4j at {uri}...")
    client = Neo4jClient(uri, user, password)
    
    if not client.driver:
        print("Failed to connect to Neo4j. Check your credentials.")
        sys.exit(1)
        
    cypher_file = Path(__file__).parent / "data" / "neo4j_seed_schemes.cypher"
    if not cypher_file.exists():
        print(f"Error: Could not find {cypher_file}")
        sys.exit(1)
        
    print("Reading Cypher script...")
    with open(cypher_file, "r", encoding="utf-8") as f:
        cypher_script = f.read()
        
    print("Executing Cypher commands (this may take a moment)...")
    success = client.execute_cypher_script(cypher_script)
    
    if success:
        print("SUCCESS! Your Neo4j Graph has been fully seeded with the Sahay AI schemas.")
    else:
        print("FAILED to execute some Cypher commands. Check the logs.")
        
if __name__ == "__main__":
    seed_graph()
