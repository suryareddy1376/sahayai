import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Send,
  MessageSquare,
  Share2,
  RotateCcw,
  Building2,
  Calendar,
  CreditCard,
  BellRing,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ApplicationTrackerData, LanguageCode } from '../types';
import { translations } from '../i18n/translations';

interface StatusTimelineProps {
  application: ApplicationTrackerData;
  language: LanguageCode;
  onStartNew: () => void;
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  application,
  language,
  onStartNew,
}) => {
  const t = translations[language];
  const [whatsappActive, setWhatsappActive] = useState(application.notifyWhatsApp);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fire celebratory confetti (UPI transaction style)
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#16a34a', '#2563eb', '#f59e0b'],
      });
    } catch (e) {
      // ignore
    }
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleCopyOrShare = async () => {
    const text = `Sahay AI Application Ref: ${application.applicationId}\nScheme: ${application.schemeName}\nPartner: ${application.partnerName}\nStatus: Submitted`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Sahay AI Application Receipt',
          text,
        });
      } catch (err) {
        // fallback
      }
    } else {
      navigator.clipboard?.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // 3 Clear stages (Grade 5 reading level, zero jargon)
  const stages = [
    {
      id: 'step-1',
      title: t.stageSubmitted,
      description: t.submittedDesc,
      status: 'completed',
      date: application.submittedDate,
      icon: <Send className="w-5 h-5 text-white" />,
      color: 'bg-emerald-600',
    },
    {
      id: 'step-2',
      title: t.stageReview,
      description: application.statusReasonText || t.reviewDesc,
      status: 'active',
      date: 'In Progress (Usually 48 hours)',
      icon: <Clock className="w-5 h-5 text-white animate-spin" />,
      color: 'bg-blue-600',
    },
    {
      id: 'step-3',
      title: t.stageApproved,
      description: t.approvedDesc,
      status: 'pending',
      date: 'Direct DBT to Bank Account',
      icon: <CheckCircle2 className="w-5 h-5 text-slate-400" />,
      color: 'bg-slate-300',
    },
  ];

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* UPI Receipt Style Card */}
      <div className="bg-white rounded-3xl border-2 border-emerald-500 shadow-xl overflow-hidden text-center relative">
        {/* Top Green Accent Header */}
        <div className="bg-emerald-600 text-white p-6 sm:p-8">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600 shadow-lg ring-4 ring-emerald-400/30">
            <CheckCircle2 className="w-10 h-10 stroke-[2.8]" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            {t.confirmedTitle}
          </h2>
          <p className="text-emerald-100 text-sm mt-1.5 font-medium">
            {t.confirmedSubtitle}
          </p>
        </div>

        {/* UPI Transaction ID / Ref Number Display */}
        <div className="p-6 bg-slate-50 border-b border-dashed border-slate-300">
          <span className="text-xs uppercase tracking-wider font-bold text-slate-500 block mb-1">
            {t.receiptNumberLabel}
          </span>
          <div className="bg-white border-2 border-blue-400 rounded-2xl py-3 px-4 inline-block shadow-xs">
            <span className="text-xl sm:text-2xl font-mono font-black text-blue-950 tracking-wider">
              {application.applicationId}
            </span>
          </div>

          {/* Quick Summary Grid */}
          <div className="grid grid-cols-2 gap-3 mt-4 text-left">
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1 mb-1">
                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                <span>{t.loanAmountQuestion}</span>
              </span>
              <p className="text-base sm:text-lg font-black text-slate-900">
                {formatCurrency(application.loanAmount)}
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1 mb-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.monthlyPaymentLabel}</span>
              </span>
              <p className="text-base sm:text-lg font-black text-slate-900">
                {formatCurrency(application.monthlyEMI)} / mo
              </p>
            </div>
          </div>

          {/* Partner Info */}
          <div className="mt-3 bg-white p-3 rounded-xl border border-slate-200 text-left flex items-start gap-2.5">
            <Building2 className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-slate-900">
                {application.partnerName}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                {application.partnerAddress}
              </p>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="p-6 text-left">
          <h3 className="text-sm uppercase font-bold text-slate-500 tracking-wider mb-4">
            {t.timelineTitle}
          </h3>

          <div className="space-y-6 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {stages.map((stage) => (
              <div key={stage.id} className="relative flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm z-10 ${stage.color}`}
                >
                  {stage.icon}
                </div>

                <div className="flex-1 pt-0.5">
                  <div className="flex items-baseline justify-between flex-wrap gap-1">
                    <h4 className="text-base font-black text-slate-900">
                      {stage.title}
                    </h4>
                    <span className="text-xs font-semibold text-slate-400">
                      {stage.date}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    {stage.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SMS / WhatsApp Updates Preference Toggle */}
        <div className="p-5 bg-emerald-50/70 border-t border-emerald-200 text-left flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-600 text-white p-2 rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-emerald-950">
                WhatsApp & SMS Alerts
              </p>
              <p className="text-[11px] text-emerald-800">
                {application.notifyPhone}
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={whatsappActive}
              onChange={(e) => setWhatsappActive(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>
      </div>

      {/* Share / Save & Start New Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={handleCopyOrShare}
          className="w-full sm:flex-1 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 font-bold py-3.5 px-4 rounded-2xl transition-colors flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
        >
          <Share2 className="w-4 h-4 text-blue-600" />
          <span>{copied ? '✓ Copied Reference ID' : t.saveReceiptButton}</span>
        </button>

        <button
          type="button"
          onClick={onStartNew}
          className="w-full sm:flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 px-4 rounded-2xl transition-colors flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t.startNewButton}</span>
        </button>
      </div>
    </div>
  );
};
