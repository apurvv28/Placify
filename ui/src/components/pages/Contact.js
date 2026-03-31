import React, { useEffect } from 'react';
import Navbar from '../Navbar';
import CTA from '../CTA';
import Footer from '../Footer';

export default function Contact() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ backgroundColor: '#0A0A0A', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, paddingTop: '80px', display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '100%' }}>
          <CTA />
        </div>
      </div>
      <Footer />
    </div>
  );
}
