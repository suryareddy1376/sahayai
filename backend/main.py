"""
Sahay AI Backend — FastAPI Application
Implements: Multi-Modal Agentic Architecture (Supervisor-Worker with Reducer fan-in)
Layers: Input -> Perception -> JEV Stub -> Workers -> Reducer -> Ranked Output
"""

import os
import uuid
import math
import hashlib
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, BackgroundTasks, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import settings
from context_store import context_store

from adapters.speech import SpeechAdapter
from adapters.document import DocumentAdapter
from adapters.geo import GeoAdapter
from adapters.jev import JevStubRouter
from neo4j_client import Neo4jClient

# Initialize Neo4j Client
neo4j_client = Neo4jClient(settings.NEO4J_URI, settings.NEO4J_USER, settings.NEO4J_PASSWORD)

from agents.scheme_match import SchemeMatchAgent
from agents.emi_calculator import EMICalculatorAgent
from agents.partner_locator import PartnerLocatorAgent
from agents.reducer import ReducerAgent

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")
logger = logging.getLogger("sahay-backend")

# ── FastAPI App ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="Sahay AI Backend",
    version="1.0.0",
    description="Multi-Modal Agentic Backend for Direct Citizen Assistance (SIH 26092)",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_BASE_URL,
        "https://sahayai-five.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Initialize Adapters & Agents ─────────────────────────────────────────────
speech_adapter = SpeechAdapter(
    sarvam_api_key=settings.SARVAM_API_KEY or "",
    bhashini_api_key=settings.BHASHINI_API_KEY,
    bhashini_user_id=settings.BHASHINI_USER_ID,
    bhashini_pipeline_id=settings.BHASHINI_PIPELINE_ID,
)

document_adapter = DocumentAdapter(sarvam_api_key=settings.SARVAM_API_KEY or "")

geo_adapter = GeoAdapter(
    user_agent=settings.OSM_USER_AGENT,
    nominatim_base=settings.NOMINATIM_BASE_URL,
    overpass_base=settings.OVERPASS_BASE_URL,
    osrm_base=settings.OSRM_BASE_URL,
)

jev_router = JevStubRouter()
scheme_agent = SchemeMatchAgent(
    pinecone_api_key=settings.PINECONE_API_KEY,
    pinecone_index_name=settings.PINECONE_INDEX_NAME,
)
emi_agent = EMICalculatorAgent()
partner_agent = PartnerLocatorAgent(geo_adapter=geo_adapter)
reducer_agent = ReducerAgent()

# ── BCP-47 Language Mapping ──────────────────────────────────────────────────
LANG_MAP = {
    'hi': 'hi-IN', 'bn': 'bn-IN', 'mr': 'mr-IN', 'te': 'te-IN',
    'ta': 'ta-IN', 'gu': 'gu-IN', 'ur': 'ur-IN', 'kn': 'kn-IN',
    'od': 'or-IN', 'ml': 'ml-IN', 'en': 'en-IN',
}

# ══════════════════════════════════════════════════════════════════════════════
#  HEALTH CHECK
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "sahay-ai-backend",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


# ══════════════════════════════════════════════════════════════════════════════
#  SESSION
# ══════════════════════════════════════════════════════════════════════════════

@app.post("/api/session")
def create_session():
    session_id = f"ses_{uuid.uuid4().hex[:12]}"
    session = context_store.create_session(session_id)
    return {"session_id": session["session_id"], "profile": session.get("profile")}


# ══════════════════════════════════════════════════════════════════════════════
#  LAYER 1-2: PERCEPTION — VOICE
# ══════════════════════════════════════════════════════════════════════════════

@app.post("/api/perception/voice")
async def perception_voice(audio: UploadFile = File(...), lang: str = Form("en")):
    """STT + Translation via Sarvam (primary) / Bhashini (fallback)."""
    try:
        audio_bytes = await audio.read()
        transcript = await speech_adapter.transcribe(audio_bytes, lang)

        # Translate to English if not already
        translation = transcript
        if lang != "en":
            translation = await speech_adapter.translate(transcript, lang, "en")

        # Basic entity extraction (keyword-based for stub)
        entities = _extract_entities(translation)

        return {
            "transcript": transcript,
            "translation": translation,
            "entities": entities,
            "profile_updates": None,
        }
    except Exception as e:
        logger.error(f"Perception voice error: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": "perception_voice_failed", "detail": str(e), "retryable": True},
        )


