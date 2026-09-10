import React from 'react';
import { Mic, Keyboard, ShieldCheck } from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../i18n/translations';
import { LanguageSelector } from '../components/LanguageSelector';
import { TrustBanner } from '../components/TrustBanner';

interface LanguageTrustScreenProps {
  language: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onStartVoice: () => void;
  onStartType: () => void;
  onStartIntake?: () => void;
}

export const LanguageTrustScreen: React.FC<LanguageTrustScreenProps> = ({
  language,
  onSelectLanguage,
  onStartVoice,
  onStartType,
  onStartIntake,
}) => {
  const t = translations[language];

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 pt-2 pb-12">
      {/* App Branding & Emblem */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-900 border border-blue-200 px-3.5 py-1 rounded-full text-xs font-bold tracking-wide">
          <span>🇮🇳</span>
          <span>Ministry of Social Justice & Empowerment</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Sahay AI <span className="text-blue-600">सहाय</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 font-medium">
          Government financial schemes for small craft, shop & trade owners.
        </p>
      </div>

      {/* Language Selection: Icon-first, large tappable cards */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs uppercase tracking-wider font-bold text-slate-500">
            Select Your Language / अपनी भाषा चुनें
          </label>
        </div>
        <LanguageSelector
          selectedLanguage={language}
          onSelect={onSelectLanguage}
        />
      </div>

      {/* Trust Banner: One-line reassurance in large text + icon */}
      <TrustBanner language={language} variant="full" />

      {/* Primary Voice CTA: Big Tap & Speak Button */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-blue-500 shadow-hero text-center space-y-5">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {t.speakPrompt}
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            No typing needed · Speak naturally in your native language
          </p>
        </div>

        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={onStartVoice}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex flex-col items-center justify-center shadow-xl shadow-blue-600/30 ring-4 ring-blue-100 transition-all cursor-pointer active:scale-95"
            aria-label={t.tapToSpeak}
          >
            <Mic className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.5]" />
            <span className="text-[11px] uppercase tracking-wider font-bold mt-1">
              SPEAK
            </span>
          </button>
          <span className="mt-3 text-base sm:text-lg font-bold text-blue-950">
            {t.tapToSpeak}
          </span>
        </div>

        {/* Secondary: Type instead link + Direct Intake Form button */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-2">
          <button
            type="button"
            onClick={onStartType}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors p-2 cursor-pointer"
          >
            <Keyboard className="w-4 h-4" />
            <span>{t.typeInstead}</span>
          </button>
          {onStartIntake && (
            <>
              <span className="hidden sm:inline text-slate-300">·</span>
              <button
                type="button"
                onClick={onStartIntake}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
              >
                <span>📋 Complete Beneficiary Intake Form</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
