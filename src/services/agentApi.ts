import { Scheme, EMICalculation, PartnerBranch, ApplicationTrackerData, BeneficiaryProfile } from '../types';

// Centralised API URL definition
const _rawUrl = (import.meta as any).env?.VITE_BACKEND_URL || 'https://sahayai-4dzp.onrender.com';
const BACKEND_URL = _rawUrl.endsWith('/') ? _rawUrl.slice(0, -1) : _rawUrl;

// Application submission simulator with real backend integration
export async function submitApplication(
  scheme: Scheme,
  emiData: EMICalculation,
  partner: PartnerBranch,
  phone: string,
  whatsappAlert: boolean
): Promise<{ success: boolean; applicationId: string; receipt: ApplicationTrackerData }> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheme, emiData, partner, phone, whatsappAlert }),
    });
    
    if (!response.ok) {
      throw new Error("Failed to submit application");
    }
    
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Submission failed:", err);
    throw err;
  }
}

export function getCachedApplication(): ApplicationTrackerData | null {
  return null; // Local caching removed for strict API dependence
}

export async function matchSchemesAgent(
  needInput: string | BeneficiaryProfile,
  language: string = 'en'
): Promise<Scheme[]> {
  try {
    const payload = {
      session_id: `ses_${Date.now()}`,
      need_input: needInput,
      lang: language
    };

    const response = await fetch(`${BACKEND_URL}/api/assist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    return data.matched_schemes || [];
  } catch (error) {
    console.error("Network error hitting backend for schemes:", error);
    throw error;
  }
}

export function calculateEMIAgent(
  scheme: Scheme,
  principal: number,
  tenureMonths: number
): EMICalculation {
  const r = (scheme.interestRate / 100) / 12;
  const n = tenureMonths;
  const emi = r === 0 
    ? principal / n 
    : (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  
  const monthlyEMI = Math.round(emi);
  const totalRepayment = monthlyEMI * n;
  const totalInterest = totalRepayment - principal;
  
  return {
    schemeId: scheme.id,
    schemeName: scheme.name,
    loanAmount: principal,
    tenureMonths,
    interestRate: scheme.interestRate,
    monthlyEMI,
    moratoriumMonths: scheme.moratoriumMonths,
    totalRepayment,
    totalInterest,
  };
}

export async function locatePartnersAgent(schemeId?: string): Promise<PartnerBranch[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/partners?lat=28.6139&lon=77.2090`);
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    const data = await response.json();
    return data.ranked_partners || [];
  } catch (error) {
    console.error("Network error locating partners:", error);
    throw error;
  }
}
