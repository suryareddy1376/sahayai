import React from 'react';
import { Minus, Plus, Volume2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { EMICalculation, Scheme, LanguageCode } from '../types';
import { translations } from '../i18n/translations';

interface EMIHeroNumberProps {
  scheme: Scheme;
  calculation: EMICalculation;
  amount: number;
  tenure: number;
  language: LanguageCode;
  onAmountChange: (amount: number) => void;
  onTenureChange: (tenure: number) => void;
  onProceedToPartner: () => void;
  onReadAloud: (text: string) => void;
}

export const EMIHeroNumber: React.FC<EMIHeroNumberProps> = ({
  scheme,
  calculation,
  amount,
  tenure,
  language,
  onAmountChange,
  onTenureChange,
  onProceedToPartner,
  onReadAloud,
}) => {
  const t = translations[language];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleReadEMI = () => {
    const text = `${t.monthlyPaymentLabel}: ${calculation.monthlyEMI} rupees per month. For a loan of ${amount} rupees over ${tenure} months. First 6 months zero payment.`;
    onReadAloud(text);
  };

  const presetAmounts = [50000, 80000, 100000, 140000];
  const tenureOptions = [12, 24, 36, 48];

  return (
    <div className="w-full space-y-6">
      {/* Hero Monthly EMI Card */}
      <div className="bg-white border-2 border-blue-500 rounded-3xl p-6 sm:p-8 text-center shadow-hero relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
            {scheme.name}
          </span>
          <button
            type="button"
            onClick={handleReadEMI}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full cursor-pointer"
            title={t.audioPlayback}
          >
            <Volume2 className="w-4 h-4 text-blue-600" />
            <span>{t.audioPlayback}</span>
          </button>
        </div>

        <p className="text-sm sm:text-base font-semibold text-slate-500 mt-2">
          {t.monthlyPaymentLabel}
        </p>

        {/* Big EMI Hero Number */}
        <div className="my-3">
          <motion.div
            key={calculation.monthlyEMI}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="text-4xl sm:text-6xl font-black tracking-tight text-blue-950"
          >
            {formatCurrency(calculation.monthlyEMI)}
            <span className="text-base sm:text-xl font-bold text-slate-500 ml-2">
              / {t.months}
            </span>
          </motion.div>
        </div>

        {/* Small reassurance tag under hero number */}
        <p className="text-xs sm:text-sm text-slate-600 font-medium">
          {t.interestRateLabel}: <strong className="text-slate-900">{scheme.interestRate}%</strong> · {t.totalRepaymentLabel}:{' '}
          <strong className="text-slate-900">{formatCurrency(calculation.totalRepayment)}</strong>
        </p>
      </div>

      {/* Stepper Control 1: Loan Amount */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <label className="block text-sm sm:text-base font-bold text-slate-800 mb-3">
          💰 {t.loanAmountQuestion}
        </label>

        <div className="flex items-center justify-between gap-3 mb-4">
          <button
            type="button"
            onClick={() => onAmountChange(Math.max(scheme.minAmount, amount - 10000))}
            className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xl cursor-pointer active:scale-95 shrink-0"
            aria-label="Decrease amount"
          >
            <Minus className="w-6 h-6" />
          </button>

          <div className="flex-1 text-center py-2 px-3 bg-blue-50/50 rounded-xl border border-blue-100">
            <span className="text-2xl sm:text-3xl font-black text-blue-950">
              {formatCurrency(amount)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onAmountChange(Math.min(scheme.maxAmount, amount + 10000))}
            className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xl cursor-pointer active:scale-95 shrink-0"
            aria-label="Increase amount"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Quick Amount Preset Chips */}
        <div className="grid grid-cols-4 gap-2">
          {presetAmounts.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onAmountChange(preset)}
              className={`py-2 px-1 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                amount === preset
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              ₹{(preset / 1000)}k
            </button>
          ))}
        </div>
      </div>

      {/* Stepper Control 2: Tenure */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <label className="block text-sm sm:text-base font-bold text-slate-800 mb-3">
          ⏱️ {t.tenureQuestion}
        </label>

        <div className="grid grid-cols-4 gap-2.5">
          {tenureOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onTenureChange(opt)}
              className={`py-3 px-2 rounded-xl text-center border-2 transition-all cursor-pointer ${
                tenure === opt
                  ? 'border-blue-600 bg-blue-50 text-blue-900 font-black'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 font-semibold'
              }`}
            >
              <div className="text-lg leading-none">{opt}</div>
              <div className="text-[11px] text-slate-500 mt-1">{t.months}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Primary Action Button */}
      <button
        type="button"
        onClick={onProceedToPartner}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-3 text-lg cursor-pointer active:scale-98"
      >
        <span>{t.findPartnerCTA}</span>
        <ArrowRight className="w-6 h-6 stroke-[2.5]" />
      </button>
    </div>
  );
};
