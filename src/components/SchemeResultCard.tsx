import React, { useState } from 'react';
import {
  Volume2,
  ChevronDown,
  ChevronUp,
  Coins,
  CheckCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Scheme, LanguageCode } from '../types';
import { translations } from '../i18n/translations';

interface SchemeResultCardProps {
  scheme: Scheme;
  language: LanguageCode;
  isSelectedForCompare: boolean;
  onToggleCompare: (schemeId: string) => void;
  onProceedToEMI: (scheme: Scheme) => void;
  onReadAloud: (text: string) => void;
  isPrimary?: boolean;
}

export const SchemeResultCard: React.FC<SchemeResultCardProps> = ({
  scheme,
  language,
  isSelectedForCompare,
  onToggleCompare,
  onProceedToEMI,
  onReadAloud,
  isPrimary = false,
}) => {
  const [isWhyOpen, setIsWhyOpen] = useState(isPrimary); // Default open for primary scheme
  const t = translations[language];

  const getReasonIcon = (iconType: string) => {
    switch (iconType) {
      case 'income':
        return <Coins className="w-5 h-5 text-amber-600" />;
      case 'project':
        return <Sparkles className="w-5 h-5 text-blue-600" />;
      case 'location':
      case 'caste':
      default:
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
    }
  };

  const formattedAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleReadSummary = (e: React.MouseEvent) => {
    e.stopPropagation();
    const speechText = `${scheme.name}. ${scheme.headline}. ${t.interestRateLabel}: ${scheme.interestRate} percent. ${t.gracePeriodTitle}`;
    onReadAloud(speechText);
  };

  return (
    <div
      className={`w-full bg-white rounded-2xl border-2 transition-all duration-200 overflow-hidden shadow-card ${
        isPrimary
          ? 'border-blue-500 ring-2 ring-blue-500/20'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Top Banner Tag */}
      <div className="bg-slate-50 border-b border-slate-100 px-5 py-3 flex items-center justify-between">
        <span className="text-xs sm:text-sm font-semibold text-blue-800 uppercase tracking-wide">
          🏛️ {scheme.corporation}
        </span>
        <button
          type="button"
          onClick={handleReadSummary}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-700 bg-blue-100/70 hover:bg-blue-200/80 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
          title={t.audioPlayback}
        >
          <Volume2 className="w-4 h-4 text-blue-700" />
          <span>{t.audioPlayback}</span>
        </button>
      </div>

      <div className="p-5 sm:p-6">
        {/* Scheme Name & Recommended Trade */}
        <div className="mb-2">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            {scheme.name}
          </h3>
          <p className="text-sm text-slate-600 font-medium mt-1">
            {scheme.recommendedFor}
          </p>
        </div>

        {/* Hero Plain Language Sentence */}
        <div className="my-4 p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-950">
          <p className="text-lg sm:text-xl font-bold leading-snug">
            {scheme.headline}
          </p>
        </div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-500 font-medium block">
              {t.maxAmountLabel}
            </span>
            <span className="text-lg sm:text-xl font-black text-slate-900">
              {formattedAmount(scheme.maxAmount)}
            </span>
          </div>

          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
            <span className="text-xs text-emerald-700 font-medium block">
              {t.interestRateLabel}
            </span>
            <span className="text-lg sm:text-xl font-black text-emerald-800">
              {scheme.interestRate}% <span className="text-xs font-normal">/ yr</span>
            </span>
          </div>
        </div>

        {/* "Why do I qualify?" Expandable Accordion */}
        <div className="border border-slate-200 rounded-xl overflow-hidden mb-5">
          <button
            type="button"
            onClick={() => setIsWhyOpen(!isWhyOpen)}
            className="w-full flex items-center justify-between p-3.5 bg-slate-50/70 hover:bg-slate-100 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-slate-800 text-base">
                {t.whyDoIQualify}
              </span>
            </div>
            {isWhyOpen ? (
              <ChevronUp className="w-5 h-5 text-slate-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-500" />
            )}
          </button>

          {isWhyOpen && (
            <div className="p-4 bg-white border-t border-slate-100 space-y-3">
              {scheme.whyEligible.map((reason) => (
                <div key={reason.id} className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 bg-slate-100 rounded-lg shrink-0">
                    {getReasonIcon(reason.icon)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {reason.phrase}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {reason.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Near Match / Upsell Alternative if available */}
        {scheme.nearlyEligibleAlternative && (
          <div className="mb-5 p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-950 flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <p className="font-bold text-amber-900">
                {t.nearMatchTitle}
              </p>
              <p className="text-amber-800 mt-0.5">
                {scheme.nearlyEligibleAlternative.requirement} → {scheme.nearlyEligibleAlternative.gain}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons: Compare & Primary CTA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={() => onToggleCompare(scheme.id)}
            className={`px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isSelectedForCompare
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-slate-300 text-slate-700 hover:border-slate-400 bg-white'
            }`}
          >
            {isSelectedForCompare ? '✓ ' + t.selectedForComparison : '+ ' + t.compareButton}
          </button>

          <button
            type="button"
            onClick={() => onProceedToEMI(scheme)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-base cursor-pointer active:scale-98"
          >
            <span>{t.seeEMIButton}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
