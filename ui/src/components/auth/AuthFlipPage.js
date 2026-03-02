import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginCard from './LoginCard';
import SignupCard from './SignupCard';

export default function AuthFlipPage() {
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('placifyToken');
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 py-8 sm:py-12 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-16 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-[120px] animate-orb-float" />
        <div className="absolute bottom-16 right-10 w-72 h-72 bg-indigo-600/20 rounded-full blur-[120px] animate-orb-float-delayed" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
          style={{ textDecoration: 'none' }}
        >
          ← Back to home
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md perspective-1000 mt-8 sm:mt-0 animate-auth-float">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">Welcome to Placify</h1>
          <p className="text-gray-400 text-sm md:text-base">
            One secure place to sign in or create your account.
          </p>
        </div>

        <div className="mb-4 p-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm flex items-center relative">
          <span
            className={`absolute top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ease-out ${isSignup ? 'left-[calc(50%+0.125rem)]' : 'left-1'}`}
          />
          <button
            type="button"
            onClick={() => setIsSignup(false)}
            className={`relative z-10 w-1/2 py-2.5 text-sm font-medium rounded-full transition-colors duration-300 ${
              !isSignup ? 'text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setIsSignup(true)}
            className={`relative z-10 w-1/2 py-2.5 text-sm font-medium rounded-full transition-colors duration-300 ${
              isSignup ? 'text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        <div
          className="relative w-full h-[500px] sm:h-[520px] transition-transform duration-900 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            transformStyle: 'preserve-3d',
            transform: isSignup ? 'rotateY(180deg) scale(1.01)' : 'rotateY(0deg) scale(1)',
          }}
        >
          <LoginCard onSwitchToSignup={() => setIsSignup(true)} />
          <SignupCard onSwitchToLogin={() => setIsSignup(false)} />
        </div>
      </div>
    </main>
  );
}
