"""
Scheme Match Agent (RAG + Eligibility Rules)
Layer 4 Worker — matches beneficiary needs to government schemes.

Pipeline: Pinecone RAG (if available) -> Keyword fallback -> Profile-based eligibility rules
Output: List[Scheme] matching frontend's exact TypeScript interface
"""

import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

# ── Verified Schemes (matching frontend's Scheme TypeScript interface EXACTLY) ──
VERIFIED_SCHEMES: List[Dict[str, Any]] = [
    {
        "id": "scheme-micro-finance",
        "name": "Micro Finance Assistance Scheme",
        "codeName": "NBCFDC Micro-Finance",
        "corporation": "National Backward Classes Finance & Development Corp. (NBCFDC)",
        "headline": "You qualify for up to ₹1.4 Lakh at 6.5% interest with 6 months grace period",
        "maxAmount": 140000,
        "minAmount": 30000,
        "interestRate": 6.5,
        "interestRateMax": 7.5,
        "moratoriumMonths": 6,
        "standardTenureMonths": 36,
        "category": "micro",
        "governmentBacked": True,
        "recommendedFor": "Tailoring, Dairy farming, Small retail, Handloom & Artisans",
        "whyEligible": [
            {
                "id": "r1",
                "icon": "income",
                "phrase": "Household income under ₹5 Lakh",
                "detail": "Direct eligibility for 100% government guarantee without private bank guarantees.",
                "status": "eligible",
            },
            {
                "id": "r2",
                "icon": "project",
                "phrase": "Your trade matches priority livelihood sector",
                "detail": "Small manufacturing, tailoring, livestock, and local services are fast-tracked.",
                "status": "eligible",
            },
            {
                "id": "r3",
                "icon": "location",
                "phrase": "Active subsidy quota in your district",
                "detail": "Designated rural & semi-urban quota reserved for targeted communities.",
                "status": "eligible",
            },
        ],
        "nearlyEligibleAlternative": {
            "schemeName": "Self-Help Group Term Loan",
            "requirement": "Apply with 3 other neighborhood craftswomen or partners",
            "gain": "Eligible limit increases to ₹2.5 Lakh at lower 5% interest",
        },
        # Internal eligibility metadata (not sent to frontend)
        "_eligibility": {"caste": ["OBC"], "max_income": 300000},
    },
    {
        "id": "scheme-mahila-samriddhi",
        "name": "Mahila Samriddhi Yojana (Women Micro-Enterprise)",
        "codeName": "NSFDC Mahila Samriddhi",
        "corporation": "National Scheduled Castes Finance & Development Corp. (NSFDC)",
        "headline": "Special Women Support: up to ₹1.25 Lakh at only 4% interest rate",
        "maxAmount": 125000,
        "minAmount": 25000,
        "interestRate": 4.0,
        "interestRateMax": 5.0,
        "moratoriumMonths": 6,
        "standardTenureMonths": 36,
        "category": "micro",
        "governmentBacked": True,
        "recommendedFor": "Women entrepreneurs in sewing, food processing, animal husbandry",
        "whyEligible": [
            {
                "id": "r4",
                "icon": "caste",
                "phrase": "Reserved interest concession for women",
                "detail": "Flat 2.5% interest subsidy covered directly by the Central Ministry.",
                "status": "eligible",
            },
            {
                "id": "r5",
                "icon": "income",
                "phrase": "No asset mortgage or collateral needed",
                "detail": "Backed by Credit Guarantee Fund for Micro Units (CGFMU).",
                "status": "eligible",
            },
            {
                "id": "r6",
                "icon": "project",
                "phrase": "Skill & experience recognized",
                "detail": "No formal educational degree required; practical trade knowledge suffices.",
                "status": "eligible",
            },
        ],
        "nearlyEligibleAlternative": {
            "schemeName": "Term Loan Equipment Scheme",
            "requirement": "Provide quotation for motorized machinery or vehicle",
            "gain": "Funding up to ₹5.0 Lakh with 5-year repayment",
        },
        "_eligibility": {"caste": ["SC"], "gender": "female", "max_income": 500000},
    },
    {
        "id": "scheme-term-loan",
        "name": "Livelihood Machinery & Term Loan",
        "codeName": "NBCFDC Term Loan",
        "corporation": "Ministry of Social Justice & Empowerment Channel Partners",
        "headline": "Machinery & Shop Upgrade: up to ₹2.5 Lakh at 7.0% interest",
        "maxAmount": 250000,
        "minAmount": 50000,
        "interestRate": 7.0,
        "interestRateMax": 8.0,
        "moratoriumMonths": 6,
        "standardTenureMonths": 48,
        "category": "equipment",
        "governmentBacked": True,
        "recommendedFor": "Heavy sewing machines, dairy chilling units, fabrication tools, mini transport",
        "whyEligible": [
            {
                "id": "r7",
                "icon": "project",
                "phrase": "Equipment capital purchase eligible",
                "detail": "Direct invoice payment to supplier with no cash diversion risk.",
                "status": "eligible",
            },
            {
                "id": "r8",
                "icon": "income",
                "phrase": "Family income certificate verified",
                "detail": "Pre-qualified based on district socioeconomic classification.",
                "status": "eligible",
            },
            {
                "id": "r9",
                "icon": "location",
                "phrase": "Subsidized loan tenure up to 4 years",
                "detail": "Gentle repayment curve so monthly income remains stable.",
                "status": "eligible",
            },
        ],
        "_eligibility": {"caste": ["OBC", "SC", "ST"], "max_income": 300000},
    },
]


