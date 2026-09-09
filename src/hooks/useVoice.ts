import { useState, useEffect, useCallback, useRef } from 'react';
import { LanguageCode } from '../types';

interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
  webkitAudioContext?: typeof AudioContext;
  AudioContext?: typeof AudioContext;
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
  const accumulatedTextRef = useRef<string>('');
  const fallbackLangRef = useRef<string | null>(null);
  const restartTimerRef = useRef<any>(null);

  // Audio stream & analyser refs for volume detection
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Map app language code to BCP 47 language tag
  const getLanguageTag = (lang: LanguageCode): string => {
    if (fallbackLangRef.current) {
      return fallbackLangRef.current;
    }
    switch (lang) {
      case 'hi':
        return 'hi-IN';
      case 'bn':
        return 'bn-IN';
      case 'mr':
        return 'mr-IN';
      case 'te':
        return 'te-IN';
      case 'ta':
        return 'ta-IN';
      case 'gu':
        return 'gu-IN';
      case 'ur':
        return 'ur-IN';
      case 'kn':
        return 'kn-IN';
      case 'od':
        return 'or-IN';
      case 'ml':
        return 'ml-IN';
      case 'en':
      default:
        return 'en-IN';
    }
  };

  // Check browser support and secure context on mount
  useEffect(() => {
    const win = window as unknown as IWindow;
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRec) {
      setSupported(false);
      setErrorMessage(
        'Speech recognition is not supported in this browser. For voice input, please use Google Chrome or Microsoft Edge.'
      );
    } else if (typeof window !== 'undefined' && window.isSecureContext === false) {
      setErrorMessage(
        'Microphone requires a secure connection (HTTPS or localhost). If opening from another device, access via localhost or deploy to Vercel.'
      );
    }
  }, []);

  // Stop audio visualizer
  const stopAudioVisualizer = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isListeningIntentRef.current = false;
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      stopAudioVisualizer();
    };
  }, [stopAudioVisualizer]);

  // Start audio volume visualizer (runs in parallel to speech recognition)
  const startAudioVisualizer = useCallback(async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const win = window as unknown as IWindow;
        const AudioCtx = win.AudioContext || win.webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateVolume = () => {
            if (!isListeningIntentRef.current) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            setAudioLevel(Math.min(100, Math.round(average * 2.5)));
            animFrameRef.current = requestAnimationFrame(updateVolume);
          };
          updateVolume();
        }
      }
    } catch (err) {
      // Audio meter is purely visual enhancement; speech recognition works independently
      console.log('Audio visualizer note:', err);
    }
  }, []);

  // Build a SpeechRecognition instance
  const initRecognition = useCallback(() => {
    const win = window as unknown as IWindow;
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRec) return null;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }

    const recognition = new SpeechRec();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = getLanguageTag(currentLanguage);

    recognition.onstart = () => {
      setIsListening(true);
      setErrorMessage(null);
    };

    recognition.onresult = (event: any) => {
      let sessionFinal = '';
      let sessionInterim = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          sessionFinal += item[0].transcript + ' ';
        } else {
          sessionInterim += item[0].transcript;
        }
      }

      if (sessionFinal) {
        accumulatedTextRef.current = (accumulatedTextRef.current + ' ' + sessionFinal)
          .replace(/\s+/g, ' ')
          .trim();
      }

      const combined = (accumulatedTextRef.current + ' ' + sessionInterim).replace(/\s+/g, ' ').trim();
      if (combined) {
        setTranscript(combined);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition notice:', event.error);

      // 'no-speech' is triggered by Chrome on pauses. Do NOT terminate listening!
      if (event.error === 'no-speech') {
        return;
      }

      // 'aborted' happens on stop/restart, safe to ignore
      if (event.error === 'aborted') {
        return;
      }

      if (event.error === 'not-allowed') {
        isListeningIntentRef.current = false;
        setIsListening(false);
        stopAudioVisualizer();
        setErrorMessage(
          'Microphone blocked. Please click the 🔒 lock / tune icon in your browser address bar and set Microphone to "Allow".'
        );
        return;
      }

      if (event.error === 'audio-capture') {
        isListeningIntentRef.current = false;
        setIsListening(false);
        stopAudioVisualizer();
        setErrorMessage(
          'No microphone detected or microphone is in use by another application. Please check your system audio settings.'
        );
        return;
      }

      if (event.error === 'language-not-supported') {
        console.warn(`Language ${currentLanguage} speech model not installed, falling back to Hindi/English`);
        fallbackLangRef.current = 'hi-IN';
        return;
      }

      if (event.error === 'network') {
        console.warn('Network issue with speech recognition service');
        return;
      }

      setErrorMessage(`Voice notice (${event.error}). Please speak clearly into your mic or use typing/examples below.`);
    };

    recognition.onend = () => {
      // Auto-restart if user still wants to listen (keeps mic alive through pauses)
      if (isListeningIntentRef.current) {
        if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(() => {
          if (isListeningIntentRef.current) {
            try {
              recognition.start();
            } catch (err: any) {
              if (err?.name !== 'InvalidStateError') {
                const fresh = initRecognition();
                if (fresh) {
                  try {
                    fresh.start();
                  } catch (e) {}
                }
              }
            }
          }
        }, 200);
      } else {
        setIsListening(false);
        stopAudioVisualizer();
      }
    };

    recognitionRef.current = recognition;
    return recognition;
  }, [currentLanguage, stopAudioVisualizer]);

  // Start Listening - Direct synchronous initiation preserves browser user gesture
  const startListening = useCallback(() => {
    setErrorMessage(null);
    fallbackLangRef.current = null;
    isListeningIntentRef.current = true;

    const win = window as unknown as IWindow;
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRec) {
      setSupported(false);
      setErrorMessage(
        'Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.'
      );
      isListeningIntentRef.current = false;
      return;
    }

    const recognition = initRecognition();
    if (!recognition) return;

    try {
      recognition.start();
      setIsListening(true);
      // Start audio volume visualizer in background
      startAudioVisualizer();
    } catch (err: any) {
      console.warn('Speech recognition synchronous start catch:', err);
      if (err?.name === 'InvalidStateError') {
        setIsListening(true);
      } else {
        setIsListening(false);
        isListeningIntentRef.current = false;
        setErrorMessage('Could not start voice recognition. Please verify microphone permission in your browser.');
      }
    }
  }, [initRecognition, startAudioVisualizer]);

  const stopListening = useCallback(() => {
    isListeningIntentRef.current = false;
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    setIsListening(false);
    stopAudioVisualizer();
  }, [stopAudioVisualizer]);

  const resetTranscript = useCallback(() => {
    accumulatedTextRef.current = '';
    setTranscript('');
    setErrorMessage(null);
  }, []);

  // Update speech recognition language if changed while listening
  useEffect(() => {
    if (isListeningIntentRef.current) {
      stopListening();
      const timer = setTimeout(() => {
        startListening();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [currentLanguage]);

  // Text to Speech Read-back (🔊)
  const speakText = useCallback(
    (textToSpeak: string, lang: LanguageCode = currentLanguage) => {
      if (!('speechSynthesis' in window)) {
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = getLanguageTag(lang);
      utterance.rate = 0.92;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const targetLang = getLanguageTag(lang);
      const matchedVoice = voices.find(
        (v) => v.lang.startsWith(targetLang) || v.lang.replace('_', '-').startsWith(targetLang)
      );
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
    audioLevel,
  };
}
