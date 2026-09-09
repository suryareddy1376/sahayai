import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Keyboard, Search } from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../i18n/translations';
import { VoiceInputButton } from '../components/VoiceInputButton';
import { TrustBanner } from '../components/TrustBanner';

interface SpeakNeedScreenProps {
  language: LanguageCode;
  transcript: string;
  isListening: boolean;
  audioLevel?: number;
  errorMessage?: string | null;
  onToggleListening: () => void;
  onSetTranscript: (text: string) => void;
  onSubmitNeed: (needText: string) => void;
  isLoading: boolean;
  onReadAloudTranscript?: () => void;
}

export const SpeakNeedScreen: React.FC<SpeakNeedScreenProps> = ({
  language,
  transcript,
  isListening,
  audioLevel = 0,
  errorMessage,
  onToggleListening,
  onSetTranscript,
  onSubmitNeed,
  isLoading,
  onReadAloudTranscript,
}) => {
  const t = translations[language];
  const [showTypeInput, setShowTypeInput] = useState(false);
  const [typedText, setTypedText] = useState('');

  // Sync typed text with transcript
  useEffect(() => {
    if (transcript) {
      setTypedText(transcript);
    }
  }, [transcript]);

  const examplePrompts = [
    t.promptTailor,
    t.promptDairy,
    t.promptGrocery,
    t.promptWelding,
  ];

  const handleSelectPrompt = (prompt: string) => {
    onSetTranscript(prompt);
    setTypedText(prompt);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalNeed = typedText || transcript;
    if (finalNeed.trim()) {
      onSubmitNeed(finalNeed.trim());
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto py-20 text-center space-y-6">
        <div className="relative flex items-center justify-center">
          <div className="w-24 h-24 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
          <div className="absolute text-3xl">🏛️</div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {t.searchingSchemes}
          </h2>
          <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">
            Checking central and state corporation allocations for your profile…
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-blue-900 text-sm font-semibold inline-flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
          <span>No credit scores needed · Government backed</span>
        </div>
      </div>
    );
  }

  const activeText = typedText || transcript;

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 pt-2 pb-12">
      <TrustBanner language={language} variant="compact" />

      {/* Hero Title */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          {t.step2}
        </h1>
        <p className="text-slate-600 font-medium text-sm sm:text-base">
          {t.speakPrompt}
        </p>
      </div>

      {/* Large Voice Action Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-card p-6 sm:p-8 flex flex-col items-center">
        <VoiceInputButton
          isListening={isListening}
          onToggleListening={onToggleListening}
          transcript={activeText}
          language={language}
          errorMessage={errorMessage}
          onReadAloudTranscript={onReadAloudTranscript}
          audioLevel={audioLevel}
        />

        {/* Windows / Browser Troubleshooting Accordion */}
        <div className="mt-3 w-full">
          <details className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-3 cursor-pointer">
            <summary className="font-bold text-slate-700 select-none hover:text-blue-600">
              🎙️ Voice not detecting? Click here for quick fixes
            </summary>
            <div className="mt-2 space-y-1.5 text-left text-slate-600 leading-relaxed pt-2 border-t border-slate-200">
              <p><strong>1. Browser Permission:</strong> Click the 🔒 lock / settings icon next to the address bar and ensure <strong>Microphone</strong> is set to <strong>Allow</strong>.</p>
              <p><strong>2. Supported Browsers:</strong> Works natively on <strong>Google Chrome</strong>, <strong>Microsoft Edge</strong>, and <strong>Safari</strong>.</p>
              <p><strong>3. Windows Settings:</strong> Open Windows <em>Settings &gt; Privacy &amp; security &gt; Microphone</em> and make sure <em>"Let apps access your microphone"</em> is turned <strong>ON</strong>.</p>
              <p><strong>4. HTTPS / Localhost:</strong> Browsers require a secure connection (Vercel HTTPS or <code>http://localhost:3000</code>). Insecure IP connections block microphone.</p>
              <p><strong>5. Instant Testing:</strong> You can also tap any of the example prompt chips below to test scheme matching instantly without speaking!</p>
            </div>
          </details>
        </div>

        {/* Fallback Type Mode Toggle */}
        <div className="mt-4 w-full">
          {!showTypeInput ? (
            <button
              type="button"
              onClick={() => setShowTypeInput(true)}
              className="text-xs sm:text-sm font-bold text-slate-500 hover:text-blue-600 flex items-center justify-center gap-1.5 mx-auto py-2 cursor-pointer"
            >
              <Keyboard className="w-4 h-4" />
              <span>{t.typeInstead}</span>
            </button>
          ) : (
            <form onSubmit={handleFormSubmit} className="mt-3 space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={typedText}
                  onChange={(e) => {
                    setTypedText(e.target.value);
                    onSetTranscript(e.target.value);
                  }}
                  placeholder="e.g. सिलाई मशीन और दुकान के लिए ₹80,000"
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-300 focus:border-blue-600 focus:outline-hidden text-base font-medium"
                />
              </div>
            </form>
          )}
        </div>

        {/* Submit Button if text is available */}
        {activeText.trim().length > 0 && (
          <button
            type="button"
            onClick={() => onSubmitNeed(activeText)}
            className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-base sm:text-lg cursor-pointer active:scale-98 animate-in fade-in zoom-in-95"
          >
            <Search className="w-5 h-5 stroke-[2.5]" />
            <span>{t.submitNeed}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Example Prompt Chips */}
      <div className="space-y-3">
        <label className="text-xs uppercase tracking-wider font-bold text-slate-500 block px-1">
          {t.examplePromptsTitle}
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {examplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPrompt(prompt)}
              className="text-left p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/50 transition-colors flex items-start gap-2.5 cursor-pointer group shadow-xs"
            >
              <span className="text-blue-600 text-sm mt-0.5 group-hover:scale-110 transition-transform">
                💬
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                "{prompt}"
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
