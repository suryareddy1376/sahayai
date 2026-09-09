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

  const recognitionRef = useRef<any>(null);

  // Map app language code to BCP 47 language tag
  const getLanguageTag = (lang: LanguageCode): string => {
    switch (lang) {
      case 'hi':
        return 'hi-IN';
      case 'mr':
        return 'mr-IN';
      case 'ta':
        return 'ta-IN';
      case 'en':
      default:
        return 'en-IN';
    }
  };

  // Check browser support on mount
  useEffect(() => {
    const win = window as unknown as IWindow;
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRec) {
      setSupported(false);
      setErrorMessage('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(async () => {
    setErrorMessage(null);
    const win = window as unknown as IWindow;
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRec) {
      setErrorMessage('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    // Explicitly prompt for mic permission first (critical for Windows Chrome & Edge)
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Release immediate audio stream so SpeechRecognition can take control
        stream.getTracks().forEach((track) => track.stop());
      } catch (err: any) {
        console.warn('Microphone permission check warning:', err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setErrorMessage('Microphone blocked. Click the lock/tune icon in your browser address bar and set Microphone to "Allow".');
          return;
        }
      }
    }

    // Stop any existing instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = true; // Stay listening rather than cutting off immediately on Windows
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = getLanguageTag(currentLanguage);

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript + ' ';
          } else {
            interimTranscript += item[0].transcript;
          }
        }
        const combined = (finalTranscript + interimTranscript).trim();
        if (combined) {
          setTranscript(combined);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition notice:', event.error);
        if (event.error === 'not-allowed') {
          setIsListening(false);
          setErrorMessage('Microphone blocked. Please allow microphone access in your browser or Windows Privacy Settings.');
        } else if (event.error === 'no-speech') {
          // Do not hard-crash on brief silence
          console.log('No speech detected in interval');
        } else if (event.error === 'network') {
          setIsListening(false);
          setErrorMessage('Network error with browser speech service. If using http:// IP address, use http://localhost:3000 or Chrome Flags.');
        } else {
          setErrorMessage(`Speech notice (${event.error}). Speak clearly or type below.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Speech recognition start error:', err);
      setIsListening(false);
      setErrorMessage('Could not start voice recognition. Please ensure microphone is plugged in.');
    }
  }, [currentLanguage]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setErrorMessage(null);
  }, []);

  // Text to Speech Read-back (🔊)
  const speakText = useCallback(
    (textToSpeak: string, lang: LanguageCode = currentLanguage) => {
      if (!('speechSynthesis' in window)) {
        return;
      }

      window.speechSynthesis.cancel(); // Cancel any existing speech

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = getLanguageTag(lang);
      utterance.rate = 0.92; // Slightly slower pace for clarity and comfort
      utterance.pitch = 1.0;

      // Try finding appropriate voice
      const voices = window.speechSynthesis.getVoices();
      const targetLang = getLanguageTag(lang);
      const matchedVoice = voices.find((v) => v.lang.startsWith(targetLang) || v.lang.replace('_', '-').startsWith(targetLang));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [currentLanguage]
  );

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
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
  };
}
