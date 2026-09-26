import re

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add to interface in translations.ts
    if 'export interface TranslationStrings {' in content and 'appTagline' not in content:
        content = content.replace('export interface TranslationStrings {', 'export interface TranslationStrings {\n  appTagline: string;\n  welcomeTitle: string;\n  welcomeSubtitle: string;\n  getStarted: string;\n  securePortal: string;')

    # Replace in ALL language objects
    # We find 'stepOf:' and inject our keys right before it.
    content = content.replace('stepOf:', 'appTagline: "Government financial schemes for small craft, shop & trade owners.",\n    welcomeTitle: "Welcome to Sahay AI",\n    welcomeSubtitle: "Find the right government schemes easily",\n    getStarted: "Get Started",\n    securePortal: "Secure Citizen Portal",\n    stepOf:')
            
    # Now for Hindi specifically, let's translate them properly
    if filepath == 'src/i18n/translations.ts':
        content = content.replace(
            'appTagline: "Government financial schemes for small craft, shop & trade owners.",\n    welcomeTitle: "Welcome to Sahay AI",\n    welcomeSubtitle: "Find the right government schemes easily",\n    getStarted: "Get Started",\n    securePortal: "Secure Citizen Portal",\n    stepOf: \'कदम\'',
            'appTagline: "छोटे शिल्प, दुकान और व्यापार मालिकों के लिए सरकारी वित्तीय योजनाएं।",\n    welcomeTitle: "सहाय AI में आपका स्वागत है",\n    welcomeSubtitle: "आसानी से सही सरकारी योजनाएं खोजें",\n    getStarted: "शुरू करें",\n    securePortal: "सुरक्षित नागरिक पोर्टल",\n    stepOf: \'कदम\''
        )
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

update_file('src/i18n/translations.ts')
update_file('src/i18n/lang_bn.ts')
update_file('src/i18n/lang_ur.ts')
print('Keys added to translations')
