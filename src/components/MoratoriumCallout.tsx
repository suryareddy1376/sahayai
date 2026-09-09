import React from 'react';
import { Calendar, Sparkles, CheckCircle2 } from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../i18n/translations';

interface MoratoriumCalloutProps {
  months: number;
  language: LanguageCode;
  className?: string;
}

export const MoratoriumCallout: React.FC<MoratoriumCalloutProps> = ({
  months = 6,
  language,
  className = '',
}) => {
  const t = translations[language];

  return (
    <div
      className={`w-full bg-linear-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="bg-white/20 p-3 rounded-2xl shrink-0 backdrop-blur-xs">
          <Calendar className="w-8 h-8 text-white stroke-[2.2]" />
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1 text-emerald-200 text-xs uppercase tracking-wider font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.firstZeroMonths}</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-1.5">
            {t.gracePeriodTitle}
          </h3>

          <p className="text-emerald-50 text-sm sm:text-base leading-relaxed">
            {t.gracePeriodDescription}
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold text-white">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>0% penalty · Official government relaxation window</span>
          </div>
        </div>
      </div>
    </div>
  );
};
