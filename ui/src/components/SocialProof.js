import React, { useState, useEffect } from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Nisha K.',
    role: 'Software Engineer',
    company: 'Google',
    content: 'My resume was getting rejected everywhere. After using Placify, I fixed the missing keywords and got three interview calls within a week!',
    rating: 5, avatar: 'N',
  },
  {
    name: 'Rahul S.',
    role: 'Data Scientist',
    company: 'Amazon',
    content: 'The ATS score revealed I was missing crucial skills for data roles. The suggestions were spot‑on and easy to implement.',
    rating: 5, avatar: 'R',
  },
  {
    name: 'Sneha M.',
    role: 'Product Manager',
    company: 'Microsoft',
    content: 'I loved the library of successful resumes. Seeing what worked for others helped me tailor my own experience.',
    rating: 5, avatar: 'S',
  },
  {
    name: 'Amit R.',
    role: 'UX Designer',
    company: 'Freelance',
    content: 'The free analysis gave me a 94% match immediately. Even my portfolio improved because of the feedback.',
    rating: 4.5, avatar: 'A',
  },
];

const logos = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Goldman Sachs', 'Deloitte'];

export default function SocialProof() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const current = testimonials[activeIndex];

  return (
    <section className="relative py-16 md:py-24 overflow-hidden" style={{ backgroundColor: '#0A0A0A' }}>

      {/* Ember radial glow */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 50% 40% at 60% 70%, rgba(255,107,53,0.07) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4"
            style={{ fontFamily: 'Syne, sans-serif', color: '#F5F0EB' }}
          >
            Trusted by{' '}
            <span style={{
              backgroundImage: 'linear-gradient(135deg, #FF6B35 0%, #E8A430 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              10,000+
            </span>{' '}
            Students
          </h2>
          <p className="text-base md:text-lg max-w-2xl mx-auto" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>
            See what professionals like you are saying about Placify.
          </p>
        </div>

        {/* Company logos */}
        <div className="flex flex-wrap justify-center items-center gap-5 sm:gap-8 md:gap-12 mb-12 md:mb-20">
          {logos.map((logo, idx) => (
            <div
              key={idx}
              className="text-sm sm:text-base md:text-lg font-light tracking-wider"
              style={{ color: '#5C5550', fontFamily: 'DM Sans, sans-serif' }}
            >
              {logo}
            </div>
          ))}
        </div>

        {/* Testimonial carousel */}
        <div className="relative max-w-3xl mx-auto">
          <Quote
            className="hidden sm:block absolute -top-6 left-0 w-12 h-12"
            style={{ color: 'rgba(255,107,53,0.15)' }}
          />
          <Quote
            className="hidden sm:block absolute -bottom-6 right-0 w-12 h-12 rotate-180"
            style={{ color: 'rgba(255,107,53,0.15)' }}
          />

          <div
            className="rounded-xl p-5 sm:p-8 md:p-10"
            style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2520' }}
          >
            {/* Avatar + info */}
            <div className="flex items-center gap-3 sm:gap-4 mb-6">
              <div
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-2xl shadow-lg ring-2"
                style={{
                  background: 'linear-gradient(135deg, #FF6B35 0%, #E8A430 100%)',
                  ringColor: 'rgba(255,107,53,0.4)',
                  boxShadow: '0 0 0 2px rgba(255,107,53,0.4)',
                }}
              >
                {current.avatar}
              </div>
              <div>
                <h4 className="font-bold text-base sm:text-lg" style={{ color: '#F5F0EB', fontFamily: 'Syne, sans-serif' }}>
                  {current.name}
                </h4>
                <p className="text-sm" style={{ color: '#A89E94' }}>{current.role}</p>
                {/* Company badge */}
                <span
                  className="inline-block mt-1 px-2 py-0.5 rounded-sm text-xs"
                  style={{
                    backgroundColor: 'rgba(232,164,48,0.10)',
                    color: '#E8A430',
                    fontFamily: 'JetBrains Mono, monospace',
                    border: '1px solid rgba(232,164,48,0.20)',
                  }}
                >
                  {current.company}
                </span>
                {/* Stars */}
                <div className="flex gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      style={{
                        color: i < current.rating ? '#E8A430' : '#2A2520',
                        fill: i < current.rating ? '#E8A430' : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Quote text */}
            <p className="text-base sm:text-lg leading-relaxed" style={{ color: '#A89E94', fontFamily: 'DM Sans, sans-serif' }}>
              "{current.content}"
            </p>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: idx === activeIndex ? '32px' : '10px',
                  backgroundColor: idx === activeIndex ? '#FF6B35' : '#2A2520',
                  border: 'none',
                  cursor: 'pointer',
                }}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}