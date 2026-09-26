import base64
import logging
import httpx

logger = logging.getLogger(__name__)

BCP47_MAP = {
    'hi': 'hi-IN', 'bn': 'bn-IN', 'mr': 'mr-IN', 'te': 'te-IN', 
    'ta': 'ta-IN', 'gu': 'gu-IN', 'ur': 'ur-IN', 'kn': 'kn-IN', 
    'od': 'or-IN', 'ml': 'ml-IN', 'en': 'en-IN'
}

BHASHINI_LANG_MAP = {
    'hi': 'hi', 'bn': 'bn', 'mr': 'mr', 'te': 'te', 
    'ta': 'ta', 'gu': 'gu', 'ur': 'ur', 'kn': 'kn', 
    'od': 'or', 'ml': 'ml', 'en': 'en'
}

class SpeechAdapter:
    def __init__(self, sarvam_api_key, bhashini_api_key=None, bhashini_user_id=None, bhashini_pipeline_id=None):
        self.sarvam_api_key = sarvam_api_key
        self.bhashini_api_key = bhashini_api_key
        self.bhashini_user_id = bhashini_user_id
        self.bhashini_pipeline_id = bhashini_pipeline_id
        
    async def _bhashini_call(self, payload: dict) -> dict:
        if not self.bhashini_api_key or not self.bhashini_pipeline_id:
            raise ValueError("Bhashini keys not configured")
            
        url = 'https://dhruva-api.bhashini.gov.in/services/inference/pipeline'
        headers = {
            'Authorization': self.bhashini_api_key,
            'Content-Type': 'application/json'
        }
        if self.bhashini_user_id:
            headers['userID'] = self.bhashini_user_id
            
        payload['pipelineRequestConfig'] = {
            'pipelineId': self.bhashini_pipeline_id
        }
        
        async with httpx.AsyncClient() as client:
            res = await client.post(url, headers=headers, json=payload, timeout=30.0)
            res.raise_for_status()
            return res.json()

    async def transcribe(self, audio_bytes: bytes, lang: str) -> str:
        # Try Bhashini first if configured
        if self.bhashini_api_key and self.bhashini_pipeline_id:
            try:
                b_lang = BHASHINI_LANG_MAP.get(lang, 'hi')
                audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')
                payload = {
                    "pipelineTasks": [{"taskType": "asr", "config": {"language": {"sourceLanguage": b_lang}}}],
                    "inputData": {"audio": [{"audioContent": audio_b64}]}
                }
                data = await self._bhashini_call(payload)
                return data['pipelineResponse'][0]['output'][0]['source']
            except Exception as e:
                logger.error(f"Bhashini STT failed: {e}")
        
        # Fallback to Sarvam
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
                return "[STT unavailable - please type your query]"
                    
    async def synthesize(self, text: str, lang: str) -> bytes:
        # Try Bhashini first if configured
        if self.bhashini_api_key and self.bhashini_pipeline_id:
            try:
                b_lang = BHASHINI_LANG_MAP.get(lang, 'hi')
                payload = {
                    "pipelineTasks": [{"taskType": "tts", "config": {"language": {"sourceLanguage": b_lang}, "gender": "female"}}],
                    "inputData": {"input": [{"source": text}]}
                }
                data = await self._bhashini_call(payload)
                audio_b64 = data['pipelineResponse'][0]['audio'][0]['audioContent']
                return base64.b64decode(audio_b64)
            except Exception as e:
                logger.error(f"Bhashini TTS failed: {e}")

        # Fallback to Sarvam
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
                return b""

    async def translate(self, text: str, source_lang: str, target_lang: str) -> str:
        # Try Bhashini first if configured
        if self.bhashini_api_key and self.bhashini_pipeline_id:
            try:
                b_src = BHASHINI_LANG_MAP.get(source_lang, 'en')
                b_tgt = BHASHINI_LANG_MAP.get(target_lang, 'hi')
                payload = {
                    "pipelineTasks": [{"taskType": "translation", "config": {"language": {"sourceLanguage": b_src, "targetLanguage": b_tgt}}}],
                    "inputData": {"input": [{"source": text}]}
                }
                data = await self._bhashini_call(payload)
                return data['pipelineResponse'][0]['output'][0]['target']
            except Exception as e:
                logger.error(f"Bhashini Translate failed: {e}")

        # Fallback to Sarvam
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
                return text
