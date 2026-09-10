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
        className={`w-full bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex items-center justify-between text-emerald-950 shadow-xs ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 text-white p-1.5 rounded-xl shrink-0 shadow-xs">
            <Lock className="w-4 h-4" />
          </div>
          <p className="text-xs sm:text-sm font-semibold leading-tight text-emerald-950">
            {t.trustTitle} · <span className="text-emerald-700 font-bold">{t.noFeeBadge}</span>
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-800 font-bold shrink-0 bg-emerald-100/70 px-2.5 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>{t.ministryBadge}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-blue-900/60 shadow-hero relative overflow-hidden ${className}`}
    >
      {/* Subtle national emblem watermark */}
      <div className="absolute right-2 -bottom-6 opacity-10 text-8xl sm:text-9xl select-none pointer-events-none">
        🇮🇳
      </div>

      <div className="relative z-10 space-y-3">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 backdrop-blur-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            {t.ministryBadge}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-200 border border-blue-400/40 backdrop-blur-xs">
            <Lock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            {t.noFeeBadge}
          </span>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 shrink-0" />
            <span>{t.trustTitle}</span>
          </h2>
          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-normal">
            {t.trustSubtitle}
          </p>
        </div>

        {/* 3 Reassurance Pillars */}
        <div className="pt-2 border-t border-white/10 grid grid-cols-3 gap-2 text-[11px] font-semibold text-slate-300">
          <div className="flex items-center gap-1">
            <span className="text-emerald-400">✓</span>
            <span className="truncate">Direct Quota</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-emerald-400">✓</span>
            <span className="truncate">No Agents</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-emerald-400">✓</span>
            <span className="truncate">DPDP Safe</span>
          </div>
        </div>
      </div>
    </div>
  );
};
