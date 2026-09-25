import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import {
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  KeyRound,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export interface AuthenticationScreenProps {
  onAuthenticated?: () => void;
  initialMode?: 'login' | 'signup';
}

type AuthMode = 'login' | 'signup' | 'forgot-password';

export const AuthenticationScreen: React.FC<AuthenticationScreenProps> = ({
  onAuthenticated,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState(''); // Email or Phone
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Forgot Password State
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Feedback State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Quick Demo Autofill Helper
  const handleQuickDemoFill = (role: 'login' | 'signup') => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (role === 'login') {
      setMode('login');
      setIdentifier('artisan.ramesh@gmail.com');
      setPassword('sahay@2026');
    } else {
      setMode('signup');
      setFullName('Ramesh Sharma');
      setIdentifier('+91 98765 43210');
      setPassword('sahay@2026');
      setConfirmPassword('sahay@2026');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
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
    const email = identifier.includes('@') ? identifier.trim() : `${identifier.replace(/[\s\-\+\(\)]/g, '')}@sahayai.com`;

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
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
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
    const email = identifier.includes('@') ? identifier.trim() : `${identifier.replace(/[\s\-\+\(\)]/g, '')}@sahayai.com`;

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
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!forgotIdentifier.trim()) {
      setErrorMessage('Please enter your registered email or mobile number.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setForgotSubmitted(true);
    }, 600);
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
    setForgotSubmitted(false);
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 pt-2 pb-12 px-4 sm:px-0">
      {/* SAHAY AI Branding & National Emblem Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-900 border border-blue-200 px-3.5 py-1 rounded-full text-xs font-bold tracking-wide shadow-xs">
          <span>🇮🇳</span>
          <span>Ministry of Social Justice & Empowerment</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Sahay AI <span className="text-blue-600">सहाय</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-medium max-w-md mx-auto">
          Empowering India’s entrepreneurs and artisans with tailored government schemes, concessional credit, and verified support.
        </p>
      </div>

      {/* Main Auth Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-hero overflow-hidden">
        {/* Card Header / Tab Toggle (Login vs Sign Up) */}
        {mode !== 'forgot-password' ? (
          <div className="grid grid-cols-2 p-1.5 bg-slate-100/90 border-b border-slate-200">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`py-3 text-sm font-bold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                mode === 'login'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Log In</span>
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`py-3 text-sm font-bold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                mode === 'signup'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Create Account</span>
            </button>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </button>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Account Recovery
            </span>
          </div>
        )}

        {/* Card Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Welcome Banner Box */}
          <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-xl shrink-0 mt-0.5 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-xs sm:text-sm text-blue-950 leading-relaxed">
              <span className="font-bold block text-blue-900 text-sm mb-0.5">
                {mode === 'login' && 'Welcome Back to Sahay AI'}
                {mode === 'signup' && 'Begin Your Entrepreneurial Journey'}
                {mode === 'forgot-password' && 'Password Assistance'}
              </span>
              {mode === 'login' &&
                'Log in to access your saved schemes, loan applications, and partner bank status.'}
              {mode === 'signup' &&
                'Create an account to explore personalized central and state schemes with zero agent fees.'}
              {mode === 'forgot-password' &&
                'Enter your registered email or mobile number to receive reset instructions.'}
            </div>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm p-3.5 rounded-xl flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm p-3.5 rounded-xl flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {/* MODE 1: LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Identifier Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="login-identifier"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Email or Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="login-identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. artisan.ramesh@gmail.com or 9876543210"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                  >
                    Password <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => switchMode('forgot-password')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-slate-600">
                    Keep me signed in
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3.5 px-5 rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Log In to Sahay AI</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE 2: SIGN UP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="signup-name"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Full Name (as per Aadhaar / PAN) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="signup-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra Sharma"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Email or Mobile */}
              <div className="space-y-1.5">
                <label
                  htmlFor="signup-identifier"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Email or Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="signup-identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="+91 98765 43210 or name@domain.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="signup-password"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password (min 6 characters)"
                    className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="signup-confirm-password"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms Reassurance */}
              <p className="text-[11px] text-slate-500 leading-normal">
                By creating an account, you agree to access official government welfare & credit scheme matching under Indian digital governance guidelines.
              </p>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3.5 px-5 rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Free Sahay Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE 3: FORGOT PASSWORD FORM */}
          {mode === 'forgot-password' && (
            <div>
              {!forgotSubmitted ? (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="forgot-identifier"
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                    >
                      Registered Email or Mobile <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="forgot-identifier"
                        type="text"
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        placeholder="Enter email or 10-digit mobile"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3.5 px-5 rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Send Password Reset Link / OTP</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center space-y-4 py-2">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-slate-900">
                      Reset Instructions Sent!
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                      We have simulated sending verification instructions to{' '}
                      <span className="font-semibold text-slate-800">
                        {forgotIdentifier}
                      </span>
                      . You can check your inbox or mobile SMS.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Return to Log In</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Prototype Demo Fill Buttons */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Prototype Quick Fill:
              </span>
              <span className="text-[11px] text-blue-800 font-medium">
                1-Click test credentials
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoFill('login')}
                className="text-xs py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-center transition-colors cursor-pointer"
              >
                Auto-fill Login
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoFill('signup')}
                className="text-xs py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-center transition-colors cursor-pointer"
              >
                Auto-fill Sign Up
              </button>
            </div>
          </div>
        </div>

        {/* Card Footer Switcher */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 text-center">
          {mode === 'login' ? (
            <p className="text-xs sm:text-sm text-slate-600">
              Don’t have an account yet?{' '}
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className="font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                Create an account
              </button>
            </p>
          ) : mode === 'signup' ? (
            <p className="text-xs sm:text-sm text-slate-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                Log in instead
              </button>
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-slate-600">
              Remembered your password?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                Log in
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Trust & Guarantee Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-center shadow-xs">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-1.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold text-slate-800">Govt Verified</p>
          <p className="text-[11px] text-slate-500">NBCFDC, NSFDC & Mudra</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-center shadow-xs">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-1.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold text-slate-800">100% Free</p>
          <p className="text-[11px] text-slate-500">Zero middleman charges</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-center shadow-xs">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto mb-1.5">
            <Lock className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold text-slate-800">Private & Secure</p>
          <p className="text-[11px] text-slate-500">Protected beneficiary data</p>
        </div>
      </div>
    </div>
  );
};
