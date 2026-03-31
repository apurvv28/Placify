/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        ember: {
          DEFAULT: '#FF6B35',
          hot: '#FF3D00',
          amber: '#E8A430',
        },
        obsidian: {
          primary:   '#0A0A0A',
          secondary: '#111111',
          surface:   '#1C1C1C',
          elevated:  '#242424',
          border:    '#2A2520',
        },
        'text-warm': {
          primary:   '#F5F0EB',
          secondary: '#A89E94',
          muted:     '#5C5550',
        },
      },
      fontFamily: {
        syne:  ['Syne', 'sans-serif'],
        sans:  ['DM Sans', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'spin-slow':          'spin 40s linear infinite',
        'spin-reverse-slow':  'spin-reverse 25s linear infinite',
        'float':              'float 8s ease-in-out infinite',
        'ember-pulse':        'ember-pulse 2s ease-in-out infinite',
        'fade-up':            'fade-up 0.5s ease forwards',
        'score-fill':         'score-ring-fill 1.2s ease-out forwards',
      },
      keyframes: {
        'spin-reverse': {
          '0%':   { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        'ember-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%':      { opacity: '1' },
        },
        'fade-up': {
          'from': { opacity: '0', transform: 'translateY(16px)' },
          'to':   { opacity: '1', transform: 'translateY(0)' },
        },
        'score-ring-fill': {
          'from': { strokeDasharray: '0 314.16' },
        },
      },
      boxShadow: {
        'ember':    '0 0 20px rgba(255, 107, 53, 0.15)',
        'ember-lg': '0 0 40px rgba(255, 107, 53, 0.25)',
        'ember-btn': '0 0 20px rgba(255, 107, 53, 0.35)',
      },
    },
  },
  plugins: [],
};
