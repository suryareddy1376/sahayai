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
  const [beneficiaryProfile, _setBeneficiaryProfile] = useState<BeneficiaryProfile | null>(() => {
    const saved = localStorage.getItem('sahay_beneficiary_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  
  const setBeneficiaryProfile = (profile: BeneficiaryProfile | null) => {
    _setBeneficiaryProfile(profile);
    if (profile) {
      localStorage.setItem('sahay_beneficiary_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('sahay_beneficiary_profile');
    }
  };

  const [intakeResponse, setIntakeResponse] = useState<BeneficiaryIntakeResponse | null>(null);
  
  const [matchedSchemes, setMatchedSchemes] = useState<Scheme[]>([]);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [compareScheme, setCompareScheme] = useState<Scheme | null>(null);
  
  const [emiData, setEmiData] = useState<EMICalculation | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<PartnerBranch | null>(null);
  
  const [submittedApp, _setSubmittedApp] = useState<ApplicationTrackerData | null>(() => {
    try {
      const cached = localStorage.getItem('sahay_application');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return null;
  });

  const setSubmittedApp = (app: ApplicationTrackerData | null) => {
    _setSubmittedApp(app);
    if (app) {
      localStorage.setItem('sahay_application', JSON.stringify(app));
    } else {
      localStorage.removeItem('sahay_application');
    }
  };
  
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