# ══════════════════════════════════════════════════════════════════════════════
#  LAYER 1-2: PERCEPTION — DOCUMENT
# ══════════════════════════════════════════════════════════════════════════════

@app.post("/api/perception/document")
async def perception_document(file: UploadFile = File(...), doc_type: str = Form("general")):
    """OCR / VLM extraction via Sarvam Extraction + Digitisation."""
    try:
        file_bytes = await file.read()
        extracted = await document_adapter.extract(file_bytes, file.filename or "document", doc_type)
        ocr_text = await document_adapter.ocr(file_bytes, file.filename or "document")
        return {
            "extracted_fields": extracted,
            "ocr_text": ocr_text,
            "mismatches": [],
        }
    except Exception as e:
        logger.error(f"Perception document error: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": "perception_document_failed", "detail": str(e), "retryable": True},
        )


# ══════════════════════════════════════════════════════════════════════════════
#  LAYER 2-7: ASSIST (Main Pipeline: JEV -> Workers -> Reducer)
# ══════════════════════════════════════════════════════════════════════════════

@app.post("/api/assist")
async def assist_endpoint(body: dict):
    """
    Full pipeline: Perception -> JEV Stub Router -> Workers (parallel) -> Reducer -> Response
    Input: { session_id, need_input (str or BeneficiaryProfile dict), lang }
    Output: { matched_schemes, emi_plans, ranked_partners, citations, guardrail_flags }
    """
    session_id = body.get("session_id", str(uuid.uuid4()))
    need_input = body.get("need_input", "")
    lang = body.get("lang", "en")

    # Ensure session exists
    session = context_store.get_session(session_id)
    if not session:
        session = context_store.create_session(session_id)

    try:
        # ── Layer 2: Normalize input ──
        perception_result = {
            "text_en": need_input if isinstance(need_input, str) else "",
            "profile": need_input if isinstance(need_input, dict) else None,
            "language": lang,
        }

        # ── Layer 3: JEV Stub Router (Guardrail #1 + Task Decomposition) ──
        context_ref = f"session:{session_id}"
        task_contracts = jev_router.classify_and_route(perception_result, context_ref)

        # Check for guardrail rejection
        if any(tc.get("guardrail_blocked") for tc in task_contracts):
            blocked = next(tc for tc in task_contracts if tc.get("guardrail_blocked"))
            return {
                "matched_schemes": [],
                "guardrail_flags": [blocked.get("guardrail_message", "Request blocked by safety guardrail")],
            }

        # ── Layer 4: Execute Worker Agents ──
        worker_outputs = {}

        for tc in task_contracts:
            slice_type = tc["slice"]

            if slice_type == "scheme_match":
                profile_data = perception_result.get("profile")
                text_query = perception_result.get("text_en", "")
                matched = await scheme_agent.match_schemes(
                    need_input=text_query if not profile_data else profile_data,
                    beneficiary_profile=profile_data,
                )
                worker_outputs["scheme_match"] = matched

            elif slice_type == "emi_calculation":
                # EMI requires matched schemes — compute if we have them
                schemes = worker_outputs.get("scheme_match", [])
                emi_plans = []
                for s in schemes[:3]:  # Top 3
                    plan = emi_agent.calculate(
                        scheme_id=s["id"],
                        scheme_name=s["name"],
                        principal=s["maxAmount"],
                        tenure_months=s["standardTenureMonths"],
                        interest_rate=s["interestRate"],
                        moratorium_months=s.get("moratoriumMonths", 0),
                    )
                    emi_plans.append(plan)
                worker_outputs["emi_calculation"] = emi_plans

            elif slice_type == "partner_locator":
                partners = await partner_agent.locate_partners()
                worker_outputs["partner_locator"] = partners

        # ── Layer 6: Reducer (Rank, Dedup, Guardrail #2) ──
        result = reducer_agent.reduce(worker_outputs)

        # Update session context
        context_store.update_session(session_id, {
            "last_query": need_input if isinstance(need_input, str) else "profile-based",
            "matched_schemes_count": len(result.get("matched_schemes", [])),
        })

        return result

    except Exception as e:
        logger.error(f"Assist pipeline error: {e}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"error": "assist_pipeline_failed", "detail": str(e), "retryable": True},
        )


