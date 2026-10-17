import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound } from 'lucide-react';
import { AdminAuth, getAuthorizedAdminEmail } from '../../lib/adminAuth';
import { BRAND_CONFIG } from '../../config/brand';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const authorizedEmail = getAuthorizedAdminEmail();

  // If already authenticated, redirect straight to dashboard
  useEffect(() => {
    if (AdminAuth.isAuthenticated()) {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const [email, setEmail] = useState(authorizedEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState(authorizedEmail);
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [resetCode, setResetCode] = useState('');
  const [generatedDemoCode, setGeneratedDemoCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const result = await AdminAuth.login(email, password);
      setIsLoading(false);

      if (result.success) {
        const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin';
        navigate(from, { replace: true });
      } else {
        setErrorMessage(result.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('An unexpected error occurred during login. Please try again.');
    }
  };

  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotMessage('');

    const res = AdminAuth.requestPasswordReset(forgotEmail);
    if (res.success) {
      setResetStep('verify');
      setGeneratedDemoCode(res.tempCode || '');
      setForgotMessage(res.message);
    } else {
      setForgotError(res.message);
    }
  };

  const handleConfirmReset = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    const res = AdminAuth.resetPassword(resetCode, newPassword);
    if (res.success) {
      setForgotMessage('Password successfully updated! You can now log in.');
      setTimeout(() => {
        setIsForgotModalOpen(false);
        setResetStep('request');
        setResetCode('');
        setNewPassword('');
        setGeneratedDemoCode('');
      }, 1500);
    } else {
      setForgotError(res.error || 'Password reset failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Return to Public Website */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Public Customer Website</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-none bg-[#176B52] text-white flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck size={26} strokeWidth={2.2} />
          </div>
          <h1 className="mt-3 text-xl font-bold tracking-tight text-slate-900">
            {BRAND_CONFIG.name} Admin Console
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Operations Management for Junagadh, Gujarat
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/90 rounded-none sm:px-8">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 rounded-none bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2 animate-fadeIn">
                <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Administrator User ID / Email *
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="junagadh or admin@homeease.in"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-none border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#176B52] focus:ring-1 focus:ring-[#176B52] transition-all bg-white"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Authorized Administrator ID: <strong className="text-slate-600">{authorizedEmail}</strong>
              </p>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password *
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-[11px] font-semibold text-[#176B52] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-none border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#176B52] focus:ring-1 focus:ring-[#176B52] transition-all bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Login Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-none text-xs sm:text-sm font-bold bg-[#176B52] hover:bg-[#125742] text-white shadow-xs transition-all active:scale-98 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Verifying Credentials...</span>
                ) : (
                  <>
                    <KeyRound size={16} />
                    <span>Sign In to Admin Console</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 text-center leading-relaxed">
            Strict email authorization enabled. Public registration is disabled. Unauthorized login attempts are logged and rate-limited.
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-none w-full max-w-sm p-6 shadow-xl border border-slate-200 animate-scaleIn">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Administrator Password Reset</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter the authorized administrator email to generate a secure reset token.
            </p>

            {forgotError && (
              <div className="mb-3 p-2.5 rounded-none bg-red-50 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotMessage && (
              <div className="mb-3 p-2.5 rounded-none bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 size={14} className="shrink-0" />
                <span>{forgotMessage}</span>
              </div>
            )}

            {resetStep === 'request' ? (
              <form onSubmit={handleRequestReset} className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Authorized Admin ID / Email
                  </label>
                  <input
                    type="text"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="junagadh or admin@homeease.in"
                    className="w-full p-2 rounded-none border border-slate-200 text-xs text-slate-900"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-3 py-1.5 rounded-none text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-none text-xs font-bold bg-[#176B52] text-white hover:bg-[#125742]"
                  >
                    Generate Token
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleConfirmReset} className="space-y-3">
                {generatedDemoCode && (
                  <div className="p-2.5 rounded-none bg-amber-50 border border-amber-200 text-xs text-amber-900 font-mono text-center">
                    Verification Code: <strong>{generatedDemoCode}</strong>
                  </div>
                )}
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="Enter code"
                    className="w-full p-2 rounded-none border border-slate-200 text-xs text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    New Admin Password (min. 8 characters)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full p-2 rounded-none border border-slate-200 text-xs text-slate-900"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setResetStep('request');
                      setIsForgotModalOpen(false);
                    }}
                    className="px-3 py-1.5 rounded-none text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-none text-xs font-bold bg-[#176B52] text-white hover:bg-[#125742]"
                  >
                    Save New Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
