import React, { useState } from 'react';
import {
  PhoneCall,
  MapPin,
  FileText,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { PartnerBranch, LanguageCode } from '../types';
import { translations } from '../i18n/translations';

interface PartnerCardProps {
  partner: PartnerBranch;
  isSelected: boolean;
  onSelect: (partner: PartnerBranch) => void;
  onConfirmApply: (partner: PartnerBranch) => void;
  language: LanguageCode;
}

export const PartnerCard: React.FC<PartnerCardProps> = ({
  partner,
  isSelected,
  onSelect,
  onConfirmApply,
  language,
}) => {
  const [showDocs, setShowDocs] = useState(isSelected);
  const t = translations[language];

  return (
    <div
      onClick={() => onSelect(partner)}
      className={`w-full bg-white rounded-2xl border-2 transition-all duration-200 overflow-hidden cursor-pointer shadow-card ${
        isSelected
          ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-md'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Status Badge Header */}
      <div className="bg-slate-50 px-4 sm:px-5 py-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {partner.isNextNearestFallback ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              📍 {t.nextNearestBadge}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
              {t.activeStatusBadge}
            </span>
          )}
        </div>

        <span className="text-sm font-extrabold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
          📍 {partner.distanceKm} km
        </span>
      </div>

      <div className="p-4 sm:p-5">
        {/* Branch Name & Address */}
        <div className="mb-3">
          <h4 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
            {partner.name}
          </h4>
          <p className="text-xs sm:text-sm font-semibold text-blue-700 mt-0.5">
            {partner.branchName} · {partner.partnerType}
          </p>
          <div className="flex items-start gap-1.5 text-xs sm:text-sm text-slate-600 mt-2">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>{partner.address}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{partner.hours}</span>
          </div>
        </div>

        {/* Tap to Call & Quick Contact */}
        <div className="my-3 flex items-center gap-3">
          <a
            href={`tel:${partner.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 text-emerald-700" />
            <span>{t.callBranchCTA}</span>
          </a>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowDocs(!showDocs);
            }}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span>{t.docsToCarryTitle}</span>
            {showDocs ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>

        {/* Documents to Carry Checklist Accordion */}
        {showDocs && (
          <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t.docsToCarryTitle}</span>
            </div>
            {partner.documentsToCarry.map((doc, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-800">
                <span className="text-emerald-700 font-bold">✓</span>
                <span>{doc}</span>
              </div>
            ))}
          </div>
        )}

        {/* Primary Selection & Apply CTA */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onConfirmApply(partner);
            }}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-base cursor-pointer active:scale-98"
          >
            <span>{t.applyHereCTA}</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
