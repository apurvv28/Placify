import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import LoginCard from './LoginCard';
import SignupCard from './SignupCard';

export default function AuthFlipPage() {
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('placifyToken');
    if (token) navigate('/dashboard', { replace: true });
  }, [navigate]);

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 relative overflow-hidden"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      {/* Ember radial glow */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,107,53,0.09) 0%, transparent 70%)' }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(255,107,53,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,107,53,0.03) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Back link */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm transition-colors"
          style={{ textDecoration: 'none', color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}
          onMouseEnter={e => e.currentTarget.style.color = '#FF6B35'}
          onMouseLeave={e => e.currentTarget.style.color = '#A89E94'}
        >
          ← Back to home
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md mt-8 sm:mt-0 animate-auth-float">

        {/* Title */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Zap size={20} style={{ color: '#FF6B35', fill: '#FF6B35' }} />
            <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold" style={{ color: '#F5F0EB', fontFamily: 'Syne, sans-serif' }}>
              Welcome to Placify
            </span>
          </div>
          <p className="text-sm md:text-base" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>
            One secure place to sign in or create your account.
          </p>
        </div>

        {/* Tab toggle — ember underline style */}
        <div
          className="mb-4 flex items-center relative"
          style={{ borderBottom: '1px solid #2A2520' }}
        >
          {['Login', 'Sign Up'].map((label, idx) => {
            const active = idx === 0 ? !isSignup : isSignup;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setIsSignup(idx === 1)}
                className="relative flex-1 py-3 text-sm font-medium transition-colors duration-200 bg-transparent border-none cursor-pointer"
                style={{
                  color: active ? '#F5F0EB' : '#A89E94',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                {label}
                {/* Ember underline */}
                <span
                  className="absolute bottom-[-1px] left-1/2 -translate-x-1/2 h-[2px] transition-all duration-300"
                  style={{
                    width: active ? '80%' : '0',
                    background: 'linear-gradient(90deg, #FF6B35, #E8A430)',
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* Flip card */}
        <div
          className="relative w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            height: isSignup ? '540px' : '490px',
            transformStyle: 'preserve-3d',
            transform: isSignup ? 'rotateY(180deg)' : 'rotateY(0deg)',
            perspective: '1000px',
          }}
        >
          <LoginCard onSwitchToSignup={() => setIsSignup(true)} />
          <SignupCard onSwitchToLogin={() => setIsSignup(false)} />
        </div>
      </div>
    </main>
  );
}
