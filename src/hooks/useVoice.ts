import { useState, useEffect, useCallback, useRef } from 'react';
import { LanguageCode } from '../types';

interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

export function useVoice(currentLanguage: LanguageCode) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const recognitionRef = useRef<any>(null);
  const isListeningIntentRef = useRef<boolean>(false);
  const restartCountRef = useRef<number>(0);
  const restartTimeoutRef = useRef<any>(null);

  // Map app language code to BCP 47 language tag
  const getLanguageTag = useCallback((lang: LanguageCode): string => {
    const map: Record<LanguageCode, string> = {
      hi: 'hi-IN',
      bn: 'bn-IN',
      mr: 'mr-IN',
      te: 'te-IN',
      ta: 'ta-IN',
      gu: 'gu-IN',
      ur: 'ur-IN',
      kn: 'kn-IN',
      od: 'or-IN',
      ml: 'ml-IN',
      en: 'en-IN',
    };
    return map[lang] || 'en-IN';
  }, []);

  // Check browser support on mount
  useEffect(() => {
    const win = window as unknown as IWindow;
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRec) {
      setSupported(false);
      setErrorMessage(
        'Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.'
      );
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isListeningIntentRef.current = false;
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) { /* ignore */ }
        recognitionRef.current = null;
      }
    };
  }, []);

  // Simulate audio level from recognition events (no competing getUserMedia stream)
  const pulseAudio = useCallback(() => {
    // Simple visual pulse when speaking is detected - no second mic stream needed
    setAudioLevel(Math.floor(Math.random() * 40) + 40);
    const timer = setTimeout(() => setAudioLevel(0), 300);
    return () => clearTimeout(timer);
  }, []);

  const stopListening = useCallback(() => {
    isListeningIntentRef.current = false;
    restartCountRef.current = 0;

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
      recognitionRef.current = null;
    }

    setIsListening(false);
    setAudioLevel(0);
  }, []);

  const startListening = useCallback(() => {
    setErrorMessage(null);
    restartCountRef.current = 0;

    const win = window as unknown as IWindow;
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRec) {
      setSupported(false);
      setErrorMessage('Speech recognition is not supported. Use Chrome or Edge.');
      return;
    }

    // Abort any existing instance cleanly
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) { /* ignore */ }
      recognitionRef.current = null;
    }

    isListeningIntentRef.current = true;

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false; // Single-shot mode - more reliable across devices
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = getLanguageTag(currentLanguage);

      recognition.onstart = () => {
        console.log('[Sahay Voice] Recognition started, lang:', recognition.lang);
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let finalText = '';
        let interimText = '';

        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalText += result[0].transcript + ' ';
          } else {
            interimText += result[0].transcript;
          }
        }

        const combined = (finalText + interimText).trim();
        console.log('[Sahay Voice] Transcript:', combined);

        if (combined) {
          setTranscript(combined);
          // Pulse the audio level indicator when we get speech
          setAudioLevel(Math.floor(Math.random() * 40) + 50);
          setTimeout(() => setAudioLevel(20), 200);
        }
      };

      recognition.onerror = (event: any) => {
        const err = event.error;
        console.warn('[Sahay Voice] Error:', err);

        if (err === 'no-speech') {
          // Not fatal - just means silence was detected. Will auto-restart below.
          return;
        }
        if (err === 'aborted') {
          return;
        }
        if (err === 'not-allowed') {
          isListeningIntentRef.current = false;
          setIsListening(false);
          setErrorMessage('Microphone blocked. Allow mic access in browser settings and reload.');
          return;
        }
        if (err === 'network') {
          setErrorMessage('Network error - speech recognition needs internet. Check your connection.');
          return;
        }
        if (err === 'audio-capture') {
          setErrorMessage('No microphone found or mic is in use by another app.');
          isListeningIntentRef.current = false;
          setIsListening(false);
          return;
        }
        // Generic fallback
        setErrorMessage(`Voice error: ${err}. Try speaking again or type instead.`);
      };

      recognition.onend = () => {
        console.log('[Sahay Voice] onend fired, intentStillListening:', isListeningIntentRef.current);

        // Auto-restart if user hasn't pressed stop (handles Chrome's auto-stop on silence)
        if (isListeningIntentRef.current && restartCountRef.current < 50) {
          restartCountRef.current++;
          console.log('[Sahay Voice] Auto-restarting (attempt', restartCountRef.current, ')');

          restartTimeoutRef.current = setTimeout(() => {
            if (!isListeningIntentRef.current) return;

            try {
              const freshRecognition = new SpeechRec();
              freshRecognition.continuous = false;
              freshRecognition.interimResults = true;
              freshRecognition.maxAlternatives = 1;
              freshRecognition.lang = getLanguageTag(currentLanguage);

              // Re-attach ALL the same handlers
              freshRecognition.onstart = recognition.onstart;
              freshRecognition.onresult = recognition.onresult;
              freshRecognition.onerror = recognition.onerror;
              freshRecognition.onend = recognition.onend;

              recognitionRef.current = freshRecognition;
              freshRecognition.start();
            } catch (e) {
              console.warn('[Sahay Voice] Restart failed:', e);
              setIsListening(false);
              isListeningIntentRef.current = false;
            }
          }, 300);
        } else {
          setIsListening(false);
          setAudioLevel(0);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
      console.log('[Sahay Voice] recognition.start() called successfully');
    } catch (err: any) {
      console.error('[Sahay Voice] Failed to start:', err);
      setIsListening(false);
      isListeningIntentRef.current = false;
      setErrorMessage('Could not start voice recognition. Check microphone and try again.');
    }
  }, [currentLanguage, getLanguageTag]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setErrorMessage(null);
  }, []);

  // Restart recognition if language changes mid-session
  useEffect(() => {
    if (isListeningIntentRef.current && recognitionRef.current) {
      stopListening();
      const timer = setTimeout(() => startListening(), 300);
      return () => clearTimeout(timer);
    }
  }, [currentLanguage]); // eslint-disable-line react-hooks/exhaustive-deps

  // Text to Speech
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speakText = useCallback(
    async (textToSpeak: string, lang: LanguageCode = currentLanguage) => {
      // 1. Fallback / Cancel ongoing
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      setIsSpeaking(true);

      try {
        const _rawUrl = (import.meta as any).env?.VITE_BACKEND_URL || 'https://sahayai-4dzp.onrender.com';
        const BACKEND_URL = _rawUrl.endsWith('/') ? _rawUrl.slice(0, -1) : _rawUrl;
        
        // 2. Call our Sarvam TTS backend endpoint
        const res = await fetch(`${BACKEND_URL}/api/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textToSpeak, lang: lang })
        });
        
        if (!res.ok) throw new Error('TTS Failed');
        
        const data = await res.json();
        if (data.audio_base64) {
          const audio = new Audio(`data:audio/wav;base64,${data.audio_base64}`);
          audioRef.current = audio;
          audio.onended = () => setIsSpeaking(false);
          audio.onerror = () => { setIsSpeaking(false); fallbackSpeak(textToSpeak, lang); };
          await audio.play();
          return;
        }
      } catch (err) {
        console.warn('Backend TTS failed, falling back to browser TTS', err);
      }
      
      // 3. Fallback to browser TTS if backend fails
      fallbackSpeak(textToSpeak, lang);
    },
    [currentLanguage]
  );

  const fallbackSpeak = useCallback((textToSpeak: string, lang: LanguageCode) => {
      if (!('speechSynthesis' in window)) {
        setIsSpeaking(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = getLanguageTag(lang);
      utterance.rate = 0.92;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const targetLang = getLanguageTag(lang);
      const matchedVoice = voices.find(
        (v) => v.lang.startsWith(targetLang) || v.lang.replace('_', '-').startsWith(targetLang)
      );
      if (matchedVoice) utterance.voice = matchedVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
  }, [getLanguageTag]);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);


  return {
    isListening,
    transcript,
    setTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSpeaking,
    speakText,
    stopSpeaking,
    supported,
    errorMessage,
    audioLevel,
  };
}