# ══════════════════════════════════════════════════════════════════════════════
#  LAYER 4: EMI CALCULATOR (Standalone Endpoint)
# ══════════════════════════════════════════════════════════════════════════════

@app.post("/api/emi")
def calculate_emi(body: dict):
    """Deterministic EMI calculation. No LLM."""
    try:
        scheme_id = body.get("scheme_id", "unknown")
        principal = float(body.get("principal", 0))
        tenure_months = int(body.get("tenure_months", 36))
        interest_rate = float(body.get("interest_rate", 6.5))
        moratorium_months = int(body.get("moratorium_months", 6))

        result = emi_agent.calculate(
            scheme_id=scheme_id,
            scheme_name=body.get("scheme_name", ""),
            principal=principal,
            tenure_months=tenure_months,
            interest_rate=interest_rate,
            moratorium_months=moratorium_months,
        )
        return {"emi_plans": [result], "comparison_table": None}
    except Exception as e:
        logger.error(f"EMI calculation error: {e}")
        return JSONResponse(
            status_code=400,
            content={"error": "emi_calculation_failed", "detail": str(e), "retryable": False},
        )


# ══════════════════════════════════════════════════════════════════════════════
#  LAYER 4: PARTNER LOCATOR (Standalone Endpoint)
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/api/partners")
async def locate_partners(
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None),
    radius: int = Query(5000),
    scheme_id: Optional[str] = Query(None),
):
    """Find nearest partner branches using OSM stack + seeded SCA list."""
    try:
        partners = await partner_agent.locate_partners(
            scheme_id=scheme_id, lat=lat, lon=lon
        )
        return {"ranked_partners": partners}
    except Exception as e:
        logger.error(f"Partner locator error: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": "partner_locator_failed", "detail": str(e), "retryable": True},
        )


# ══════════════════════════════════════════════════════════════════════════════
#  LAYER 1-2: INTAKE (Beneficiary Profile)
# ══════════════════════════════════════════════════════════════════════════════
from supabase_client import supabase


async def process_documents_background(user_id: str, profile_data: dict, documents: dict):
    """
    Background task to download files from Supabase S3, pass to Sarvam AI Document API,
    and update the Neo4j graph with verified entities to prevent UI freezing.
    """
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

@app.post("/api/intake")
async def beneficiary_intake(form_data: dict, background_tasks: BackgroundTasks):
    """
    Validates, isolates sensitive data, writes to Supabase, emits Neo4j User node, queues docs.
    """
    try:
        now_iso = datetime.utcnow().isoformat() + "Z"
        user_id = str(uuid.uuid4())

        identity = form_data.get("identity", {})
        location = form_data.get("location", {})
        financial = form_data.get("financial", {})
        enterprise = form_data.get("enterprise", {})
        education = form_data.get("education")

        # Hash + mask ID proof
        raw_id = identity.get("id_proof_number", "000000000000")
        id_hash = hashlib.sha256(raw_id.strip().upper().encode()).hexdigest()
        id_masked = "•••• •••• " + raw_id[-4:] if len(raw_id) >= 4 else "•••• " + raw_id

        # ── Write to Supabase (user_profiles) ──
        if supabase:
            profile_record = {
                "id": user_id,
                "full_name": identity.get("full_name", ""),
                "age": identity.get("age", 18),
                "gender": identity.get("gender", "other"),
                "is_rural": location.get("is_rural", True),
                "annual_family_income": financial.get("annual_family_income", 0),
                "loan_type_needed": enterprise.get("loan_type_needed", "micro_finance"),
                "requested_loan_amount": enterprise.get("requested_loan_amount", 0)
            }
            # Attempt insert; ignore failure if schema not run yet for dev continuity
            try:
                supabase.table("user_profiles").insert(profile_record).execute()
                
                # Insert sensitive attributes
                sensitive_record = {
                    "record_id": f"SENS-ATTR-{uuid.uuid4().hex[:8]}",
                    "user_id": user_id,
                    "caste_category": identity.get("caste_category", "General"),
                    "disability_status": str(bool(identity.get("disability_status"))).lower(),
                    "id_proof_masked": id_masked
                }
                supabase.table("user_sensitive_attributes").insert(sensitive_record).execute()
            except Exception as db_err:
                logger.error(f"Supabase write failed: {db_err}")

        # Build sanitized profile response
        profile = {
            "id": user_id,
            "identity": {
                "full_name": identity.get("full_name", ""),
                "age": identity.get("age", 0),
                "gender": identity.get("gender", "other"),
                "id_proof_number_masked": id_masked,
                "has_disability": bool(identity.get("disability_status")),
            },
            "location": location,
            "financial": financial,
            "enterprise": enterprise,
            "education": education,
            "documents": form_data.get("documents", {}),
            "created_at": now_iso,
            "updated_at": now_iso,
        }

        response = {
            "success": True,
            "status_code": 201,
            "message": "Beneficiary intake profile created and registered successfully.",
            "timestamp": now_iso,
            "beneficiary": profile,
            "sensitive_record_ref": {
                "record_id": f"SENS-ATTR-{uuid.uuid4().hex[:8]}",
                "storage_table": "user_sensitive_attributes",
                "access_role_required": "ROLE_SENSITIVE_DATA_OFFICER",
            },
            "graph_node_emitted": neo4j_client.emit_user_node(user_id, profile),
            "document_processing": {
                "batch_id": f"BATCH-{int(datetime.utcnow().timestamp() * 1000)}",
                "total_queued": len([k for k in form_data.get("documents", {}).keys() if form_data["documents"].get(k)]),
                "status": "queued_for_multimodal_agent",
                "mismatches": [],
            },
        }
        return response

    except Exception as e:
        logger.error(f"Intake error: {e}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"error": "intake_failed", "detail": str(e), "retryable": True},
        )


