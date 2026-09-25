import re

with open('src/services/agentApi.ts', 'r', encoding='utf-8') as f:
    code = f.read()

cached_app = """export function getCachedApplication(): ApplicationTrackerData | null {
  try {
    const cached = localStorage.getItem('sahay_application');
    if (cached) return JSON.parse(cached);
  } catch (e) {}
  return null;
}"""

code = re.sub(
    r'export function getCachedApplication\(\): ApplicationTrackerData \| null \{[\s\S]*?\}',
    cached_app,
    code
)

def repl(match):
    return "    const data = await response.json();\n    localStorage.setItem('sahay_application', JSON.stringify(data));\n    return data;"

code = re.sub(r'    const data = await response\.json\(\);\s*return data;', repl, code)

with open('src/services/agentApi.ts', 'w', encoding='utf-8') as f:
    f.write(code)
