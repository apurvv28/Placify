import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

const inputStyle = {
  width: '100%',
  borderRadius: '8px',
  backgroundColor: '#1C1C1C',
  border: '1px solid #2A2520',
  color: '#F5F0EB',
  padding: '12px 16px',
  outline: 'none',
  fontSize: '14px',
  fontFamily: 'DM Sans, sans-serif',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

export default function SignupCard({ onSwitchToLogin }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setErrorMessage('Please fill in all fields'); return;
    }
    try {
      setIsSubmitting(true); setErrorMessage('');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name.trim(), email: formData.email.trim(), password: formData.password }),
      });
      const data = await response.json();
      if (!response.ok) { setErrorMessage(data?.message || 'Signup failed'); return; }
      setFormData({ name: '', email: '', password: '' });
      onSwitchToLogin();
    } catch (error) {
      setErrorMessage('Unable to connect to server');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="absolute inset-0 overflow-hidden shadow-2xl"
      style={{
        backfaceVisibility: 'hidden',
        transform: 'rotateY(180deg)',
        backgroundColor: '#111111',
        border: '1px solid #2A2520',
        borderRadius: '12px',
        padding: '28px',
      }}
    >
      {/* Subtle ember glow in corner */}
      <div
        className="absolute -bottom-20 -right-16 w-56 h-56 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(232,164,48,0.07) 0%, transparent 70%)' }}
      />

      <h2
        className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6"
        style={{ color: '#F5F0EB', fontFamily: 'Syne, sans-serif' }}
      >
        Sign Up
      </h2>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm mb-2" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>Full Name</label>
          <input
            type="text" name="name" placeholder="Your full name"
            value={formData.name} onChange={handleChange} style={inputStyle}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(255,107,53,0.60)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.12)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#2A2520'; e.currentTarget.style.boxShadow = 'none'; }}
          />
        </div>
        <div>
          <label className="block text-sm mb-2" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>Email</label>
          <input
            type="email" name="email" placeholder="you@example.com"
            value={formData.email} onChange={handleChange} style={inputStyle}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(255,107,53,0.60)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.12)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#2A2520'; e.currentTarget.style.boxShadow = 'none'; }}
          />
        </div>
        <div>
          <label className="block text-sm mb-2" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>Password</label>
          <input
            type="password" name="password" placeholder="Create a password"
            value={formData.password} onChange={handleChange} style={inputStyle}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(255,107,53,0.60)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.12)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#2A2520'; e.currentTarget.style.boxShadow = 'none'; }}
          />
        </div>

        {errorMessage && (
          <p className="text-sm" style={{ color: '#FF6B35', fontFamily: 'DM Sans, sans-serif' }}>{errorMessage}</p>
        )}

        <button
          type="submit" disabled={isSubmitting}
          className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed border-none cursor-pointer text-white"
          style={{
            background: 'linear-gradient(135deg, #FF6B35 0%, #FF3D00 100%)',
            fontFamily: 'DM Sans, sans-serif',
            boxShadow: '0 0 20px rgba(255,107,53,0.25)',
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 30px rgba(255,107,53,0.45)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(255,107,53,0.25)'}
        >
          {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Creating Account...</> : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-sm text-center" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>
        Already have an account?{' '}
        <button
          type="button" onClick={onSwitchToLogin}
          className="font-medium transition-colors bg-transparent border-none cursor-pointer p-0"
          style={{ color: '#FF6B35' }}
          onMouseEnter={e => e.currentTarget.style.color = '#E8A430'}
          onMouseLeave={e => e.currentTarget.style.color = '#FF6B35'}
        >
          Login
        </button>
      </p>
    </div>
  );
}
