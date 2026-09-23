import React, { useState, useEffect } from 'react';
import {
  VolumeX,
  Globe,
  WifiOff,
  HelpCircle,
  LayoutDashboard,
} from 'lucide-react';
import {
  LanguageCode,
  Scheme,
  EMICalculation,
  PartnerBranch,
  ApplicationTrackerData,
  BeneficiaryProfile,
  BeneficiaryIntakeResponse,
  MultimodalQuery,
} from './types';
import { LANGUAGES } from './i18n/translations';
import { useVoice } from './hooks/useVoice';
import {
  matchSchemesAgent,
  calculateEMIAgent,
  submitApplication,
  getCachedApplication,
} from './services/mockAgentApi';
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
  const [activeQuery, setActiveQuery] = useState<MultimodalQuery | null>(null);

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

  const handleSubmitNeed = async (query: MultimodalQuery) => {
    stopListening();
    setActiveQuery(query);

    const effectiveSearchText =
      query.text.trim() ||
      `Attachment application: ${query.attachments.map((a) => a.name).join(', ')}`;

    setUserNeedText(effectiveSearchText);
    setIsLoadingSchemes(true);
    try {
      const results = await matchSchemesAgent(beneficiaryProfile || effectiveSearchText);
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
    setUserNeedText('');
    setActiveQuery(null);
    resetTranscript();
    setSelectedScheme(null);
    setCompareScheme(null);
    setEmiData(null);
    setSelectedPartner(null);
    setSubmittedApp(null);
    stopSpeaking();
    if (beneficiaryProfile) {
      setAppStage('dashboard');
    } else {
      setCurrentStep(1);
    }
  };

  const handleGoBack = () => {
    stopSpeaking();
    stopListening();
    if (beneficiaryProfile && (currentStep === 1 || currentStep === 2)) {
      setAppStage('dashboard');
      return;
    }
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else if (beneficiaryProfile) {
      setAppStage('dashboard');
    }
  };

  // Helper to extract a search query string from active beneficiary profile
  const getProfileNeedQuery = () => {
    if (!beneficiaryProfile) return 'Government scheme financial support';
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
      parts.push(`loan of ₹${beneficiaryProfile.enterprise.requested_loan_amount.toLocaleString('en-IN')}`);
    }
    return parts.length > 0 ? parts.join(' ') : 'Government scheme financial support';
  };

  // 1. Multi-Modal Discovery Flow (Voice / Text Need Input)
  const handleFindSchemesFromDashboard = () => {
    const needQuery = getProfileNeedQuery();
    setUserNeedText(needQuery);
    setTranscript(needQuery);
    setIntakeMode('voice');
    setCurrentStep(2);
    setAppStage('existing-flow');
  };

  // 2. Direct Navigation to EMI Calculator
  const handleOpenEMICalculator = async () => {
    if (!selectedScheme && beneficiaryProfile) {
      setIsLoadingSchemes(true);
      try {
        const results = await matchSchemesAgent(beneficiaryProfile);
        setMatchedSchemes(results);
        if (results.length > 0) {
          setSelectedScheme(results[0]);
        }
      } catch (err) {
        console.error('Error loading schemes for EMI calculator:', err);
      } finally {
        setIsLoadingSchemes(false);
      }
    }
    setCurrentStep(4);
    setAppStage('existing-flow');
  };

  // 3. Direct Navigation to Partner Locator
  const handleOpenPartnerLocator = async () => {
    let schemeToUse = selectedScheme;

    if (!schemeToUse && beneficiaryProfile) {
      setIsLoadingSchemes(true);
      try {
        const results = await matchSchemesAgent(beneficiaryProfile);
        setMatchedSchemes(results);
        if (results.length > 0) {
          schemeToUse = results[0];
          setSelectedScheme(results[0]);
        }
      } catch (err) {
        console.error('Error loading schemes for partner locator:', err);
      } finally {
        setIsLoadingSchemes(false);
      }
    }

    if (schemeToUse && !emiData && beneficiaryProfile?.enterprise?.requested_loan_amount) {
      const calc = calculateEMIAgent(
        schemeToUse,
        beneficiaryProfile.enterprise.requested_loan_amount,
        schemeToUse.standardTenureMonths
      );
      setEmiData(calc);
    }

    setCurrentStep(5);
    setAppStage('existing-flow');
  };

  // 4. Direct Navigation to Application Tracker (Shows existing or empty state; never invents data)
  const handleOpenApplicationTracker = () => {
    if (!submittedApp) {
      const cached = getCachedApplication();
      if (cached) {
        setSubmittedApp(cached);
      }
    }
    setCurrentStep(6);
    setAppStage('existing-flow');
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
          onEMICalculator={handleOpenEMICalculator}
          onPartnerLocator={handleOpenPartnerLocator}
          onApplicationTracker={handleOpenApplicationTracker}
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
            {/* Quick return to Dashboard if user is profiled */}
            {beneficiaryProfile && (
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  stopListening();
                  setAppStage('dashboard');
                }}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                title="Return to Dashboard"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
            )}

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
        canGoBack={(currentStep > 1 && currentStep < 6) || (Boolean(beneficiaryProfile) && currentStep < 6)}
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

        {currentStep === 4 && (
          selectedScheme ? (
            <EMICalculatorScreen
              scheme={selectedScheme}
              secondScheme={compareScheme}
              language={language}
              onProceedToPartner={handleProceedToPartner}
              onReadAloud={(text) => speakText(text)}
            />
          ) : (
            <div className="w-full max-w-xl mx-auto space-y-6 pt-2 pb-16">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 sm:p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl">
                  🧮
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900">
                    No Scheme Selected for EMI Calculation
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                    Please search or match eligible schemes first to estimate monthly installments and moratorium terms.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (beneficiaryProfile) {
                        handleFindSchemesFromDashboard();
                      } else {
                        setCurrentStep(2);
                      }
                    }}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    <span>Speak or Search Need</span>
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        {currentStep === 5 && (
          selectedScheme && emiData ? (
            <PartnerLocatorScreen
              scheme={selectedScheme}
              calculation={emiData}
              language={language}
              onConfirmPartner={handleConfirmPartner}
            />
          ) : (
            <div className="w-full max-w-xl mx-auto space-y-6 pt-2 pb-16">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 sm:p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl">
                  📍
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900">
                    Select a Scheme to Locate Partners
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                    Partner banks and channel agencies are assigned based on the specific scheme and loan amount needed.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (beneficiaryProfile) {
                        handleFindSchemesFromDashboard();
                      } else {
                        setCurrentStep(2);
                      }
                    }}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    <span>Speak or Search Need</span>
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        {currentStep === 6 && (
          submittedApp ? (
            <ConfirmationTrackerScreen
              application={submittedApp}
              language={language}
              onStartNew={handleStartNewApplication}
            />
          ) : (
            <div className="w-full max-w-xl mx-auto space-y-6 pt-2 pb-16">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 sm:p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl">
                  📋
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900">
                    No Active Application Found
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                    You have not submitted any scheme applications yet. Discover eligible schemes and apply to track review status here.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (beneficiaryProfile) {
                        setAppStage('dashboard');
                      } else {
                        setCurrentStep(1);
                      }
                    }}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    <span>{beneficiaryProfile ? 'Return to Dashboard' : 'Explore Schemes'}</span>
                  </button>
                </div>
              </div>
            </div>
          )
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
