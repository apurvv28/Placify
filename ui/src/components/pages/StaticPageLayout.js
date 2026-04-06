import React, { useEffect } from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';

export default function StaticPageLayout({ title, subtitle, sections }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ backgroundColor: '#0A0A0A', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, paddingTop: '110px', paddingBottom: '56px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
          <header style={{ marginBottom: '36px' }}>
            <h1 style={{ color: '#F5F0EB', margin: 0, fontFamily: 'Syne, sans-serif', fontSize: '2.2rem', lineHeight: 1.2 }}>
              {title}
            </h1>
            <p style={{ color: '#A89E94', marginTop: '12px', marginBottom: 0, fontFamily: 'DM Sans, sans-serif', lineHeight: 1.65 }}>
              {subtitle}
            </p>
          </header>

          <div style={{ display: 'grid', gap: '20px' }}>
            {sections.map((section) => (
              <section
                key={section.heading}
                style={{
                  backgroundColor: '#111111',
                  border: '1px solid #2A2520',
                  borderRadius: '12px',
                  padding: '20px',
                }}
              >
                <h2
                  style={{
                    color: '#E8A430',
                    margin: 0,
                    marginBottom: '10px',
                    fontFamily: 'Syne, sans-serif',
                    fontSize: '1.3rem',
                    lineHeight: 1.3,
                  }}
                >
                  {section.heading}
                </h2>
                <p
                  style={{
                    color: '#D6CEC7',
                    margin: 0,
                    fontFamily: 'DM Sans, sans-serif',
                    lineHeight: 1.75,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
