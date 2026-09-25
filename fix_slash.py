import re

def strip_slash(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        code = f.read()
    
    replacement = "const _rawUrl = (import.meta as any).env?.VITE_BACKEND_URL || 'https://sahayai-4dzp.onrender.com';\nconst BACKEND_URL = _rawUrl.endsWith('/') ? _rawUrl.slice(0, -1) : _rawUrl;"
    
    code = re.sub(r'const BACKEND_URL = .*?;', replacement, code)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(code)

strip_slash('src/services/beneficiaryIntakeApi.ts')
strip_slash('src/services/agentApi.ts')
