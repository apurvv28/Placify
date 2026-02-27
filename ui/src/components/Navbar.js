import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="fixed w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="text-white font-bold text-xl tracking-tight">Placify</span>
            </a>
          </div>
          
          {/* Desktop Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {['Features', 'Library', 'Pricing', 'Contact'].map((item) => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase()}`} 
                  className="relative group text-gray-300 hover:text-white transition-colors duration-300 px-3 py-2 rounded-md text-sm font-medium" 
                  style={{ textDecoration: 'none' }}
                >
                  <span className="relative z-10">{item}</span>
                  <span className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md"></span>
                  <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-500 group-hover:w-full group-hover:left-0 transition-all duration-300 ease-out"></span>
                </a>
              ))}
            </div>
          </div>
          
          {/* CTA Buttons (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-gray-300 hover:text-white transition px-4 py-2 rounded-md text-sm font-medium border border-transparent hover:border-white/20">
              Log In
            </button>
            <button className="bg-white text-black hover:bg-gray-200 transition px-5 py-2.5 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(255,255,255,0.3)] border-none cursor-pointer">
              Sign Up
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none transition border-none bg-transparent"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-xl border-b border-white/10 absolute w-full transition-all animate-in slide-in-from-top-4">
          <div className="px-4 pt-2 pb-6 space-y-1 sm:px-3">
            {['Features', 'Library', 'Pricing', 'Contact'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                className="relative group block text-gray-300 hover:text-white transition-colors duration-300 px-3 py-3 rounded-md text-base font-medium overflow-hidden" 
                style={{ textDecoration: 'none' }}
              >
                <span className="relative z-10 flex items-center gap-2 group-hover:translate-x-2 transition-transform duration-300">
                  {item}
                </span>
                <span className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md"></span>
                <span className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-indigo-400 to-purple-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top"></span>
              </a>
            ))}
            
            <div className="pt-4 flex flex-col space-y-3">
              <button className="w-full text-center text-gray-300 hover:text-white transition border border-white/20 bg-transparent px-4 py-3 rounded-md text-base font-medium mt-2">
                Log In
              </button>
              <button className="w-full text-center bg-white text-black hover:bg-gray-200 transition px-4 py-3 rounded-md text-base font-bold shadow-[0_0_15px_rgba(255,255,255,0.3)] border-none">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
