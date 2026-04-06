import React from 'react';
import { Github, Twitter, Linkedin, Mail, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const footerLinks = {
  Product: [
    { label: 'Features', to: '/features' },
    { label: 'ATS Algorithm / Criteria', to: '/ats-algorithm-criteria' },
    { label: 'Help', to: '/help' },
  ],
  Company: [
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', to: '/privacy-policy' },
    { label: 'Terms & Conditions', to: '/terms-and-conditions' },
  ],
};

export default function Footer() {
  return (
    <footer className="relative bg-[#0A0A0A] pt-20 pb-12 overflow-hidden border-t font-sans" style={{ borderColor: '#1C1C1C' }}>
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #2A2520 1px, transparent 1px), linear-gradient(to bottom, #2A2520 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Brand and social icons */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-16 pb-12" style={{ borderBottom: '1px solid #1C1C1C' }}>
          <div className="max-w-sm">
            <Link to="/" className="flex items-center gap-2.5 outline-none" style={{ textDecoration: 'none' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,107,53,0.4)]" style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #FF3D00 100%)' }}>
                <Zap size={22} color="#FFFFFF" fill="#FFFFFF" />
              </div>
              <span className="text-2xl font-black tracking-tighter" style={{ color: '#F5F0EB', fontFamily: 'Syne, sans-serif' }}>PLACIFY</span>
            </Link>
            <p className="text-sm mt-5 leading-relaxed font-medium" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>
              Placify is free and open source. Build better resumes and interview readiness with transparent, community-driven tools.
            </p>
          </div>

          <div className="flex gap-3">
             {[<Twitter size={18} />, <Github size={18} />, <Linkedin size={18} />, <Mail size={18} />].map((icon, i) => (
                <a key={i} href="#!" className="w-10 h-10 rounded-lg flex items-center justify-center transition-all border"
                  style={{ backgroundColor: '#111111', borderColor: '#2A2520', color: '#A89E94' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1C1C1C'; e.currentTarget.style.color = '#FF6B35'; e.currentTarget.style.borderColor = 'rgba(255,107,53,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#111111'; e.currentTarget.style.color = '#A89E94'; e.currentTarget.style.borderColor = '#2A2520'; }}
                >
                  {icon}
                </a>
             ))}
          </div>
        </div>

        {/* Sitemap and Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 disabled">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-bold uppercase tracking-widest mb-6" style={{ color: '#F5F0EB', fontFamily: 'JetBrains Mono, monospace' }}>{category}</h4>
              <ul className="space-y-4 m-0 p-0 list-none">
                {links.map((link) => {
                  return (
                    <li key={link.label}>
                      <Link to={link.to} className="text-sm font-medium transition-colors" style={{ color: '#A89E94', textDecoration: 'none', fontFamily: 'DM Sans, sans-serif' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#FF6B35'}
                        onMouseLeave={e => e.currentTarget.style.color = '#A89E94'}
                      >{link.label}</Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {/* Newsletter Form */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-6 inline-flex items-center gap-2" style={{ color: '#E8A430', fontFamily: 'JetBrains Mono, monospace' }}>
              <span className="w-2 h-2 rounded-full bg-[#E8A430] animate-pulse"></span>
              Insider Brief
            </h4>
            <p className="text-sm mb-4 font-medium" style={{ color: '#5C5550', fontFamily: 'DM Sans, sans-serif' }}>Exclusive access to hiring trends and algorithm updates.</p>
            <div className="flex w-full">
              <input type="email" placeholder="professional@email.com" className="w-full bg-[#111111] border-y border-l outline-none px-4 py-3 text-sm text-[#F5F0EB] placeholder-[#5C5550] transition-colors"
                style={{ borderColor: '#2A2520', borderRadius: '8px 0 0 8px', fontFamily: 'DM Sans, sans-serif' }}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,107,53,0.5)'}
                onBlur={e => e.currentTarget.style.borderColor = '#2A2520'}
              />
              <button className="px-5 transition-colors border-none cursor-pointer font-bold text-sm"
                style={{ backgroundColor: '#FF6B35', color: '#FFFFFF', borderRadius: '0 8px 8px 0', fontFamily: 'DM Sans, sans-serif' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FF3D00'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FF6B35'}
              >Join</button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs font-bold tracking-widest uppercase pt-8" style={{ color: '#5C5550', fontFamily: 'JetBrains Mono, monospace', borderTop: '1px solid #1C1C1C' }}>
          <p>© {new Date().getFullYear()} Placify Technologies. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0 pb-4">
            <span style={{ color: '#A89E94' }}>License: <span style={{ color: '#22c55e' }}>Open Source</span></span>
          </div>
        </div>
      </div>
    </footer>
  );
}