import math
from typing import List, Dict, Any

class EMICalculatorAgent:
    def calculate(self, scheme_id: str, scheme_name: str, principal: float, tenure_months: int, interest_rate: float, moratorium_months: int = 0) -> Dict[str, Any]:
        """
        Standard reducing-balance EMI formula: EMI = P*r*(1+r)^n / ((1+r)^n - 1)
        """
        # Ensure non-zero or negative inputs are handled gracefully
        if tenure_months <= 0:
            tenure_months = 1
        
        monthly_rate = (interest_rate / 12) / 100
        
        if monthly_rate == 0:
            monthly_emi = principal / tenure_months
        else:
            factor = math.pow(1 + monthly_rate, tenure_months)
            monthly_emi = (principal * monthly_rate * factor) / (factor - 1)
            
        total_repayment = monthly_emi * tenure_months
        total_interest = total_repayment - principal
        
        return {
            "schemeId": scheme_id,
            "schemeName": scheme_name,
            "loanAmount": round(principal),
            "tenureMonths": tenure_months,
            "interestRate": interest_rate,
            "monthlyEMI": round(monthly_emi),
            "moratoriumMonths": moratorium_months,
            "totalRepayment": round(total_repayment),
            "totalInterest": round(total_interest)
        }

    def calculate_comparison(self, schemes: List[Dict[str, Any]], principal: float) -> Dict[str, Any]:
        """
        Calculates EMI for a list of schemes based on a single principal amount to compare them.
        """
        comparison_results = []
        for scheme in schemes:
            emi_details = self.calculate(
                scheme_id=scheme.get("id"),
                scheme_name=scheme.get("codeName"),
                principal=principal,
                tenure_months=scheme.get("standardTenureMonths", 36),
                interest_rate=scheme.get("interestRate", 0),
                moratorium_months=scheme.get("moratoriumMonths", 0)
            )
            comparison_results.append(emi_details)
            
        return {
            "principal": round(principal),
            "plans": comparison_results
        }
