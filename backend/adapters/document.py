import logging
import httpx

logger = logging.getLogger(__name__)

class DocumentAdapter:
    def __init__(self, sarvam_api_key):
        self.sarvam_api_key = sarvam_api_key

    async def extract(self, file_bytes: bytes, file_name: str, doc_type: str) -> dict:
        headers = {'api-subscription-key': self.sarvam_api_key}
        files = {'file': (file_name, file_bytes)}
        data = {'document_type': doc_type}
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post('https://api.sarvam.ai/documents/extract', headers=headers, data=data, files=files, timeout=60.0)
                response.raise_for_status()
                return response.json()
            except Exception as e:
                logger.error(f"Document extraction failed: {e}")
                try:
                    response = await client.post('https://api.sarvam.ai/documents/extract', headers=headers, data=data, files=files, timeout=60.0)
                    response.raise_for_status()
                    return response.json()
                except Exception as e2:
                    logger.error(f"Document extraction retry failed: {e2}")
                    return {"status": "extraction_unavailable"}

    async def ocr(self, file_bytes: bytes, file_name: str) -> str:
        headers = {'api-subscription-key': self.sarvam_api_key}
        files = {'file': (file_name, file_bytes)}
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post('https://api.sarvam.ai/documents/digitise', headers=headers, files=files, timeout=60.0)
                response.raise_for_status()
                return response.text
            except Exception as e:
                logger.error(f"Document OCR failed: {e}")
                try:
                    response = await client.post('https://api.sarvam.ai/documents/digitise', headers=headers, files=files, timeout=60.0)
                    response.raise_for_status()
                    return response.text
                except Exception as e2:
                    logger.error(f"Document OCR retry failed: {e2}")
                    return ""
