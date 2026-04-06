import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Zap } from 'lucide-react';

const STATIC_NAV_LINKS = [
  { label: 'Features', to: '/features' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Help', to: '/help' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="fixed w-full z-50 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#2A2520]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
              <Zap size={18} className="text-[#FF6B35] fill-[#FF6B35]" />
              <span
                className="text-[#F5F0EB] font-bold text-lg sm:text-xl tracking-tight"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                Placify
              </span>
            </Link>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              {STATIC_NAV_LINKS.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="relative group text-[#A89E94] hover:text-[#F5F0EB] transition-colors duration-200 px-2 py-2 text-sm font-medium"
                  style={{ textDecoration: 'none', fontFamily: 'DM Sans, sans-serif' }}
                >
                  <span className="relative z-10">{item.label}</span>
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#FF6B35] group-hover:w-full transition-all duration-300 ease-out" />
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center">
            <Link
              to="/auth"
              className="relative overflow-hidden flex items-center gap-2 bg-gradient-to-r from-[#FF6B35] to-[#FF3D00] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,107,53,0.35)] hover:-translate-y-0.5"
              style={{ textDecoration: 'none', fontFamily: 'DM Sans, sans-serif' }}
            >
              Sign In
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-lg text-[#A89E94] hover:text-[#F5F0EB] hover:bg-[#1C1C1C] focus:outline-none transition border-none bg-transparent"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-[#0A0A0A]/70 backdrop-blur-3xl border-b border-[#2A2520] absolute w-full shadow-2xl">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {STATIC_NAV_LINKS.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={closeMenu}
                className="relative group block text-[#A89E94] hover:text-[#F5F0EB] transition-colors duration-200 px-3 py-3 rounded-lg text-base font-medium overflow-hidden"
                style={{ textDecoration: 'none' }}
              >
                <span className="relative z-10 flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-200">
                  {item.label}
                </span>
                <span className="absolute left-0 top-0 w-[2px] h-full bg-[#FF6B35] scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-top" />
              </Link>
            ))}
            <div className="pt-4">
              <Link
                to="/auth"
                onClick={closeMenu}
                className="w-full text-center block bg-gradient-to-r from-[#FF6B35] to-[#FF3D00] text-white hover:shadow-[0_0_20px_rgba(255,107,53,0.35)] transition-all px-4 py-3 rounded-lg text-base font-semibold border-none"
                style={{ textDecoration: 'none' }}
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
