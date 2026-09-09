import React from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
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
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  isListening,
  onToggleListening,
  transcript,
  language,
  errorMessage,
  className = '',
  onReadAloudTranscript,
}) => {
  const t = translations[language];

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
                animate={{ scale: 1.4, opacity: 0 }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                className="absolute w-36 h-36 rounded-full bg-red-500/30"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0.8 }}
                animate={{ scale: 1.7, opacity: 0 }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
                className="absolute w-44 h-44 rounded-full bg-red-400/20"
              />
            </>
          )}
        </AnimatePresence>

        {/* Big Mic Button */}
        <button
          type="button"
          onClick={onToggleListening}
          aria-label={isListening ? t.tapToStop : t.tapToSpeak}
          className={`relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center shadow-xl transition-all duration-300 cursor-pointer active:scale-95 ${
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
        </button>
      </div>

      {/* Status Label & Waveform */}
      <div className="mt-2 min-h-12 flex flex-col items-center justify-center">
        {isListening ? (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 h-6">
              <span className="w-1.5 bg-red-600 rounded-full wave-bar-1 inline-block" />
              <span className="w-1.5 bg-red-600 rounded-full wave-bar-2 inline-block" />
              <span className="w-1.5 bg-red-600 rounded-full wave-bar-3 inline-block" />
              <span className="w-1.5 bg-red-600 rounded-full wave-bar-4 inline-block" />
              <span className="w-1.5 bg-red-600 rounded-full wave-bar-5 inline-block" />
            </div>
            <p className="text-base font-bold text-red-600 animate-pulse">
              {t.listeningNow}
            </p>
          </div>
        ) : (
          <p className="text-base sm:text-lg font-bold text-slate-800">
            {t.tapToSpeak}
          </p>
        )}
      </div>

      {/* Gentle error recovery feedback */}
      {errorMessage && (
        <div className="mt-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm max-w-md">
          {errorMessage}
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
              {language === 'hi' ? 'आपने कहा:' : language === 'mr' ? 'तुम्ही म्हणालात:' : language === 'ta' ? 'நீங்கள் கூறியது:' : 'You said:'}
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
