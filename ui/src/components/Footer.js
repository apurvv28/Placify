import React from 'react';
import { Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const footerLinks = {
  Product: ['Features', 'Pricing', 'Library', 'API'],
  Company: ['About', 'Blog', 'Careers', 'Press'],
  Resources: ['Help Center', 'Contact', 'Privacy', 'Terms'],
};

export default function Footer() {
  return (
    <footer className="relative bg-black border-t border-white/10 py-16">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo and social links */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 mb-12">
          <div className="text-center md:text-left">
            <a href="/" className="flex items-center gap-2 justify-center md:justify-start" style={{ textDecoration: 'none' }}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="text-white font-bold text-xl tracking-tight">Placify</span>
            </a>
            <p className="text-sm text-gray-500 mt-4 max-w-xs">
              AI‑powered resume optimization for students and professionals.
            </p>
          </div>

          <div className="flex gap-4">
            {/* Twitter */}
            <a 
              href="https://twitter.com/placify" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition p-2 rounded-full bg-white/5 hover:bg-white/10"
            >
              <Twitter size={20} />
            </a>

            {/* GitHub */}
            <a 
              href="https://github.com/placify" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition p-2 rounded-full bg-white/5 hover:bg-white/10"
            >
              <Github size={20} />
            </a>

            {/* LinkedIn */}
            <a 
              href="https://linkedin.com/company/placify" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition p-2 rounded-full bg-white/5 hover:bg-white/10"
            >
              <Linkedin size={20} />
            </a>

            {/* Email */}
            <a 
              href="mailto:hello@placify.com" 
              className="text-gray-400 hover:text-white transition p-2 rounded-full bg-white/5 hover:bg-white/10"
            >
              <Mail size={20} />
            </a>
          </div>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-semibold mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => {
                  const linkPath = `/${link.toLowerCase().replace(/\s+/g, '-')}`;
                  return (
                    <li key={link}>
                      <Link
                        to={linkPath}
                        className="text-gray-400 hover:text-indigo-400 text-sm transition"
                      >
                        {link}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-semibold mb-4">Stay updated</h4>
            <p className="text-sm text-gray-400 mb-3">Get tips and product updates.</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-white/5 border border-white/10 rounded-l-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-r-lg text-sm font-medium transition">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p className="flex items-center gap-1">
            © {new Date().getFullYear()} Placify. Made with <Heart size={14} className="text-red-400 fill-red-400" /> for students.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-indigo-400 transition">Privacy</Link>
            <Link to="/terms" className="hover:text-indigo-400 transition">Terms</Link>
            <Link to="/cookies" className="hover:text-indigo-400 transition">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}