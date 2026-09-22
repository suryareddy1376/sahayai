import React, { useState, useEffect } from 'react';
import {
  VolumeX,
  Globe,
  WifiOff,
  HelpCircle,
} from 'lucide-react';
import {
  LanguageCode,
  Scheme,
  EMICalculation,
  PartnerBranch,
  ApplicationTrackerData,
  BeneficiaryProfile,
  BeneficiaryIntakeResponse,
} from './types';
import { LANGUAGES } from './i18n/translations';
import { useVoice } from './hooks/useVoice';
import { matchSchemesAgent, submitApplication, getCachedApplication } from './services/mockAgentApi';
import { ProgressStepper } from './components/ProgressStepper';

// Screens
import { AuthenticationScreen } from './screens/AuthenticationScreen';
import { ProfileSetupScreen } from './screens/ProfileSetupScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { LanguageTrustScreen } from './screens/LanguageTrustScreen';
import { SpeakNeedScreen } from './screens/SpeakNeedScreen';
import { SchemeResultsScreen } from './screens/SchemeResultsScreen';
import { EMICalculatorScreen } from './screens/EMICalculatorScreen';
import { PartnerLocatorScreen } from './screens/PartnerLocatorScreen';
import { ConfirmationTrackerScreen } from './screens/ConfirmationTrackerScreen';

type AppStage = 'auth' | 'profile' | 'dashboard' | 'existing-flow';

