import React from 'react';
import { Mic, MicOff, Volume2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageCode } from '../types';
import { translations } from '../i18n/translations';

interface VoiceInputButtonProps {
  isListening: boolean;
  onToggleListening: () => void;
  transcript: string;
  language: LanguageCode;
  errorMessage?: string | null;
  className?: string;
  onReadAloudTranscript?: () => void;
  audioLevel?: number;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  isListening,
  onToggleListening,
  transcript,
  language,
  errorMessage,
  className = '',
  onReadAloudTranscript,
  audioLevel = 0,
}) => {
  const t = translations[language];

  // Dynamic scale & bar height based on audio level
  const pulseScale = isListening ? (audioLevel > 15 ? 1.05 + audioLevel * 0.002 : 1) : 1;

  const getSpokenLabel = (code: LanguageCode): string => {
    switch (code) {
      case 'hi': return 'आपने कहा:';
      case 'bn': return 'আপনি বলেছেন:';
      case 'mr': return 'तुम्ही म्हणालात:';
      case 'te': return 'మీరు చెప్పారు:';
      case 'ta': return 'நீங்கள் கூறியது:';
      case 'gu': return 'તમે કહ્યું:';
      case 'ur': return 'آپ نے کہا:';
      case 'kn': return 'ನೀವು ಹೇಳಿದ್ದು:';
      case 'od': return 'ଆପଣ କହିଲେ:';
      case 'ml': return 'നിങ്ങൾ പറഞ്ഞത്:';
      case 'en':
      default:
        return 'You said:';
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center text-center w-full ${className}`}>
      {/* Microphone Main Action Area */}
      <div className="relative flex items-center justify-center p-6 my-2">
        {/* Pulsing Concentric Rings while listening */}
        <AnimatePresence>
          {isListening && (
            <>
              <motion.div
                initial={{ scale: 0.8, opacity: 0.6 }}
                animate={{ scale: audioLevel > 10 ? 1.6 : 1.3, opacity: 0 }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
                className="absolute w-36 h-36 rounded-full bg-red-500/30"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0.8 }}
                animate={{ scale: audioLevel > 10 ? 1.9 : 1.6, opacity: 0 }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
                className="absolute w-44 h-44 rounded-full bg-red-400/20"
              />
            </>
          )}
        </AnimatePresence>

        {/* Big Mic Button */}
        <motion.button
          type="button"
          animate={{ scale: pulseScale }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onClick={onToggleListening}
          aria-label={isListening ? t.tapToStop : t.tapToSpeak}
          className={`relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center shadow-xl transition-colors duration-300 cursor-pointer active:scale-95 ${
            isListening
              ? 'bg-red-600 text-white shadow-red-500/40 ring-4 ring-red-300'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30 ring-4 ring-blue-100'
          }`}
        >
          {isListening ? (
            <MicOff className="w-12 h-12 stroke-[2.5]" />
          ) : (
            <Mic className="w-12 h-12 stroke-[2.5]" />
          )}

          <span className="text-[11px] uppercase tracking-wider font-bold mt-1 opacity-90">
            {isListening ? 'STOP' : 'MIC'}
          </span>
        </motion.button>
      </div>

      {/* Status Label & Waveform */}
      <div className="mt-2 min-h-12 flex flex-col items-center justify-center">
        {isListening ? (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 h-6">
              <span
                className="w-1.5 bg-red-600 rounded-full transition-all duration-100"
                style={{ height: `${Math.max(8, Math.min(36, 8 + audioLevel * 0.4))}px` }}
              />
              <span
                className="w-1.5 bg-red-600 rounded-full transition-all duration-100"
                style={{ height: `${Math.max(10, Math.min(36, 10 + audioLevel * 0.6))}px` }}
              />
              <span
                className="w-1.5 bg-red-600 rounded-full transition-all duration-100"
                style={{ height: `${Math.max(12, Math.min(40, 12 + audioLevel * 0.8))}px` }}
              />
              <span
                className="w-1.5 bg-red-600 rounded-full transition-all duration-100"
                style={{ height: `${Math.max(10, Math.min(36, 10 + audioLevel * 0.6))}px` }}
              />
              <span
                className="w-1.5 bg-red-600 rounded-full transition-all duration-100"
                style={{ height: `${Math.max(8, Math.min(36, 8 + audioLevel * 0.4))}px` }}
              />
            </div>
            <p className="text-base font-bold text-red-600 animate-pulse">
              {audioLevel > 12 ? '🟢 आवाज़ सुनाई दे रही है... बोलते रहें' : t.listeningNow}
            </p>
          </div>
        ) : (
          <p className="text-base sm:text-lg font-bold text-slate-800">
            {t.tapToSpeak}
          </p>
        )}
      </div>

      {/* Actionable Error & Troubleshooting Card */}
      {errorMessage && (
        <div className="mt-3 px-4 py-3 bg-amber-50 border-2 border-amber-300 rounded-2xl text-amber-900 text-sm max-w-md text-left shadow-xs space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold">{errorMessage}</p>
            <button
              type="button"
              onClick={onToggleListening}
              className="shrink-0 flex items-center gap-1 bg-amber-200 hover:bg-amber-300 text-amber-900 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      )}

      {/* Live Transcript Display */}
      {transcript && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 w-full max-w-lg bg-white border-2 border-blue-200 rounded-2xl p-4 shadow-sm text-left relative"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs uppercase font-bold text-blue-700 tracking-wider">
              {getSpokenLabel(language)}
            </span>
            {onReadAloudTranscript && (
              <button
                type="button"
                onClick={onReadAloudTranscript}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold p-1"
                title={t.audioPlayback}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{t.audioPlayback}</span>
              </button>
            )}
          </div>
          <p className="text-lg sm:text-xl font-medium text-slate-900 leading-snug">
            "{transcript}"
          </p>
        </motion.div>
      )}
    </div>
  );
};
