import re

def update_auth_handling():
    # 1. Update App.tsx
    with open('src/App.tsx', 'r', encoding='utf-8') as f:
        app = f.read()
    
    app = app.replace(
        'const handleAuthenticated = useCallback(() => {',
        'const handleAuthenticated = useCallback((existingProfile?: any) => {'
    )
    
    app = app.replace(
        "onComplete: () => { setPipeline(null); navigate('/profile'); }",
        "onComplete: () => { setPipeline(null); if (existingProfile) { setBeneficiaryProfile(existingProfile); navigate('/dashboard'); } else { navigate('/profile'); } }"
    )

    with open('src/App.tsx', 'w', encoding='utf-8') as f:
        f.write(app)
        
    # 2. Update AuthenticationScreen.tsx
    with open('src/screens/AuthenticationScreen.tsx', 'r', encoding='utf-8') as f:
        auth = f.read()
        
    auth = auth.replace(
        'onAuthenticated?: () => void;',
        'onAuthenticated?: (profile?: any) => void;'
    )
    
    auth_logic = """
      if (error) throw error;
      
      // Try fetching profile from Supabase
      let fetchedProfile = null;
      if (data?.user?.id) {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('profile_data')
          .eq('id', data.user.id)
          .single();
          
        if (profileData && profileData.profile_data) {
          fetchedProfile = profileData.profile_data;
        }
      }

      localStorage.setItem('sahay_user_phone', identifier.trim());
      setSuccessMessage(t.authSignInBtn + '... ');
      setTimeout(() => {
        onAuthenticated?.(fetchedProfile);
      }, 500);
"""
    
    auth = auth.replace(
        """
      if (error) throw error;

      localStorage.setItem('sahay_user_phone', identifier.trim());
      setSuccessMessage('Logged in successfully! Redirecting...');
      setTimeout(() => {
        onAuthenticated?.();
      }, 500);""",
        auth_logic
    )
    
    with open('src/screens/AuthenticationScreen.tsx', 'w', encoding='utf-8') as f:
        f.write(auth)
    
    print('Updated auth handling')

update_auth_handling()
