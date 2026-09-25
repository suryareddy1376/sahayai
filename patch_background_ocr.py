import re

with open('backend/main.py', 'r', encoding='utf-8') as f:
    code = f.read()

# Add BackgroundTasks import if not there
if "BackgroundTasks" not in code:
    code = code.replace("from fastapi import FastAPI", "from fastapi import FastAPI, BackgroundTasks")
    code = code.replace("from fastapi import APIRouter, File, Form, UploadFile, Request", "from fastapi import APIRouter, File, Form, UploadFile, Request, BackgroundTasks")

# Find the intake endpoint
old_intake_def = "async def beneficiary_intake(form_data: dict):"
new_intake_def = "async def beneficiary_intake(form_data: dict, background_tasks: BackgroundTasks):"
code = code.replace(old_intake_def, new_intake_def)

# Add the background task logic function before the intake endpoint
background_logic = """
async def process_documents_background(user_id: str, profile_data: dict, documents: dict):
    \"\"\"
    Background task to download files from Supabase S3, pass to Sarvam AI Document API,
    and update the Neo4j graph with verified entities to prevent UI freezing.
    \"\"\"
    if not supabase:
        logger.warning("Supabase client not initialized. Skipping background OCR.")
        return
        
    for doc_key, doc_meta in documents.items():
        if not doc_meta or not isinstance(doc_meta, dict):
            continue
            
        storage_url = doc_meta.get("storage_url")
        if not storage_url:
            continue
            
        logger.info(f"Agent pulling {doc_key} from Supabase: {storage_url}")
        try:
            # 1. Securely download bytes directly from Supabase S3 bucket using Service Role
            file_bytes = supabase.storage.from_("Documents").download(storage_url)
            
            # 2. Handoff to Sarvam AI Document API for multimodal extraction
            logger.info(f"Agent extracting {doc_key} via Sarvam API...")
            extracted = await document_adapter.extract(file_bytes, doc_meta.get("file_name", "document.pdf"), "general")
            
            logger.info(f"Extracted verified data for {doc_key}: {extracted}")
            
            # 3. Update Neo4j graph with the verified tag (Stub for Hackathon)
            neo4j_client.emit_user_node(user_id, {**profile_data, f"{doc_key}_verified": True, f"{doc_key}_extraction": extracted})
            
        except Exception as e:
            logger.error(f"Multimodal Agent failed to process {doc_key}: {e}")

@app.post("/api/intake")"""

if "process_documents_background" not in code:
    code = code.replace("@app.post(\"/api/intake\")", background_logic)

# Hook it into the intake execution
old_return = """        return {
            "success": True,"""
            
new_return = """        # Queue the Multimodal Background Task!
        background_tasks.add_task(
            process_documents_background, 
            user_id, 
            profile, 
            form_data.get("documents", {})
        )

        return {
            "success": True,"""

if "background_tasks.add_task(" not in code:
    code = code.replace(old_return, new_return)

with open('backend/main.py', 'w', encoding='utf-8') as f:
    f.write(code)
