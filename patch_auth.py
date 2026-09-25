import re

with open('src/screens/AuthenticationScreen.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add import
if "from '../services/supabaseClient'" not in code:
    code = code.replace(
        "import {",
        "import { supabase } from '../services/supabaseClient';\nimport {",
        1
    )

old_signup = """  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!identifier.trim()) {
      setErrorMessage('Please enter your email or mobile number.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);
    // Simulate prototype account creation delay
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage('Account created successfully! Redirecting...');
      setTimeout(() => {
        onAuthenticated?.();
      }, 500);
    }, 700);
  };"""

new_signup = """  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!identifier.trim()) {
      setErrorMessage('Please enter your email or mobile number.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);
    
    // Convert mobile to mock email if it's 10 digits
    const email = identifier.includes('@') ? identifier : `${identifier}@sahayai.com`;

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) throw error;
      
      setSuccessMessage('Account created successfully! Redirecting...');
      setTimeout(() => {
        onAuthenticated?.();
      }, 500);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };"""

code = code.replace(old_signup, new_signup)

old_login = """  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Please enter your email or mobile number.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    // Simulate prototype authentication delay
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage('Logged in successfully! Redirecting...');
      setTimeout(() => {
        onAuthenticated?.();
      }, 500);
    }, 700);
  };"""

new_login = """  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Please enter your email or mobile number.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    
    // Convert mobile to mock email if it's 10 digits
    const email = identifier.includes('@') ? identifier : `${identifier}@sahayai.com`;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setSuccessMessage('Logged in successfully! Redirecting...');
      setTimeout(() => {
        onAuthenticated?.();
      }, 500);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Invalid credentials.');
    } finally {
      setIsLoading(false);
    }
  };"""

code = code.replace(old_login, new_login)

with open('src/screens/AuthenticationScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
