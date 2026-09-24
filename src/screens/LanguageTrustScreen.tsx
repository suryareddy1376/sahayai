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

      {/* Action CTA: Proceed to Signup/Auth */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-blue-500 shadow-hero text-center space-y-5">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Welcome to Sahay AI
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Find the right government schemes easily
          </p>
        </div>

        <div className="flex flex-col items-center pt-2">
          <button
            type="button"
            onClick={onStartVoice}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer active:scale-95 text-lg"
          >
            Get Started
          </button>
        </div>
        
        <div className="pt-3 border-t border-slate-100 flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
             <ShieldCheck className="w-4 h-4 text-emerald-600" />
             <span>Secure Citizen Portal</span>
          </div>
        </div>
      </div>
    </div>
  );
};
