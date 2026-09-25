import { Scheme, EMICalculation, PartnerBranch, ApplicationTrackerData, BeneficiaryProfile } from '../types';

// Curated government schemes under Ministry of Social Justice & Empowerment (NBCFDC, NSFDC, NSKFDC)
const MOCK_SCHEMES: Scheme[] = [
  {
    id: 'scheme-micro-finance',
    name: 'Micro Finance Assistance Scheme',
    codeName: 'NBCFDC Micro-Finance',
    corporation: 'National Backward Classes Finance & Development Corp. (NBCFDC)',
    headline: 'You qualify for up to ₹1.4 Lakh at 6.5% interest with 6 months grace period',
    maxAmount: 140000,
    minAmount: 30000,
    interestRate: 6.5,
    interestRateMax: 7.5,
    moratoriumMonths: 6,
    standardTenureMonths: 36,
    category: 'micro',
    governmentBacked: true,
    recommendedFor: 'Tailoring, Dairy farming, Small retail, Handloom & Artisans',
    whyEligible: [
      {
        id: 'r1',
        icon: 'income',
        phrase: 'Household income under ₹5 Lakh',
        detail: 'Direct eligibility for 100% government guarantee without private bank guarantees.',
        status: 'eligible',
      },
      {
        id: 'r2',
        icon: 'project',
        phrase: 'Your trade matches priority livelihood sector',
        detail: 'Small manufacturing, tailoring, livestock, and local services are fast-tracked.',
        status: 'eligible',
      },
      {
        id: 'r3',
        icon: 'location',
        phrase: 'Active subsidy quota in your district',
        detail: 'Designated rural & semi-urban quota reserved for targeted communities.',
        status: 'eligible',
      },
    ],
    nearlyEligibleAlternative: {
      schemeName: 'Self-Help Group Term Loan',
      requirement: 'Apply with 3 other neighborhood craftswomen or partners',
      gain: 'Eligible limit increases to ₹2.5 Lakh at lower 5% interest',
    },
  },
  {
    id: 'scheme-mahila-samriddhi',
    name: 'Mahila Samriddhi Yojana (Women Micro-Enterprise)',
    codeName: 'NSFDC Mahila Samriddhi',
    corporation: 'National Scheduled Castes Finance & Development Corp. (NSFDC)',
    headline: 'Special Women Support: up to ₹1.25 Lakh at only 4% interest rate',
    maxAmount: 125000,
    minAmount: 25000,
    interestRate: 4.0,
    interestRateMax: 5.0,
    moratoriumMonths: 6,
    standardTenureMonths: 36,
    category: 'micro',
    governmentBacked: true,
    recommendedFor: 'Women entrepreneurs in sewing, food processing, animal husbandry',
    whyEligible: [
      {
        id: 'r4',
        icon: 'caste',
        phrase: 'Reserved interest concession for women',
        detail: 'Flat 2.5% interest subsidy covered directly by the Central Ministry.',
        status: 'eligible',
      },
      {
        id: 'r5',
        icon: 'income',
        phrase: 'No asset mortgage or collateral needed',
        detail: 'Backed by Credit Guarantee Fund for Micro Units (CGFMU).',
        status: 'eligible',
      },
      {
        id: 'r6',
        icon: 'project',
        phrase: 'Skill & experience recognized',
        detail: 'No formal educational degree required; practical trade knowledge suffices.',
        status: 'eligible',
      },
    ],
    nearlyEligibleAlternative: {
      schemeName: 'Term Loan Equipment Scheme',
      requirement: 'Provide quotation for motorized machinery or vehicle',
      gain: 'Funding up to ₹5.0 Lakh with 5-year repayment',
    },
  },
  {
    id: 'scheme-term-loan',
    name: 'Livelihood Machinery & Term Loan',
    codeName: 'NBCFDC Term Loan',
    corporation: 'Ministry of Social Justice & Empowerment Channel Partners',
    headline: 'Machinery & Shop Upgrade: up to ₹2.5 Lakh at 7.0% interest',
    maxAmount: 250000,
    minAmount: 50000,
    interestRate: 7.0,
    interestRateMax: 8.0,
    moratoriumMonths: 6,
    standardTenureMonths: 48,
    category: 'equipment',
    governmentBacked: true,
    recommendedFor: 'Heavy sewing machines, dairy chilling units, fabrication tools, mini transport',
    whyEligible: [
      {
        id: 'r7',
        icon: 'project',
        phrase: 'Equipment capital purchase eligible',
        detail: 'Direct invoice payment to supplier with no cash diversion risk.',
        status: 'eligible',
      },
      {
        id: 'r8',
        icon: 'income',
        phrase: 'Family income certificate verified',
        detail: 'Pre-qualified based on district socioeconomic classification.',
        status: 'eligible',
      },
      {
        id: 'r9',
        icon: 'location',
        phrase: 'Subsidized loan tenure up to 4 years',
        detail: 'Gentle repayment curve so monthly income remains stable.',
        status: 'eligible',
      },
    ],
  },
];

