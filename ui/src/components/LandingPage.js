import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import ProblemSection from './ProblemSection';
import HowItWorks from './HowItWorks';
import SocialProof from './SocialProof';
import ForSeniorSection from './ForSeniorSection';
import CTA from './CTA';
import Footer from './Footer';

export default function LandingPage() {
  return ( 
    <>
      <Navbar />
      <Hero />
      <ProblemSection />
      <HowItWorks />
      <SocialProof />
      <ForSeniorSection />
      <CTA />
      <Footer />
    </>
  );
}
