import React, { useState } from 'react';
import { Volume2, ArrowRight, Sparkles, Scale } from 'lucide-react';
import { Scheme, LanguageCode, BeneficiaryProfile } from '../types';
import { translations } from '../i18n/translations';
import { getTranslatedSchemes } from '../i18n/schemeTranslations';
import { SchemeResultCard } from '../components/SchemeResultCard';
import { TrustBanner } from '../components/TrustBanner';

interface SchemeResultsScreenProps {
  schemes: Scheme[];
  language: LanguageCode;
  onSelectScheme: (scheme: Scheme) => void;
  onCompareSchemes: (schemeA: Scheme, schemeB: Scheme) => void;
  onReadAloud: (text: string) => void;
  beneficiaryProfile?: BeneficiaryProfile | null;
}

export const SchemeResultsScreen: React.FC<SchemeResultsScreenProps> = ({
  schemes,
  language,
  onSelectScheme,
  onCompareSchemes,
  onReadAloud,
  beneficiaryProfile,
}) => {
  const t = translations[language];
  const translatedSchemes = getTranslatedSchemes(schemes, language);
  const [selectedForCompareIds, setSelectedForCompareIds] = useState<string[]>([]);

  const toggleCompare = (schemeId: string) => {
    if (selectedForCompareIds.includes(schemeId)) {
      setSelectedForCompareIds(selectedForCompareIds.filter((id) => id !== schemeId));
    } else {
      if (selectedForCompareIds.length < 2) {
        setSelectedForCompareIds([...selectedForCompareIds, schemeId]);
      } else {
        // Keep the latest two
        setSelectedForCompareIds([selectedForCompareIds[1], schemeId]);
      }
    }
  };

  const handleReadHero = () => {
    onReadAloud(t.schemeHeroTitle);
  };

  const handleStartComparison = () => {
    if (selectedForCompareIds.length === 2) {
      const schemeA = translatedSchemes.find((s) => s.id === selectedForCompareIds[0]);
      const schemeB = translatedSchemes.find((s) => s.id === selectedForCompareIds[1]);
      if (schemeA && schemeB) {
        onCompareSchemes(schemeA, schemeB);
      }
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 pt-2 pb-24">
      <TrustBanner language={language} variant="compact" />

      {/* Hero Headline Box */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-trust space-y-3">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-500/30 text-blue-200 border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI MATCH VERIFIED</span>
          </span>

          <button
            type="button"
            onClick={handleReadHero}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full cursor-pointer transition-colors"
            title={t.audioPlayback}
          >
            <Volume2 className="w-4 h-4" />
            <span>{t.audioPlayback}</span>
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black leading-tight text-white">
          {t.schemeHeroTitle}
        </h1>

        <p className="text-xs sm:text-sm text-blue-200 font-medium">
          Matches your small trade profile with zero collateral requirements.
        </p>

        {beneficiaryProfile && (
          <div className="mt-3 pt-3 border-t border-white/15 text-xs space-y-1.5 animate-in fade-in">
            <div className="flex flex-wrap items-center justify-between gap-1 text-blue-100 font-bold">
              <span>👤 Profile: {beneficiaryProfile.identity.full_name} ({beneficiaryProfile.identity.gender})</span>
              <span className="bg-emerald-500/25 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-md font-mono text-[10px]">
                🌿 Neo4j Graph Linked (2 Schemes)
              </span>
            </div>
            <p className="text-slate-300 text-[11px]">
              Sector: {beneficiaryProfile.enterprise.business_sector} · Loan: ₹{beneficiaryProfile.enterprise.requested_loan_amount.toLocaleString('en-IN')} · PIN: {beneficiaryProfile.location.pincode}
            </p>
          </div>
        )}
      </div>

      {/* Scheme Cards Stack */}
      <div className="space-y-4">
        {translatedSchemes.map((scheme, idx) => (
          <SchemeResultCard
            key={scheme.id}
            scheme={scheme}
            language={language}
            isPrimary={idx === 0}
            isSelectedForCompare={selectedForCompareIds.includes(scheme.id)}
            onToggleCompare={toggleCompare}
            onProceedToEMI={onSelectScheme}
            onReadAloud={onReadAloud}
          />
        ))}
      </div>

      {/* Floating Comparison Bar if 2 schemes are selected */}
      {selectedForCompareIds.length === 2 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-40 animate-in slide-in-from-bottom-5">
          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-3 border-2 border-blue-500">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-400 shrink-0" />
              <span className="text-xs sm:text-sm font-bold">
                2 Schemes Selected
              </span>
            </div>

            <button
              type="button"
              onClick={handleStartComparison}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-black py-2.5 px-4 rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>{t.compareButton}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