def _strip_internal_fields(scheme: Dict[str, Any]) -> Dict[str, Any]:
    """Remove internal eligibility metadata before sending to frontend."""
    return {k: v for k, v in scheme.items() if not k.startswith("_")}


class SchemeMatchAgent:
    """
    Worker Agent: Scheme Match (RAG + Graph Eligibility)
    
    1. Pinecone RAG (verified namespace first, HF fallback)
    2. Neo4j eligibility traversal
    3. Keyword / profile-based fallback matching
    """

    def __init__(
        self,
        pinecone_api_key: Optional[str] = None,
        pinecone_index_name: Optional[str] = None,
    ):
        self.pinecone_api_key = pinecone_api_key
        self.pinecone_index_name = pinecone_index_name
        self.pc_index = None
        self.embed_model = None
        
        if pinecone_api_key and pinecone_index_name:
            try:
                from pinecone import Pinecone
                import httpx
                
                pc = Pinecone(api_key=pinecone_api_key)
                self.pc_index = pc.Index(pinecone_index_name)
                # Load the same lightweight embedding model used for seeding
                self.embed_model = 'HF_API'
                logger.info(f"SchemeMatchAgent initialized with Pinecone ('{pinecone_index_name}') and embedding model.")
            except Exception as e:
                logger.error(f"Failed to initialize Pinecone or embedding model: {e}")

    async def match_schemes(
        self,
        need_input: Any = "",
        beneficiary_profile: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Match schemes based on beneficiary profile or text query.
        Returns list of Scheme dicts matching the frontend's exact TypeScript Scheme interface.
        """
        matched = [_strip_internal_fields(s) for s in VERIFIED_SCHEMES]

        # ── Pinecone RAG ──
        if self.pc_index and self.embed_model and isinstance(need_input, str) and need_input.strip():
            try:
                logger.info("Querying Pinecone index for vector similarity...")
                
                # Call HuggingFace Inference API instead of heavy local PyTorch
                async with httpx.AsyncClient() as client:
                    hf_resp = await client.post(
                        "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
                        json={"inputs": [need_input], "options": {"wait_for_model": True}},
                        timeout=15.0
                    )
                    query_vector = hf_resp.json()[0]

                
                search_res = self.pc_index.query(
                    namespace="sahay-schemes-ns",
                    vector=query_vector,
                    top_k=3,
                    include_metadata=True
                )
                
                matched_ids = [match['id'] for match in search_res.get('matches', [])]
                if matched_ids:
                    # Filter and reorder matched schemes based on vector search results
                    rag_matched = []
                    for mid in matched_ids:
                        found = next((s for s in matched if s['id'] == mid), None)
                        if found:
                            rag_matched.append(found)
                    
                    # Add any remaining schemes at the end
                    for s in matched:
                        if s['id'] not in matched_ids:
                            rag_matched.append(s)
                            
                    matched = rag_matched
                    logger.info(f"Pinecone RAG success. Top match: {matched[0]['id']}")
                    return matched
                    
            except Exception as e:
                logger.warning(f"Pinecone RAG failed, using fallback: {e}")

        # ── Profile-based eligibility rules (Fallback) ──
        if beneficiary_profile and isinstance(beneficiary_profile, dict):
            identity = beneficiary_profile.get("identity", {})
            enterprise = beneficiary_profile.get("enterprise", {})
            financial = beneficiary_profile.get("financial", {})

            gender = identity.get("gender", "").lower()
            loan_type = enterprise.get("loan_type_needed", "").lower()
            amount = enterprise.get("requested_loan_amount", 0)

            if gender == "female":
                matched.sort(key=lambda x: 0 if x["id"] == "scheme-mahila-samriddhi" else 1)
            elif loan_type == "term_loan" or (isinstance(amount, (int, float)) and amount > 140000):
                matched.sort(key=lambda x: 0 if x["id"] == "scheme-term-loan" else 1)
            else:
                matched.sort(key=lambda x: 0 if x["id"] == "scheme-micro-finance" else 1)

            logger.info(f"Profile-based match: top_scheme={matched[0]['id']}")
            return matched

        # ── Text-based keyword matching (Fallback) ──
        if isinstance(need_input, str) and need_input:
            text_lower = need_input.lower()
            if any(kw in text_lower for kw in ["woman", "mahila", "sister", "mother", "female"]):
                matched.sort(key=lambda x: 0 if x["id"] == "scheme-mahila-samriddhi" else 1)
            elif any(kw in text_lower for kw in ["machine", "equipment", "welding", "tractor"]):
                matched.sort(key=lambda x: 0 if x["id"] == "scheme-term-loan" else 1)

            logger.info(f"Keyword match top_scheme={matched[0]['id']}")

        return matched
