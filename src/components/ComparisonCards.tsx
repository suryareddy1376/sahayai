import React from 'react';
import { Calendar, Percent, CreditCard, ShieldCheck, Check } from 'lucide-react';
import { Scheme, EMICalculation, LanguageCode } from '../types';
import { translations } from '../i18n/translations';

interface ComparisonCardsProps {
  schemeA: Scheme;
  calcA: EMICalculation;
  schemeB: Scheme;
  calcB: EMICalculation;
  selectedSchemeId: string;
  onSelectScheme: (scheme: Scheme) => void;
  language: LanguageCode;
}

export const ComparisonCards: React.FC<ComparisonCardsProps> = ({
  schemeA,
  calcA,
  schemeB,
  calcB,
  selectedSchemeId,
  onSelectScheme,
  language,
}) => {
  const t = translations[language];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const schemes = [
    { scheme: schemeA, calc: calcA, label: t.schemeA },
    { scheme: schemeB, calc: calcB, label: t.schemeB },
  ];

  return (
    <div className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-6 my-6">
      <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-4 text-center">
        ⚖️ {t.comparisonHeader}
      </h3>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {schemes.map(({ scheme, calc, label }) => {
          const isSelected = selectedSchemeId === scheme.id;

          return (
            <div
              key={scheme.id}
              onClick={() => onSelectScheme(scheme)}
              className={`rounded-2xl p-3 sm:p-5 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-600 bg-white ring-2 ring-blue-600/20 shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {label}
                  </span>
                  {isSelected ? (
                    <span className="bg-blue-600 text-white rounded-full p-1">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  ) : (
                    <span className="w-5 h-5 rounded-full border border-slate-300 inline-block" />
                  )}
                </div>

                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug mb-4 line-clamp-2 min-h-11">
                  {scheme.name}
                </h4>

                {/* Metric 1: Monthly Payment */}
                <div className="border-t border-slate-100 py-2.5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                    <span>{t.monthlyPaymentLabel}</span>
                  </div>
                  <div className="text-lg sm:text-2xl font-black text-blue-950">
                    {formatCurrency(calc.monthlyEMI)}
                  </div>
                </div>

                {/* Metric 2: First 6 Months ₹0 */}
                <div className="border-t border-slate-100 py-2.5">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mb-0.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t.firstZeroMonths}</span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-emerald-800">
                    ₹0 / {scheme.moratoriumMonths} {t.months}
                  </div>
                </div>

                {/* Metric 3: Interest Rate */}
                <div className="border-t border-slate-100 py-2.5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
                    <Percent className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t.interestRateLabel}</span>
                  </div>
                  <div className="text-base sm:text-lg font-black text-slate-900">
                    {scheme.interestRate}%
                  </div>
                </div>

                {/* Metric 4: Total Payback */}
                <div className="border-t border-slate-100 py-2.5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t.totalRepaymentLabel}</span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-slate-700">
                    {formatCurrency(calc.totalRepayment)}
                  </div>
                </div>
              </div>

              {/* Selection Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectScheme(scheme);
                }}
                className={`mt-4 w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {isSelected ? '✓ ' + t.selectedForComparison : t.selectToCompare}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
