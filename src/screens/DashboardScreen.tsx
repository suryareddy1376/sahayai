import React from 'react';
import {
  Sparkles,
  Calculator,
  MapPin,
  ClipboardList,
  LogOut,
  User,
  Edit3,
  ArrowRight,
  CheckCircle2,
  Mic,
} from 'lucide-react';
import { BeneficiaryProfile, LanguageCode } from '../types';

export interface DashboardScreenProps {
  /** Optional beneficiary profile; fallback placeholder displayed if null/undefined */
  profile?: BeneficiaryProfile | null;
  /** Language code if passed (default: 'hi') */
  language?: LanguageCode;
  /** Navigation callbacks */
  onFindSchemes?: () => void;
  onEditProfile?: () => void;
  onEMICalculator?: () => void;
  onPartnerLocator?: () => void;
  onApplicationTracker?: () => void;
  onLogout?: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  profile,
  onFindSchemes,
  onEditProfile,
  onEMICalculator,
  onPartnerLocator,
  onApplicationTracker,
  onLogout,
}) => {
  const beneficiaryName = profile?.identity?.full_name?.trim();
  const sector = profile?.enterprise?.business_sector;
  const loanType = profile?.enterprise?.loan_type_needed?.replace('_', ' ');
  const loanAmount = profile?.enterprise?.requested_loan_amount;
  const locationParts = [
    profile?.location?.village_or_town,
    profile?.location?.district,
    profile?.location?.state,
  ].filter(Boolean);
  const locationText = locationParts.length > 0 ? locationParts.join(', ') : null;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pt-2 pb-16 px-4 sm:px-6">
      {/* Top Header Bar: SAHAY AI Branding & Logout */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-900 border border-blue-200 px-3 py-0.5 rounded-full text-xs font-bold tracking-wide shadow-xs">
            <span>SAHAY AI</span>
            <span>·</span>
            <span>Scheme Discovery Assistant</span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Sahay AI <span className="text-blue-600">सहाय</span>
            </h1>
            <span className="text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
              Dashboard
            </span>
          </div>
        </div>

        {onLogout && (
          <div className="flex items-center self-end sm:self-center">
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-red-200 transition-all cursor-pointer"
              aria-label="Log out of Sahay AI"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </header>

      {/* Welcome Banner */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-hero relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Profile Complete</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-3xl font-black tracking-tight">
              Welcome{beneficiaryName ? `, ${beneficiaryName}` : ''}!
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm font-normal max-w-xl leading-relaxed">
              Profile information ready for scheme matching. You can discover matching schemes,
              estimate loan EMIs, locate partner branches, and track submitted applications.
            </p>
          </div>
        </div>
      </section>

      {/* Beneficiary Profile Summary Card */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Beneficiary Profile Summary
              </h3>
              <p className="text-xs text-slate-500">
                Data used for scheme matching and eligibility estimation
              </p>
            </div>
          </div>

          {onEditProfile && (
            <button
              type="button"
              onClick={onEditProfile}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {profile ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs sm:text-sm">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Beneficiary Name
              </span>
              <p className="font-bold text-slate-900 truncate">
                {profile.identity?.full_name || 'Not provided'}
              </p>
              <span className="inline-block text-[10px] font-semibold text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded-md">
                {profile.identity?.gender ? profile.identity.gender.toUpperCase() : 'Profile on file'}
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Enterprise Sector
              </span>
              <p className="font-bold text-slate-900 capitalize truncate">
                {sector ? sector : 'Not provided'}
              </p>
              <span className="text-[11px] text-slate-500 capitalize block truncate">
                {loanType ? loanType : 'Not provided'}
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Requested Credit
              </span>
              <p className="font-bold text-blue-700 text-base">
                {loanAmount ? `₹${loanAmount.toLocaleString('en-IN')}` : 'Not provided'}
              </p>
              <span className="text-[10px] text-slate-500">
                Annual Income: {profile.financial?.annual_family_income ? `₹${profile.financial.annual_family_income.toLocaleString('en-IN')}` : 'Not provided'}
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Registered Location
              </span>
              <p className="font-bold text-slate-900 truncate" title={locationText || 'Not provided'}>
                {locationText || 'Not provided'}
              </p>
              <span className="text-[10px] text-slate-500">
                PIN: {profile.location?.pincode || 'Not provided'}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-slate-900">
                Your profile is ready
              </p>
              <p className="text-xs text-slate-500">
                Profile information ready for scheme matching. You can review or update your details anytime.
              </p>
            </div>
            {onEditProfile && (
              <button
                type="button"
                onClick={onEditProfile}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                Configure Details →
              </button>
            )}
          </div>
        )}
      </section>

      {/* Primary Action Card: Find Government Schemes */}
      <section>
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-7 text-white shadow-hero flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Recommended Action</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black">
              Find Government Schemes
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
              Explore eligible Central & State schemes including NBCFDC, NSFDC, Mudra, and PMEGP.
              Compare estimated interest rates, subsidies, and moratorium terms for your business need.
            </p>
          </div>

          <button
            type="button"
            onClick={onFindSchemes}
            className="w-full sm:w-auto bg-white hover:bg-slate-100 text-blue-900 font-black py-3.5 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer shrink-0 active:scale-98"
            title="Open Voice and Text Query input to describe your livelihood need"
          >
            <Mic className="w-4 h-4 text-blue-600" />
            <span>Speak or Search Need</span>
            <ArrowRight className="w-4 h-4 text-blue-600" />
          </button>
        </div>
      </section>

      {/* Secondary Action / Quick Tools Grid */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
          Explore Services & Tools
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: EMI Calculator */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-5 flex flex-col justify-between hover:border-blue-300 transition-all">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                <Calculator className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">
                  EMI Calculator
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Estimate monthly installments with applicable interest rates and moratorium grace periods.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onEMICalculator}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-800 hover:text-blue-700 text-xs font-bold transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>Calculate Repayment</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Card 2: Partner Locator */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-5 flex flex-col justify-between hover:border-blue-300 transition-all">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">
                  Partner Locator
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Locate nearby nationalized banks, state channel partners, and rural development bank branches.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onPartnerLocator}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 text-xs font-bold transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>Find Nearby Banks</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Card 3: Application Tracker */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-5 flex flex-col justify-between hover:border-blue-300 transition-all">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">
                  Application Tracker
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Track the progress and review stages of your submitted scheme applications.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onApplicationTracker}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-800 hover:text-indigo-700 text-xs font-bold transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>Check Application Status</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-center text-xs text-slate-600">
        <p>
          Need help? Please refer to the relevant official scheme or department website.
        </p>
      </footer>
    </div>
  );
};
