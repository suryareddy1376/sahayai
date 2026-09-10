export type LanguageCode = 'hi' | 'en' | 'bn' | 'mr' | 'te' | 'ta' | 'gu' | 'ur' | 'kn' | 'od' | 'ml';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  greeting: string;
}

export interface EligibilityReason {
  id: string;
  icon: 'income' | 'project' | 'location' | 'caste' | 'age';
  phrase: string;
  detail: string;
  status: 'eligible' | 'close';
}

export interface Scheme {
  id: string;
  name: string;
  codeName: string;
  corporation: string; // e.g. "NBCFDC (National Backward Classes Finance & Development Corp)" or "NSFDC"
  headline: string; // Plain language hero sentence: "You qualify for up to ₹1.4 lakh at 6.5% interest"
  maxAmount: number;
  minAmount: number;
  interestRate: number; // in percentage e.g. 6.5
  interestRateMax?: number;
  moratoriumMonths: number; // 6 months grace period
  standardTenureMonths: number; // e.g. 36
  category: 'micro' | 'term' | 'equipment';
  whyEligible: EligibilityReason[];
  nearlyEligibleAlternative?: {
    schemeName: string;
    requirement: string;
    gain: string;
  };
  recommendedFor: string;
  governmentBacked: boolean;
}

export interface EMICalculation {
  schemeId: string;
  schemeName: string;
  loanAmount: number;
  tenureMonths: number;
  interestRate: number;
  monthlyEMI: number;
  moratoriumMonths: number; // Grace period with zero payment
  totalRepayment: number;
  totalInterest: number;
}

export interface PartnerBranch {
  id: string;
  name: string;
  branchName: string;
  partnerType: 'Government Bank' | 'State Channel Partner' | 'Rural Development Bank';
  distanceKm: number;
  address: string;
  phone: string;
  isActivelyProcessing: boolean; // 🟢 Actively accepting applications right now
  hours: string;
  documentsToCarry: string[];
  coordinates: [number, number]; // [lat, lng]
  isNextNearestFallback?: boolean;
}

export interface ApplicationTrackerData {
  applicationId: string;
  schemeName: string;
  loanAmount: number;
  monthlyEMI: number;
  partnerName: string;
  partnerAddress: string;
  submittedDate: string;
  currentStatus: 'submitted' | 'under_review' | 'approved';
  statusReasonText: string;
  notifyPhone: string;
  notifyWhatsApp: boolean;
}

export * from './beneficiary';
