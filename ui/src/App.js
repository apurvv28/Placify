import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import AuthFlipPage from './components/auth/AuthFlipPage';
import DashboardPage from './components/dashboard/DashboardPage';
import { SocketProvider } from './context/SocketContext';

function App() {
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