import re

keys = [
    'authLoginTab', 'authSignupTab', 'authRecoveryTitle',
    'authFullName', 'authEmailPhone', 'authPassword', 'authConfirmPassword',
    'authRememberMe', 'authForgotPass', 'authSignInBtn', 'authCreateBtn',
    'authSendLinkBtn', 'authBackLogin', 'authAppDesc',
    'profileTitle', 'profileSubtitle'
]

en_vals = {
    'authLoginTab': 'Log In',
    'authSignupTab': 'Create Account',
    'authRecoveryTitle': 'Account Recovery',
    'authFullName': 'Full Name',
    'authEmailPhone': 'Email or Phone Number',
    'authPassword': 'Password',
    'authConfirmPassword': 'Confirm Password',
    'authRememberMe': 'Remember me',
    'authForgotPass': 'Forgot password?',
    'authSignInBtn': 'Sign In',
    'authCreateBtn': 'Create Secure Account',
    'authSendLinkBtn': 'Send Recovery Link',
    'authBackLogin': 'Back to Login',
    'authAppDesc': 'Empowering India’s entrepreneurs and artisans with tailored government schemes, concessional credit, and verified support.',
    'profileTitle': 'Beneficiary Profile',
    'profileSubtitle': 'Please fill out your details to find the best schemes.'
}

hi_vals = {
    'authLoginTab': 'लॉग इन',
    'authSignupTab': 'खाता बनाएं',
    'authRecoveryTitle': 'खाता पुनर्प्राप्ति',
    'authFullName': 'पूरा नाम',
    'authEmailPhone': 'ईमेल या फोन नंबर',
    'authPassword': 'पासवर्ड',
    'authConfirmPassword': 'पासवर्ड की पुष्टि करें',
    'authRememberMe': 'मुझे याद रखें',
    'authForgotPass': 'पासवर्ड भूल गए?',
    'authSignInBtn': 'साइन इन करें',
    'authCreateBtn': 'सुरक्षित खाता बनाएं',
    'authSendLinkBtn': 'रिकवरी लिंक भेजें',
    'authBackLogin': 'लॉग इन पर वापस जाएं',
    'authAppDesc': 'भारत के उद्यमियों और कारीगरों को सरकारी योजनाओं और रियायती ऋण के साथ सशक्त बनाना।',
    'profileTitle': 'लाभार्थी प्रोफ़ाइल',
    'profileSubtitle': 'सर्वोत्तम योजनाएं खोजने के लिए कृपया अपना विवरण भरें।'
}

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add to Interface
    if 'export interface TranslationStrings {' in content and 'authLoginTab' not in content:
        interface_str = "\n".join([f"  {k}: string;" for k in keys])
        content = content.replace('export interface TranslationStrings {', f'export interface TranslationStrings {{\n{interface_str}')

    # For Hindi specifically
    if filepath == 'src/i18n/translations.ts':
        if 'authLoginTab:' not in content:
            hi_str = ",\n    ".join([f"{k}: '{v}'" for k, v in hi_vals.items()]) + ",\n    stepOf:"
            content = content.replace('stepOf: \'कदम\'', hi_str)
            
            en_str = ",\n    ".join([f"{k}: '{v}'" for k, v in en_vals.items()]) + ",\n    stepOf:"
            content = content.replace('stepOf: \'Step\'', en_str)
            
    else:
        # Fallback to English for other languages for now to prevent build errors
        if 'authLoginTab:' not in content:
            # Find all stepOf: occurrences
            en_str = ",\n    ".join([f"{k}: '{v}'" for k, v in en_vals.items()]) + ",\n    stepOf:"
            content = content.replace('stepOf:', en_str)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

try:
    update_file('src/i18n/translations.ts')
    update_file('src/i18n/lang_bn.ts')
    update_file('src/i18n/lang_ur.ts')
    print('Added translation keys successfully.')
except Exception as e:
    print('Error:', e)
