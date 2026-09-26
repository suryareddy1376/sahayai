import json
import re

def inject_translations():
    with open('full_translations.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 1. Update translations.ts (hi, en)
    with open('src/i18n/translations.ts', 'r', encoding='utf-8') as f:
        content = f.read()

    # Update interface
    if 'authWelcomeBack' not in content:
        keys_to_add = [
            'authWelcomeBack', 'authLoginDesc', 'authJoinTitle', 'authJoinDesc',
            'authEmailLabel', 'authPassLabel', 'authActionLogin', 'authActionSignup',
            'authQuickFill', 'authAutoLogin', 'authAutoSignup'
        ]
        interface_str = "\n".join([f"  {k}: string;" for k in keys_to_add])
        content = content.replace('export interface TranslationStrings {', f'export interface TranslationStrings {{\n{interface_str}')

    for lang in ['hi', 'en']:
        block_match = re.search(fr'({lang}:\s*{{)([^}}]+)(}})', content)
        if block_match:
            # We want to replace the keys in this block with the fully translated ones
            block_content = block_match.group(2)
            # Find the stepOf line, and inject the new keys before it
            # BUT wait, the existing keys (appTagline etc) are already there.
            # Easiest way is to replace the whole block except for the things we don't have.
            # Actually, I can just find 'stepOf:' and inject the new keys right before it.
            if 'authWelcomeBack:' not in block_content:
                # Add the new keys
                new_keys_str = ",\n    ".join([f"{k}: \"{data[lang][k]}\"" for k in [
                    'authWelcomeBack', 'authLoginDesc', 'authJoinTitle', 'authJoinDesc',
                    'authEmailLabel', 'authPassLabel', 'authActionLogin', 'authActionSignup',
                    'authQuickFill', 'authAutoLogin', 'authAutoSignup'
                ]]) + ",\n    stepOf:"
                
                # Update existing keys (like appTagline, etc) with the new translated ones!
                for k in data[lang]:
                    if k not in ['authWelcomeBack', 'authLoginDesc', 'authJoinTitle', 'authJoinDesc',
                                 'authEmailLabel', 'authPassLabel', 'authActionLogin', 'authActionSignup',
                                 'authQuickFill', 'authAutoLogin', 'authAutoSignup']:
                        # Regex replace the existing value
                        # e.g. authLoginTab: 'Log In', or authLoginTab: "Log In",
                        content = re.sub(fr"{k}:\s*['\"].*?['\"],", f"{k}: \"{data[lang][k]}\",", content)
                
                content = content.replace('stepOf:', new_keys_str)

    with open('src/i18n/translations.ts', 'w', encoding='utf-8') as f:
        f.write(content)
        
    # 2. Update lang_bn.ts (bn, te, gu, mr, ta)
    with open('src/i18n/lang_bn.ts', 'r', encoding='utf-8') as f:
        bn_content = f.read()
    for lang in ['bn', 'mr', 'te', 'ta', 'gu']:
        if f'authWelcomeBack:' not in bn_content:
            new_keys_str = ",\n    ".join([f"{k}: \"{data[lang][k]}\"" for k in [
                'authWelcomeBack', 'authLoginDesc', 'authJoinTitle', 'authJoinDesc',
                'authEmailLabel', 'authPassLabel', 'authActionLogin', 'authActionSignup',
                'authQuickFill', 'authAutoLogin', 'authAutoSignup'
            ]]) + ",\n    stepOf:"
            bn_content = bn_content.replace('stepOf:', new_keys_str)
        
        for k in data[lang]:
            if k not in ['authWelcomeBack', 'authLoginDesc', 'authJoinTitle', 'authJoinDesc',
                         'authEmailLabel', 'authPassLabel', 'authActionLogin', 'authActionSignup',
                         'authQuickFill', 'authAutoLogin', 'authAutoSignup']:
                bn_content = re.sub(fr"{k}:\s*['\"].*?['\"],", f"{k}: \"{data[lang][k]}\",", bn_content)
    with open('src/i18n/lang_bn.ts', 'w', encoding='utf-8') as f:
        f.write(bn_content)
        
    # 3. Update lang_ur.ts (ur, kn, od, ml)
    with open('src/i18n/lang_ur.ts', 'r', encoding='utf-8') as f:
        ur_content = f.read()
    for lang in ['ur', 'kn', 'od', 'ml']:
        if f'authWelcomeBack:' not in ur_content:
            new_keys_str = ",\n    ".join([f"{k}: \"{data[lang][k]}\"" for k in [
                'authWelcomeBack', 'authLoginDesc', 'authJoinTitle', 'authJoinDesc',
                'authEmailLabel', 'authPassLabel', 'authActionLogin', 'authActionSignup',
                'authQuickFill', 'authAutoLogin', 'authAutoSignup'
            ]]) + ",\n    stepOf:"
            ur_content = ur_content.replace('stepOf:', new_keys_str)
        
        for k in data[lang]:
            if k not in ['authWelcomeBack', 'authLoginDesc', 'authJoinTitle', 'authJoinDesc',
                         'authEmailLabel', 'authPassLabel', 'authActionLogin', 'authActionSignup',
                         'authQuickFill', 'authAutoLogin', 'authAutoSignup']:
                ur_content = re.sub(fr"{k}:\s*['\"].*?['\"],", f"{k}: \"{data[lang][k]}\",", ur_content)
    with open('src/i18n/lang_ur.ts', 'w', encoding='utf-8') as f:
        f.write(ur_content)
        
    # 4. Update AuthenticationScreen.tsx
    with open('src/screens/AuthenticationScreen.tsx', 'r', encoding='utf-8') as f:
        auth_ui = f.read()
    
    auth_ui = auth_ui.replace("{mode === 'login' && 'Welcome Back to Sahay AI'}", "{mode === 'login' && t.authWelcomeBack}")
    auth_ui = auth_ui.replace("{mode === 'signup' && 'Join Sahay AI'}", "{mode === 'signup' && t.authJoinTitle}")
    auth_ui = auth_ui.replace("'Log in to access your saved schemes, loan applications, and partner bank status.'", "t.authLoginDesc")
    auth_ui = auth_ui.replace("'Create an account to securely save your profile and apply for government schemes.'", "t.authJoinDesc")
    auth_ui = auth_ui.replace("EMAIL OR MOBILE NUMBER", "{t.authEmailLabel}")
    auth_ui = auth_ui.replace(">PASSWORD<", ">{t.authPassLabel}<")
    auth_ui = auth_ui.replace("Log In to Sahay AI", "{t.authActionLogin}")
    auth_ui = auth_ui.replace("Create My Account", "{t.authActionSignup}")
    auth_ui = auth_ui.replace("PROTOTYPE QUICK FILL:", "{t.authQuickFill}")
    auth_ui = auth_ui.replace("Auto-fill Login", "{t.authAutoLogin}")
    auth_ui = auth_ui.replace("Auto-fill Sign Up", "{t.authAutoSignup}")

    with open('src/screens/AuthenticationScreen.tsx', 'w', encoding='utf-8') as f:
        f.write(auth_ui)

    print('Injected!')

inject_translations()
