import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2, Mail, ShieldCheck } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const inputStyle = {
  width: '100%',
  borderRadius: '10px',
  backgroundColor: '#1C1C1C',
  border: '1px solid #2A2520',
  color: '#F5F0EB',
  padding: '13px 16px',
  outline: 'none',
  fontSize: '14px',
  fontFamily: 'DM Sans, sans-serif',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const stepLabels = ['Email', 'Verify OTP', 'New Password'];

export default function ForgotPasswordPage() {
  const [step, setStep] = useState('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('placifyToken');
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const clearStatus = () => {
    setMessage('');
    setErrorMessage('');
  };

  const handleRequestCode = async (event) => {
    event.preventDefault();
    clearStatus();

    if (!email.trim()) {
      setErrorMessage('Please enter your registered email address');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE}/api/auth/forgot-password/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data?.message || 'Unable to send reset code');
        return;
      }

      setMessage(data?.message || 'Reset code sent');
      setStep('verify');
    } catch (error) {
      setErrorMessage('Unable to connect to server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    clearStatus();

    if (!otp.trim()) {
      setErrorMessage('Please enter the 6-digit code from your email');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE}/api/auth/forgot-password/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data?.message || 'Invalid code');
        return;
      }

      setResetToken(data.resetToken);
      setMessage('Code verified. Create a new password next.');
      setStep('reset');
    } catch (error) {
      setErrorMessage('Unable to connect to server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    clearStatus();

    if (!password || !confirmPassword) {
      setErrorMessage('Please fill in both password fields');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE}/api/auth/forgot-password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          resetToken,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data?.message || 'Unable to reset password');
        return;
      }

      localStorage.removeItem('placifyToken');
      localStorage.removeItem('placifyUser');
      setMessage('Password updated successfully. Please log in again.');

      setTimeout(() => {
        navigate('/auth', { replace: true });
      }, 1200);
    } catch (error) {
      setErrorMessage('Unable to connect to server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressIndex = step === 'request' ? 0 : step === 'verify' ? 1 : 2;

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden"
      style={{ background: 'radial-gradient(circle at top, rgba(255,107,53,0.14) 0%, rgba(10,10,10,1) 55%)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(255,107,53,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,107,53,0.03) 1px, transparent 1px)',
          backgroundSize: '34px 34px',
        }}
      />

      <div className="relative z-10 w-full max-w-lg">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 text-sm transition-colors"
            style={{ textDecoration: 'none', color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}
          >
            <ArrowLeft size={16} /> Back to login
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: 'rgba(255,107,53,0.12)', color: '#FFB95C', fontFamily: 'DM Sans, sans-serif' }}>
            <ShieldCheck size={14} /> Password reset
          </div>
        </div>

        <div
          className="rounded-2xl shadow-2xl overflow-hidden"
          style={{ backgroundColor: '#111111', border: '1px solid #2A2520' }}
        >
          <div className="p-6 sm:p-8" style={{ borderBottom: '1px solid #2A2520' }}>
            <h1 className="text-2xl sm:text-3xl font-extrabold mb-3" style={{ color: '#F5F0EB', fontFamily: 'Syne, sans-serif' }}>
              Reset your password
            </h1>
            <p className="text-sm sm:text-base" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>
              We will send a 6-digit code to your registered email, then let you create a new password.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {stepLabels.map((label, index) => {
                const active = index <= progressIndex;
                return (
                  <div
                    key={label}
                    className="rounded-xl px-3 py-2 text-center text-xs sm:text-sm font-medium"
                    style={{
                      backgroundColor: active ? 'rgba(255,107,53,0.12)' : '#1A1A1A',
                      color: active ? '#F5F0EB' : '#6D655E',
                      border: '1px solid #2A2520',
                      fontFamily: 'DM Sans, sans-serif',
                    }}
                  >
                    {label}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {step === 'request' && (
              <form className="space-y-4" onSubmit={handleRequestCode}>
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>Registered email</label>
                  <div className="relative">
                    <Mail size={16} style={{ color: '#FF6B35' }} className="absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="pl-10"
                      style={inputStyle}
                      onFocus={e => { e.currentTarget.style.borderColor = 'rgba(255,107,53,0.60)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.12)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = '#2A2520'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>

                {message && <p className="text-sm" style={{ color: '#7DD3FC', fontFamily: 'DM Sans, sans-serif' }}>{message}</p>}
                {errorMessage && <p className="text-sm" style={{ color: '#FF6B35', fontFamily: 'DM Sans, sans-serif' }}>{errorMessage}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed border-none cursor-pointer text-white"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B35 0%, #FF3D00 100%)',
                    fontFamily: 'DM Sans, sans-serif',
                    boxShadow: '0 0 20px rgba(255,107,53,0.25)',
                  }}
                >
                  {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Sending code...</> : 'Send reset code'}
                </button>
              </form>
            )}

            {step === 'verify' && (
              <form className="space-y-4" onSubmit={handleVerifyOtp}>
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>6-digit code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    style={inputStyle}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(255,107,53,0.60)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.12)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#2A2520'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>

                <p className="text-sm" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>
                  Code sent to <span style={{ color: '#F5F0EB' }}>{email}</span>
                </p>

                {message && <p className="text-sm" style={{ color: '#7DD3FC', fontFamily: 'DM Sans, sans-serif' }}>{message}</p>}
                {errorMessage && <p className="text-sm" style={{ color: '#FF6B35', fontFamily: 'DM Sans, sans-serif' }}>{errorMessage}</p>}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    className="flex-1 py-3 rounded-lg font-semibold border-none cursor-pointer"
                    style={{ backgroundColor: '#1A1A1A', color: '#F5F0EB', fontFamily: 'DM Sans, sans-serif' }}
                    onClick={() => setStep('request')}
                  >
                    Change email
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed border-none cursor-pointer text-white"
                    style={{
                      background: 'linear-gradient(135deg, #FF6B35 0%, #FF3D00 100%)',
                      fontFamily: 'DM Sans, sans-serif',
                      boxShadow: '0 0 20px rgba(255,107,53,0.25)',
                    }}
                  >
                    {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Verifying...</> : 'Verify code'}
                  </button>
                </div>
              </form>
            )}

            {step === 'reset' && (
              <form className="space-y-4" onSubmit={handleResetPassword}>
                <div>
                  <label className="block text-sm mb-2" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>New password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a new password"
                    style={inputStyle}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(255,107,53,0.60)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.12)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#2A2520'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>Confirm new password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    style={inputStyle}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(255,107,53,0.60)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.12)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#2A2520'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>

                {message && <p className="text-sm" style={{ color: '#7DD3FC', fontFamily: 'DM Sans, sans-serif' }}>{message}</p>}
                {errorMessage && <p className="text-sm" style={{ color: '#FF6B35', fontFamily: 'DM Sans, sans-serif' }}>{errorMessage}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed border-none cursor-pointer text-white"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B35 0%, #FF3D00 100%)',
                    fontFamily: 'DM Sans, sans-serif',
                    boxShadow: '0 0 20px rgba(255,107,53,0.25)',
                  }}
                >
                  {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Updating...</> : 'Update password'}
                </button>
              </form>
            )}

            <div className="mt-6 rounded-xl px-4 py-3" style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2520' }}>
              <p className="text-sm flex items-start gap-2" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>
                <CheckCircle2 size={16} style={{ color: '#FF6B35', marginTop: '2px', flexShrink: 0 }} />
                After the password is changed, your session will be cleared and you will return to the login page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}