import React, { useEffect } from 'react';
import Navbar from '../Navbar';
import SocialProof from '../SocialProof';
import ForSeniorSection from '../ForSeniorSection';
import Footer from '../Footer';

export default function Testimonials() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ backgroundColor: '#0A0A0A', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, paddingTop: '80px' }}>
        <SocialProof />
        <ForSeniorSection />
      </div>
      <Footer />
    </div>
  );
}
