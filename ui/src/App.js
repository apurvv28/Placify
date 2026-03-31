import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import AuthFlipPage from './components/auth/AuthFlipPage';
import DashboardPage from './components/dashboard/DashboardPage';
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
          <Route path="/auth" element={<AuthFlipPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;