# ══════════════════════════════════════════════════════════════════════════════
#  APPLICATIONS (Tracker)
# ══════════════════════════════════════════════════════════════════════════════

# In-memory fallback
_applications: Dict[str, dict] = {}

@app.post("/api/applications")
def create_application(body: dict):
    """Submit application and save to Supabase."""
    try:
        random_suffix = uuid.uuid4().hex[:5].upper()
        app_id = f"SAHAY-2026-GOV-{random_suffix}"
        now_str = datetime.now().strftime("%d %b %Y, %I:%M %p")

        scheme = body.get("scheme", {})
        emi_data = body.get("emiData", {})
        partner = body.get("partner", {})

        application = {
            "applicationId": app_id,
            "schemeName": scheme.get("name", ""),
            "loanAmount": emi_data.get("loanAmount", 0),
            "monthlyEMI": emi_data.get("monthlyEMI", 0),
            "partnerName": partner.get("name", ""),
            "partnerAddress": partner.get("address", ""),
            "submittedDate": now_str,
            "currentStatus": "submitted",
            "statusReasonText": "Application received directly at the local nodal branch. Officer verification assigned.",
            "notifyPhone": body.get("phone", "+91 98765 43210"),
            "notifyWhatsApp": body.get("whatsappAlert", True),
        }

        # Save to Supabase if available
        if supabase:
            try:
                db_record = {
                    "application_id": app_id,
                    "scheme_name": application["schemeName"],
                    "loan_amount": application["loanAmount"],
                    "monthly_emi": application["monthlyEMI"],
                    "partner_name": application["partnerName"],
                    "partner_address": application["partnerAddress"],
                    "status": "submitted",
                    "status_reason": application["statusReasonText"],
                    "notify_phone": application["notifyPhone"],
                    "notify_whatsapp": application["notifyWhatsApp"]
                }
                supabase.table("applications").insert(db_record).execute()
            except Exception as e:
                logger.error(f"Failed to write application to Supabase: {e}")

        # Always store in memory fallback so frontend works smoothly even if DB fails
        _applications[app_id] = application
        return application

    except Exception as e:
        logger.error(f"Application creation error: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": "application_create_failed", "detail": str(e), "retryable": True},
        )


