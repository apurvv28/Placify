import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import AuthFlipPage from './components/auth/AuthFlipPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import DashboardPage from './components/dashboard/DashboardPage';
import Features from './components/pages/Features';
import Contact from './components/pages/Contact';
import About from './components/pages/About';
import Help from './components/pages/Help';
import PrivacyPolicy from './components/pages/PrivacyPolicy';
import TermsAndConditions from './components/pages/TermsAndConditions';
import AtsAlgorithmCriteria from './components/pages/AtsAlgorithmCriteria';
import InterviewIQDashboardPage from './components/interviewiq/InterviewIQDashboardPage';
import InterviewIQDeckSessionPage from './components/interviewiq/InterviewIQDeckSessionPage';
import InterviewIQHistoryPage from './components/interviewiq/InterviewIQHistoryPage';
import { SocketProvider } from './context/SocketContext';
import logo from './logo.png';

function App() {
  useEffect(() => {
    document.title = 'Placify';

    let favicon = document.querySelector("link[rel='icon']");
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.setAttribute('rel', 'icon');
      document.head.appendChild(favicon);
    }

    favicon.setAttribute('href', logo);
    favicon.setAttribute('type', 'image/png');
  }, []);

  return (
    <BrowserRouter>
      <SocketProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<Features />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/contacts" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/help" element={<Help />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/tnc" element={<TermsAndConditions />} />
          <Route path="/ats-algorithm-criteria" element={<AtsAlgorithmCriteria />} />
          <Route path="/ats-criteria" element={<AtsAlgorithmCriteria />} />
          <Route path="/auth" element={<AuthFlipPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/interviewiq" element={<InterviewIQDashboardPage />} />
          <Route path="/interviewiq/deck/:deckNumber" element={<InterviewIQDeckSessionPage />} />
          <Route path="/interviewiq/history" element={<InterviewIQHistoryPage />} />
        </Routes>
      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;