export function App() {
  const [appStage, setAppStage] = useState<AppStage>('auth');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [language, setLanguage] = useState<LanguageCode>('hi'); // Default Hindi for target audience
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  // Flow State
  const [userNeedText, setUserNeedText] = useState<string>('');
  const [isLoadingSchemes, setIsLoadingSchemes] = useState<boolean>(false);
  const [matchedSchemes, setMatchedSchemes] = useState<Scheme[]>([]);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [compareScheme, setCompareScheme] = useState<Scheme | null>(null);
  const [emiData, setEmiData] = useState<EMICalculation | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<PartnerBranch | null>(null);
  const [submittedApp, setSubmittedApp] = useState<ApplicationTrackerData | null>(null);
  const [beneficiaryProfile, setBeneficiaryProfile] = useState<BeneficiaryProfile | null>(null);
  const [intakeResponse, setIntakeResponse] = useState<BeneficiaryIntakeResponse | null>(null);
  const [intakeMode, setIntakeMode] = useState<'voice' | 'form'>('voice');

  const {
    isListening,
    transcript,
    setTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSpeaking,
    speakText,
    stopSpeaking,
    errorMessage,
    audioLevel,
  } = useVoice(language);

  // Offline detection
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for cached application on mount
    const cached = getCachedApplication();
    if (cached) {
      // User can resume or view
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Flow Handlers
  const handleStartVoiceFromLanding = () => {
    setIntakeMode('voice');
    setCurrentStep(2);
    startListening();
  };

  const handleStartTypeFromLanding = () => {
    setIntakeMode('voice');
    setCurrentStep(2);
  };

  const handleStartIntakeFromLanding = () => {
    setIntakeMode('form');
    setCurrentStep(2);
  };

  const handleSubmitNeed = async (text: string) => {
    stopListening();
    setUserNeedText(text);
    setIsLoadingSchemes(true);
    try {
      const results = await matchSchemesAgent(text);
      setMatchedSchemes(results);
      if (results.length > 0) {
        setSelectedScheme(results[0]);
      }
      setCurrentStep(3);
    } catch (err) {
      console.error('Scheme match error:', err);
    } finally {
      setIsLoadingSchemes(false);
    }
  };

  const handleBeneficiaryIntakeComplete = async (response: BeneficiaryIntakeResponse) => {
    setIntakeResponse(response);
    setBeneficiaryProfile(response.beneficiary);
    setUserNeedText(
      `${response.beneficiary.enterprise.business_sector} loan of ₹${response.beneficiary.enterprise.requested_loan_amount}`
    );
    setIsLoadingSchemes(true);
    try {
      // Passes structured profile to downstream scheme matching agent
      const results = await matchSchemesAgent(response.beneficiary);
      setMatchedSchemes(results);
      if (results.length > 0) {
        setSelectedScheme(results[0]);
      }
      setCurrentStep(3);
    } catch (err) {
      console.error('Scheme match error:', err);
    } finally {
      setIsLoadingSchemes(false);
    }
  };

  const handleSelectSchemeForEMI = (scheme: Scheme) => {
    setSelectedScheme(scheme);
    setCompareScheme(null);
    setCurrentStep(4);
  };

  const handleCompareSchemes = (schemeA: Scheme, schemeB: Scheme) => {
    setSelectedScheme(schemeA);
    setCompareScheme(schemeB);
    setCurrentStep(4);
  };

  const handleProceedToPartner = (calc: EMICalculation) => {
    setEmiData(calc);
    setCurrentStep(5);
  };

  const handleConfirmPartner = (partner: PartnerBranch) => {
    setSelectedPartner(partner);
    if (selectedScheme && emiData) {
      const application = submitApplication(selectedScheme, emiData, partner);
      setSubmittedApp(application);
      setCurrentStep(6);
    }
  };

  const handleStartNewApplication = () => {
    setCurrentStep(1);
    setUserNeedText('');
    resetTranscript();
    setSelectedScheme(null);
    setCompareScheme(null);
    setEmiData(null);
    setSelectedPartner(null);
    setSubmittedApp(null);
    setBeneficiaryProfile(null);
    setIntakeResponse(null);
    stopSpeaking();
  };

  const handleGoBack = () => {
    stopSpeaking();
    stopListening();
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFindSchemesFromDashboard = async () => {
    let needQuery = 'Government scheme financial support';
    if (beneficiaryProfile) {
      const parts: string[] = [];
      if (beneficiaryProfile.identity?.gender === 'female') {
        parts.push('woman entrepreneur');
      }
      if (beneficiaryProfile.enterprise?.business_sector) {
        parts.push(beneficiaryProfile.enterprise.business_sector);
      }
      if (beneficiaryProfile.enterprise?.loan_type_needed) {
        parts.push(beneficiaryProfile.enterprise.loan_type_needed.replace('_', ' '));
      }
      if (beneficiaryProfile.enterprise?.requested_loan_amount) {
        parts.push(`loan of ₹${beneficiaryProfile.enterprise.requested_loan_amount}`);
      }
      if (parts.length > 0) {
        needQuery = parts.join(' ');
      }
    }

    setUserNeedText(needQuery);
    setIsLoadingSchemes(true);

    try {
      const results = await matchSchemesAgent(needQuery);
      setMatchedSchemes(results);
      if (results.length > 0) {
        setSelectedScheme(results[0]);
      }
      setCurrentStep(3);
      setAppStage('existing-flow');
    } catch (err) {
      console.error('Scheme match error:', err);
      setCurrentStep(3);
      setAppStage('existing-flow');
    } finally {
      setIsLoadingSchemes(false);
    }
  };

  // Outer Flow Stage Renderers
  if (appStage === 'auth') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 py-6 px-4">
        <AuthenticationScreen
          onAuthenticated={() => setAppStage('profile')}
        />
      </div>
    );
  }

  if (appStage === 'profile') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 py-6 px-4">
        <ProfileSetupScreen
          language={language}
          onProfileComplete={(response) => {
            setIntakeResponse(response);
            setBeneficiaryProfile(response.beneficiary);
            setAppStage('dashboard');
          }}
          onBack={() => setAppStage('auth')}
        />
      </div>
    );
  }

  if (appStage === 'dashboard') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 py-6 px-4">
        <DashboardScreen
          profile={beneficiaryProfile}
          language={language}
          onEditProfile={() => setAppStage('profile')}
          onLogout={() => {
            setBeneficiaryProfile(null);
            setIntakeResponse(null);
            setAppStage('auth');
          }}
          onFindSchemes={handleFindSchemesFromDashboard}
          onEMICalculator={() => {
            setCurrentStep(1);
            setAppStage('existing-flow');
          }}
          onPartnerLocator={() => {
            setCurrentStep(1);
            setAppStage('existing-flow');
          }}
          onApplicationTracker={() => {
            setCurrentStep(1);
            setAppStage('existing-flow');
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl select-none">🇮🇳</span>
            <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Sahay AI <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">SIH 26092</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio speaking indicator */}
            {isSpeaking && (
              <button
                type="button"
                onClick={stopSpeaking}
                className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold hover:bg-red-200 cursor-pointer animate-pulse"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>Stop Voice</span>
              </button>
            )}

            {/* Quick Language Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                className="bg-transparent text-xs font-bold text-slate-700 py-1 pr-2 outline-hidden cursor-pointer"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.nativeName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Persistent UPI-style Progress Stepper */}
      <ProgressStepper
        currentStep={currentStep}
        totalSteps={6}
        language={language}
        onBack={handleGoBack}
        canGoBack={currentStep > 1 && currentStep < 6}
      />

      {/* Offline Alert Banner if rural network drops */}
      {isOffline && (
        <div className="bg-amber-500 text-white px-4 py-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span>You are currently offline. Showing cached scheme information.</span>
        </div>
      )}

      {/* Main Content Screen Area */}
      <main className="flex-1 px-4 py-4 max-w-3xl mx-auto w-full">
        {currentStep === 1 && (
          <LanguageTrustScreen
            language={language}
            onSelectLanguage={setLanguage}
            onStartVoice={handleStartVoiceFromLanding}
            onStartType={handleStartTypeFromLanding}
            onStartIntake={handleStartIntakeFromLanding}
          />
        )}

        {currentStep === 2 && (
          <SpeakNeedScreen
            language={language}
            transcript={transcript}
            isListening={isListening}
            audioLevel={audioLevel}
            errorMessage={errorMessage}
            onToggleListening={() => {
              if (isListening) {
                stopListening();
              } else {
                startListening();
              }
            }}
            onSetTranscript={setTranscript}
            onSubmitNeed={handleSubmitNeed}
            isLoading={isLoadingSchemes}
            onReadAloudTranscript={() => transcript && speakText(transcript)}
            onBeneficiaryIntakeComplete={handleBeneficiaryIntakeComplete}
            initialIntakeMode={intakeMode}
          />
        )}

        {currentStep === 3 && (
          <SchemeResultsScreen
            schemes={matchedSchemes}
            language={language}
            onSelectScheme={handleSelectSchemeForEMI}
            onCompareSchemes={handleCompareSchemes}
            onReadAloud={(text) => speakText(text)}
            beneficiaryProfile={beneficiaryProfile}
          />
        )}

        {currentStep === 4 && selectedScheme && (
          <EMICalculatorScreen
            scheme={selectedScheme}
            secondScheme={compareScheme}
            language={language}
            onProceedToPartner={handleProceedToPartner}
            onReadAloud={(text) => speakText(text)}
          />
        )}

        {currentStep === 5 && selectedScheme && emiData && (
          <PartnerLocatorScreen
            scheme={selectedScheme}
            calculation={emiData}
            language={language}
            onConfirmPartner={handleConfirmPartner}
          />
        )}

        {currentStep === 6 && submittedApp && (
          <ConfirmationTrackerScreen
            application={submittedApp}
            language={language}
            onStartNew={handleStartNewApplication}
          />
        )}
      </main>

      {/* Accessible Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-xl mx-auto space-y-1">
          <p className="font-semibold text-slate-700">
            Sahay AI — Direct Citizen Assistance Platform
          </p>
          <p>
            SIH Problem 26092 · Ministry of Social Justice and Empowerment, Govt. of India
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
