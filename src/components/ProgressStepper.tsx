import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../i18n/translations';

interface ProgressStepperProps {
  currentStep: number; // 1 to 6
  totalSteps?: number;
  language: LanguageCode;
  onBack?: () => void;
  canGoBack?: boolean;
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  currentStep,
  totalSteps = 6,
  language,
  onBack,
  canGoBack = false,
}) => {
  const t = translations[language];

  const stepLabels = [
    t.step1,
    t.step2,
    t.step3,
    t.step4,
    t.step5,
    t.step6,
  ];

  return (
    <div className="w-full bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-2xl mx-auto px-4 py-3">
        {/* Top row: Back button + Step indicator */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {canGoBack && currentStep > 1 && (
              <button
                onClick={onBack}
                aria-label={t.back}
                className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.back}</span>
              </button>
            )}
            <span className="text-xs uppercase tracking-wider font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
              {t.stepOf} {currentStep} / {totalSteps}
            </span>
          </div>

          <span className="text-sm font-medium text-slate-600 truncate max-w-[180px] sm:max-w-none">
            {stepLabels[currentStep - 1]}
          </span>
        </div>

        {/* Progress Bar (UPI payment flow inspired) */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
          {Array.from({ length: totalSteps }).map((_, idx) => {
            const isCompleted = idx + 1 < currentStep;
            const isCurrent = idx + 1 === currentStep;

            return (
              <div
                key={idx}
                className={`h-full flex-1 transition-all duration-300 border-r border-white last:border-r-0 ${
                  isCompleted
                    ? 'bg-emerald-600'
                    : isCurrent
                    ? 'bg-blue-600'
                    : 'bg-slate-200'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
