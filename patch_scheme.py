import re

with open('backend/agents/scheme_match.py', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace local SentenceTransformer loading with HF API
code = code.replace(
    "from sentence_transformers import SentenceTransformer",
    "import httpx"
)

code = code.replace(
    "self.embed_model = SentenceTransformer('all-MiniLM-L6-v2')",
    "self.embed_model = 'HF_API'"
)

replacement = """
                # Call HuggingFace Inference API instead of heavy local PyTorch
                async with httpx.AsyncClient() as client:
                    hf_resp = await client.post(
                        "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
                        json={"inputs": [need_input], "options": {"wait_for_model": True}},
                        timeout=15.0
                    )
                    query_vector = hf_resp.json()[0]
"""

code = code.replace(
    "query_vector = self.embed_model.encode(need_input).tolist()",
    replacement
)

with open('backend/agents/scheme_match.py', 'w', encoding='utf-8') as f:
    f.write(code)
