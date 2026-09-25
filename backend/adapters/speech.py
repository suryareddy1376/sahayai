import base64
import logging
import httpx

logger = logging.getLogger(__name__)

BCP47_MAP = {
    'hi': 'hi-IN', 'bn': 'bn-IN', 'mr': 'mr-IN', 'te': 'te-IN', 
    'ta': 'ta-IN', 'gu': 'gu-IN', 'ur': 'ur-IN', 'kn': 'kn-IN', 
    'od': 'or-IN', 'ml': 'ml-IN', 'en': 'en-IN'
}

class SpeechAdapter:
    def __init__(self, sarvam_api_key, bhashini_api_key=None, bhashini_user_id=None):
        self.sarvam_api_key = sarvam_api_key
        self.bhashini_api_key = bhashini_api_key
        self.bhashini_user_id = bhashini_user_id
        
    async def transcribe(self, audio_bytes: bytes, lang: str) -> str:
        bcp47 = BCP47_MAP.get(lang, 'hi-IN')
        headers = {'api-subscription-key': self.sarvam_api_key}
        files = {'file': ('audio.wav', audio_bytes, 'audio/wav')}
        data = {'language_code': bcp47}
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post('https://api.sarvam.ai/speech-to-text', headers=headers, data=data, files=files, timeout=30.0)
                response.raise_for_status()
                return response.json().get('transcript', '')
            except Exception as e:
                logger.error(f"Sarvam STT failed: {e}")
                try:
                    response = await client.post('https://api.sarvam.ai/speech-to-text', headers=headers, data=data, files=files, timeout=30.0)
                    response.raise_for_status()
                    return response.json().get('transcript', '')
                except Exception as e2:
                    logger.error(f"Sarvam STT retry failed: {e2}")
                    return "[STT unavailable - please type your query]"
                    
    async def synthesize(self, text: str, lang: str) -> bytes:
        bcp47 = BCP47_MAP.get(lang, 'hi-IN')
        headers = {
            'api-subscription-key': self.sarvam_api_key,
            'Content-Type': 'application/json'
        }
        body = {
            "inputs": [text],
            "target_language_code": bcp47,
            "speaker": "meera",
            "model": "bulbul:v2"
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post('https://api.sarvam.ai/text-to-speech', headers=headers, json=body, timeout=30.0)
                response.raise_for_status()
                audio_base64 = response.json().get('audios', [''])[0]
                return base64.b64decode(audio_base64) if audio_base64 else b""
            except Exception as e:
                logger.error(f"Sarvam TTS failed: {e}")
                try:
                    response = await client.post('https://api.sarvam.ai/text-to-speech', headers=headers, json=body, timeout=30.0)
                    response.raise_for_status()
                    audio_base64 = response.json().get('audios', [''])[0]
                    return base64.b64decode(audio_base64) if audio_base64 else b""
                except Exception as e2:
                    logger.error(f"Sarvam TTS retry failed: {e2}")
                    return b""

    async def translate(self, text: str, source_lang: str, target_lang: str) -> str:
        bcp47_source = BCP47_MAP.get(source_lang, 'en-IN')
        bcp47_target = BCP47_MAP.get(target_lang, 'hi-IN')
        headers = {
            'api-subscription-key': self.sarvam_api_key,
            'Content-Type': 'application/json'
        }
        body = {
            "input": text,
            "source_language_code": bcp47_source,
            "target_language_code": bcp47_target,
            "model": "mayura:v1"
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post('https://api.sarvam.ai/translate', headers=headers, json=body, timeout=30.0)
                response.raise_for_status()
                return response.json().get('translated_text', text)
            except Exception as e:
                logger.error(f"Sarvam Translate failed: {e}")
                try:
                    response = await client.post('https://api.sarvam.ai/translate', headers=headers, json=body, timeout=30.0)
                    response.raise_for_status()
                    return response.json().get('translated_text', text)
                except Exception as e2:
                    logger.error(f"Sarvam Translate retry failed: {e2}")
                    return text
