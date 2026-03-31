import React, { useEffect } from 'react';
import Navbar from '../Navbar';
import HowItWorks from '../HowItWorks';
import ProblemSection from '../ProblemSection';
import Footer from '../Footer';

export default function Features() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ backgroundColor: '#0A0A0A', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, paddingTop: '80px' }}>
        <ProblemSection />
        <HowItWorks />
      </div>
      <Footer />
    </div>
  );
}
