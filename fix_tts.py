import re

def rewrite():
    with open('src/hooks/useVoice.ts', 'r', encoding='utf-8') as f:
        content = f.read()

    new_func = """  // Text to Speech
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
"""

    # We need to replace from '  // Text to Speech' to '  const resetTranscript'
    start_str = '  // Text to Speech'
    end_str = '  const resetTranscript'
    
    start_idx = content.find(start_str)
    end_idx = content.find(end_str)
    
    if start_idx != -1 and end_idx != -1:
        new_content = content[:start_idx] + new_func + '\n' + content[end_idx:]
        with open('src/hooks/useVoice.ts', 'w', encoding='utf-8') as f:
            f.write(new_content)
        print('Updated useVoice.ts')
    else:
        print('Failed to find bounds')

rewrite()
