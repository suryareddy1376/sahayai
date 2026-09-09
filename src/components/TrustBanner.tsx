import React from 'react';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../i18n/translations';

interface TrustBannerProps {
  language: LanguageCode;
  variant?: 'compact' | 'full';
  className?: string;
}

export const TrustBanner: React.FC<TrustBannerProps> = ({
  language,
  variant = 'compact',
  className = '',
}) => {
  const t = translations[language];

  if (variant === 'compact') {
    return (
      <div
        className={`w-full bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-emerald-950 ${className}`}
      >
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-600 text-white p-1.5 rounded-lg shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <p className="text-xs sm:text-sm font-medium leading-tight">
            {t.trustTitle} · <span className="text-emerald-800">{t.noFeeBadge}</span>
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-xs text-emerald-800 font-medium shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>{t.ministryBadge}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full bg-linear-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-5 sm:p-6 shadow-trust relative overflow-hidden ${className}`}
    >
      {/* Subtle national emblem emblem background watermark */}
      <div className="absolute right-3 -bottom-6 opacity-10 text-8xl select-none pointer-events-none">
        🇮🇳
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t.ministryBadge}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-200 border border-blue-500/30">
            <Lock className="w-3 h-3" />
            {t.noFeeBadge}
          </span>
        </div>

        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mb-1.5 flex items-center gap-2">
          <span>🔒</span> {t.trustTitle}
        </h2>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          {t.trustSubtitle}
        </p>
      </div>
    </div>
  );
};
