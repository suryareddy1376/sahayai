import logging

logger = logging.getLogger(__name__)

class JevStubRouter:
    def classify_and_route(self, perception_result: dict, context_ref: str) -> list[dict]:
        text = str(perception_result.get('text', '') or perception_result.get('text_en', '')).lower()
        
        # Guardrail #1
        out_of_scope_keywords = ['kill', 'violence', 'abuse', 'hack']
        if any(kw in text for kw in out_of_scope_keywords):
            return [{"slice": "none", "guardrail_blocked": True, "guardrail_message": "I cannot help with that request."}]

        tasks = []
        
        # Intent rules
        scheme_keywords = ['loan', 'scheme', 'yojana', 'sahayata', 'finance']
        emi_keywords = ['emi', 'monthly', 'repayment', 'installment']
        partner_keywords = ['bank', 'branch', 'office', 'nearest', 'partner']
        
        has_scheme = any(kw in text for kw in scheme_keywords)
        has_emi = any(kw in text for kw in emi_keywords)
        has_partner = any(kw in text for kw in partner_keywords)
        
        if not (has_scheme or has_emi or has_partner):
            # Default
            tasks.extend([
                {"slice": "scheme_match"},
                {"slice": "emi_calculation"},
                {"slice": "partner_locator"}
            ])
        else:
            if has_scheme:
                tasks.append({"slice": "scheme_match"})
            if has_emi:
                tasks.append({"slice": "emi_calculation"})
            if has_partner:
                tasks.append({"slice": "partner_locator"})
                
        # Always returns at least scheme_match
        if not any(t.get("slice") == "scheme_match" for t in tasks):
            tasks.insert(0, {"slice": "scheme_match"})

        return tasks

class JevModelRouter:
    def __init__(self):
        self.stub_router = JevStubRouter()
        
    def classify_and_route(self, perception_result: dict, context_ref: str) -> list[dict]:
        return self.stub_router.classify_and_route(perception_result, context_ref)
