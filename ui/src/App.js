import React from 'react';
import { BrowserRouter } from 'react-router-dom';  
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProblemSection from './components/ProblemSection';
import HowItWorks from './components/HowItWorks';
import SocialProof from './components/SocialProof';
import ForSeniorSection from './components/ForSeniorSection';
import CTA from './components/CTA';
import Footer from './components/Footer';

function App() {
  return (
    <BrowserRouter>  
      <Navbar />
      <Hero />
      <ProblemSection />
      <HowItWorks />
      <SocialProof />
      <ForSeniorSection />
      <CTA />
      <Footer />
    </BrowserRouter>
  );
}

export default App;