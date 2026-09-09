import React, { useState } from 'react';
import { Scheme, EMICalculation, LanguageCode } from '../types';
import { translations } from '../i18n/translations';
import { EMIHeroNumber } from '../components/EMIHeroNumber';
import { MoratoriumCallout } from '../components/MoratoriumCallout';
import { ComparisonCards } from '../components/ComparisonCards';
import { TrustBanner } from '../components/TrustBanner';
import { calculateEMIAgent } from '../services/mockAgentApi';

interface EMICalculatorScreenProps {
  scheme: Scheme;
  secondScheme?: Scheme | null;
  language: LanguageCode;
  onProceedToPartner: (calculation: EMICalculation) => void;
  onReadAloud: (text: string) => void;
}

export const EMICalculatorScreen: React.FC<EMICalculatorScreenProps> = ({
  scheme,
  secondScheme = null,
  language,
  onProceedToPartner,
  onReadAloud,
}) => {
  const [activeScheme, setActiveScheme] = useState<Scheme>(scheme);
  const [amount, setAmount] = useState<number>(Math.min(80000, scheme.maxAmount));
  const [tenure, setTenure] = useState<number>(36);

  const calcA = calculateEMIAgent(activeScheme, amount, tenure);
  const calcB = secondScheme ? calculateEMIAgent(secondScheme, amount, tenure) : null;

  const handleSelectSchemeInCompare = (newScheme: Scheme) => {
    setActiveScheme(newScheme);
  };

  const handleContinue = () => {
    onProceedToPartner(calcA);
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 pt-2 pb-16">
      <TrustBanner language={language} variant="compact" />

      {/* Moratorium Grace Period Highlight (Deciding factor for users) */}
      <MoratoriumCallout
        months={activeScheme.moratoriumMonths}
        language={language}
      />

      {/* Main EMI Hero & Steppers */}
      <EMIHeroNumber
        scheme={activeScheme}
        calculation={calcA}
        amount={amount}
        tenure={tenure}
        language={language}
        onAmountChange={setAmount}
        onTenureChange={setTenure}
        onProceedToPartner={handleContinue}
        onReadAloud={onReadAloud}
      />

      {/* Side-by-side comparison cards if 2 schemes are selected */}
      {secondScheme && calcB && (
        <ComparisonCards
          schemeA={scheme}
          calcA={calculateEMIAgent(scheme, amount, tenure)}
          schemeB={secondScheme}
          calcB={calcB}
          selectedSchemeId={activeScheme.id}
          onSelectScheme={handleSelectSchemeInCompare}
          language={language}
        />
      )}
    </div>
  );
};