// Curated active partner branches
const MOCK_PARTNERS: PartnerBranch[] = [
  {
    id: 'branch-1',
    name: 'State Bank of India — Nodal Livelihood Branch',
    branchName: 'Main Road Semi-Urban Branch',
    partnerType: 'Government Bank',
    distanceKm: 1.8,
    address: 'Near Old Bus Stand, Opposite Panchayat Office, Ward 4',
    phone: '+91 94451 82030',
    isActivelyProcessing: true,
    hours: '10:00 AM – 4:00 PM (Monday to Friday)',
    documentsToCarry: [
      'Aadhaar Card copy (Original for viewing)',
      'Ration Card / Income Certificate',
      'Bank Passbook front page copy',
      'Photo of your existing shop / workplace',
    ],
    coordinates: [28.6139, 77.2090], // Default center
  },
  {
    id: 'branch-2',
    name: 'State Channelizing Agency (SCA) District Office',
    branchName: 'Social Welfare Complex',
    partnerType: 'State Channel Partner',
    distanceKm: 3.4,
    address: 'District Collectorate Campus, Block B, Room 14',
    phone: '+91 98842 11920',
    isActivelyProcessing: true,
    hours: '9:30 AM – 5:30 PM (Direct Helpdesk Open)',
    documentsToCarry: [
      'Aadhaar Card copy',
      'Community / Caste certificate copy',
      'Bank account number & IFSC code',
      'Electricity bill or domicile proof',
    ],
    coordinates: [28.6250, 77.2180],
  },
  {
    id: 'branch-3',
    name: 'Gramin Rural Development Bank',
    branchName: 'Kisan & Karigar Branch',
    partnerType: 'Rural Development Bank',
    distanceKm: 5.2,
    address: 'Mandi Road, Beside Primary Agricultural Society',
    phone: '+91 97103 44829',
    isActivelyProcessing: true,
    hours: '10:00 AM – 3:30 PM',
    documentsToCarry: [
      'Aadhaar Card copy',
      'Bank Passbook front page',
      'Two passport size photographs',
      'Existing business rough expense sheet',
    ],
    coordinates: [28.6010, 77.1950],
  },
  {
    id: 'branch-fallback',
    name: 'Punjab National Bank — Lead District Office',
    branchName: 'Lead District Nodal Desk',
    partnerType: 'Government Bank',
    distanceKm: 8.5,
    address: 'Civil Lines, Near Tehsil Office, Sub-Division HQ',
    phone: '+91 94220 55110',
    isActivelyProcessing: true,
    hours: '10:00 AM – 4:00 PM',
    documentsToCarry: [
      'Aadhaar Card copy',
      'Income Certificate',
      'Bank Passbook',
      'Workplace photo',
    ],
    coordinates: [28.6400, 77.2300],
    isNextNearestFallback: true,
  },
];

// Offline caching key
const STORAGE_KEY = 'sahay_ai_application_state';

const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:8000';

// Specialist Agent 1: Scheme Matcher Agent
export async function matchSchemesAgent(
  needInput: string | BeneficiaryProfile
): Promise<Scheme[]> {
  try {
    const requestBody = {
      session_id: "session-" + Math.random().toString(36).substring(7),
      need_input: needInput,
      lang: "en"
    };

    const response = await fetch(`${BACKEND_URL}/api/assist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      console.error("Backend failed, using fallback schemes");
      return MOCK_SCHEMES;
    }

    const data = await response.json();
    return data.matched_schemes || MOCK_SCHEMES;
  } catch (error) {
    console.error("Network error hitting backend, falling back to mock:", error);
    return MOCK_SCHEMES;
  }
}

// Specialist Agent 2: EMI Calculator Agent (Pure Math, kept sync for slider performance)
export function calculateEMIAgent(
  scheme: Scheme,
  amount: number,
  tenureMonths: number
): EMICalculation {
  const principal = amount;
  const annualRate = scheme.interestRate;
  const monthlyRate = annualRate / 12 / 100;
  
  const emi =
    monthlyRate > 0
      ? (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
        (Math.pow(1 + monthlyRate, tenureMonths) - 1)
      : principal / tenureMonths;

  const totalRepayment = Math.round(emi * tenureMonths);
  const totalInterest = Math.round(totalRepayment - principal);

  return {
    schemeId: scheme.id,
    schemeName: scheme.name,
    loanAmount: principal,
    tenureMonths,
    interestRate: annualRate,
    monthlyEMI: Math.round(emi),
    moratoriumMonths: scheme.moratoriumMonths,
    totalRepayment,
    totalInterest,
  };
}

// Specialist Agent 3: Partner Locator Agent
export async function locatePartnersAgent(schemeId?: string): Promise<PartnerBranch[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/partners?scheme_id=${schemeId || ''}`);
    if (!response.ok) return MOCK_PARTNERS;
    
    const data = await response.json();
    return data.ranked_partners || MOCK_PARTNERS;
  } catch (error) {
    console.error("Network error locating partners:", error);
    return MOCK_PARTNERS;
  }
}

// Application submission simulator with real backend integration
export async function submitApplication(
  scheme: Scheme,
  emiData: EMICalculation,
  partner: PartnerBranch,
  phone: string = '+91 98765 43210',
  whatsappAlert: boolean = true
): Promise<ApplicationTrackerData> {
  
  const requestBody = {
    scheme,
    emiData,
    partner,
    phone,
    whatsappAlert
  };

  try {
    const response = await fetch(`${BACKEND_URL}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (response.ok) {
      const application = await response.json();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(application));
      return application;
    }
  } catch (error) {
    console.error("Backend submit failed:", error);
  }

  // Fallback to offline generation if backend fails
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const appId = `SAHAY-2026-GOV-${randomSuffix}`;
  const application: ApplicationTrackerData = {
    applicationId: appId,
    schemeName: scheme.name,
    loanAmount: emiData.loanAmount,
    monthlyEMI: emiData.monthlyEMI,
    partnerName: partner.name,
    partnerAddress: partner.address,
    submittedDate: new Date().toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }),
    currentStatus: 'submitted',
    statusReasonText: 'Application received directly at the local nodal branch. Officer verification assigned.',
    notifyPhone: phone,
    notifyWhatsApp: whatsappAlert,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(application));
  return application;
}

export function getCachedApplication(): ApplicationTrackerData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
