import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  UserCheck,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { translations } from '../i18n/translations';
import { LanguageCode, BeneficiaryIntakeResponse } from '../types';
import { BeneficiaryIntakeForm } from '../components/BeneficiaryIntakeForm';
import { useAppContext } from '../context/AppContext';

export interface ProfileSetupScreenProps {
  /**
   * Callback fired when the beneficiary profile intake form is successfully submitted.
   * Delivers the validated BeneficiaryIntakeResponse for downstream scheme matching and navigation.
   */
  onProfileComplete?: (response: BeneficiaryIntakeResponse) => void;
  /** Current language code (defaults to 'hi' to match SAHAY AI standard) */
  language?: LanguageCode;
  /** Optional initial need or occupation text pre-filled from earlier voice/search input */
  initialNeedText?: string;
  /** Optional callback to return to the previous screen or authentication */
  onBack?: () => void;
}

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({
  onProfileComplete,
  language = 'hi',
  initialNeedText = '',
  onBack,
}) => {
  const t = translations[language];
  const { beneficiaryProfile } = useAppContext();
  
  const handleIntakeComplete = (response: BeneficiaryIntakeResponse) => {
    if (onProfileComplete) {
      onProfileComplete(response);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 pt-2 pb-16 px-4 sm:px-0">
      {/* Optional Back Navigation */}
      {onBack && (
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>
      )}

      {/* SAHAY AI Branding Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-900 border border-blue-200 px-3.5 py-1 rounded-full text-xs font-bold tracking-wide shadow-xs">
          <span>🇮🇳</span>
          <span>Ministry of Social Justice & Empowerment</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Sahay AI <span className="text-blue-600">सहाय</span>
        </h1>

        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-600" />
            <span>Complete Your Profile</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-medium max-w-lg mx-auto leading-relaxed">
            Please fill in your basic enterprise, financial, and trade details below.
            This information will be used to accurately match you with eligible government schemes,
            subsidies, and concessional loans.
          </p>
        </div>
      </div>

      {/* Trust & Data Security Reassurance Strip */}
      <div className="bg-gradient-to-r from-blue-50 via-slate-50 to-emerald-50 border border-blue-100 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700 shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-semibold">Direct Citizen Portal</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-600 shrink-0" />
          <span>Role-Based Access Protected</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold text-emerald-800">100% Free Scheme Matching</span>
        </div>
      </div>

      {/* Existing Beneficiary Intake Form Component */}
      <BeneficiaryIntakeForm
        language={language}
        initialNeedText={initialNeedText}
        initialData={beneficiaryProfile || undefined}
        onIntakeComplete={handleIntakeComplete}
      />
    </div>
  );
};
