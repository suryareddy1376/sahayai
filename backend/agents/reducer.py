from typing import Dict, Any, List

class ReducerAgent:
    def reduce(self, worker_outputs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Fan-in synthesis. Takes output from all agents and unifies them into an AssistResponse.
        """
        schemes = worker_outputs.get("scheme_match", [])
        emi_data = worker_outputs.get("emi_calculation", {})
        partners = worker_outputs.get("partner_locator", [])
        
        # Deduplication (Ensure unique schemes by ID)
        seen_schemes = set()
        unique_schemes = []
        for s in schemes:
            s_id = s.get("id")
            if s_id not in seen_schemes:
                unique_schemes.append(s)
                seen_schemes.add(s_id)
                
        # Rank Function: Sort partners by distance, and schemes are already ranked by the SchemeMatchAgent.
        # Guardrail #2: Out-of-policy checks (Verify amounts within scheme limits)
        guardrail_flags = []
        
        emi_plans = emi_data.get("plans", []) if isinstance(emi_data, dict) else emi_data
        principal_requested = emi_data.get("principal") if isinstance(emi_data, dict) else None
        
        for plan in emi_plans:
            scheme_id = plan.get("schemeId")
            loan_amt = plan.get("loanAmount")
            
            # Find the corresponding scheme to check limits
            matched_scheme = next((s for s in unique_schemes if s["id"] == scheme_id), None)
            
            if matched_scheme and loan_amt is not None:
                min_amt = matched_scheme.get("minAmount", 0)
                max_amt = matched_scheme.get("maxAmount", float('inf'))
                if loan_amt < min_amt or loan_amt > max_amt:
                    guardrail_flags.append({
                        "type": "OUT_OF_POLICY_AMOUNT",
                        "schemeId": scheme_id,
                        "message": f"Requested amount {loan_amt} is outside scheme limits ({min_amt} - {max_amt})."
                    })

        return {
            "matched_schemes": unique_schemes,
            "emi_plans": emi_plans,
            "comparison_table": emi_data,
            "ranked_partners": partners,
            "citations": ["NBCFDC Directives", "NSFDC official scheme database"],
            "guardrail_flags": guardrail_flags
        }
