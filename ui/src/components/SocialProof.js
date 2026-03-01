import React, { useState, useEffect } from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Nisha K.',
    role: 'Software Engineer at Google',
    content:
      'My resume was getting rejected everywhere. After using Placify, I fixed the missing keywords and got three interview calls within a week!',
    rating: 5,
    avatar: 'N',
    color: 'from-pink-500 to-rose-500',
  },
  {
    name: 'Rahul S.',
    role: 'Data Scientist at Amazon',
    content:
      'The ATS score revealed I was missing crucial skills for data roles. The suggestions were spot‑on and easy to implement.',
    rating: 5,
    avatar: 'R',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Sneha M.',
    role: 'Product Manager at Microsoft',
    content:
      'I loved the library of successful resumes. Seeing what worked for others helped me tailor my own experience.',
    rating: 5,
    avatar: 'S',
    color: 'from-green-400 to-emerald-500',
  },
  {
    name: 'Amit R.',
    role: 'UX Designer (Freelance)',
    content:
      'The free analysis gave me a 94% match immediately. Even my portfolio improved because of the feedback.',
    rating: 4.5,
    avatar: 'A',
    color: 'from-amber-400 to-orange-500',
  },
];

const logos = [
  { name: 'Google', width: 100 },
  { name: 'Microsoft', width: 120 },
  { name: 'Amazon', width: 100 },
  { name: 'Meta', width: 80 },
  { name: 'Goldman Sachs', width: 140 },
  { name: 'Deloitte', width: 100 },
];

export default function SocialProof() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto‑rotate testimonials every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative bg-black py-24 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 right-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Trusted by{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              10,000+
            </span>{' '}
            Students
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            See what professionals like you are saying about Placify.
          </p>
        </div>

        {/* Company logos */}
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 mb-20 opacity-70">
          {logos.map((logo, idx) => (
            <div key={idx} className="text-gray-500 text-xl font-light tracking-wider">
              {logo.name}
            </div>
          ))}
        </div>

        {/* Testimonial carousel */}
        <div className="relative max-w-3xl mx-auto">
          <Quote className="absolute -top-6 left-0 text-indigo-500/20 w-12 h-12" />
          <Quote className="absolute -bottom-6 right-0 text-indigo-500/20 w-12 h-12 rotate-180" />

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-10">
            {/* Avatar and rating */}
            <div className="flex items-center gap-4 mb-6">
              <div
                className={`w-16 h-16 rounded-full bg-gradient-to-br ${testimonials[activeIndex].color} flex items-center justify-center text-white font-bold text-2xl shadow-lg`}
              >
                {testimonials[activeIndex].avatar}
              </div>
              <div>
                <h4 className="text-white font-bold text-lg">{testimonials[activeIndex].name}</h4>
                <p className="text-gray-400 text-sm">{testimonials[activeIndex].role}</p>
                <div className="flex gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < testimonials[activeIndex].rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Quote */}
            <p className="text-gray-300 text-lg leading-relaxed">
              "{testimonials[activeIndex].content}"
            </p>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === activeIndex
                    ? 'bg-indigo-500 w-8'
                    : 'bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}