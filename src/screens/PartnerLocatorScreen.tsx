import React, { useState, useEffect } from 'react';
import { List, Map as MapIcon, ShieldCheck, Sparkles, Building2 } from 'lucide-react';
import { PartnerBranch, Scheme, EMICalculation, LanguageCode } from '../types';
import { translations } from '../i18n/translations';
import { PartnerCard } from '../components/PartnerCard';
import { PartnerMap } from '../components/PartnerMap';
import { TrustBanner } from '../components/TrustBanner';
import { locatePartnersAgent } from '../services/mockAgentApi';

interface PartnerLocatorScreenProps {
  scheme: Scheme;
  calculation: EMICalculation;
  language: LanguageCode;
  onConfirmPartner: (partner: PartnerBranch) => void;
}

export const PartnerLocatorScreen: React.FC<PartnerLocatorScreenProps> = ({
  scheme,
  calculation,
  language,
  onConfirmPartner,
}) => {
  const t = translations[language];
  const [partners, setPartners] = useState<PartnerBranch[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<PartnerBranch | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list'); // List is primary
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPartners() {
      setIsLoading(true);
      const data = await locatePartnersAgent(scheme.id);
      setPartners(data);
      if (data.length > 0) {
        setSelectedPartner(data[0]);
      }
      setIsLoading(false);
    }
    loadPartners();
  }, [scheme.id]);

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin mx-auto" />
        <p className="text-lg font-bold text-slate-800">
          Locating actively processing branches near you…
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 pt-2 pb-16">
      <TrustBanner language={language} variant="compact" />

      {/* Screen Title & View Switcher */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {t.partnerTitle}
          </h1>
          <p className="text-slate-600 text-sm font-medium mt-0.5">
            {t.partnerSubtitle}
          </p>
        </div>

        {/* List / Map Switcher (List is primary) */}
        <div className="bg-slate-200/80 p-1 rounded-xl flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>{t.viewList}</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'map'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>{t.viewMap}</span>
          </button>
        </div>
      </div>

      {/* Map View Toggle */}
      {viewMode === 'map' && (
        <div className="space-y-3">
          <PartnerMap
            partners={partners}
            selectedPartnerId={selectedPartner?.id || ''}
            onSelectPartner={setSelectedPartner}
          />
          <p className="text-xs text-center text-slate-500 font-medium">
            Tap any pin on the map to view branch contact details below
          </p>
        </div>
      )}

      {/* Primary List View */}
      <div className="space-y-4">
        {partners.map((partner) => (
          <PartnerCard
            key={partner.id}
            partner={partner}
            isSelected={selectedPartner?.id === partner.id}
            onSelect={setSelectedPartner}
            onConfirmApply={onConfirmPartner}
            language={language}
          />
        ))}
      </div>
    </div>
  );
};