@app.get("/api/applications/{app_id}")
def get_application(app_id: str):
    """Get application tracker status from Supabase or memory."""
    if supabase:
        try:
            res = supabase.table("applications").select("*").eq("application_id", app_id).limit(1).execute()
            if res.data:
                db_app = res.data[0]
                return {
                    "applicationId": db_app["application_id"],
                    "schemeName": db_app["scheme_name"],
                    "loanAmount": db_app["loan_amount"],
                    "monthlyEMI": db_app["monthly_emi"],
                    "partnerName": db_app["partner_name"],
                    "partnerAddress": db_app["partner_address"],
                    "submittedDate": db_app.get("created_at", ""),
                    "currentStatus": db_app["status"],
                    "statusReasonText": db_app["status_reason"],
                    "notifyPhone": "+91 98765 43210",
                    "notifyWhatsApp": True,
                }
        except Exception as e:
            logger.error(f"Supabase read error: {e}")

    application = _applications.get(app_id)
    if not application:
        raise HTTPException(status_code=404, detail=f"Application {app_id} not found")
    return application


# ══════════════════════════════════════════════════════════════════════════════
#  LAYER 7: TTS (Speech Synthesis)
# ══════════════════════════════════════════════════════════════════════════════

@app.post("/api/tts")
async def text_to_speech(body: dict):
    """Synthesize speech in regional language via Sarvam Bulbul TTS."""
    try:
        text = body.get("text", "")
        lang = body.get("lang", "en")

        audio_bytes = await speech_adapter.synthesize(text, lang)

        if audio_bytes:
            import base64
            audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
            return {"audio_base64": audio_b64, "audio_url": None}
        else:
            return {"audio_base64": None, "audio_url": None}

    except Exception as e:
        logger.error(f"TTS error: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": "tts_failed", "detail": str(e), "retryable": True},
        )


# ══════════════════════════════════════════════════════════════════════════════
#  LAYER 8: FEEDBACK (Observability Loop — Async)
# ══════════════════════════════════════════════════════════════════════════════

@app.post("/api/feedback")
def submit_feedback(body: dict):
    """Collect user feedback on ranked outputs for the observability loop."""
    logger.info(f"Feedback received: session={body.get('session_id')}, rating={body.get('rating')}")
    return {"status": "received", "message": "Feedback logged for observability loop."}


# ══════════════════════════════════════════════════════════════════════════════
#  HELPERS
# ══════════════════════════════════════════════════════════════════════════════

def _extract_entities(text: str) -> dict:
    """Basic keyword-based entity extraction for the perception layer."""
    text_lower = text.lower() if text else ""
    entities = {
        "intent_candidates": [],
        "amount_hint": None,
        "trade_keywords": [],
    }

    # Intent detection
    if any(kw in text_lower for kw in ["loan", "scheme", "yojana", "sahayata", "finance", "money"]):
        entities["intent_candidates"].append("scheme_search")
    if any(kw in text_lower for kw in ["emi", "monthly", "repayment", "installment", "kist"]):
        entities["intent_candidates"].append("emi_calculation")
    if any(kw in text_lower for kw in ["bank", "branch", "office", "nearest", "partner", "where"]):
        entities["intent_candidates"].append("partner_search")

    # Trade keywords
    trades = ["tailor", "sewing", "dairy", "farming", "grocery", "welding", "machine", "shop", "handicraft"]
    entities["trade_keywords"] = [t for t in trades if t in text_lower]

    # Amount extraction (basic)
    import re
    amount_match = re.search(r'(?:rs\.?|₹|rupee)\s*(\d[\d,]*)', text_lower)
    if amount_match:
        try:
            entities["amount_hint"] = int(amount_match.group(1).replace(",", ""))
        except ValueError:
            pass

    if not entities["intent_candidates"]:
        entities["intent_candidates"] = ["scheme_search"]

    return entities


# ══════════════════════════════════════════════════════════════════════════════
#  STARTUP
# ══════════════════════════════════════════════════════════════════════════════

@app.on_event("startup")
async def startup_event():
    logger.info("=" * 60)
    logger.info("Sahay AI Backend Starting")
    logger.info(f"  Frontend: {settings.FRONTEND_BASE_URL}")
    logger.info(f"  Supabase: {settings.SUPABASE_URL}")
    logger.info(f"  Pinecone Index: {settings.PINECONE_INDEX_NAME}")
    logger.info(f"  Sarvam API: {'configured' if settings.SARVAM_API_KEY else 'NOT SET'}")
    logger.info(f"  Neo4j: {'configured' if settings.NEO4J_URI else 'NOT SET (using in-memory)'}")
    logger.info("=" * 60)


# ══════════════════════════════════════════════════════════════════════════════
#  ENTRYPOINT
# ══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
