import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginCard({ onSwitchToSignup }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data?.message || 'Login failed');
        return;
      }

      localStorage.setItem('placifyToken', data.token);
      localStorage.setItem('placifyUser', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (error) {
      setErrorMessage('Unable to connect to server');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="absolute inset-0 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md p-5 sm:p-6 md:p-8 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
      style={{ backfaceVisibility: 'hidden' }}
    >
      <div className="absolute -top-24 -left-16 w-56 h-56 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 auth-card-shine pointer-events-none" />

      <h2 className="text-xl sm:text-2xl font-bold text-white mb-5 sm:mb-6">Login</h2>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm text-gray-300 mb-2">Email</label>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-lg bg-white/5 border border-white/15 text-white px-4 py-3 outline-none transition-all duration-300 focus:border-indigo-400 focus:bg-white/10 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)]"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-2">Password</label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded-lg bg-white/5 border border-white/15 text-white px-4 py-3 outline-none transition-all duration-300 focus:border-indigo-400 focus:bg-white/10 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)]"
          />
        </div>

        {errorMessage ? <p className="text-sm text-red-300">{errorMessage}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg font-semibold transition-all duration-300 hover:opacity-95 hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(99,102,241,0.35)] active:translate-y-0"
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="mt-6 text-sm text-gray-400 text-center">
        Don’t have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-indigo-300 hover:text-indigo-200 font-medium transition-colors"
        >
          Sign up
        </button>
      </p>
    </div>
  );
}
