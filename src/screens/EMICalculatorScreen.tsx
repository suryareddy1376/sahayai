import React, { useState } from 'react';
import { Scheme, EMICalculation, LanguageCode } from '../types';
import { translations } from '../i18n/translations';
import { EMIHeroNumber } from '../components/EMIHeroNumber';
import { MoratoriumCallout } from '../components/MoratoriumCallout';
import { ComparisonCards } from '../components/ComparisonCards';
import { TrustBanner } from '../components/TrustBanner';
import { getTranslatedSchemes, translateSchemeText } from '../i18n/schemeTranslations';
import { calculateEMIAgent } from '../services/agentApi';

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
  const translatedSchemeA = getTranslatedSchemes([scheme], language)[0];
  const translatedSchemeB = secondScheme ? getTranslatedSchemes([secondScheme], language)[0] : null;

  const [activeScheme, setActiveScheme] = useState<Scheme>(translatedSchemeA);
  const [amount, setAmount] = useState<number>(Math.min(80000, scheme.maxAmount));
  const [tenure, setTenure] = useState<number>(36);

  React.useEffect(() => {
    setActiveScheme((prev) => 
      prev.id === translatedSchemeA.id ? translatedSchemeA : (translatedSchemeB || translatedSchemeA)
    );
  }, [language, translatedSchemeA, translatedSchemeB]);

  const calcA = calculateEMIAgent(activeScheme, amount, tenure);
  const calcB = translatedSchemeB ? calculateEMIAgent(translatedSchemeB, amount, tenure) : null;

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
      {translatedSchemeB && calcB && (
        <ComparisonCards
          schemeA={translatedSchemeA}
          calcA={calculateEMIAgent(translatedSchemeA, amount, tenure)}
          schemeB={translatedSchemeB}
          calcB={calcB}
          selectedSchemeId={activeScheme.id}
          onSelectScheme={handleSelectSchemeInCompare}
          language={language}
        />
      )}
    </div>
  );
};
