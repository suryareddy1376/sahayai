import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  LanguageCode,
  Scheme,
  EMICalculation,
  PartnerBranch,
  ApplicationTrackerData,
  BeneficiaryProfile,
  BeneficiaryIntakeResponse,
  MultimodalQuery,
} from '../types';

interface AppContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  beneficiaryProfile: BeneficiaryProfile | null;
  setBeneficiaryProfile: (profile: BeneficiaryProfile | null) => void;
  intakeResponse: BeneficiaryIntakeResponse | null;
  setIntakeResponse: (response: BeneficiaryIntakeResponse | null) => void;
  matchedSchemes: Scheme[];
  setMatchedSchemes: (schemes: Scheme[]) => void;
  selectedScheme: Scheme | null;
  setSelectedScheme: (scheme: Scheme | null) => void;
  compareScheme: Scheme | null;
  setCompareScheme: (scheme: Scheme | null) => void;
  emiData: EMICalculation | null;
  setEmiData: (data: EMICalculation | null) => void;
  selectedPartner: PartnerBranch | null;
  setSelectedPartner: (partner: PartnerBranch | null) => void;
  submittedApp: ApplicationTrackerData | null;
  setSubmittedApp: (app: ApplicationTrackerData | null) => void;
  userNeedText: string;
  setUserNeedText: (text: string) => void;
  activeQuery: MultimodalQuery | null;
  setActiveQuery: (query: MultimodalQuery | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<LanguageCode>('hi');
  const [beneficiaryProfile, setBeneficiaryProfile] = useState<BeneficiaryProfile | null>(null);
  const [intakeResponse, setIntakeResponse] = useState<BeneficiaryIntakeResponse | null>(null);
  
  const [matchedSchemes, setMatchedSchemes] = useState<Scheme[]>([]);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [compareScheme, setCompareScheme] = useState<Scheme | null>(null);
  
  const [emiData, setEmiData] = useState<EMICalculation | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<PartnerBranch | null>(null);
  const [submittedApp, setSubmittedApp] = useState<ApplicationTrackerData | null>(null);
  
  const [userNeedText, setUserNeedText] = useState<string>('');
  const [activeQuery, setActiveQuery] = useState<MultimodalQuery | null>(null);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        beneficiaryProfile,
        setBeneficiaryProfile,
        intakeResponse,
        setIntakeResponse,
        matchedSchemes,
        setMatchedSchemes,
        selectedScheme,
        setSelectedScheme,
        compareScheme,
        setCompareScheme,
        emiData,
        setEmiData,
        selectedPartner,
        setSelectedPartner,
        submittedApp,
        setSubmittedApp,
        userNeedText,
        setUserNeedText,
        activeQuery,
        setActiveQuery,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
