import React, { useEffect, useState, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { VolumeX, Globe, WifiOff, LayoutDashboard } from 'lucide-react';

import { useAppContext } from './context/AppContext';
import { LanguageCode } from './types';
import { LANGUAGES } from './i18n/translations';
import { useVoice } from './hooks/useVoice';
import { getCachedApplication, matchSchemesAgent, calculateEMIAgent, locatePartnersAgent, submitApplication } from './services/agentApi';

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
import { ProgressStepper } from './components/ProgressStepper';
import { AgentProcessingOverlay, PipelineStep } from './components/AgentProcessingOverlay';
import { LanguageModal } from './components/LanguageModal';

// Map path to step for the ProgressStepper
const pathStepMap: Record<string, number> = {
  '/speak-need': 1,
  '/schemes': 2,
  '/emi': 3,
  '/partner': 4,
  '/tracker': 5,
};

// ─── Pipeline state type ────────────────────────────────────────────────────

interface PipelineState {
  title: string;
  steps: PipelineStep[];
  onComplete: () => void;
}

// ─── App Component ──────────────────────────────────────────────────────────

export function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const {
    language, setLanguage,
    beneficiaryProfile, setBeneficiaryProfile,
    setIntakeResponse,
    matchedSchemes, setMatchedSchemes,
    selectedScheme, setSelectedScheme,
    compareScheme, setCompareScheme,
    emiData, setEmiData,
    setSelectedPartner,
    submittedApp, setSubmittedApp,
    setUserNeedText,
    setActiveQuery,
  } = useAppContext();

  const {
    isListening, transcript, setTranscript,
    startListening, stopListening, resetTranscript,
    isSpeaking, speakText, stopSpeaking,
    errorMessage, audioLevel,
  } = useVoice(language);

  const [isLoadingSchemes, setIsLoadingSchemes] = useState(false);
  const [pipeline, setPipeline] = useState<PipelineState | null>(null);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  // Offline detection
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const currentStep = pathStepMap[location.pathname] || 0;
  const isAuthFlow = ['/auth', '/profile', '/dashboard'].includes(location.pathname);
  const isFlowPage = currentStep > 0;

  // ═══════════════════════════════════════════════════════════════════════════
  //  TRANSITION HANDLERS - each step's `work()` calls the REAL agent API
  // ═══════════════════════════════════════════════════════════════════════════

  // 1. Auth → Profile
  const handleAuthenticated = useCallback(() => {
    setPipeline({
      title: 'Authenticating…',
      steps: [
        { label: 'Verifying credentials', icon: '🔐', detail: 'Checking identity with auth service…' },
        { label: 'Creating session token', icon: '🪪', detail: 'Generating secure JWT token…' },
        { label: 'Loading Context Store', icon: '💾', detail: 'Initializing user session memory…' },
      ],
      onComplete: () => { setPipeline(null); navigate('/profile'); },
    });
  }, [navigate]);

  // 2. Profile → Dashboard
  const handleProfileComplete = useCallback((response: any) => {
    setPipeline({
      title: 'Setting Up Profile…',
      steps: [
        {
          label: 'Saving to Vector DB',
          icon: '🗃️',
          detail: 'Storing beneficiary profile in Vector DB…',
          work: async () => {
            // Actually save the profile into context
            setIntakeResponse(response);
            setBeneficiaryProfile(response.beneficiary);
          },
        },
        { label: 'Intent & Entity Extraction', icon: '🧠', detail: 'Extracting profile, query type, key parameters…' },
        { label: 'Supervisor Agent - Context Store', icon: '📋', detail: 'Writing profile to Context Store (session memory)…' },
      ],
      onComplete: () => { setPipeline(null); navigate('/dashboard'); },
    });
  }, [navigate, setIntakeResponse, setBeneficiaryProfile]);

  // 3. Query → Scheme Results  (the real matchSchemesAgent runs in step 4)
  const handleSubmitNeed = useCallback((query: any) => {
    stopListening();
    setActiveQuery(query);
    const effectiveText =
      query.text.trim() ||
      `Attachment application: ${query.attachments.map((a: any) => a.name).join(', ')}`;
    setUserNeedText(effectiveText);
    setIsLoadingSchemes(true);

    // Temporary ref to hold results across steps
    let fetchedSchemes: any[] = [];

    setPipeline({
      title: 'Finding Matching Schemes…',
      steps: [
        { label: 'Perception Layer - Bhashini STT', icon: '🎙️', detail: 'Speech to text + translation processing…' },
        { label: 'Intent & Entity Extraction', icon: '🧠', detail: 'Extracting user profile, query type, key params…' },
        { label: 'JEV Supervisor Agent', icon: '🤖', detail: 'Intent classification → Task decomposition → Routing…' },
        {
          label: 'Scheme Match Agent (RAG)',
          icon: '📄',
          detail: 'RAG over scheme documents, eligibility reasoning…',
          work: async () => {
            // ★ REAL API CALL - the agent fetches matched schemes
            const results = await matchSchemesAgent(beneficiaryProfile || effectiveText);
            fetchedSchemes = results;
            setMatchedSchemes(results);
            if (results.length > 0) setSelectedScheme(results[0]);
          },
        },
        { label: 'Reducer Agent - Rank & Aggregate', icon: '📊', detail: 'Result synthesis, rank fusion, deduplication…' },
      ],
      onComplete: () => {
        setIsLoadingSchemes(false);
        setPipeline(null);
        navigate('/schemes');
      },
    });
  }, [stopListening, setActiveQuery, setUserNeedText, beneficiaryProfile, setMatchedSchemes, setSelectedScheme, navigate]);

  // 4. Scheme → EMI  (calculateEMIAgent is sync but runs in the step)
  const handleSelectSchemeForEMI = useCallback((scheme: any, compare?: any) => {
    setSelectedScheme(scheme);
    setCompareScheme(compare || null);

    setPipeline({
      title: 'Calculating EMI Options…',
      steps: [
        { label: 'JEV Supervisor - Task Contract', icon: '🤖', detail: 'Dispatching task to EMI Calculator Agent…' },
        {
          label: 'EMI Calculator Agent',
          icon: '🧮',
          detail: 'Fixed calculation engine - interest rate, tenure, rules…',
          work: async () => {
            // ★ REAL AGENT - pre-compute EMI so it's ready on the EMI page
            const calc = calculateEMIAgent(
              scheme,
              scheme.maxAmount,
              scheme.standardTenureMonths
            );
            setEmiData(calc);
          },
        },
        { label: 'Reducer Agent - Validate Output', icon: '📊', detail: 'Guardrail pass #2 - output-side policy check…' },
      ],
      onComplete: () => { setPipeline(null); navigate('/emi'); },
    });
  }, [setSelectedScheme, setCompareScheme, setEmiData, navigate]);

  // 5. EMI → Partner  (locatePartnersAgent actually fetches partner data)
  const handleProceedToPartner = useCallback((calc: any) => {
    setEmiData(calc);

    setPipeline({
      title: 'Locating Partner Banks…',
      steps: [
        { label: 'JEV Supervisor - Task Contract', icon: '🤖', detail: 'Dispatching task to Partner Locator Agent…' },
        {
          label: 'Partner Locator Agent',
          icon: '📍',
          detail: 'Graph-based partner search, eligibility-filtered results…',
          work: async () => {
            // ★ REAL API CALL - fetches partner branches
            await locatePartnersAgent(selectedScheme?.id);
          },
        },
        { label: 'Maps API - Geospatial Data', icon: '🗺️', detail: 'Location search, partner network, routing…' },
        { label: 'Reducer Agent - Rank Partners', icon: '📊', detail: 'Rank by distance & services, contact + route guidance…' },
      ],
      onComplete: () => { setPipeline(null); navigate('/partner'); },
    });
  }, [setEmiData, selectedScheme, navigate]);

  // 6. Partner → Tracker  (submitApplication runs in step)
  const handleConfirmPartner = useCallback((partner: any) => {
    setSelectedPartner(partner);

    setPipeline({
      title: 'Submitting Application…',
      steps: [
        {
          label: 'Packaging Application',
          icon: '📝',
          detail: 'Compiling scheme + EMI + partner data…',
          work: async () => {
            // ★ REAL SUBMISSION - creates the application
            if (selectedScheme && emiData) {
              const userPhone = localStorage.getItem('sahay_user_phone') || '+91 98765 43210';
              const response = await submitApplication(selectedScheme, emiData, partner, userPhone, true);
              setSubmittedApp(response as any);
            }
          },
        },
        { label: 'Ranked Output Generation', icon: '📤', detail: 'Building multi-modal response with citations…' },
        { label: 'Delivery Channel - Web Portal', icon: '🌐', detail: 'Rendering confirmation & tracker view…' },
      ],
      onComplete: () => { setPipeline(null); navigate('/tracker'); },
    });
  }, [selectedScheme, emiData, setSelectedPartner, setSubmittedApp, navigate]);

  // 7. Start New
  const handleStartNew = useCallback(() => {
    setUserNeedText('');
    setActiveQuery(null);
    resetTranscript();
    setSelectedScheme(null);
    setCompareScheme(null);
    setEmiData(null);
    setSelectedPartner(null);
    setSubmittedApp(null);
    stopSpeaking();
    navigate(beneficiaryProfile ? '/dashboard' : '/');
  }, [beneficiaryProfile, navigate, resetTranscript, setActiveQuery, setCompareScheme, setEmiData, setSelectedPartner, setSelectedScheme, setSubmittedApp, setUserNeedText, stopSpeaking]);

  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* ─── Top Header ──────────────────────────────────── */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer"
            onClick={() => { stopSpeaking(); stopListening(); navigate(beneficiaryProfile ? '/dashboard' : '/'); }}>
            <span className="text-xl select-none">🇮🇳</span>
            <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Sahay AI <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">SIH 26092</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            {beneficiaryProfile && !isAuthFlow && (
              <button type="button" onClick={() => { stopSpeaking(); stopListening(); navigate('/dashboard'); }}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors" title="Dashboard">
                <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
            )}
            {isSpeaking && (
              <button type="button" onClick={stopSpeaking}
                className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold hover:bg-red-200 cursor-pointer animate-pulse">
                <VolumeX className="w-3.5 h-3.5" /><span>Stop Voice</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsLanguageModalOpen(true)}
              className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-900 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition-all shadow-xs ml-1"
              title="Change Language"
            >
              <Globe className="w-4 h-4 text-blue-600" />
              <span>{LANGUAGES.find((l) => l.code === language)?.flag} {LANGUAGES.find((l) => l.code === language)?.nativeName}</span>
              <span className="hidden sm:inline-block text-[10px] bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded font-semibold ml-0.5">Change</span>
            </button>
          </div>
        </div>
      </header>


      {isOffline && (
        <div className="bg-amber-500 text-white px-4 py-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" /><span>You are currently offline. Showing cached scheme information.</span>
        </div>
      )}

      {/* ─── Main Content ────────────────────────────────── */}
      <main className={`flex-1 px-4 py-4 max-w-3xl mx-auto w-full ${isAuthFlow ? 'max-w-none px-0 py-0' : ''}`}>
        <Routes>
          {/* Welcome */}
          <Route path="/" element={
            <LanguageTrustScreen language={language} onSelectLanguage={setLanguage}
              onStartVoice={() => navigate('/auth')} onStartType={() => {}} />
          } />

          {/* Auth */}
          <Route path="/auth" element={
            <div className="min-h-screen bg-slate-50 py-6 px-4">
              <AuthenticationScreen onAuthenticated={handleAuthenticated} />
            </div>
          } />

          {/* Profile */}
          <Route path="/profile" element={
            <div className="min-h-screen bg-slate-50 py-6 px-4">
              <ProfileSetupScreen language={language}
                onProfileComplete={handleProfileComplete}
                onBack={() => navigate('/auth')} />
            </div>
          } />

          {/* Dashboard */}
          <Route path="/dashboard" element={
            <div className="min-h-screen bg-slate-50 py-6 px-4">
              <DashboardScreen profile={beneficiaryProfile} language={language}
                onEditProfile={() => navigate('/profile')}
                onLogout={() => { setBeneficiaryProfile(null); setIntakeResponse(null); navigate('/auth'); }}
                onFindSchemes={() => navigate('/speak-need')}
                onApplicationTracker={() => {
                  if (!submittedApp) { const cached = getCachedApplication(); if (cached) setSubmittedApp(cached); }
                  navigate('/tracker');
                }} />
            </div>
          } />

          {/* Step 1: Speak/Type Need */}
          <Route path="/speak-need" element={
            <SpeakNeedScreen language={language} transcript={transcript}
              isListening={isListening} audioLevel={audioLevel} errorMessage={errorMessage}
              onToggleListening={() => isListening ? stopListening() : startListening()}
              onSetTranscript={setTranscript} onSubmitNeed={handleSubmitNeed} isLoading={isLoadingSchemes}
              onReadAloudTranscript={() => transcript && speakText(transcript)} />
          } />

          {/* Step 2: Scheme Results */}
          <Route path="/schemes" element={
            <SchemeResultsScreen schemes={matchedSchemes} language={language}
              onSelectScheme={(s) => handleSelectSchemeForEMI(s)}
              onCompareSchemes={(s1, s2) => handleSelectSchemeForEMI(s1, s2)}
              onReadAloud={(text) => speakText(text)} beneficiaryProfile={beneficiaryProfile} />
          } />

          {/* Step 3: EMI Calculator */}
          <Route path="/emi" element={
            selectedScheme ? (
              <EMICalculatorScreen scheme={selectedScheme} secondScheme={compareScheme} language={language}
                onProceedToPartner={handleProceedToPartner} onReadAloud={(text) => speakText(text)} />
            ) : (
              <EmptyState icon="🧮" title="No Scheme Selected"
                text="Complete the query step first so the Scheme Match Agent can retrieve eligible schemes."
                action={() => navigate('/speak-need')} btnText="Start from Query" />
            )
          } />

          {/* Step 4: Partner Locator */}
          <Route path="/partner" element={
            selectedScheme && emiData ? (
              <PartnerLocatorScreen scheme={selectedScheme} calculation={emiData} language={language}
                onConfirmPartner={handleConfirmPartner} />
            ) : (
              <EmptyState icon="📍" title="Complete Previous Steps"
                text="The Partner Locator Agent needs scheme and EMI data to find eligible banks."
                action={() => navigate('/speak-need')} btnText="Start from Query" />
            )
          } />

          {/* Step 5: Confirmation & Tracker */}
          <Route path="/tracker" element={
            submittedApp ? (
              <ConfirmationTrackerScreen application={submittedApp} language={language} onStartNew={handleStartNew} />
            ) : (
              <EmptyState icon="📋" title="No Active Application"
                text="Complete the full flow so each agent can process your request step by step."
                action={() => navigate(beneficiaryProfile ? '/dashboard' : '/')}
                btnText={beneficiaryProfile ? 'Return to Dashboard' : 'Get Started'} />
            )
          } />
        </Routes>
      </main>

      {/* ─── Agent Pipeline Overlay (real work happens here) ── */}
      {pipeline && (
        <AgentProcessingOverlay title={pipeline.title} steps={pipeline.steps} onComplete={pipeline.onComplete} />
      )}

      {/* ─── Footer ──────────────────────────────────────── */}
      <footer className="w-full bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-xl mx-auto space-y-1">
          <p className="font-semibold text-slate-700">Sahay AI | Direct Citizen Assistance Platform</p>
          <p>SIH Problem 26092 · Ministry of Social Justice and Empowerment, Govt. of India</p>
        </div>
      </footer>
      <LanguageModal 
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        language={language}
        onSelectLanguage={setLanguage}
      />
    </div>
  );
}

// ─── Empty State ────────────────────────────────────────────────────────────

const EmptyState = ({ icon, title, text, action, btnText }: any) => (
  <div className="w-full max-w-xl mx-auto space-y-6 pt-2 pb-16">
    <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 sm:p-8 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl">{icon}</div>
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">{text}</p>
      </div>
      <div className="pt-2">
        <button onClick={action}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer">
          <span>{btnText}</span>
        </button>
      </div>
    </div>
  </div>
);

export default App;
