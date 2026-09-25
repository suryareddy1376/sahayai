import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace('setSubmittedApp(response.receipt);', 'setSubmittedApp(response as any);')

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

with open('src/services/agentApi.ts', 'r', encoding='utf-8') as f:
    api = f.read()

api = api.replace('Promise<{ success: boolean; applicationId: string; receipt: ApplicationTrackerData }>', 'Promise<ApplicationTrackerData>')

with open('src/services/agentApi.ts', 'w', encoding='utf-8') as f:
    f.write(api)
